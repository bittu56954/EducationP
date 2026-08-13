import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { 
  Plus, Edit, Trash2, Clock, Calendar, Users, 
  FileText, Award, Printer, CheckCircle, ArrowLeft 
} from './Icons';
import { Modal } from './Modal';

export function TeacherTestView({ user, setToast }) {
  const [tests, setTests] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal and edit states
  const [isTestModalOpen, setIsTestModalOpen] = useState(false);
  const [editingTest, setEditingTest] = useState(null);

  // Student submissions inspector states
  const [inspectingTest, setInspectingTest] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [loadingSubmissions, setLoadingSubmissions] = useState(false);
  const [viewingSubmission, setViewingSubmission] = useState(null);

  // Test form state
  const [form, setForm] = useState({
    title: '',
    subject: 'Web Development',
    courseId: '',
    duration: 15,
    scheduledAt: new Date(Date.now() + 86400000).toISOString().slice(0, 16),
    questions: [
      {
        questionText: '',
        options: ['', '', '', ''],
        correctOption: 0,
        marks: 1
      }
    ]
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [testsRes, coursesRes] = await Promise.all([
        api.getTests(),
        api.getCourses({ teacherId: user?._id })
      ]);
      setTests(testsRes.tests || []);
      const teacherCourses = coursesRes.courses || [];
      setCourses(teacherCourses);
      
      // Default courseId in form
      if (teacherCourses.length > 0 && !form.courseId) {
        setForm(prev => ({ ...prev, courseId: teacherCourses[0]._id }));
      }
    } catch (err) {
      console.error('Failed to load teacher test data:', err);
      if (setToast) setToast({ message: 'Error loading test records', type: 'danger' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Update total marks automatically based on sum of question marks
  const calculateTotalMarks = (questionsList) => {
    return questionsList.reduce((sum, q) => sum + (Number(q.marks) || 1), 0);
  };

  const handleOpenCreateModal = () => {
    setEditingTest(null);
    setForm({
      title: '',
      subject: courses[0]?.category || 'Web Development',
      courseId: courses[0]?._id || '',
      duration: 15,
      scheduledAt: new Date(Date.now() + 86400000).toISOString().slice(0, 16),
      questions: [
        {
          questionText: '',
          options: ['', '', '', ''],
          correctOption: 0,
          marks: 1
        }
      ]
    });
    setIsTestModalOpen(true);
  };

  const handleOpenEditModal = (test) => {
    setEditingTest(test);
    
    // Format scheduledAt date for input type datetime-local
    const dateObj = new Date(test.scheduledAt);
    const tzOffset = dateObj.getTimezoneOffset() * 60000; // in milliseconds
    const localISOTime = (new Date(dateObj - tzOffset)).toISOString().slice(0, 16);

    setForm({
      title: test.title,
      subject: test.subject,
      courseId: test.course?._id || test.course || '',
      duration: test.duration,
      scheduledAt: localISOTime,
      questions: test.questions.map(q => ({
        questionText: q.questionText,
        options: [...q.options],
        correctOption: q.correctOption,
        marks: q.marks || 1
      }))
    });
    setIsTestModalOpen(true);
  };

  const handleDeleteTest = async (testId) => {
    if (!window.confirm('Are you sure you want to delete this test? All student results for this test will be lost permanent.')) {
      return;
    }

    try {
      const res = await api.deleteTest(testId);
      if (res.success) {
        if (setToast) setToast({ message: 'Test deleted successfully', type: 'success' });
        loadData();
      }
    } catch (err) {
      if (setToast) setToast({ message: err.message || 'Failed to delete test', type: 'danger' });
    }
  };

  // Question manipulation
  const handleAddQuestion = () => {
    const questions = [...form.questions];
    questions.push({
      questionText: '',
      options: ['', '', '', ''],
      correctOption: 0,
      marks: 1
    });
    setForm({ ...form, questions });
  };

  const handleRemoveQuestion = (qIdx) => {
    if (form.questions.length <= 1) {
      if (setToast) setToast({ message: 'A test must contain at least 1 question.', type: 'warning' });
      return;
    }
    const questions = form.questions.filter((_, idx) => idx !== qIdx);
    setForm({ ...form, questions });
  };

  const handleQuestionTextChange = (qIdx, value) => {
    const questions = [...form.questions];
    questions[qIdx].questionText = value;
    setForm({ ...form, questions });
  };

  const handleOptionChange = (qIdx, oIdx, value) => {
    const questions = [...form.questions];
    questions[qIdx].options[oIdx] = value;
    setForm({ ...form, questions });
  };

  const handleCorrectOptionChange = (qIdx, value) => {
    const questions = [...form.questions];
    questions[qIdx].correctOption = Number(value);
    setForm({ ...form, questions });
  };

  const handleMarksChange = (qIdx, value) => {
    const questions = [...form.questions];
    questions[qIdx].marks = Number(value) || 1;
    setForm({ ...form, questions });
  };

  // Submit test create/edit form
  const handleSaveTest = async (e) => {
    e.preventDefault();

    const targetTitle = form.title.trim() || `${form.subject || 'Course'} Weekly Assessment`;
    const targetCourseId = form.courseId || courses[0]?._id || 'crs_1';

    // Validate questions
    for (let i = 0; i < form.questions.length; i++) {
      const q = form.questions[i];
      if (!q.questionText.trim()) {
        if (setToast) setToast({ message: `Question ${i + 1} text is empty`, type: 'danger' });
        return;
      }
      for (let j = 0; j < 4; j++) {
        if (!q.options[j] || !q.options[j].trim()) {
          if (setToast) setToast({ message: `Option ${String.fromCharCode(65 + j)} for Question ${i + 1} is empty`, type: 'danger' });
          return;
        }
      }
    }

    const payload = {
      title: targetTitle,
      subject: form.subject || 'Web Development',
      course: targetCourseId,
      courseId: targetCourseId,
      duration: Number(form.duration) || 15,
      scheduledAt: form.scheduledAt ? new Date(form.scheduledAt).toISOString() : new Date().toISOString(),
      totalMarks: calculateTotalMarks(form.questions),
      questions: form.questions
    };

    try {
      let res;
      if (editingTest) {
        res = await api.updateTest(editingTest._id, payload);
        if (setToast) setToast({ message: 'Test details updated successfully', type: 'success' });
      } else {
        res = await api.createTest(payload);
        if (setToast) setToast({ message: 'Weekly test created and scheduled successfully', type: 'success' });
      }

      setIsTestModalOpen(false);
      loadData();
    } catch (err) {
      if (setToast) setToast({ message: err.message || 'Save failed', type: 'danger' });
    }
  };

  // View student attempts list
  const handleInspectSubmissions = async (test) => {
    setInspectingTest(test);
    setLoadingSubmissions(true);
    try {
      const res = await api.getTestSubmissions(test._id);
      setSubmissions(res.submissions || []);
    } catch (err) {
      console.error('Failed to load submissions:', err);
      if (setToast) setToast({ message: 'Failed to fetch student results', type: 'danger' });
    } finally {
      setLoadingSubmissions(false);
    }
  };

  const getPercentageColor = (pct) => {
    if (pct >= 85) return '#10b981';
    if (pct >= 60) return '#3b82f6';
    if (pct >= 40) return '#f59e0b';
    return '#ef4444';
  };

  if (loading) {
    return <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading weekly testing hub...</div>;
  }

  // INSPECT SUBMISSIONS LIST VIEW
  if (inspectingTest) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* Navigation header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
          <button 
            onClick={() => setInspectingTest(null)}
            className="curious-btn-outline"
            style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}
          >
            <ArrowLeft size={16} /> Back to Dashboard
          </button>
          <div>
            <span className="badge badge-teacher">{inspectingTest.subject}</span>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-main)', margin: '0.1rem 0' }}>
              Student Submissions: {inspectingTest.title}
            </h3>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              Total Marks: {inspectingTest.totalMarks} • Test Duration: {inspectingTest.duration} Mins
            </span>
          </div>
        </div>

        {/* Submissions Table list */}
        {loadingSubmissions ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading student submissions...</div>
        ) : submissions.length === 0 ? (
          <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            <Users size={36} style={{ opacity: 0.3, marginBottom: '0.5rem' }} />
            <h4>No students have attempted this test yet.</h4>
            <p style={{ fontSize: '0.82rem' }}>Once students submit their online answers, their graded score and duration records will appear here.</p>
          </div>
        ) : (
          <div className="glass-panel" style={{ padding: 0, overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)', backgroundColor: 'rgba(255,255,255,0.02)', color: 'var(--text-muted)', fontSize: '0.78rem', textTransform: 'uppercase' }}>
                  <th style={{ padding: '0.85rem 1rem' }}>Student Name</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Student Email</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Attempt Date</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Obtained Score</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Percentage</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Duration Spent</th>
                  <th style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {submissions.map((sub, idx) => {
                  const student = sub.student || {};
                  const dateStr = sub.submittedAt ? new Date(sub.submittedAt).toLocaleDateString() : 'Recent';
                  const pct = sub.percentage;
                  
                  return (
                    <tr key={sub._id || idx} style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <td style={{ padding: '0.85rem 1rem', fontWeight: 700, color: 'var(--text-main)' }}>
                        {student.name || sub.studentName}
                      </td>
                      <td style={{ padding: '0.85rem 1rem', color: 'var(--text-muted)' }}>
                        {student.email || sub.studentEmail}
                      </td>
                      <td style={{ padding: '0.85rem 1rem', color: 'var(--text-main)' }}>
                        {dateStr}
                      </td>
                      <td style={{ padding: '0.85rem 1rem', fontWeight: 700, color: 'var(--text-main)' }}>
                        {sub.obtainedMarks} / {sub.totalMarks}
                      </td>
                      <td style={{ padding: '0.85rem 1rem', fontWeight: 800, color: getPercentageColor(pct) }}>
                        {pct}%
                      </td>
                      <td style={{ padding: '0.85rem 1rem', color: 'var(--text-muted)' }}>
                        {sub.durationSpent ? `${Math.floor(sub.durationSpent / 60)}m ${sub.durationSpent % 60}s` : '0s'}
                      </td>
                      <td style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>
                        <button
                          onClick={() => setViewingSubmission({ ...sub, test: inspectingTest })}
                          className="curious-btn-primary"
                          style={{ padding: '0.4rem 0.8rem', fontSize: '0.78rem', backgroundColor: '#3b82f6', borderColor: '#3b82f6' }}
                        >
                          <Printer size={12} /> View Report
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Printable modal report card overlay */}
        {viewingSubmission && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: 'rgba(0,0,0,0.85)',
            zIndex: 99999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.5rem',
            overflowY: 'auto'
          }}>
            <div style={{
              position: 'relative',
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              borderRadius: '24px',
              width: '100%',
              maxWidth: '650px',
              padding: '2.5rem',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.55)',
              display: 'flex',
              flexDirection: 'column',
              gap: '1.5rem',
            }}>
              <div className="no-print" style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button 
                  onClick={() => window.print()}
                  className="curious-btn-primary"
                  style={{ padding: '0.5rem 1rem', fontSize: '0.82rem', backgroundColor: '#10b981', borderColor: '#10b981' }}
                >
                  <Printer size={14} /> Print / Save PDF
                </button>
                <button 
                  onClick={() => setViewingSubmission(null)}
                  className="curious-btn-outline"
                  style={{ padding: '0.5rem 1rem', fontSize: '0.82rem' }}
                >
                  Close View
                </button>
              </div>

              {/* Printable area */}
              <div id="printable-report-card" style={{
                padding: '2rem',
                backgroundColor: '#ffffff',
                color: '#1e293b',
                border: '8px double #4f46e5',
                borderRadius: '16px',
                fontFamily: '"Outfit", "Inter", sans-serif',
                position: 'relative'
              }}>
                <div style={{ textAlign: 'center', borderBottom: '2px solid #4f46e5', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
                  <h1 style={{ fontSize: '1.6rem', fontWeight: 900, color: '#4f46e5', margin: 0 }}>BK TEACHING CENTER</h1>
                  <p style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: '0.2rem', fontWeight: 700 }}>
                    Official Student Examination Report Card
                  </p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', fontSize: '0.85rem', marginBottom: '1.5rem', borderBottom: '1px dashed #e2e8f0', paddingBottom: '1rem' }}>
                  <div>
                    <div style={{ color: '#64748b', fontSize: '0.75rem', textTransform: 'uppercase' }}>Candidate Name:</div>
                    <strong style={{ fontSize: '1rem', color: '#0f172a' }}>{viewingSubmission.student?.name || viewingSubmission.studentName}</strong>
                    <div style={{ color: '#64748b', fontSize: '0.75rem', marginTop: '0.35rem', textTransform: 'uppercase' }}>Candidate Email:</div>
                    <div style={{ color: '#334155' }}>{viewingSubmission.student?.email || viewingSubmission.studentEmail}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ color: '#64748b', fontSize: '0.75rem', textTransform: 'uppercase' }}>Exam Subject:</div>
                    <strong style={{ fontSize: '1rem', color: '#4f46e5' }}>{viewingSubmission.test?.subject || 'General'}</strong>
                    <div style={{ color: '#64748b', fontSize: '0.75rem', marginTop: '0.35rem', textTransform: 'uppercase' }}>Test Title:</div>
                    <div style={{ color: '#334155', fontWeight: 600 }}>{viewingSubmission.test?.title}</div>
                  </div>
                </div>

                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem', marginBottom: '2rem' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid #cbd5e1' }}>
                      <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: 700, color: '#475569' }}>Evaluation Metric</th>
                      <th style={{ padding: '0.75rem', textAlign: 'right', fontWeight: 700, color: '#475569' }}>Scored Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                      <td style={{ padding: '0.75rem', color: '#475569' }}>Obtained Score Marks</td>
                      <td style={{ padding: '0.75rem', textAlign: 'right', fontWeight: 700, color: '#0f172a' }}>{viewingSubmission.obtainedMarks} Marks</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                      <td style={{ padding: '0.75rem', color: '#475569' }}>Total Possible Marks</td>
                      <td style={{ padding: '0.75rem', textAlign: 'right', fontWeight: 700, color: '#475569' }}>{viewingSubmission.totalMarks} Marks</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid #cbd5e1' }}>
                      <td style={{ padding: '0.75rem', color: '#475569' }}>Duration Spent</td>
                      <td style={{ padding: '0.75rem', textAlign: 'right', color: '#475569' }}>{viewingSubmission.durationSpent ? `${Math.floor(viewingSubmission.durationSpent / 60)}m ${viewingSubmission.durationSpent % 60}s` : 'Unknown'}</td>
                    </tr>
                    <tr style={{ backgroundColor: '#f8fafc' }}>
                      <td style={{ padding: '0.75rem', fontWeight: 700, color: '#4f46e5' }}>Percentage Performance</td>
                      <td style={{ padding: '0.75rem', textAlign: 'right', fontWeight: 900, fontSize: '1.1rem', color: viewingSubmission.percentage >= 40 ? '#16a34a' : '#dc2626' }}>
                        {viewingSubmission.percentage}%
                      </td>
                    </tr>
                  </tbody>
                </table>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '2.5rem' }}>
                  <div>
                    <span style={{ fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase', display: 'block' }}>Result Status:</span>
                    <span style={{
                      display: 'inline-block',
                      backgroundColor: viewingSubmission.percentage >= 40 ? '#dcfce7' : '#fee2e2',
                      color: viewingSubmission.percentage >= 40 ? '#15803d' : '#b91c1c',
                      padding: '0.35rem 0.85rem',
                      borderRadius: '50px',
                      fontWeight: 800,
                      fontSize: '0.78rem',
                      marginTop: '0.2rem',
                      textTransform: 'uppercase'
                    }}>
                      {viewingSubmission.percentage >= 40 ? '✓ PASSED & CERTIFIED' : '✖ FAIL'}
                    </span>
                    <span style={{ display: 'block', fontSize: '0.65rem', color: '#94a3b8', marginTop: '0.5rem' }}>
                      Exam Date: {new Date(viewingSubmission.submittedAt || Date.now()).toLocaleDateString()}
                    </span>
                  </div>

                  <div style={{ textAlign: 'center', width: '160px' }}>
                    <div style={{ fontFamily: 'cursive', fontSize: '1.4rem', color: '#0f172a', transform: 'rotate(-5deg)', marginBottom: '0.1rem' }}>
                      {viewingSubmission.test?.teacherName || user?.name || 'Instructor'}
                    </div>
                    <div style={{ borderTop: '1px solid #cbd5e1', paddingTop: '0.2rem', fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>
                      Authorized Faculty
                    </div>
                  </div>
                </div>
              </div>

              <style dangerouslySetInnerHTML={{__html: `
                @media print {
                  body * {
                    visibility: hidden !important;
                  }
                  #printable-report-card, #printable-report-card * {
                    visibility: visible !important;
                  }
                  #printable-report-card {
                    position: absolute !important;
                    left: 0 !important;
                    top: 0 !important;
                    width: 100% !important;
                    border: none !important;
                    box-shadow: none !important;
                  }
                  .no-print {
                    display: none !important;
                  }
                }
              `}} />

            </div>
          </div>
        )}

      </div>
    );
  }

  // STANDARD MAIN TEACHER TESTS OVERVIEW
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
            <FileText size={22} style={{ color: '#a855f7' }} /> Weekly Test System Management ({tests.length})
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
            Create online multiple choice quizzes, schedule weekly online tests, and view candidate scores.
          </p>
        </div>

        <button 
          onClick={handleOpenCreateModal}
          className="curious-btn-primary"
          style={{ padding: '0.6rem 1.25rem', fontSize: '0.88rem', backgroundColor: '#a855f7', borderColor: '#a855f7' }}
        >
          <Plus size={16} /> Create & Schedule Test
        </button>
      </div>

      {tests.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem 2rem', backgroundColor: 'var(--bg-glass)', borderRadius: '16px', border: '1px dashed var(--border-color)' }}>
          <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>📝</div>
          <h4 style={{ fontSize: '1.25rem', color: 'var(--text-main)', marginBottom: '0.5rem' }}>No Tests Published Yet</h4>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem', maxWidth: '440px', margin: '0 auto 1.5rem' }}>
            Set up your first weekly exam, configure multiple choice questions, and assign it to your target courses.
          </p>
          <button className="curious-btn-primary" style={{ backgroundColor: '#a855f7', borderColor: '#a855f7' }} onClick={handleOpenCreateModal}>
            Create First Test Now
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1.5rem' }}>
          {tests.map(test => {
            const isFuture = new Date(test.scheduledAt) > new Date();
            const dateStr = new Date(test.scheduledAt).toLocaleString();
            
            return (
              <div key={test._id} className="glass-card" style={{
                padding: '1.5rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
                border: '1px solid var(--border-color)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className="badge badge-teacher">{test.subject}</span>
                  <span style={{ fontSize: '0.72rem', fontWeight: 800, color: isFuture ? '#f59e0b' : '#10b981', backgroundColor: isFuture ? 'rgba(245,158,11,0.15)' : 'rgba(16,185,129,0.15)', padding: '0.2rem 0.5rem', borderRadius: '12px' }}>
                    {isFuture ? '⏳ Scheduled' : '✓ Live & Active'}
                  </span>
                </div>

                <div>
                  <h4 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)', margin: '0.2rem 0' }}>
                    {test.title}
                  </h4>
                  <span style={{ fontSize: '0.78rem', color: '#60a5fa', fontWeight: 600 }}>
                    Target Course: {test.course?.title || 'General'}
                  </span>
                </div>

                <div style={{
                  backgroundColor: 'rgba(255,255,255,0.02)',
                  border: '1px solid var(--border-color)',
                  padding: '0.8rem',
                  borderRadius: '10px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.35rem',
                  fontSize: '0.82rem'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>⏰ Duration:</span>
                    <strong style={{ color: 'var(--text-main)' }}>{test.duration} Minutes</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>🎯 Total Marks:</span>
                    <strong style={{ color: 'var(--text-main)' }}>{test.totalMarks} Marks</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>📝 Questions count:</span>
                    <strong style={{ color: 'var(--text-main)' }}>{test.questions?.length || 0} Questions</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>🗓️ Scheduled Date:</span>
                    <span style={{ color: 'var(--text-main)', textAlign: 'right' }}>{dateStr}</span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', marginTop: 'auto', paddingTop: '0.5rem' }}>
                  <button 
                    onClick={() => handleInspectSubmissions(test)}
                    className="curious-btn-primary"
                    style={{ flex: 2, padding: '0.5rem', justifyContent: 'center', backgroundColor: '#a855f7', borderColor: '#a855f7', fontSize: '0.82rem' }}
                  >
                    <Users size={14} /> Student Submissions
                  </button>
                  <button 
                    onClick={() => handleOpenEditModal(test)}
                    className="curious-btn-outline"
                    style={{ padding: '0.5rem', fontSize: '0.82rem' }}
                    title="Edit test"
                  >
                    <Edit size={14} />
                  </button>
                  <button 
                    onClick={() => handleDeleteTest(test._id)}
                    className="curious-btn-outline"
                    style={{ padding: '0.5rem', borderColor: 'rgba(239, 68, 68, 0.4)', color: '#ef4444' }}
                    title="Delete test"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* CREATE / EDIT TEST DIALOG MODAL */}
      <Modal 
        isOpen={isTestModalOpen} 
        onClose={() => setIsTestModalOpen(false)} 
        title={editingTest ? 'Edit Weekly Test Details' : 'Create & Schedule Weekly Test'}
      >
        <form onSubmit={handleSaveTest} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem', maxHeight: '75vh', overflowY: 'auto', paddingRight: '0.5rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>Test Title (Optional)</label>
            <input 
              type="text" 
              placeholder="e.g. JavaScript Arrays & Loops Weekly Exam (Auto-generated if blank)"
              value={form.title}
              onChange={e => setForm({ ...form, title: e.target.value })}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>Subject Category *</label>
              <input 
                type="text" 
                required 
                placeholder="e.g. JavaScript / CSS / React"
                value={form.subject}
                onChange={e => setForm({ ...form, subject: e.target.value })}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>Select Target Course *</label>
              <select 
                required
                value={form.courseId}
                onChange={e => setForm({ ...form, courseId: e.target.value })}
              >
                <option value="">-- Choose Target Course --</option>
                {courses.map(c => (
                  <option key={c._id} value={c._id}>{c.title}</option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>Duration (Minutes) *</label>
              <input 
                type="number" 
                required 
                min={1}
                value={form.duration}
                onChange={e => setForm({ ...form, duration: Number(e.target.value) })}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>Scheduled Start Date & Time *</label>
              <input 
                type="datetime-local" 
                required 
                value={form.scheduledAt}
                onChange={e => setForm({ ...form, scheduledAt: e.target.value })}
              />
            </div>
          </div>

          {/* DYNAMIC QUESTION BUILDER */}
          <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1.25rem', marginTop: '0.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h4 style={{ fontSize: '1rem', color: 'var(--text-main)', fontWeight: 800, margin: 0 }}>
                Test Questions ({form.questions.length})
              </h4>
              <span style={{ fontSize: '0.82rem', color: '#10b981', fontWeight: 700 }}>
                Calculated Total Marks: {calculateTotalMarks(form.questions)} Marks
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {form.questions.map((q, qIdx) => (
                <div key={qIdx} style={{
                  backgroundColor: 'rgba(255,255,255,0.02)',
                  border: '1px solid var(--border-color)',
                  padding: '1.25rem',
                  borderRadius: '12px',
                  position: 'relative',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.85rem'
                }}>
                  {/* Question header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <strong style={{ fontSize: '0.9rem', color: '#3b82f6' }}>Question {qIdx + 1}</strong>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Marks:</span>
                        <input 
                          type="number" 
                          min={1}
                          required
                          style={{ width: '60px', padding: '0.2rem 0.4rem', fontSize: '0.8rem' }}
                          value={q.marks}
                          onChange={e => handleMarksChange(qIdx, e.target.value)}
                        />
                      </div>
                      <button 
                        type="button" 
                        onClick={() => handleRemoveQuestion(qIdx)}
                        style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '0.2rem' }}
                        title="Remove question"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  {/* Question text */}
                  <div>
                    <input 
                      type="text" 
                      required 
                      placeholder="Type question text here..."
                      value={q.questionText}
                      onChange={e => handleQuestionTextChange(qIdx, e.target.value)}
                    />
                  </div>

                  {/* Options */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                    {q.options.map((opt, oIdx) => (
                      <div key={oIdx} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-muted)' }}>
                          {String.fromCharCode(65 + oIdx)}:
                        </span>
                        <input 
                          type="text" 
                          required 
                          placeholder={`Option ${String.fromCharCode(65 + oIdx)}`}
                          style={{ fontSize: '0.82rem', padding: '0.45rem' }}
                          value={opt}
                          onChange={e => handleOptionChange(qIdx, oIdx, e.target.value)}
                        />
                      </div>
                    ))}
                  </div>

                  {/* Correct Option Dropdown */}
                  <div>
                    <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginRight: '0.5rem' }}>Correct Option Index:</label>
                    <select 
                      style={{ width: '150px', padding: '0.3rem 0.5rem', fontSize: '0.8rem', display: 'inline-block' }}
                      value={q.correctOption}
                      onChange={e => handleCorrectOptionChange(qIdx, e.target.value)}
                    >
                      <option value={0}>Option A</option>
                      <option value={1}>Option B</option>
                      <option value={2}>Option C</option>
                      <option value={3}>Option D</option>
                    </select>
                  </div>
                </div>
              ))}
            </div>

            <button 
              type="button" 
              onClick={handleAddQuestion}
              className="curious-btn-outline"
              style={{ width: '100%', justifyContent: 'center', marginTop: '1.2rem', padding: '0.6rem' }}
            >
              <Plus size={16} /> Add Another Question
            </button>
          </div>

          <button 
            type="submit" 
            className="curious-btn-primary" 
            style={{ width: '100%', justifyContent: 'center', padding: '0.75rem', marginTop: '1rem', backgroundColor: '#a855f7', borderColor: '#a855f7' }}
          >
            {editingTest ? 'Update Weekly Test' : 'Schedule & Publish Test'}
          </button>
        </form>
      </Modal>
    </div>
  );
}
