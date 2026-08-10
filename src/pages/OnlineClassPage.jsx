import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { ClassCard } from '../components/ClassCard';
import { Play, Video, Users, Calendar, Clock, BookOpen, MessageSquare, CheckCircle, Award, Sparkles, Monitor, ShieldCheck, Download, AlertCircle, Filter, Search } from '../components/Icons';

export function OnlineClassPage({ onOpenAuth, user }) {
  const [dbClasses, setDbClasses] = useState([]);
  const [dbNotes, setDbNotes] = useState([]);
  const [dbVideos, setDbVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'live' | 'upcoming' | 'completed'
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('live'); // 'live' | 'schedule' | 'recorded' | 'classroom'
  const [activeClassroomTab, setActiveClassroomTab] = useState('chat'); // 'chat' | 'notes' | 'qa'

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [classesRes, notesRes, videosRes] = await Promise.all([
          api.getClasses(),
          api.getNotes(),
          api.getVideos()
        ]);
        if (classesRes.classes) setDbClasses(classesRes.classes);
        if (notesRes.notes) setDbNotes(notesRes.notes);
        if (videosRes.videos) setDbVideos(videosRes.videos);
      } catch (err) {
        console.error('Error fetching online classes data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);
  const [chatMessages, setChatMessages] = useState([
    { sender: 'Prof. Rajesh Sharma', text: 'Welcome to today\'s Live Physics session on Electromagnetic Waves!', time: '10:00 AM', isTeacher: true },
    { sender: 'Ananya Verma', text: 'Good morning Sir! Ready with notebook.', time: '10:01 AM', isTeacher: false },
    { sender: 'Rohan Mehta', text: 'Sir will you explain Lenz Law today?', time: '10:02 AM', isTeacher: false },
    { sender: 'Prof. Rajesh Sharma', text: 'Yes Rohan! We will cover Faraday\'s & Lenz\'s laws in depth with 3D animations.', time: '10:03 AM', isTeacher: true }
  ]);
  const [inputMsg, setInputMsg] = useState('');
  const [handRaised, setHandRaised] = useState(false);

  // Live doubt resolution states & logic
  const [classDoubts, setClassDoubts] = useState([]);
  const [doubtText, setDoubtText] = useState('');
  const [doubtAnswersMap, setDoubtAnswersMap] = useState({});

  useEffect(() => {
    let interval = null;
    if (activeTab === 'classroom') {
      const fetchDoubts = async () => {
        try {
          const res = await api.getClassDoubts('cls_live_01');
          if (res.success) {
            setClassDoubts(res.doubts || []);
          }
        } catch (err) {
          console.error('Error fetching class doubts:', err);
        }
      };

      fetchDoubts();
      interval = setInterval(fetchDoubts, 3000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [activeTab]);

  const handleAskDoubt = async (e) => {
    e.preventDefault();
    if (!doubtText.trim()) return;

    try {
      const res = await api.askDoubt({
        classId: 'cls_live_01',
        teacherId: 'usr_teacher_1', // Dr. Sarah Jenkins
        question: doubtText.trim()
      });
      if (res.success) {
        setClassDoubts(prev => [res.doubt, ...prev]);
        setDoubtText('');
      }
    } catch (err) {
      console.error('Error asking doubt:', err);
    }
  };

  const handleAnswerDoubt = async (doubtId) => {
    const ans = doubtAnswersMap[doubtId];
    if (!ans || !ans.trim()) return;

    try {
      const res = await api.replyToDoubt(doubtId, ans.trim());
      if (res.success) {
        setClassDoubts(prev => prev.map(d => d._id === doubtId ? { ...d, answer: ans.trim(), isResolved: true } : d));
        setDoubtAnswersMap(prev => ({ ...prev, [doubtId]: '' }));
      }
    } catch (err) {
      console.error('Error answering doubt:', err);
    }
  };

  const liveClasses = [
    {
      id: 'live-1',
      title: 'Advanced Mathematics: Calculus & Limits Mastery',
      grade: 'Grade 12',
      teacher: 'Dr. Anand Kumar',
      subject: 'Mathematics',
      time: 'LIVE NOW (Started 10 mins ago)',
      viewers: 248,
      status: 'ONGOING',
      badge: 'Live Stream'
    },
    {
      id: 'live-2',
      title: 'Physics Live: Electromagnetic Induction & Waves',
      grade: 'Grade 10',
      teacher: 'Prof. Rajesh Sharma',
      subject: 'Physics',
      time: 'Today at 11:30 AM',
      viewers: 190,
      status: 'UPCOMING',
      badge: 'Interactive'
    },
    {
      id: 'live-3',
      title: 'Chemistry: Organic Reaction Mechanisms & Synthesis',
      grade: 'Grade 11',
      teacher: 'Dr. Sunita Rao',
      subject: 'Chemistry',
      time: 'Today at 02:00 PM',
      viewers: 310,
      status: 'UPCOMING',
      badge: 'NEET Special'
    },
    {
      id: 'live-4',
      title: 'Computer Science: Data Structures & Python Algorithms',
      grade: 'Grade 9 - 12',
      teacher: 'Er. Vikramaditya',
      subject: 'Coding & AI',
      time: 'Today at 04:30 PM',
      viewers: 420,
      status: 'UPCOMING',
      badge: 'STEM Core'
    }
  ];

  const recordedLectures = [
    {
      id: 'rec-1',
      title: 'Complete Quadratic Equations & Graphs',
      teacher: 'Dr. Anand Kumar',
      duration: '1h 25m',
      views: '2.4k views',
      date: 'Yesterday'
    },
    {
      id: 'rec-2',
      title: 'Newton\'s Laws of Motion - Deep Dive & Problems',
      teacher: 'Prof. Rajesh Sharma',
      duration: '1h 40m',
      views: '3.8k views',
      date: '2 days ago'
    },
    {
      id: 'rec-3',
      title: 'Chemical Bonding & Molecular Structure',
      teacher: 'Dr. Sunita Rao',
      duration: '1h 15m',
      views: '1.9k views',
      date: '3 days ago'
    }
  ];

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputMsg.trim()) return;
    setChatMessages([
      ...chatMessages,
      { sender: user ? user.name : 'Student', text: inputMsg, time: 'Just now', isTeacher: false }
    ]);
    setInputMsg('');
  };

  return (
    <div style={{ paddingTop: '5.5rem', minHeight: '100vh', backgroundColor: 'var(--bg-dark)' }}>
      {/* Top Banner Header */}
      <section style={{
        background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.98) 0%, rgba(30, 58, 138, 0.4) 100%)',
        borderBottom: '1px solid var(--border-color)',
        padding: '3rem 1.5rem',
        position: 'relative'
      }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', flexWrap: 'wrap' }}>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.35rem 0.9rem',
              borderRadius: '50px',
              backgroundColor: 'rgba(239, 68, 68, 0.15)',
              color: '#ef4444',
              fontSize: '0.82rem',
              fontWeight: 800,
              border: '1px solid rgba(239, 68, 68, 0.3)'
            }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#ef4444', display: 'inline-block', animation: 'pulse 1.5s infinite' }} />
              LIVE VIRTUAL CLASSROOM
            </span>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              BK Teaching Center Digital Learning Campus
            </span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1.5rem' }}>
            <div>
              <h1 style={{ fontSize: 'clamp(2rem, 3.5vw, 2.8rem)', fontWeight: 800, color: 'var(--text-main)', margin: '0.3rem 0' }}>
                Interactive <span style={{ color: '#3b82f6' }}>Online Classes</span> & Live Sessions
              </h1>
              <p style={{ fontSize: '1.05rem', color: 'var(--text-muted)', maxWidth: '650px', lineHeight: 1.6 }}>
                Experience high-definition live lectures, two-way doubt clearance, interactive digital whiteboards, and instant quizzes from expert faculty.
              </p>
            </div>

            {/* Quick Action Navigation Tabs */}
            <div style={{
              display: 'flex',
              gap: '0.5rem',
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              padding: '0.3rem',
              borderRadius: '12px',
              border: '1px solid var(--border-color)'
            }}>
              <button
                onClick={() => setActiveTab('live')}
                style={{
                  padding: '0.6rem 1.2rem',
                  borderRadius: '9px',
                  border: 'none',
                  backgroundColor: activeTab === 'live' ? '#3b82f6' : 'transparent',
                  color: activeTab === 'live' ? '#fff' : 'var(--text-muted)',
                  fontWeight: 700,
                  fontSize: '0.88rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem'
                }}
              >
                <Video size={16} /> Live Classes
              </button>

              <button
                onClick={() => setActiveTab('classroom')}
                style={{
                  padding: '0.6rem 1.2rem',
                  borderRadius: '9px',
                  border: 'none',
                  backgroundColor: activeTab === 'classroom' ? '#3b82f6' : 'transparent',
                  color: activeTab === 'classroom' ? '#fff' : 'var(--text-muted)',
                  fontWeight: 700,
                  fontSize: '0.88rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem'
                }}
              >
                <Monitor size={16} /> Virtual Lab
              </button>

              <button
                onClick={() => setActiveTab('recorded')}
                style={{
                  padding: '0.6rem 1.2rem',
                  borderRadius: '9px',
                  border: 'none',
                  backgroundColor: activeTab === 'recorded' ? '#3b82f6' : 'transparent',
                  color: activeTab === 'recorded' ? '#fff' : 'var(--text-muted)',
                  fontWeight: 700,
                  fontSize: '0.88rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem'
                }}
              >
                <Play size={16} /> Recordings
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Main Container */}
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '2.5rem 1.5rem' }}>

        {/* Tab 1: Live Classes Overview */}
        {activeTab === 'live' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
            
            {/* Schedule & Status Filter Bar */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', background: 'rgba(255, 255, 255, 0.03)', padding: '1rem 1.25rem', borderRadius: '14px', border: '1px solid var(--border-color)' }}>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {[
                  { id: 'all', label: 'All Classes' },
                  { id: 'live', label: '🔴 Live Now' },
                  { id: 'upcoming', label: '📅 Upcoming' },
                  { id: 'completed', label: '✅ Completed' }
                ].map((st) => (
                  <button
                    key={st.id}
                    onClick={() => setStatusFilter(st.id)}
                    style={{
                      padding: '0.45rem 1rem',
                      borderRadius: '20px',
                      fontSize: '0.85rem',
                      fontWeight: statusFilter === st.id ? 800 : 600,
                      backgroundColor: statusFilter === st.id ? '#3b82f6' : 'transparent',
                      color: statusFilter === st.id ? '#fff' : 'var(--text-muted)',
                      border: statusFilter === st.id ? '1px solid #3b82f6' : '1px solid transparent',
                      cursor: 'pointer'
                    }}
                  >
                    {st.label}
                  </button>
                ))}
              </div>

              {/* Search input */}
              <div style={{ position: 'relative', minWidth: '240px' }}>
                <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  placeholder="Search class or topic..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.45rem 0.8rem 0.45rem 2.4rem',
                    borderRadius: '8px',
                    backgroundColor: 'rgba(255, 255, 255, 0.06)',
                    border: '1px solid var(--border-color)',
                    color: 'var(--text-main)',
                    fontSize: '0.85rem'
                  }}
                />
              </div>
            </div>

            {/* Live & Scheduled Classes Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '1.5rem'
            }}>
              {dbClasses
                .filter((c) => {
                  if (statusFilter !== 'all' && (c.status || 'upcoming').toLowerCase() !== statusFilter) return false;
                  if (searchQuery && !c.title.toLowerCase().includes(searchQuery.toLowerCase()) && !(c.courseTitle || '').toLowerCase().includes(searchQuery.toLowerCase())) return false;
                  return true;
                })
                .map((clsItem) => (
                  <ClassCard
                    key={clsItem._id}
                    onlineClass={clsItem}
                    isStudent={!user || user.role === 'student'}
                    isTeacher={user && (user.role === 'teacher' || user.role === 'admin')}
                    onJoin={(cls) => {
                      if (!user) {
                        onOpenAuth('login');
                        return;
                      }
                      if (cls.status === 'live' || cls.status === 'ONGOING') {
                        setActiveTab('classroom');
                      } else {
                        window.open(cls.meetingLink || cls.joinUrl || '#', '_blank');
                      }
                    }}
                  />
                ))}
            </div>

            {/* Virtual Campus Highlights */}
            <div style={{
              backgroundColor: 'rgba(59, 130, 246, 0.05)',
              border: '1px solid rgba(59, 130, 246, 0.2)',
              borderRadius: '20px',
              padding: '2rem',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: '1.5rem'
            }}>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                <div style={{ width: '2.5rem', height: '2.5rem', borderRadius: '10px', backgroundColor: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Sparkles size={20} />
                </div>
                <div>
                  <h4 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>HD 1080p Live Stream</h4>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.3rem', lineHeight: 1.5 }}>
                    Zero-lag interactive streaming optimized for smooth playback even on mobile data networks.
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                <div style={{ width: '2.5rem', height: '2.5rem', borderRadius: '10px', backgroundColor: 'rgba(16, 185, 129, 0.15)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <MessageSquare size={20} />
                </div>
                <div>
                  <h4 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>Live 2-Way Doubt Desk</h4>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.3rem', lineHeight: 1.5 }}>
                    Ask doubts live via chat or voice raise-hand during lecture sessions with real-time solutions.
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                <div style={{ width: '2.5rem', height: '2.5rem', borderRadius: '10px', backgroundColor: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <ShieldCheck size={20} />
                </div>
                <div>
                  <h4 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>PDF Class Notes</h4>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.3rem', lineHeight: 1.5 }}>
                    Download handwritten teacher whiteboard notes immediately after every live class finishes.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Virtual Classroom Demo Player */}
        {activeTab === 'classroom' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <span style={{ fontSize: '0.8rem', padding: '0.2rem 0.6rem', borderRadius: '4px', backgroundColor: '#ef4444', color: '#fff', fontWeight: 800 }}>LIVE SESSION</span>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '0.3rem', margin: 0 }}>
                  Physics: Electromagnetic Waves & Spectrum Analysis
                </h2>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                <button
                  onClick={() => setHandRaised(!handRaised)}
                  style={{
                    padding: '0.55rem 1rem',
                    borderRadius: '8px',
                    border: '1px solid var(--border-color)',
                    backgroundColor: handRaised ? 'rgba(245, 158, 11, 0.2)' : 'rgba(255, 255, 255, 0.06)',
                    color: handRaised ? '#f59e0b' : 'var(--text-main)',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem'
                  }}
                >
                  ✋ {handRaised ? 'Hand Raised (In Queue)' : 'Raise Hand for Doubt'}
                </button>
              </div>
            </div>

            {/* Virtual Screen + Interactive Right Sidebar */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '1.5rem',
              alignItems: 'stretch'
            }}>
              {/* Left Side: Interactive Video Player Mockup */}
              <div style={{
                backgroundColor: '#0a0e17',
                border: '1px solid var(--border-color)',
                borderRadius: '18px',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column'
              }}>
                <div style={{
                  height: '380px',
                  backgroundColor: '#050811',
                  position: 'relative',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                  background: 'radial-gradient(circle at center, #1e293b 0%, #050811 100%)'
                }}>
                  {/* Virtual Teacher Blackboard Graphic */}
                  <div style={{
                    width: '90%',
                    height: '80%',
                    border: '2px dashed rgba(59, 130, 246, 0.4)',
                    borderRadius: '12px',
                    padding: '1.5rem',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    backgroundColor: 'rgba(15, 23, 42, 0.8)'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#60a5fa', fontSize: '0.85rem', fontWeight: 700 }}>
                      <span>BK TEACHING CENTER VIRTUAL BOARD</span>
                      <span>1080p 60fps</span>
                    </div>

                    <div style={{ textAlign: 'center', color: '#fff' }}>
                      <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>⚡ 𝛁 × 𝐄 = -∂𝐁/∂t</div>
                      <p style={{ color: '#94a3b8', fontSize: '0.95rem' }}>
                        Maxwell's Equation III: Faraday's Law of Electromagnetic Induction
                      </p>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem', color: '#64748b' }}>
                      <span>Instructor: Prof. Rajesh Sharma</span>
                      <span style={{ color: '#10b981', fontWeight: 700 }}>248 Students Connected</span>
                    </div>
                  </div>
                </div>

                {/* Player Bottom Control Bar */}
                <div style={{
                  padding: '0.8rem 1.2rem',
                  backgroundColor: 'rgba(15, 23, 42, 0.95)',
                  borderTop: '1px solid var(--border-color)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontSize: '0.85rem',
                  color: 'var(--text-muted)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <span style={{ color: '#ef4444', fontWeight: 800 }}>● LIVE</span>
                    <span>Elapsed: 34:12</span>
                  </div>
                  <div style={{ display: 'flex', gap: '0.8rem' }}>
                    <button style={{ background: 'none', border: 'none', color: '#60a5fa', fontWeight: 700, cursor: 'pointer' }}>
                      📥 Download Class PDF
                    </button>
                  </div>
                </div>
              </div>

              {/* Right Side: Live Chat & Doubts Panel */}
              <div style={{
                backgroundColor: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                borderRadius: '18px',
                display: 'flex',
                flexDirection: 'column',
                height: '440px'
              }}>
                <div style={{
                  padding: '1rem',
                  borderBottom: '1px solid var(--border-color)',
                  display: 'flex',
                  gap: '0.5rem'
                }}>
                  <button
                    onClick={() => setActiveClassroomTab('chat')}
                    style={{
                      flex: 1,
                      padding: '0.4rem',
                      borderRadius: '8px',
                      border: 'none',
                      backgroundColor: activeClassroomTab === 'chat' ? 'rgba(59, 130, 246, 0.15)' : 'transparent',
                      color: activeClassroomTab === 'chat' ? '#3b82f6' : 'var(--text-muted)',
                      fontWeight: 700,
                      fontSize: '0.82rem',
                      cursor: 'pointer'
                    }}
                  >
                    Live Chat ({chatMessages.length})
                  </button>
                  <button
                    onClick={() => setActiveClassroomTab('qa')}
                    style={{
                      flex: 1,
                      padding: '0.4rem',
                      borderRadius: '8px',
                      border: 'none',
                      backgroundColor: activeClassroomTab === 'qa' ? 'rgba(59, 130, 246, 0.15)' : 'transparent',
                      color: activeClassroomTab === 'qa' ? '#3b82f6' : 'var(--text-muted)',
                      fontWeight: 700,
                      fontSize: '0.82rem',
                      cursor: 'pointer'
                    }}
                  >
                    Doubt Desk ({classDoubts.length})
                  </button>
                  <button
                    onClick={() => setActiveClassroomTab('notes')}
                    style={{
                      flex: 1,
                      padding: '0.4rem',
                      borderRadius: '8px',
                      border: 'none',
                      backgroundColor: activeClassroomTab === 'notes' ? 'rgba(59, 130, 246, 0.15)' : 'transparent',
                      color: activeClassroomTab === 'notes' ? '#3b82f6' : 'var(--text-muted)',
                      fontWeight: 700,
                      fontSize: '0.82rem',
                      cursor: 'pointer'
                    }}
                  >
                    Teacher Notes
                  </button>
                </div>

                {activeClassroomTab === 'chat' ? (
                  <>
                    <div style={{
                      flex: 1,
                      padding: '1rem',
                      overflowY: 'auto',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.8rem'
                    }}>
                      {chatMessages.map((msg, i) => (
                        <div
                          key={i}
                          style={{
                            padding: '0.6rem 0.8rem',
                            borderRadius: '10px',
                            backgroundColor: msg.isTeacher ? 'rgba(59, 130, 246, 0.1)' : 'var(--bg-dark)',
                            border: msg.isTeacher ? '1px solid rgba(59, 130, 246, 0.3)' : '1px solid var(--border-color)'
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '0.2rem' }}>
                            <strong style={{ color: msg.isTeacher ? '#3b82f6' : 'var(--text-main)' }}>
                              {msg.sender} {msg.isTeacher && '(Faculty)'}
                            </strong>
                            <span style={{ color: 'var(--text-muted)' }}>{msg.time}</span>
                          </div>
                          <p style={{ fontSize: '0.85rem', color: 'var(--text-main)', margin: 0, lineHeight: 1.4 }}>
                            {msg.text}
                          </p>
                        </div>
                      ))}
                    </div>

                    <form onSubmit={handleSendMessage} style={{ padding: '0.8rem', borderTop: '1px solid var(--border-color)', display: 'flex', gap: '0.5rem' }}>
                      <input
                        type="text"
                        placeholder="Type your question or doubt..."
                        value={inputMsg}
                        onChange={(e) => setInputMsg(e.target.value)}
                        style={{
                          flex: 1,
                          padding: '0.6rem 0.8rem',
                          borderRadius: '8px',
                          backgroundColor: 'var(--bg-dark)',
                          border: '1px solid var(--border-color)',
                          color: 'var(--text-main)',
                          fontSize: '0.85rem'
                        }}
                      />
                      <button
                        type="submit"
                        className="curious-btn-primary"
                        style={{ padding: '0.6rem 1rem', borderRadius: '8px', fontSize: '0.85rem' }}
                      >
                        Send
                      </button>
                    </form>
                  </>
                ) : activeClassroomTab === 'qa' ? (
                  <div style={{ flex: 1, padding: '1rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                    <h4 style={{ fontSize: '0.92rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
                      Live Classroom Doubts Desk
                    </h4>

                    {/* Ask Doubt Form (Students only) */}
                    {(!user || user.role === 'student') && (
                      <form onSubmit={handleAskDoubt} style={{ display: 'flex', gap: '0.4rem' }}>
                        <input
                          type="text"
                          placeholder="Ask a doubt during this live session..."
                          value={doubtText}
                          onChange={(e) => setDoubtText(e.target.value)}
                          style={{
                            flex: 1,
                            padding: '0.45rem 0.6rem',
                            borderRadius: '6px',
                            backgroundColor: 'var(--bg-dark)',
                            border: '1px solid var(--border-color)',
                            color: 'var(--text-main)',
                            fontSize: '0.82rem'
                          }}
                        />
                        <button type="submit" className="curious-btn-primary" style={{ padding: '0.45rem 0.8rem', fontSize: '0.82rem' }}>
                          Ask
                        </button>
                      </form>
                    )}

                    {/* Doubts List */}
                    {classDoubts.length === 0 ? (
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center', padding: '2rem 1rem' }}>
                        No doubts asked yet during this session.
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                        {classDoubts.map((doubt) => {
                          const isResolved = doubt.isResolved;
                          return (
                            <div key={doubt._id} style={{
                              padding: '0.6rem',
                              borderRadius: '8px',
                              backgroundColor: 'rgba(255,255,255,0.02)',
                              border: `1px solid ${isResolved ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)'}`,
                              fontSize: '0.82rem'
                            }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
                                <strong style={{ color: '#60a5fa' }}>{doubt.student?.name || 'Student'}</strong>
                                <span style={{
                                  fontSize: '0.7rem',
                                  color: isResolved ? '#10b981' : '#f59e0b',
                                  fontWeight: 700
                                }}>
                                  {isResolved ? 'Resolved ✓' : 'Pending'}
                                </span>
                              </div>
                              <div style={{ color: 'var(--text-main)', marginBottom: '0.4rem' }}>
                                Question: "{doubt.question}"
                              </div>

                              {isResolved ? (
                                <div style={{
                                  padding: '0.4rem 0.6rem',
                                  borderRadius: '6px',
                                  backgroundColor: 'rgba(16, 185, 129, 0.05)',
                                  color: 'var(--text-muted)',
                                  fontSize: '0.78rem',
                                  borderLeft: '2px solid #10b981'
                                }}>
                                  <strong>Faculty Answer:</strong> {doubt.answer}
                                </div>
                              ) : user?.role === 'teacher' || user?.role === 'admin' ? (
                                <div style={{ display: 'flex', gap: '0.3rem', marginTop: '0.4rem' }}>
                                  <input
                                    type="text"
                                    placeholder="Answer this doubt..."
                                    value={doubtAnswersMap[doubt._id] || ''}
                                    onChange={(e) => setDoubtAnswersMap(prev => ({ ...prev, [doubt._id]: e.target.value }))}
                                    style={{
                                      flex: 1,
                                      padding: '0.35rem 0.5rem',
                                      borderRadius: '4px',
                                      backgroundColor: 'var(--bg-dark)',
                                      border: '1px solid var(--border-color)',
                                      color: 'var(--text-main)',
                                      fontSize: '0.78rem'
                                    }}
                                  />
                                  <button
                                    onClick={() => handleAnswerDoubt(doubt._id)}
                                    className="curious-btn-primary"
                                    style={{ padding: '0.35rem 0.6rem', fontSize: '0.78rem' }}
                                  >
                                    Answer
                                  </button>
                                </div>
                              ) : (
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontStyle: 'italic' }}>
                                  Waiting for teacher's reply...
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                ) : (
                  <div style={{ padding: '1.2rem', overflowY: 'auto' }}>
                    <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.8rem' }}>
                      Teacher Handouts & Class Notes ({dbNotes.length})
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                      {dbNotes.map((note) => (
                        <div key={note._id} style={{ padding: '0.8rem', borderRadius: '8px', backgroundColor: 'var(--bg-dark)', border: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div>
                            <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-main)' }}>{note.title}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>By {note.teacherName || 'Faculty'} • {note.subject || 'General'}</div>
                          </div>
                          <a href={note.fileUrl} target="_blank" rel="noreferrer" style={{ padding: '0.35rem 0.7rem', borderRadius: '6px', backgroundColor: '#3b82f6', color: '#fff', border: 'none', fontSize: '0.78rem', textDecoration: 'none' }}>
                            Download
                          </a>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Recorded Lectures Archive */}
        {activeTab === 'recorded' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
              Recorded Class Archives & Replays ({dbVideos.length})
            </h2>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '1.5rem'
            }}>
              {dbVideos.map((item) => (
                <div
                  key={item._id}
                  style={{
                    backgroundColor: 'var(--bg-card)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '16px',
                    padding: '1.5rem',
                    boxShadow: 'var(--card-shadow)'
                  }}
                >
                  <div style={{
                    height: '140px',
                    borderRadius: '10px',
                    backgroundColor: '#1e293b',
                    marginBottom: '1rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#3b82f6',
                    position: 'relative',
                    overflow: 'hidden'
                  }}>
                    <img src={item.thumbnail || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&auto=format&fit=crop&q=80'} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.7 }} />
                    <a href={item.videoUrl} target="_blank" rel="noreferrer" style={{ position: 'absolute', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '50px', height: '50px', borderRadius: '50%', backgroundColor: 'rgba(59, 130, 246, 0.9)' }}>
                      <Play size={24} />
                    </a>
                    <span style={{ position: 'absolute', bottom: '8px', right: '8px', backgroundColor: 'rgba(0, 0, 0, 0.75)', color: '#fff', fontSize: '0.75rem', padding: '0.15rem 0.4rem', borderRadius: '4px' }}>
                      {item.duration || '1h 00m'}
                    </span>
                  </div>

                  <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.5rem' }}>
                    {item.title}
                  </h3>
                  <p style={{ fontSize: '0.83rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
                    {item.description}
                  </p>

                  <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between', marginTop: '0.8rem', paddingTop: '0.6rem', borderTop: '1px solid var(--border-color)' }}>
                    <span>By {item.teacherName || 'Faculty Instructor'}</span>
                    <a href={item.videoUrl} target="_blank" rel="noreferrer" style={{ color: '#3b82f6', fontWeight: 700, textDecoration: 'none' }}>
                      Watch Lecture →
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
