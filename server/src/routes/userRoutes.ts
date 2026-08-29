import { Router } from 'express';
import { UserController } from '../controllers/userController';
import { authenticate } from '../middlewares/auth';

const router = Router();

router.use(authenticate);
router.get('/', UserController.list);

export default router;
