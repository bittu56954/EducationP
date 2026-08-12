import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import {
  submitForm,
  getStudentForm,
  getAllForms,
  scheduleExamDate,
  createPaper,
  getPapers,
  getPaperByGrade,
  submitExam,
  getSubmissions,
  publishResult
} from '../Controllers/examController.js';

const router = express.Router();

// Form endpoints
router.post('/forms', protect, authorize('student'), submitForm);
router.get('/my-form', protect, authorize('student'), getStudentForm);
router.get('/forms', protect, authorize('teacher', 'admin'), getAllForms);
router.put('/forms/:id/schedule', protect, authorize('admin'), scheduleExamDate);

// Paper endpoints
router.post('/papers', protect, authorize('teacher', 'admin'), createPaper);
router.get('/papers', protect, authorize('teacher', 'admin'), getPapers);
router.get('/papers/:grade', protect, authorize('student'), getPaperByGrade);

// Exam attempt endpoints
router.post('/submit', protect, authorize('student'), submitExam);
router.get('/submissions', protect, authorize('teacher', 'admin'), getSubmissions);
router.put('/submissions/:id/publish', protect, authorize('admin'), publishResult);

export default router;
