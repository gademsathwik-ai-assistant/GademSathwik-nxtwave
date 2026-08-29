import mongoose from 'mongoose';
import { config } from './env';
import { logger } from '../utils/logger';

let mongoMemoryServer: any = null;

export const connectDatabase = async (): Promise<void> => {
  try {
    mongoose.set('strictQuery', false);
    
    // Attempt standard connection first with 3s timeout
    logger.info(`Attempting to connect to MongoDB at: ${config.mongoUri}`);
    await mongoose.connect(config.mongoUri, {
      serverSelectionTimeoutMS: 3000,
    });
    logger.info('Connected to MongoDB successfully.');
  } catch (err: any) {
    logger.warn(`Could not connect to external MongoDB: ${err.message}`);
    logger.info('Initializing in-memory MongoDB fallback (mongodb-memory-server)...');
    
    try {
      const { MongoMemoryServer } = await import('mongodb-memory-server');
      mongoMemoryServer = await MongoMemoryServer.create();
      const inMemoryUri = mongoMemoryServer.getUri();
      
      await mongoose.connect(inMemoryUri);
      logger.info(`Connected to In-Memory MongoDB successfully at: ${inMemoryUri}`);
    } catch (fallbackError: any) {
      logger.error('Failed to launch In-Memory MongoDB fallback:', fallbackError);
      throw fallbackError;
    }
  }
};

export const disconnectDatabase = async (): Promise<void> => {
  try {
    await mongoose.disconnect();
    if (mongoMemoryServer) {
      await mongoMemoryServer.stop();
      logger.info('In-Memory MongoDB server stopped.');
    }
  } catch (err) {
    logger.error('Error during database disconnect:', err);
  }
};
