import { afterEach, describe, expect, it } from 'vitest';
import { createHmac } from 'crypto';
import { AppError } from '../middleware/errorHandler';
import { verifyRazorpaySignature } from './paymentService';

const originalKeyId = process.env.RAZORPAY_KEY_ID;
const originalKeySecret = process.env.RAZORPAY_KEY_SECRET;

afterEach(() => {
  if (originalKeyId === undefined) delete process.env.RAZORPAY_KEY_ID;
  else process.env.RAZORPAY_KEY_ID = originalKeyId;
  if (originalKeySecret === undefined) delete process.env.RAZORPAY_KEY_SECRET;
  else process.env.RAZORPAY_KEY_SECRET = originalKeySecret;
});

describe('verifyRazorpaySignature', () => {
  it('accepts a valid Razorpay checkout signature', () => {
    const secret = 'test-secret';
    const orderId = 'order_test123';
    const paymentId = 'pay_test456';
    process.env.RAZORPAY_KEY_ID = 'rzp_test_key';
    process.env.RAZORPAY_KEY_SECRET = secret;
    const signature = createHmac('sha256', secret)
      .update(`${orderId}|${paymentId}`)
      .digest('hex');

    expect(verifyRazorpaySignature(orderId, paymentId, signature)).toBe(true);
  });

  it('rejects altered or malformed signatures', () => {
    process.env.RAZORPAY_KEY_ID = 'rzp_test_key';
    process.env.RAZORPAY_KEY_SECRET = 'test-secret';

    expect(verifyRazorpaySignature('order_test123', 'pay_test456', 'not-a-signature')).toBe(false);
    expect(verifyRazorpaySignature('order_test123', 'pay_test456', '0'.repeat(64))).toBe(false);
  });

  it('requires server-side Razorpay credentials', () => {
    delete process.env.RAZORPAY_KEY_ID;
    delete process.env.RAZORPAY_KEY_SECRET;

    expect(() => verifyRazorpaySignature('order_test123', 'pay_test456', '0'.repeat(64)))
      .toThrow(AppError);
  });
});
