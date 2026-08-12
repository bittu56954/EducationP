import express from 'express';
import { createNote, getAllNotes, updateNote, deleteNote } from '../Controllers/noteController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/', getAllNotes);
router.post('/', protect, authorize('teacher', 'admin'), createNote);
router.put('/:id', protect, authorize('teacher', 'admin'), updateNote);
router.delete('/:id', protect, authorize('teacher', 'admin'), deleteNote);

export default router;
