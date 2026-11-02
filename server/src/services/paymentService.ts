import axios from 'axios';
import { createHmac, timingSafeEqual } from 'crypto';
import { AppError } from '../middleware/errorHandler';
import { logger } from '../config/logger';

const RAZORPAY_API_URL = 'https://api.razorpay.com/v1';

interface RazorpayCredentials {
  keyId: string;
  keySecret: string;
}

export interface RazorpayOrder {
  id: string;
  amount: number;
  currency: string;
  status: string;
  notes?: Record<string, string>;
}

export interface RazorpayPayment {
  id: string;
  order_id: string;
  amount: number;
  currency: string;
  status: string;
  captured: boolean;
}

function getCredentials(): RazorpayCredentials {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !keySecret) {
    throw new AppError('Razorpay is not configured. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET.', 503);
  }
  return { keyId, keySecret };
}

export function getRazorpayKeyId(): string {
  return getCredentials().keyId;
}

async function razorpayRequest<T>(
  method: 'GET' | 'POST',
  path: string,
  data?: Record<string, unknown>,
): Promise<T> {
  const { keyId, keySecret } = getCredentials();
  try {
    const response = await axios.request<T>({
      method,
      url: `${RAZORPAY_API_URL}${path}`,
      data,
      auth: { username: keyId, password: keySecret },
      timeout: 15000,
    });
    return response.data;
  } catch (error) {
    const status = axios.isAxiosError(error) ? error.response?.status : undefined;
    logger.error(`Razorpay API request failed${status ? ` with status ${status}` : ''}`);
    const description = axios.isAxiosError(error)
      ? error.response?.data?.error?.description
      : undefined;
    throw new AppError(
      typeof description === 'string' ? `Razorpay: ${description}` : 'Razorpay payment service is unavailable.',
      502,
    );
  }
}

export async function createRazorpayOrder(
  amount: number,
  receipt: string,
  notes: Record<string, string>,
): Promise<RazorpayOrder> {
  return razorpayRequest<RazorpayOrder>('POST', '/orders', {
    amount,
    currency: 'INR',
    receipt,
    notes,
  });
}

export function verifyRazorpaySignature(orderId: string, paymentId: string, signature: string): boolean {
  const { keySecret } = getCredentials();
  if (!/^[a-f0-9]{64}$/i.test(signature)) return false;

  const expected = createHmac('sha256', keySecret)
    .update(`${orderId}|${paymentId}`)
    .digest();
  const received = Buffer.from(signature, 'hex');
  return received.length === expected.length && timingSafeEqual(received, expected);
}

export async function fetchRazorpayOrder(orderId: string): Promise<RazorpayOrder> {
  return razorpayRequest<RazorpayOrder>('GET', `/orders/${encodeURIComponent(orderId)}`);
}

export async function fetchRazorpayPayment(paymentId: string): Promise<RazorpayPayment> {
  return razorpayRequest<RazorpayPayment>('GET', `/payments/${encodeURIComponent(paymentId)}`);
}

export async function captureRazorpayPayment(
  paymentId: string,
  amount: number,
): Promise<RazorpayPayment> {
  return razorpayRequest<RazorpayPayment>(
    'POST',
    `/payments/${encodeURIComponent(paymentId)}/capture`,
    { amount, currency: 'INR' },
  );
}

export async function refundRazorpayPayment(
  paymentId: string,
  amount: number,
): Promise<void> {
  await razorpayRequest('POST', `/payments/${encodeURIComponent(paymentId)}/refund`, { amount });
}
