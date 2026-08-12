import mongoose from 'mongoose';

const submissionSchema = new mongoose.Schema(
  {
    assignment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Assignment',
      required: [true, 'Assignment ID is required'],
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Student ID is required'],
    },
    submittedAt: {
      type: Date,
      default: Date.now,
    },
    fileUrl: {
      type: String,
      required: [true, 'Submission file link/URL is required'],
    },
    studentComments: {
      type: String,
      default: '',
    },
    grade: {
      type: Number,
      default: null,
    },
    feedback: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['submitted', 'graded'],
      default: 'submitted',
    },
  },
  {
    timestamps: true,
  }
);

// Ensure a student can only submit one submission per assignment
submissionSchema.index({ student: 1, assignment: 1 }, { unique: true });

export const Submission = mongoose.model('Submission', submissionSchema);
