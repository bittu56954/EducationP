import { Thread } from '../Model/Thread.js';
import { Course } from '../Model/Course.js';

export async function createThread(req, res) {
  try {
    const { courseId, title, content } = req.body;

    if (!courseId || !title || !content) {
      return res.status(400).json({ success: false, message: 'Course ID, title, and content are required' });
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    const thread = await Thread.create({
      course: courseId,
      title,
      content,
      author: req.user._id,
      replies: [],
    });

    const populated = await Thread.findById(thread._id)
      .populate('author', 'name role profile.avatar')
      .populate('course', 'title');

    return res.status(201).json({
      success: true,
      message: 'Discussion thread created successfully',
      thread: populated,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to create discussion thread', error: error.message });
  }
}

export async function getCourseThreads(req, res) {
  try {
    const { courseId } = req.params;

    const threads = await Thread.find({ course: courseId })
      .populate('author', 'name role profile.avatar')
      .populate('replies.author', 'name role profile.avatar')
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({ success: true, count: threads.length, threads });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch discussion threads', error: error.message });
  }
}

export async function postReply(req, res) {
  try {
    const { threadId } = req.params;
    const { content } = req.body;

    if (!content) {
      return res.status(400).json({ success: false, message: 'Reply content cannot be empty' });
    }

    const thread = await Thread.findById(threadId);
    if (!thread) {
      return res.status(404).json({ success: false, message: 'Discussion thread not found' });
    }

    thread.replies.push({
      author: req.user._id,
      content,
    });

    await thread.save();

    const populated = await Thread.findById(threadId)
      .populate('author', 'name role profile.avatar')
      .populate('replies.author', 'name role profile.avatar')
      .lean();

    return res.status(201).json({
      success: true,
      message: 'Reply posted successfully',
      thread: populated,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to post reply', error: error.message });
  }
}

export async function deleteThread(req, res) {
  try {
    const { threadId } = req.params;
    const thread = await Thread.findById(threadId);

    if (!thread) {
      return res.status(404).json({ success: false, message: 'Discussion thread not found' });
    }

    if (req.user.role !== 'admin' && thread.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this thread' });
    }

    await Thread.findByIdAndDelete(threadId);

    return res.status(200).json({ success: true, message: 'Discussion thread deleted successfully' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to delete discussion thread', error: error.message });
  }
}
