import mongoose from 'mongoose';

const examQuestionSchema = new mongoose.Schema({
  subject: {
    type: String,
    required: true,
  },
  questionText: {
    type: String,
    required: true,
  },
  options: [
    {
      type: String,
      required: true,
    },
  ],
  correctOption: {
    type: Number,
    required: true, // 0-3 index
  },
  marks: {
    type: Number,
    default: 5,
  },
});

const examPaperSchema = new mongoose.Schema(
  {
    grade: {
      type: String,
      required: true,
      enum: [
        'Nursery', 'LKG', 'UKG',
        'Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5',
        'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10',
        'Class 11', 'Class 12',
      ],
    },
    title: {
      type: String,
      required: true,
    },
    durationMinutes: {
      type: Number,
      default: 195, // 3 hours 15 mins
      required: true,
    },
    subjects: [
      {
        type: String,
      },
    ],
    totalMarks: {
      type: Number,
      required: true,
    },
    questions: [examQuestionSchema],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export const ExamPaper = mongoose.model('ExamPaper', examPaperSchema);
