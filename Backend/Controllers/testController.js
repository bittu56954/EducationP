import { OnlineTest } from '../Model/OnlineTest.js';
import { TestSubmission } from '../Model/TestSubmission.js';
import { Enrollment } from '../Model/Enrollment.js';

// Create a new weekly test (Teachers & Admins only)
export async function createTest(req, res) {
  try {
    const { title, subject, course, totalMarks, duration, scheduledAt, questions } = req.body;

    if (!title || !subject || !course || !totalMarks || !duration || !scheduledAt || !questions || questions.length === 0) {
      return res.status(400).json({ success: false, message: 'All fields and at least one question are required' });
    }

    const test = new OnlineTest({
      title,
      subject,
      course,
      teacher: req.user._id,
      totalMarks,
      duration,
      scheduledAt,
      questions
    });

    await test.save();
    return res.status(200).json({ success: true, message: 'Weekly test created and scheduled successfully', test });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to create test', error: error.message });
  }
}

// Update a test (Teachers & Admins only)
export async function updateTest(req, res) {
  try {
    const { id } = req.params;
    const { title, subject, totalMarks, duration, scheduledAt, questions } = req.body;

    const test = await OnlineTest.findById(id);
    if (!test) {
      return res.status(404).json({ success: false, message: 'Test not found' });
    }

    // Verify ownership
    if (test.teacher.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to modify this test' });
    }

    test.title = title || test.title;
    test.subject = subject || test.subject;
    test.totalMarks = totalMarks || test.totalMarks;
    test.duration = duration || test.duration;
    test.scheduledAt = scheduledAt || test.scheduledAt;
    test.questions = questions || test.questions;

    await test.save();
    return res.status(200).json({ success: true, message: 'Test updated successfully', test });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to update test', error: error.message });
  }
}

