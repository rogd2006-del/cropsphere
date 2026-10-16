import { Router, Response } from 'express';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';
import { localMulter, uploadFile } from '../services/storageService';
import { Product } from '../models/Product';
import { AppError } from '../middleware/errorHandler';

const router = Router();

// POST /api/uploads/product-images/:productId
router.post('/product-images/:productId',
  authenticate,
  authorize('FARMER', 'ADMIN'),
  localMulter.array('images', 5),
  async (req: AuthRequest, res: Response, next) => {
    try {
      const product = await Product.findById(req.params.productId);
      if (!product) throw new AppError('Product not found', 404);
      
      if (req.user!.role === 'FARMER' && product.farmerId.toString() !== req.user!._id.toString()) {
        throw new AppError('Not authorized', 403);
      }

      const files = req.files as Express.Multer.File[];
      if (!files || files.length === 0) throw new AppError('No files uploaded', 400);

      const urls: string[] = [];
      for (const file of files) {
        const result = await uploadFile(file.buffer || Buffer.from(''), file.originalname, file.mimetype);
        urls.push(result.url || `/uploads/${file.filename}`);
      }

      // If local storage (multer disk), file.path is already saved
      const localUrls = files.map(f => `/uploads/${f.filename}`);
      const imageUrls = urls.length > 0 && urls[0] !== '/uploads/undefined' ? urls : localUrls;

      product.images = [...product.images, ...imageUrls].slice(0, 10);
      await product.save();

      res.json({ success: true, data: { images: product.images }, message: 'Images uploaded successfully' });
    } catch (err) {
      next(err);
    }
  }
);

// POST /api/uploads/avatar
router.post('/avatar',
  authenticate,
  localMulter.single('avatar'),
  async (req: AuthRequest, res: Response, next) => {
    try {
      if (!req.file) throw new AppError('No file uploaded', 400);
      const url = `/uploads/${req.file.filename}`;
      req.user!.avatar = url;
      await req.user!.save();
      res.json({ success: true, data: { url }, message: 'Avatar uploaded' });
    } catch (err) {
      next(err);
    }
  }
);

export default router;
