import { Enrollment } from '../Model/Enrollment.js';
import { Course } from '../Model/Course.js';
import { Notification } from '../Model/Notification.js';

export async function enrollInCourse(req, res) {
  try {
    const { courseId, paymentMode, amountPaid, receiptReceived, receiptStatus, receiptUrl, transactionId } = req.body;
    if (!courseId) {
      return res.status(400).json({ success: false, message: 'Course ID is required' });
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    const finalAmountPaid = amountPaid !== undefined ? Number(amountPaid) : Number(course.price || 0);
    const finalPaymentMode = paymentMode || 'UPI / Instant Wallet';
    const finalReceiptReceived = receiptReceived !== undefined ? Boolean(receiptReceived) : true;
    const finalReceiptStatus = receiptStatus || (finalReceiptReceived ? 'Received' : 'Pending Verification');

    const existing = await Enrollment.findOne({ student: req.user._id, course: courseId });
    if (existing) {
      const now = new Date();
      const existingExpiresAt = existing.expiresAt ? new Date(existing.expiresAt) : new Date(new Date(existing.enrolledAt).getTime() + 365 * 24 * 60 * 60 * 1000);
      const isExpired = now > existingExpiresAt;

      if (!isExpired && existing.status !== 'expired') {
        return res.status(400).json({ success: false, message: 'You are already enrolled in this course with an active 1-year subscription.' });
      }

      // Existing enrollment has expired -> Renew access for 1 year!
      existing.enrolledAt = now;
      existing.expiresAt = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000);
      existing.status = 'active';
      existing.paymentMode = finalPaymentMode;
      existing.amountPaid = finalAmountPaid;
      existing.receiptReceived = finalReceiptReceived;
      existing.receiptStatus = finalReceiptStatus;
      existing.receiptUrl = receiptUrl || '';
      existing.transactionId = transactionId || `TXN-${Math.floor(100000 + Math.random() * 900000)}`;
      await existing.save();

      await Notification.create({
        user: req.user._id,
        title: 'Course Subscription Renewed for 1 Year! 🎉',
        message: `Your 1-year access for "${course.title}" has been successfully renewed!`,
        type: 'enrollment',
      });

      return res.status(200).json({ success: true, message: 'Course subscription successfully renewed for 1 year!', enrollment: existing });
    }

    const now = new Date();
    const expiresAt = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000);

    const enrollment = await Enrollment.create({
      student: req.user._id,
      course: courseId,
      status: 'active',
      enrolledAt: now,
      expiresAt: expiresAt,
      paymentMode: finalPaymentMode,
      amountPaid: finalAmountPaid,
      receiptReceived: finalReceiptReceived,
      receiptStatus: finalReceiptStatus,
      receiptUrl: receiptUrl || '',
      transactionId: transactionId || `TXN-${Math.floor(100000 + Math.random() * 900000)}`,
    });

    // Update course enrolled students count
    course.studentsCount = (course.studentsCount || 0) + 1;
    await course.save();

    // Notify Student
    await Notification.create({
      user: req.user._id,
      title: 'Course Purchase Successful! 🎓 (1-Year Access)',
      message: `You have successfully purchased & enrolled in "${course.title}". Your access is valid for 1 year (until ${expiresAt.toLocaleDateString()}).`,
      type: 'enrollment',
    });

    // Notify Teacher
    if (course.teacher) {
      await Notification.create({
        user: course.teacher,
        title: 'New Student Purchased Course 🎓',
        message: `${req.user.name} purchased your course "${course.title}" (${finalPaymentMode} - ₹${finalAmountPaid}).`,
        type: 'enrollment',
      });
    }

    return res.status(201).json({ success: true, message: 'Enrolled successfully (1-Year Access)', enrollment });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Enrollment failed', error: error.message });
  }
}

