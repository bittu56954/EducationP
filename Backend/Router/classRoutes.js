import express from 'express';
import { scheduleClass, getAllClasses, getMyClasses, updateClass, deleteClass } from '../Controllers/classController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/', getAllClasses);
router.post('/', protect, authorize('teacher', 'admin'), scheduleClass);
router.get('/my-classes', protect, getMyClasses);
router.put('/:id', protect, authorize('teacher', 'admin'), updateClass);
router.delete('/:id', protect, authorize('teacher', 'admin'), deleteClass);

export default router;
