import { Router } from 'express';
import { getDBStatus } from '../config/database';

const router = Router();

/**
 * @swagger
 * /api/health:
 *   get:
 *     summary: Health check
 *     tags: [Health]
 *     security: []
 *     responses:
 *       200:
 *         description: Service is healthy
 */
router.get('/', async (_req, res) => {
  const db = getDBStatus();
  const status = db.connected ? 'healthy' : 'degraded';
  
  res.status(db.connected ? 200 : 503).json({
    status,
    service: 'FarmDirect API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    database: {
      connected: db.connected,
      readyState: db.readyState,
    },
    environment: process.env.NODE_ENV,
  });
});

router.get('/ready', (_req, res) => {
  res.json({ ready: true, timestamp: new Date().toISOString() });
});

export default router;
