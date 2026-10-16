/**
 * InventoryAlertProcessor — FaaS Function (Local Adapter)
 * 
 * CLOUD DEPLOYMENT: Deploy as Azure Function (Timer or Service Bus trigger)
 * or AWS Lambda (EventBridge or SQS trigger).
 */

import { QueueEvent } from '../services/queueService';
import { Product } from '../models/Product';
import { sendLowStockNotification } from '../services/notificationService';
import { logger } from '../config/logger';

export async function processInventoryAlert(event: QueueEvent): Promise<void> {
  logger.info(`[FaaS] InventoryAlertProcessor triggered: ${event.type}`, {
    key: (event as any).idempotencyKey,
  });

  try {
    if (event.type === 'INVENTORY_CHANGED') {
      const { productId } = event.payload as { productId: string };
      await checkProductInventory(productId);
    }

    if (event.type === 'INVENTORY_LOW') {
      const { productId, farmerId, productName, stockQuantity } = event.payload as {
        productId: string;
        farmerId: string;
        productName: string;
        stockQuantity: number;
      };

      await sendLowStockNotification(farmerId, productId, productName, stockQuantity);
      logger.info(`[FaaS] Low stock alert sent for product ${productName} (${stockQuantity} remaining)`);
    }
  } catch (err) {
    logger.error('[FaaS] InventoryAlertProcessor failed:', err);
    throw err;
  }
}

async function checkProductInventory(productId: string): Promise<void> {
  const product = await Product.findById(productId);
  if (!product) return;

  const isLow = product.stockQuantity <= product.lowStockThreshold;
  
  if (isLow && !product.lowStockAlertSent) {
    await sendLowStockNotification(
      product.farmerId.toString(),
      product._id.toString(),
      product.name,
      product.stockQuantity,
    );
    
    // Mark alert as sent to prevent duplicates
    await Product.findByIdAndUpdate(productId, { lowStockAlertSent: true });
    logger.info(`[FaaS] Low stock alert sent for ${product.name}`);
  } else if (!isLow && product.lowStockAlertSent) {
    // Reset alert flag when stock is replenished
    await Product.findByIdAndUpdate(productId, { lowStockAlertSent: false });
  }
}

/**
 * Scheduled inventory scan — run this as a cron FaaS trigger.
 * Azure: TimerTrigger("0 0 * * * *") — every hour
 * AWS Lambda: EventBridge rule cron(0 * * * ? *)
 */
export async function scheduledInventoryScan(): Promise<void> {
  logger.info('[FaaS] Running scheduled inventory scan...');
  
  const lowStockProducts = await Product.find({
    availability: true,
    $expr: { $lte: ['$stockQuantity', '$lowStockThreshold'] },
    lowStockAlertSent: false,
  });

  logger.info(`[FaaS] Found ${lowStockProducts.length} low-stock products`);
  
  for (const product of lowStockProducts) {
    await sendLowStockNotification(
      product.farmerId.toString(),
      product._id.toString(),
      product.name,
      product.stockQuantity,
    );
    await Product.findByIdAndUpdate(product._id, { lowStockAlertSent: true });
  }
}
