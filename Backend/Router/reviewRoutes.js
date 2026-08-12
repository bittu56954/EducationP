import express from 'express';
import { submitReview, getCourseReviews, deleteReview } from '../Controllers/reviewController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.post('/courses/:courseId/reviews', protect, submitReview);
router.get('/courses/:courseId/reviews', getCourseReviews);
router.delete('/reviews/:id', protect, deleteReview);

export default router;
