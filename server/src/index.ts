import 'dotenv/config';
import app from './app';
import { connectDB } from './config/database';
import { logger } from './config/logger';
import { initQueue } from './services/queueService';

const PORT = parseInt(process.env.PORT || '5000', 10);

async function start() {
  try {
    app.listen(PORT, () => {
      logger.info(`🚀 FarmDirect API running on port ${PORT}`);
      logger.info(`🌿 Environment: ${process.env.NODE_ENV}`);
      logger.info(`📄 Swagger docs: http://localhost:${PORT}/api-docs`);
    });

    await connectDB();
    await initQueue();
  } catch (err) {
    logger.error('Failed to initialize database or queue:', err);
  }
}

start();
