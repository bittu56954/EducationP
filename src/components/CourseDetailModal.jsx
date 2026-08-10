import React, { useState } from 'react';
import { Modal } from './Modal';
import { BookOpen, Clock, GraduationCap, CheckCircle, Users, Sparkles } from './Icons';
import { getCourseValidityInfo } from '../utils/courseValidity';

export function CourseDetailModal({ course, isOpen, onClose, onEnroll, isEnrolled, user }) {
  const [checkoutStep, setCheckoutStep] = useState('details'); // 'details' | 'checkout' | 'success'
  const [paymentMethod, setPaymentMethod] = useState('upi'); // 'upi' | 'card' | 'bank' | 'slip'
  const [receiptUrl, setReceiptUrl] = useState('');
  const [transactionRef, setTransactionRef] = useState('');
  const [processing, setProcessing] = useState(false);

  if (!course) return null;

  const teacher = course.teacher || {};
  const topics = Array.isArray(course.topics)
    ? course.topics
    : typeof course.topics === 'string'
    ? course.topics.split(',').map(s => s.trim())
    : ['Web Architecture', 'REST APIs', 'Cloud Deployment'];

  const rawSyllabus = Array.isArray(course.syllabus) && course.syllabus.length > 0 ? course.syllabus : [
    { moduleTitle: 'Module 1: Foundations & Fundamentals', lessons: ['Course Orientation & Tooling (45m)', 'Core Concepts & Syntax (60m)'] },
    { moduleTitle: 'Module 2: Advanced Real-World Projects', lessons: ['State Management & API Integration (90m)', 'Production Deployment & Security (75m)'] }
  ];

  const syllabus = rawSyllabus.map((mod, idx) => {
    if (typeof mod === 'string') {
      return { moduleTitle: `Module ${idx + 1}: ${mod}`, lessons: ['Interactive Lecture & Hands-on Lab'] };
    }
    const title = mod.moduleTitle || mod.title || `Module ${idx + 1}`;
    const lessons = Array.isArray(mod.lessons)
      ? mod.lessons
      : typeof mod.lessons === 'string'
      ? [mod.lessons]
      : Array.isArray(mod.topics)
      ? mod.topics
      : ['Interactive Lecture & Hands-on Lab'];
    return { moduleTitle: title, lessons };
  });

  const handlePurchase = async () => {
    setProcessing(true);
    try {
      const modeMap = {
        card: 'Credit / Debit Card',
        upi: 'Instant UPI / QR Code',
        bank: 'Direct Bank Transfer',
        slip: 'Manual Slip / Cash Upload'
      };

      const isPendingStatus = (paymentMethod === 'bank' || paymentMethod === 'slip');
      const paymentPayload = {
        paymentMode: modeMap[paymentMethod] || 'Instant UPI / QR Code',
        amountPaid: Number(course.price || 3920),
        receiptReceived: !isPendingStatus,
        receiptStatus: isPendingStatus ? 'Pending' : 'Received',
        receiptUrl: receiptUrl || '',
        transactionId: transactionRef || `TXN-${Math.floor(100000 + Math.random() * 900000)}`
      };

      await onEnroll(course._id, paymentPayload);
      setCheckoutStep('success');
    } catch (err) {
      console.error(err);
    } finally {
      setProcessing(false);
    }
  };

  const handleModalClose = () => {
    setCheckoutStep('details');
    onClose();
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={handleModalClose} 
      title={checkoutStep === 'checkout' ? "Complete Course Purchase" : checkoutStep === 'success' ? "🎉 Course Purchased Successfully!" : course.title}
    >
      {checkoutStep === 'details' ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Header Banner */}
          <div style={{ position: 'relative', borderRadius: 'var(--radius-sm)', overflow: 'hidden', height: '160px' }}>
            <img src={course.thumbnail || course.image} alt={course.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            <div style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              background: 'linear-gradient(to top, rgba(9,13,22,0.95), transparent)',
              padding: '1rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-end'
            }}>
              <div>
                <span className="badge badge-student">{course.category}</span>
                <div style={{ color: '#fff', fontSize: '1.2rem', fontWeight: 800, marginTop: '0.2rem' }}>₹{course.price}</div>
              </div>
              <div style={{ fontSize: '0.82rem', color: '#f59e0b', fontWeight: 700 }}>★ {course.rating || '4.9'} ({course.enrolledStudentsCount || 120} enrolled)</div>
            </div>
          </div>

          <p style={{ fontSize: '0.92rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>{course.description}</p>

          {/* Key Course Meta */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem', background: 'rgba(255,255,255,0.03)', padding: '0.85rem', borderRadius: 'var(--radius-sm)', fontSize: '0.85rem' }}>
            <div><span style={{ color: 'var(--text-dim)', display: 'block', fontSize: '0.75rem' }}>Duration</span><strong>{course.duration}</strong></div>
            <div><span style={{ color: 'var(--text-dim)', display: 'block', fontSize: '0.75rem' }}>Level</span><strong>{course.level}</strong></div>
            <div><span style={{ color: 'var(--text-dim)', display: 'block', fontSize: '0.75rem' }}>Lessons</span><strong>{course.lessonsCount} Lectures</strong></div>
          </div>

          {/* Course Expiry & 1-Year Validity Information Box */}
          {(() => {
            const valInfo = getCourseValidityInfo(course.enrolledAt);
            return (
              <div style={{
                padding: '1rem 1.15rem',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'rgba(16, 185, 129, 0.08)',
                border: '1px solid rgba(16, 185, 129, 0.35)',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem',
                fontSize: '0.84rem'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#10b981', fontWeight: 800, fontSize: '0.88rem' }}>⏳ 1-YEAR SUBSCRIPTION & COURSE EXPIRY</span>
                  <span className="badge badge-student" style={{ backgroundColor: 'rgba(16, 185, 129, 0.2)', color: '#10b981', fontWeight: 800 }}>365 DAYS ACCESS</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', background: 'rgba(0,0,0,0.2)', padding: '0.65rem', borderRadius: '6px' }}>
                  <div>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)', display: 'block' }}>PURCHASE / ENROLLED DATE</span>
                    <strong style={{ color: 'var(--text-main)', fontSize: '0.82rem' }}>{valInfo.formattedEnrolledAt}</strong>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)', display: 'block' }}>EXACT EXPIRY DATE</span>
                    <strong style={{ color: '#ef4444', fontSize: '0.82rem' }}>{valInfo.formattedExpiresAt}</strong>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)', display: 'block' }}>VALID UNTIL (MONTH & YEAR)</span>
                    <strong style={{ color: '#60a5fa', fontSize: '0.82rem' }}>{valInfo.validUntilMonthYear}</strong>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)', display: 'block' }}>STATUS</span>
                    <strong style={{ color: '#10b981', fontSize: '0.82rem' }}>Active 1-Year Access</strong>
                  </div>
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  ✓ This course is valid for <strong>1 full year (365 days)</strong> from purchase. You get unlimited replays, downloadable notes, and live class access through <strong>{valInfo.validUntilMonthYear}</strong>.
                </div>
              </div>
            );
          })()}

          {/* Monday to Saturday Daily Live Class Schedule Banner */}
          <div style={{
            padding: '1rem 1.15rem',
            borderRadius: 'var(--radius-sm)',
            backgroundColor: 'rgba(59, 130, 246, 0.08)',
            border: '1px solid rgba(59, 130, 246, 0.35)',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.6rem',
            fontSize: '0.82rem'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: '#3b82f6', fontWeight: 800, fontSize: '0.88rem' }}>📹 DAILY LIVE CLASSES SCHEDULE (MON - SAT)</span>
              <span style={{ fontSize: '0.75rem', color: '#60a5fa', fontWeight: 700 }}>6 Days / Week</span>
            </div>
            
            <div style={{ color: 'var(--text-main)', fontSize: '0.8rem' }}>
              Students have daily interactive live lectures from <strong>Monday to Saturday</strong> with real-time faculty Q&A:
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.4rem', fontSize: '0.75rem' }}>
              {[
                { day: 'Mon', time: '10:00 AM & 5:00 PM', topic: 'Theory & REST APIs' },
                { day: 'Tue', time: '10:00 AM & 5:00 PM', topic: 'React & DB Queries' },
                { day: 'Wed', time: '10:00 AM & 5:00 PM', topic: 'Next.js & Docker' },
                { day: 'Thu', time: '10:00 AM & 5:00 PM', topic: 'TypeScript & AI RAG' },
                { day: 'Fri', time: '10:00 AM & 5:00 PM', topic: 'Capstone Live Coding' },
                { day: 'Sat', time: '09:00 AM & 12:00 PM', topic: 'Live Doubts & Quiz' },
              ].map(s => (
                <div key={s.day} style={{ background: 'rgba(255,255,255,0.03)', padding: '0.4rem 0.5rem', borderRadius: '4px', border: '1px solid var(--border-color)' }}>
                  <div style={{ fontWeight: 800, color: '#3b82f6' }}>{s.day}</div>
                  <div style={{ color: 'var(--text-main)', fontWeight: 600 }}>{s.time}</div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>{s.topic}</div>
                </div>
              ))}
            </div>

            <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '0.2rem' }}>
              • Faculty: <strong>{teacher.name || 'Senior Master Faculty'}</strong> | Recorded replays automatically available after live stream.
            </div>
          </div>

          {/* Topics Covered */}
          <div>
            <h4 style={{ fontSize: '0.95rem', marginBottom: '0.5rem', color: 'var(--text-main)' }}>Key Topics Covered</h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
              {topics.map((t, idx) => (
                <span key={idx} className="badge badge-student" style={{ fontSize: '0.75rem' }}>
                  <CheckCircle size={12} /> {t}
                </span>
              ))}
            </div>
          </div>

          {/* Instructor Bio */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', background: 'rgba(99, 102, 241, 0.08)', padding: '0.85rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
            <img src={teacher.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${teacher.name}`} alt={teacher.name} style={{ width: '42px', height: '42px', borderRadius: '50%' }} />
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{teacher.name}</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{teacher.qualification || 'Certified Course Instructor'}</div>
            </div>
          </div>

          {/* Syllabus Section */}
          <div>
            <h4 style={{ fontSize: '1rem', marginBottom: '0.75rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <BookOpen size={18} className="text-secondary" /> Complete Course Syllabus
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '200px', overflowY: 'auto' }}>
              {syllabus.map((mod, idx) => (
                <div key={idx} style={{ backgroundColor: 'rgba(15, 22, 36, 0.8)', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
                  <div style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--primary)', marginBottom: '0.35rem' }}>{mod.moduleTitle}</div>
                  <ul style={{ listStyle: 'none', paddingLeft: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    {(mod.lessons || []).map((les, lIdx) => (
                      <li key={lIdx} style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <Clock size={12} /> {typeof les === 'object' ? les.title || les.name || 'Lesson ' + (lIdx + 1) : les}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* CTA Action */}
          {isEnrolled ? (
            <button className="btn-success" style={{ width: '100%', justifyContent: 'center', padding: '0.85rem', fontWeight: 700 }} onClick={handleModalClose}>
              <CheckCircle size={18} /> You are enrolled in this course (Access Hub)
            </button>
          ) : user ? (
            <button 
              className="curious-btn-primary" 
              style={{ width: '100%', justifyContent: 'center', padding: '0.85rem', backgroundColor: '#3b82f6', borderColor: '#3b82f6', fontWeight: 800 }} 
              onClick={() => {
                handleModalClose();
                if (onEnroll) onEnroll(course);
              }}
            >
              💳 Purchase & Enroll Now (₹{course.price})
            </button>
          ) : (
            <button className="curious-btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '0.85rem', backgroundColor: '#3b82f6', borderColor: '#3b82f6' }} onClick={handleModalClose}>
              🔒 Sign In to Purchase Course (₹{course.price})
            </button>
          )}
        </div>
      ) : checkoutStep === 'checkout' ? (
        /* Checkout Confirmation Screen */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div className="glass-panel" style={{ padding: '1rem', background: 'rgba(99, 102, 241, 0.1)' }}>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Order Summary</div>
            <div style={{ fontSize: '1.1rem', fontWeight: 700, marginTop: '0.2rem' }}>{course.title}</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--secondary)', marginTop: '0.5rem' }}>
              Total: ₹{course.price}
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Select Payment Method</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              {[
                { id: 'upi', label: '⚡ Instant UPI / QR Code' },
                { id: 'card', label: '💳 Credit / Debit Card' },
                { id: 'bank', label: '🏦 Net Banking / Wire' },
                { id: 'slip', label: '📄 Payment Slip Upload' }
              ].map(m => (
                <button 
                  key={m.id}
                  type="button" 
                  style={{
                    padding: '0.75rem',
                    borderRadius: 'var(--radius-sm)',
                    border: paymentMethod === m.id ? '2px solid #3b82f6' : '1px solid var(--border-color)',
                    backgroundColor: paymentMethod === m.id ? 'rgba(59, 130, 246, 0.15)' : 'var(--bg-glass)',
                    color: paymentMethod === m.id ? '#60a5fa' : 'var(--text-main)',
                    fontWeight: 700,
                    fontSize: '0.82rem',
                    cursor: 'pointer'
                  }}
                  onClick={() => setPaymentMethod(m.id)}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>
                Transaction Reference / UTR Number (Optional)
              </label>
              <input 
                type="text" 
                placeholder="e.g. TXN-9988221144" 
                value={transactionRef} 
                onChange={e => setTransactionRef(e.target.value)} 
              />
            </div>

            {paymentMethod === 'slip' && (
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: '#f59e0b', marginBottom: '0.3rem', fontWeight: 700 }}>
                  📄 Payment Receipt / Slip URL or File Image Link *
                </label>
                <input 
                  type="url" 
                  placeholder="https://example.com/slips/my_receipt.jpg" 
                  value={receiptUrl} 
                  onChange={e => setReceiptUrl(e.target.value)} 
                />
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.3rem' }}>
                  Provide image link to your bank receipt/slip for admin verification.
                </div>
              </div>
            )}
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button className="btn-secondary" style={{ flex: 1, justifyContent: 'center' }} onClick={() => setCheckoutStep('details')}>
              Back
            </button>
            <button className="btn-primary" style={{ flex: 2, justifyContent: 'center' }} disabled={processing} onClick={handlePurchase}>
              {processing ? 'Processing Payment...' : 'Confirm & Complete Enrollment'}
            </button>
          </div>
        </div>
      ) : (
        /* Purchase Success Screen */
        <div style={{ textAlign: 'center', padding: '1rem 0', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{
            width: '72px',
            height: '72px',
            borderRadius: '50%',
            backgroundColor: 'rgba(16, 185, 129, 0.15)',
            color: '#10b981',
            fontSize: '2.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto',
            border: '2px solid #10b981'
          }}>
            ✓
          </div>

          <div>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)' }}>
              Course Access Unlocked! 🚀
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.3rem' }}>
              Congratulations! You are now fully enrolled in <strong>{course.title}</strong>.
            </p>
          </div>

          <div style={{
            background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(16, 185, 129, 0.1) 100%)',
            border: '1px solid rgba(59, 130, 246, 0.3)',
            borderRadius: '12px',
            padding: '1rem',
            textAlign: 'left',
            fontSize: '0.85rem'
          }}>
            <div style={{ color: '#3b82f6', fontWeight: 800, marginBottom: '0.4rem' }}>
              📍 WHERE YOUR PURCHASED COURSE IS LOCATED:
            </div>
            <ul style={{ paddingLeft: '1.2rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
              <li>Appears under <strong>"My Purchased & Enrolled Courses"</strong> in your Student Dashboard.</li>
              <li>Includes full access to <strong>Video Lectures, PDF Notes, and Live Sessions</strong>.</li>
              <li>Lifetime access with official Accredited Certificate upon completion.</li>
            </ul>
          </div>

          <button
            onClick={handleModalClose}
            className="curious-btn-primary"
            style={{ width: '100%', justifyContent: 'center', backgroundColor: '#3b82f6', borderColor: '#3b82f6', padding: '0.8rem' }}
          >
            Go to Student Dashboard & Start Learning →
          </button>
        </div>
      )}
    </Modal>
  );
}
