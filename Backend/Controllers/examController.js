import { ExamForm } from '../Model/ExamForm.js';
import { ExamPaper } from '../Model/ExamPaper.js';
import { ExamSubmission } from '../Model/ExamSubmission.js';

// Predefined syllabus subjects map
export const GRADE_SYLLABUS = {
  'Nursery': ['English', 'Mathematics', 'General Awareness'],
  'LKG': ['English', 'Mathematics', 'General Awareness'],
  'UKG': ['English', 'Mathematics', 'General Awareness'],
  'Class 1': ['English', 'Mathematics', 'EVS', 'General Science'],
  'Class 2': ['English', 'Mathematics', 'EVS', 'General Science'],
  'Class 3': ['English', 'Mathematics', 'EVS', 'General Science'],
  'Class 4': ['English', 'Mathematics', 'EVS', 'General Science'],
  'Class 5': ['English', 'Mathematics', 'EVS', 'General Science'],
  'Class 6': ['English', 'Mathematics', 'General Science', 'Social Science'],
  'Class 7': ['English', 'Mathematics', 'General Science', 'Social Science'],
  'Class 8': ['English', 'Mathematics', 'General Science', 'Social Science'],
  'Class 9': ['English', 'Mathematics', 'Science', 'Social Studies'],
  'Class 10': ['English', 'Mathematics', 'Science', 'Social Studies'],
  'Class 11': ['English', 'Physics', 'Chemistry', 'Mathematics', 'Computer Science'],
  'Class 12': ['English', 'Physics', 'Chemistry', 'Mathematics', 'Computer Science'],
};

// 1. Submit exam form & pay fixed fee (₹2,000)
export async function submitForm(req, res) {
  try {
    const { grade, transactionId } = req.body;

    if (!grade || !transactionId) {
      return res.status(400).json({ success: false, message: 'Grade level and payment Transaction ID are required' });
    }

    const subjects = GRADE_SYLLABUS[grade];
    if (!subjects) {
      return res.status(400).json({ success: false, message: 'Invalid grade level. Exams available only for Nursery to Class 12.' });
    }

    // Check if student already has a form
    const existingForm = await ExamForm.findOne({ student: req.user._id });
    if (existingForm) {
      return res.status(400).json({ success: false, message: 'You have already submitted an exam form.' });
    }

    const examForm = new ExamForm({
      student: req.user._id,
      grade,
      subjects,
      amountPaid: 2000, // fixed fee
      paymentStatus: 'Paid',
      transactionId,
      status: 'Submitted'
    });

    await examForm.save();
    return res.status(200).json({ success: true, message: 'Exam form submitted successfully! Wait for Admin scheduling.', examForm });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to submit exam form', error: error.message });
  }
}

// 2. Get student's current exam form status
export async function getStudentForm(req, res) {
  try {
    const examForm = await ExamForm.findOne({ student: req.user._id }).lean();
    if (!examForm) {
      return res.status(200).json({ success: true, examForm: null });
    }

    // Search for any existing submission
    const submission = await ExamSubmission.findOne({ student: req.user._id, examForm: examForm._id })
      .populate('examPaper')
      .lean();

    return res.status(200).json({ success: true, examForm, submission });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch student exam form', error: error.message });
  }
}

// 3. Get all exam forms (Admin & Teachers)
export async function getAllForms(req, res) {
  try {
    const forms = await ExamForm.find()
      .populate('student', 'name email profile.phone profile.avatar')
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({ success: true, count: forms.length, forms });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch exam forms', error: error.message });
  }
}

// 4. Schedule exam date, duration, and subjects (Admin only)
export async function scheduleExamDate(req, res) {
  try {
    const { id } = req.params;
    const { scheduledDate, durationMinutes, subjects } = req.body;

    if (!scheduledDate) {
      return res.status(400).json({ success: false, message: 'Scheduled date is required' });
    }

    const form = await ExamForm.findById(id);
    if (!form) {
      return res.status(404).json({ success: false, message: 'Exam form not found' });
    }

    const dateVal = new Date(scheduledDate);
    form.scheduledDate = dateVal;

    if (durationMinutes) {
      form.durationMinutes = Number(durationMinutes);
    }
    if (Array.isArray(subjects) && subjects.length > 0) {
      form.subjects = subjects;
    }
    
    // Automatically set result release date to exactly one month later
    const resultDate = new Date(dateVal.getTime());
    resultDate.setMonth(resultDate.getMonth() + 1);
    form.resultReleasedAt = resultDate;

    if (form.status === 'Submitted') {
      form.status = 'Scheduled';
    }

    await form.save();
    return res.status(200).json({ success: true, message: 'Exam schedule, duration, and subjects updated successfully', form });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to schedule exam date', error: error.message });
  }
}

