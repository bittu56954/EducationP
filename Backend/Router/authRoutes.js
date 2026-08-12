import express from 'express';
import { registerUser, loginUser, adminRegisterUser, adminLoginUser, getMe, updateProfile } from '../Controllers/authController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/admin/register', adminRegisterUser);
router.post('/admin/login', adminLoginUser);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);

export default router;

