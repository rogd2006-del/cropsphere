/**
 * Storage Service — Cloud Object Storage Adapter
 * 
 * Supports: Azure Blob Storage, AWS S3, Local filesystem
 * Set STORAGE_PROVIDER env var to switch providers.
 */

import path from 'path';
import fs from 'fs';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import { AppError } from '../middleware/errorHandler';
import { logger } from '../config/logger';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_SIZE_MB = 5;
const MAX_SIZE = MAX_SIZE_MB * 1024 * 1024;

// ── Local Storage Adapter ────────────────────────────────────────────────────
function getLocalUploadDir(): string {
  const dir = path.join(process.cwd(), process.env.LOCAL_UPLOAD_DIR || 'uploads');
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  return dir;
}

export const localMulter = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, getLocalUploadDir()),
    filename: (_req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase();
      cb(null, `${uuidv4()}${ext}`);
    },
  }),
  limits: { fileSize: MAX_SIZE, files: 5 },
  fileFilter: (_req, file, cb) => {
    if (ALLOWED_TYPES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new AppError(`Invalid file type. Allowed: ${ALLOWED_TYPES.join(', ')}`, 400) as any);
    }
  },
});

export const memoryMulter = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_SIZE, files: 5 },
  fileFilter: (_req, file, cb) => {
    if (ALLOWED_TYPES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new AppError('Invalid file type', 400) as any);
    }
  },
});

// ── Storage Interface ────────────────────────────────────────────────────────
export interface UploadResult {
  url: string;
  key: string;
  provider: string;
}

export async function uploadFile(
  buffer: Buffer,
  originalName: string,
  mimeType: string,
): Promise<UploadResult> {
  const provider = process.env.STORAGE_PROVIDER || 'local';
  const ext = path.extname(originalName).toLowerCase() || '.jpg';
  const key = `products/${uuidv4()}${ext}`;

  switch (provider) {
    case 'azure':
      return uploadToAzure(buffer, key, mimeType);
    case 's3':
      return uploadToS3(buffer, key, mimeType);
    default:
      return uploadToLocal(buffer, key, ext);
  }
}

async function uploadToLocal(buffer: Buffer, key: string, ext: string): Promise<UploadResult> {
  const dir = getLocalUploadDir();
  const fileName = `${uuidv4()}${ext}`;
  const filePath = path.join(dir, fileName);
  fs.writeFileSync(filePath, buffer);
  return {
    url: `/uploads/${fileName}`,
    key: fileName,
    provider: 'local',
  };
}

async function uploadToAzure(buffer: Buffer, key: string, contentType: string): Promise<UploadResult> {
  try {
    // @ts-ignore
    const { BlobServiceClient } = await import('@azure/storage-blob');
    const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
    const containerName = process.env.AZURE_STORAGE_CONTAINER_NAME || 'farmdirect-images';
    
    if (!connectionString) throw new AppError('Azure Storage not configured', 500);
    
    const client = BlobServiceClient.fromConnectionString(connectionString);
    const container = client.getContainerClient(containerName);
    const blockBlob = container.getBlockBlobClient(key);
    
    await blockBlob.upload(buffer, buffer.length, {
      blobHTTPHeaders: { blobContentType: contentType },
    });
    
    logger.info(`Uploaded to Azure: ${key}`);
    return { url: blockBlob.url, key, provider: 'azure' };
  } catch (err) {
    logger.error('Azure upload failed:', err);
    throw new AppError('File upload failed', 500);
  }
}

async function uploadToS3(buffer: Buffer, key: string, contentType: string): Promise<UploadResult> {
  try {
    // @ts-ignore
    const { S3Client, PutObjectCommand } = await import('@aws-sdk/client-s3');
    const bucket = process.env.AWS_S3_BUCKET;
    const region = process.env.AWS_REGION || 'us-east-1';
    
    if (!bucket) throw new AppError('S3 not configured', 500);
    
    const client = new S3Client({ region });
    await client.send(new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: buffer,
      ContentType: contentType,
    }));
    
    const url = `https://${bucket}.s3.${region}.amazonaws.com/${key}`;
    logger.info(`Uploaded to S3: ${key}`);
    return { url, key, provider: 's3' };
  } catch (err) {
    logger.error('S3 upload failed:', err);
    throw new AppError('File upload failed', 500);
  }
}

export async function deleteFile(key: string): Promise<void> {
  const provider = process.env.STORAGE_PROVIDER || 'local';
  try {
    if (provider === 'local') {
      const filePath = path.join(getLocalUploadDir(), key);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }
    // TODO: Azure/S3 delete implementations
  } catch (err) {
    logger.warn(`Failed to delete file ${key}:`, err);
  }
}

export function getStorageStatus(): { provider: string; configured: boolean; container?: string } {
  const provider = process.env.STORAGE_PROVIDER || 'local';
  return {
    provider,
    configured: provider === 'local' || 
      (provider === 'azure' && !!process.env.AZURE_STORAGE_CONNECTION_STRING) ||
      (provider === 's3' && !!process.env.AWS_ACCESS_KEY_ID),
    container: provider === 'azure' ? process.env.AZURE_STORAGE_CONTAINER_NAME : 
               provider === 's3' ? process.env.AWS_S3_BUCKET : 'local/uploads',
  };
}
