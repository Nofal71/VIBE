import { Router } from 'express';
import { AnalyticsController } from '../controllers/AnalyticsController';

const router = Router();

router.get('/dashboard', AnalyticsController.getDashboardStats);

export default router;