// 5. Create/Set question paper for a grade (Admin & Teachers)
export async function createPaper(req, res) {
  try {
    const { grade, title, durationMinutes, subjects, questions } = req.body;

    if (!grade || !title || !questions || !Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({ success: false, message: 'Grade, title, and questions are required' });
    }

    const duration = durationMinutes ? Number(durationMinutes) : 195;

    // Calculate total marks
    const totalMarks = questions.reduce((sum, q) => sum + (Number(q.marks) || 5), 0);

    // Create or update paper for grade
    const paper = await ExamPaper.findOneAndUpdate(
      { grade },
      {
        grade,
        title,
        totalMarks,
        durationMinutes: duration,
        subjects: Array.isArray(subjects) ? subjects : [],
        questions,
        createdBy: req.user._id
      },
      { upsert: true, new: true }
    );

    return res.status(200).json({ success: true, message: 'Exam paper set successfully for ' + grade, paper });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to save question paper', error: error.message });
  }
}

// 6. Get all question papers (Admin & Teachers)
export async function getPapers(req, res) {
  try {
    const papers = await ExamPaper.find()
      .populate('createdBy', 'name email')
      .sort({ updatedAt: -1 })
      .lean();

    return res.status(200).json({ success: true, count: papers.length, papers });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch question papers', error: error.message });
  }
}

// 7. Get question paper for student's exam (Student only)
export async function getPaperByGrade(req, res) {
  try {
    const { grade } = req.params;
    
    // Make sure student has a scheduled exam form for this grade
    const form = await ExamForm.findOne({ student: req.user._id, grade });
    if (!form) {
      return res.status(403).json({ success: false, message: 'Access Denied: No exam registration found for ' + grade });
    }

    const paper = await ExamPaper.findOne({ grade }).lean();
    if (!paper) {
      return res.status(404).json({ success: false, message: 'No question paper set yet for ' + grade + '. Please contact your Admin.' });
    }

    // Return paper
    return res.status(200).json({ success: true, paper });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch question paper', error: error.message });
  }
}

// 8. Submit exam answers & grade automatically
export async function submitExam(req, res) {
  try {
    const { examFormId, examPaperId, answers, durationSpent } = req.body;

    if (!examFormId || !examPaperId || !answers || !Array.isArray(answers)) {
      return res.status(400).json({ success: false, message: 'Exam form ID, Paper ID, and answers are required' });
    }

    const form = await ExamForm.findById(examFormId);
    if (!form) {
      return res.status(404).json({ success: false, message: 'Exam form not found' });
    }

    if (form.student.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Access Denied: You cannot submit this exam.' });
    }

    const paper = await ExamPaper.findById(examPaperId);
    if (!paper) {
      return res.status(404).json({ success: false, message: 'Exam paper not found' });
    }

    // Auto-grading calculations
    let obtainedMarks = 0;
    paper.questions.forEach((q, idx) => {
      const selected = answers[idx];
      if (selected !== undefined && selected !== null && selected === q.correctOption) {
        obtainedMarks += (q.marks || 5);
      }
    });

    const percentage = Math.round((obtainedMarks / paper.totalMarks) * 10000) / 100;

    const submission = new ExamSubmission({
      student: req.user._id,
      examForm: examFormId,
      examPaper: examPaperId,
      grade: form.grade,
      answers,
      obtainedMarks,
      totalMarks: paper.totalMarks,
      percentage,
      durationSpent: durationSpent || 0
    });

    await submission.save();

    // Update Form Status
    form.status = 'Completed';
    await form.save();

    return res.status(200).json({ success: true, message: 'Exam answers evaluated and submitted successfully', submission });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to submit exam', error: error.message });
  }
}

// 9. Get all exam submissions (Admin & Teachers)
export async function getSubmissions(req, res) {
  try {
    const submissions = await ExamSubmission.find()
      .populate('student', 'name email profile.phone profile.avatar')
      .populate('examForm')
      .populate('examPaper')
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({ success: true, count: submissions.length, submissions });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch exam submissions', error: error.message });
  }
}

// 10. Publish result & upload remarks/feedback (Admin only)
export async function publishResult(req, res) {
  try {
    const { id } = req.params; // submission ID
    const { remarks } = req.body;

    const submission = await ExamSubmission.findById(id);
    if (!submission) {
      return res.status(404).json({ success: false, message: 'Exam submission not found' });
    }

    submission.remarks = remarks || '';
    submission.isPublished = true;
    submission.publishedAt = new Date();
    await submission.save();

    // Update form status to ResultPublished
    const form = await ExamForm.findById(submission.examForm);
    if (form) {
      form.status = 'ResultPublished';
      form.resultUploaded = true;
      await form.save();
    }

    return res.status(200).json({ success: true, message: 'Result published and student report card updated successfully', submission });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to publish exam result', error: error.message });
  }
}
