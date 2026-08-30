import { Router } from 'express';
import { body } from 'express-validator';
import rateLimit from 'express-rate-limit';
import { AuthController } from '../controllers/authController';
import { authenticate } from '../middlewares/auth';
import { validateRequest } from '../middlewares/validate';

const router = Router();

// Rate limiter for auth endpoints: 50 requests per 15 minutes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  message: {
    success: false,
    message: 'Too many authentication attempts. Please try again in 15 minutes.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

router.post(
  '/register',
  authLimiter,
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters long'),
    body('role')
      .optional()
      .isIn(['student', 'admin', 'staff'])
      .withMessage('Invalid role'),
  ],
  validateRequest,
  AuthController.register
);

router.post(
  '/login',
  authLimiter,
  [
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  validateRequest,
  AuthController.login
);

router.get('/me', authenticate, AuthController.getMe);

export default router;
// Reset password route
router.post(
  '/reset',
  [
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('newPassword')
      .isLength({ min: 6 })
      .withMessage('New password must be at least 6 characters long'),
  ],
  validateRequest,
  async (req, res) => {
    const { email, newPassword } = req.body;
    try {
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      user.password = newPassword; // ⚠️ hash if needed
      await user.save();
      res.json({ message: 'Password reset successful' });
    } catch (err) {
      res.status(400).json({ message: 'Password reset failed', error: err.message });
    }
  }
);
