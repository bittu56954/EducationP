import express from 'express';
import { enrollInCourse, getMyEnrolledCourses, getCourseEnrolledStudents, getAllEnrollments, updateEnrollmentReceiptStatus } from '../Controllers/enrollmentController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.post('/', protect, enrollInCourse);
router.get('/my-courses', protect, getMyEnrolledCourses);
router.get('/course/:courseId', protect, authorize('teacher', 'admin'), getCourseEnrolledStudents);
router.get('/all', protect, authorize('admin', 'teacher'), getAllEnrollments);
router.patch('/:id/receipt', protect, authorize('admin', 'teacher'), updateEnrollmentReceiptStatus);
router.put('/:id/receipt', protect, authorize('admin', 'teacher'), updateEnrollmentReceiptStatus);
router.patch('/:id/receipt-status', protect, authorize('admin', 'teacher'), updateEnrollmentReceiptStatus);
router.put('/:id/receipt-status', protect, authorize('admin', 'teacher'), updateEnrollmentReceiptStatus);

export default router;
