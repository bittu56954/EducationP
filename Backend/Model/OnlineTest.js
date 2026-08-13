import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema({
  questionText: { type: String, required: true },
  options: [{ type: String, required: true }],
  correctOption: { type: Number, required: true }, // Index 0-3
  marks: { type: Number, default: 1 }
});

const onlineTestSchema = new mongoose.Schema({
  title: { type: String, required: true },
  subject: { type: String, required: true },
  course: { type: mongoose.Schema.Types.Mixed, required: true },
  teacher: { type: mongoose.Schema.Types.Mixed, required: true },
  totalMarks: { type: Number, required: true },
  duration: { type: Number, required: true }, // in minutes
  scheduledAt: { type: Date, required: true }, // weekly test schedule date/time
  questions: [questionSchema]
}, {
  timestamps: true,
  strict: false
});

export const OnlineTest = mongoose.model('OnlineTest', onlineTestSchema);

