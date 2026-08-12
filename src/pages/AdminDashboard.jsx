import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Modal } from '../components/Modal';
import { AdminExamView } from '../components/AdminExamView';
import { Search, Filter, Shield, Users, BookOpen, Video, Trash2, Edit, CheckCircle, XCircle, Plus, Calendar, Clock, Download, Play, ShieldCheck, AlertCircle } from '../components/Icons';

export function AdminDashboard({ activeTab = 'teachers', setToast }) {
  const { user } = useAuth();
  
  // Data States
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [classes, setClasses] = useState([]);
  const [notes, setNotes] = useState([]);
  const [videos, setVideos] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters & Searches
  const [teacherSearch, setTeacherSearch] = useState('');
  const [courseSearch, setCourseSearch] = useState('');
  const [purchaseSearch, setPurchaseSearch] = useState('');
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('all');

  // Modals State
  const [isEditUserOpen, setIsEditUserOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [editUserForm, setEditUserForm] = useState({ name: '', role: 'teacher', status: 'active', qualification: '', bio: '' });

  const [isClassModalOpen, setIsClassModalOpen] = useState(false);
  const [classForm, setClassForm] = useState({
    title: '',
    description: '',
    subject: 'General',
    courseId: '',
    meetingLink: '',
    platform: 'Google Meet',
    scheduledAt: new Date(Date.now() + 86400000).toISOString().slice(0, 16),
    durationMinutes: 60
  });

  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [noteForm, setNoteForm] = useState({
    title: '',
    description: '',
    fileUrl: '',
    subject: 'General',
    courseId: ''
  });

  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [videoForm, setVideoForm] = useState({
    title: '',
    description: '',
    videoUrl: '',
    duration: '1h 15m',
    thumbnail: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&auto=format&fit=crop&q=80',
    subject: 'General',
    courseId: ''
  });

  const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);
  const [courseForm, setCourseForm] = useState({
    title: '',
    description: '',
    category: 'Web Development',
    price: 49,
    level: 'Beginner',
    duration: '10 hours'
  });

  const loadAdminData = async () => {
    setLoading(true);
    try {
      const [statsRes, usersRes, teachersRes, coursesRes, classesRes, notesRes, videosRes, enrollmentsRes] = await Promise.all([
        api.getAdminStats(),
        api.getUsers(),
        api.getTeachers(),
        api.getCourses(),
        api.getClasses(),
        api.getNotes(),
        api.getVideos(),
        api.getAllEnrollments()
      ]);

      setStats(statsRes?.stats || null);
      setUsers(usersRes?.users || []);
      const teacherList = teachersRes?.users || teachersRes?.teachers || [];
      setTeachers(teacherList);
      setCourses(coursesRes?.courses || []);
      setClasses(classesRes.classes || []);
      setNotes(notesRes.notes || []);
      setVideos(videosRes.videos || []);
      setEnrollments(enrollmentsRes.enrollments || []);
    } catch (err) {
      console.error('Error loading Admin Panel data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && (user.role === 'teacher' || user.role === 'admin')) {
      loadAdminData();
    }
  }, [user]);

  // Authorization Check: Only Teachers (and Admins) allowed
  if (!user || (user.role !== 'teacher' && user.role !== 'admin')) {
    return (
      <div style={{ paddingTop: '7rem', paddingBottom: '5rem', minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', paddingLeft: '1.5rem', paddingRight: '1.5rem' }}>
        <div style={{ maxWidth: '520px', backgroundColor: 'var(--bg-card)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '20px', padding: '3rem 2rem', boxShadow: '0 20px 40px rgba(0,0,0,0.5)' }}>
          <div style={{ width: '4rem', height: '4rem', borderRadius: '50%', backgroundColor: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
            <AlertCircle size={32} />
          </div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.8rem' }}>
            Admin Panel Access Restricted
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: '1.8rem', lineHeight: 1.6 }}>
            The Admin Panel is accessible only to registered <strong>Teachers</strong> and Faculty members. Students do not have permission to access management features.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <span style={{ fontSize: '0.85rem', color: '#ef4444', fontWeight: 700, padding: '0.5rem 1rem', backgroundColor: 'rgba(239, 68, 68, 0.1)', borderRadius: '8px' }}>
              Logged in as: {user ? `${user.name} (${user.role.toUpperCase()})` : 'Guest User'}
            </span>
          </div>
        </div>
      </div>
    );
  }

  // --- Handlers ---
  const handleToggleReceiptStatus = async (item) => {
    try {
      const isCurrentlyPending = item.receiptStatus === 'Pending' || item.receiptStatus === 'Pending Verification' || item.receiptReceived === false;
      const newReceivedStatus = isCurrentlyPending ? true : false;
      const newReceiptLabel = newReceivedStatus ? 'Received' : 'Pending';
      await api.updateEnrollmentReceiptStatus(item._id, {
        receiptReceived: newReceivedStatus,
        receiptStatus: newReceiptLabel
      });
      if (setToast) setToast({ message: `Payment receipt status updated to "${newReceiptLabel}"`, type: 'success' });
      loadAdminData();
    } catch (err) {
      if (setToast) setToast({ message: err.message || 'Action failed', type: 'danger' });
    }
  };

  const handleToggleUserStatus = async (targetUser) => {
    try {
      const newStatus = targetUser.status === 'active' ? 'inactive' : 'active';
      await api.toggleUserStatus(targetUser._id, newStatus);
      if (setToast) setToast({ message: `User account status set to ${newStatus}`, type: 'success' });
      loadAdminData();
    } catch (err) {
      if (setToast) setToast({ message: err.message || 'Action failed', type: 'danger' });
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to permanently delete this user account? This action cannot be undone.')) return;
    try {
      await api.deleteUser(userId);
      if (setToast) setToast({ message: 'User account permanently deleted.', type: 'success' });
      loadAdminData();
    } catch (err) {
      if (setToast) setToast({ message: err.message || 'Action failed', type: 'danger' });
    }
  };

  const handleSaveUser = async (e) => {
    e.preventDefault();

    if (!editUserForm.name.trim() || !editUserForm.qualification.trim() || !editUserForm.bio.trim()) {
      if (setToast) setToast({ message: 'All fields are mandatory. Please fill in name, qualification, and bio.', type: 'danger' });
      return;
    }

    const nameLettersCount = editUserForm.name.trim().replace(/[^a-zA-Z]/g, '').length;
    if (nameLettersCount < 4) {
      if (setToast) setToast({ message: 'Name must contain at least 4 letters.', type: 'danger' });
      return;
    }

    try {
      await api.updateUser(selectedUser._id, editUserForm);
      if (setToast) setToast({ message: 'Teacher details updated successfully!', type: 'success' });
      setIsEditUserOpen(false);
      loadAdminData();
    } catch (err) {
      if (setToast) setToast({ message: err.message || 'Update failed', type: 'danger' });
    }
  };

  const handleScheduleClassSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.scheduleClass(classForm);
      if (setToast) setToast({ message: `Online class "${classForm.title}" scheduled successfully!`, type: 'success' });
      setIsClassModalOpen(false);
      setClassForm({ title: '', description: '', subject: 'General', courseId: '', meetingLink: '', platform: 'Google Meet', scheduledAt: new Date(Date.now() + 86400000).toISOString().slice(0, 16), durationMinutes: 60 });
      loadAdminData();
    } catch (err) {
      if (setToast) setToast({ message: err.message || 'Failed to schedule class', type: 'danger' });
    }
  };

  const handleCreateNoteSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.createNote(noteForm);
      if (setToast) setToast({ message: `Class note "${noteForm.title}" provided for students!`, type: 'success' });
      setIsNoteModalOpen(false);
      setNoteForm({ title: '', description: '', fileUrl: '', subject: 'General', courseId: '' });
      loadAdminData();
    } catch (err) {
      if (setToast) setToast({ message: err.message || 'Failed to create note', type: 'danger' });
    }
  };

  const handleDeleteNote = async (id) => {
    if (!window.confirm('Delete this class note resource?')) return;
    try {
      await api.deleteNote(id);
      if (setToast) setToast({ message: 'Note deleted', type: 'success' });
      loadAdminData();
    } catch (err) {
      if (setToast) setToast({ message: err.message || 'Delete failed', type: 'danger' });
    }
  };

  const handleCreateVideoSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.createVideo(videoForm);
      if (setToast) setToast({ message: `Recorded video lecture "${videoForm.title}" uploaded!`, type: 'success' });
      setIsVideoModalOpen(false);
      setVideoForm({ title: '', description: '', videoUrl: '', duration: '1h 15m', thumbnail: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&auto=format&fit=crop&q=80', subject: 'General', courseId: '' });
      loadAdminData();
    } catch (err) {
      if (setToast) setToast({ message: err.message || 'Failed to upload video', type: 'danger' });
    }
  };

  const handleDeleteVideo = async (id) => {
    if (!window.confirm('Delete this recorded lecture video?')) return;
    try {
      await api.deleteVideo(id);
      if (setToast) setToast({ message: 'Recorded video deleted', type: 'success' });
      loadAdminData();
    } catch (err) {
      if (setToast) setToast({ message: err.message || 'Delete failed', type: 'danger' });
    }
  };

  const handleCreateCourseSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.createCourse(courseForm);
      if (setToast) setToast({ message: `New course "${courseForm.title}" published!`, type: 'success' });
      setIsCourseModalOpen(false);
      setCourseForm({ title: '', description: '', category: 'Web Development', price: 49, level: 'Beginner', duration: '10 hours' });
      loadAdminData();
    } catch (err) {
      if (setToast) setToast({ message: err.message || 'Course creation failed', type: 'danger' });
    }
  };

  const handleDeleteCourse = async (courseId) => {
    if (!window.confirm('Are you sure you want to delete this course?')) return;
    try {
      await api.deleteCourse(courseId);
      if (setToast) setToast({ message: 'Course removed', type: 'success' });
      loadAdminData();
    } catch (err) {
      if (setToast) setToast({ message: err.message || 'Delete failed', type: 'danger' });
    }
  };

  const handleDeleteClass = async (classId) => {
    if (!window.confirm('Cancel and delete this live class?')) return;
    try {
      await api.deleteClass(classId);
      if (setToast) setToast({ message: 'Class session deleted', type: 'success' });
      loadAdminData();
    } catch (err) {
      if (setToast) setToast({ message: err.message || 'Action failed', type: 'danger' });
    }
  };

  const filteredTeachersList = teachers.filter(t => 
    t.name.toLowerCase().includes(teacherSearch.toLowerCase()) || 
    t.email.toLowerCase().includes(teacherSearch.toLowerCase()) ||
    (t.profile?.qualification || '').toLowerCase().includes(teacherSearch.toLowerCase())
  );

  const filteredPurchasesList = enrollments.filter(e =>
    (e.studentName || '').toLowerCase().includes(purchaseSearch.toLowerCase()) ||
    (e.studentEmail || '').toLowerCase().includes(purchaseSearch.toLowerCase()) ||
    (e.courseTitle || '').toLowerCase().includes(purchaseSearch.toLowerCase()) ||
    (e.paymentMode || '').toLowerCase().includes(purchaseSearch.toLowerCase())
  );

  const filteredUsersList = users.filter(u => {
    const matchesSearch = 
      u.name.toLowerCase().includes(userSearch.toLowerCase()) || 
      u.email.toLowerCase().includes(userSearch.toLowerCase());
    const matchesRole = userRoleFilter === 'all' || u.role === userRoleFilter;
    return matchesSearch && matchesRole;
  });

  if (loading) {
    return <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading Teacher Admin Panel environment...</div>;
  }

  return (
    <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Teacher Admin Panel Top Banner */}
      <div className="glass-panel" style={{
        padding: '2rem',
        background: 'linear-gradient(135deg, rgba(30, 64, 175, 0.25) 0%, rgba(59, 130, 246, 0.15) 100%)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1.2rem',
        border: '1px solid rgba(59, 130, 246, 0.3)'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#3b82f6', textTransform: 'uppercase', letterSpacing: '0.08em', backgroundColor: 'rgba(59, 130, 246, 0.15)', padding: '0.25rem 0.75rem', borderRadius: '50px', border: '1px solid rgba(59, 130, 246, 0.3)' }}>
              TEACHER ADMIN PANEL
            </span>
            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#10b981', backgroundColor: 'rgba(16, 185, 129, 0.15)', padding: '0.25rem 0.75rem', borderRadius: '50px', border: '1px solid rgba(16, 185, 129, 0.3)', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
              <ShieldCheck size={14} /> VERIFIED EMAIL & ACCOUNT
            </span>
          </div>
          <h2 style={{ fontSize: '1.8rem', color: 'var(--text-main)', marginTop: '0.2rem', fontWeight: 800 }}>
            Teacher & System Administration Studio
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', marginTop: '0.2rem', maxWidth: '650px' }}>
            Authorized teacher control desk to manage faculty, schedule live online classes, provide PDF notes, upload recorded lecture videos, and create courses.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
          <button onClick={() => setIsClassModalOpen(true)} className="curious-btn-primary" style={{ padding: '0.6rem 1rem', fontSize: '0.85rem', backgroundColor: '#ef4444', borderColor: '#ef4444' }}>
            <Video size={16} /> Schedule Class
          </button>
          <button onClick={() => setIsNoteModalOpen(true)} className="curious-btn-primary" style={{ padding: '0.6rem 1rem', fontSize: '0.85rem', backgroundColor: '#3b82f6', borderColor: '#3b82f6' }}>
            <Plus size={16} /> Provide Notes
          </button>
          <button onClick={() => setIsVideoModalOpen(true)} className="curious-btn-primary" style={{ padding: '0.6rem 1rem', fontSize: '0.85rem', backgroundColor: '#10b981', borderColor: '#10b981' }}>
            <Play size={16} /> Upload Video
          </button>
          <button onClick={() => setIsCourseModalOpen(true)} className="curious-btn-outline" style={{ padding: '0.6rem 1rem', fontSize: '0.85rem' }}>
            <BookOpen size={16} /> Add Course
          </button>
        </div>
      </div>

      {/* Verified Admin Account Identity Box */}
      <div style={{
        backgroundColor: 'rgba(16, 185, 129, 0.08)',
        border: '1px solid rgba(16, 185, 129, 0.3)',
        borderRadius: 'var(--radius-md)',
        padding: '1.2rem 1.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{
            width: '2.8rem',
            height: '2.8rem',
            borderRadius: '50%',
            backgroundColor: 'rgba(16, 185, 129, 0.2)',
            color: '#10b981',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <ShieldCheck size={26} />
          </div>
          <div>
            <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#10b981', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              OFFICIAL VERIFIED ADMIN CREDENTIALS
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-main)', marginTop: '0.15rem' }}>
              <strong>Admin ID / Email:</strong> <code style={{ color: '#3b82f6', backgroundColor: 'rgba(59, 130, 246, 0.1)', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>admin@bkteachingcenter.com</code> &nbsp;|&nbsp; 
              <strong>Password:</strong> <code style={{ color: '#f59e0b', backgroundColor: 'rgba(245, 158, 11, 0.1)', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>AdminPassword2026!</code>
            </div>
          </div>
        </div>
        <div style={{
          backgroundColor: 'rgba(16, 185, 129, 0.2)',
          color: '#10b981',
          padding: '0.4rem 0.8rem',
          borderRadius: '20px',
          fontSize: '0.78rem',
          fontWeight: 800,
          border: '1px solid rgba(16, 185, 129, 0.4)'
        }}>
          ✓ REAL & VERIFIED EMAIL
        </div>
      </div>

      {/* Metrics Row */}
      {stats && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1.25rem' }}>
          <div className="glass-card">
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Course Purchases</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#10b981', marginTop: '0.2rem' }}>{enrollments.length}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>Enrolled Student Orders</div>
          </div>

          <div className="glass-card">
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Active Teachers</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#3b82f6', marginTop: '0.2rem' }}>{teachers.length || stats.totalTeachers}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>Verified Faculty Instructors</div>
          </div>

          <div className="glass-card">
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Scheduled Live Classes</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#ef4444', marginTop: '0.2rem' }}>{classes.length}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>Google Meet & Zoom sessions</div>
          </div>

          <div className="glass-card">
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Provided Class Notes</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#f59e0b', marginTop: '0.2rem' }}>{notes.length}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>Downloadable chapter PDFs</div>
          </div>

          <div className="glass-card">
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Recorded Videos</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#a855f7', marginTop: '0.2rem' }}>{videos.length}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>Recorded lecture replays</div>
          </div>
        </div>
      )}

      {/* SECTION: Board Exam Management */}
      {activeTab === 'exams' && (
        <AdminExamView setToast={setToast} />
      )}

      {/* SECTION: Course Purchases & Payment Receipts (Main Feature) */}
      {(activeTab === 'purchases' || activeTab === 'overview' || activeTab === 'stats' || activeTab === 'teachers') && (
        <div className="glass-panel" style={{ padding: '1.5rem', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.3rem' }}>
                <span className="badge badge-student" style={{ backgroundColor: '#10b981', color: '#fff', fontWeight: 800 }}>
                  LIVE TRANSACTION AUDIT
                </span>
                <span style={{ fontSize: '0.75rem', color: '#60a5fa', fontWeight: 700 }}>
                  Total Orders: {enrollments.length}
                </span>
              </div>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-main)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <BookOpen style={{ color: '#10b981' }} /> Student Course Purchases & Payment Receipts ({filteredPurchasesList.length})
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                Real-time purchase details including purchasing student, course title, payment mode, amount paid, and receipt verification status.
              </p>
            </div>

            <div style={{ position: 'relative', width: '300px' }}>
              <Search size={16} style={{ position: 'absolute', left: '0.8rem', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }} />
              <input 
                type="text" 
                placeholder="Search by student, course, payment mode..." 
                value={purchaseSearch} 
                onChange={e => setPurchaseSearch(e.target.value)} 
                style={{ paddingLeft: '2.2rem', padding: '0.55rem 0.8rem 0.55rem 2.2rem', fontSize: '0.85rem' }} 
              />
            </div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Purchasing Student</th>
                  <th>Purchased Course</th>
                  <th>Payment Mode</th>
                  <th>Amount Paid</th>
                  <th>Receipt / Slip Status</th>
                  <th style={{ textAlign: 'right' }}>Admin Verification Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPurchasesList.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                      No course purchase records found matching your search.
                    </td>
                  </tr>
                ) : (
                  filteredPurchasesList.map((item) => {
                    const isReceiptReceived = item.receiptReceived !== false && item.receiptStatus !== 'Pending Verification';

                    return (
                      <tr key={item._id}>
                        {/* 1. Which student purchased the course */}
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <img 
                              src={item.studentAvatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${item.studentName || 'Student'}`} 
                              alt={item.studentName} 
                              style={{ width: '36px', height: '36px', borderRadius: '50%', border: '1px solid #3b82f6', objectFit: 'cover' }}
                            />
                            <div>
                              <div style={{ fontWeight: 800, fontSize: '0.92rem', color: 'var(--text-main)' }}>
                                {item.studentName || 'Unknown Student'}
                              </div>
                              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                                {item.studentEmail || 'student@learn.com'}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* 2. Which course they purchased */}
                        <td>
                          <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#60a5fa' }}>
                            {item.courseTitle || 'Accredited Course'}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            Category: {item.courseCategory || 'General'}
                          </div>
                        </td>

                        {/* 3. Payment mode */}
                        <td>
                          <span className="badge badge-student" style={{
                            backgroundColor: 'rgba(59, 130, 246, 0.15)',
                            color: '#60a5fa',
                            border: '1px solid rgba(59, 130, 246, 0.3)',
                            fontWeight: 700,
                            fontSize: '0.78rem'
                          }}>
                            {item.paymentMode || 'Instant UPI / QR Code'}
                          </span>
                          {item.transactionId && (
                            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                              Ref: {item.transactionId}
                            </div>
                          )}
                        </td>

                        {/* 4. Amount paid */}
                        <td>
                          <div style={{ fontSize: '1.05rem', fontWeight: 900, color: '#10b981' }}>
                            ₹{item.amountPaid !== undefined ? item.amountPaid : (item.coursePrice || 3920)}
                          </div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                            {new Date(item.enrolledAt || Date.now()).toLocaleDateString()}
                          </div>
                        </td>

                        {/* 5. Whether payment receipt/slip was received or not */}
                        <td>
                          {(() => {
                            const isPending = item.receiptStatus === 'Pending' || item.receiptStatus === 'Pending Verification';
                            const isReceiptReceived = item.receiptReceived !== false && !isPending;
                            return (
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                                <span className="badge badge-student" style={{
                                  backgroundColor: isPending ? 'rgba(245, 158, 11, 0.18)' : (isReceiptReceived ? 'rgba(16, 185, 129, 0.18)' : 'rgba(239, 68, 68, 0.18)'),
                                  color: isPending ? '#f59e0b' : (isReceiptReceived ? '#10b981' : '#ef4444'),
                                  border: `1px solid ${isPending ? 'rgba(245, 158, 11, 0.4)' : (isReceiptReceived ? 'rgba(16, 185, 129, 0.4)' : 'rgba(239, 68, 68, 0.4)')}`,
                                  fontWeight: 800,
                                  fontSize: '0.78rem',
                                  width: 'fit-content'
                                }}>
                                  {isPending ? '⏳ PENDING VERIFICATION' : (isReceiptReceived ? '✓ RECEIPT RECEIVED' : '⚠️ NOT RECEIVED')}
                                </span>

                                {item.receiptUrl && (
                                  <a 
                                    href={item.receiptUrl} 
                                    target="_blank" 
                                    rel="noreferrer" 
                                    style={{ fontSize: '0.75rem', color: '#3b82f6', textDecoration: 'underline', fontWeight: 600 }}
                                  >
                                    View Uploaded Slip 📄
                                  </a>
                                )}
                              </div>
                            );
                          })()}
                        </td>

                        {/* Action to Toggle Status */}
                        <td style={{ textAlign: 'right' }}>
                          <button 
                            className={(() => {
                              const isPending = item.receiptStatus === 'Pending' || item.receiptStatus === 'Pending Verification';
                              const isReceiptReceived = item.receiptReceived !== false && !isPending;
                              return isReceiptReceived ? 'btn-secondary' : 'curious-btn-primary';
                            })()} 
                            style={{ 
                              padding: '0.4rem 0.8rem', 
                              fontSize: '0.78rem',
                              backgroundColor: (() => {
                                const isPending = item.receiptStatus === 'Pending' || item.receiptStatus === 'Pending Verification';
                                const isReceiptReceived = item.receiptReceived !== false && !isPending;
                                return isReceiptReceived ? 'transparent' : '#10b981';
                              })(),
                              borderColor: (() => {
                                const isPending = item.receiptStatus === 'Pending' || item.receiptStatus === 'Pending Verification';
                                const isReceiptReceived = item.receiptReceived !== false && !isPending;
                                return isReceiptReceived ? 'var(--border-color)' : '#10b981';
                              })()
                            }}
                            onClick={() => handleToggleReceiptStatus(item)}
                          >
                            {(() => {
                              const isPending = item.receiptStatus === 'Pending' || item.receiptStatus === 'Pending Verification';
                              const isReceiptReceived = item.receiptReceived !== false && !isPending;
                              return isReceiptReceived ? 'Mark Pending' : 'Verify & Mark Received ✓';
                            })()}
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SECTION 1: View & Manage Teachers */}
      {(activeTab === 'teachers' || activeTab === 'stats' || activeTab === 'overview') && (
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h3 style={{ fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
                <Users style={{ color: '#3b82f6' }} /> View & Manage Faculty Teachers ({filteredTeachersList.length})
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                View teacher details, qualifications, subject specialization, and account status.
              </p>
            </div>

            <div style={{ position: 'relative', width: '280px' }}>
              <Search size={16} style={{ position: 'absolute', left: '0.8rem', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }} />
              <input 
                type="text" 
                placeholder="Search teacher by name or subject..." 
                value={teacherSearch} 
                onChange={e => setTeacherSearch(e.target.value)} 
                style={{ paddingLeft: '2.2rem', padding: '0.5rem 0.8rem 0.5rem 2.2rem', fontSize: '0.85rem' }} 
              />
            </div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Teacher Name & Email</th>
                  <th>Qualification & Designation</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTeachersList.map(t => (
                  <tr key={t._id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <img 
                          src={t.profile?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${t.name}`} 
                          alt={t.name} 
                          style={{ width: '36px', height: '36px', borderRadius: '50%', border: '1px solid var(--border-color)' }}
                        />
                        <div>
                          <div style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--text-main)' }}>{t.name}</div>
                          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{t.email}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div style={{ fontSize: '0.88rem', fontWeight: 600, color: '#3b82f6' }}>{t.profile?.qualification || 'Certified Instructor'}</div>
                      <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', maxWidth: '280px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {t.profile?.bio || 'Teaching faculty at BK Teaching Center.'}
                      </div>
                    </td>
                    <td>
                      <span className="badge badge-teacher">TEACHER</span>
                    </td>
                    <td>
                      <span className={`badge badge-${t.status}`}>{t.status}</span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                        <button 
                          className={t.status === 'active' ? 'btn-danger' : 'btn-success'} 
                          style={{ padding: '0.35rem 0.65rem', fontSize: '0.78rem' }}
                          onClick={() => handleToggleUserStatus(t)}
                        >
                          {t.status === 'active' ? 'Deactivate' : 'Activate'}
                        </button>
                        <button 
                          className="btn-secondary" 
                          style={{ padding: '0.35rem 0.65rem', fontSize: '0.78rem' }}
                          onClick={() => {
                            setSelectedUser(t);
                            setEditUserForm({ 
                              name: t.name, 
                              role: t.role, 
                              status: t.status, 
                              qualification: t.profile?.qualification || '', 
                              bio: t.profile?.bio || '' 
                            });
                            setIsEditUserOpen(true);
                          }}
                        >
                          <Edit size={14} /> Edit
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SECTION 1.5: View & Manage Registered Users */}
      {activeTab === 'users' && (
        <div className="glass-panel" style={{ padding: '1.5rem', border: '1px solid rgba(59, 130, 246, 0.3)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.3rem' }}>
                <span className="badge badge-student" style={{ backgroundColor: '#3b82f6', color: '#fff', fontWeight: 800 }}>
                  SYSTEM USER DIRECTORY
                </span>
                <span style={{ fontSize: '0.75rem', color: '#60a5fa', fontWeight: 700 }}>
                  Total Registered Accounts: {users.length}
                </span>
              </div>
              <h3 style={{ fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0, fontWeight: 800, color: 'var(--text-main)' }}>
                <Users style={{ color: '#3b82f6' }} /> View & Manage Registered Users ({filteredUsersList.length})
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                Monitor system-wide registered student, teacher, and administrator accounts, login frequency, and session details.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '0.8rem', flexWrap: 'wrap', alignItems: 'center' }}>
              {/* Role Filter */}
              <select 
                value={userRoleFilter} 
                onChange={e => setUserRoleFilter(e.target.value)}
                style={{ padding: '0.5rem', fontSize: '0.85rem', width: '130px' }}
              >
                <option value="all">All Roles</option>
                <option value="student">Students</option>
                <option value="teacher">Teachers</option>
                <option value="admin">Admins</option>
              </select>

              {/* Search */}
              <div style={{ position: 'relative', width: '250px' }}>
                <Search size={16} style={{ position: 'absolute', left: '0.8rem', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }} />
                <input 
                  type="text" 
                  placeholder="Search name or email..." 
                  value={userSearch} 
                  onChange={e => setUserSearch(e.target.value)} 
                  style={{ paddingLeft: '2.2rem', padding: '0.5rem 0.8rem 0.5rem 2.2rem', fontSize: '0.85rem' }} 
                />
              </div>
            </div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table className="custom-table">
              <thead>
                <tr>
                  <th>User Details</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Registered On</th>
                  <th>Last Login Time</th>
                  <th style={{ textAlign: 'center' }}>Total Logins</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsersList.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                      No registered user accounts found matching search filters.
                    </td>
                  </tr>
                ) : (
                  filteredUsersList.map(u => (
                    <tr key={u._id}>
                      {/* Name and email */}
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <img 
                            src={u.profile?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(u.name)}`} 
                            alt={u.name} 
                            style={{ width: '36px', height: '36px', borderRadius: '50%', border: '1px solid var(--border-color)', objectFit: 'cover' }}
                          />
                          <div>
                            <div style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--text-main)' }}>{u.name}</div>
                            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{u.email}</div>
                          </div>
                        </div>
                      </td>

                      {/* Role */}
                      <td>
                        <span className={`badge badge-${u.role === 'admin' ? 'admin' : u.role === 'teacher' ? 'teacher' : 'student'}`} style={{ textTransform: 'uppercase', fontWeight: 800 }}>
                          {u.role}
                        </span>
                      </td>

                      {/* Status */}
                      <td>
                        <span className={`badge badge-${u.status}`}>{u.status}</span>
                      </td>

                      {/* Registration timestamp */}
                      <td>
                        <div style={{ fontSize: '0.82rem', color: 'var(--text-main)', fontWeight: 600 }}>
                          {new Date(u.createdAt).toLocaleDateString()}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                          {new Date(u.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </td>

                      {/* Last login timestamp */}
                      <td>
                        {u.lastLoginAt ? (
                          <>
                            <div style={{ fontSize: '0.82rem', color: 'var(--text-main)', fontWeight: 600 }}>
                              {new Date(u.lastLoginAt).toLocaleDateString()}
                            </div>
                            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                              {new Date(u.lastLoginAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          </>
                        ) : (
                          <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                            Never logged in
                          </span>
                        )}
                      </td>

                      {/* Login frequency */}
                      <td style={{ textAlign: 'center' }}>
                        <span style={{ 
                          display: 'inline-block',
                          padding: '0.2rem 0.5rem',
                          borderRadius: '6px',
                          backgroundColor: (u.loginCount || 0) > 0 ? 'rgba(59, 130, 246, 0.15)' : 'rgba(255,255,255,0.05)',
                          color: (u.loginCount || 0) > 0 ? '#60a5fa' : 'var(--text-muted)',
                          fontWeight: 800,
                          fontSize: '0.85rem'
                        }}>
                          {u.loginCount || 0}
                        </span>
                      </td>

                      {/* Actions */}
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                          <button 
                            className={u.status === 'active' ? 'btn-danger' : 'btn-success'} 
                            style={{ padding: '0.35rem 0.65rem', fontSize: '0.78rem' }}
                            onClick={() => handleToggleUserStatus(u)}
                          >
                            {u.status === 'active' ? 'Deactivate' : 'Activate'}
                          </button>
                          {u.role !== 'admin' && (
                            <button 
                              className="btn-danger"
                              style={{ padding: '0.35rem 0.65rem', fontSize: '0.78rem', backgroundColor: '#ef4444', borderColor: '#ef4444', color: '#fff' }}
                              onClick={() => handleDeleteUser(u._id)}
                            >
                              <Trash2 size={14} /> Delete
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SECTION 2: Schedule Online Classes */}
      {(activeTab === 'classes' || activeTab === 'schedule') && (
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h3 style={{ fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
                <Video style={{ color: '#ef4444' }} /> Schedule & Manage Online Live Classes ({classes.length})
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                Schedule interactive live sessions on Google Meet or Zoom for your enrolled students.
              </p>
            </div>
            <button onClick={() => setIsClassModalOpen(true)} className="curious-btn-primary" style={{ padding: '0.55rem 1rem', fontSize: '0.85rem', backgroundColor: '#ef4444', borderColor: '#ef4444' }}>
              <Plus size={16} /> Schedule Live Class
            </button>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Class Title</th>
                  <th>Subject</th>
                  <th>Platform</th>
                  <th>Scheduled Date & Time</th>
                  <th>Instructor</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {classes.map(cls => (
                  <tr key={cls._id}>
                    <td>
                      <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>{cls.title}</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{cls.joinUrl || cls.meetingLink}</div>
                    </td>
                    <td><span className="badge badge-student">{cls.subject || cls.courseCategory || 'General'}</span></td>
                    <td><span className="badge badge-live">{cls.platform || 'Google Meet'}</span></td>
                    <td style={{ fontSize: '0.85rem' }}>{new Date(cls.scheduledAt || cls.startTime).toLocaleString()}</td>
                    <td style={{ fontSize: '0.85rem', fontWeight: 600 }}>{cls.teacherName}</td>
                    <td><span className={`badge badge-${cls.status}`}>{cls.status}</span></td>
                    <td style={{ textAlign: 'right' }}>
                      <button className="btn-danger" style={{ padding: '0.35rem 0.65rem', fontSize: '0.78rem' }} onClick={() => handleDeleteClass(cls._id)}>
                        <Trash2 size={14} /> Cancel
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SECTION 3: Provide Class Notes */}
      {(activeTab === 'notes' || activeTab === 'resources') && (
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h3 style={{ fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
                <BookOpen style={{ color: '#f59e0b' }} /> Provide Class Notes & Handouts ({notes.length})
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                Upload PDF lecture notes, formula sheets, and chapter summaries for your students.
              </p>
            </div>
            <button onClick={() => setIsNoteModalOpen(true)} className="curious-btn-primary" style={{ padding: '0.55rem 1rem', fontSize: '0.85rem', backgroundColor: '#f59e0b', borderColor: '#f59e0b' }}>
              <Plus size={16} /> Provide Class Note
            </button>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Note Title & Details</th>
                  <th>Subject</th>
                  <th>Course Reference</th>
                  <th>Teacher</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {notes.map(note => (
                  <tr key={note._id}>
                    <td>
                      <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>{note.title}</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{note.description}</div>
                    </td>
                    <td><span className="badge badge-student">{note.subject || 'General'}</span></td>
                    <td style={{ fontSize: '0.85rem', color: '#3b82f6', fontWeight: 600 }}>{note.courseTitle || 'All Courses'}</td>
                    <td style={{ fontSize: '0.85rem' }}>{note.teacherName || user.name}</td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                        <a href={note.fileUrl} target="_blank" rel="noreferrer" className="btn-secondary" style={{ padding: '0.35rem 0.65rem', fontSize: '0.78rem', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                          <Download size={14} /> Open Document
                        </a>
                        <button className="btn-danger" style={{ padding: '0.35rem 0.65rem', fontSize: '0.78rem' }} onClick={() => handleDeleteNote(note._id)}>
                          <Trash2 size={14} /> Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SECTION 4: Upload Recorded Class Videos */}
      {(activeTab === 'videos' || activeTab === 'recordings') && (
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h3 style={{ fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
                <Play style={{ color: '#10b981' }} /> Upload Recorded Class Video Lectures ({videos.length})
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                Upload or link recorded video lectures for students who missed live sessions.
              </p>
            </div>
            <button onClick={() => setIsVideoModalOpen(true)} className="curious-btn-primary" style={{ padding: '0.55rem 1rem', fontSize: '0.85rem', backgroundColor: '#10b981', borderColor: '#10b981' }}>
              <Plus size={16} /> Upload Class Video
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
            {videos.map(vid => (
              <div key={vid._id} style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '14px', padding: '1.2rem', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                <div style={{ height: '140px', borderRadius: '10px', overflow: 'hidden', position: 'relative', backgroundColor: '#000' }}>
                  <img src={vid.thumbnail || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&auto=format&fit=crop&q=80'} alt={vid.title} style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.8 }} />
                  <span style={{ position: 'absolute', bottom: '8px', right: '8px', backgroundColor: 'rgba(0,0,0,0.8)', color: '#fff', fontSize: '0.75rem', padding: '0.15rem 0.5rem', borderRadius: '4px', fontWeight: 700 }}>
                    {vid.duration}
                  </span>
                </div>

                <div>
                  <span className="badge badge-student" style={{ marginBottom: '0.4rem' }}>{vid.subject || 'Lecture'}</span>
                  <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)', margin: '0.2rem 0' }}>{vid.title}</h4>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>{vid.description}</p>
                </div>

                <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.6rem', borderTop: '1px solid var(--border-color)' }}>
                  <a href={vid.videoUrl} target="_blank" rel="noreferrer" style={{ fontSize: '0.82rem', color: '#3b82f6', fontWeight: 700, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <Play size={14} /> Watch Lecture
                  </a>
                  <button className="btn-danger" style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }} onClick={() => handleDeleteVideo(vid._id)}>
                    <Trash2 size={14} /> Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION 5: Manage Courses */}
      {(activeTab === 'courses') && (
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <h3 style={{ fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <BookOpen className="text-primary" /> Manage Published Courses ({courses.length})
            </h3>
            <button onClick={() => setIsCourseModalOpen(true)} className="curious-btn-primary" style={{ padding: '0.55rem 1rem', fontSize: '0.85rem' }}>
              <Plus size={16} /> Create Course
            </button>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Course Title</th>
                  <th>Category</th>
                  <th>Level</th>
                  <th>Price</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {courses.map(c => (
                  <tr key={c._id}>
                    <td style={{ fontWeight: 600 }}>{c.title}</td>
                    <td><span className="badge badge-student">{c.category}</span></td>
                    <td><span className="badge badge-active">{c.level || 'Beginner'}</span></td>
                    <td style={{ fontWeight: 700, color: 'var(--accent)' }}>₹{c.price}</td>
                    <td style={{ textAlign: 'right' }}>
                      <button className="btn-danger" style={{ padding: '0.35rem 0.65rem', fontSize: '0.78rem' }} onClick={() => handleDeleteCourse(c._id)}>
                        <Trash2 size={14} /> Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL 1: Edit Teacher Modal */}
      <Modal isOpen={isEditUserOpen} onClose={() => setIsEditUserOpen(false)} title="Edit Teacher Information">
        {selectedUser && (
          <form onSubmit={handleSaveUser} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>Teacher Full Name *</label>
              <input type="text" value={editUserForm.name} onChange={e => setEditUserForm({ ...editUserForm, name: e.target.value })} required />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>Qualification & Title *</label>
              <input type="text" required placeholder="e.g. Ph.D. Physics, Senior Web Architect" value={editUserForm.qualification} onChange={e => setEditUserForm({ ...editUserForm, qualification: e.target.value })} />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>Bio & Specialization *</label>
              <textarea rows={3} required placeholder="Teacher experience and background..." value={editUserForm.bio} onChange={e => setEditUserForm({ ...editUserForm, bio: e.target.value })} style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', backgroundColor: 'var(--bg-dark)', border: '1px solid var(--border-color)', color: 'var(--text-main)' }} />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>Account Status</label>
              <select value={editUserForm.status} onChange={e => setEditUserForm({ ...editUserForm, status: e.target.value })}>
                <option value="active">Active</option>
                <option value="inactive">Inactive / Deactivated</option>
              </select>
            </div>

            <button type="submit" className="curious-btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: '0.5rem', backgroundColor: '#3b82f6' }}>
              Save Teacher Details
            </button>
          </form>
        )}
      </Modal>

      {/* MODAL 2: Schedule Class Modal */}
      <Modal isOpen={isClassModalOpen} onClose={() => setIsClassModalOpen(false)} title="Schedule Online Live Class">
        <form onSubmit={handleScheduleClassSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>Class Session Title</label>
            <input type="text" placeholder="e.g. Advanced Calculus: Integrals Live Session" value={classForm.title} onChange={e => setClassForm({ ...classForm, title: e.target.value })} required />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>Subject Area</label>
              <input type="text" placeholder="e.g. Mathematics, Physics, Web Dev" value={classForm.subject} onChange={e => setClassForm({ ...classForm, subject: e.target.value })} required />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>Platform</label>
              <select value={classForm.platform} onChange={e => setClassForm({ ...classForm, platform: e.target.value })}>
                <option value="Google Meet">Google Meet</option>
                <option value="Zoom">Zoom</option>
                <option value="YouTube Live">YouTube Live</option>
              </select>
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>Meeting Link / Join URL</label>
            <input type="url" placeholder="https://meet.google.com/abc-defg-hij" value={classForm.meetingLink} onChange={e => setClassForm({ ...classForm, meetingLink: e.target.value })} required />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>Date & Time</label>
              <input type="datetime-local" value={classForm.scheduledAt} onChange={e => setClassForm({ ...classForm, scheduledAt: e.target.value })} required />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>Duration (Mins)</label>
              <input type="number" value={classForm.durationMinutes} onChange={e => setClassForm({ ...classForm, durationMinutes: e.target.value })} required />
            </div>
          </div>

          <button type="submit" className="curious-btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: '0.5rem', backgroundColor: '#ef4444' }}>
            Schedule Live Class Session
          </button>
        </form>
      </Modal>

      {/* MODAL 3: Provide Class Note Modal */}
      <Modal isOpen={isNoteModalOpen} onClose={() => setIsNoteModalOpen(false)} title="Provide Class Notes / PDF Handout">
        <form onSubmit={handleCreateNoteSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>Note Title</label>
            <input type="text" placeholder="e.g. Chapter 4 Integration & Limits Formula Sheet.pdf" value={noteForm.title} onChange={e => setNoteForm({ ...noteForm, title: e.target.value })} required />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>Subject</label>
            <input type="text" placeholder="e.g. Mathematics" value={noteForm.subject} onChange={e => setNoteForm({ ...noteForm, subject: e.target.value })} required />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>Document / File URL (PDF Link)</label>
            <input type="url" placeholder="https://example.com/notes/math_ch4.pdf" value={noteForm.fileUrl} onChange={e => setNoteForm({ ...noteForm, fileUrl: e.target.value })} required />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>Description & Key Highlights</label>
            <textarea rows={3} placeholder="Brief summary of notes provided for student reference..." value={noteForm.description} onChange={e => setNoteForm({ ...noteForm, description: e.target.value })} style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', backgroundColor: 'var(--bg-dark)', border: '1px solid var(--border-color)', color: 'var(--text-main)' }} />
          </div>

          <button type="submit" className="curious-btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: '0.5rem', backgroundColor: '#f59e0b' }}>
            Publish & Provide Note
          </button>
        </form>
      </Modal>

      {/* MODAL 4: Upload Recorded Video Modal */}
      <Modal isOpen={isVideoModalOpen} onClose={() => setIsVideoModalOpen(false)} title="Upload Recorded Class Video Lecture">
        <form onSubmit={handleCreateVideoSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>Lecture Video Title</label>
            <input type="text" placeholder="e.g. Organic Reaction Mechanisms & Synthesis Lecture" value={videoForm.title} onChange={e => setVideoForm({ ...videoForm, title: e.target.value })} required />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>Subject</label>
              <input type="text" placeholder="e.g. Chemistry" value={videoForm.subject} onChange={e => setVideoForm({ ...videoForm, subject: e.target.value })} required />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>Duration</label>
              <input type="text" placeholder="1h 25m" value={videoForm.duration} onChange={e => setVideoForm({ ...videoForm, duration: e.target.value })} required />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>Video Embed / Replay URL</label>
            <input type="url" placeholder="https://www.youtube.com/embed/example" value={videoForm.videoUrl} onChange={e => setVideoForm({ ...videoForm, videoUrl: e.target.value })} required />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>Description</label>
            <textarea rows={2} placeholder="Topics covered in this recorded class video..." value={videoForm.description} onChange={e => setVideoForm({ ...videoForm, description: e.target.value })} style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', backgroundColor: 'var(--bg-dark)', border: '1px solid var(--border-color)', color: 'var(--text-main)' }} />
          </div>

          <button type="submit" className="curious-btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: '0.5rem', backgroundColor: '#10b981' }}>
            Publish Recorded Video Lecture
          </button>
        </form>
      </Modal>

      {/* MODAL 5: Create Course Modal */}
      <Modal isOpen={isCourseModalOpen} onClose={() => setIsCourseModalOpen(false)} title="Create New Published Course">
        <form onSubmit={handleCreateCourseSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>Course Title</label>
            <input type="text" placeholder="e.g. Master Full-Stack Web Development with React & Node" value={courseForm.title} onChange={e => setCourseForm({ ...courseForm, title: e.target.value })} required />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>Category</label>
              <input type="text" value={courseForm.category} onChange={e => setCourseForm({ ...courseForm, category: e.target.value })} required />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>Price (₹)</label>
              <input type="number" value={courseForm.price} onChange={e => setCourseForm({ ...courseForm, price: e.target.value })} required />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>Course Description</label>
            <textarea rows={3} value={courseForm.description} onChange={e => setCourseForm({ ...courseForm, description: e.target.value })} style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', backgroundColor: 'var(--bg-dark)', border: '1px solid var(--border-color)', color: 'var(--text-main)' }} required />
          </div>

          <button type="submit" className="curious-btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: '0.5rem' }}>
            Publish Course to Catalog
          </button>
        </form>
      </Modal>

    </div>
  );
}
