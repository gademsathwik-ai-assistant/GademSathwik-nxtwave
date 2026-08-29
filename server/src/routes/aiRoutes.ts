import { Router } from 'express';
import { AIController } from '../controllers/aiController';
import { authenticate } from '../middlewares/auth';

const router = Router();

// Optional AI endpoint
router.post('/categorize', authenticate, AIController.categorize);

export default router;
