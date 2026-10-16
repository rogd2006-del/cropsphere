import { Router, Response } from 'express';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';
import { User } from '../models/User';
import { Product } from '../models/Product';
import { Order } from '../models/Order';
import { FarmerProfile } from '../models/FarmerProfile';
import { AuditLog } from '../models/AuditLog';
import { AppError } from '../middleware/errorHandler';

const router = Router();

// All admin routes require ADMIN role
router.use(authenticate, authorize('ADMIN'));

// GET /api/admin/dashboard
router.get('/dashboard', async (_req, res, next) => {
  try {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const [
      totalUsers, totalFarmers, totalConsumers, activeUsers,
      totalProducts, activeProducts,
      totalOrders, pendingOrders,
      revenueAgg, newUsersThisWeek, recentAuditLogs, categoryCounts,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: 'FARMER' }),
      User.countDocuments({ role: 'CONSUMER' }),
      User.countDocuments({ isActive: true }),
      Product.countDocuments(),
      Product.countDocuments({ availability: true }),
      Order.countDocuments(),
      Order.countDocuments({ status: 'PENDING' }),
      Order.aggregate([
        { $match: { status: { $nin: ['CANCELLED', 'REJECTED'] } } },
        { $group: { _id: null, total: { $sum: '$total' } } },
      ]),
      User.countDocuments({ createdAt: { $gte: sevenDaysAgo } }),
      AuditLog.find().sort({ createdAt: -1 }).limit(20).lean(),
      Product.aggregate([
        { $group: { _id: '$category', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
    ]);

    // Monthly order volume
    const monthlyOrders = await Order.aggregate([
      { $match: { createdAt: { $gte: thirtyDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          orders: { $sum: 1 },
          revenue: { $sum: '$total' },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.json({
      success: true,
      data: {
        stats: {
          totalUsers, totalFarmers, totalConsumers, activeUsers,
          totalProducts, activeProducts,
          totalOrders, pendingOrders,
          totalRevenue: revenueAgg[0]?.total || 0,
          newUsersThisWeek,
        },
        monthlyOrders,
        categoryCounts,
        recentAuditLogs,
      },
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/admin/users
router.get('/users', async (req, res, next) => {
  try {
    const { role, isActive, search, page = '1', limit = '20' } = req.query as Record<string, string>;
    const filter: Record<string, unknown> = {};
    if (role) filter.role = role;
    if (isActive !== undefined) filter.isActive = isActive === 'true';
    if (search) filter.$or = [
      { name: new RegExp(search, 'i') },
      { email: new RegExp(search, 'i') },
    ];

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const [users, total] = await Promise.all([
      User.find(filter).sort({ createdAt: -1 }).skip((pageNum - 1) * limitNum).limit(limitNum).lean(),
      User.countDocuments(filter),
    ]);
    res.json({ success: true, data: users, pagination: { page: pageNum, limit: limitNum, total } });
  } catch (err) {
    next(err);
  }
});

// PATCH /api/admin/users/:id/suspend
router.patch('/users/:id/suspend', async (req: AuthRequest, res: Response, next) => {
  try {
    const { reason } = req.body;
    const user = await User.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    if (!user) throw new AppError('User not found', 404);
    
    await AuditLog.create({
      userId: req.user!._id,
      userEmail: req.user!.email,
      action: 'USER_SUSPENDED',
      entity: 'User',
      entityId: req.params.id,
      metadata: { reason, targetEmail: user.email },
    });
    
    res.json({ success: true, message: 'User suspended', data: user });
  } catch (err) {
    next(err);
  }
});

// PATCH /api/admin/users/:id/activate
router.patch('/users/:id/activate', async (req: AuthRequest, res: Response, next) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { isActive: true }, { new: true });
    if (!user) throw new AppError('User not found', 404);
    
    await AuditLog.create({
      userId: req.user!._id,
      userEmail: req.user!.email,
      action: 'USER_ACTIVATED',
      entity: 'User',
      entityId: req.params.id,
      metadata: { targetEmail: user.email },
    });
    
    res.json({ success: true, message: 'User activated', data: user });
  } catch (err) {
    next(err);
  }
});

// GET /api/admin/products
router.get('/products', async (req, res, next) => {
  try {
    const { availability, category, page = '1', limit = '20' } = req.query as Record<string, string>;
    const filter: Record<string, unknown> = {};
    if (availability !== undefined) filter.availability = availability === 'true';
    if (category) filter.category = category;
    
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const [products, total] = await Promise.all([
      Product.find(filter)
        .populate('farmerId', 'name email')
        .sort({ createdAt: -1 })
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum)
        .lean(),
      Product.countDocuments(filter),
    ]);
    res.json({ success: true, data: products, pagination: { page: pageNum, limit: limitNum, total } });
  } catch (err) {
    next(err);
  }
});

// PATCH /api/admin/products/:id/suspend
router.patch('/products/:id/suspend', async (req: AuthRequest, res: Response, next) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, { availability: false }, { new: true });
    if (!product) throw new AppError('Product not found', 404);
    
    await AuditLog.create({
      userId: req.user!._id,
      userEmail: req.user!.email,
      action: 'PRODUCT_SUSPENDED',
      entity: 'Product',
      entityId: req.params.id,
    });
    
    res.json({ success: true, message: 'Product suspended', data: product });
  } catch (err) {
    next(err);
  }
});

// GET /api/admin/orders
router.get('/orders', async (req, res, next) => {
  try {
    const { status, page = '1', limit = '20' } = req.query as Record<string, string>;
    const filter: Record<string, unknown> = {};
    if (status) filter.status = status;
    
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const [orders, total] = await Promise.all([
      Order.find(filter)
        .populate('consumerId', 'name email')
        .populate('farmerId', 'name email')
        .sort({ createdAt: -1 })
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum)
        .lean(),
      Order.countDocuments(filter),
    ]);
    res.json({ success: true, data: orders, pagination: { page: pageNum, limit: limitNum, total } });
  } catch (err) {
    next(err);
  }
});

// GET /api/admin/audit-logs
router.get('/audit-logs', async (req, res, next) => {
  try {
    const { action, page = '1', limit = '50' } = req.query as Record<string, string>;
    const filter: Record<string, unknown> = {};
    if (action) filter.action = new RegExp(action, 'i');
    
    const pageNum = parseInt(page);
    const limitNum = Math.min(100, parseInt(limit));
    const [logs, total] = await Promise.all([
      AuditLog.find(filter).sort({ createdAt: -1 }).skip((pageNum - 1) * limitNum).limit(limitNum).lean(),
      AuditLog.countDocuments(filter),
    ]);
    res.json({ success: true, data: logs, pagination: { page: pageNum, limit: limitNum, total } });
  } catch (err) {
    next(err);
  }
});

export default router;