export async function getMyEnrolledCourses(req, res) {
  try {
    const enrollments = await Enrollment.find({ student: req.user._id })
      .populate({
        path: 'course',
        populate: { path: 'teacher', select: 'name email profile.avatar' },
      })
      .lean();

    const now = new Date();

    const formatted = enrollments.map((e) => {
      const enrolledAtDate = e.enrolledAt ? new Date(e.enrolledAt) : new Date(e.createdAt || now);
      const expiresAtDate = e.expiresAt ? new Date(e.expiresAt) : new Date(enrolledAtDate.getTime() + 365 * 24 * 60 * 60 * 1000);
      const isExpired = now > expiresAtDate;
      const daysRemaining = isExpired ? 0 : Math.max(0, Math.ceil((expiresAtDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
      const status = isExpired ? 'expired' : e.status;
      const validUntilMonthYear = expiresAtDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      const formattedEnrolledAt = enrolledAtDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
      const formattedExpiresAt = expiresAtDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

      return {
        enrollmentId: e._id,
        enrolledAt: enrolledAtDate,
        expiresAt: expiresAtDate,
        formattedEnrolledAt,
        formattedExpiresAt,
        validUntilMonthYear,
        validityDurationText: '1 Year Access (365 Days)',
        isExpired,
        daysRemaining,
        status,
        progress: e.progress || 0,
        paymentMode: e.paymentMode || 'UPI / Wallet',
        amountPaid: e.amountPaid || (e.course ? e.course.price : 0),
        receiptReceived: e.receiptReceived !== undefined ? e.receiptReceived : true,
        receiptStatus: e.receiptStatus || 'Received',
        receiptUrl: e.receiptUrl || '',
        transactionId: e.transactionId || '',
        course: e.course,
      };
    });

    return res.status(200).json({ success: true, count: formatted.length, enrollments: formatted });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch enrolled courses', error: error.message });
  }
}

export async function getCourseEnrolledStudents(req, res) {
  try {
    const { courseId } = req.params;
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    if (req.user.role !== 'admin' && course.teacher.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to view these enrolled students' });
    }

    const enrollments = await Enrollment.find({ course: courseId })
      .populate('student', 'name email role status profile.avatar')
      .lean();

    const now = new Date();

    const students = enrollments.map((e) => {
      const enrolledAtDate = e.enrolledAt ? new Date(e.enrolledAt) : new Date(e.createdAt || now);
      const expiresAtDate = e.expiresAt ? new Date(e.expiresAt) : new Date(enrolledAtDate.getTime() + 365 * 24 * 60 * 60 * 1000);
      const isExpired = now > expiresAtDate;
      const daysRemaining = isExpired ? 0 : Math.max(0, Math.ceil((expiresAtDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
      const status = isExpired ? 'expired' : e.status;

      return {
        enrollmentId: e._id,
        enrolledAt: enrolledAtDate,
        expiresAt: expiresAtDate,
        isExpired,
        daysRemaining,
        status,
        paymentMode: e.paymentMode || 'UPI / Wallet',
        amountPaid: e.amountPaid || 0,
        receiptReceived: e.receiptReceived !== undefined ? e.receiptReceived : true,
        receiptStatus: e.receiptStatus || 'Received',
        student: e.student,
      };
    });

    return res.status(200).json({ success: true, count: students.length, students });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch enrolled students', error: error.message });
  }
}

export async function getAllEnrollments(req, res) {
  try {
    const enrollments = await Enrollment.find()
      .populate('student', 'name email role status profile.avatar')
      .populate('course', 'title price category thumbnail image')
      .sort({ createdAt: -1 })
      .lean();

    const now = new Date();

    const detailed = enrollments.map((e) => {
      const enrolledAtDate = e.enrolledAt ? new Date(e.enrolledAt) : new Date(e.createdAt || now);
      const expiresAtDate = e.expiresAt ? new Date(e.expiresAt) : new Date(enrolledAtDate.getTime() + 365 * 24 * 60 * 60 * 1000);
      const isExpired = now > expiresAtDate;
      const daysRemaining = isExpired ? 0 : Math.max(0, Math.ceil((expiresAtDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
      const status = isExpired ? 'expired' : e.status;

      return {
        _id: e._id,
        studentName: e.student ? e.student.name : 'Unknown Student',
        studentEmail: e.student ? e.student.email : 'Unknown Email',
        studentAvatar: e.student?.profile?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${e.student?.name || 'Student'}`,
        studentId: e.student ? e.student._id : null,
        courseTitle: e.course ? e.course.title : 'Deleted Course',
        courseCategory: e.course ? e.course.category : 'General',
        coursePrice: e.course ? e.course.price : 0,
        courseId: e.course ? e.course._id : null,
        paymentMode: e.paymentMode || 'UPI / Wallet',
        amountPaid: e.amountPaid !== undefined ? e.amountPaid : (e.course ? e.course.price : 0),
        receiptReceived: e.receiptReceived !== undefined ? e.receiptReceived : true,
        receiptStatus: e.receiptStatus || (e.receiptReceived ? 'Received' : 'Pending Verification'),
        receiptUrl: e.receiptUrl || '',
        transactionId: e.transactionId || `TXN-${e._id.toString().slice(-6)}`,
        enrolledAt: enrolledAtDate,
        expiresAt: expiresAtDate,
        isExpired,
        daysRemaining,
        status,
      };
    });

    return res.status(200).json({ success: true, count: detailed.length, enrollments: detailed });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch all enrollments', error: error.message });
  }
}

export async function updateEnrollmentReceiptStatus(req, res) {
  try {
    const { id } = req.params;
    const { receiptReceived, receiptStatus } = req.body;

    const enrollment = await Enrollment.findById(id);
    if (!enrollment) {
      return res.status(404).json({ success: false, message: 'Enrollment record not found' });
    }

    if (receiptReceived !== undefined) {
      enrollment.receiptReceived = Boolean(receiptReceived);
    }
    if (receiptStatus) {
      enrollment.receiptStatus = receiptStatus;
    } else if (receiptReceived !== undefined) {
      enrollment.receiptStatus = enrollment.receiptReceived ? 'Received' : 'Not Received';
    }

    await enrollment.save();

    return res.status(200).json({ success: true, message: 'Payment receipt status updated successfully', enrollment });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to update receipt status', error: error.message });
  }
}
