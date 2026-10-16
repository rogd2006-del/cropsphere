/**
 * Queue Service — Local event adapter for FaaS demonstration.
 * 
 * CLOUD DEPLOYMENT: Replace this adapter with Azure Service Bus, AWS SQS,
 * or RabbitMQ by setting QUEUE_PROVIDER environment variable.
 * 
 * Current behavior: Events are processed in-process immediately.
 * Production behavior: Events are published to a managed queue and consumed
 * by the serverless functions in /functions/.
 */

import { CloudServiceEvent } from '../models/CloudServiceEvent';
import { logger } from '../config/logger';
import { v4 as uuidv4 } from 'uuid';

export type QueueEventType = 'ORDER_PLACED' | 'ORDER_UPDATED' | 'INVENTORY_CHANGED' | 'INVENTORY_LOW';

export interface QueueEvent {
  type: QueueEventType;
  payload: Record<string, unknown>;
  idempotencyKey?: string;
}

type EventHandler = (event: QueueEvent) => Promise<void>;
const handlers: Map<string, EventHandler[]> = new Map();

export async function initQueue(): Promise<void> {
  const provider = process.env.QUEUE_PROVIDER || 'local';
  logger.info(`🔌 Queue provider: ${provider.toUpperCase()} ${provider === 'local' ? '(Local Demo Mode)' : ''}`);

  if (provider === 'local') {
    // Import and register local handlers
    const { processOrderEvent } = await import('../functions/orderEventProcessor');
    const { processInventoryAlert } = await import('../functions/inventoryAlertProcessor');
    
    registerHandler('ORDER_PLACED', processOrderEvent);
    registerHandler('ORDER_UPDATED', processOrderEvent);
    registerHandler('INVENTORY_CHANGED', processInventoryAlert);
    registerHandler('INVENTORY_LOW', processInventoryAlert);
    
    logger.info('📬 Local event handlers registered (FaaS demo mode)');
  }
  // TODO: Add Azure Service Bus / AWS SQS initialization here
}

export function registerHandler(eventType: string, handler: EventHandler): void {
  if (!handlers.has(eventType)) handlers.set(eventType, []);
  handlers.get(eventType)!.push(handler);
}

export async function publishEvent(event: QueueEvent): Promise<void> {
  const idempotencyKey = event.idempotencyKey || uuidv4();
  
  try {
    // Record event in database
    await CloudServiceEvent.findOneAndUpdate(
      { idempotencyKey },
      {
        $setOnInsert: {
          type: event.type,
          payload: event.payload,
          processed: false,
          retries: 0,
          idempotencyKey,
        },
      },
      { upsert: true, new: true }
    );
  } catch (err) {
    logger.warn('Could not persist cloud event (DB may not be connected):', err);
  }

  logger.debug(`📤 Publishing event: ${event.type} (key: ${idempotencyKey})`);
  
  const provider = process.env.QUEUE_PROVIDER || 'local';
  
  if (provider === 'local') {
    // Process in-process for local development
    setImmediate(() => processLocalEvent({ ...event, idempotencyKey }));
  }
  // TODO: Publish to Azure Service Bus / AWS SQS for production
}

async function processLocalEvent(event: QueueEvent & { idempotencyKey: string }): Promise<void> {
  const eventHandlers = handlers.get(event.type) || [];
  
  for (const handler of eventHandlers) {
    try {
      await handler(event);
      
      await CloudServiceEvent.findOneAndUpdate(
        { idempotencyKey: event.idempotencyKey },
        { processed: true, processedAt: new Date() }
      );
      
      logger.debug(`✅ Event processed: ${event.type}`);
    } catch (err) {
      logger.error(`❌ Event handler failed for ${event.type}:`, err);
      
      await CloudServiceEvent.findOneAndUpdate(
        { idempotencyKey: event.idempotencyKey },
        { $inc: { retries: 1 }, processingError: String(err) }
      );
    }
  }
}

export async function getQueueStats() {
  const provider = process.env.QUEUE_PROVIDER || 'local';
  try {
    const total = await CloudServiceEvent.countDocuments();
    const processed = await CloudServiceEvent.countDocuments({ processed: true });
    const failed = await CloudServiceEvent.countDocuments({ retries: { $gte: 3 }, processed: false });
    const recent = await CloudServiceEvent.find().sort({ createdAt: -1 }).limit(5).lean();
    
    return {
      provider,
      isLocal: provider === 'local',
      total,
      processed,
      failed,
      pending: total - processed - failed,
      recent,
    };
  } catch {
    return { provider, isLocal: provider === 'local', total: 0, processed: 0, failed: 0, pending: 0, recent: [] };
  }
}
