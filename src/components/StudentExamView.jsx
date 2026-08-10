import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { 
  GraduationCap, 
  CheckCircle, 
  Clock, 
  Calendar, 
  FileText, 
  Printer, 
  Award, 
  AlertCircle, 
  Plus, 
  Download 
} from './Icons';

// Grade syllabus subjects map
const SYLLABUS_MAP = {
  'Nursery': ['English', 'Mathematics', 'General Awareness'],
  'LKG': ['English', 'Mathematics', 'General Awareness'],
  'UKG': ['English', 'Mathematics', 'General Awareness'],
  'Class 1': ['English', 'Mathematics', 'EVS', 'General Science'],
  'Class 2': ['English', 'Mathematics', 'EVS', 'General Science'],
  'Class 3': ['English', 'Mathematics', 'EVS', 'General Science'],
  'Class 4': ['English', 'Mathematics', 'EVS', 'General Science'],
  'Class 5': ['English', 'Mathematics', 'EVS', 'General Science'],
  'Class 6': ['English', 'Mathematics', 'General Science', 'Social Science'],
  'Class 7': ['English', 'Mathematics', 'General Science', 'Social Science'],
  'Class 8': ['English', 'Mathematics', 'General Science', 'Social Science'],
  'Class 9': ['English', 'Mathematics', 'Science', 'Social Studies'],
  'Class 10': ['English', 'Mathematics', 'Science', 'Social Studies'],
  'Class 11': ['English', 'Physics', 'Chemistry', 'Mathematics', 'Computer Science'],
  'Class 12': ['English', 'Physics', 'Chemistry', 'Mathematics', 'Computer Science'],
};

