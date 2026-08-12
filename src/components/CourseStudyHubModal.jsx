import React, { useState } from 'react';
import { Modal } from './Modal';
import { Play, BookOpen, Clock, Download, Award, CheckCircle, Video, MessageSquare, User, FileText, Printer } from './Icons';
import { DirectorSignature } from './DirectorSignature';
import { getCourseValidityInfo } from '../utils/courseValidity';
import { MONDAY_TO_SATURDAY_SCHEDULE } from '../services/scheduleData';

export function CourseStudyHubModal({ course, isOpen, onClose, user }) {
  const [activeTab, setActiveTab] = useState('lessons'); // 'lessons' | 'notes' | 'live' | 'qa' | 'certificate'
  const [activeLessonIndex, setActiveLessonIndex] = useState(0);
  const [completedLessons, setCompletedLessons] = useState([0]); // lesson indices completed
  const [isPlaying, setIsPlaying] = useState(false);
  const [qaInput, setQaInput] = useState('');
  const [qaList, setQaList] = useState([
    { id: 1, author: 'Alex Rivera', role: 'Student', text: 'How do we handle async data fetching error states in component mounting?', time: '2 hours ago', replies: ['Dr. Sarah Jenkins: Great question! You can wrap fetch calls in try/catch blocks and trigger error state fallbacks.'] },
    { id: 2, author: 'Priya Sharma', role: 'Student', text: 'Where can I download the raw starter source code for Module 2?', time: 'Yesterday', replies: ['Faculty Support: Check the "PDF Notes & Files" tab above for the downloadable Zip archive.'] }
  ]);

  if (!course) return null;

  const teacher = course.teacher || {};
  const teacherName = teacher.name || course.teacherName || 'Dr. Sarah Jenkins (Lead Instructor)';
  const teacherAvatar = teacher.avatar || teacher.profile?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${teacherName}`;

  // Generate interactive syllabus lessons
  const syllabusModules = course.syllabus && course.syllabus.length > 0 ? course.syllabus : [
    {
      moduleTitle: 'Module 1: Getting Started & Foundations',
      lessons: [
        { id: 0, title: 'Course Orientation & Setup Environment', duration: '15 mins', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4' },
        { id: 1, title: 'Core Architecture & Project Structure', duration: '28 mins', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4' },
        { id: 2, title: 'Building Components & Managing State', duration: '35 mins', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4' },
      ]
    },
    {
      moduleTitle: 'Module 2: Advanced Topics & Real-World APIs',
      lessons: [
        { id: 3, title: 'REST & GraphQL Backend API Integration', duration: '42 mins', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4' },
        { id: 4, title: 'Authentication, JWT & Route Protection', duration: '40 mins', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4' },
        { id: 5, title: 'Database Connectivity & Performance Tuning', duration: '50 mins', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4' },
      ]
    },
    {
      moduleTitle: 'Module 3: Capstone Project & Deployment',
      lessons: [
        { id: 6, title: 'Full Stack Capstone App Architecture', duration: '45 mins', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4' },
        { id: 7, title: 'CI/CD Automated Deployment to Production', duration: '30 mins', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4' },
      ]
    }
  ];

  // Flatten all lessons for easy index lookup
  const allLessons = syllabusModules.flatMap(m => Array.isArray(m.lessons) ? m.lessons : []);
  const currentLesson = allLessons[activeLessonIndex] || allLessons[0];

  const totalLessons = allLessons.length;
  const progressPercent = Math.round((completedLessons.length / totalLessons) * 100);

  const toggleLessonComplete = (idx) => {
    if (completedLessons.includes(idx)) {
      setCompletedLessons(completedLessons.filter(i => i !== idx));
    } else {
      setCompletedLessons([...completedLessons, idx]);
    }
  };

  const handleAddQuestion = (e) => {
    e.preventDefault();
    if (!qaInput.trim()) return;
    setQaList([
      ...qaList,
      {
        id: Date.now(),
        author: user?.name || 'Student',
        role: 'Student',
        text: qaInput,
        time: 'Just now',
        replies: []
      }
    ]);
    setQaInput('');
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`🎓 Classroom Study Hub — ${course.title}`}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', maxHeight: '82vh', overflowY: 'auto', paddingRight: '0.25rem' }}>
        
        {/* Banner with Progress Status & 1-Year Course Validity */}
        {(() => {
          const valInfo = getCourseValidityInfo(course.enrolledAt);
          return (
            <div style={{
              padding: '1rem 1.25rem',
              borderRadius: 'var(--radius-sm)',
              background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.18) 0%, rgba(147, 51, 234, 0.18) 100%)',
              border: '1px solid rgba(59, 130, 246, 0.3)',
              display: 'flex',
              justify: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '1rem'
            }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem', flexWrap: 'wrap' }}>
                  <span className="badge badge-student" style={{ backgroundColor: '#10b981', color: '#fff', fontWeight: 800 }}>
                    ✓ ACTIVE 1-YEAR SUBSCRIPTION
                  </span>
                  <span className="badge badge-student" style={{ backgroundColor: 'rgba(59, 130, 246, 0.2)', color: '#60a5fa', border: '1px solid rgba(59, 130, 246, 0.4)', fontWeight: 700 }}>
                    ⏳ Valid until: {valInfo.validUntilMonthYear} (Expires: {valInfo.formattedExpiresAt})
                  </span>
                </div>
                <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)' }}>
                  {currentLesson ? currentLesson.title : course.title}
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                  Lead Instructor: <strong>{teacherName}</strong> | Access Unlocked: <strong>365 Days</strong> ({valInfo.daysRemaining} days remaining)
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ minWidth: '160px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.25rem' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Progress</span>
                    <span style={{ color: '#3b82f6' }}>{progressPercent}% Complete</span>
                  </div>
                  <div style={{ height: '8px', width: '100%', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ width: `${progressPercent}%`, height: '100%', backgroundColor: '#3b82f6', transition: 'width 0.3s' }}></div>
                  </div>
                </div>
              </div>
            </div>
          );
        })()}

        {/* Navigation Tabs inside Classroom */}
        <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', overflowX: 'auto' }}>
          {[
            { id: 'lessons', label: '📺 Video Lectures & Syllabus', icon: <Video size={16} /> },
            { id: 'notes', label: '📚 PDF Handouts & Notes', icon: <FileText size={16} /> },
            { id: 'live', label: '🔴 Live Class Schedule', icon: <Clock size={16} /> },
            { id: 'qa', label: '💬 Q&A & Support', icon: <MessageSquare size={16} /> },
            { id: 'certificate', label: '📜 Course Certificate', icon: <Award size={16} /> },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '0.5rem 0.85rem',
                borderRadius: '8px',
                border: activeTab === tab.id ? '1px solid #3b82f6' : '1px solid transparent',
                backgroundColor: activeTab === tab.id ? 'rgba(59, 130, 246, 0.15)' : 'transparent',
                color: activeTab === tab.id ? '#3b82f6' : 'var(--text-muted)',
                fontWeight: activeTab === tab.id ? 700 : 500,
                fontSize: '0.82rem',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                whiteSpace: 'nowrap'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab 1: Lessons & Video Player */}
        {activeTab === 'lessons' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '1.25rem' }}>
            
            {/* Main Player Container */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{
                position: 'relative',
                borderRadius: '12px',
                overflow: 'hidden',
                backgroundColor: '#000',
                aspectRatio: '16/9',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid var(--border-color)'
              }}>
                <video
                  key={currentLesson.videoUrl}
                  controls
                  autoPlay={isPlaying}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  poster={course.thumbnail || course.image || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=80'}
                  src={currentLesson.videoUrl}
                />
              </div>

              {/* Lesson Overview & Controls */}
              <div style={{ background: 'var(--bg-glass)', padding: '1rem', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: '#60a5fa', fontWeight: 700 }}>Lesson {activeLessonIndex + 1} of {totalLessons}</span>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)', margin: '0.2rem 0' }}>{currentLesson.title}</h3>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Duration: {currentLesson.duration} | Full HD 1080p</div>
                  </div>

                  <button
                    className={completedLessons.includes(activeLessonIndex) ? 'btn-success' : 'btn-secondary'}
                    onClick={() => toggleLessonComplete(activeLessonIndex)}
                    style={{ fontSize: '0.82rem', padding: '0.45rem 0.9rem' }}
                  >
                    <CheckCircle size={16} />
                    {completedLessons.includes(activeLessonIndex) ? 'Marked Completed ✓' : 'Mark as Completed'}
                  </button>
                </div>

                <div style={{ marginTop: '1rem', paddingTop: '0.8rem', borderTop: '1px solid var(--border-color)', fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                  <strong>Lesson Highlights:</strong> Master core architecture patterns, clean state handling, and error logging best practices in modern web development.
                </div>
              </div>
            </div>

            {/* Sidebar Syllabus Accordion */}
            <div style={{ background: 'var(--bg-glass)', padding: '1rem', borderRadius: '12px', border: '1px solid var(--border-color)', height: 'fit-content', maxHeight: '500px', overflowY: 'auto' }}>
              <h4 style={{ fontSize: '0.92rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <BookOpen size={16} style={{ color: '#3b82f6' }} /> Course Syllabus ({totalLessons} Lectures)
              </h4>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                {syllabusModules.map((mod, mIdx) => (
                  <div key={mIdx} style={{ backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: '8px', padding: '0.6rem', border: '1px solid var(--border-color)' }}>
                    <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#60a5fa', marginBottom: '0.4rem' }}>{mod.moduleTitle}</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                      {mod.lessons.map((les) => {
                        const isCurrent = les.id === activeLessonIndex;
                        const isDone = completedLessons.includes(les.id);
                        return (
                          <div
                            key={les.id}
                            onClick={() => { setActiveLessonIndex(les.id); setIsPlaying(true); }}
                            style={{
                              padding: '0.45rem 0.6rem',
                              borderRadius: '6px',
                              backgroundColor: isCurrent ? 'rgba(59, 130, 246, 0.2)' : 'transparent',
                              border: isCurrent ? '1px solid #3b82f6' : '1px solid transparent',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              gap: '0.5rem',
                              fontSize: '0.78rem'
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: isCurrent ? '#fff' : 'var(--text-muted)' }}>
                              {isDone ? <CheckCircle size={14} style={{ color: '#10b981', shrink: 0 }} /> : <Play size={12} style={{ color: isCurrent ? '#3b82f6' : 'var(--text-muted)', shrink: 0 }} />}
                              <span style={{ fontWeight: isCurrent ? 700 : 400, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '170px' }}>
                                {les.title}
                              </span>
                            </div>
                            <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>{les.duration}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* Tab 2: PDF Notes & Downloadable Resources */}
        {activeTab === 'notes' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <h4 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-main)' }}>Official Course Handouts & Code Snippets</h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
              {[
                { title: 'Module 1 - Architecture Blueprint PDF', size: '2.4 MB', date: 'Added Aug 2026' },
                { title: 'Complete Source Code Starter Pack', size: '15.8 MB', date: 'Added Aug 2026' },
                { title: 'Cheat Sheet - Key API Methods & Patterns', size: '1.1 MB', date: 'Added Aug 2026' },
                { title: 'Capstone Project Requirements & Guidelines', size: '3.2 MB', date: 'Added Aug 2026' },
              ].map((doc, idx) => (
                <div key={idx} className="glass-card" style={{ padding: '1rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '0.8rem' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                    <div style={{ width: '38px', height: '38px', borderRadius: '8px', backgroundColor: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center', shrink: 0 }}>
                      <FileText size={20} />
                    </div>
                    <div>
                      <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-main)' }}>{doc.title}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{doc.size} • {doc.date}</div>
                    </div>
                  </div>
                  <a
                    href="#"
                    onClick={(e) => { e.preventDefault(); alert(`Downloading ${doc.title}...`); }}
                    className="curious-btn-primary"
                    style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', backgroundColor: '#f59e0b', borderColor: '#f59e0b', justifyContent: 'center' }}
                  >
                    <Download size={14} /> Download PDF Material
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: Live Class Schedule */}
        {activeTab === 'live' && (
          <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <span className="badge badge-student" style={{ backgroundColor: '#ef4444', color: '#fff', fontWeight: 800 }}>LIVE INTERACTIVE LECTURE SCHEDULE (MON - SAT)</span>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginTop: '0.4rem', color: 'var(--text-main)' }}>
                Complete Weekly Live Class Timetable for {course.title}
              </h3>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                Students have daily interactive live classes from <strong>Monday to Saturday</strong> with lead faculty {teacherName}.
              </p>
            </div>

            {/* Live Today Box */}
            <div style={{ background: 'rgba(239, 68, 68, 0.08)', padding: '1.2rem', borderRadius: '12px', border: '1px solid rgba(239, 68, 68, 0.3)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <div style={{ fontSize: '0.8rem', color: '#f87171', fontWeight: 800 }}>🗓 NEXT SCHEDULED LIVE SESSION</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '0.2rem' }}>Today at 5:00 PM IST (Duration: 90 mins)</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>Topic: Live Q&A, Capstone Architecture & Code Walkthrough</div>
              </div>

              <a
                href={course.zoomUrl || 'https://zoom.us/j/mock_class_bktc'}
                target="_blank"
                rel="noreferrer"
                className="curious-btn-primary"
                style={{ backgroundColor: '#ef4444', borderColor: '#ef4444', padding: '0.65rem 1.3rem', fontSize: '0.88rem', fontWeight: 800 }}
              >
                <Video size={16} /> 🔴 Join Live Studio Room
              </a>
            </div>

            {/* Mon to Sat Timetable Breakdown */}
            <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '0.5rem' }}>
              📅 Complete Monday to Saturday Daily Live Schedule
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '0.85rem' }}>
              {MONDAY_TO_SATURDAY_SCHEDULE.map(dayItem => (
                <div key={dayItem.day} className="glass-card" style={{ padding: '0.85rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', border: '1px solid var(--border-color)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 800, color: '#3b82f6', fontSize: '0.9rem' }}>{dayItem.day}</span>
                    <span className="badge badge-student" style={{ fontSize: '0.68rem' }}>{dayItem.classes.length} Sessions</span>
                  </div>
                  {dayItem.classes.slice(0, 2).map(cls => (
                    <div key={cls.id} style={{ background: 'rgba(255,255,255,0.03)', padding: '0.45rem', borderRadius: '6px', fontSize: '0.75rem' }}>
                      <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>{cls.time}</div>
                      <div style={{ color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{cls.title}</div>
                      <div style={{ color: '#60a5fa', fontSize: '0.7rem' }}>👨‍🏫 {cls.teacherName}</div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 4: Q&A & Support */}
        {activeTab === 'qa' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <h4 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-main)' }}>Student Q&A & Teacher Discussion Board</h4>

            <form onSubmit={handleAddQuestion} style={{ display: 'flex', gap: '0.5rem' }}>
              <input
                type="text"
                value={qaInput}
                onChange={e => setQaInput(e.target.value)}
                placeholder="Ask a question about this course or request assistance..."
                style={{ flex: 1, padding: '0.6rem 0.9rem', fontSize: '0.85rem' }}
              />
              <button type="submit" className="btn-primary" style={{ padding: '0.6rem 1.2rem', fontSize: '0.85rem' }}>
                Post Question
              </button>
            </form>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {qaList.map(q => (
                <div key={q.id} className="glass-card" style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                    <span style={{ fontWeight: 700, color: '#60a5fa' }}>{q.author} ({q.role})</span>
                    <span style={{ color: 'var(--text-dim)' }}>{q.time}</span>
                  </div>
                  <div style={{ fontSize: '0.88rem', color: 'var(--text-main)', fontWeight: 500 }}>{q.text}</div>
                  {q.replies && q.replies.length > 0 && (
                    <div style={{ marginTop: '0.4rem', paddingLeft: '0.8rem', borderLeft: '2px solid #3b82f6', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                      {q.replies.map((r, rIdx) => (
                        <div key={rIdx} style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>{r}</div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 5: Official Accredited Certificate */}
        {activeTab === 'certificate' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div 
              id="printable-hub-certificate"
              style={{
                position: 'relative',
                background: '#ffffff',
                color: '#0f172a',
                padding: '2.5rem 2rem',
                borderRadius: '16px',
                border: '8px double #d97706',
                boxShadow: '0 20px 45px rgba(0,0,0,0.15)',
                textAlign: 'center',
                overflow: 'hidden'
              }}
            >
              {/* Corner Ornaments */}
              <div style={{ position: 'absolute', top: '12px', left: '12px', width: '28px', height: '28px', borderTop: '3px solid #d97706', borderLeft: '3px solid #d97706' }} />
              <div style={{ position: 'absolute', top: '12px', right: '12px', width: '28px', height: '28px', borderTop: '3px solid #d97706', borderRight: '3px solid #d97706' }} />
              <div style={{ position: 'absolute', bottom: '12px', left: '12px', width: '28px', height: '28px', borderBottom: '3px solid #d97706', borderLeft: '3px solid #d97706' }} />
              <div style={{ position: 'absolute', bottom: '12px', right: '12px', width: '28px', height: '28px', borderBottom: '3px solid #d97706', borderRight: '3px solid #d97706' }} />

              <div style={{ position: 'relative', zIndex: 1 }}>
                {/* Top Emblem & Institution Header */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.6rem', marginBottom: '0.3rem' }}>
                  <div style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '8px',
                    background: 'linear-gradient(135deg, #2563eb 0%, #ff6d0a 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                    fontWeight: 900,
                    fontSize: '1.1rem',
                    boxShadow: '0 4px 10px rgba(37,99,235,0.3)'
                  }}>
                    BK
                  </div>
                  <span style={{ fontSize: '1.4rem', fontWeight: 900, color: '#0f172a', letterSpacing: '-0.02em' }}>
                    BK <span style={{ color: '#2563eb' }}>TEACHING</span> CENTER
                  </span>
                </div>

                <div style={{ fontSize: '0.72rem', color: '#ff6d0a', fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '1.2rem' }}>
                  Accredited Online Learning Platform & Skill Academy
                </div>

                {/* Certificate Title */}
                <div style={{
                  display: 'inline-block',
                  padding: '0.35rem 1.2rem',
                  borderRadius: '50px',
                  backgroundColor: 'rgba(217, 119, 6, 0.12)',
                  color: '#b45309',
                  fontSize: '0.85rem',
                  fontWeight: 800,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  marginBottom: '1rem',
                  border: '1px solid rgba(217, 119, 6, 0.3)'
                }}>
                  Certificate of Completion
                </div>

                <p style={{ fontSize: '0.9rem', color: '#64748b', fontStyle: 'italic', marginBottom: '0.5rem' }}>
                  This is to proudly certify that
                </p>

                {/* Student Name */}
                <h2 style={{
                  fontSize: '2rem',
                  fontWeight: 900,
                  color: '#1e293b',
                  margin: '0.4rem 0 0.8rem',
                  letterSpacing: '-0.02em',
                  borderBottom: '2px dashed #93c5fd',
                  display: 'inline-block',
                  paddingBottom: '0.25rem',
                  paddingLeft: '1.5rem',
                  paddingRight: '1.5rem'
                }}>
                  {user?.name || 'Valued Student'}
                </h2>

                <p style={{ fontSize: '0.9rem', color: '#475569', maxWidth: '520px', margin: '0 auto 0.8rem', lineHeight: 1.5 }}>
                  has successfully fulfilled all course requirements, assignments, and comprehensive practical assessments for the accredited program:
                </p>

                {/* Course Title */}
                <h3 style={{
                  fontSize: '1.35rem',
                  fontWeight: 800,
                  color: '#2563eb',
                  margin: '0.6rem 0 1.5rem',
                  letterSpacing: '-0.01em'
                }}>
                  "{course.title}"
                </h3>

                {/* Signatures & Seal Section */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr auto 1fr',
                  alignItems: 'flex-end',
                  gap: '1rem',
                  marginTop: '1.8rem',
                  paddingTop: '1.2rem',
                  borderTop: '1px solid #e2e8f0'
                }}>
                  
                  {/* Left: Issue Date & Faculty */}
                  <div style={{ textAlign: 'left', fontSize: '0.8rem', color: '#475569' }}>
                    <div style={{ fontWeight: 700, color: '#0f172a', marginBottom: '0.2rem' }}>
                      📅 Issue Date:
                    </div>
                    <div style={{ color: '#2563eb', fontWeight: 600, marginBottom: '0.6rem' }}>
                      {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                      Faculty: <strong>{teacherName}</strong>
                    </div>
                    <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '0.2rem' }}>
                      ID: <code style={{ backgroundColor: '#f1f5f9', padding: '0.1rem 0.3rem', borderRadius: '4px', color: '#0f172a' }}>BKTC-{course._id || '8842'}-CERT</code>
                    </div>
                  </div>

                  {/* Center: Gold Foil Seal Badge */}
                  <div style={{ textAlign: 'center' }}>
                    <div style={{
                      width: '64px',
                      height: '64px',
                      borderRadius: '50%',
                      background: 'radial-gradient(circle, #fde68a 0%, #d97706 100%)',
                      boxShadow: '0 4px 15px rgba(217, 119, 6, 0.35)',
                      border: '2px solid #b45309',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#78350f',
                      fontSize: '0.55rem',
                      fontWeight: 900,
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      margin: '0 auto',
                      lineHeight: 1.1
                    }}>
                      <Award size={20} style={{ color: '#78350f', marginBottom: '1px' }} />
                      <span>VERIFIED</span>
                      <span style={{ fontSize: '0.5rem' }}>OFFICIAL</span>
                    </div>
                  </div>

                  {/* Right: Authorized Director Signature (Bittu kumar) */}
                  <div style={{ textAlign: 'right', display: 'flex', justifyContent: 'flex-end' }}>
                    <DirectorSignature width={190} height={58} showTitle={true} />
                  </div>
                </div>

              </div>
            </div>

            {/* Print / Save Button */}
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '0.5rem' }}>
              <button
                type="button"
                className="curious-btn-primary"
                style={{ padding: '0.75rem 2rem', backgroundColor: '#3b82f6', borderColor: '#3b82f6', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.95rem' }}
                onClick={() => window.print()}
              >
                <Printer size={18} /> Print / Save Official PDF Certificate
              </button>
            </div>
          </div>
        )}

      </div>
    </Modal>
  );
}
