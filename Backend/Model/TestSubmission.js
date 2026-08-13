import mongoose from 'mongoose';

const testSubmissionSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.Mixed, required: true },
  test: { type: mongoose.Schema.Types.Mixed, required: true },
  answers: [{ type: Number }], // Selected option index or null
  obtainedMarks: { type: Number, required: true },
  totalMarks: { type: Number, required: true },
  percentage: { type: Number, required: true },
  durationSpent: { type: Number, required: true }, // in seconds
  submittedAt: { type: Date, default: Date.now }
}, {
  timestamps: true,
  strict: false
});

export const TestSubmission = mongoose.model('TestSubmission', testSubmissionSchema);
