import { Router, Request, Response } from 'express';
import rateLimit from 'express-rate-limit';
import { z } from 'zod';
import { validate } from '../middleware/validate';
import { authenticate, AuthRequest } from '../middleware/auth';
import {
  registerUser,
  loginUser,
  syncClerkUser,
  generateToken,
  setAuthCookie,
  sanitizeUser,
  authRateLimiter,
} from '../services/authService';
import { FarmerProfile } from '../models/FarmerProfile';

const router = Router();

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password, name, role]
 *             properties:
 *               email: { type: string, format: email }
 *               password: { type: string, minLength: 8 }
 *               name: { type: string }
 *               role: { type: string, enum: [CONSUMER, FARMER] }
 */
const registerSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email'),
    password: z.string().min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Password must contain uppercase letter')
      .regex(/[0-9]/, 'Password must contain a number'),
    name: z.string().min(2, 'Name must be at least 2 characters').max(100),
    role: z.enum(['CONSUMER', 'FARMER'], { errorMap: () => ({ message: 'Role must be CONSUMER or FARMER' }) }),
    phone: z.string().optional(),
    farmName: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
  }),
});

router.post('/register', authRateLimiter, validate(registerSchema), async (req: Request, res: Response, next) => {
  try {
    const user = await registerUser(req.body);
    const token = generateToken(user);
    setAuthCookie(res, token);
    res.status(201).json({ success: true, message: 'Registration successful', token, user: sanitizeUser(user) });
  } catch (err) {
    next(err);
  }
});

const loginSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(1, 'Password is required'),
  }),
});

router.post('/login', authRateLimiter, validate(loginSchema), async (req: Request, res: Response, next) => {
  try {
    const user = await loginUser(req.body.email, req.body.password, req.ip);
    const token = generateToken(user);
    setAuthCookie(res, token);
    res.json({ success: true, message: 'Login successful', token, user: sanitizeUser(user) });
  } catch (err) {
    next(err);
  }
});

const clerkSyncSchema = z.object({
  body: z.object({
    clerkId: z.string().min(1, 'Clerk ID is required'),
    email: z.string().email('Invalid email address'),
    name: z.string().optional(),
    avatar: z.string().optional(),
    role: z.enum(['CONSUMER', 'FARMER']).optional(),
    phone: z.string().optional(),
    farmName: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
  }),
});

router.post('/clerk-sync', validate(clerkSyncSchema), async (req: Request, res: Response, next) => {
  try {
    const user = await syncClerkUser({
      ...req.body,
      ipAddress: req.ip,
    });
    const token = generateToken(user);
    setAuthCookie(res, token);

    let farmerProfile = null;
    if (user.role === 'FARMER') {
      farmerProfile = await FarmerProfile.findOne({ userId: user._id });
    }

    res.json({
      success: true,
      message: 'Clerk authentication synchronized successfully',
      token,
      user: sanitizeUser(user),
      farmerProfile,
    });
  } catch (err) {
    next(err);
  }
});

router.post('/logout', (_req: Request, res: Response) => {
  res.clearCookie('token');
  res.json({ success: true, message: 'Logged out successfully' });
});

router.get('/me', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    const user = req.user!;
    let farmerProfile = null;
    if (user.role === 'FARMER') {
      farmerProfile = await FarmerProfile.findOne({ userId: user._id });
    }
    res.json({ success: true, user: sanitizeUser(user), farmerProfile });
  } catch (err) {
    next(err);
  }
});

router.put('/me', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    const user = req.user!;
    const { name, phone, avatar } = req.body;
    if (name) user.name = name;
    if (phone !== undefined) user.phone = phone;
    if (avatar !== undefined) user.avatar = avatar;
    await user.save();
    res.json({ success: true, user: sanitizeUser(user) });
  } catch (err) {
    next(err);
  }
});

router.put('/change-password', authenticate, authRateLimiter, async (req: AuthRequest, res: Response, next) => {
  try {
    const argon2 = await import('argon2');
    const user = await (await import('../models/User')).User.findById(req.user!._id).select('+password');
    if (!user) { res.status(404).json({ success: false, message: 'User not found' }); return; }
    
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      res.status(400).json({ success: false, message: 'Both passwords required' });
      return;
    }

    if (!user.password) {
      res.status(400).json({ success: false, message: 'OAuth accounts do not use a password' });
      return;
    }
    
    const valid = await argon2.verify(user.password, currentPassword);
    if (!valid) { res.status(401).json({ success: false, message: 'Current password is incorrect' }); return; }
    
    if (newPassword.length < 8) {
      res.status(400).json({ success: false, message: 'New password must be at least 8 characters' });
      return;
    }
    
    user.password = await argon2.hash(newPassword, { type: argon2.argon2id });
    await user.save();
    res.json({ success: true, message: 'Password changed successfully' });
  } catch (err) {
    next(err);
  }
});

export default router;
