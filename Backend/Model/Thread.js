import mongoose from 'mongoose';

const replySchema = new mongoose.Schema(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    content: {
      type: String,
      required: [true, 'Reply content cannot be empty'],
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

const threadSchema = new mongoose.Schema(
  {
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: [true, 'Course ID is required'],
    },
    title: {
      type: String,
      required: [true, 'Thread title is required'],
      trim: true,
    },
    content: {
      type: String,
      required: [true, 'Thread content is required'],
      trim: true,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    replies: [replySchema],
  },
  {
    timestamps: true,
  }
);

export const Thread = mongoose.model('Thread', threadSchema);
