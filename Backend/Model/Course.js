import mongoose from 'mongoose';

const courseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Course title is required'],
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
    },
    level: {
      type: String,
      enum: ['Beginner', 'Intermediate', 'Advanced'],
      default: 'Beginner',
    },
    description: {
      type: String,
      default: '',
    },
    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    price: {
      type: Number,
      default: 0,
    },
    duration: {
      type: String,
      default: '8 Weeks',
    },
    image: {
      type: String,
      default: '',
    },
    rating: {
      type: Number,
      default: 4.8,
    },
    studentsCount: {
      type: Number,
      default: 0,
    },
    syllabus: [
      {
        type: String,
      },
    ],
  },
  {
    timestamps: true,
  }
);

export const Course = mongoose.model('Course', courseSchema);
