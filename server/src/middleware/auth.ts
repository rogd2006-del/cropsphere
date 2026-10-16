import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User, IUser, UserRole } from '../models/User';
import { AppError } from './errorHandler';

export interface AuthRequest extends Request {
  user?: IUser;
}

export const authenticate = async (req: AuthRequest, _res: Response, next: NextFunction): Promise<void> => {
  try {
    let token: string | undefined;

    // Check Authorization header
    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    }

    // Check cookie
    if (!token && req.cookies?.token) {
      token = req.cookies.token;
    }

    if (!token) {
      throw new AppError('Authentication required', 401);
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) throw new AppError('Server configuration error', 500);

    const decoded = jwt.verify(token, secret) as { userId: string; role: UserRole };

    const user = await User.findById(decoded.userId).select('+password');
    if (!user) throw new AppError('User not found', 401);
    if (!user.isActive) throw new AppError('Account is suspended', 403);

    req.user = user;
    next();
  } catch (err) {
    if (err instanceof jwt.JsonWebTokenError) {
      next(new AppError('Invalid token', 401));
    } else if (err instanceof jwt.TokenExpiredError) {
      next(new AppError('Token expired', 401));
    } else {
      next(err);
    }
  }
};

export const authorize = (...roles: UserRole[]) => {
  return (req: AuthRequest, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(new AppError('Authentication required', 401));
      return;
    }
    if (!roles.includes(req.user.role)) {
      next(new AppError('Insufficient permissions', 403));
      return;
    }
    next();
  };
};

export const optionalAuth = async (req: AuthRequest, _res: Response, next: NextFunction): Promise<void> => {
  try {
    let token: string | undefined;
    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith('Bearer ')) token = authHeader.split(' ')[1];
    if (!token && req.cookies?.token) token = req.cookies.token;
    
    if (token && process.env.JWT_SECRET) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET) as { userId: string };
      const user = await User.findById(decoded.userId);
      if (user?.isActive) req.user = user;
    }
  } catch {
    // Ignore auth errors for optional auth
  }
  next();
};
