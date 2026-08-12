import express from 'express';
import { getAllUsers, toggleUserStatus, updateUser, deleteUser } from '../Controllers/userController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Users & Teachers management (Teacher and Admin)
router.get('/users', protect, authorize('teacher', 'admin'), getAllUsers);
router.put('/users/:id/status', protect, authorize('teacher', 'admin'), toggleUserStatus);
router.put('/users/:id', protect, authorize('teacher', 'admin'), updateUser);
router.delete('/users/:id', protect, authorize('teacher', 'admin'), deleteUser);

export default router;
