import { Router } from 'express';
import { body } from 'express-validator';
import { DepartmentController } from '../controllers/departmentController';
import { authenticate, authorize } from '../middlewares/auth';
import { validateRequest } from '../middlewares/validate';

const router = Router();

// Public / Authenticated read
router.get('/', DepartmentController.list);

// Admin-only creation & modification
router.post(
  '/',
  authenticate,
  authorize('admin'),
  [
    body('name').trim().notEmpty().withMessage('Department name is required'),
    body('code').trim().notEmpty().withMessage('Department code is required'),
    body('contactEmail').isEmail().normalizeEmail().withMessage('Valid email is required'),
  ],
  validateRequest,
  DepartmentController.create
);

router.put(
  '/:id/staff',
  authenticate,
  authorize('admin'),
  DepartmentController.updateStaff
);

export default router;
