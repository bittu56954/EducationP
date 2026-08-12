import { Doubt } from '../Model/Doubt.js';
import { User } from '../Model/User.js';
import { Notification } from '../Model/Notification.js';

// Student asks a doubt (linked to a live class or general course)
export async function askDoubt(req, res) {
  try {
    const { teacherId, classId, courseId, question } = req.body;
    if (!teacherId || !question || !question.trim()) {
      return res.status(400).json({ success: false, message: 'Teacher ID and question content are required' });
    }

    const teacher = await User.findById(teacherId);
    if (!teacher || teacher.role !== 'teacher') {
      return res.status(404).json({ success: false, message: 'Teacher not found' });
    }

    const doubt = await Doubt.create({
      student: req.user._id,
      teacher: teacherId,
      classId: classId || null,
      courseId: courseId || null,
      question: question.trim(),
    });

    // Create notification for teacher
    await Notification.create({
      user: teacherId,
      title: `New doubt from ${req.user.name}`,
      message: question.length > 50 ? `${question.substring(0, 47)}...` : question,
      type: 'doubt',
    });

    return res.status(200).json({ success: true, doubt });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to post doubt', error: error.message });
  }
}

// Get doubts for a specific live class or course
export async function getClassDoubts(req, res) {
  try {
    const { classId } = req.params;
    const { courseId } = req.query;

    const query = {};
    if (classId && classId !== 'undefined' && classId !== 'null') {
      query.classId = classId;
    } else if (courseId) {
      query.courseId = courseId;
    } else {
      return res.status(400).json({ success: false, message: 'Class ID or Course ID is required' });
    }

    const doubts = await Doubt.find(query)
      .populate('student', 'name email profile')
      .populate('teacher', 'name email profile')
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({ success: true, count: doubts.length, doubts });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch doubts', error: error.message });
  }
}

// Teacher replies to a student doubt
export async function replyToDoubt(req, res) {
  try {
    const { doubtId } = req.params;
    const { answer } = req.body;

    if (!answer || !answer.trim()) {
      return res.status(400).json({ success: false, message: 'Answer content is required' });
    }

    const doubt = await Doubt.findById(doubtId);
    if (!doubt) {
      return res.status(404).json({ success: false, message: 'Doubt not found' });
    }

    // Verify authorized teacher
    if (doubt.teacher.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to reply to this doubt' });
    }

    doubt.answer = answer.trim();
    doubt.isResolved = true;
    await doubt.save();

    // Create notification for the student
    await Notification.create({
      user: doubt.student,
      title: `Your doubt was answered by ${req.user.name}`,
      message: answer.length > 50 ? `${answer.substring(0, 47)}...` : answer,
      type: 'doubt_reply',
    });

    return res.status(200).json({ success: true, doubt });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to reply to doubt', error: error.message });
  }
}
