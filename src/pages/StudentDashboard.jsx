import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { CourseCard } from '../components/CourseCard';
import { ClassCard } from '../components/ClassCard';
import { CourseDetailModal } from '../components/CourseDetailModal';
import { CourseStudyHubModal } from '../components/CourseStudyHubModal';
import { PaymentReceiptModal } from '../components/PaymentReceiptModal';
import { CertificateModal } from '../components/CertificateModal';
import { StudentChatView } from '../components/StudentChatView';
import { StudentTestView } from '../components/StudentTestView';
import { StudentExamView } from '../components/StudentExamView';
import { Modal } from '../components/Modal';
import { Search, BookOpen, Video, GraduationCap, Award, CheckCircle, User, Download, Play, Calendar, Sparkles, FileText, Printer, Clock } from '../components/Icons';
import { getCourseValidityInfo } from '../utils/courseValidity';
import { MONDAY_TO_SATURDAY_SCHEDULE } from '../services/scheduleData';

export function StudentDashboard({ activeTab = 'enrolled', setToast }) {
  const { user, updateProfile } = useAuth();
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [catalogCourses, setCatalogCourses] = useState([]);
  const [liveClasses, setLiveClasses] = useState([]);
  const [notes, setNotes] = useState([]);
  const [videos, setVideos] = useState([]);
  const [userBookings, setUserBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal & Study Hub State
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [studyHubCourse, setStudyHubCourse] = useState(null);
  const [certificateCourse, setCertificateCourse] = useState(null);
  const [selectedReceipt, setSelectedReceipt] = useState(null);

  // Search & Catalog Pagination
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  // Profile Editor Form
  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    bio: user?.profile?.bio || '',
    phone: user?.profile?.phone || '',
    avatar: user?.profile?.avatar || ''
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [enrolledRes, catalogRes, classesRes, notesRes, videosRes] = await Promise.all([
        api.getMyEnrolledCourses(),
        api.getCourses(),
        api.getMyClasses(),
        api.getNotes(),
        api.getVideos()
      ]);
      
      const enrolled = enrolledRes.enrolledCourses || enrolledRes.enrollments || [];
      setEnrolledCourses(enrolled);
      setCatalogCourses(catalogRes.courses || []);

      const enrolledIds = enrolled.map(e => {
        const cId = e.course?._id || e.courseId || e._id || (typeof e.course === 'string' ? e.course : null);
        return cId ? cId.toString() : null;
      }).filter(Boolean);

      // Filter live classes by enrolled course IDs
      const filteredClasses = (classesRes.classes || []).filter(c => {
        const cId = c.course?._id || c.courseId || c.course;
        return cId && enrolledIds.includes(cId.toString());
      });
      setLiveClasses(filteredClasses);

      // Filter notes by enrolled course IDs
      const filteredNotes = (notesRes.notes || []).filter(n => {
        const cId = n.course?._id || n.courseId || n.course;
        return cId && enrolledIds.includes(cId.toString());
      });
      setNotes(filteredNotes);

      // Filter videos by enrolled course IDs
      const filteredVideos = (videosRes.videos || []).filter(v => {
        const cId = v.course?._id || v.courseId || v.course;
        return cId && enrolledIds.includes(cId.toString());
      });
      setVideos(filteredVideos);

      // Load persistent user bookings from localStorage matching this student's ID
      const savedBookings = JSON.parse(localStorage.getItem('bktc_user_bookings') || '[]');
      const filteredBookings = savedBookings.filter(b => b.studentId === user?._id);
      setUserBookings(filteredBookings);

    } catch (err) {
      console.error('Error loading student dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleEnroll = async (courseId) => {
    try {
      await api.enroll(courseId);
      setToast({ message: 'Successfully enrolled & unlocked course materials!', type: 'success' });
      loadData();
    } catch (err) {
      setToast({ message: err.message || 'Enrollment failed', type: 'danger' });
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();

    if (!profileForm.name.trim() || !profileForm.phone.trim() || !profileForm.bio.trim()) {
      setToast({ message: 'All fields are mandatory. Please fill in name, bio, and phone.', type: 'danger' });
      return;
    }

    const nameLettersCount = profileForm.name.trim().replace(/[^a-zA-Z]/g, '').length;
    if (nameLettersCount < 4) {
      setToast({ message: 'Name must contain at least 4 letters.', type: 'danger' });
      return;
    }

    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(profileForm.phone.trim())) {
      setToast({ message: 'Mobile number must be exactly 10 digits.', type: 'danger' });
      return;
    }

    try {
      await updateProfile(profileForm);
      setToast({ message: 'Profile updated successfully!', type: 'success' });
    } catch (err) {
      setToast({ message: err.message || 'Update failed', type: 'danger' });
    }
  };

  const handleCancelBooking = (bookingId) => {
    const updated = userBookings.filter(b => b.id !== bookingId);
    setUserBookings(updated);
    const savedBookings = JSON.parse(localStorage.getItem('bktc_user_bookings') || '[]');
    localStorage.setItem('bktc_user_bookings', JSON.stringify(savedBookings.filter(b => b.id !== bookingId)));
    setToast({ message: 'Booking cancelled successfully.', type: 'info' });
  };

  const enrolledCourseIds = enrolledCourses.map(e => e.course?._id || e.courseId || e._id);

  const filteredCatalog = catalogCourses.filter(c => {
    const matchesSearch = c.title.toLowerCase().includes(search.toLowerCase()) || c.description.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = category === 'all' || c.category.toLowerCase() === category.toLowerCase();
    return matchesSearch && matchesCategory;
  });

  const totalPages = Math.ceil(filteredCatalog.length / itemsPerPage) || 1;
  const paginatedCatalog = filteredCatalog.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  if (loading) {
    return <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading student workspace environment...</div>;
  }

  return (
    <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Header Greeting Banner */}
      <div className="glass-panel" style={{
        padding: '2rem',
        background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.15) 0%, rgba(99, 102, 241, 0.15) 100%)',
        display: 'flex',
        justify: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div>
          <span className="badge badge-student" style={{ marginBottom: '0.5rem' }}>STUDENT PORTAL & LMS HUB</span>
          <h2 style={{ fontSize: '1.75rem', color: 'var(--text-main)' }}>Welcome Back, {user?.name}!</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.2rem' }}>
            BK TEACHING CENTER — Manage your purchased courses, study video modules & PDF notes, and track booked demo sessions in one place.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <div style={{ textAlign: 'center', background: 'var(--bg-glass)', padding: '0.75rem 1.25rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#3b82f6' }}>{enrolledCourses.length}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Purchased Courses</div>
          </div>
          <div style={{ textAlign: 'center', background: 'var(--bg-glass)', padding: '0.75rem 1.25rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#10b981' }}>{userBookings.length}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Booked Sessions</div>
          </div>
        </div>
      </div>

      {/* Client Showcase Informational Bar */}
      <div style={{
        padding: '1rem 1.25rem',
        borderRadius: '12px',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        border: '1px solid rgba(59, 130, 246, 0.3)',
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        fontSize: '0.88rem',
        color: 'var(--text-main)'
      }}>
        <Sparkles size={20} style={{ color: '#3b82f6', shrink: 0 }} />
        <div>
          <strong>Client Presentation View:</strong> Purchased courses appear under <strong>"My Purchased & Enrolled Courses"</strong> with a direct <strong>"🚀 Access Course & Study Hub"</strong> button. Booked demo sessions are displayed under <strong>"My Booked Sessions & Demos"</strong> below!
        </div>
      </div>

      {/* Tab: Enrolled Courses & Overview */}
      {(activeTab === 'enrolled' || activeTab === 'overview') && (
        <div>
          <h3 style={{ fontSize: '1.3rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <BookOpen size={20} style={{ color: '#3b82f6' }} /> My Purchased & Enrolled Courses ({enrolledCourses.length})
          </h3>

          {enrolledCourses.length === 0 ? (
            <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center' }}>
              <GraduationCap size={48} style={{ opacity: 0.3, marginBottom: '1rem' }} />
              <h4>You haven't purchased any courses yet!</h4>
              <p style={{ color: 'var(--text-muted)', margin: '0.5rem 0 1.5rem', fontSize: '0.9rem' }}>
                Explore our 200+ courses catalog to purchase your first accredited course.
              </p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1.5rem' }}>
              {enrolledCourses.map((item, idx) => {
                const courseData = item.course || item;
                const teacherObj = courseData.teacher || {};
                const teacherName = teacherObj.name || courseData.teacherName || 'Dr. Sarah Jenkins (Lead Faculty)';
                const teacherAvatar = teacherObj.profile?.avatar || teacherObj.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${teacherName}`;
                const teacherDetail = teacherObj.profile?.qualification || teacherObj.email || 'Senior Subject Expert';

                const valInfo = getCourseValidityInfo(item.enrolledAt || courseData.enrolledAt);

                return (
                  <div key={idx} className="glass-card" style={{ display: 'flex', flexDirection: 'column', padding: '1.2rem', height: '100%', border: '1px solid rgba(59, 130, 246, 0.3)' }}>
                    
                    {/* Status Badge */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                      {(() => {
                        const isPending = item.receiptStatus === 'Pending' || item.receiptStatus === 'Pending Verification' || item.receiptReceived === false;
                        return (
                          <span className="badge badge-student" style={{
                            backgroundColor: isPending ? '#f59e0b' : '#10b981',
                            color: '#fff',
                            fontWeight: 800,
                            fontSize: '0.75rem'
                          }}>
                            {isPending ? '⏳ PENDING APPROVAL' : '✓ PURCHASED & ACTIVE'}
                          </span>
                        );
                      })()}
                      <span style={{ fontSize: '0.75rem', color: '#60a5fa', fontWeight: 800 }}>
                        ⏳ 1-YEAR SUBSCRIPTION
                      </span>
                    </div>

                    <CourseCard 
                      course={{ ...courseData, enrolledAt: item.enrolledAt }} 
                      isEnrolled={true} 
                      user={user} 
                      onViewDetails={(c) => setStudyHubCourse(c)}
                    />

                    {/* 1-Year Course Expiry & Validity Box */}
                    <div style={{
                      marginTop: '0.85rem',
                      padding: '0.85rem',
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: 'rgba(16, 185, 129, 0.08)',
                      border: '1px solid rgba(16, 185, 129, 0.3)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.4rem',
                      fontSize: '0.8rem'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ color: '#10b981', fontWeight: 800, fontSize: '0.82rem' }}>⏳ 1-YEAR SUBSCRIPTION EXPIRY</span>
                        <span className="badge badge-student" style={{ backgroundColor: 'rgba(16, 185, 129, 0.2)', color: '#10b981', fontWeight: 800, fontSize: '0.7rem' }}>
                          {valInfo.daysRemaining} Days Left
                        </span>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.4rem', background: 'rgba(0,0,0,0.2)', padding: '0.55rem', borderRadius: '6px', fontSize: '0.76rem' }}>
                        <div>
                          <span style={{ color: 'var(--text-dim)', display: 'block', fontSize: '0.68rem' }}>PURCHASE DATE</span>
                          <strong style={{ color: 'var(--text-main)' }}>{valInfo.formattedEnrolledAt}</strong>
                        </div>
                        <div>
                          <span style={{ color: 'var(--text-dim)', display: 'block', fontSize: '0.68rem' }}>EXACT EXPIRY DATE</span>
                          <strong style={{ color: '#ef4444' }}>{valInfo.formattedExpiresAt}</strong>
                        </div>
                        <div>
                          <span style={{ color: 'var(--text-dim)', display: 'block', fontSize: '0.68rem' }}>VALID UNTIL</span>
                          <strong style={{ color: '#60a5fa' }}>{valInfo.validUntilMonthYear}</strong>
                        </div>
                        <div>
                          <span style={{ color: 'var(--text-dim)', display: 'block', fontSize: '0.68rem' }}>ACCESS STATUS</span>
                          <strong style={{ color: '#10b981' }}>Active (1 Year)</strong>
                        </div>
                      </div>

                      <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.3rem', marginTop: '0.1rem' }}>
                        <Clock size={12} style={{ color: '#3b82f6' }} /> Daily Live Classes: <strong>Monday to Saturday</strong>
                      </div>
                    </div>

                    {/* Payment & Receipt Summary Box */}
                    <div style={{
                      marginTop: '0.6rem',
                      padding: '0.75rem',
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: 'rgba(255, 255, 255, 0.03)',
                      border: '1px solid var(--border-color)',
                      fontSize: '0.78rem',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.35rem'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ color: 'var(--text-muted)' }}>💳 <strong>Payment Mode:</strong></span>
                        <span style={{ fontWeight: 700, color: '#3b82f6' }}>{item.paymentMode || 'Instant UPI / Wallet'}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ color: 'var(--text-muted)' }}>💵 <strong>Amount Paid:</strong></span>
                        <span style={{ fontWeight: 800, color: '#10b981' }}>₹{item.amountPaid !== undefined ? item.amountPaid : (courseData.price || 3920)}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ color: 'var(--text-muted)' }}>🧾 <strong>Receipt Status:</strong></span>
                        {(() => {
                          const isPending = item.receiptStatus === 'Pending' || item.receiptStatus === 'Pending Verification' || item.receiptReceived === false;
                          return (
                            <span className="badge badge-student" style={{
                              backgroundColor: !isPending ? 'rgba(16, 185, 129, 0.2)' : 'rgba(245, 158, 11, 0.2)',
                              color: !isPending ? '#10b981' : '#f59e0b',
                              border: `1px solid ${!isPending ? 'rgba(16, 185, 129, 0.4)' : 'rgba(245, 158, 11, 0.4)'}`,
                              fontWeight: 800,
                              fontSize: '0.7rem'
                            }}>
                              {!isPending ? '✓ Receipt Verified' : '⏳ Pending'}
                            </span>
                          );
                        })()}
                      </div>
                    </div>

                    {/* Teacher Details Box */}
                    <div style={{
                      marginTop: '0.6rem',
                      padding: '0.75rem',
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: 'rgba(99, 102, 241, 0.08)',
                      border: '1px solid rgba(99, 102, 241, 0.25)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem'
                    }}>
                      <img 
                        src={teacherAvatar} 
                        alt={teacherName} 
                        style={{ width: '38px', height: '38px', borderRadius: '50%', objectFit: 'cover', border: '1px solid #3b82f6' }}
                      />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: '0.7rem', color: '#60a5fa', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                          👨‍🏫 Lead Course Instructor
                        </div>
                        <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {teacherName}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {teacherDetail}
                        </div>
                      </div>
                    </div>

                    {/* Direct Study Actions */}
                    <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      <button 
                        className="curious-btn-primary" 
                        style={{ width: '100%', justifyContent: 'center', padding: '0.65rem', backgroundColor: '#3b82f6', borderColor: '#3b82f6', fontWeight: 700 }}
                        onClick={() => setStudyHubCourse(courseData)}
                      >
                        🚀 Access Course & Study Hub
                      </button>

                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button 
                          className="btn-secondary" 
                          style={{ flex: 1, justifyContent: 'center', padding: '0.45rem', fontSize: '0.78rem' }}
                          onClick={() => setSelectedReceipt({ ...item, course: courseData, studentName: user?.name, studentEmail: user?.email })}
                        >
                          <FileText size={14} /> Tax Invoice
                        </button>
                        <button 
                          className="btn-secondary" 
                          style={{ flex: 1, justifyContent: 'center', padding: '0.45rem', fontSize: '0.78rem' }}
                          onClick={() => setCertificateCourse(courseData)}
                        >
                          <Award size={14} /> Certificate
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Booked Sessions & Live Demos Section */}
          <div style={{ marginTop: '3.5rem' }}>
            <h3 style={{ fontSize: '1.3rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Calendar size={20} style={{ color: '#10b981' }} /> My Booked Sessions & Live Demo Classes ({userBookings.length})
            </h3>
            
            {userBookings.length === 0 ? (
              <div className="glass-panel" style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                <Calendar size={40} style={{ opacity: 0.3, marginBottom: '0.75rem' }} />
                <p>No active demo bookings. Click "Book Free Demo Class" in the top bar to schedule a live demo!</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
                {userBookings.map((b) => (
                  <div key={b.id} className="glass-card" style={{ padding: '1.2rem', display: 'flex', flexDirection: 'column', gap: '0.85rem', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span className="badge badge-student" style={{ backgroundColor: '#10b981', color: '#fff', fontWeight: 800 }}>
                        {b.status || 'CONFIRMED'}
                      </span>
                      <span style={{ fontSize: '0.78rem', color: '#60a5fa', fontWeight: 700 }}>ID: {b.id}</span>
                    </div>

                    <div>
                      <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)', margin: '0.2rem 0' }}>
                        {b.program} ({b.grade || 'General'})
                      </h4>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                        Registered Student: <strong>{b.studentName}</strong>
                      </p>
                    </div>

                    <div style={{ backgroundColor: 'rgba(255,255,255,0.03)', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '0.35rem', fontSize: '0.8rem' }}>
                      <div style={{ color: 'var(--text-main)' }}>⏰ <strong>Slot:</strong> {b.preferredSlot}</div>
                      <div style={{ color: 'var(--text-muted)' }}>👨‍🏫 <strong>Assigned Faculty:</strong> {b.teacherName}</div>
                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: 'auto', paddingTop: '0.5rem' }}>
                      <a 
                        href="https://zoom.us/j/mock_demo_bktc" 
                        target="_blank" 
                        rel="noreferrer" 
                        className="curious-btn-primary" 
                        style={{ flex: 2, padding: '0.5rem', fontSize: '0.8rem', backgroundColor: '#10b981', borderColor: '#10b981', justifyContent: 'center', textDecoration: 'none' }}
                      >
                        <Video size={14} /> Join Live Demo Session
                      </a>
                      <button 
                        className="btn-secondary" 
                        style={{ flex: 1, padding: '0.5rem', fontSize: '0.78rem', justifyContent: 'center', color: '#ef4444' }}
                        onClick={() => handleCancelBooking(b.id)}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Scheduled Live Classes for Courses */}
          <div style={{ marginTop: '3rem' }}>
            <h3 style={{ fontSize: '1.3rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Video size={20} style={{ color: '#ef4444' }} /> Scheduled Live Lectures for Your Enrolled Courses ({liveClasses.length})
            </h3>
            {liveClasses.length === 0 ? (
              <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                No live lectures scheduled for your courses at the moment. Check back soon!
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
                {liveClasses.map(cls => (
                  <ClassCard key={cls._id} onlineClass={cls} isStudent={true} />
                ))}
              </div>
            )}
          </div>

        </div>
      )}

      {/* Tab: Weekly Online Tests */}
      {activeTab === 'tests' && (
        <StudentTestView user={user} setToast={setToast} />
      )}

      {/* Tab: Online Board Exams */}
      {activeTab === 'exams' && (
        <StudentExamView user={user} setToast={setToast} />
      )}

      {/* Tab: Chat & Messages */}
      {activeTab === 'messages' && (
        <StudentChatView user={user} />
      )}

      {/* Tab: Payments & Receipts */}
      {activeTab === 'payments' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h3 style={{ fontSize: '1.3rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-main)' }}>
                <FileText size={22} style={{ color: '#3b82f6' }} /> Payment Receipts & Transaction Ledger ({enrolledCourses.length})
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                All course purchases, payment reference IDs, and official computer-generated GST tax invoices.
              </p>
            </div>
          </div>

          {/* Payment Summary Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
            <div className="glass-panel" style={{ padding: '1rem 1.25rem', borderLeft: '4px solid #3b82f6' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Total Courses Purchased</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '0.2rem' }}>{enrolledCourses.length}</div>
            </div>
            <div className="glass-panel" style={{ padding: '1rem 1.25rem', borderLeft: '4px solid #10b981' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Total Spent (INR)</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#10b981', marginTop: '0.2rem' }}>
                ₹{enrolledCourses.reduce((acc, curr) => acc + Number(curr.amountPaid || curr.course?.price || 3920), 0)}
              </div>
            </div>
            <div className="glass-panel" style={{ padding: '1rem 1.25rem', borderLeft: '4px solid #a855f7' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Tax Invoices Generated</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#a855f7', marginTop: '0.2rem' }}>{enrolledCourses.length}</div>
            </div>
          </div>

          {/* Transaction Table */}
          {enrolledCourses.length === 0 ? (
            <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              <FileText size={40} style={{ opacity: 0.3, marginBottom: '0.75rem' }} />
              <h4>No payment transactions found</h4>
              <p style={{ fontSize: '0.85rem' }}>Purchased courses and tax payment receipts will appear here.</p>
            </div>
          ) : (
            <div className="glass-panel" style={{ padding: '0', overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-color)', backgroundColor: 'rgba(255,255,255,0.02)', color: 'var(--text-muted)', fontSize: '0.78rem', textTransform: 'uppercase' }}>
                    <th style={{ padding: '0.85rem 1rem' }}>Transaction ID / Date</th>
                    <th style={{ padding: '0.85rem 1rem' }}>Purchased Course</th>
                    <th style={{ padding: '0.85rem 1rem' }}>Payment Gateway</th>
                    <th style={{ padding: '0.85rem 1rem' }}>Amount Paid</th>
                    <th style={{ padding: '0.85rem 1rem' }}>Status</th>
                    <th style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>Invoice Action</th>
                  </tr>
                </thead>
                <tbody>
                  {enrolledCourses.map((item, idx) => {
                    const cData = item.course || item;
                    const dateStr = item.enrolledAt ? new Date(item.enrolledAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Recent';
                    const txn = item.transactionId || `TXN-${(item._id || idx).toString().slice(-6)}`;
                    const amt = item.amountPaid !== undefined ? item.amountPaid : (cData.price || 3920);

                    return (
                      <tr key={idx} style={{ borderBottom: '1px solid var(--border-color)' }}>
                        <td style={{ padding: '0.85rem 1rem' }}>
                          <div style={{ fontFamily: 'monospace', fontWeight: 700, color: '#60a5fa' }}>{txn}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{dateStr}</div>
                        </td>
                        <td style={{ padding: '0.85rem 1rem', fontWeight: 700, color: 'var(--text-main)' }}>
                          {cData.title || item.courseTitle}
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 400 }}>{cData.category || 'General'}</div>
                        </td>
                        <td style={{ padding: '0.85rem 1rem', color: 'var(--text-main)' }}>
                          {item.paymentMode || 'Instant UPI / QR Code'}
                        </td>
                        <td style={{ padding: '0.85rem 1rem', fontWeight: 800, color: '#10b981' }}>
                          ₹{amt}
                        </td>
                        <td style={{ padding: '0.85rem 1rem' }}>
                          {(() => {
                            const isPending = item.receiptStatus === 'Pending' || item.receiptStatus === 'Pending Verification' || item.receiptReceived === false;
                            return (
                              <span className="badge badge-student" style={{
                                backgroundColor: isPending ? 'rgba(245, 158, 11, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                                color: isPending ? '#f59e0b' : '#10b981',
                                border: `1px solid ${isPending ? 'rgba(245, 158, 11, 0.3)' : 'rgba(16, 185, 129, 0.3)'}`
                              }}>
                                {isPending ? '⏳ Pending' : '✓ Paid & Enrolled'}
                              </span>
                            );
                          })()}
                        </td>
                        <td style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>
                          <button 
                            className="curious-btn-primary" 
                            style={{ padding: '0.4rem 0.8rem', fontSize: '0.78rem', backgroundColor: '#3b82f6', borderColor: '#3b82f6' }}
                            onClick={() => setSelectedReceipt({ ...item, course: cData, studentName: user?.name, studentEmail: user?.email })}
                          >
                            📜 View Tax Invoice
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Tab: Class Notes */}
      {activeTab === 'notes' && (
        <div>
          <h3 style={{ fontSize: '1.3rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <BookOpen size={20} style={{ color: '#f59e0b' }} /> Available Class Notes & Study Handouts ({notes.length})
          </h3>
          {notes.length === 0 ? (
            <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              No class notes available yet. Your teachers will upload notes here soon.
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
              {notes.map(note => (
                <div key={note._id} className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <span className="badge badge-student">{note.subject || 'General'}</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>By {note.teacherName || 'Faculty'}</span>
                  </div>
                  <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>{note.title}</h4>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>{note.description}</p>
                  <div style={{ marginTop: 'auto', paddingTop: '0.6rem', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.78rem', color: '#3b82f6', fontWeight: 600 }}>{note.courseTitle || 'Course Handout'}</span>
                    <a href={note.fileUrl} target="_blank" rel="noreferrer" className="curious-btn-primary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', backgroundColor: '#f59e0b', borderColor: '#f59e0b', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                      <Download size={14} /> Open PDF
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab: Recorded Class Videos */}
      {activeTab === 'videos' && (
        <div>
          <h3 style={{ fontSize: '1.3rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Play size={20} style={{ color: '#10b981' }} /> Recorded Class Videos & Replays ({videos.length})
          </h3>
          {videos.length === 0 ? (
            <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              No recorded class videos available yet. Check back after your live sessions!
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
              {videos.map(vid => (
                <div key={vid._id} className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                  <div style={{ height: '150px', borderRadius: '10px', overflow: 'hidden', position: 'relative', backgroundColor: '#000' }}>
                    <img src={vid.thumbnail || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&auto=format&fit=crop&q=80'} alt={vid.title} style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.8 }} />
                    <span style={{ position: 'absolute', bottom: '8px', right: '8px', backgroundColor: 'rgba(0,0,0,0.8)', color: '#fff', fontSize: '0.75rem', padding: '0.15rem 0.5rem', borderRadius: '4px', fontWeight: 700 }}>
                      {vid.duration}
                    </span>
                  </div>
                  <div>
                    <span className="badge badge-student" style={{ marginBottom: '0.4rem' }}>{vid.subject || 'Lecture'}</span>
                    <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-main)', margin: '0.2rem 0' }}>{vid.title}</h4>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>{vid.description}</p>
                  </div>
                  <div style={{ marginTop: 'auto', paddingTop: '0.6rem', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>By {vid.teacherName || 'Faculty'}</span>
                    <a href={vid.videoUrl} target="_blank" rel="noreferrer" className="curious-btn-primary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', backgroundColor: '#10b981', borderColor: '#10b981', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                      <Play size={14} /> Watch Replay
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab: Browse Catalog */}
      {activeTab === 'catalog' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <h3 style={{ fontSize: '1.3rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <GraduationCap size={20} style={{ color: 'var(--primary)' }} /> Browse 200+ Courses ({filteredCatalog.length})
            </h3>

            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', width: '100%', maxWidth: '500px' }}>
              <div style={{ position: 'relative', flex: 1 }}>
                <Search size={16} style={{ position: 'absolute', left: '0.8rem', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }} />
                <input 
                  type="text" 
                  placeholder="Search catalog..." 
                  value={search} 
                  onChange={e => { setSearch(e.target.value); setCurrentPage(1); }} 
                  style={{ paddingLeft: '2.2rem', padding: '0.5rem 0.8rem 0.5rem 2.2rem', fontSize: '0.85rem' }} 
                />
              </div>

              <select value={category} onChange={e => { setCategory(e.target.value); setCurrentPage(1); }} style={{ width: '150px', padding: '0.5rem', fontSize: '0.85rem' }}>
                <option value="all">All Categories</option>
                <option value="Web Development">Web Dev</option>
                <option value="Data Science">Data Science</option>
                <option value="Backend Development">Backend</option>
                <option value="Mobile Development">Mobile</option>
                <option value="Design">Design</option>
                <option value="Cybersecurity">Cybersecurity</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(310px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
            {paginatedCatalog.map(course => (
              <CourseCard 
                key={course._id} 
                course={course} 
                isEnrolled={enrolledCourseIds.includes(course._id)}
                onEnroll={handleEnroll} 
                onViewDetails={(c) => setSelectedCourse(c)}
                user={user}
              />
            ))}
          </div>

          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem' }}>
              <button className="btn-secondary" disabled={currentPage === 1} onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}>
                ← Previous
              </button>
              <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Page {currentPage} of {totalPages}</span>
              <button className="btn-secondary" disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}>
                Next →
              </button>
            </div>
          )}
        </div>
      )}

      {/* Tab: Profile */}
      {activeTab === 'profile' && (
        <div className="glass-panel" style={{ maxWidth: '600px', padding: '2rem' }}>
          <h3 style={{ fontSize: '1.3rem', marginBottom: '1.5rem' }}>Edit Student Profile</h3>
          <form onSubmit={handleUpdateProfile} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.35rem', color: 'var(--text-muted)' }}>Full Name *</label>
              <input type="text" required value={profileForm.name} onChange={e => setProfileForm({ ...profileForm, name: e.target.value })} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.35rem', color: 'var(--text-muted)' }}>Bio / Statement *</label>
              <textarea rows={3} required value={profileForm.bio} onChange={e => setProfileForm({ ...profileForm, bio: e.target.value })} placeholder="Tell us about your learning goals..." />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.35rem', color: 'var(--text-muted)' }}>Phone Number *</label>
              <input type="text" required value={profileForm.phone} onChange={e => setProfileForm({ ...profileForm, phone: e.target.value })} placeholder="e.g. 9876543210" />
            </div>
            <button type="submit" className="btn-primary" style={{ marginTop: '0.5rem' }}>Save Profile Updates</button>
          </form>
        </div>
      )}

      {/* Course Detail Modal */}
      <CourseDetailModal 
        course={selectedCourse}
        isOpen={Boolean(selectedCourse)}
        onClose={() => setSelectedCourse(null)}
        onEnroll={handleEnroll}
        isEnrolled={selectedCourse && enrolledCourseIds.includes(selectedCourse._id)}
        user={user}
      />

      {/* Course Study Hub Classroom Modal */}
      <CourseStudyHubModal
        course={studyHubCourse}
        isOpen={Boolean(studyHubCourse)}
        onClose={() => setStudyHubCourse(null)}
        user={user}
      />

      {/* Official Certificate Modal with Bittu Kumar Signature */}
      <CertificateModal 
        course={certificateCourse}
        user={user}
        isOpen={Boolean(certificateCourse)}
        onClose={() => setCertificateCourse(null)}
      />

      {/* Payment Receipt Modal */}
      <PaymentReceiptModal 
        enrollment={selectedReceipt}
        isOpen={Boolean(selectedReceipt)}
        onClose={() => setSelectedReceipt(null)}
      />

    </div>
  );
}
