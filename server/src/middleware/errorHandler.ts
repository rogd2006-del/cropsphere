import { Request, Response, NextFunction } from 'express';
import { logger } from '../config/logger';

export class AppError extends Error {
  public statusCode: number;
  public isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  let statusCode = 500;
  let message = 'Internal server error';
  let errors: unknown[] | undefined;

  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
  } else if (err.name === 'ValidationError') {
    // Mongoose validation
    statusCode = 400;
    message = 'Validation failed';
    errors = Object.values((err as any).errors).map((e: any) => ({
      field: e.path,
      message: e.message,
    }));
  } else if (err.name === 'CastError') {
    statusCode = 400;
    message = 'Invalid ID format';
  } else if ((err as any).code === 11000) {
    // MongoDB duplicate key
    statusCode = 409;
    const field = Object.keys((err as any).keyValue || {})[0];
    message = field ? `${field} already exists` : 'Duplicate entry';
  } else if (err.name === 'MulterError') {
    statusCode = 400;
    message = err.message;
  }

  logger.error(`${statusCode} ${req.method} ${req.path}: ${err.message}`, {
    requestId: (req as any).requestId,
    stack: process.env.NODE_ENV !== 'production' ? err.stack : undefined,
  });

  res.status(statusCode).json({
    success: false,
    message,
    ...(errors && { errors }),
    ...(process.env.NODE_ENV !== 'production' && statusCode === 500 && { stack: err.stack }),
  });
};
