import { Router, Response } from 'express';
import { z } from 'zod';
import { validate } from '../middleware/validate';
import { authenticate, authorize, optionalAuth, AuthRequest } from '../middleware/auth';
import { Product } from '../models/Product';
import { FarmerProfile } from '../models/FarmerProfile';
import { AppError } from '../middleware/errorHandler';
import { publishEvent } from '../services/queueService';

const router = Router();

// GET /api/products — Browse with search, filter, pagination
router.get('/', optionalAuth, async (req: AuthRequest, res: Response, next) => {
  try {
    const {
      search, category, minPrice, maxPrice, availability,
      city, state, organic, sort = 'createdAt',
      order = 'desc', page = '1', limit = '12',
    } = req.query as Record<string, string>;

    const filter: Record<string, unknown> = { availability: true };
    
    if (search) {
      filter.$text = { $search: search };
    }
    if (category) filter.category = category;
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) (filter.price as any).$gte = parseFloat(minPrice);
      if (maxPrice) (filter.price as any).$lte = parseFloat(maxPrice);
    }
    if (availability === 'false') delete filter.availability;
    if (city) filter.city = new RegExp(city, 'i');
    if (state) filter.state = new RegExp(state, 'i');
    if (organic === 'true') filter.organic = true;

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    const sortOptions: Record<string, 1 | -1> = {};
    const validSorts = ['price', 'createdAt', 'rating', 'soldCount', 'name'];
    if (validSorts.includes(sort)) {
      sortOptions[sort] = order === 'asc' ? 1 : -1;
    } else {
      sortOptions.createdAt = -1;
    }

    const [products, total] = await Promise.all([
      Product.find(filter)
        .populate('farmerId', 'name avatar')
        .sort(sortOptions)
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Product.countDocuments(filter),
    ]);

    // Enrich with farmer profile
    const getFarmerIdStr = (f: any): string => {
      if (!f) return '';
      if (typeof f === 'object' && f._id) return f._id.toString();
      return f.toString();
    };

    const farmerIds = [...new Set(products.map(p => getFarmerIdStr(p.farmerId)).filter(Boolean))];
    const farmerProfiles = await FarmerProfile.find({ userId: { $in: farmerIds } })
      .select('userId farmName location.city location.state rating')
      .lean();
    
    const profileMap = new Map(farmerProfiles.map(fp => [fp.userId.toString(), fp]));
    const enriched = products.map(p => ({
      ...p,
      farmerProfile: profileMap.get(getFarmerIdStr(p.farmerId)),
    }));

    res.json({
      success: true,
      data: enriched,
      pagination: { page: pageNum, limit: limitNum, total, pages: Math.ceil(total / limitNum) },
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/products/featured
router.get('/featured', async (_req, res, next) => {
  try {
    const products = await Product.find({ availability: true })
      .populate('farmerId', 'name avatar')
      .sort({ soldCount: -1, rating: -1 })
      .limit(8)
      .lean();
    res.json({ success: true, data: products });
  } catch (err) {
    next(err);
  }
});

// GET /api/products/categories
router.get('/categories', async (_req, res, next) => {
  try {
    const categories = await Product.aggregate([
      { $match: { availability: true } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);
    res.json({ success: true, data: categories });
  } catch (err) {
    next(err);
  }
});

// GET /api/products/:id
router.get('/:id', optionalAuth, async (req: AuthRequest, res: Response, next) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('farmerId', 'name avatar email phone')
      .lean();
    
    if (!product) throw new AppError('Product not found', 404);
    
    // Increment view count
    await Product.findByIdAndUpdate(req.params.id, { $inc: { viewCount: 1 } });
    
    const farmerUserId = (product.farmerId as any)?._id || product.farmerId;
    const farmerProfile = await FarmerProfile.findOne({ userId: farmerUserId }).lean();
    
    res.json({ success: true, data: { ...product, farmerProfile } });
  } catch (err) {
    next(err);
  }
});

// POST /api/products — Farmer creates a product
const createProductSchema = z.object({
  body: z.object({
    name: z.string().min(2).max(200),
    description: z.string().max(2000).optional(),
    category: z.enum(['vegetables', 'fruits', 'grains', 'dairy', 'herbs', 'nuts', 'honey', 'eggs', 'other']),
    price: z.number().positive(),
    unit: z.enum(['kg', 'g', 'lb', 'oz', 'dozen', 'bunch', 'piece', 'litre', 'pack']),
    stockQuantity: z.number().int().min(0),
    minOrderQuantity: z.number().int().min(1).optional(),
    maxOrderQuantity: z.number().int().optional(),
    location: z.string().optional(),
    city: z.string().min(1),
    state: z.string().min(1),
    harvestDate: z.string().optional(),
    expiryDate: z.string().optional(),
    organic: z.boolean().optional(),
    freshness: z.enum(['very-fresh', 'fresh', 'good', 'limited']).optional(),
    origin: z.string().optional(),
    tags: z.array(z.string()).optional(),
    lowStockThreshold: z.number().int().min(0).optional(),
  }),
});

router.post('/', authenticate, authorize('FARMER'), validate(createProductSchema), async (req: AuthRequest, res: Response, next) => {
  try {
    const product = new Product({
      ...req.body,
      farmerId: req.user!._id,
      harvestDate: req.body.harvestDate ? new Date(req.body.harvestDate) : undefined,
      expiryDate: req.body.expiryDate ? new Date(req.body.expiryDate) : undefined,
    });
    await product.save();
    res.status(201).json({ success: true, data: product, message: 'Product created successfully' });
  } catch (err) {
    next(err);
  }
});

// PUT /api/products/:id — Farmer updates own product
router.put('/:id', authenticate, authorize('FARMER', 'ADMIN'), async (req: AuthRequest, res: Response, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) throw new AppError('Product not found', 404);
    
    if (req.user!.role === 'FARMER' && product.farmerId.toString() !== req.user!._id.toString()) {
      throw new AppError('Not authorized to update this product', 403);
    }

    const oldStock = product.stockQuantity;
    const allowedFields = ['name', 'description', 'category', 'price', 'unit', 'stockQuantity',
      'minOrderQuantity', 'maxOrderQuantity', 'location', 'city', 'state', 'harvestDate',
      'expiryDate', 'availability', 'organic', 'freshness', 'origin', 'tags', 'lowStockThreshold', 'images'];
    
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) (product as any)[field] = req.body[field];
    });

    if (req.body.stockQuantity !== undefined && req.body.stockQuantity > oldStock) {
      product.lowStockAlertSent = false; // Reset alert when restocked
    }

    await product.save();

    // Trigger inventory check
    await publishEvent({
      type: 'INVENTORY_CHANGED',
      payload: { productId: product._id.toString() },
    });

    res.json({ success: true, data: product, message: 'Product updated successfully' });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/products/:id
router.delete('/:id', authenticate, authorize('FARMER', 'ADMIN'), async (req: AuthRequest, res: Response, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) throw new AppError('Product not found', 404);
    
    if (req.user!.role === 'FARMER' && product.farmerId.toString() !== req.user!._id.toString()) {
      throw new AppError('Not authorized to delete this product', 403);
    }

    await Product.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Product deleted successfully' });
  } catch (err) {
    next(err);
  }
});

export default router;
