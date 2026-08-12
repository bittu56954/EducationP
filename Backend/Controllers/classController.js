import { Class } from '../Model/Class.js';
import { Course } from '../Model/Course.js';
import { Enrollment } from '../Model/Enrollment.js';
import { Notification } from '../Model/Notification.js';

export async function scheduleClass(req, res) {
  try {
    const { title, description, courseId, meetingLink, joinUrl, platform = 'Google Meet', scheduledAt, startTime, durationMinutes = 60 } = req.body;

    const classLink = joinUrl || meetingLink;
    const time = startTime || scheduledAt;

    if (!title || !time) {
      return res.status(400).json({ success: false, message: 'Title and scheduled date/time are required' });
    }

    let course = null;
    if (courseId) {
      course = await Course.findById(courseId);
      if (!course) {
        return res.status(404).json({ success: false, message: 'Selected course not found' });
      }
    }

    const newClass = await Class.create({
      title,
      description: description || '',
      subject: req.body.subject || 'General',
      platform: platform || 'Google Meet',
      course: courseId || null,
      teacher: req.user._id,
      joinUrl: classLink || 'https://meet.google.com/abc-defg-hij',
      startTime: new Date(time),
      durationMinutes: Number(durationMinutes),
      status: 'upcoming',
    });

    if (courseId) {
      const enrollments = await Enrollment.find({ course: courseId });
      for (const e of enrollments) {
        await Notification.create({
          user: e.student,
          title: 'New Live Class Scheduled 📹',
          message: `A live class "${title}" for course "${course.title}" has been scheduled.`,
          type: 'class_scheduled',
        });
      }
    }

    const populated = await Class.findById(newClass._id)
      .populate('course', 'title category')
      .populate('teacher', 'name profile.avatar');

    return res.status(201).json({ success: true, message: 'Online class scheduled successfully', onlineClass: populated });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to schedule class', error: error.message });
  }
}

export async function getAllClasses(req, res) {
  try {
    const { status, teacherId, courseId } = req.query;
    let query = {};

    if (status && status !== 'all') {
      query.status = status;
    }

    if (teacherId) {
      query.teacher = teacherId;
    }

    if (courseId) {
      query.course = courseId;
    }

    const classes = await Class.find(query)
      .populate('course', 'title category')
      .populate('teacher', 'name profile.avatar')
      .lean();

    const formatted = classes.map((c) => ({
      ...c,
      courseTitle: c.course ? c.course.title : 'General Session',
      courseCategory: c.course ? c.course.category : 'General',
      teacherName: c.teacher ? c.teacher.name : 'Instructor',
      teacherAvatar: c.teacher?.profile?.avatar || '',
      meetingLink: c.joinUrl,
      scheduledAt: c.startTime,
    }));

    return res.status(200).json({ success: true, count: formatted.length, classes: formatted });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch classes', error: error.message });
  }
}

export async function getMyClasses(req, res) {
  try {
    let classes = [];

    if (req.user.role === 'teacher') {
      classes = await Class.find({ teacher: req.user._id })
        .populate('course', 'title category')
        .populate('teacher', 'name profile.avatar')
        .lean();
    } else if (req.user.role === 'student') {
      const enrollments = await Enrollment.find({ student: req.user._id });
      const courseIds = enrollments.map((e) => e.course);

      classes = await Class.find({
        $or: [{ course: { $in: courseIds } }, { course: null }],
      })
        .populate('course', 'title category')
        .populate('teacher', 'name profile.avatar')
        .lean();
    } else {
      classes = await Class.find()
        .populate('course', 'title category')
        .populate('teacher', 'name profile.avatar')
        .lean();
    }

    const formatted = classes.map((c) => ({
      ...c,
      courseTitle: c.course ? c.course.title : 'General Session',
      courseCategory: c.course ? c.course.category : 'General',
      teacherName: c.teacher ? c.teacher.name : 'Instructor',
      teacherAvatar: c.teacher?.profile?.avatar || '',
      meetingLink: c.joinUrl,
      scheduledAt: c.startTime,
    }));

    return res.status(200).json({ success: true, count: formatted.length, classes: formatted });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch my classes', error: error.message });
  }
}

export async function updateClass(req, res) {
  try {
    const { id } = req.params;
    const cls = await Class.findById(id);
    if (!cls) {
      return res.status(404).json({ success: false, message: 'Class not found' });
    }

    if (req.user.role !== 'admin' && cls.teacher.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to modify this class' });
    }

    if (req.body.title) cls.title = req.body.title;
    if (req.body.subject) cls.subject = req.body.subject;
    if (req.body.platform) cls.platform = req.body.platform;
    if (req.body.description !== undefined) cls.description = req.body.description;
    if (req.body.joinUrl || req.body.meetingLink) cls.joinUrl = req.body.joinUrl || req.body.meetingLink;
    if (req.body.startTime || req.body.scheduledAt) cls.startTime = new Date(req.body.startTime || req.body.scheduledAt);
    if (req.body.durationMinutes !== undefined) cls.durationMinutes = Number(req.body.durationMinutes);
    if (req.body.status) cls.status = req.body.status;

    await cls.save();

    const populated = await Class.findById(cls._id)
      .populate('course', 'title category')
      .populate('teacher', 'name profile.avatar');

    return res.status(200).json({ success: true, message: 'Class updated successfully', onlineClass: populated });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to update class', error: error.message });
  }
}

export async function deleteClass(req, res) {
  try {
    const { id } = req.params;
    const cls = await Class.findById(id);
    if (!cls) {
      return res.status(404).json({ success: false, message: 'Class not found' });
    }

    if (req.user.role !== 'admin' && cls.teacher.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this class' });
    }

    await Class.findByIdAndDelete(id);

    return res.status(200).json({ success: true, message: 'Class deleted successfully' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to delete class', error: error.message });
  }
}
