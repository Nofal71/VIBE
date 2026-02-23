import { Router } from 'express';
import { UserController } from '../controllers/UserController';
import { requireAuth } from '../middlewares/authMiddleware';

const router = Router();

router.use(requireAuth);

router.get('/', UserController.getUsers);
router.post('/', UserController.createUser);

export default router;
