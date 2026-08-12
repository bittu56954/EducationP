import { Note } from '../Model/Note.js';
import { Course } from '../Model/Course.js';

export async function createNote(req, res) {
  try {
    const { title, description, fileUrl, subject, courseId, classId } = req.body;

    if (!title || !fileUrl) {
      return res.status(400).json({ success: false, message: 'Note title and document link are required' });
    }

    const note = await Note.create({
      title,
      description: description || '',
      fileUrl,
      subject: subject || 'General',
      course: courseId || null,
      class: classId || null,
      teacher: req.user._id,
    });

    const populated = await Note.findById(note._id)
      .populate('course', 'title category')
      .populate('teacher', 'name profile.avatar');

    return res.status(201).json({
      success: true,
      message: 'Class note added successfully',
      note: populated,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to create note', error: error.message });
  }
}

export async function getAllNotes(req, res) {
  try {
    const { courseId, teacherId } = req.query;
    let query = {};

    if (courseId) query.course = courseId;
    if (teacherId) query.teacher = teacherId;

    const notes = await Note.find(query)
      .populate('course', 'title category')
      .populate('teacher', 'name profile.avatar')
      .sort({ createdAt: -1 })
      .lean();

    const formatted = notes.map((n) => ({
      ...n,
      courseTitle: n.course ? n.course.title : 'General Subject Notes',
      teacherName: n.teacher ? n.teacher.name : 'Faculty Instructor',
    }));

    return res.status(200).json({ success: true, count: formatted.length, notes: formatted });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch notes', error: error.message });
  }
}

export async function updateNote(req, res) {
  try {
    const { id } = req.params;
    const note = await Note.findById(id);

    if (!note) {
      return res.status(404).json({ success: false, message: 'Note not found' });
    }

    if (req.user.role !== 'admin' && note.teacher.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to modify this note' });
    }

    if (req.body.title) note.title = req.body.title;
    if (req.body.description !== undefined) note.description = req.body.description;
    if (req.body.fileUrl) note.fileUrl = req.body.fileUrl;
    if (req.body.subject) note.subject = req.body.subject;
    if (req.body.courseId !== undefined) note.course = req.body.courseId || null;

    await note.save();

    const populated = await Note.findById(note._id)
      .populate('course', 'title category')
      .populate('teacher', 'name profile.avatar');

    return res.status(200).json({ success: true, message: 'Note updated successfully', note: populated });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to update note', error: error.message });
  }
}

export async function deleteNote(req, res) {
  try {
    const { id } = req.params;
    const note = await Note.findById(id);

    if (!note) {
      return res.status(404).json({ success: false, message: 'Note not found' });
    }

    if (req.user.role !== 'admin' && note.teacher.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this note' });
    }

    await Note.findByIdAndDelete(id);

    return res.status(200).json({ success: true, message: 'Note deleted successfully' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to delete note', error: error.message });
  }
}
