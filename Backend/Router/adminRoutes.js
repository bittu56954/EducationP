import express from 'express';
import { getAdminDashboardStats } from '../Controllers/adminController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/stats', protect, authorize('teacher', 'admin'), getAdminDashboardStats);

export default router;
