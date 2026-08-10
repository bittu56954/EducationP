import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { CourseCard } from '../components/CourseCard';
import { ClassCard } from '../components/ClassCard';
import { Modal } from '../components/Modal';
import { TeacherChatView } from '../components/TeacherChatView';
import { TeacherTestView } from '../components/TeacherTestView';
import { AdminExamView } from '../components/AdminExamView';
import { Plus, BookOpen, Video, Users, GraduationCap, Calendar, Clock, ExternalLink, Edit, Shield, CheckCircle, Trash2 } from '../components/Icons';

export function TeacherDashboard({ activeTab = 'profile', setToast }) {
  const { user, updateProfile } = useAuth();
  const [courses, setCourses] = useState([]);
  const [classes, setClasses] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);
  const [isClassModalOpen, setIsClassModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);

  // Profile Form State
  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    qualification: user?.profile?.qualification || 'Senior Computer Science Instructor',
    phone: user?.profile?.phone || '+1 800-555-0190',
    bio: user?.profile?.bio || 'Dedicated educator passionately mentoring students in programming, full-stack web engineering, and system design.',
    avatar: user?.profile?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(user?.name || 'Teacher')}`,
    specialization: 'Full Stack Web Development & Computer Science'
  });

  // Course & Class Form States
  const [courseForm, setCourseForm] = useState({
    title: '',
    description: '',
    category: 'Web Development',
    price: 49,
    level: 'Beginner',
    duration: '10 hours',
    lessonsCount: 12,
    thumbnail: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&auto=format&fit=crop&q=80'
  });

  const [classForm, setClassForm] = useState({
    title: '',
    description: '',
    subject: 'Web Development',
    courseId: '',
    meetingLink: 'https://meet.google.com/abc-defg-hij',
    platform: 'Google Meet',
    scheduledAt: new Date(Date.now() + 86400000).toISOString().slice(0, 16),
    durationMinutes: 60
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [coursesRes, classesRes] = await Promise.all([
        api.getCourses({ teacherId: user?._id }),
        api.getMyClasses()
      ]);
      setCourses(coursesRes.courses || []);
      setClasses(classesRes.classes || []);
      
      // Load enrolled students for first course if available
      if (coursesRes.courses && coursesRes.courses.length > 0) {
        const studentRes = await api.getCourseStudents(coursesRes.courses[0]._id);
        setStudents(studentRes.students || []);
      }
    } catch (err) {
      console.error('Error loading teacher data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadData();
      setProfileForm({
        name: user.name || '',
        qualification: user.profile?.qualification || 'Senior Instructor',
        phone: user.profile?.phone || '+1 800-555-0190',
        bio: user.profile?.bio || 'Faculty member at BK Teaching Center.',
        avatar: user.profile?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(user.name)}`,
        specialization: user.profile?.specialization || 'Full Stack Software Development'
      });
    }
  }, [user]);

  // Handle Profile Update
  const handleSaveProfile = async (e) => {
    e.preventDefault();

    if (!profileForm.name.trim() || !profileForm.phone.trim() || !profileForm.bio.trim() || !profileForm.qualification.trim()) {
      if (setToast) setToast({ message: 'All fields are mandatory. Please fill in name, qualification, phone, and bio.', type: 'danger' });
      return;
    }

    const nameLettersCount = profileForm.name.trim().replace(/[^a-zA-Z]/g, '').length;
    if (nameLettersCount < 4) {
      if (setToast) setToast({ message: 'Name must contain at least 4 letters.', type: 'danger' });
      return;
    }

    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(profileForm.phone.trim())) {
      if (setToast) setToast({ message: 'Mobile number must be exactly 10 digits.', type: 'danger' });
      return;
    }

    try {
      await updateProfile(profileForm);
      if (setToast) setToast({ message: 'Teacher profile updated successfully!', type: 'success' });
      setIsProfileModalOpen(false);
    } catch (err) {
      if (setToast) setToast({ message: err.message || 'Profile update failed', type: 'danger' });
    }
  };

  // Handle Course Create / Edit
  const handleSaveCourse = async (e) => {
    e.preventDefault();
    try {
      if (editingCourse) {
        await api.updateCourse(editingCourse._id, courseForm);
        if (setToast) setToast({ message: 'Course updated successfully!', type: 'success' });
      } else {
        await api.createCourse(courseForm);
        if (setToast) setToast({ message: 'Course created successfully!', type: 'success' });
      }
      setIsCourseModalOpen(false);
      setEditingCourse(null);
      loadData();
    } catch (err) {
      if (setToast) setToast({ message: err.message || 'Action failed', type: 'danger' });
    }
  };

  const handleDeleteCourse = async (courseId) => {
    if (!window.confirm('Are you sure you want to delete this course?')) return;
    try {
      await api.deleteCourse(courseId);
      if (setToast) setToast({ message: 'Course deleted successfully!', type: 'success' });
      loadData();
    } catch (err) {
      if (setToast) setToast({ message: err.message || 'Delete failed', type: 'danger' });
    }
  };

  // Handle Class Schedule
  const handleScheduleClass = async (e) => {
    e.preventDefault();
    try {
      await api.scheduleClass(classForm);
      if (setToast) setToast({ message: 'Live class scheduled successfully!', type: 'success' });
      setIsClassModalOpen(false);
      loadData();
    } catch (err) {
      if (setToast) setToast({ message: err.message || 'Scheduling failed', type: 'danger' });
    }
  };

  const handleDeleteClass = async (classId) => {
    if (!window.confirm('Delete this scheduled class?')) return;
    try {
      await api.deleteClass(classId);
      if (setToast) setToast({ message: 'Class deleted', type: 'success' });
      loadData();
    } catch (err) {
      if (setToast) setToast({ message: err.message || 'Delete failed', type: 'danger' });
    }
  };

  const handleStartClassLive = async (classId) => {
    try {
      await api.updateClass(classId, { status: 'live' });
      if (setToast) setToast({ message: 'Class is now LIVE! Enrolled students notified.', type: 'success' });
      loadData();
    } catch (err) {
      if (setToast) setToast({ message: err.message || 'Failed to start class', type: 'danger' });
    }
  };

  const handleCompleteClass = async (classId) => {
    try {
      await api.updateClass(classId, { status: 'completed' });
      if (setToast) setToast({ message: 'Class marked as completed.', type: 'success' });
      loadData();
    } catch (err) {
      if (setToast) setToast({ message: err.message || 'Failed to complete class', type: 'danger' });
    }
  };

  const totalEnrolledStudents = courses.reduce((acc, c) => acc + (c.enrolledStudentsCount || c.studentsCount || 0), 0);
  
  // Total Teaching Duration Calculation (in minutes and formatted string)
  const totalTeachingMinutes = classes.reduce((sum, cls) => sum + (Number(cls.durationMinutes) || 60), 0);
  const totalHours = Math.floor(totalTeachingMinutes / 60);
  const totalRemainingMins = totalTeachingMinutes % 60;
  const formattedTeachingTime = totalHours > 0 
    ? `${totalHours} hrs ${totalRemainingMins > 0 ? `${totalRemainingMins} mins` : ''}` 
    : `${totalTeachingMinutes} mins`;

  if (loading) {
    return <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading Teacher Studio environment...</div>;
  }

  return (
    <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Header Banner */}
      <div className="glass-panel" style={{
        padding: '2rem',
        background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.18) 0%, rgba(99, 102, 241, 0.18) 100%)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1.2rem',
        border: '1px solid rgba(168, 85, 247, 0.3)'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.5rem' }}>
            <span className="badge badge-teacher">FACULTY TEACHER PORTAL</span>
            <span style={{ fontSize: '0.72rem', fontWeight: 800, backgroundColor: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b', padding: '0.2rem 0.6rem', borderRadius: '20px', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
              🔒 Teacher Only View
            </span>
          </div>
          <h2 style={{ fontSize: '1.8rem', color: 'var(--text-main)', fontWeight: 800 }}>
            Welcome, {user?.name} 👋
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', marginTop: '0.2rem', maxWidth: '650px' }}>
            {user?.profile?.qualification || 'Senior Faculty Instructor'} • Manage your assigned teaching classes, exact class timings, total teaching hours, and teacher profile.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button 
            className="curious-btn-outline"
            onClick={() => setIsProfileModalOpen(true)}
            style={{ padding: '0.65rem 1.2rem', fontSize: '0.88rem' }}
          >
            <Edit size={16} /> Edit Profile
          </button>

          <button 
            className="curious-btn-primary" 
            style={{ padding: '0.65rem 1.2rem', fontSize: '0.88rem', backgroundColor: '#ef4444', borderColor: '#ef4444' }}
            onClick={() => {
              setClassForm({
                title: '',
                description: '',
                subject: 'Web Development',
                courseId: courses[0]?._id || '',
                meetingLink: 'https://meet.google.com/abc-defg-hij',
                platform: 'Google Meet',
                scheduledAt: new Date(Date.now() + 86400000).toISOString().slice(0, 16),
                durationMinutes: 60
              });
              setIsClassModalOpen(true);
            }}
          >
            <Video size={16} /> Schedule New Class
          </button>
          
          <button 
            className="curious-btn-primary" 
            style={{ padding: '0.65rem 1.2rem', fontSize: '0.88rem', backgroundColor: '#3b82f6', borderColor: '#3b82f6' }}
            onClick={() => {
              setEditingCourse(null);
              setCourseForm({
                title: '',
                description: '',
                category: 'Web Development',
                price: 49,
                level: 'Beginner',
                duration: '10 hours',
                lessonsCount: 12,
                thumbnail: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&auto=format&fit=crop&q=80'
              });
              setIsCourseModalOpen(true);
            }}
          >
            <Plus size={16} /> Create Course
          </button>
        </div>
      </div>

      {/* TEACHER-ONLY METRICS SECTION */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
        {/* TOTAL CLASSES A TEACHER HAS TO TAKE (ONLY FOR TEACHERS) */}
        <div className="glass-card" style={{ borderLeft: '4px solid #a855f7', position: 'relative', overflow: 'hidden' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Total Classes To Teach
            </span>
            <span style={{ fontSize: '0.65rem', fontWeight: 800, color: '#a855f7', backgroundColor: 'rgba(168, 85, 247, 0.15)', padding: '0.15rem 0.5rem', borderRadius: '12px' }}>
              ONLY FOR TEACHERS
            </span>
          </div>
          <div style={{ fontSize: '2.2rem', fontWeight: 900, color: '#a855f7', marginTop: '0.3rem' }}>
            {classes.length} <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 500 }}>Classes</span>
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            Assigned live online class sessions
          </div>
        </div>

        {/* TOTAL TEACHING TIME / DURATION */}
        <div className="glass-card" style={{ borderLeft: '4px solid #ef4444' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Total Teaching Duration
          </div>
          <div style={{ fontSize: '2.2rem', fontWeight: 900, color: '#ef4444', marginTop: '0.3rem' }}>
            {formattedTeachingTime}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            Accumulated teaching time required
          </div>
        </div>

        {/* ACTIVE CREATED COURSES */}
        <div className="glass-card" style={{ borderLeft: '4px solid #3b82f6' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Active Courses
          </div>
          <div style={{ fontSize: '2.2rem', fontWeight: 900, color: '#3b82f6', marginTop: '0.3rem' }}>
            {courses.length}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            Published learning modules
          </div>
        </div>

        {/* TOTAL ENROLLED STUDENTS */}
        <div className="glass-card" style={{ borderLeft: '4px solid #10b981' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Enrolled Students
          </div>
          <div style={{ fontSize: '2.2rem', fontWeight: 900, color: '#10b981', marginTop: '0.3rem' }}>
            {totalEnrolledStudents || 12}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            Active students across courses
          </div>
        </div>
      </div>

      {/* TEACHER PROFILE DISPLAY SECTION */}
      <div className="glass-panel" style={{ padding: '1.75rem', background: 'var(--bg-card)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
            👩‍🏫 Teacher Profile & Instructor Credentials
          </h3>
          <button 
            className="curious-btn-outline" 
            onClick={() => setIsProfileModalOpen(true)}
            style={{ padding: '0.45rem 0.9rem', fontSize: '0.82rem' }}
          >
            <Edit size={15} /> Update Profile Info
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '1.75rem', alignItems: 'start' }}>
          <div style={{ textAlign: 'center' }}>
            <img 
              src={user?.profile?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(user?.name || 'Teacher')}`}
              alt={user?.name}
              style={{
                width: '110px',
                height: '110px',
                borderRadius: '50%',
                objectFit: 'cover',
                border: '3px solid #a855f7',
                boxShadow: '0 8px 20px rgba(168, 85, 247, 0.25)',
                marginBottom: '0.6rem'
              }}
            />
            <div>
              <span className="badge badge-teacher" style={{ fontSize: '0.75rem' }}>
                VERIFIED INSTRUCTOR
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div>
                <h4 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
                  {user?.name}
                </h4>
                <p style={{ color: '#a855f7', fontSize: '0.9rem', fontWeight: 700, margin: '0.15rem 0 0' }}>
                  {user?.profile?.qualification || 'Senior Computer Science & Web Engineering Instructor'}
                </p>
              </div>

              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'block' }}>Email: <strong>{user?.email}</strong></span>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'block', marginTop: '0.1rem' }}>Phone: <strong>{user?.profile?.phone || '+1 800-555-0190'}</strong></span>
              </div>
            </div>

            <p style={{ fontSize: '0.92rem', color: 'var(--text-muted)', lineHeight: 1.6, background: 'rgba(255,255,255,0.03)', padding: '0.85rem 1rem', borderRadius: '10px', border: '1px solid var(--border-color)', margin: 0 }}>
              {user?.profile?.bio || 'Senior Instructor at BK Teaching Center specializing in full-stack web applications, live coding instruction, and structured technical mentorship.'}
            </p>

            <div style={{ display: 'flex', gap: '1.25rem', flexWrap: 'wrap', marginTop: '0.2rem', fontSize: '0.85rem' }}>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Assigned Classes to Take: </span>
                <strong style={{ color: '#a855f7', fontWeight: 800 }}>{classes.length} Total Sessions</strong>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Total Required Teaching Time: </span>
                <strong style={{ color: '#ef4444', fontWeight: 800 }}>{formattedTeachingTime}</strong>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Account Role: </span>
                <strong style={{ color: '#3b82f6', fontWeight: 800 }}>Teacher (Instructor)</strong>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* DETAILED CLASS SCHEDULE BREAKDOWN ("which class at what time and how long to teach") */}
      {(activeTab === 'profile' || activeTab === 'overview' || activeTab === 'classes') && (
        <div className="glass-panel" style={{ padding: '1.75rem', background: 'var(--bg-card)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
                <Clock className="text-secondary" /> Detailed Teaching Schedule & Assigned Classes ({classes.length})
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                Complete breakdown showing which class you have at what time and how long you have to teach each session.
              </p>
            </div>

            <button 
              className="curious-btn-primary" 
              style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', backgroundColor: '#ef4444', borderColor: '#ef4444' }}
              onClick={() => setIsClassModalOpen(true)}
            >
              <Plus size={16} /> Add Class Session
            </button>
          </div>

          {classes.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem 1.5rem', backgroundColor: 'var(--bg-glass)', borderRadius: '14px', border: '1px dashed var(--border-color)' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>📅</div>
              <h4 style={{ fontSize: '1.1rem', color: 'var(--text-main)', marginBottom: '0.4rem' }}>No Live Classes Scheduled Yet</h4>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginBottom: '1rem' }}>Click below to schedule your first online live class session for your students.</p>
              <button className="curious-btn-primary" onClick={() => setIsClassModalOpen(true)}>
                Schedule First Class Now
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {classes.map((cls, idx) => {
                const dateObj = new Date(cls.scheduledAt || cls.startTime || Date.now());
                const formattedDate = dateObj.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
                const formattedTime = dateObj.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
                const duration = Number(cls.durationMinutes) || 60;
                const hours = Math.floor(duration / 60);
                const mins = duration % 60;
                const durationText = hours > 0 ? `${hours} hr ${mins > 0 ? `${mins} m` : ''}` : `${mins} mins`;

                return (
                  <div key={cls._id || idx} style={{
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '1.2rem',
                    padding: '1.25rem 1.5rem',
                    backgroundColor: 'rgba(15, 23, 42, 0.65)',
                    border: '1px solid var(--border-color)',
                    borderLeft: cls.status === 'live' ? '5px solid #10b981' : cls.status === 'completed' ? '5px solid #64748b' : '5px solid #3b82f6',
                    borderRadius: '14px',
                    transition: 'transform 0.2s ease, box-shadow 0.2s ease'
                  }}>
                    {/* Left: Class details */}
                    <div style={{ flex: '1 1 300px', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
                        <span className="badge badge-teacher" style={{ fontSize: '0.72rem' }}>
                          {cls.subject || cls.courseCategory || 'Web Development'}
                        </span>
                        {cls.courseTitle && (
                          <span style={{ fontSize: '0.75rem', color: '#3b82f6', fontWeight: 700 }}>
                            Course: {cls.courseTitle}
                          </span>
                        )}
                        <span style={{
                          fontSize: '0.7rem',
                          fontWeight: 800,
                          padding: '0.15rem 0.55rem',
                          borderRadius: '12px',
                          textTransform: 'uppercase',
                          backgroundColor: cls.status === 'live' ? 'rgba(16, 185, 129, 0.18)' : cls.status === 'completed' ? 'rgba(100, 116, 139, 0.18)' : 'rgba(59, 130, 246, 0.18)',
                          color: cls.status === 'live' ? '#10b981' : cls.status === 'completed' ? '#94a3b8' : '#3b82f6',
                          border: `1px solid ${cls.status === 'live' ? 'rgba(16, 185, 129, 0.3)' : cls.status === 'completed' ? 'rgba(100, 116, 139, 0.3)' : 'rgba(59, 130, 246, 0.3)'}`
                        }}>
                          {cls.status === 'live' ? '🔴 Live Now' : cls.status === 'completed' ? '✓ Completed' : '🗓️ Scheduled'}
                        </span>
                      </div>

                      <h4 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
                        {cls.title}
                      </h4>
                      {cls.description && (
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.4 }}>
                          {cls.description}
                        </p>
                      )}
                    </div>

                    {/* Middle: Timing & Teaching Duration */}
                    <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', flexWrap: 'wrap', minWidth: '220px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: 'rgba(255,255,255,0.03)', padding: '0.5rem 0.85rem', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                        <Calendar size={18} style={{ color: '#3b82f6' }} />
                        <div>
                          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase', fontWeight: 700 }}>Scheduled Date & Time</span>
                          <span style={{ fontSize: '0.88rem', fontWeight: 800, color: 'var(--text-main)' }}>{formattedDate} at {formattedTime}</span>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: 'rgba(239, 68, 68, 0.08)', padding: '0.5rem 0.85rem', borderRadius: '10px', border: '1px solid rgba(239, 68, 68, 0.25)' }}>
                        <Clock size={18} style={{ color: '#ef4444' }} />
                        <div>
                          <span style={{ fontSize: '0.7rem', color: '#ef4444', display: 'block', textTransform: 'uppercase', fontWeight: 800 }}>How Long To Teach</span>
                          <span style={{ fontSize: '0.9rem', fontWeight: 900, color: 'var(--text-main)' }}>{duration} Mins ({durationText})</span>
                        </div>
                      </div>
                    </div>

                    {/* Right: Actions */}
                    <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
                      {cls.meetingLink && (
                        <a 
                          href={cls.meetingLink} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="curious-btn-primary" 
                          style={{ padding: '0.5rem 0.85rem', fontSize: '0.82rem', textDecoration: 'none', backgroundColor: '#10b981', borderColor: '#10b981' }}
                        >
                          <ExternalLink size={14} /> Launch Meeting ({cls.platform || 'Meet'})
                        </a>
                      )}

                      {cls.status !== 'completed' && (
                        <button 
                          onClick={() => handleCompleteClass(cls._id)}
                          className="curious-btn-outline" 
                          style={{ padding: '0.5rem 0.85rem', fontSize: '0.82rem' }}
                          title="Mark class as finished"
                        >
                          <CheckCircle size={14} /> Finish Class
                        </button>
                      )}

                      <button 
                        onClick={() => handleDeleteClass(cls._id)}
                        style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '0.4rem' }}
                        title="Delete class"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB: COURSES CREATED */}
      {(activeTab === 'courses') && (
        <div>
          <h3 style={{ fontSize: '1.3rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <BookOpen className="text-primary" /> My Created Courses ({courses.length})
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
            {courses.map(course => (
              <CourseCard 
                key={course._id} 
                course={course} 
                user={user}
                onEdit={(c) => {
                  setEditingCourse(c);
                  setCourseForm({ ...c });
                  setIsCourseModalOpen(true);
                }}
                onDelete={handleDeleteCourse}
              />
            ))}
          </div>
        </div>
      )}

      {/* TAB: WEEKLY ONLINE TESTS */}
      {activeTab === 'tests' && (
        <TeacherTestView user={user} setToast={setToast} />
      )}

      {/* TAB: BOARD ONLINE EXAMS */}
      {activeTab === 'exams' && (
        <AdminExamView setToast={setToast} />
      )}

      {/* TAB: CHAT & MESSAGES */}
      {activeTab === 'messages' && (
        <TeacherChatView user={user} />
      )}

      {/* TAB: ENROLLED STUDENTS */}
      {activeTab === 'students' && (
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '1.25rem' }}>Enrolled Students Roster</h3>
          <table className="custom-table">
            <thead>
              <tr>
                <th>Student Name</th>
                <th>Email</th>
                <th>Enrolled Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {students.length === 0 ? (
                <tr>
                  <td colSpan={4} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No students enrolled in this course yet.</td>
                </tr>
              ) : (
                students.map(s => (
                  <tr key={s.enrollmentId}>
                    <td style={{ fontWeight: 600 }}>{s.student.name}</td>
                    <td style={{ color: 'var(--text-muted)' }}>{s.student.email}</td>
                    <td style={{ fontSize: '0.85rem' }}>{new Date(s.enrolledAt).toLocaleDateString()}</td>
                    <td><span className="badge badge-active">{s.status}</span></td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* EDIT TEACHER PROFILE MODAL */}
      <Modal isOpen={isProfileModalOpen} onClose={() => setIsProfileModalOpen(false)} title="Edit Teacher Profile & Credentials">
        <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>Full Name *</label>
            <input type="text" required value={profileForm.name} onChange={e => setProfileForm({ ...profileForm, name: e.target.value })} />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>Qualification / Highest Degree *</label>
            <input type="text" required value={profileForm.qualification} onChange={e => setProfileForm({ ...profileForm, qualification: e.target.value })} placeholder="e.g. M.Sc Computer Science, Ph.D." />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>Mobile / Contact Phone *</label>
            <input type="text" required value={profileForm.phone} onChange={e => setProfileForm({ ...profileForm, phone: e.target.value })} placeholder="e.g. 9876543210" />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>Teacher Bio / Teaching Experience *</label>
            <textarea rows={3} required value={profileForm.bio} onChange={e => setProfileForm({ ...profileForm, bio: e.target.value })} placeholder="Describe your teaching background..." />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>Avatar Image URL</label>
            <input type="text" value={profileForm.avatar} onChange={e => setProfileForm({ ...profileForm, avatar: e.target.value })} />
          </div>

          <button type="submit" className="curious-btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: '0.5rem', backgroundColor: '#a855f7', borderColor: '#a855f7' }}>
            Save Teacher Profile
          </button>
        </form>
      </Modal>

      {/* CREATE / EDIT COURSE MODAL */}
      <Modal isOpen={isCourseModalOpen} onClose={() => setIsCourseModalOpen(false)} title={editingCourse ? "Edit Course" : "Create New Course"}>
        <form onSubmit={handleSaveCourse} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>Course Title</label>
            <input type="text" required value={courseForm.title} onChange={e => setCourseForm({ ...courseForm, title: e.target.value })} placeholder="e.g. Master React & Node.js" />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>Description</label>
            <textarea rows={3} required value={courseForm.description} onChange={e => setCourseForm({ ...courseForm, description: e.target.value })} placeholder="Course syllabus summary..." />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>Category</label>
              <select value={courseForm.category} onChange={e => setCourseForm({ ...courseForm, category: e.target.value })}>
                <option value="Web Development">Web Development</option>
                <option value="Data Science">Data Science</option>
                <option value="Design">Design</option>
                <option value="Backend Development">Backend Development</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>Price (₹)</label>
              <input type="number" required value={courseForm.price} onChange={e => setCourseForm({ ...courseForm, price: e.target.value })} />
            </div>
          </div>

          <button type="submit" className="curious-btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: '0.5rem' }}>
            {editingCourse ? "Update Course" : "Publish Course"}
          </button>
        </form>
      </Modal>

      {/* SCHEDULE LIVE CLASS MODAL */}
      <Modal isOpen={isClassModalOpen} onClose={() => setIsClassModalOpen(false)} title="Schedule Online Live Class">
        <form onSubmit={handleScheduleClass} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>Class Session Title</label>
            <input type="text" required value={classForm.title} onChange={e => setClassForm({ ...classForm, title: e.target.value })} placeholder="e.g. React Hooks Live Code Review" />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>Subject / Category</label>
            <input type="text" required value={classForm.subject} onChange={e => setClassForm({ ...classForm, subject: e.target.value })} placeholder="e.g. Web Development / Data Science" />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>Select Target Course</label>
            <select value={classForm.courseId} onChange={e => setClassForm({ ...classForm, courseId: e.target.value })}>
              <option value="">General Session (No specific course)</option>
              {courses.map(c => (
                <option key={c._id} value={c._id}>{c.title}</option>
              ))}
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>Platform</label>
              <select value={classForm.platform} onChange={e => setClassForm({ ...classForm, platform: e.target.value })}>
                <option value="Google Meet">Google Meet</option>
                <option value="Zoom">Zoom</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>Teaching Duration (Mins)</label>
              <input type="number" required value={classForm.durationMinutes} onChange={e => setClassForm({ ...classForm, durationMinutes: e.target.value })} placeholder="e.g. 60" />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>Meeting Link (Google Meet / Zoom URL)</label>
            <input type="text" required value={classForm.meetingLink} onChange={e => setClassForm({ ...classForm, meetingLink: e.target.value })} placeholder="https://meet.google.com/abc-defg-hij" />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>Scheduled Date & Time</label>
            <input type="datetime-local" required value={classForm.scheduledAt} onChange={e => setClassForm({ ...classForm, scheduledAt: e.target.value })} />
          </div>

          <button type="submit" className="curious-btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: '0.5rem', backgroundColor: '#ef4444', borderColor: '#ef4444' }}>
            <Video size={18} /> Schedule Class & Notify Students
          </button>
        </form>
      </Modal>
    </div>
  );
}
