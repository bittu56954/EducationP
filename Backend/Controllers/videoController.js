import { Video } from '../Model/Video.js';

export async function createVideo(req, res) {
  try {
    const { title, description, videoUrl, duration, thumbnail, subject, courseId, classId } = req.body;

    if (!title || !videoUrl) {
      return res.status(400).json({ success: false, message: 'Video title and video URL are required' });
    }

    const video = await Video.create({
      title,
      description: description || '',
      videoUrl,
      duration: duration || '1h 00m',
      thumbnail: thumbnail || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&auto=format&fit=crop&q=80',
      subject: subject || 'General',
      course: courseId || null,
      class: classId || null,
      teacher: req.user._id,
    });

    const populated = await Video.findById(video._id)
      .populate('course', 'title category')
      .populate('teacher', 'name profile.avatar');

    return res.status(201).json({
      success: true,
      message: 'Recorded class video uploaded successfully',
      video: populated,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to create video record', error: error.message });
  }
}

export async function getAllVideos(req, res) {
  try {
    const { courseId, teacherId } = req.query;
    let query = {};

    if (courseId) query.course = courseId;
    if (teacherId) query.teacher = teacherId;

    const videos = await Video.find(query)
      .populate('course', 'title category')
      .populate('teacher', 'name profile.avatar')
      .sort({ createdAt: -1 })
      .lean();

    const formatted = videos.map((v) => ({
      ...v,
      courseTitle: v.course ? v.course.title : 'General Lecture',
      teacherName: v.teacher ? v.teacher.name : 'Faculty Instructor',
    }));

    return res.status(200).json({ success: true, count: formatted.length, videos: formatted });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch recorded videos', error: error.message });
  }
}

export async function updateVideo(req, res) {
  try {
    const { id } = req.params;
    const video = await Video.findById(id);

    if (!video) {
      return res.status(404).json({ success: false, message: 'Video not found' });
    }

    if (req.user.role !== 'admin' && video.teacher.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to modify this video' });
    }

    if (req.body.title) video.title = req.body.title;
    if (req.body.description !== undefined) video.description = req.body.description;
    if (req.body.videoUrl) video.videoUrl = req.body.videoUrl;
    if (req.body.duration) video.duration = req.body.duration;
    if (req.body.thumbnail) video.thumbnail = req.body.thumbnail;
    if (req.body.subject) video.subject = req.body.subject;
    if (req.body.courseId !== undefined) video.course = req.body.courseId || null;

    await video.save();

    const populated = await Video.findById(video._id)
      .populate('course', 'title category')
      .populate('teacher', 'name profile.avatar');

    return res.status(200).json({ success: true, message: 'Video updated successfully', video: populated });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to update video', error: error.message });
  }
}

export async function deleteVideo(req, res) {
  try {
    const { id } = req.params;
    const video = await Video.findById(id);

    if (!video) {
      return res.status(404).json({ success: false, message: 'Video not found' });
    }

    if (req.user.role !== 'admin' && video.teacher.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this video' });
    }

    await Video.findByIdAndDelete(id);

    return res.status(200).json({ success: true, message: 'Video deleted successfully' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to delete video', error: error.message });
  }
}
