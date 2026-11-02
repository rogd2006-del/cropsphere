import { Router, Response } from 'express';
import mongoose from 'mongoose';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';
import { Order, OrderStatus, IOrder } from '../models/Order';
import { Cart, ICartItem } from '../models/Cart';
import { Product } from '../models/Product';
import { AppError } from '../middleware/errorHandler';
import { publishEvent } from '../services/queueService';
import {
  captureRazorpayPayment,
  createRazorpayOrder,
  fetchRazorpayOrder,
  fetchRazorpayPayment,
  getRazorpayKeyId,
  refundRazorpayPayment,
  verifyRazorpaySignature,
} from '../services/paymentService';
import { logger } from '../config/logger';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

function generateOrderNumber(): string {
  const ts = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `FD-${ts}-${rand}`;
}

const toPaise = (amount: number) => Math.round(amount * 100);

function calculateCartTotals(items: { priceSnapshot: number; quantity: number }[]) {
  const subtotalPaise = items.reduce(
    (sum, item) => sum + toPaise(item.priceSnapshot) * item.quantity,
    0,
  );
  const deliveryFeePaise = subtotalPaise === 0 || subtotalPaise > 3500 ? 0 : 499;
  const taxPaise = Math.round(subtotalPaise * 0.05);
  return {
    subtotalPaise,
    deliveryFeePaise,
    taxPaise,
    totalPaise: subtotalPaise + deliveryFeePaise + taxPaise,
  };
}

function groupItemsByFarmer(items: ICartItem[]) {
  const groups = new Map<string, ICartItem[]>();
  for (const item of items) {
    const farmerId = item.farmerIdSnapshot.toString();
    const group = groups.get(farmerId);
    if (group) group.push(item);
    else groups.set(farmerId, [item]);
  }
  return groups;
}

