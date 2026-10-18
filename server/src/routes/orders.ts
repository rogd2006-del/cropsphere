import { Router, Response } from 'express';
import mongoose from 'mongoose';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';
import { Order, OrderStatus } from '../models/Order';
import { Cart } from '../models/Cart';
import { Product } from '../models/Product';
import { AppError } from '../middleware/errorHandler';
import { publishEvent } from '../services/queueService';
import { createPaymentIntent, processPayment } from '../services/paymentService';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

function generateOrderNumber(): string {
  const ts = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `FD-${ts}-${rand}`;
}

// POST /api/orders — Place order (checkout)
router.post('/', authenticate, authorize('CONSUMER'), async (req: AuthRequest, res: Response, next) => {
  const session = await mongoose.startSession();
  try {
    const { deliveryMethod, deliveryAddress, notes, idempotencyKey } = req.body;
    const userId = req.user!._id;

    // Idempotency check
    const iKey = idempotencyKey || uuidv4();
    const existing = await Order.findOne({ idempotencyKey: iKey });
    if (existing) {
      res.json({ success: true, data: existing, message: 'Order already placed (idempotent)' });
      return;
    }

    if (!['PICKUP', 'DELIVERY'].includes(deliveryMethod)) {
      throw new AppError('Delivery method must be PICKUP or DELIVERY', 400);
    }
    if (deliveryMethod === 'DELIVERY' && !deliveryAddress?.line1) {
      throw new AppError('Delivery address required for delivery orders', 400);
    }

    const cart = await Cart.findOne({ userId });
    if (!cart || cart.items.length === 0) throw new AppError('Cart is empty', 400);

    // Group by farmer (each farmer gets a separate order)
    const farmerGroups = new Map<string, typeof cart.items>();
    for (const item of cart.items) {
      const rawFid = item.farmerIdSnapshot as any;
      const fid = (rawFid?._id || rawFid)?.toString() || '';
      if (!farmerGroups.has(fid)) farmerGroups.set(fid, []);
      farmerGroups.get(fid)!.push(item);
    }

    session.startTransaction();
    const orders: any[] = [];

    for (const [farmerId, items] of farmerGroups) {
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

      const subtotal = orderItems.reduce((s, i) => s + i.subtotal, 0);
      const deliveryFee = deliveryMethod === 'DELIVERY' ? 5.00 : 0;
      const total = subtotal + deliveryFee;
      const orderNumber = generateOrderNumber();

      // Create payment intent
      const paymentIntent = await createPaymentIntent(total, 'USD', { orderNumber });
      const paymentResult = await processPayment(paymentIntent.reference, total);

      const order = new Order({
        orderNumber,
        consumerId: userId,
        farmerId: new mongoose.Types.ObjectId(farmerId),
        items: orderItems,
        subtotal,
        deliveryFee,
        total,
        status: 'PENDING',
        paymentStatus: paymentResult.status,
        paymentMethod: 'DEMO_PAYMENT',
        paymentReference: paymentIntent.reference,
        deliveryMethod,
        deliveryAddress: deliveryMethod === 'DELIVERY' ? deliveryAddress : undefined,
        notes,
        statusHistory: [{ status: 'PENDING', timestamp: new Date(), note: 'Order placed' }],
        idempotencyKey: iKey,
      });

      if (paymentResult.status === 'FAILED') {
        // Revert stock
        for (const item of items) {
          await Product.findByIdAndUpdate(
            item.productId,
            { $inc: { stockQuantity: item.quantity, soldCount: -item.quantity } },
            { session }
          );
        }
        throw new AppError(`Payment failed: ${paymentResult.message}`, 402);
      }

      await order.save({ session });
      orders.push(order);

      // Publish FaaS event
      await publishEvent({
        type: 'ORDER_PLACED',
        payload: {
          orderId: order._id.toString(),
          orderNumber,
          consumerId: userId.toString(),
          farmerId,
          total,
        },
        idempotencyKey: `order-placed-${order._id}`,
      });

      // Check inventory after order
      for (const item of items) {
        await publishEvent({
          type: 'INVENTORY_CHANGED',
          payload: { productId: item.productId.toString() },
          idempotencyKey: `inv-check-${item.productId}-${Date.now()}`,
        });
      }
    }

    // Clear cart
    await Cart.findOneAndUpdate({ userId }, { items: [] }, { session });
    await session.commitTransaction();

    res.status(201).json({
      success: true,
      data: orders,
      message: `${orders.length} order(s) placed successfully`,
    });
  } catch (err) {
    await session.abortTransaction();
    next(err);
  } finally {
    session.endSession();
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
