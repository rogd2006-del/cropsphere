import { Router, Response } from 'express';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';
import { FarmerProfile } from '../models/FarmerProfile';
import { Product } from '../models/Product';
import { Order } from '../models/Order';
import { AppError } from '../middleware/errorHandler';

const router = Router();

// GET /api/farmers — List all farmers
router.get('/', async (_req, res, next) => {
  try {
    const profiles = await FarmerProfile.find()
      .populate('userId', 'name email avatar isActive')
      .sort({ rating: -1 })
      .lean();
    res.json({ success: true, data: profiles });
  } catch (err) {
    next(err);
  }
});

// GET /api/farmers/:id — Public farmer profile
router.get('/:id', async (req, res, next) => {
  try {
    const profile = await FarmerProfile.findById(req.params.id)
      .populate('userId', 'name email avatar createdAt')
      .lean();
    
    if (!profile) throw new AppError('Farmer profile not found', 404);
    
    const products = await Product.find({ farmerId: (profile as any).userId?._id, availability: true })
      .limit(12)
      .lean();
    
    res.json({ success: true, data: { ...profile, products } });
  } catch (err) {
    next(err);
  }
});

// GET /api/farmers/me/profile — Farmer's own profile
router.get('/me/profile', authenticate, authorize('FARMER'), async (req: AuthRequest, res: Response, next) => {
  try {
    const profile = await FarmerProfile.findOne({ userId: req.user!._id });
    if (!profile) throw new AppError('Farmer profile not found', 404);
    res.json({ success: true, data: profile });
  } catch (err) {
    next(err);
  }
});

// PUT /api/farmers/me/profile — Farmer updates own profile
router.put('/me/profile', authenticate, authorize('FARMER'), async (req: AuthRequest, res: Response, next) => {
  try {
    const profile = await FarmerProfile.findOneAndUpdate(
      { userId: req.user!._id },
      { $set: req.body },
      { new: true, runValidators: true }
    );
    if (!profile) throw new AppError('Farmer profile not found', 404);
    res.json({ success: true, data: profile, message: 'Profile updated successfully' });
  } catch (err) {
    next(err);
  }
});

// GET /api/farmers/me/dashboard — Farmer dashboard stats
router.get('/me/dashboard', authenticate, authorize('FARMER'), async (req: AuthRequest, res: Response, next) => {
  try {
    const farmerId = req.user!._id;
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [
      totalProducts,
      activeProducts,
      lowStockProducts,
      totalOrders,
      pendingOrders,
      recentOrders,
      revenueAgg,
      monthlySales,
    ] = await Promise.all([
      Product.countDocuments({ farmerId }),
      Product.countDocuments({ farmerId, availability: true }),
      Product.countDocuments({ farmerId, $expr: { $lte: ['$stockQuantity', '$lowStockThreshold'] } }),
      Order.countDocuments({ farmerId }),
      Order.countDocuments({ farmerId, status: { $in: ['PENDING', 'CONFIRMED', 'PREPARING'] } }),
      Order.find({ farmerId })
        .populate('consumerId', 'name email')
        .sort({ createdAt: -1 })
        .limit(5)
        .lean(),
      Order.aggregate([
        { $match: { farmerId, status: { $nin: ['CANCELLED', 'REJECTED'] } } },
        { $group: { _id: null, totalRevenue: { $sum: '$total' }, totalSold: { $sum: 1 } } },
      ]),
      Order.aggregate([
        { $match: { farmerId, createdAt: { $gte: thirtyDaysAgo }, status: { $nin: ['CANCELLED', 'REJECTED'] } } },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            revenue: { $sum: '$total' },
            orders: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),
    ]);

    const lowStockItems = await Product.find({
      farmerId,
      $expr: { $lte: ['$stockQuantity', '$lowStockThreshold'] },
    }).select('name stockQuantity lowStockThreshold').limit(5).lean();

    res.json({
      success: true,
      data: {
        stats: {
          totalProducts,
          activeProducts,
          lowStockProducts,
          totalOrders,
          pendingOrders,
          totalRevenue: revenueAgg[0]?.totalRevenue || 0,
          totalSold: revenueAgg[0]?.totalSold || 0,
        },
        recentOrders,
        monthlySales,
        lowStockItems,
      },
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/farmers/me/products — Farmer's own products
router.get('/me/products', authenticate, authorize('FARMER'), async (req: AuthRequest, res: Response, next) => {
  try {
    const { page = '1', limit = '20' } = req.query as Record<string, string>;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    
    const [products, total] = await Promise.all([
      Product.find({ farmerId: req.user!._id })
        .sort({ createdAt: -1 })
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum)
        .lean(),
      Product.countDocuments({ farmerId: req.user!._id }),
    ]);
    
    res.json({ success: true, data: products, pagination: { page: pageNum, limit: limitNum, total } });
  } catch (err) {
    next(err);
  }
});

export default router;