// POST /api/orders/payment-order — Create a Razorpay order for the current cart.
router.post('/payment-order', authenticate, authorize('CONSUMER'), async (req: AuthRequest, res: Response, next) => {
  try {
    const { deliveryMethod } = req.body;
    if (!['PICKUP', 'DELIVERY'].includes(deliveryMethod)) {
      throw new AppError('Delivery method must be PICKUP or DELIVERY', 400);
    }

    const userId = req.user!._id;
    const cart = await Cart.findOne({ userId });
    if (!cart || cart.items.length === 0) throw new AppError('Cart is empty', 400);

    for (const item of cart.items) {
      const product = await Product.findById(item.productId);
      if (!product || !product.availability) {
        throw new AppError(`Product "${item.nameSnapshot}" is no longer available`, 400);
      }
      if (product.stockQuantity < item.quantity) {
        throw new AppError(`Only ${product.stockQuantity} units of "${item.nameSnapshot}" available`, 400);
      }
    }

    const quote = calculateCartTotals(cart.items);
    if (quote.totalPaise < 100) {
      throw new AppError('The payment total must be at least ₹1.00', 400);
    }

    const keyId = getRazorpayKeyId();
    const gatewayOrder = await createRazorpayOrder(quote.totalPaise, uuidv4(), {
      consumerId: userId.toString(),
      deliveryMethod,
    });

    res.status(201).json({
      success: true,
      data: {
        keyId,
        orderId: gatewayOrder.id,
        amount: gatewayOrder.amount,
        currency: gatewayOrder.currency,
        mode: keyId.startsWith('rzp_test_') ? 'test' : 'live',
        quote: {
          subtotal: quote.subtotalPaise / 100,
          deliveryFee: quote.deliveryFeePaise / 100,
          tax: quote.taxPaise / 100,
          total: quote.totalPaise / 100,
        },
      },
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/orders — Verify Razorpay payment and place the order.
router.post('/', authenticate, authorize('CONSUMER'), async (req: AuthRequest, res: Response, next) => {
  let session: mongoose.ClientSession | null = null;
  let transactionStarted = false;
  let capturedPaymentId: string | null = null;
  let capturedPaymentAmount = 0;
  try {
    const {
      deliveryMethod,
      deliveryAddress,
      notes,
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
    } = req.body;
    const userId = req.user!._id;

    if (!['PICKUP', 'DELIVERY'].includes(deliveryMethod)) {
      throw new AppError('Delivery method must be PICKUP or DELIVERY', 400);
    }
    if (deliveryMethod === 'DELIVERY' && !deliveryAddress?.line1) {
      throw new AppError('Delivery address required for delivery orders', 400);
    }
    if (
      typeof razorpayOrderId !== 'string' ||
      typeof razorpayPaymentId !== 'string' ||
      typeof razorpaySignature !== 'string'
    ) {
      throw new AppError('Razorpay payment details are required', 400);
    }

    const existingOrders = await Order.find({
      consumerId: userId,
      paymentReference: razorpayPaymentId,
    });
    if (existingOrders.length) {
      res.json({ success: true, data: existingOrders, message: 'Order already placed' });
      return;
    }

    if (!verifyRazorpaySignature(razorpayOrderId, razorpayPaymentId, razorpaySignature)) {
      throw new AppError('Razorpay payment signature verification failed', 400);
    }

    const [gatewayOrder, payment] = await Promise.all([
      fetchRazorpayOrder(razorpayOrderId),
      fetchRazorpayPayment(razorpayPaymentId),
    ]);

    if (gatewayOrder.notes?.consumerId !== userId.toString()) {
      throw new AppError('This Razorpay order does not belong to the signed-in user', 403);
    }
    if (gatewayOrder.notes?.deliveryMethod !== deliveryMethod) {
      throw new AppError('Checkout details changed. Please start checkout again.', 400);
    }
    if (payment.order_id !== razorpayOrderId) {
      throw new AppError('Razorpay payment does not match the checkout order', 400);
    }
    if (gatewayOrder.currency !== 'INR' || payment.currency !== 'INR') {
      throw new AppError('Razorpay returned an unexpected payment currency', 400);
    }
    if (payment.status === 'captured' || payment.captured) {
      capturedPaymentId = payment.id;
      capturedPaymentAmount = payment.amount;
    }

    const cart = await Cart.findOne({ userId });
    if (!cart || cart.items.length === 0) throw new AppError('Cart is empty', 400);
    const quote = calculateCartTotals(cart.items);
    if (
      gatewayOrder.amount !== quote.totalPaise ||
      payment.amount !== quote.totalPaise
    ) {
      throw new AppError('The cart total changed during checkout. Please review your cart and try again.', 409);
    }

    if (payment.status === 'authorized') {
      try {
        const captured = await captureRazorpayPayment(payment.id, payment.amount);
        if (captured.status !== 'captured' && !captured.captured) {
          throw new AppError('Razorpay did not confirm payment capture', 402);
        }
        capturedPaymentId = captured.id;
        capturedPaymentAmount = captured.amount;
      } catch (error) {
        if (!capturedPaymentId) {
          const currentPayment = await fetchRazorpayPayment(payment.id);
          if (currentPayment.status === 'captured' || currentPayment.captured) {
            capturedPaymentId = currentPayment.id;
            capturedPaymentAmount = currentPayment.amount;
          }
        }
        throw error;
      }
    } else if (payment.status !== 'captured' && !payment.captured) {
      throw new AppError('Razorpay payment has not been authorized', 402);
    }

    const farmerGroups = groupItemsByFarmer(cart.items);
    const farmerEntries = Array.from(farmerGroups.entries());
    const orders: IOrder[] = [];
    let remainingTaxPaise = quote.taxPaise;

    session = await mongoose.startSession();
    session.startTransaction();
    transactionStarted = true;

    for (const [index, [farmerId, items]] of farmerEntries.entries()) {
      // Validate and lock stock
      for (const item of items) {
        const product = await Product.findById(item.productId).session(session);
        if (!product || !product.availability) {
          throw new AppError(`Product "${item.nameSnapshot}" is no longer available`, 400);
        }
        if (product.stockQuantity < item.quantity) {
          throw new AppError(
            `Only ${product.stockQuantity} units of "${item.nameSnapshot}" available`, 400
          );
        }
      }

      // Deduct stock
      for (const item of items) {
        await Product.findByIdAndUpdate(
          item.productId,
          { $inc: { stockQuantity: -item.quantity, soldCount: item.quantity } },
          { session }
        );
      }

      const orderItems = items.map(item => ({
        productId: item.productId,
        farmerId: item.farmerIdSnapshot,
        name: item.nameSnapshot,
        unitPrice: item.priceSnapshot,
        quantity: item.quantity,
        unit: item.unitSnapshot,
        imageSnapshot: item.imageSnapshot,
        subtotal: item.priceSnapshot * item.quantity,
      }));

      const groupSubtotalPaise = items.reduce(
        (sum, item) => sum + toPaise(item.priceSnapshot) * item.quantity,
        0,
      );
      const taxPaise = index === farmerEntries.length - 1
        ? remainingTaxPaise
        : Math.round(quote.taxPaise * groupSubtotalPaise / quote.subtotalPaise);
      remainingTaxPaise -= taxPaise;
      const deliveryFeePaise = index === 0 ? quote.deliveryFeePaise : 0;
      const subtotal = groupSubtotalPaise / 100;
      const deliveryFee = deliveryFeePaise / 100;
      const tax = taxPaise / 100;
      const total = (groupSubtotalPaise + deliveryFeePaise + taxPaise) / 100;
      const orderNumber = generateOrderNumber();

      const order = new Order({
        orderNumber,
        consumerId: userId,
        farmerId: new mongoose.Types.ObjectId(farmerId),
        items: orderItems,
        subtotal,
        deliveryFee,
        tax,
        total,
        status: 'PENDING',
        paymentStatus: 'PENDING',
        paymentMethod: 'RAZORPAY',
        paymentReference: razorpayPaymentId,
        deliveryMethod,
        deliveryAddress: deliveryMethod === 'DELIVERY' ? deliveryAddress : undefined,
        notes,
        statusHistory: [{ status: 'PENDING', timestamp: new Date(), note: 'Razorpay payment captured; order placed' }],
        idempotencyKey: `${razorpayOrderId}:${farmerId}`,
      });
      await order.save({ session });
      orders.push(order);
    }

    if (orders.length && capturedPaymentId) {
      for (const order of orders) {
        order.paymentStatus = 'PAID';
        await order.save({ session });
      }
    } else {
      throw new AppError('Razorpay payment capture could not be confirmed', 402);
    }

    // Clear cart
    await Cart.findOneAndUpdate({ userId }, { items: [] }, { session });
    await session.commitTransaction();
    transactionStarted = false;
    capturedPaymentId = null;

    for (const order of orders) {
      await publishEvent({
        type: 'ORDER_PLACED',
        payload: {
          orderId: order._id.toString(),
          orderNumber: order.orderNumber,
          consumerId: userId.toString(),
          farmerId: order.farmerId.toString(),
          total: order.total,
        },
        idempotencyKey: `order-placed-${order._id}`,
      });
      for (const item of order.items) {
        await publishEvent({
          type: 'INVENTORY_CHANGED',
          payload: { productId: item.productId.toString() },
          idempotencyKey: `inv-check-${item.productId}-${Date.now()}`,
        });
      }
    }

    res.status(201).json({
      success: true,
      data: orders,
      message: `${orders.length} order(s) placed successfully`,
    });
  } catch (err) {
    if (transactionStarted && session) {
      try {
        await session.abortTransaction();
      } catch (abortError) {
        logger.error('Failed to abort order transaction after checkout error', abortError);
      }
    }
    if (capturedPaymentId) {
      try {
        await refundRazorpayPayment(capturedPaymentId, capturedPaymentAmount);
        logger.warn(`Refunded Razorpay payment ${capturedPaymentId} after order creation failed`);
      } catch (refundError) {
        logger.error(`Razorpay payment ${capturedPaymentId} could not be refunded after order creation failed`, refundError);
        next(new AppError(
          `Payment was captured but the order could not be completed. Contact support with payment reference ${capturedPaymentId}.`,
          502,
        ));
        return;
      }
    }
    next(err);
  } finally {
    await session?.endSession();
  }
});

// GET /api/orders — Consumer: own orders; Farmer: their orders; Admin: all
router.get('/', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    const { status, page = '1', limit = '10' } = req.query as Record<string, string>;
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    const filter: Record<string, unknown> = {};
    if (req.user!.role === 'CONSUMER') filter.consumerId = req.user!._id;
    if (req.user!.role === 'FARMER') filter.farmerId = req.user!._id;
    if (status) filter.status = status;

    const [orders, total] = await Promise.all([
      Order.find(filter)
        .populate('consumerId', 'name email')
        .populate('farmerId', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Order.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: orders,
      pagination: { page: pageNum, limit: limitNum, total, pages: Math.ceil(total / limitNum) },
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/orders/:id
router.get('/:id', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('consumerId', 'name email phone')
      .populate('farmerId', 'name email phone');
    
    if (!order) throw new AppError('Order not found', 404);
    
    const userId = req.user!._id.toString();
    const isOwner = order.consumerId._id.toString() === userId;
    const isFarmer = order.farmerId._id.toString() === userId && req.user!.role === 'FARMER';
    const isAdmin = req.user!.role === 'ADMIN';
    
    if (!isOwner && !isFarmer && !isAdmin) {
      throw new AppError('Not authorized to view this order', 403);
    }
    
    res.json({ success: true, data: order });
  } catch (err) {
    next(err);
  }
});

// PATCH /api/orders/:id/status — Farmer or Admin updates order status
const validTransitions: Record<OrderStatus, OrderStatus[]> = {
  PENDING: ['CONFIRMED', 'REJECTED', 'CANCELLED'],
  CONFIRMED: ['PREPARING', 'CANCELLED'],
  PREPARING: ['DISPATCHED', 'CANCELLED'],
  DISPATCHED: ['DELIVERED'],
  DELIVERED: [],
  CANCELLED: [],
  REJECTED: [],
};

router.patch('/:id/status', authenticate, authorize('FARMER', 'ADMIN', 'CONSUMER'), async (req: AuthRequest, res: Response, next) => {
  try {
    const { status, note } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) throw new AppError('Order not found', 404);

    const userId = req.user!._id.toString();
    const isFarmer = order.farmerId.toString() === userId && req.user!.role === 'FARMER';
    const isConsumer = order.consumerId.toString() === userId && req.user!.role === 'CONSUMER';
    const isAdmin = req.user!.role === 'ADMIN';

    if (!isFarmer && !isAdmin && !(isConsumer && status === 'CANCELLED')) {
      throw new AppError('Not authorized to update this order status', 403);
    }

    if (isConsumer && !['PENDING', 'CONFIRMED'].includes(order.status)) {
      throw new AppError('Cannot cancel order in current status', 400);
    }

    const allowed = validTransitions[order.status];
    if (!allowed.includes(status as OrderStatus)) {
      throw new AppError(`Cannot transition from ${order.status} to ${status}`, 400);
    }

    order.status = status as OrderStatus;
    order.statusHistory.push({ status: status as OrderStatus, timestamp: new Date(), note });
    await order.save();

    // Publish status update event
    await publishEvent({
      type: 'ORDER_UPDATED',
      payload: {
        orderId: order._id.toString(),
        orderNumber: order.orderNumber,
        consumerId: order.consumerId.toString(),
        farmerId: order.farmerId.toString(),
        status,
      },
      idempotencyKey: `order-status-${order._id}-${status}-${Date.now()}`,
    });

    res.json({ success: true, data: order, message: `Order ${status.toLowerCase()}` });
  } catch (err) {
    next(err);
  }
});

export default router;
