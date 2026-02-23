import { Router } from 'express';
import { DealController } from '../controllers/DealController';

const router = Router();

router.post('/:id/transition', DealController.requestStateTransition);

export default router;