// Delete a test (Teachers & Admins only)
export async function deleteTest(req, res) {
  try {
    const { id } = req.params;
    const test = await OnlineTest.findById(id);
    if (!test) {
      return res.status(404).json({ success: false, message: 'Test not found' });
    }

    // Verify ownership
    if (test.teacher.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this test' });
    }

    await OnlineTest.findByIdAndDelete(id);
    // Also delete submissions associated with this test
    await TestSubmission.deleteMany({ test: id });

    return res.status(200).json({ success: true, message: 'Test and associated submissions deleted successfully' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to delete test', error: error.message });
  }
}

// Get all tests based on role
export async function getTests(req, res) {
  try {
    const { courseId } = req.query;
    let query = {};

    if (req.user.role === 'student') {
      // Find courses student is enrolled in
      const enrollments = await Enrollment.find({ student: req.user._id, status: 'active' });
      const enrolledCourseIds = enrollments.map(e => e.course.toString());

      if (courseId) {
        if (!enrolledCourseIds.includes(courseId)) {
          return res.status(200).json({ success: true, count: 0, tests: [] });
        }
        query.course = courseId;
      } else {
        query.course = { $in: enrolledCourseIds };
      }
    } else if (req.user.role === 'teacher') {
      if (courseId) {
        query.course = courseId;
      }
      query.teacher = req.user._id;
    } else if (courseId) {
      query.course = courseId;
    }

    const tests = await OnlineTest.find(query)
      .populate('course', 'title category')
      .populate('teacher', 'name email profile.avatar')
      .sort({ scheduledAt: -1 })
      .lean();

    // Annotate tests with submission status for students
    if (req.user.role === 'student') {
      const submissions = await TestSubmission.find({ student: req.user._id });
      const submissionMap = {};
      submissions.forEach(sub => {
        submissionMap[sub.test.toString()] = sub;
      });

      const annotatedTests = tests.map(test => {
        const attempt = submissionMap[test._id.toString()];
        return {
          ...test,
          isAttempted: !!attempt,
          submission: attempt ? {
            _id: attempt._id,
            obtainedMarks: attempt.obtainedMarks,
            totalMarks: attempt.totalMarks,
            percentage: attempt.percentage,
            submittedAt: attempt.submittedAt,
            durationSpent: attempt.durationSpent
          } : null
        };
      });

      return res.status(200).json({ success: true, count: annotatedTests.length, tests: annotatedTests });
    }

    return res.status(200).json({ success: true, count: tests.length, tests });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch tests', error: error.message });
  }
}

// Get test details by ID
export async function getTestById(req, res) {
  try {
    const { id } = req.params;
    const test = await OnlineTest.findById(id)
      .populate('course', 'title category')
      .populate('teacher', 'name email profile.avatar')
      .lean();

    if (!test) {
      return res.status(404).json({ success: false, message: 'Test not found' });
    }

    // Security check for students
    if (req.user.role === 'student') {
      const isEnrolled = await Enrollment.findOne({ student: req.user._id, course: test.course._id });
      if (!isEnrolled) {
        return res.status(403).json({ success: false, message: 'You do not have access to this test. Please enroll in the course first.' });
      }

      // Check if already attempted
      const attempt = await TestSubmission.findOne({ student: req.user._id, test: id }).lean();
      
      // If student has not attempted and the test hasn't started yet, hide questions or return error
      const isFutureTest = new Date(test.scheduledAt) > new Date();
      if (isFutureTest && !attempt) {
        return res.status(403).json({ 
          success: false, 
          message: `This weekly test is scheduled for ${new Date(test.scheduledAt).toLocaleString()}. You cannot access it yet.` 
        });
      }

      return res.status(200).json({
        success: true,
        test,
        isAttempted: !!attempt,
        submission: attempt
      });
    }

    return res.status(200).json({ success: true, test });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch test details', error: error.message });
  }
}

// Submit answers and auto-grade
export async function submitTest(req, res) {
  try {
    const { id } = req.params;
    const { answers, durationSpent } = req.body; // answers is an array of indices

    if (!answers || !Array.isArray(answers)) {
      return res.status(400).json({ success: false, message: 'Invalid format for answers' });
    }

    const test = await OnlineTest.findById(id);
    if (!test) {
      return res.status(404).json({ success: false, message: 'Test not found' });
    }

    // Check enrollment
    const isEnrolled = await Enrollment.findOne({ student: req.user._id, course: test.course });
    if (!isEnrolled) {
      return res.status(403).json({ success: false, message: 'Access denied: You are not enrolled in the associated course' });
    }

    // Check if already submitted
    const existingSubmission = await TestSubmission.findOne({ student: req.user._id, test: id });
    if (existingSubmission) {
      return res.status(400).json({ success: false, message: 'Test has already been attempted and graded' });
    }

    // Auto-grading calculations
    let obtainedMarks = 0;
    
    test.questions.forEach((q, idx) => {
      const selected = answers[idx];
      if (selected !== undefined && selected === q.correctOption) {
        obtainedMarks += (q.marks || 1);
      }
    });

    // Calculate percentage (keep 2 decimal points)
    const percentage = Math.round((obtainedMarks / test.totalMarks) * 10000) / 100;

    const submission = new TestSubmission({
      student: req.user._id,
      test: id,
      answers,
      obtainedMarks,
      totalMarks: test.totalMarks,
      percentage,
      durationSpent: durationSpent || 0
    });

    await submission.save();

    return res.status(200).json({
      success: true,
      message: 'Test answers evaluated and submitted successfully',
      submission
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to submit test', error: error.message });
  }
}

// Get student submissions for a specific test (Teachers see all, students see their own)
export async function getTestSubmissions(req, res) {
  try {
    const { id } = req.params;
    const test = await OnlineTest.findById(id);
    if (!test) {
      return res.status(404).json({ success: false, message: 'Test not found' });
    }

    let query = { test: id };

    if (req.user.role === 'student') {
      query.student = req.user._id;
    } else if (req.user.role === 'teacher') {
      if (test.teacher.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        return res.status(403).json({ success: false, message: 'Not authorized to view these submissions' });
      }
    }

    const submissions = await TestSubmission.find(query)
      .populate('student', 'name email profile.phone profile.avatar')
      .populate({
        path: 'test',
        select: 'title subject totalMarks duration scheduledAt'
      })
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({ success: true, count: submissions.length, submissions });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch submissions', error: error.message });
  }
}

// Get the logged in student's history of test results
export async function getMySubmissions(req, res) {
  try {
    const submissions = await TestSubmission.find({ student: req.user._id })
      .populate({
        path: 'test',
        select: 'title subject totalMarks duration scheduledAt course',
        populate: {
          path: 'course',
          select: 'title category'
        }
      })
      .sort({ submittedAt: -1 })
      .lean();

    return res.status(200).json({ success: true, count: submissions.length, submissions });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch test result history', error: error.message });
  }
}
