import express from 'express';
import { askDoubt, getClassDoubts, replyToDoubt } from '../Controllers/doubtController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.post('/ask', protect, askDoubt);
router.get('/class/:classId', protect, getClassDoubts);
router.put('/:doubtId/reply', protect, replyToDoubt);

export default router;
