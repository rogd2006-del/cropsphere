/**
 * OrderEventProcessor — FaaS Function (Local Adapter)
 * 
 * CLOUD DEPLOYMENT: Deploy as Azure Function (HTTP or Service Bus trigger)
 * or AWS Lambda (SQS trigger) using the code in /functions/ directory.
 * 
 * This module is the shared business logic used by both:
 * 1. The local in-process queue adapter (development)
 * 2. The Azure Function / AWS Lambda handler (production)
 */

import { QueueEvent } from '../services/queueService';
import { sendOrderConfirmationNotification, sendOrderStatusNotification } from '../services/notificationService';
import { logger } from '../config/logger';

export async function processOrderEvent(event: QueueEvent): Promise<void> {
  logger.info(`[FaaS] OrderEventProcessor triggered: ${event.type}`, { 
    orderId: event.payload.orderId,
    key: (event as any).idempotencyKey,
  });

  try {
    if (event.type === 'ORDER_PLACED') {
      const { orderId, orderNumber, consumerId, farmerId } = event.payload as {
        orderId: string;
        orderNumber: string;
        consumerId: string;
        farmerId: string;
      };

      await sendOrderConfirmationNotification(consumerId, farmerId, orderId, orderNumber);
      logger.info(`[FaaS] Order confirmation notifications sent for order ${orderNumber}`);
    }

    if (event.type === 'ORDER_UPDATED') {
      const { orderId, orderNumber, consumerId, status } = event.payload as {
        orderId: string;
        orderNumber: string;
        consumerId: string;
        status: string;
      };

      await sendOrderStatusNotification(consumerId, orderId, orderNumber, status);
      logger.info(`[FaaS] Order status notification sent: ${status} for order ${orderNumber}`);
    }
  } catch (err) {
    logger.error('[FaaS] OrderEventProcessor failed:', err);
    throw err; // Rethrow to trigger retry in queue service
  }
}
