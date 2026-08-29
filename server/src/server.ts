import http from 'http';
import path from 'path';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { Server as SocketIOServer } from 'socket.io';
import { config } from './config/env';
import { connectDatabase, disconnectDatabase } from './config/database';
import { logger } from './utils/logger';
import { errorHandler } from './middlewares/errorHandler';
import { initSocketServer } from './sockets/socketManager';
import { initBackgroundWorkers, stopBackgroundWorkers } from './jobs/worker';
import { seedDatabase } from './utils/seedData';
import apiRouter from './routes';

const app = express();
const httpServer = http.createServer(app);

// 1. Security & CORS Middlewares
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, or dev tools)
      if (!origin) return callback(null, true);
      // Allow localhost on any port during development
      if (origin.startsWith('http://localhost') || origin.startsWith('http://127.0.0.1')) {
        return callback(null, true);
      }
      if (origin === config.clientUrl) {
        return callback(null, true);
      }
      callback(null, true); // Permissive in dev
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  })
);

// 2. Body parsers
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

// 3. Static uploads serving
app.use('/uploads', express.static(config.uploadDir));

// 4. Request logger in dev
app.use((req, _res, next) => {
  if (req.path !== '/api/health') {
    logger.debug(`[${req.method}] ${req.path}`);
  }
  next();
});

// 5. Mount API Routes
app.use('/api', apiRouter);

// 6. Global Error Handler
app.use(errorHandler);

// 7. Initialize Socket.IO
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
    credentials: true,
  },
  path: '/socket.io',
});

initSocketServer(io);

// 8. Start Server Function
export const startServer = async () => {
  try {
    // Connect to database
    await connectDatabase();

    // Run seed data
    await seedDatabase();

    // Initialize background jobs & escalation workers
    await initBackgroundWorkers();

    // Listen on port
    httpServer.listen(config.port, () => {
      logger.info(`=======================================================`);
      logger.info(`🚀 CampusResolve API Server running on port ${config.port}`);
      logger.info(`🔗 URL: http://localhost:${config.port}`);
      logger.info(`📡 Socket.IO initialized on path: /socket.io`);
      logger.info(`🩺 Health: http://localhost:${config.port}/api/health`);
      logger.info(`=======================================================`);
    });
  } catch (err) {
    logger.error('Failed to start CampusResolve Server:', err);
    process.exit(1);
  }
};

// Handle graceful shutdown
const gracefulShutdown = async (signal: string) => {
  logger.info(`Received ${signal}. Shutting down gracefully...`);
  await stopBackgroundWorkers();
  await disconnectDatabase();
  httpServer.close(() => {
    logger.info('HTTP server closed.');
    process.exit(0);
  });
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Auto-start when run directly
if (require.main === module) {
  startServer();
}

export { app, httpServer };
