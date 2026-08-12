import express from 'express';
import { sendMessage, getChatHistory, getConversations, getOnlineTeachers, getEnrolledStudents } from '../Controllers/messageController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.post('/send', protect, sendMessage);
router.get('/history/:userId', protect, getChatHistory);
router.get('/conversations', protect, getConversations);
router.get('/online-teachers', protect, getOnlineTeachers);
router.get('/students', protect, getEnrolledStudents);

export default router;
