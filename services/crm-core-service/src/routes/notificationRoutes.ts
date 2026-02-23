import { Router } from 'express';
import { NotificationController } from '../controllers/NotificationController';

const router = Router();

router.get('/unread', NotificationController.getUnreadNotifications);
router.put('/:id/read', NotificationController.markAsRead);
router.put('/mark-all-read', NotificationController.markAllAsRead);

export default router;
