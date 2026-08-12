import { Assignment } from '../Model/Assignment.js';
import { Submission } from '../Model/Submission.js';
import { Course } from '../Model/Course.js';
import { Enrollment } from '../Model/Enrollment.js';
import { Notification } from '../Model/Notification.js';

export async function createAssignment(req, res) {
  try {
    const { title, description, courseId, dueDate, maxPoints = 100, fileUrl } = req.body;

    if (!title || !courseId || !dueDate) {
      return res.status(400).json({ success: false, message: 'Assignment title, course ID, and due date are required' });
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    if (req.user.role !== 'admin' && course.teacher.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to create assignments for this course' });
    }

    const assignment = await Assignment.create({
      title,
      description: description || '',
      course: courseId,
      teacher: req.user._id,
      dueDate: new Date(dueDate),
      maxPoints: Number(maxPoints),
      fileUrl: fileUrl || '',
    });

    // Notify all enrolled students
    const enrollments = await Enrollment.find({ course: courseId });
    for (const e of enrollments) {
      await Notification.create({
        user: e.student,
        title: 'New Assignment Posted 📝',
        message: `An assignment "${title}" has been posted for "${course.title}". Due date: ${new Date(dueDate).toLocaleDateString()}.`,
        type: 'info',
      });
    }

    return res.status(201).json({
      success: true,
      message: 'Assignment created successfully',
      assignment,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to create assignment', error: error.message });
  }
}

export async function getCourseAssignments(req, res) {
  try {
    const { courseId } = req.params;

    const assignments = await Assignment.find({ course: courseId })
      .sort({ dueDate: 1 })
      .lean();

    return res.status(200).json({ success: true, count: assignments.length, assignments });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch course assignments', error: error.message });
  }
}

export async function submitAssignment(req, res) {
  try {
    const { id } = req.params; // assignment ID
    const { fileUrl, studentComments } = req.body;

    if (!fileUrl) {
      return res.status(400).json({ success: false, message: 'Submission document link/URL is required' });
    }

    const assignment = await Assignment.findById(id).populate('course', 'title');
    if (!assignment) {
      return res.status(404).json({ success: false, message: 'Assignment not found' });
    }

    // Check enrollment
    const enrolled = await Enrollment.findOne({ student: req.user._id, course: assignment.course._id });
    if (!enrolled) {
      return res.status(403).json({ success: false, message: 'You must be enrolled in this course to submit assignments' });
    }

    // Check if already submitted
    const existing = await Submission.findOne({ student: req.user._id, assignment: id });
    if (existing) {
      return res.status(400).json({ success: false, message: 'You have already submitted this assignment' });
    }

    const submission = await Submission.create({
      assignment: id,
      student: req.user._id,
      fileUrl,
      studentComments: studentComments || '',
      submittedAt: new Date(),
    });

    // Notify Teacher
    await Notification.create({
      user: assignment.teacher,
      title: 'Assignment Submitted 📥',
      message: `${req.user.name} submitted their work for assignment "${assignment.title}".`,
      type: 'info',
    });

    return res.status(201).json({
      success: true,
      message: 'Assignment submitted successfully',
      submission,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to submit assignment', error: error.message });
  }
}

export async function getAssignmentSubmissions(req, res) {
  try {
    const { id } = req.params; // assignment ID

    const assignment = await Assignment.findById(id);
    if (!assignment) {
      return res.status(404).json({ success: false, message: 'Assignment not found' });
    }

    if (req.user.role !== 'admin' && assignment.teacher.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to view these submissions' });
    }

    const submissions = await Submission.find({ assignment: id })
      .populate('student', 'name email profile.avatar')
      .sort({ submittedAt: -1 })
      .lean();

    return res.status(200).json({ success: true, count: submissions.length, submissions });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch submissions', error: error.message });
  }
}

export async function gradeSubmission(req, res) {
  try {
    const { id } = req.params; // submission ID
    const { grade, feedback } = req.body;

    if (grade === undefined) {
      return res.status(400).json({ success: false, message: 'Grade score is required' });
    }

    const submission = await Submission.findById(id).populate('assignment');
    if (!submission) {
      return res.status(404).json({ success: false, message: 'Submission not found' });
    }

    if (req.user.role !== 'admin' && submission.assignment.teacher.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to grade this submission' });
    }

    submission.grade = Number(grade);
    submission.feedback = feedback || '';
    submission.status = 'graded';

    await submission.save();

    // Notify Student
    await Notification.create({
      user: submission.student,
      title: 'Assignment Graded 🎯',
      message: `Your submission for "${submission.assignment.title}" has been graded: ${grade}/${submission.assignment.maxPoints} points.`,
      type: 'info',
    });

    return res.status(200).json({
      success: true,
      message: 'Submission graded successfully',
      submission,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to grade submission', error: error.message });
  }
}
