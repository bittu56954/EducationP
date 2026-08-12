import express from 'express';
import { createVideo, getAllVideos, updateVideo, deleteVideo } from '../Controllers/videoController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/', getAllVideos);
router.post('/', protect, authorize('teacher', 'admin'), createVideo);
router.put('/:id', protect, authorize('teacher', 'admin'), updateVideo);
router.delete('/:id', protect, authorize('teacher', 'admin'), deleteVideo);

export default router;
