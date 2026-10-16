/**
 * Payment Service — Demo payment provider abstraction.
 * 
 * IMPORTANT: This is a DEMO payment implementation. No real money is transferred.
 * Replace the 'demo' provider with Stripe, PayPal, or another gateway
 * by setting PAYMENT_PROVIDER env var and implementing the interface below.
 */

import { v4 as uuidv4 } from 'uuid';
import { logger } from '../config/logger';

export interface PaymentIntent {
  reference: string;
  status: 'PENDING' | 'PAID' | 'FAILED';
  provider: string;
  amount: number;
  currency: string;
  metadata?: Record<string, unknown>;
}

export interface PaymentResult {
  success: boolean;
  reference: string;
  status: 'PAID' | 'FAILED';
  message: string;
}

export async function createPaymentIntent(
  amount: number,
  currency: string = 'USD',
  metadata?: Record<string, unknown>,
): Promise<PaymentIntent> {
  const provider = process.env.PAYMENT_PROVIDER || 'demo';
  
  logger.info(`[DEMO PAYMENT] Creating payment intent for ${currency} ${amount.toFixed(2)}`);
  
  if (provider === 'demo') {
    return {
      reference: `DEMO-${uuidv4().toUpperCase().slice(0, 8)}`,
      status: 'PENDING',
      provider: 'demo',
      amount,
      currency,
      metadata,
    };
  }
  
  // TODO: Implement Stripe: await stripe.paymentIntents.create(...)
  throw new Error(`Payment provider "${provider}" not implemented`);
}

export async function processPayment(
  reference: string,
  amount: number,
): Promise<PaymentResult> {
  const provider = process.env.PAYMENT_PROVIDER || 'demo';
  
  if (provider === 'demo') {
    // Simulate async payment processing with ~95% success rate for demo
    await new Promise(resolve => setTimeout(resolve, 200));
    const success = Math.random() > 0.05;
    
    logger.info(`[DEMO PAYMENT] Payment ${reference}: ${success ? 'PAID' : 'FAILED'} — $${amount.toFixed(2)}`);
    
    return {
      success,
      reference,
      status: success ? 'PAID' : 'FAILED',
      message: success 
        ? `Demo payment of $${amount.toFixed(2)} processed successfully.`
        : 'Demo payment declined (simulated failure).',
    };
  }
  
  throw new Error(`Payment provider "${provider}" not implemented`);
}
