import express from 'express';
import { createThread, getCourseThreads, postReply, deleteThread } from '../Controllers/forumController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.post('/', protect, createThread);
router.get('/course/:courseId', protect, getCourseThreads);
router.post('/:threadId/reply', protect, postReply);
router.delete('/:threadId', protect, deleteThread);

export default router;