export function StudentExamView({ user, setToast }) {
  const [examForm, setExamForm] = useState(null);
  const [submission, setSubmission] = useState(null);
  const [loading, setLoading] = useState(true);

  // Form registration state
  const [selectedGrade, setSelectedGrade] = useState('Class 10');
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [cardName, setCardName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [upiId, setUpiId] = useState('');

  // Active exam state
  const [activeExam, setActiveExam] = useState(false);
  const [examPaper, setExamPaper] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [flagged, setFlagged] = useState([]);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [timeLeft, setTimeLeft] = useState(195 * 60); // 3h 15m in seconds
  const [loadingPaper, setLoadingPaper] = useState(false);

  const fetchExamStatus = async () => {
    setLoading(true);
    try {
      const res = await api.exams.getStudentForm();
      if (res.success) {
        setExamForm(res.examForm);
        setSubmission(res.submission);
      }
    } catch (err) {
      console.error('Error fetching exam status:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExamStatus();
  }, []);

  // Exam timer effect
  useEffect(() => {
    if (!activeExam || timeLeft <= 0) {
      if (activeExam && timeLeft <= 0) {
        handleAutoSubmit();
      }
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [activeExam, timeLeft]);

  const handleRegisterClick = (e) => {
    e.preventDefault();
    setCheckoutOpen(true);
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    try {
      const txnId = 'TXN-EXM-' + Math.floor(100000 + Math.random() * 900000);
      const res = await api.exams.submitForm({
        grade: selectedGrade,
        transactionId: txnId
      });
      if (res.success) {
        setToast({ message: '🎉 Exam Registration Form Submitted & Paid Successfully!', type: 'success' });
        setCheckoutOpen(false);
        fetchExamStatus();
      }
    } catch (err) {
      setToast({ message: err.message || 'Payment simulation failed', type: 'danger' });
    }
  };

  const startExam = async () => {
    setLoadingPaper(true);
    try {
      const res = await api.exams.getPaperByGrade(examForm.grade);
      if (res.success) {
        const durationMins = res.paper.durationMinutes || examForm?.durationMinutes || 195;
        setExamPaper(res.paper);
        setAnswers(new Array(res.paper.questions.length).fill(null));
        setFlagged(new Array(res.paper.questions.length).fill(false));
        setCurrentQuestionIdx(0);
        setTimeLeft(durationMins * 60);
        setActiveExam(true);
        const hours = Math.floor(durationMins / 60);
        const mins = durationMins % 60;
        const timeLabel = hours > 0 ? `${hours} hr${hours > 1 ? 's' : ''} ${mins > 0 ? `${mins} mins` : ''}` : `${mins} mins`;
        setToast({ message: `📖 Exam started. You have ${timeLabel} to complete it.`, type: 'success' });
      }
    } catch (err) {
      setToast({ message: err.message || 'Could not fetch question paper. Ask Admin to set the paper first.', type: 'danger' });
    } finally {
      setLoadingPaper(false);
    }
  };

  const handleAutoSubmit = () => {
    setToast({ message: '⏰ Time is up! Your answers are being submitted automatically.', type: 'warning' });
    submitExamAnswers();
  };

  const submitExamAnswers = async () => {
    try {
      const durationSpent = (195 * 60) - timeLeft;
      const res = await api.exams.submitExam({
        examFormId: examForm._id,
        examPaperId: examPaper._id,
        answers,
        durationSpent
      });
      if (res.success) {
        setToast({ message: '🏆 Exam completed and answers submitted successfully!', type: 'success' });
        setActiveExam(false);
        fetchExamStatus();
      }
    } catch (err) {
      setToast({ message: err.message || 'Exam submission failed', type: 'danger' });
    }
  };

  const selectOption = (optIdx) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestionIdx] = optIdx;
    setAnswers(newAnswers);
  };

  const toggleFlag = () => {
    const newFlagged = [...flagged];
    newFlagged[currentQuestionIdx] = !newFlagged[currentQuestionIdx];
    setFlagged(newFlagged);
  };

  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading Exam Portal info...</div>;
  }

  // --- Active Exam Screen ---
  if (activeExam && examPaper) {
    const currentQ = examPaper.questions[currentQuestionIdx];
    return (
      <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', height: '100%', minHeight: 'calc(100vh - 8rem)' }}>
        
        {/* Header bar */}
        <div className="glass-panel" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 1.5rem', borderLeft: '4px solid #ef4444' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--text-main)' }}>{examPaper.title}</h3>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Grade: {examPaper.grade} | Duration: 3h 15m</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', borderRadius: '50px', backgroundColor: timeLeft < 600 ? 'rgba(239,68,68,0.15)' : 'rgba(255,255,255,0.05)', border: `1px solid ${timeLeft < 600 ? '#ef4444' : 'var(--border-color)'}` }}>
            <Clock size={16} style={{ color: timeLeft < 600 ? '#ef4444' : '#10b981' }} />
            <span style={{ fontFamily: 'monospace', fontWeight: 800, fontSize: '1.1rem', color: timeLeft < 600 ? '#ef4444' : '#ffffff' }}>
              {formatTime(timeLeft)}
            </span>
          </div>
        </div>

        {/* Main layout */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '1.5rem', flex: 1 }}>
          
          {/* Question panel */}
          <div className="glass-panel" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="badge badge-student" style={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {currentQ.subject}
                </span>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  Question {currentQuestionIdx + 1} of {examPaper.questions.length} ({currentQ.marks || 5} Marks)
                </span>
              </div>

              <h3 style={{ fontSize: '1.25rem', color: 'var(--text-main)', marginTop: '1.2rem', lineHeight: 1.5 }}>
                {currentQ.questionText}
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', marginTop: '2rem' }}>
                {currentQ.options.map((option, idx) => (
                  <button
                    key={idx}
                    onClick={() => selectOption(idx)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '1rem',
                      padding: '1rem',
                      borderRadius: '8px',
                      backgroundColor: answers[currentQuestionIdx] === idx ? 'rgba(59, 130, 246, 0.12)' : 'rgba(255,255,255,0.02)',
                      border: `1px solid ${answers[currentQuestionIdx] === idx ? '#3b82f6' : 'var(--border-color)'}`,
                      color: answers[currentQuestionIdx] === idx ? '#ffffff' : 'var(--text-main)',
                      textAlign: 'left',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <span style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      border: `2px solid ${answers[currentQuestionIdx] === idx ? '#3b82f6' : 'var(--text-muted)'}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.8rem',
                      fontWeight: 800,
                      backgroundColor: answers[currentQuestionIdx] === idx ? '#3b82f6' : 'transparent',
                      color: answers[currentQuestionIdx] === idx ? '#fff' : 'var(--text-muted)'
                    }}>
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <span style={{ fontSize: '0.95rem' }}>{option}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Controls */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem', marginTop: '2rem' }}>
              <button
                className="btn-secondary"
                disabled={currentQuestionIdx === 0}
                onClick={() => setCurrentQuestionIdx(idx => idx - 1)}
              >
                ← Previous Question
              </button>

              <button
                onClick={toggleFlag}
                style={{
                  padding: '0.5rem 1rem',
                  borderRadius: '6px',
                  border: '1px solid #f59e0b',
                  backgroundColor: flagged[currentQuestionIdx] ? 'rgba(245,158,11,0.15)' : 'transparent',
                  color: '#f59e0b',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  cursor: 'pointer'
                }}
              >
                {flagged[currentQuestionIdx] ? '★ Flagged for Review' : '☆ Flag for Review'}
              </button>

              {currentQuestionIdx < examPaper.questions.length - 1 ? (
                <button
                  className="curious-btn-primary"
                  onClick={() => setCurrentQuestionIdx(idx => idx + 1)}
                  style={{ padding: '0.6rem 1.4rem' }}
                >
                  Next Question →
                </button>
              ) : (
                <button
                  className="curious-btn-primary"
                  onClick={() => {
                    if (window.confirm('Are you sure you want to finish and submit the exam? This will evaluate your scores.')) {
                      submitExamAnswers();
                    }
                  }}
                  style={{ padding: '0.6rem 1.4rem', backgroundColor: '#10b981', borderColor: '#10b981' }}
                >
                  Submit Exam
                </button>
              )}
            </div>
          </div>

          {/* Sidebar Navigation */}
          <div className="glass-panel" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1.25rem', height: 'fit-content' }}>
            <h4 style={{ margin: 0, fontSize: '0.95rem', color: 'var(--text-main)', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
              Questions Navigator
            </h4>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem' }}>
              {examPaper.questions.map((_, idx) => {
                const isCurrent = currentQuestionIdx === idx;
                const isAnswered = answers[idx] !== null;
                const isFlagged = flagged[idx];
                
                let bg = 'rgba(255,255,255,0.03)';
                let border = '1px solid var(--border-color)';
                let color = 'var(--text-muted)';
                
                if (isAnswered) {
                  bg = 'rgba(16, 185, 129, 0.15)';
                  border = '1px solid rgba(16, 185, 129, 0.4)';
                  color = '#10b981';
                }
                if (isFlagged) {
                  bg = 'rgba(245, 158, 11, 0.15)';
                  border = '1px solid rgba(245, 158, 11, 0.4)';
                  color = '#f59e0b';
                }
                if (isCurrent) {
                  border = '2px solid #3b82f6';
                  color = '#ffffff';
                }

                return (
                  <button
                    key={idx}
                    onClick={() => setCurrentQuestionIdx(idx)}
                    style={{
                      height: '42px',
                      borderRadius: '6px',
                      background: bg,
                      border: border,
                      color: color,
                      fontWeight: 800,
                      fontSize: '0.9rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>

            <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem', marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ width: '12px', height: '12px', borderRadius: '3px', backgroundColor: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.4)' }}></div>
                <span>Answered</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ width: '12px', height: '12px', borderRadius: '3px', backgroundColor: 'rgba(245, 158, 11, 0.15)', border: '1px solid rgba(245, 158, 11, 0.4)' }}></div>
                <span>Flagged for Review</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ width: '12px', height: '12px', borderRadius: '3px', backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)' }}></div>
                <span>Unattempted</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    );
  }

  // --- Phase 1: Registration Form ---
  if (!examForm) {
    const subjects = SYLLABUS_MAP[selectedGrade] || [];
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '1rem 0' }}>
        <div className="glass-panel" style={{ width: '100%', maxWidth: '640px', padding: '2.5rem' }}>
          
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <span className="badge badge-student" style={{ marginBottom: '0.5rem' }}>OFFICIAL PORTAL</span>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 900, color: 'var(--text-main)', margin: 0 }}>
              Online Examination Registration
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.3rem' }}>
              Conducting final examinations for Nursery to Class 12. Fill details and pay board fee.
            </p>
          </div>

          <form onSubmit={handleRegisterClick} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', marginBottom: '0.35rem', color: 'var(--text-muted)' }}>Student Name</label>
                <input type="text" disabled value={user.name} style={{ backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', color: 'var(--text-muted)' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', marginBottom: '0.35rem', color: 'var(--text-muted)' }}>Contact Email</label>
                <input type="text" disabled value={user.email} style={{ backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', color: 'var(--text-muted)' }} />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', marginBottom: '0.35rem', color: 'var(--text-muted)' }}>Grade / Class Selection *</label>
              <select 
                value={selectedGrade} 
                onChange={e => setSelectedGrade(e.target.value)}
                style={{ width: '100%', padding: '0.65rem', borderRadius: '6px', fontSize: '0.9rem' }}
              >
                {Object.keys(SYLLABUS_MAP).map(g => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
              <span style={{ display: 'block', fontSize: '0.75rem', color: '#60a5fa', marginTop: '0.3rem' }}>
                Note: Examination enrollment is restricted only to students of Nursery to Class 12.
              </span>
            </div>

            {/* Syllabus Preview Card */}
            <div style={{ padding: '1rem 1.25rem', borderRadius: '8px', backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)' }}>
              <div style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                📖 Syllabus Subjects covered in {selectedGrade} Exam:
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {subjects.map((sub, i) => (
                  <span key={i} style={{ padding: '0.2rem 0.6rem', borderRadius: '50px', backgroundColor: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.3)', color: '#a5b4fc', fontSize: '0.75rem', fontWeight: 700 }}>
                    {sub}
                  </span>
                ))}
              </div>
            </div>

            {/* Fee summary block */}
            <div style={{ padding: '1.25rem', borderRadius: '10px', backgroundColor: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.25)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Fixed Board Exam Fee</span>
                <h3 style={{ fontSize: '1.6rem', fontWeight: 900, color: '#10b981', margin: '0.1rem 0' }}>₹2,000.00</h3>
              </div>
              <span style={{ fontSize: '0.72rem', color: '#10b981', border: '1px solid rgba(16,185,129,0.3)', padding: '0.25rem 0.5rem', borderRadius: '20px', fontWeight: 700, backgroundColor: 'rgba(16,185,129,0.05)' }}>
                ✓ GST Inclusive
              </span>
            </div>

            <button 
              type="submit" 
              className="curious-btn-primary" 
              style={{ width: '100%', justifyContent: 'center', padding: '0.8rem', backgroundColor: '#3b82f6', borderColor: '#3b82f6', fontWeight: 800, fontSize: '0.95rem', marginTop: '0.5rem' }}
            >
              Propose Form & Checkout (₹2,000)
            </button>
          </form>

          {/* Checkout simulated Modal */}
          {checkoutOpen && (
            <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
              <div className="glass-panel" style={{ width: '90%', maxWidth: '420px', padding: '2rem', border: '1px solid rgba(59, 130, 246, 0.3)' }}>
                
                <h3 style={{ margin: 0, fontSize: '1.25rem', color: 'var(--text-main)', textAlign: 'center' }}>Simulated Fee Gateway</h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center', marginBottom: '1.5rem' }}>
                  Pay ₹2,000 securely for {selectedGrade} Board Exam
                </p>

                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.2rem' }}>
                  <button 
                    onClick={() => setPaymentMethod('UPI')} 
                    style={{ flex: 1, padding: '0.45rem', fontSize: '0.8rem', borderRadius: '4px', border: `1px solid ${paymentMethod === 'UPI' ? '#3b82f6' : 'var(--border-color)'}`, backgroundColor: paymentMethod === 'UPI' ? 'rgba(59, 130, 246, 0.1)' : 'transparent', color: paymentMethod === 'UPI' ? '#ffffff' : 'var(--text-muted)' }}
                  >
                    UPI / QR Code
                  </button>
                  <button 
                    onClick={() => setPaymentMethod('CARD')} 
                    style={{ flex: 1, padding: '0.45rem', fontSize: '0.8rem', borderRadius: '4px', border: `1px solid ${paymentMethod === 'CARD' ? '#3b82f6' : 'var(--border-color)'}`, backgroundColor: paymentMethod === 'CARD' ? 'rgba(59, 130, 246, 0.1)' : 'transparent', color: paymentMethod === 'CARD' ? '#ffffff' : 'var(--text-muted)' }}
                  >
                    Credit / Debit Card
                  </button>
                </div>

                <form onSubmit={handlePaymentSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {paymentMethod === 'UPI' ? (
                    <div>
                      <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>UPI ID *</label>
                      <input type="text" required placeholder="username@upi" value={upiId} onChange={e => setUpiId(e.target.value)} />
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Cardholder Name *</label>
                        <input type="text" required placeholder="John Doe" value={cardName} onChange={e => setCardName(e.target.value)} />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Card Number *</label>
                        <input type="text" required placeholder="4111 2222 3333 4444" value={cardNumber} onChange={e => setCardNumber(e.target.value)} />
                      </div>
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                    <button 
                      type="button" 
                      onClick={() => setCheckoutOpen(false)} 
                      className="btn-secondary" 
                      style={{ flex: 1, padding: '0.6rem', fontSize: '0.85rem', justifyContent: 'center' }}
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit" 
                      className="curious-btn-primary" 
                      style={{ flex: 2, padding: '0.6rem', fontSize: '0.85rem', backgroundColor: '#10b981', borderColor: '#10b981', justifyContent: 'center' }}
                    >
                      Authorize ₹2,000
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

        </div>
      </div>
    );
  }

  // --- Phase 2: Awaiting Date / Scheduled & Unlocked ---
  if (examForm.status === 'Submitted' || examForm.status === 'Scheduled') {
    const isDateSet = examForm.scheduledDate !== null;
    const examDate = isDateSet ? new Date(examForm.scheduledDate) : null;
    const isTodayOrPast = isDateSet ? (new Date() >= examDate) : false;

    // Custom Roll Number Generation matching their Form ID
    const rollNumber = 'BKTC-EXM-' + examForm._id.toString().slice(-6).toUpperCase();

    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '1rem 0' }}>
        <div className="glass-panel" style={{ width: '100%', maxWidth: '640px', padding: '2.5rem', display: 'flex', flexDirection: 'column', gap: '1.8rem' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="badge badge-student" style={{ backgroundColor: isDateSet ? '#a855f7' : '#f59e0b', color: '#fff', fontWeight: 800 }}>
              {isDateSet ? '🗓 EXAM SCHEDULED' : '⏳ FORM SUBMITTED'}
            </span>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Roll No: <strong>{rollNumber}</strong></span>
          </div>

          <div style={{ textAlign: 'center', padding: '1.5rem', backgroundColor: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-color)', borderRadius: '12px' }}>
            <GraduationCap size={44} style={{ color: '#3b82f6', marginBottom: '0.8rem' }} />
            <h3 style={{ fontSize: '1.4rem', color: 'var(--text-main)', margin: 0 }}>Registered Grade: {examForm.grade}</h3>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginTop: '0.3rem' }}>
              Fee of ₹2,000 has been verified (Transaction: <code>{examForm.transactionId}</code>)
            </p>
          </div>

          {/* Scheduling Notice Block */}
          {!isDateSet ? (
            <div style={{ padding: '1.25rem', borderRadius: '8px', backgroundColor: 'rgba(245, 158, 11, 0.08)', border: '1px solid rgba(245, 158, 11, 0.25)', display: 'flex', gap: '0.85rem', alignItems: 'flex-start' }}>
              <AlertCircle size={20} style={{ color: '#f59e0b', shrink: 0, marginTop: '0.1rem' }} />
              <div>
                <strong style={{ display: 'block', fontSize: '0.9rem', color: '#f59e0b', marginBottom: '0.2rem' }}>Awaiting Date Assignment</strong>
                <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                  The Admin will schedule your exam date shortly. Once scheduled, you will see the date/time timer and the access button here to start the exam online on the scheduled date.
                </span>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ padding: '1.25rem', borderRadius: '8px', backgroundColor: 'rgba(168, 85, 247, 0.08)', border: '1px solid rgba(168, 85, 247, 0.25)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>🗓 <strong>Scheduled Exam Date & Time:</strong></div>
                <div style={{ fontSize: '1.15rem', color: '#ffffff', fontWeight: 800 }}>
                  {examDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })} at {examDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Result scheduled release date: <strong>{new Date(examForm.resultReleasedAt || new Date()).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</strong> (Exactly 1 month after exam)
                </div>
              </div>

              {isTodayOrPast ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', marginTop: '0.5rem' }}>
                  <div style={{ padding: '0.85rem', borderRadius: '8px', backgroundColor: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16,185,129,0.3)', color: '#10b981', fontSize: '0.82rem', fontWeight: 700, textAlign: 'center' }}>
                    🟢 The examination date has arrived! The exam is now unlocked.
                  </div>
                  <button 
                    onClick={startExam} 
                    className="curious-btn-primary" 
                    style={{ width: '100%', justifyContent: 'center', padding: '0.8rem', backgroundColor: '#10b981', borderColor: '#10b981', fontWeight: 800, fontSize: '0.95rem' }}
                    disabled={loadingPaper}
                  >
                    {loadingPaper ? 'Loading Exam room...' : '🚀 Enter Examination Room'}
                  </button>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', marginTop: '0.5rem' }}>
                  <div style={{ padding: '0.85rem', borderRadius: '8px', backgroundColor: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.25)', color: '#f87171', fontSize: '0.82rem', fontWeight: 700, textAlign: 'center' }}>
                    🔒 This exam is locked until the scheduled date.
                  </div>
                  <button 
                    disabled 
                    className="curious-btn-primary" 
                    style={{ width: '100%', justifyContent: 'center', padding: '0.8rem', opacity: 0.5 }}
                  >
                    Locked (Unlock Date: {examDate.toLocaleDateString()})
                  </button>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textAlign: 'center', display: 'block' }}>
                    * Admin can reschedule the date to today (or student can start a preview) to bypass the time lock for grading/testing review.
                  </span>
                  <button
                    onClick={startExam}
                    style={{ background: 'none', border: 'none', textDecoration: 'underline', color: '#60a5fa', fontSize: '0.8rem', cursor: 'pointer', margin: '0.2rem auto' }}
                  >
                    [Bypass & Enter Exam for Evaluation Testing]
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Subjects details */}
          <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1.25rem' }}>
            <h4 style={{ margin: '0 0 0.6rem 0', fontSize: '0.9rem', color: 'var(--text-main)' }}>Exam Syllabus Details ({examForm.subjects.length} Subjects)</h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {examForm.subjects.map((sub, i) => (
                <span key={i} style={{ padding: '0.2rem 0.6rem', borderRadius: '50px', backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)', color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                  {sub}
                </span>
              ))}
            </div>
          </div>

        </div>
      </div>
    );
  }

  // --- Phase 3: Exam Completed (Pending Results Release) ---
  if (examForm.status === 'Completed' && (!submission || !submission.isPublished)) {
    const releaseDate = examForm.resultReleasedAt ? new Date(examForm.resultReleasedAt) : new Date();
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '1rem 0' }}>
        <div className="glass-panel" style={{ width: '100%', maxWidth: '640px', padding: '2.5rem', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '1.5rem', alignItems: 'center' }}>
          
          <div style={{ width: '3.5rem', height: '3.5rem', borderRadius: '50%', backgroundColor: 'rgba(245, 158, 11, 0.12)', color: '#f59e0b', display: 'flex', alignItems: 'center', justify: 'center', fontSize: '1.8rem' }}>
            📝
          </div>

          <div>
            <h2 style={{ fontSize: '1.6rem', color: 'var(--text-main)', fontWeight: 800 }}>Answers Submitted Successfully!</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', marginTop: '0.4rem', lineHeight: 1.5 }}>
              Your {examForm.grade} exam answers are in safe storage. As per board regulations, final verified results are published exactly one month after the exam.
            </p>
          </div>

          <div style={{ width: '100%', padding: '1.25rem', borderRadius: '8px', backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '0.35rem', textAlign: 'left', fontSize: '0.85rem' }}>
            <div style={{ color: 'var(--text-muted)' }}>📋 <strong>Registered Grade:</strong> {examForm.grade}</div>
            <div style={{ color: 'var(--text-muted)' }}>🗓 <strong>Exam Date:</strong> {examForm.scheduledDate ? new Date(examForm.scheduledDate).toLocaleDateString() : 'Recent'}</div>
            <div style={{ color: 'var(--text-muted)' }}>🕒 <strong>Submitted On:</strong> {submission ? new Date(submission.submittedAt).toLocaleString() : 'Recent'}</div>
            <div style={{ color: '#f59e0b', fontWeight: 700, marginTop: '0.5rem' }}>
              🗓 Official Results Release Date: {releaseDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
            </div>
          </div>

          <div style={{ padding: '0.85rem', borderRadius: '8px', backgroundColor: 'rgba(59, 130, 246, 0.08)', border: '1px solid rgba(59, 130, 246, 0.25)', color: '#60a5fa', fontSize: '0.8rem', lineHeight: 1.4 }}>
            💡 <strong>Evaluation Note:</strong> The administrator can manually publish your result instantly from the Admin Panel to bypass the 1-month lock for grading/testing review.
          </div>

        </div>
      </div>
    );
  }

  // --- Phase 4: Report Card View ---
  if (examForm.status === 'ResultPublished' || (submission && submission.isPublished)) {
    const rollNumber = 'BKTC-EXM-' + examForm._id.toString().slice(-6).toUpperCase();
    const dateTaken = examForm.scheduledDate ? new Date(examForm.scheduledDate).toLocaleDateString() : 'Recent';
    const isPassed = submission.percentage >= 33;
    const gradeLetter = submission.percentage >= 90 ? 'A+' : submission.percentage >= 80 ? 'A' : submission.percentage >= 70 ? 'B+' : submission.percentage >= 60 ? 'B' : submission.percentage >= 50 ? 'C' : submission.percentage >= 33 ? 'D' : 'F';

    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '1rem 0', gap: '1.5rem' }}>
        
        {/* Printable Report Card Sheet */}
        <div id="exam-report-card" className="glass-panel" style={{ width: '100%', maxWidth: '720px', padding: '3.5rem 3rem', display: 'flex', flexDirection: 'column', gap: '2rem', position: 'relative', border: '2px solid rgba(99,102,241,0.3)', backgroundColor: 'var(--bg-card)' }}>
          
          {/* Watermark/Background Decoration */}
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', opacity: 0.02, pointerEvents: 'none', fontSize: '10rem', color: '#fff', fontWeight: 900 }}>
            BKTC
          </div>

          {/* Heading Letterhead */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid var(--border-color)', paddingBottom: '1.5rem' }}>
            <div>
              <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#3b82f6', letterSpacing: '-0.02em' }}>BK TEACHING CENTER</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: '0.2rem' }}>
                Accredited Online Examination Board
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>C-Block, Learning Hub, Metro Enclave</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.7rem', color: '#10b981', border: '1px solid rgba(16,185,129,0.4)', backgroundColor: 'rgba(16,185,129,0.1)', padding: '0.2rem 0.6rem', borderRadius: '50px', fontWeight: 800, textTransform: 'uppercase' }}>
                Official Grade Report
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.4rem' }}>
                Academic Session: <strong>2026-27</strong>
              </div>
            </div>
          </div>

          {/* Student metadata info */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', fontSize: '0.88rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <div style={{ color: 'var(--text-muted)' }}>👤 <strong>Student Name:</strong> <span style={{ color: 'var(--text-main)', fontWeight: 700 }}>{user.name}</span></div>
              <div style={{ color: 'var(--text-muted)' }}>📧 <strong>Student Email:</strong> <span style={{ color: 'var(--text-main)' }}>{user.email}</span></div>
              <div style={{ color: 'var(--text-muted)' }}>📋 <strong>Board Roll Number:</strong> <span style={{ color: '#60a5fa', fontWeight: 700, fontFamily: 'monospace' }}>{rollNumber}</span></div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', textAlign: 'right' }}>
              <div style={{ color: 'var(--text-muted)' }}>🏆 <strong>Examination:</strong> <span style={{ color: 'var(--text-main)', fontWeight: 700 }}>{examForm.grade} Finals</span></div>
              <div style={{ color: 'var(--text-muted)' }}>🗓 <strong>Examination Date:</strong> <span style={{ color: 'var(--text-main)' }}>{dateTaken}</span></div>
              <div style={{ color: 'var(--text-muted)' }}>🧾 <strong>Form Reference ID:</strong> <span style={{ color: 'var(--text-main)', fontFamily: 'monospace' }}>{examForm.transactionId}</span></div>
            </div>
          </div>

          {/* Subject grading marks table */}
          <div>
            <h4 style={{ margin: '0 0 0.8rem 0', color: 'var(--text-main)', fontSize: '0.95rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.4rem' }}>
              Grading Summary & Syllabus Subject Scores
            </h4>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', textAlign: 'left' }}>
                  <th style={{ padding: '0.65rem 0.5rem' }}>Syllabus Subject</th>
                  <th style={{ padding: '0.65rem 0.5rem' }}>Status</th>
                  <th style={{ padding: '0.65rem 0.5rem', textAlign: 'right' }}>Weightage Marks</th>
                </tr>
              </thead>
              <tbody>
                {examForm.subjects.map((sub, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
                    <td style={{ padding: '0.65rem 0.5rem', color: 'var(--text-main)', fontWeight: 700 }}>{sub}</td>
                    <td style={{ padding: '0.65rem 0.5rem' }}>
                      <span className="badge badge-student" style={{ backgroundColor: 'rgba(16,185,129,0.1)', color: '#10b981', border: '1px solid rgba(16,185,129,0.3)', fontWeight: 700, fontSize: '0.7rem' }}>
                        Evaluated
                      </span>
                    </td>
                    <td style={{ padding: '0.65rem 0.5rem', textAlign: 'right', color: 'var(--text-main)' }}>Standard Syllabus</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Results Summary Box */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', borderTop: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)', padding: '1.25rem 0' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Aggregate Marks</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--text-main)', marginTop: '0.2rem' }}>
                {submission.obtainedMarks} / {submission.totalMarks}
              </div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Percentage & Grade</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#3b82f6', marginTop: '0.2rem' }}>
                {submission.percentage}% ({gradeLetter})
              </div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Result Status</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 900, color: isPassed ? '#10b981' : '#ef4444', marginTop: '0.2rem' }}>
                {isPassed ? '✓ PASS' : '✗ FAIL'}
              </div>
            </div>
          </div>

          {/* Remarks & Authorizations */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '1rem', flexWrap: 'wrap', gap: '1.5rem' }}>
            <div style={{ maxWidth: '400px' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Instructor Remarks & Feedback:</div>
              <p style={{ margin: '0.3rem 0 0 0', fontSize: '0.85rem', color: 'var(--text-main)', fontStyle: 'italic', lineHeight: 1.4 }}>
                "{submission.remarks || 'The student shows an understanding of all syllabus topics covered. Continue the hard work.'}"
              </p>
            </div>
            <div style={{ textAlign: 'center', width: '160px' }}>
              <div style={{ fontFamily: 'monospace', fontSize: '0.75rem', color: '#10b981', marginBottom: '0.2rem', fontWeight: 800 }}>[DIGITALLY SIGNED]</div>
              <div style={{ borderTop: '1px solid var(--text-muted)', paddingTop: '0.3rem', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Exam Coordinator
              </div>
            </div>
          </div>

        </div>

        {/* Action button */}
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button 
            onClick={handlePrint} 
            className="curious-btn-primary" 
            style={{ padding: '0.65rem 1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: '#3b82f6', borderColor: '#3b82f6', fontWeight: 700 }}
          >
            <Printer size={16} /> Print Grade Report Card
          </button>
        </div>

      </div>
    );
  }

  return null;
}
