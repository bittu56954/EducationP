import express from 'express';
import { User } from '../Model/User.js';

const router = express.Router();

// GET /api/teachers (Public)
router.get('/', async (req, res) => {
  try {
    const teachers = await User.find({ role: 'teacher', status: 'active' }).select('-password').lean();
    return res.status(200).json({ success: true, count: teachers.length, users: teachers });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch teachers', error: error.message });
  }
});

export default router;
