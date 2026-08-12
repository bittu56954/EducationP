

import http from 'http';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import { connectDB } from './config/db.js';
import { seedDatabase } from './seedData.js';

import authRoutes from './Router/authRoutes.js';
import teacherRoutes from './Router/teacherRoutes.js';
import userRoutes from './Router/userRoutes.js';
import courseRoutes from './Router/courseRoutes.js';
import enrollmentRoutes from './Router/enrollmentRoutes.js';
import classRoutes from './Router/classRoutes.js';
import notificationRoutes from './Router/notificationRoutes.js';
import adminRoutes from './Router/adminRoutes.js';
import noteRoutes from './Router/noteRoutes.js';
import videoRoutes from './Router/videoRoutes.js';
import reviewRoutes from './Router/reviewRoutes.js';
import assignmentRoutes from './Router/assignmentRoutes.js';
import forumRoutes from './Router/forumRoutes.js';
import messageRoutes from './Router/messageRoutes.js';
import doubtRoutes from './Router/doubtRoutes.js';
import testRoutes from './Router/testRoutes.js';
import examRoutes from './Router/examRoutes.js';

import { errorHandler } from './middleware/error.js';

// Load environment variables from .env
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Disable ETags (prevents 304 status codes and forces 200 OK with fresh data)
app.disable('etag');

// Prevent browser/client caching for all dynamic API routes
app.use((req, res, next) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  next();
});


// Enable CORS and JSON parsing
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/teachers', teacherRoutes);
app.use('/api', userRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/enrollments', enrollmentRoutes);
app.use('/api/classes', classRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/notes', noteRoutes);
app.use('/api/videos', videoRoutes);
app.use('/api', reviewRoutes);
app.use('/api', assignmentRoutes);
app.use('/api/forums', forumRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/doubts', doubtRoutes);
app.use('/api/tests', testRoutes);
app.use('/api/exams', examRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ success: true, message: 'BK Teaching Centre API Server is operational' });
});

// Error handling middleware
app.use(errorHandler);

// 404 Route handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.method} ${req.url} not found` });
});

const server = http.createServer(app);

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.log(`\n------------------------------------------------------------`);
    console.log(`ℹ️  Backend Server is ALREADY running on http://localhost:${PORT}`);
    console.log(`------------------------------------------------------------\n`);
    process.exit(0);
  } else {
    console.error('Server error:', err);
    process.exit(1);
  }
});

// Start listening immediately so port 5000 is open in milliseconds
server.listen(PORT, async () => {
  console.log(`🚀 BK Teaching Centre REST API Server running on http://localhost:${PORT}`);
  try {
    await connectDB();
    await seedDatabase();
  } catch (dbErr) {
    console.error('Database initialization warning:', dbErr.message);
  }
});