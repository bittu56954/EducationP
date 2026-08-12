import express from 'express';
import { createAssignment, getCourseAssignments, submitAssignment, getAssignmentSubmissions, gradeSubmission } from '../Controllers/assignmentController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.post('/assignments', protect, authorize('teacher', 'admin'), createAssignment);
router.get('/assignments/course/:courseId', protect, getCourseAssignments);
router.post('/assignments/:id/submit', protect, authorize('student'), submitAssignment);
router.get('/assignments/:id/submissions', protect, authorize('teacher', 'admin'), getAssignmentSubmissions);
router.put('/submissions/:id/grade', protect, authorize('teacher', 'admin'), gradeSubmission);

export default router;
