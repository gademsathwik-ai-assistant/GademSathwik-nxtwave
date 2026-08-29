import { Queue, Worker } from 'bullmq';
import IORedis from 'ioredis';
import { config } from '../config/env';
import { logger } from '../utils/logger';
import { EscalationService } from './escalationQueue';

let escalationQueue: Queue | null = null;
let escalationWorker: Worker | null = null;
let fallbackInterval: NodeJS.Timeout | null = null;

export const initBackgroundWorkers = async (): Promise<void> => {
  try {
    // Attempt Redis connection
    const redisConnection = new IORedis({
      host: config.redis.host,
      port: config.redis.port,
      password: config.redis.password,
      maxRetriesPerRequest: null,
      enableReadyCheck: false,
      connectTimeout: 2000,
      retryStrategy: () => null, // Do not reconnect on failure
    });

    redisConnection.on('error', () => {
      // Quiet fallback
    });

    // Check Redis ping
    await Promise.race([
      redisConnection.ping(),
      new Promise((_, reject) => setTimeout(() => reject(new Error('Redis timeout')), 2500)),
    ]);

    logger.info('Connected to Redis. Initializing BullMQ queues and workers...');

    escalationQueue = new Queue('complaint-escalation', {
      connection: redisConnection,
    });

    escalationWorker = new Worker(
      'complaint-escalation',
      async (job) => {
        logger.info(`Processing BullMQ job: ${job.name}`);
        if (job.name === 'check-escalations') {
          return await EscalationService.runEscalationCheck();
        }
      },
      { connection: redisConnection }
    );

    // Schedule recurring job every 30 minutes in BullMQ
    await escalationQueue.add(
      'check-escalations',
      {},
      {
        repeat: {
          every: 30 * 60 * 1000, // 30 minutes
        },
        removeOnComplete: true,
      }
    );

    logger.info('BullMQ escalation worker active and recurring schedule established.');
  } catch (err: any) {
    logger.info(`Redis unavailable (${err.message}). Operating in in-memory fallback job scheduler.`);
    
    // In-memory fallback scheduler: run escalation check every 15 minutes, with initial run after 30 seconds
    setTimeout(() => {
      EscalationService.runEscalationCheck().catch((e) =>
        logger.error('In-memory escalation check failed:', e)
      );
    }, 30 * 1000);

    fallbackInterval = setInterval(() => {
      EscalationService.runEscalationCheck().catch((e) =>
        logger.error('In-memory recurring escalation check failed:', e)
      );
    }, 15 * 60 * 1000);
  }
};

export const stopBackgroundWorkers = async (): Promise<void> => {
  if (fallbackInterval) {
    clearInterval(fallbackInterval);
  }
  if (escalationWorker) {
    await escalationWorker.close();
  }
  if (escalationQueue) {
    await escalationQueue.close();
  }
  logger.info('Background job workers stopped.');
};
