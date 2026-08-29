import { Router } from 'express';
import { body } from 'express-validator';
import { ComplaintController } from '../controllers/complaintController';
import { authenticate, authorize } from '../middlewares/auth';
import { validateRequest } from '../middlewares/validate';
import { upload } from '../middlewares/upload';

const router = Router();

// All complaint routes require authentication
router.use(authenticate);

router.get('/', ComplaintController.list);

router.post(
  '/',
  upload.array('attachments', 5),
  [
    body('title').trim().notEmpty().withMessage('Title is required').isLength({ max: 200 }),
    body('description').trim().notEmpty().withMessage('Description is required'),
    body('category')
      .notEmpty()
      .isIn([
        'Hostel',
        'Academic',
        'Infrastructure',
        'Mess/Canteen',
        'Library',
        'Transport',
        'IT/Wi-Fi',
        'Sports',
        'Other',
      ])
      .withMessage('Invalid category'),
    body('location').trim().notEmpty().withMessage('Location is required'),
    body('priority')
      .optional()
      .isIn(['low', 'medium', 'high', 'urgent'])
      .withMessage('Invalid priority level'),
  ],
  validateRequest,
  ComplaintController.create
);

router.get('/:id', ComplaintController.getById);

router.post(
  '/:id/assign',
  authorize('admin', 'staff'),
  [body('departmentId').notEmpty().withMessage('Department ID is required')],
  validateRequest,
  ComplaintController.assign
);

router.post(
  '/:id/status',
  authorize('admin', 'staff'),
  [
    body('status')
      .isIn([
        'Submitted',
        'Under Review',
        'Assigned',
        'In Progress',
        'Resolved',
        'Closed',
      ])
      .withMessage('Invalid status value'),
  ],
  validateRequest,
  ComplaintController.updateStatus
);

router.post(
  '/:id/comments',
  [body('message').trim().notEmpty().withMessage('Comment message is required')],
  validateRequest,
  ComplaintController.addComment
);

router.post(
  '/:id/feedback',
  [
    body('rating')
      .isInt({ min: 1, max: 5 })
      .withMessage('Rating must be an integer between 1 and 5'),
  ],
  validateRequest,
  ComplaintController.submitFeedback
);

router.delete('/:id', authorize('admin'), ComplaintController.delete);

export default router;
