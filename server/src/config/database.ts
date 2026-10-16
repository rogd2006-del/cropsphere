import mongoose from 'mongoose';
import { logger } from './logger';

let isConnected = false;

export async function connectDB(): Promise<void> {
  if (isConnected) return;
  
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error('MONGODB_URI environment variable is not set');
  }

  try {
    const conn = await mongoose.connect(uri, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    isConnected = true;
    logger.info(`✅ MongoDB connected: ${conn.connection.host}`);
  } catch (err) {
    logger.error('MongoDB connection failed:', err);
    throw err;
  }
}

export async function disconnectDB(): Promise<void> {
  if (!isConnected) return;
  await mongoose.disconnect();
  isConnected = false;
  logger.info('MongoDB disconnected');
}

export function getDBStatus(): { connected: boolean; host: string | undefined; readyState: number } {
  return {
    connected: mongoose.connection.readyState === 1,
    host: mongoose.connection.host,
    readyState: mongoose.connection.readyState,
  };
}
