import { Notification, NotificationType } from '../models/Notification';
import { logger } from '../config/logger';

export async function createNotification(data: {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  referenceId?: string;
  referenceType?: string;
}): Promise<void> {
  try {
    await Notification.create(data);
    logger.debug(`Notification created for user ${data.userId}: ${data.type}`);
  } catch (err) {
    logger.error('Failed to create notification:', err);
  }
}

export async function sendOrderConfirmationNotification(
  consumerId: string,
  farmerId: string,
  orderId: string,
  orderNumber: string,
): Promise<void> {
  await Promise.all([
    createNotification({
      userId: consumerId,
      type: 'ORDER_PLACED',
      title: 'Order Placed Successfully',
      message: `Your order #${orderNumber} has been placed and is awaiting confirmation.`,
      referenceId: orderId,
      referenceType: 'Order',
    }),
    createNotification({
      userId: farmerId,
      type: 'ORDER_PLACED',
      title: 'New Order Received',
      message: `You have received a new order #${orderNumber}. Please review and confirm.`,
      referenceId: orderId,
      referenceType: 'Order',
    }),
  ]);
}

export async function sendOrderStatusNotification(
  consumerId: string,
  orderId: string,
  orderNumber: string,
  status: string,
): Promise<void> {
  const statusMessages: Record<string, { title: string; message: string; type: NotificationType }> = {
    CONFIRMED: {
      type: 'ORDER_CONFIRMED',
      title: 'Order Confirmed',
      message: `Your order #${orderNumber} has been confirmed by the farmer.`,
    },
    DISPATCHED: {
      type: 'ORDER_DISPATCHED',
      title: 'Order Dispatched',
      message: `Your order #${orderNumber} is on its way!`,
    },
    DELIVERED: {
      type: 'ORDER_DELIVERED',
      title: 'Order Delivered',
      message: `Your order #${orderNumber} has been delivered. Enjoy your fresh produce!`,
    },
    CANCELLED: {
      type: 'ORDER_CANCELLED',
      title: 'Order Cancelled',
      message: `Your order #${orderNumber} has been cancelled.`,
    },
    REJECTED: {
      type: 'ORDER_CANCELLED',
      title: 'Order Rejected',
      message: `Unfortunately, your order #${orderNumber} was rejected by the farmer.`,
    },
  };

  const notifData = statusMessages[status];
  if (notifData) {
    await createNotification({
      userId: consumerId,
      ...notifData,
      referenceId: orderId,
      referenceType: 'Order',
    });
  }
}

export async function sendLowStockNotification(
  farmerId: string,
  productId: string,
  productName: string,
  stockQuantity: number,
): Promise<void> {
  await createNotification({
    userId: farmerId,
    type: 'LOW_STOCK',
    title: 'Low Stock Alert',
    message: `"${productName}" is running low. Only ${stockQuantity} units remaining.`,
    referenceId: productId,
    referenceType: 'Product',
  });
}
