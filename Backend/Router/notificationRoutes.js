import express from 'express';
import { getUserNotifications, markNotificationAsRead, markAllNotificationsAsRead } from '../Controllers/notificationController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.get('/', protect, getUserNotifications);
router.put('/read-all', protect, markAllNotificationsAsRead);
router.put('/:id/read', protect, markNotificationAsRead);

export default router;
