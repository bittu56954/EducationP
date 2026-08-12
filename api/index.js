import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

import { connectDB } from '../Backend/config/db.js';
import { seedDatabase } from '../Backend/seedData.js';

import authRoutes from '../Backend/Router/authRoutes.js';
import teacherRoutes from '../Backend/Router/teacherRoutes.js';
import userRoutes from '../Backend/Router/userRoutes.js';
import courseRoutes from '../Backend/Router/courseRoutes.js';
import enrollmentRoutes from '../Backend/Router/enrollmentRoutes.js';
import classRoutes from '../Backend/Router/classRoutes.js';
import notificationRoutes from '../Backend/Router/notificationRoutes.js';
import adminRoutes from '../Backend/Router/adminRoutes.js';
import noteRoutes from '../Backend/Router/noteRoutes.js';
import videoRoutes from '../Backend/Router/videoRoutes.js';
import reviewRoutes from '../Backend/Router/reviewRoutes.js';
import assignmentRoutes from '../Backend/Router/assignmentRoutes.js';
import forumRoutes from '../Backend/Router/forumRoutes.js';
import messageRoutes from '../Backend/Router/messageRoutes.js';
import doubtRoutes from '../Backend/Router/doubtRoutes.js';
import testRoutes from '../Backend/Router/testRoutes.js';
import examRoutes from '../Backend/Router/examRoutes.js';
import { errorHandler } from '../Backend/middleware/error.js';

dotenv.config();

const app = express();

app.disable('etag');

// Prevent caching for real-time dynamic API calls
app.use((req, res, next) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  next();
});

// Configure CORS
const corsOptions = {
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  credentials: false,
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serverless DB connection middleware
let isDbConnected = false;
app.use(async (req, res, next) => {
  try {
    if (!isDbConnected || mongoose.connection.readyState !== 1) {
      await connectDB();
      isDbConnected = true;
      // Trigger fast background seeding without delaying incoming request response
      seedDatabase().catch((e) => console.error('Background seed error:', e.message));
    }
  } catch (dbErr) {
    console.error('Serverless DB connection error:', dbErr.message);
  }
  next();
});

// Health check handler
const healthHandler = (req, res) => {
  const dbState = mongoose.connection.readyState;
  const dbStatus = dbState === 1 ? 'connected' : dbState === 2 ? 'connecting' : 'disconnected';
  res.status(200).json({
    success: true,
    message: 'BK Teaching Centre API Server is operational on Vercel',
    database: dbStatus,
    timestamp: new Date().toISOString(),
  });
};

// Router containing all API endpoints
const apiRouter = express.Router();

apiRouter.get('/health', healthHandler);
apiRouter.use('/auth', authRoutes);
apiRouter.use('/teachers', teacherRoutes);
apiRouter.use('/courses', courseRoutes);
apiRouter.use('/enrollments', enrollmentRoutes);
apiRouter.use('/classes', classRoutes);
apiRouter.use('/notifications', notificationRoutes);
apiRouter.use('/admin', adminRoutes);
apiRouter.use('/notes', noteRoutes);
apiRouter.use('/videos', videoRoutes);
apiRouter.use('/forums', forumRoutes);
apiRouter.use('/messages', messageRoutes);
apiRouter.use('/doubts', doubtRoutes);
apiRouter.use('/tests', testRoutes);
apiRouter.use('/exams', examRoutes);

// Routers mounted at root level of API
apiRouter.use('/', userRoutes);
apiRouter.use('/', reviewRoutes);
apiRouter.use('/', assignmentRoutes);

// Mount router on both '/api' and '/' so that all rewrite variants match perfectly on Vercel
app.use('/api', apiRouter);
app.use('/', apiRouter);

// Error handling middleware
app.use(errorHandler);

// 404 Route handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `API Route ${req.method} ${req.originalUrl || req.url} not found`,
  });
});

export default app;
