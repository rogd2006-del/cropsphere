import argon2 from 'argon2';
import jwt from 'jsonwebtoken';
import rateLimit from 'express-rate-limit';
import { User, IUser, UserRole } from '../models/User';
import { FarmerProfile } from '../models/FarmerProfile';
import { AuditLog } from '../models/AuditLog';
import { AppError } from '../middleware/errorHandler';
import { logger } from '../config/logger';

const JWT_SECRET = () => {
  const s = process.env.JWT_SECRET;
  if (!s) throw new AppError('JWT_SECRET not configured', 500);
  return s;
};

export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: parseInt(process.env.AUTH_RATE_LIMIT_MAX || '10'),
  message: { success: false, message: 'Too many authentication attempts, please try again in 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});

export function generateToken(user: IUser): string {
  return jwt.sign(
    { userId: user._id.toString(), role: user.role, email: user.email },
    JWT_SECRET(),
    { expiresIn: (process.env.JWT_EXPIRES_IN || '7d') as any }
  );
}

export function setAuthCookie(res: any, token: string): void {
  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
    signed: false,
  });
}

export async function registerUser(data: {
  email: string;
  password: string;
  name: string;
  role: 'CONSUMER' | 'FARMER';
  phone?: string;
  farmName?: string;
  city?: string;
  state?: string;
}): Promise<IUser> {
  const existing = await User.findOne({ email: data.email.toLowerCase() });
  if (existing) throw new AppError('Email already registered', 409);

  const hashedPassword = await argon2.hash(data.password, {
    type: argon2.argon2id,
    memoryCost: 65536,
    timeCost: 3,
  });

  const user = new User({
    email: data.email.toLowerCase(),
    password: hashedPassword,
    name: data.name,
    role: data.role,
    phone: data.phone,
    isActive: true,
  });
  await user.save();

  if (data.role === 'FARMER') {
    await FarmerProfile.create({
      userId: user._id,
      farmName: data.farmName || `${data.name}'s Farm`,
      bio: '',
      location: { city: data.city || '', state: data.state || '' },
    });
  }

  logger.info(`New user registered: ${user.email} (${user.role})`);
  return user;
}

export async function loginUser(email: string, password: string, ipAddress?: string): Promise<IUser> {
  const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
  if (!user) throw new AppError('Invalid email or password', 401);
  if (!user.isActive) throw new AppError('Account has been suspended', 403);

  if (!user.password) {
    throw new AppError('This account is registered via Google/Clerk. Please sign in with Google.', 400);
  }

  const valid = await argon2.verify(user.password, password);
  if (!valid) {
    await AuditLog.create({
      userEmail: email,
      action: 'LOGIN_FAILED',
      entity: 'User',
      metadata: { reason: 'invalid_password' },
      ipAddress,
    });
    throw new AppError('Invalid email or password', 401);
  }

  user.lastLogin = new Date();
  await user.save();

  await AuditLog.create({
    userId: user._id,
    userEmail: user.email,
    action: 'LOGIN_SUCCESS',
    entity: 'User',
    entityId: user._id.toString(),
    ipAddress,
  });

  return user;
}

export async function syncClerkUser(data: {
  clerkId: string;
  email: string;
  name?: string;
  avatar?: string;
  role?: 'CONSUMER' | 'FARMER';
  phone?: string;
  farmName?: string;
  city?: string;
  state?: string;
  ipAddress?: string;
}): Promise<IUser> {
  const email = data.email.toLowerCase().trim();
  let user = await User.findOne({
    $or: [{ clerkId: data.clerkId }, { email }],
  });

  if (user) {
    if (!user.clerkId) user.clerkId = data.clerkId;
    if (data.name && (!user.name || user.name === email.split('@')[0])) user.name = data.name;
    if (data.avatar && !user.avatar) user.avatar = data.avatar;
    if (data.phone && !user.phone) user.phone = data.phone;
    user.isEmailVerified = true;
    user.lastLogin = new Date();
    await user.save();

    if (user.role === 'FARMER') {
      const profile = await FarmerProfile.findOne({ userId: user._id });
      if (!profile) {
        await FarmerProfile.create({
          userId: user._id,
          farmName: data.farmName || `${user.name}'s Farm`,
          bio: '',
          location: { city: data.city || '', state: data.state || '' },
        });
      }
    }

    await AuditLog.create({
      userId: user._id,
      userEmail: user.email,
      action: 'LOGIN_SUCCESS',
      entity: 'User',
      entityId: user._id.toString(),
      metadata: { provider: 'clerk_oauth' },
      ipAddress: data.ipAddress,
    });

    return user;
  }

  // Create new user authenticated via Clerk
  const chosenRole = data.role === 'FARMER' ? 'FARMER' : 'CONSUMER';
  user = new User({
    clerkId: data.clerkId,
    email,
    name: data.name || email.split('@')[0],
    role: chosenRole,
    avatar: data.avatar,
    phone: data.phone,
    isActive: true,
    isEmailVerified: true,
    lastLogin: new Date(),
  });
  await user.save();

  if (chosenRole === 'FARMER') {
    await FarmerProfile.create({
      userId: user._id,
      farmName: data.farmName || `${user.name}'s Farm`,
      bio: '',
      location: { city: data.city || '', state: data.state || '' },
    });
  }

  logger.info(`New Clerk user synchronized: ${user.email} (${user.role})`);

  await AuditLog.create({
    userId: user._id,
    userEmail: user.email,
    action: 'REGISTER_SUCCESS',
    entity: 'User',
    entityId: user._id.toString(),
    metadata: { provider: 'clerk_oauth' },
    ipAddress: data.ipAddress,
  });

  return user;
}

export function sanitizeUser(user: IUser) {
  return {
    _id: user._id,
    email: user.email,
    name: user.name,
    role: user.role,
    phone: user.phone,
    avatar: user.avatar,
    clerkId: user.clerkId,
    isActive: user.isActive,
    isEmailVerified: user.isEmailVerified,
    createdAt: user.createdAt,
    lastLogin: user.lastLogin,
  };
}
