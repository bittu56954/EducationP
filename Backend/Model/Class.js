import mongoose from 'mongoose';

const classSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Class title is required'],
      trim: true,
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
    },
    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    startTime: {
      type: Date,
      required: [true, 'Start time is required'],
    },
    durationMinutes: {
      type: Number,
      default: 60,
    },
    joinUrl: {
      type: String,
      default: '',
    },
    subject: {
      type: String,
      default: 'General',
    },
    platform: {
      type: String,
      default: 'Google Meet',
    },
    status: {
      type: String,
      enum: ['upcoming', 'live', 'completed', 'cancelled'],
      default: 'upcoming',
    },
    description: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

export const Class = mongoose.model('Class', classSchema);
