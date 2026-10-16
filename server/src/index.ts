import 'dotenv/config';
import app from './app';
import { connectDB } from './config/database';
import { logger } from './config/logger';
import { initQueue } from './services/queueService';

const PORT = parseInt(process.env.PORT || '5000', 10);

async function start() {
  try {
    await connectDB();
    await initQueue();
    app.listen(PORT, () => {
      logger.info(`🚀 FarmDirect API running on port ${PORT}`);
      logger.info(`🌿 Environment: ${process.env.NODE_ENV}`);
      logger.info(`📄 Swagger docs: http://localhost:${PORT}/api-docs`);
    });
  } catch (err) {
    logger.error('Failed to start server:', err);
    process.exit(1);
  }
}

start();
