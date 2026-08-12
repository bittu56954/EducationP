import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import {
  createTest,
  updateTest,
  deleteTest,
  getTests,
  getTestById,
  submitTest,
  getTestSubmissions,
  getMySubmissions
} from '../Controllers/testController.js';

const router = express.Router();

// Get tests or create a test
router.route('/')
  .post(protect, authorize('teacher', 'admin'), createTest)
  .get(protect, getTests);

// Get student's own attempts history
router.route('/my-submissions')
  .get(protect, authorize('student'), getMySubmissions);

// Single test actions
router.route('/:id')
  .get(protect, getTestById)
  .put(protect, authorize('teacher', 'admin'), updateTest)
  .delete(protect, authorize('teacher', 'admin'), deleteTest);

// Student submits test answers
router.route('/:id/submit')
  .post(protect, authorize('student'), submitTest);

// Get submissions list for a specific test
router.route('/:id/submissions')
  .get(protect, getTestSubmissions);

export default router;
