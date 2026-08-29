import { Router, Request, Response } from 'express';
import authRoutes from './authRoutes';
import complaintRoutes from './complaintRoutes';
import departmentRoutes from './departmentRoutes';
import notificationRoutes from './notificationRoutes';
import analyticsRoutes from './analyticsRoutes';
import aiRoutes from './aiRoutes';
import userRoutes from './userRoutes';
import { EscalationService } from '../jobs/escalationQueue';
import { authenticate, authorize } from '../middlewares/auth';

const router = Router();

// Heartbeat & health check
router.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'healthy',
    service: 'CampusResolve API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// Manual trigger for escalation worker (admin only, useful for testing)
router.post('/jobs/trigger-escalation', authenticate, authorize('admin'), async (_req: Request, res: Response) => {
  const result = await EscalationService.runEscalationCheck();
  res.status(200).json({
    success: true,
    message: 'Manual escalation scanner executed.',
    data: result,
  });
});

// Mount resource routers
router.use('/auth', authRoutes);
router.use('/complaints', complaintRoutes);
router.use('/departments', departmentRoutes);
router.use('/notifications', notificationRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/ai', aiRoutes);
router.use('/users', userRoutes);

export default router;
