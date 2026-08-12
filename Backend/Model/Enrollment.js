import mongoose from 'mongoose';

const enrollmentSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
    },
    enrolledAt: {
      type: Date,
      default: Date.now,
    },
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
    },
    progress: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ['active', 'completed', 'dropped', 'expired'],
      default: 'active',
    },
    paymentMode: {
      type: String,
      default: 'UPI / Wallet',
    },
    amountPaid: {
      type: Number,
      default: 0,
    },
    receiptReceived: {
      type: Boolean,
      default: true,
    },
    receiptStatus: {
      type: String,
      enum: ['Received', 'Not Received', 'Pending Verification', 'Pending'],
      default: 'Received',
    },
    receiptUrl: {
      type: String,
      default: '',
    },
    transactionId: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to ensure unique enrollment per student per course
enrollmentSchema.index({ student: 1, course: 1 }, { unique: true });

export const Enrollment = mongoose.model('Enrollment', enrollmentSchema);
