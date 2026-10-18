import { Router, Response } from 'express';
import mongoose from 'mongoose';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';
import { Cart } from '../models/Cart';
import { Product } from '../models/Product';
import { AppError } from '../middleware/errorHandler';

const router = Router();

// GET /api/cart
router.get('/', authenticate, authorize('CONSUMER'), async (req: AuthRequest, res: Response, next) => {
  try {
    const cart = await Cart.findOne({ userId: req.user!._id })
      .populate({
        path: 'items.productId',
        select: 'name price unit stockQuantity images availability farmerId',
        populate: { path: 'farmerId', select: 'name' },
      });
    
    res.json({ success: true, data: cart || { userId: req.user!._id, items: [] } });
  } catch (err) {
    next(err);
  }
});

// POST /api/cart/items — Add or update item
router.post('/items', authenticate, authorize('CONSUMER'), async (req: AuthRequest, res: Response, next) => {
  try {
    const { productId, quantity } = req.body;
    
    if (!productId || !quantity || quantity < 1) {
      throw new AppError('Product ID and quantity (>=1) required', 400);
    }
    
    const product = await Product.findById(productId).populate('farmerId', 'name');
    if (!product) throw new AppError('Product not found', 404);
    if (!product.availability) throw new AppError('Product is not available', 400);
    if (product.stockQuantity < quantity) {
      throw new AppError(`Only ${product.stockQuantity} units available`, 400);
    }
    if (product.minOrderQuantity && quantity < product.minOrderQuantity) {
      throw new AppError(`Minimum order is ${product.minOrderQuantity} units`, 400);
    }

    let cart = await Cart.findOne({ userId: req.user!._id });
    if (!cart) {
      cart = new Cart({ userId: req.user!._id, items: [] });
    }

    const existingIdx = cart.items.findIndex(i => i.productId.toString() === productId);
    const farmer = product.farmerId as any;

    const farmerObjId = (farmer?._id || product.farmerId);
    if (existingIdx >= 0) {
      cart.items[existingIdx].quantity = quantity;
      cart.items[existingIdx].priceSnapshot = product.price;
    } else {
      cart.items.push({
        productId: new mongoose.Types.ObjectId(productId),
        quantity,
        priceSnapshot: product.price,
        nameSnapshot: product.name,
        unitSnapshot: product.unit,
        imageSnapshot: product.images?.[0] || '',
        farmerIdSnapshot: farmerObjId as any,
        farmerNameSnapshot: farmer?.name || 'Local Farmer',
      });
    }

    await cart.save();
    res.json({ success: true, data: cart, message: 'Cart updated' });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/cart/items/:productId
router.delete('/items/:productId', authenticate, authorize('CONSUMER'), async (req: AuthRequest, res: Response, next) => {
  try {
    const cart = await Cart.findOne({ userId: req.user!._id });
    if (!cart) throw new AppError('Cart not found', 404);
    
    cart.items = cart.items.filter(i => i.productId.toString() !== req.params.productId);
    await cart.save();
    res.json({ success: true, data: cart, message: 'Item removed from cart' });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/cart — Clear cart
router.delete('/', authenticate, authorize('CONSUMER'), async (req: AuthRequest, res: Response, next) => {
  try {
    await Cart.findOneAndUpdate({ userId: req.user!._id }, { items: [] });
    res.json({ success: true, message: 'Cart cleared' });
  } catch (err) {
    next(err);
  }
});

export default router;
