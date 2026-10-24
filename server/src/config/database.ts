import mongoose from 'mongoose';
import { logger } from './logger';

let isConnected = false;
const MAX_RETRIES = 5;

export async function connectDB(): Promise<void> {
  if (isConnected) return;
  
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    logger.warn('⚠️  MONGODB_URI not set — running with in-memory local data store.');
    return;
  }

  let attempt = 0;
  while (attempt < MAX_RETRIES) {
    attempt++;
    try {
      const conn = await mongoose.connect(uri, {
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 8000,
        socketTimeoutMS: 45000,
      });
      isConnected = true;
      logger.info(`✅ MongoDB connected: ${conn.connection.host}`);
      return;
    } catch (err: any) {
      const isIpError = err?.message?.includes('IP') || err?.message?.includes('whitelist') || err?.message?.includes('ServerSelection');
      logger.error(`MongoDB connection attempt ${attempt}/${MAX_RETRIES} failed: ${err?.message}`);
      if (attempt >= MAX_RETRIES) {
        logger.warn('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        logger.warn('🟡 MongoDB unavailable — switching to LOCAL DATA STORE.');
        logger.warn('   All API routes will serve in-memory demo data.');
        logger.warn('   To use MongoDB Atlas: whitelist your IP at atlas.mongodb.com');
        logger.warn('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        return;
      }
      const delay = Math.min(2000 * Math.min(attempt, 5), 10000);
      if (isIpError) {
        logger.warn(`⚠️  IP not whitelisted in Atlas. Retrying in ${delay / 1000}s... (attempt ${attempt}/${MAX_RETRIES})`);
        logger.warn('   → Go to MongoDB Atlas → Network Access → Add IP Address → Allow Access from Anywhere (0.0.0.0/0)');
      } else {
        logger.info(`⏳ Retrying MongoDB connection in ${delay / 1000}s...`);
      }
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}

/** Returns true when Mongoose has an active, ready connection to MongoDB */
export function isDBConnected(): boolean {
  return mongoose.connection.readyState === 1;
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
