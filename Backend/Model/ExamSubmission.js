import mongoose from 'mongoose';

const examSubmissionSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    examForm: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ExamForm',
      required: true,
    },
    examPaper: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ExamPaper',
      required: true,
    },
    grade: {
      type: String,
      required: true,
    },
    answers: [
      {
        type: Number, // selected option index or null
      },
    ],
    obtainedMarks: {
      type: Number,
      required: true,
    },
    totalMarks: {
      type: Number,
      required: true,
    },
    percentage: {
      type: Number,
      required: true,
    },
    durationSpent: {
      type: Number, // in seconds
      required: true,
    },
    submittedAt: {
      type: Date,
      default: Date.now,
    },
    remarks: {
      type: String,
      default: '',
    },
    isPublished: {
      type: Boolean,
      default: false,
    },
    publishedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

export const ExamSubmission = mongoose.model('ExamSubmission', examSubmissionSchema);
