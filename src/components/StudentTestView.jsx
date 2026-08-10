import React, { useState, useEffect, useRef } from 'react';
import { api } from '../services/api';
import { 
  FileText, Clock, Award, Printer, Download, BookOpen, 
  CheckCircle, Calendar, Play
} from './Icons';

export function StudentTestView({ user, setToast }) {
  const [tests, setTests] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Active quiz state
  const [activeTest, setActiveTest] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [quizStartTime, setQuizStartTime] = useState(null);
  const timerRef = useRef(null);

  // Completed submission result screen
  const [lastSubmissionResult, setLastSubmissionResult] = useState(null);

  // View Report Card state
  const [viewingSubmission, setViewingSubmission] = useState(null);

  const loadTestData = async () => {
    setLoading(true);
    try {
      const [testsRes, submissionsRes] = await Promise.all([
        api.getTests(),
        api.getMySubmissions()
      ]);
      setTests(testsRes.tests || []);
      setSubmissions(submissionsRes.submissions || []);
    } catch (err) {
      console.error('Failed to load test data:', err);
      if (setToast) setToast({ message: 'Error loading weekly tests history', type: 'danger' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTestData();
  }, []);

  // Timer countdown hook
  useEffect(() => {
    if (activeTest && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            // Time is up! Trigger auto submit
            handleAutoSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [activeTest, timeLeft]);

  // Start test attempt
  const handleStartTest = (test) => {
    const isFuture = new Date(test.scheduledAt) > new Date();
    if (isFuture) {
      if (setToast) setToast({ message: `This test is locked until its scheduled time: ${new Date(test.scheduledAt).toLocaleString()}`, type: 'warning' });
      return;
    }

    if (test.isAttempted) {
      if (setToast) setToast({ message: 'You have already attempted this test.', type: 'info' });
      return;
    }

    if (!window.confirm(`Are you ready to start "${test.title}"? \n\nDuration: ${test.duration} minutes\nQuestions: ${test.questions.length}\nTotal Marks: ${test.totalMarks}\n\nNote: Once started, the timer cannot be paused and the test will auto-submit when the timer ends.`)) {
      return;
    }

    setActiveTest(test);
    setAnswers(new Array(test.questions.length).fill(null));
    setCurrentQuestionIndex(0);
    setTimeLeft(test.duration * 60);
    setQuizStartTime(Date.now());
    setLastSubmissionResult(null);
  };

  // Select an option
  const handleSelectOption = (qIdx, optIdx) => {
    const updated = [...answers];
    updated[qIdx] = optIdx;
    setAnswers(updated);
  };

  // Submit test
  const submitQuiz = async (isAutoSubmit = false) => {
    if (timerRef.current) clearInterval(timerRef.current);

    const timeSpentSeconds = Math.round((Date.now() - quizStartTime) / 1000);
    const durationSpent = Math.min(timeSpentSeconds, activeTest.duration * 60);

    try {
      if (setToast) setToast({ message: isAutoSubmit ? 'Time is up! Auto-submitting...' : 'Submitting answers...', type: 'info' });

      const res = await api.submitTest(activeTest._id, {
        answers,
        durationSpent
      });

      if (res.success) {
        setLastSubmissionResult(res.submission);
        if (setToast) setToast({ message: '🎉 Weekly Test Submitted Successfully!', type: 'success' });
        
        // Refresh lists
        loadTestData();
      } else {
        throw new Error(res.message || 'Evaluation failed');
      }
    } catch (err) {
      console.error('Submission failed:', err);
      if (setToast) setToast({ message: err.message || 'Failed to submit test', type: 'danger' });
      setActiveTest(null);
    }
  };

  const handleAutoSubmit = () => {
    submitQuiz(true);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getPercentageColor = (pct) => {
    if (pct >= 85) return '#10b981'; // Green
    if (pct >= 60) return '#3b82f6'; // Blue
    if (pct >= 40) return '#f59e0b'; // Amber
    return '#ef4444'; // Red
  };

  if (loading) {
    return <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading weekly testing hub...</div>;
  }

  // QUIZ TAKING ZERO-DISTRACTION MODE UI
  if (activeTest && !lastSubmissionResult) {
    const currentQuestion = activeTest.questions[currentQuestionIndex];
    const isLastQuestion = currentQuestionIndex === activeTest.questions.length - 1;
    const unansweredCount = answers.filter(a => a === null).length;
    const isCriticalTime = timeLeft <= 60; // Less than 1 minute remaining

    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: '#070a13',
        zIndex: 9999,
        padding: '2rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem',
        overflowY: 'auto',
        color: '#ffffff'
      }}>
        {/* Quiz Header Bar */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          paddingBottom: '1rem',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span className="badge badge-student" style={{ backgroundColor: 'rgba(168, 85, 247, 0.15)', color: '#a855f7', border: '1px solid rgba(168, 85, 247, 0.3)' }}>
                {activeTest.subject.toUpperCase()} WEEKLY TEST
              </span>
              <span style={{ fontSize: '0.78rem', color: '#60a5fa' }}>• Course Associated: {activeTest.course?.title || 'Enrolled Course'}</span>
            </div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, margin: '0.3rem 0 0', color: '#fff' }}>{activeTest.title}</h2>
          </div>

          {/* TIMER COMPONENT */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            backgroundColor: isCriticalTime ? 'rgba(239,68,68,0.15)' : 'rgba(255,255,255,0.05)',
            border: isCriticalTime ? '1px solid #ef4444' : '1px solid rgba(255,255,255,0.1)',
            padding: '0.75rem 1.25rem',
            borderRadius: '12px',
            animation: isCriticalTime ? 'pulse 1s infinite alternate' : 'none'
          }}>
            <Clock size={20} style={{ color: isCriticalTime ? '#ef4444' : '#60a5fa' }} />
            <div>
              <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.5)', display: 'block', textTransform: 'uppercase', fontWeight: 800 }}>Time Remaining</span>
              <span style={{ fontSize: '1.4rem', fontFamily: 'monospace', fontWeight: 900, color: isCriticalTime ? '#ef4444' : '#fff' }}>
                {formatTime(timeLeft)}
              </span>
            </div>
          </div>
        </div>

        {/* Main Quiz Layout */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: '2rem', flex: 1, minHeight: 0 }}>
          {/* Question panel */}
          <div style={{
            backgroundColor: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(255,255,255,0.05)',
            borderRadius: '16px',
            padding: '2.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.5rem'
          }}>
            {/* Question Indicator & Marks */}
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.75rem' }}>
              <span style={{ fontWeight: 700, color: '#3b82f6', fontSize: '1.1rem' }}>
                Question {currentQuestionIndex + 1} of {activeTest.questions.length}
              </span>
              <span style={{ color: '#10b981', fontWeight: 800 }}>
                +{currentQuestion.marks || 1} Marks
              </span>
            </div>

            {/* Question Text */}
            <h3 style={{ fontSize: '1.4rem', fontWeight: 600, color: '#fff', lineHeight: 1.5, margin: '1rem 0' }}>
              {currentQuestion.questionText}
            </h3>

            {/* MCQ Options */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', marginTop: '1rem' }}>
              {currentQuestion.options.map((opt, oIdx) => {
                const isSelected = answers[currentQuestionIndex] === oIdx;
                const letter = String.fromCharCode(65 + oIdx); // A, B, C, D
                
                return (
                  <button
                    key={oIdx}
                    onClick={() => handleSelectOption(currentQuestionIndex, oIdx)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '1rem',
                      padding: '1.1rem 1.5rem',
                      borderRadius: '12px',
                      backgroundColor: isSelected ? 'rgba(59, 130, 246, 0.15)' : 'rgba(255,255,255,0.03)',
                      color: isSelected ? '#fff' : 'rgba(255,255,255,0.7)',
                      border: isSelected ? '2px solid #3b82f6' : '1px solid rgba(255,255,255,0.1)',
                      textAlign: 'left',
                      fontSize: '1.05rem',
                      fontWeight: isSelected ? 800 : 600,
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <span style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '30px',
                      height: '30px',
                      borderRadius: '50%',
                      backgroundColor: isSelected ? '#3b82f6' : 'rgba(255,255,255,0.08)',
                      color: '#fff',
                      fontWeight: 800,
                      fontSize: '0.9rem'
                    }}>
                      {letter}
                    </span>
                    <span>{opt}</span>
                  </button>
                );
              })}
            </div>

            {/* Next/Prev Navigation Actions */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 'auto', paddingTop: '2rem' }}>
              <button
                disabled={currentQuestionIndex === 0}
                onClick={() => setCurrentQuestionIndex(prev => prev - 1)}
                className="curious-btn-outline"
                style={{ padding: '0.65rem 1.5rem', opacity: currentQuestionIndex === 0 ? 0.3 : 1 }}
              >
                ← Previous
              </button>

              <div style={{ display: 'flex', gap: '0.75rem' }}>
                {isLastQuestion ? (
                  <button
                    onClick={() => {
                      if (unansweredCount > 0) {
                        if (!window.confirm(`You have ${unansweredCount} unanswered questions. Are you sure you want to submit?`)) return;
                      } else {
                        if (!window.confirm('Submit test answers and get results?')) return;
                      }
                      submitQuiz(false);
                    }}
                    className="curious-btn-primary"
                    style={{ padding: '0.65rem 1.8rem', backgroundColor: '#10b981', borderColor: '#10b981' }}
                  >
                    Submit Test ✓
                  </button>
                ) : (
                  <button
                    onClick={() => setCurrentQuestionIndex(prev => prev + 1)}
                    className="curious-btn-primary"
                    style={{ padding: '0.65rem 1.8rem', backgroundColor: '#3b82f6', borderColor: '#3b82f6' }}
                  >
                    Next Question →
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar Question Grid Map */}
          <div style={{
            backgroundColor: 'rgba(255,255,255,0.01)',
            border: '1px solid rgba(255,255,255,0.05)',
            borderRadius: '16px',
            padding: '1.25rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
            maxHeight: '100%',
            overflowY: 'auto'
          }}>
            <h4 style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.6)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.5rem', margin: 0 }}>
              Questions Grid
            </h4>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem', marginTop: '0.5rem' }}>
              {activeTest.questions.map((_, qIdx) => {
                const isCurrent = currentQuestionIndex === qIdx;
                const isAnswered = answers[qIdx] !== null;
                
                return (
                  <button
                    key={qIdx}
                    onClick={() => setCurrentQuestionIndex(qIdx)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '45px',
                      height: '45px',
                      borderRadius: '8px',
                      backgroundColor: isCurrent 
                        ? '#3b82f6' 
                        : isAnswered 
                          ? 'rgba(16, 185, 129, 0.15)' 
                          : 'rgba(255,255,255,0.03)',
                      color: isCurrent 
                        ? '#fff' 
                        : isAnswered 
                          ? '#10b981' 
                          : 'rgba(255,255,255,0.5)',
                      border: isCurrent 
                        ? '1px solid #3b82f6' 
                        : isAnswered 
                          ? '1px solid rgba(16, 185, 129, 0.4)' 
                          : '1px solid rgba(255,255,255,0.1)',
                      fontWeight: 700,
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    {qIdx + 1}
                  </button>
                );
              })}
            </div>

            <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '0.5rem', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '1rem', fontSize: '0.82rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'rgba(255,255,255,0.7)' }}>
                <span style={{ width: '12px', height: '12px', borderRadius: '3px', backgroundColor: '#3b82f6' }}></span>
                <span>Current Question</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'rgba(255,255,255,0.7)' }}>
                <span style={{ width: '12px', height: '12px', borderRadius: '3px', backgroundColor: 'rgba(16, 185, 129, 0.2)', border: '1px solid rgba(16, 185, 129, 0.5)' }}></span>
                <span>Answered</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'rgba(255,255,255,0.7)' }}>
                <span style={{ width: '12px', height: '12px', borderRadius: '3px', backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)' }}></span>
                <span>Unanswered ({unansweredCount})</span>
              </div>
            </div>

            <button
              onClick={() => {
                if (window.confirm('Are you sure you want to end and submit this test?')) submitQuiz(false);
              }}
              style={{
                width: '100%',
                padding: '0.65rem',
                borderRadius: '8px',
                backgroundColor: '#ef4444',
                color: '#fff',
                border: 'none',
                fontWeight: 700,
                cursor: 'pointer',
                marginTop: '0.8rem'
              }}
            >
              Force Submit Test
            </button>
          </div>
        </div>
        
        {/* Embedded Keyframes for critical timer pulse */}
        <style dangerouslySetInnerHTML={{__html: `
          @keyframes pulse {
            0% { opacity: 0.8; transform: scale(1); }
            100% { opacity: 1; transform: scale(1.02); }
          }
        `}} />
      </div>
    );
  }

  // TEST EVALUATION RESULT GRADING SUMMARY SCREEN
  if (lastSubmissionResult) {
    const pct = lastSubmissionResult.percentage;
    const isPassed = pct >= 40;
    
    return (
      <div className="glass-panel" style={{
        maxWidth: '650px',
        margin: '3rem auto',
        padding: '3rem 2rem',
        textAlign: 'center',
        border: '1px solid var(--border-color)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '1.5rem',
        animation: 'fadeIn 0.5s ease'
      }}>
        <div style={{
          width: '80px',
          height: '80px',
          borderRadius: '50%',
          backgroundColor: isPassed ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '3rem'
        }}>
          {isPassed ? '🏆' : '⚠️'}
        </div>

        <div>
          <h2 style={{ fontSize: '1.8rem', color: 'var(--text-main)', fontWeight: 800, margin: 0 }}>
            {isPassed ? 'Test Completed Successfully!' : 'Test Completed'}
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.3rem' }}>
            Your choices have been auto-graded by our evaluation engine.
          </p>
        </div>

        {/* Evaluation Metrics Card */}
        <div className="glass-card" style={{
          width: '100%',
          backgroundColor: 'rgba(255,255,255,0.02)',
          padding: '1.5rem',
          borderRadius: '16px',
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '1rem',
          border: '1px solid var(--border-color)'
        }}>
          <div>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase' }}>Obtained Score</span>
            <strong style={{ fontSize: '1.6rem', color: 'var(--text-main)' }}>{lastSubmissionResult.obtainedMarks}</strong>
          </div>
          <div>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase' }}>Total Marks</span>
            <strong style={{ fontSize: '1.6rem', color: 'var(--text-muted)' }}>{lastSubmissionResult.totalMarks}</strong>
          </div>
          <div>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase' }}>Percentage</span>
            <strong style={{ fontSize: '1.6rem', color: getPercentageColor(pct) }}>{pct}%</strong>
          </div>
        </div>

        {/* Grade Badge */}
        <div style={{
          display: 'inline-block',
          backgroundColor: isPassed ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)',
          color: isPassed ? '#10b981' : '#ef4444',
          border: `1px solid ${isPassed ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
          padding: '0.4rem 1.2rem',
          borderRadius: '20px',
          fontWeight: 800,
          fontSize: '0.85rem',
          textTransform: 'uppercase'
        }}>
          Result: {isPassed ? `PASS (GRADE A)` : `FAIL (REQUIRES RETAKE)`}
        </div>

        <div style={{ display: 'flex', gap: '1rem', width: '100%', marginTop: '1rem' }}>
          <button 
            className="curious-btn-primary" 
            style={{ flex: 1, padding: '0.75rem', justifyContent: 'center', backgroundColor: '#3b82f6', borderColor: '#3b82f6' }}
            onClick={() => {
              setViewingSubmission({
                ...lastSubmissionResult,
                test: activeTest
              });
              setLastSubmissionResult(null);
              setActiveTest(null);
            }}
          >
            <Printer size={16} /> View & Print Report Card
          </button>
          <button 
            className="curious-btn-outline" 
            style={{ flex: 1, padding: '0.75rem', justifyContent: 'center' }}
            onClick={() => {
              setLastSubmissionResult(null);
              setActiveTest(null);
            }}
          >
            Back to Tests Dashboard
          </button>
        </div>
      </div>
    );
  }

  // MAIN STUDENT TESTS DASHBOARD VIEW
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
      
      {/* 1. Available Tests Section */}
      <div>
        <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <FileText size={20} style={{ color: '#3b82f6' }} /> Available Weekly Tests
        </h3>
        
        {tests.length === 0 ? (
          <div className="glass-panel" style={{ padding: '3.5rem 2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            <FileText size={44} style={{ opacity: 0.3, marginBottom: '0.8rem' }} />
            <h4>No online tests assigned to you!</h4>
            <p style={{ fontSize: '0.85rem', maxWidth: '460px', margin: '0.4rem auto 0' }}>
              Only tests assigned to courses you have purchased/enrolled in will appear here. Teachers schedule weekly quizzes for their courses.
            </p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
            {tests.map(test => {
              const isFuture = new Date(test.scheduledAt) > new Date();
              const isAttempted = test.isAttempted;
              
              return (
                <div key={test._id} className="glass-card" style={{
                  padding: '1.25rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.85rem',
                  border: isAttempted 
                    ? '1px solid rgba(16, 185, 129, 0.25)' 
                    : isFuture 
                      ? '1px solid var(--border-color)' 
                      : '1px solid rgba(59, 130, 246, 0.35)',
                  opacity: isFuture ? 0.75 : 1
                }}>
                  {/* Subject Badge & Attempt Status */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span className="badge badge-student" style={{
                      backgroundColor: 'rgba(59, 130, 246, 0.12)',
                      color: '#60a5fa',
                      fontSize: '0.7rem'
                    }}>
                      {test.subject}
                    </span>

                    {isAttempted ? (
                      <span className="badge" style={{ backgroundColor: 'rgba(16, 185, 129, 0.15)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.3)', fontWeight: 800 }}>
                        ✓ Attempted
                      </span>
                    ) : isFuture ? (
                      <span className="badge" style={{ backgroundColor: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b', border: '1px solid rgba(245, 158, 11, 0.3)', fontWeight: 800 }}>
                        ⏳ Scheduled
                      </span>
                    ) : (
                      <span className="badge" style={{ backgroundColor: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6', border: '1px solid rgba(59, 130, 246, 0.3)', fontWeight: 800 }}>
                        ● Active
                      </span>
                    )}
                  </div>

                  {/* Title & Course details */}
                  <div>
                    <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)', margin: '0.2rem 0' }}>{test.title}</h4>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      Course: <strong>{test.course?.title || 'Enrolled Course'}</strong>
                    </span>
                  </div>

                  {/* Test details panel */}
                  <div style={{
                    backgroundColor: 'rgba(255,255,255,0.02)',
                    border: '1px solid var(--border-color)',
                    padding: '0.75rem',
                    borderRadius: '8px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.35rem',
                    fontSize: '0.8rem'
                  }}>
                    <div style={{ color: 'var(--text-main)', display: 'flex', justifyContent: 'space-between' }}>
                      <span>⏰ <strong>Duration:</strong></span>
                      <span>{test.duration} Minutes</span>
                    </div>
                    <div style={{ color: 'var(--text-main)', display: 'flex', justifyContent: 'space-between' }}>
                      <span>🎯 <strong>Total Marks:</strong></span>
                      <span>{test.totalMarks} Marks</span>
                    </div>
                    <div style={{ color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between' }}>
                      <span>📅 <strong>Scheduled:</strong></span>
                      <span style={{ textAlign: 'right' }}>{new Date(test.scheduledAt).toLocaleDateString()} at {new Date(test.scheduledAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div style={{ marginTop: 'auto', paddingTop: '0.5rem' }}>
                    {isAttempted ? (
                      <button
                        onClick={async () => {
                          try {
                            const detail = await api.getTestById(test._id);
                            setViewingSubmission({
                              ...test.submission,
                              test: detail.test || test
                            });
                          } catch (err) {
                            setViewingSubmission({
                              ...test.submission,
                              test: test
                            });
                          }
                        }}
                        className="curious-btn-outline"
                        style={{ width: '100%', padding: '0.5rem', justifyContent: 'center', borderColor: '#10b981', color: '#10b981' }}
                      >
                        <Printer size={14} /> Print Report Card
                      </button>
                    ) : isFuture ? (
                      <button
                        disabled
                        className="btn-secondary"
                        style={{ width: '100%', padding: '0.5rem', justifyContent: 'center', opacity: 0.5, cursor: 'not-allowed' }}
                      >
                        Locked Until Scheduled Time
                      </button>
                    ) : (
                      <button
                        onClick={() => handleStartTest(test)}
                        className="curious-btn-primary"
                        style={{ width: '100%', padding: '0.5rem', justifyContent: 'center', backgroundColor: '#3b82f6', borderColor: '#3b82f6' }}
                      >
                        <Play size={14} /> Start Weekly Test
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 2. Submissions History Section */}
      <div>
        <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Award size={20} style={{ color: '#10b981' }} /> My Test Result History ({submissions.length})
        </h3>

        {submissions.length === 0 ? (
          <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            No past test submissions recorded yet. Complete your first weekly test to see your grade history!
          </div>
        ) : (
          <div className="glass-panel" style={{ padding: 0, overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)', backgroundColor: 'rgba(255,255,255,0.02)', color: 'var(--text-muted)', fontSize: '0.78rem', textTransform: 'uppercase' }}>
                  <th style={{ padding: '0.85rem 1rem' }}>Test details</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Attempt Date</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Obtained Marks</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Percentage</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Status</th>
                  <th style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {submissions.map((sub, idx) => {
                  const testData = sub.test || {};
                  const dateStr = sub.submittedAt ? new Date(sub.submittedAt).toLocaleDateString() : 'Recent';
                  const pct = sub.percentage;
                  const isPassed = pct >= 40;
                  
                  return (
                    <tr key={sub._id || idx} style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <td style={{ padding: '0.85rem 1rem' }}>
                        <div style={{ fontWeight: 800, color: 'var(--text-main)' }}>{testData.title || 'Weekly Test'}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          Subject: {testData.subject} • Course: {testData.course?.title || 'General Course'}
                        </div>
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
                      <td style={{ padding: '0.85rem 1rem' }}>
                        <span className="badge" style={{
                          backgroundColor: isPassed ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                          color: isPassed ? '#10b981' : '#ef4444',
                          border: `1px solid ${isPassed ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
                          fontWeight: 800,
                          fontSize: '0.72rem'
                        }}>
                          {isPassed ? '✓ PASS' : 'FAIL'}
                        </span>
                      </td>
                      <td style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>
                        <button
                          onClick={() => setViewingSubmission(sub)}
                          className="curious-btn-primary"
                          style={{ padding: '0.4rem 0.8rem', fontSize: '0.78rem', backgroundColor: '#3b82f6', borderColor: '#3b82f6' }}
                        >
                          <Printer size={12} /> Report Card
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

      {/* 3. Report Card Print View Modal Modal overlay */}
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
            {/* Modal Controls (Do not display on print) */}
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

            {/* Printable Report Card Area */}
            <div id="printable-report-card" style={{
              padding: '2rem',
              backgroundColor: '#ffffff',
              color: '#1e293b',
              border: '8px double #4f46e5',
              borderRadius: '16px',
              fontFamily: '"Outfit", "Inter", sans-serif',
              position: 'relative',
              overflow: 'hidden'
            }}>
              {/* Background watermark badge */}
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%) rotate(-30deg)',
                opacity: 0.03,
                fontSize: '6rem',
                fontWeight: 900,
                color: '#4f46e5',
                whiteSpace: 'nowrap',
                pointerEvents: 'none',
                userSelect: 'none'
              }}>
                BK TEACHING CENTER
              </div>

              {/* Header */}
              <div style={{ textAlign: 'center', borderBottom: '2px solid #4f46e5', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
                <h1 style={{ fontSize: '1.6rem', fontWeight: 900, color: '#4f46e5', letterSpacing: '0.02em', margin: 0 }}>
                  BK TEACHING CENTER
                </h1>
                <p style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: '0.2rem', fontWeight: 700 }}>
                  Official Student Examination Report Card
                </p>
              </div>

              {/* Student and Test metadata details */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', fontSize: '0.85rem', marginBottom: '1.5rem', borderBottom: '1px dashed #e2e8f0', paddingBottom: '1rem' }}>
                <div>
                  <div style={{ color: '#64748b', fontSize: '0.75rem', textTransform: 'uppercase' }}>Candidate Name:</div>
                  <strong style={{ fontSize: '1rem', color: '#0f172a' }}>{user?.name}</strong>
                  <div style={{ color: '#64748b', fontSize: '0.75rem', marginTop: '0.35rem', textTransform: 'uppercase' }}>Candidate Email:</div>
                  <div style={{ color: '#334155' }}>{user?.email}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ color: '#64748b', fontSize: '0.75rem', textTransform: 'uppercase' }}>Exam Subject:</div>
                  <strong style={{ fontSize: '1rem', color: '#4f46e5' }}>{viewingSubmission.test?.subject || 'General'}</strong>
                  <div style={{ color: '#64748b', fontSize: '0.75rem', marginTop: '0.35rem', textTransform: 'uppercase' }}>Test Title:</div>
                  <div style={{ color: '#334155', fontWeight: 600 }}>{viewingSubmission.test?.title}</div>
                </div>
              </div>

              {/* Marks Table */}
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
                  <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <td style={{ padding: '0.75rem', color: '#475569' }}>Time Limit Allowance</td>
                    <td style={{ padding: '0.75rem', textAlign: 'right', color: '#475569' }}>{viewingSubmission.test?.duration || 10} Mins</td>
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

              {/* Status and Verification details */}
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
                    {viewingSubmission.percentage >= 40 ? '✓ PASSED & CERTIFIED' : '✖ DEFERRED / FAIL'}
                  </span>
                  <span style={{ display: 'block', fontSize: '0.65rem', color: '#94a3b8', marginTop: '0.5rem' }}>
                    Exam Date: {new Date(viewingSubmission.submittedAt || Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                </div>

                {/* Teacher Signature */}
                <div style={{ textAlign: 'center', width: '160px' }}>
                  <div style={{
                    fontFamily: '"Caveat", "Dancing Script", "Cursive"',
                    fontSize: '1.4rem',
                    color: '#0f172a',
                    transform: 'rotate(-5deg)',
                    marginBottom: '0.1rem'
                  }}>
                    {viewingSubmission.test?.teacherName || 'Sarah Jenkins'}
                  </div>
                  <div style={{ borderTop: '1px solid #cbd5e1', paddingTop: '0.2rem', fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>
                    Authorized Faculty
                  </div>
                </div>
              </div>
            </div>

            {/* Print Stylesheet Hook */}
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
