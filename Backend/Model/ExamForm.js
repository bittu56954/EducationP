import mongoose from 'mongoose';

const examFormSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
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
    subjects: [
      {
        type: String,
      },
    ],
    amountPaid: {
      type: Number,
      default: 2000,
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ['Pending', 'Paid'],
      default: 'Paid',
    },
    transactionId: {
      type: String,
      required: true,
    },
    scheduledDate: {
      type: Date,
      default: null,
    },
    durationMinutes: {
      type: Number,
      default: 195,
    },
    status: {
      type: String,
      enum: ['Submitted', 'Scheduled', 'Completed', 'ResultPublished'],
      default: 'Submitted',
    },
    resultUploaded: {
      type: Boolean,
      default: false,
    },
    resultReleasedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

export const ExamForm = mongoose.model('ExamForm', examFormSchema);
