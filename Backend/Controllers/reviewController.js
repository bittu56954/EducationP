import { Review } from '../Model/Review.js';
import { Course } from '../Model/Course.js';

// Calculate and update course rating
async function updateCourseRating(courseId) {
  try {
    const reviews = await Review.find({ course: courseId });
    if (reviews.length === 0) {
      await Course.findByIdAndUpdate(courseId, { rating: 4.8 }); // default fallback
      return;
    }
    const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
    const avg = Number((sum / reviews.length).toFixed(1));
    await Course.findByIdAndUpdate(courseId, { rating: avg });
  } catch (error) {
    console.error('Error updating course rating:', error.message);
  }
}

export async function submitReview(req, res) {
  try {
    const { courseId } = req.params;
    const { rating, comment } = req.body;

    if (!rating) {
      return res.status(400).json({ success: false, message: 'Rating is required' });
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    // Check if review already exists
    const existing = await Review.findOne({ student: req.user._id, course: courseId });
    if (existing) {
      return res.status(400).json({ success: false, message: 'You have already reviewed this course' });
    }

    const review = await Review.create({
      student: req.user._id,
      course: courseId,
      rating: Number(rating),
      comment: comment || '',
    });

    await updateCourseRating(courseId);

    const populated = await Review.findById(review._id).populate('student', 'name profile.avatar');

    return res.status(201).json({
      success: true,
      message: 'Review submitted successfully',
      review: populated,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to submit review', error: error.message });
  }
}

export async function getCourseReviews(req, res) {
  try {
    const { courseId } = req.params;
    const reviews = await Review.find({ course: courseId })
      .populate('student', 'name profile.avatar')
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({ success: true, count: reviews.length, reviews });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch reviews', error: error.message });
  }
}

export async function deleteReview(req, res) {
  try {
    const { id } = req.params;
    const review = await Review.findById(id);

    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    if (req.user.role !== 'admin' && review.student.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this review' });
    }

    await Review.findByIdAndDelete(id);
    await updateCourseRating(review.course);

    return res.status(200).json({ success: true, message: 'Review deleted successfully' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to delete review', error: error.message });
  }
}
