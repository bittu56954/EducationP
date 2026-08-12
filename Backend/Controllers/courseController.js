import { Course } from '../Model/Course.js';
import { Notification } from '../Model/Notification.js';

export async function getAllCourses(req, res) {
  try {
    const { search, category, level, teacherId } = req.query;
    let query = {};

    if (category && category !== 'all') {
      query.category = { $regex: new RegExp(`^${category}$`, 'i') };
    }

    if (level && level !== 'all') {
      query.level = { $regex: new RegExp(`^${level}$`, 'i') };
    }

    if (teacherId) {
      query.teacher = teacherId;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } },
      ];
    }

    const courses = await Course.find(query)
      .populate('teacher', 'name email profile.avatar profile.qualification')
      .lean();

    return res.status(200).json({ success: true, count: courses.length, courses });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch courses', error: error.message });
  }
}

export async function getCourseById(req, res) {
  try {
    const { id } = req.params;
    const course = await Course.findById(id)
      .populate('teacher', 'name email profile.avatar profile.qualification')
      .lean();

    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    return res.status(200).json({ success: true, course });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch course', error: error.message });
  }
}

export async function createCourse(req, res) {
  try {
    const { title, description, category = 'Web Development', price = 0, level = 'Beginner', thumbnail, image, duration = '8 Weeks' } = req.body;

    if (!title || !description) {
      return res.status(400).json({ success: false, message: 'Title and description are required' });
    }

    const newCourse = await Course.create({
      title,
      description,
      category,
      price: Number(price),
      level,
      duration,
      image: image || thumbnail || `https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&auto=format&fit=crop&q=60`,
      teacher: req.user._id,
    });

    await Notification.create({
      user: req.user._id,
      title: 'Course Created',
      message: `Your course "${title}" has been successfully published!`,
      type: 'info',
    });

    const populated = await Course.findById(newCourse._id).populate('teacher', 'name email profile.avatar profile.qualification');

    return res.status(201).json({ success: true, message: 'Course created successfully', course: populated });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to create course', error: error.message });
  }
}

export async function updateCourse(req, res) {
  try {
    const { id } = req.params;
    const course = await Course.findById(id);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    if (req.user.role !== 'admin' && course.teacher.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to edit this course' });
    }

    if (req.body.title) course.title = req.body.title;
    if (req.body.description) course.description = req.body.description;
    if (req.body.category) course.category = req.body.category;
    if (req.body.price !== undefined) course.price = Number(req.body.price);
    if (req.body.level) course.level = req.body.level;
    if (req.body.image || req.body.thumbnail) course.image = req.body.image || req.body.thumbnail;
    if (req.body.duration) course.duration = req.body.duration;

    await course.save();

    const populated = await Course.findById(course._id).populate('teacher', 'name email profile.avatar profile.qualification');

    return res.status(200).json({ success: true, message: 'Course updated successfully', course: populated });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to update course', error: error.message });
  }
}

export async function deleteCourse(req, res) {
  try {
    const { id } = req.params;
    const course = await Course.findById(id);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    if (req.user.role !== 'admin' && course.teacher.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this course' });
    }

    await Course.findByIdAndDelete(id);

    return res.status(200).json({ success: true, message: 'Course deleted successfully' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to delete course', error: error.message });
  }
}
