import { Router } from 'express';
import { getDBStatus } from '../config/database';
import { getQueueStats } from '../services/queueService';
import { getStorageStatus } from '../services/storageService';
import { CloudServiceEvent } from '../models/CloudServiceEvent';
import { User } from '../models/User';
import { Order } from '../models/Order';
import { Product } from '../models/Product';

const router = Router();

// GET /api/cloud/status — Cloud services dashboard data
router.get('/status', async (_req, res, next) => {
  try {
    const dbStatus = getDBStatus();
    const storageStatus = getStorageStatus();
    const queueStats = await getQueueStats();

    // IaaS status
    const iaasProvider = process.env.IAAS_PROVIDER || 'local';
    const iaasStatus = {
      provider: iaasProvider,
      status: iaasProvider === 'local' ? 'LOCAL_DEMO' : 'CONFIGURED',
      description: 'Linux Virtual Machine hosting the backend services',
      vmHost: process.env.VM_HOST || 'localhost',
      specs: {
        os: 'Ubuntu 22.04 LTS',
        cpu: '2 vCPUs',
        memory: '4 GB RAM',
        disk: '50 GB SSD',
        network: '1 Gbps',
      },
      note: iaasProvider === 'local' 
        ? 'Running in local demo mode. Set VM_HOST, IAAS_PROVIDER=azure in .env to enable real IaaS metrics.'
        : null,
    };

    // PaaS status
    const apiBaseUrl = process.env.API_BASE_URL || 'http://localhost:5000';
    const paasStatus = {
      provider: process.env.PAAS_PROVIDER || 'local',
      status: process.env.PAAS_PROVIDER ? 'CONFIGURED' : 'LOCAL_DEMO',
      description: 'Managed application platform hosting the Express API',
      apiUrl: apiBaseUrl,
      region: process.env.PAAS_REGION || 'Not configured',
      note: !process.env.PAAS_PROVIDER
        ? 'Running locally. Deploy to Azure App Service or Railway by setting PAAS_PROVIDER in .env.'
        : null,
    };

    // SaaS stats
    const [totalUsers, activeProducts, totalOrders] = await Promise.all([
      User.countDocuments().catch(() => 0),
      Product.countDocuments({ availability: true }).catch(() => 0),
      Order.countDocuments().catch(() => 0),
    ]);

    const saasStatus = {
      provider: 'FarmDirect Cloud',
      status: 'ACTIVE',
      description: 'FarmDirect marketplace SaaS application',
      metrics: { totalUsers, activeProducts, totalOrders },
      frontendUrl: process.env.CLIENT_URL || 'http://localhost:5173',
    };

    // FaaS status
    const recentEvents = await CloudServiceEvent.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .lean()
      .catch(() => []);
    
    const faasStatus = {
      provider: process.env.QUEUE_PROVIDER || 'local',
      status: process.env.QUEUE_PROVIDER && process.env.QUEUE_PROVIDER !== 'local' 
        ? 'CONFIGURED' : 'LOCAL_DEMO',
      description: 'Serverless functions for order and inventory processing',
      functions: [
        { name: 'OrderEventProcessor', trigger: 'Queue (ORDER_PLACED, ORDER_UPDATED)' },
        { name: 'InventoryAlertProcessor', trigger: 'Queue (INVENTORY_CHANGED, INVENTORY_LOW)' },
      ],
      stats: queueStats,
      recentEvents,
      note: !process.env.QUEUE_PROVIDER || process.env.QUEUE_PROVIDER === 'local'
        ? 'Functions run in-process. Set QUEUE_PROVIDER=azure-servicebus to use real Azure Functions.'
        : null,
    };

    // DBaaS status
    const dbaaStatus = {
      provider: process.env.MONGODB_URI?.includes('mongodb.net') ? 'MongoDB Atlas' : 'Local/MongoDB',
      status: dbStatus.connected ? 'CONNECTED' : 'DISCONNECTED',
      description: 'Managed MongoDB database service',
      host: dbStatus.host || 'Not connected',
      readyState: dbStatus.readyState,
      isAtlas: process.env.MONGODB_URI?.includes('mongodb.net') || false,
    };

    res.json({
      success: true,
      data: {
        iaas: iaasStatus,
        paas: paasStatus,
        saas: saasStatus,
        faas: faasStatus,
        dbaas: dbaaStatus,
        storage: storageStatus,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/cloud/test-event — Trigger a test FaaS event
router.post('/test-event', async (req, res, next) => {
  try {
    const { type = 'ORDER_PLACED' } = req.body;
    const { publishEvent } = await import('../services/queueService');
    
    await publishEvent({
      type: type as any,
      payload: {
        orderId: 'test-order-id',
        orderNumber: 'FD-TEST-0001',
        consumerId: 'test-consumer',
        farmerId: 'test-farmer',
        total: 42.50,
        isTest: true,
      },
      idempotencyKey: `test-${type}-${Date.now()}`,
    });
    
    res.json({ success: true, message: `Test event "${type}" published successfully` });
  } catch (err) {
    next(err);
  }
});

export default router;
