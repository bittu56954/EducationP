import { User } from '../Model/User.js';
import { Course } from '../Model/Course.js';
import { Enrollment } from '../Model/Enrollment.js';
import { Class } from '../Model/Class.js';

export async function getAdminDashboardStats(req, res) {
  try {
    const totalUsers = await User.countDocuments();
    const totalStudents = await User.countDocuments({ role: 'student' });
    const totalTeachers = await User.countDocuments({ role: 'teacher' });
    const activeUsers = await User.countDocuments({ status: 'active' });
    const inactiveUsers = await User.countDocuments({ status: 'inactive' });

    const totalCourses = await Course.countDocuments();
    const totalEnrollments = await Enrollment.countDocuments();
    const upcomingClasses = await Class.countDocuments({ status: 'upcoming' });

    const enrollments = await Enrollment.find().populate('course', 'price').lean();
    let totalRevenue = 0;
    enrollments.forEach((e) => {
      if (e.course && e.course.price) {
        totalRevenue += Number(e.course.price);
      }
    });

    const recentUsers = await User.find().select('-password').sort({ createdAt: -1 }).limit(5).lean();
    const recentCourses = await Course.find().populate('teacher', 'name').sort({ createdAt: -1 }).limit(5).lean();

    return res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        totalStudents,
        totalTeachers,
        activeUsers,
        inactiveUsers,
        totalCourses,
        totalEnrollments,
        upcomingClasses,
        totalRevenue,
      },
      recentUsers,
      recentCourses,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch admin stats', error: error.message });
  }
}
