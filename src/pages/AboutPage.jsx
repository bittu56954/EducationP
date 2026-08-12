import React, { useState, useRef, useEffect } from 'react';
import { GraduationCap, Award, BookOpen, Users, Shield, Video, CheckCircle, Sparkles, ChevronDown, Calendar, Clock, Star, TrendingUp } from '../components/Icons';
import bittuPic from './bittu.jpeg';

// Custom icons for the social tray
const GithubIcon = ({ size = 18, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
  </svg>
);

const LinkedinIcon = ({ size = 18, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
    <rect x="2" y="9" width="4" height="12"></rect>
    <circle cx="4" cy="4" r="2"></circle>
  </svg>
);

const MailIcon = ({ size = 18, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
    <polyline points="22,6 12,13 2,6"></polyline>
  </svg>
);

export function AboutPage({ onOpenAuth, setCurrentView }) {
  const [openFaq, setOpenFaq] = useState(null);
  const [selectedTimelineYear, setSelectedTimelineYear] = useState('all');
  const [activeFounderTab, setActiveFounderTab] = useState('profile');
  const [expandedPillar, setExpandedPillar] = useState(null);
  const [founderStatus, setFounderStatus] = useState('active');

  useEffect(() => {
    const statusInterval = setInterval(() => {
      setFounderStatus(prev => prev === 'active' ? 'baking' : 'active');
    }, 15000);
    return () => clearInterval(statusInterval);
  }, []);

  // Developer Terminal Simulator State
  const [terminalInput, setTerminalInput] = useState('');
  const [terminalLogs, setTerminalLogs] = useState([
    'BKT-OS v2.8.1 (x86_64-node-environment)',
    'Logged in as guest@bktc-edge-node',
    'Coaching Center Established: 2015 (Offline) -> 2026 (Hybrid & Online)',
    'Total Mentored Students: 15,000+',
    'Type /help to query system capabilities.'
  ]);
  const terminalBodyRef = useRef(null);

  const toggleFaq = (idx) => {
    setOpenFaq(openFaq === idx ? null : idx);
  };

  useEffect(() => {
    if (terminalBodyRef.current) {
      terminalBodyRef.current.scrollTop = terminalBodyRef.current.scrollHeight;
    }
  }, [terminalLogs]);

  const handleTerminalSubmit = (e) => {
    e.preventDefault();
    const cmd = terminalInput.trim().toLowerCase();
    if (!cmd) return;

    let response = [];
    response.push(`guest@bktc:~$ ${terminalInput}`);

    if (cmd === '/help') {
      response.push(
        'Available terminal operations:',
        '  /history         - View 2015-2026 coaching center history',
        '  /stats           - Retrieve student counts & pass percentages',
        '  /system-info     - Retrieve founder tech stack specs',
        '  /deploy          - Compile frontend & sync edge nodes',
        '  /clear           - Wipe console buffer logs'
      );
    } else if (cmd === '/clear') {
      setTerminalLogs([]);
      setTerminalInput('');
      return;
    } else if (cmd === '/history') {
      response.push(
        'HISTORY TIMELINE:',
        '  2015: Opened as physical offline coaching center with 25 students.',
        '  2017: Expanded to 500+ offline students in Science & Mathematics.',
        '  2020: Pioneered high-definition live interactive online classes.',
        '  2023: Full platform automation with online tests & role-based portals.',
        '  2026: BK Teaching Center 2.0 with 15,000+ alumni & 200+ courses.'
      );
    } else if (cmd === '/stats') {
      response.push(
        'KEY INSTITUTION METRICS:',
        '  Total Students Mentored: 15,000+',
        '  Board & Competitive Pass Rate: 98.4%',
        '  Active Expert Faculty: 30+',
        '  Total Courses & Modules: 200+',
        '  Live Class Hours Streamed: 50,000+'
      );
    } else if (cmd === '/system-info') {
      response.push(
        'FOUNDER: Bittu Kumar',
        'ROLE: Lead Software Architect & Educational Director',
        'CORES: 12 Virtual Cloud Nodes',
        'ACTIVE RUNTIMES: Node.js v20.x, React 19, Express, MongoDB Atlas',
        'SERVERLESS DEPLOYMENT: Vercel Edge Global Network'
      );
    } else if (cmd === '/deploy') {
      response.push(
        '[1/3] Bundling assets via Vite builder...',
        '[2/3] Optimization step: clearing stale cache bundles...',
        '[3/3] Frontend deployed to edge CDN nodes! status: 200 OK (0.39s)'
      );
    } else {
      response.push(`bkt-sh: command not recognized: "${cmd}". Enter /help for a list.`);
    }

    setTerminalLogs(prev => [...prev, ...response]);
    setTerminalInput('');
  };

  const timelineMilestones = [
    {
      year: '2015',
      badge: 'The Beginning',
      title: 'Founded as an Offline Coaching Center',
      desc: 'BK Teaching Center opened its doors in 2015 as a dedicated offline coaching institute in Harnaut (Nalanda). Starting with just 25 students and a passionate mission, our small physical classrooms provided intensive, individualized tuition in Mathematics, Physics, and Chemistry.',
      icon: '🏫',
      stats: '25 Students • 100% Personal Attention',
      highlights: ['Physical Classroom Setup', 'Deep Conceptual Chalk-and-Talk Focus', 'Small Batch Mentorship']
    },
    {
      year: '2017',
      badge: 'Rapid Expansion',
      title: 'Regional Dominance & 500+ Offline Students',
      desc: 'Through consistent 100% board pass rates and district-topping marks, our offline batches quickly scaled to over 500+ students. We introduced dedicated Olympiad, NTSE, and competitive foundation batches with specialized study materials.',
      icon: '📈',
      stats: '500+ Offline Students • 98.2% Board First Divisions',
      highlights: ['Expanded Physical Classrooms', 'Printed Daily Practice Problem (DPP) Kits', 'Rigorous Weekly Offline Test Series']
    },
    {
      year: '2020',
      badge: 'Digital Evolution',
      title: 'Transition to Live Interactive Online Classes',
      desc: 'To ensure zero disruption to our students’ education during global lockdowns, BK Teaching Center transformed into a digital-first learning institution. We launched live Zoom and Google Meet interactive classes, digital whiteboards, and instant doubt-clearing sessions.',
      icon: '💻',
      stats: '4,500+ Online Students • Zero Study Disruption',
      highlights: ['High-Definition Live Streaming', 'Cloud-Based PDF Notes & Worksheets', 'Recorded Lecture Archives for 24/7 Revision']
    },
    {
      year: '2023',
      badge: 'EdTech Transformation',
      title: 'Full Student Portal & Automated Online Test Series',
      desc: 'We rolled out our full-stack web and mobile portal, giving students individual dashboards to track attendance, take chapter-wise online mock exams, submit assignments, and chat with teachers directly.',
      icon: '⚡',
      stats: '10,000+ Enrolled Students • 100+ Syllabi Courses',
      highlights: ['Automated Online Test Evaluation', 'Role-Based Dashboards for Students & Teachers', 'Instant Rank Generation & Weak Area Analytics']
    },
    {
      year: '2026',
      badge: 'The Modern Era',
      title: 'BK Teaching Center 2.0: 15,000+ Future Leaders',
      desc: 'Today, BK Teaching Center stands as a hybrid powerhouse merging 10+ years of offline pedagogical discipline with cutting-edge digital learning. We offer 200+ comprehensive courses, 30+ veteran faculty members, interactive coding sandboxes, and career mentorship for Grades 1-12, JEE/NEET, and Tech Engineering.',
      icon: '🚀',
      stats: '15,000+ Total Students • 200+ Courses • 30+ Faculty',
      highlights: ['Dual-Teacher Mentorship Model', 'Real-World Coding & AI Sandboxes', 'Nationwide Community & Verified Certificates']
    }
  ];

  const filteredMilestones = selectedTimelineYear === 'all' 
    ? timelineMilestones 
    : timelineMilestones.filter(m => m.year === selectedTimelineYear);

  const futureBuildingPillars = [
    {
      icon: '🧠',
      title: 'First-Principles Concept Clarity',
      desc: 'We eliminate rote memorization. Every concept in Mathematics, Science, and Coding is taught from foundational first-principles with visual models and real-life practical examples so students never forget the core logic.',
      benefit: 'Builds sharp analytical problem-solving skills for lifelong academic and career success.'
    },
    {
      icon: '👨‍🏫',
      title: '2-Teacher Mentorship System',
      desc: 'Every batch is powered by a Lead Master Teacher delivering deep interactive lectures, backed by a dedicated Assistant Mentor who solves individual student doubts instantly in real-time during and after class.',
      benefit: 'Zero doubt backlog; every child learns at their optimal pace with personal care.'
    },
    {
      icon: '🔄',
      title: 'Hybrid Power: Offline Rigor + Online Ease',
      desc: 'Enjoy the discipline and structured study routines of our 2015 offline roots combined with the convenience of attending live sessions from home, replaying HD lecture archives, and accessing digital notes on any phone or laptop.',
      benefit: 'Study anytime, anywhere with complete flexibility and zero travel exhaustion.'
    },
    {
      icon: '🎯',
      title: 'Integrated Board + Competitive Prep',
      desc: 'Our scientifically designed curriculum prepares students simultaneously for 95%+ scores in CBSE/ICSE/State Board examinations while building competitive problem-solving speed for JEE, NEET, Olympiads, and NTSE.',
      benefit: 'Saves time and money by eliminating the need for multiple separate coaching classes.'
    },
    {
      icon: '💻',
      title: 'Future-Ready Tech & Coding Skills',
      desc: 'Beyond traditional school syllabi, BK Teaching Center equips students with high-demand 21st-century digital skills: Web Development, Python, Block Coding, AI/ML basics, and Algorithmic Thinking.',
      benefit: 'Transforms students from mere technology consumers into creative software innovators.'
    },
    {
      icon: '📊',
      title: 'Weekly Diagnostic Tests & Parent PTMs',
      desc: 'Students undergo weekly chapter-wise quizzes and full-length simulated mock exams. Our automated analytics identify weak topics, and we hold transparent monthly Parent-Teacher virtual meetings.',
      benefit: 'Continuous measurable progress tracking with clear roadmaps for grade improvement.'
    }
  ];

  const faqs = [
    {
      q: "When was BK TEACHING CENTER established?",
      a: "BK TEACHING CENTER was founded in 2015. It started as a premier offline coaching center in Harnaut, Nalanda with a dedicated classroom for 25 students, and has now evolved into a nationwide hybrid & online platform mentoring over 15,000+ students."
    },
    {
      q: "How did BK Teaching Center transition from offline to online classes?",
      a: "In 2020, we expanded our offline teaching framework into a high-definition interactive online ecosystem. We brought live Google Meet & Zoom classrooms, digital whiteboards, recorded video replays, online mock test series, and cloud notes to ensure students from any city can learn from our top faculty."
    },
    {
      q: "How many total students have studied at BK Teaching Center?",
      a: "Over 15,000+ students have been mentored across our offline coaching classrooms and online live portal since 2015, maintaining a 98.4% success rate in board examinations, Olympiads, and competitive entrances."
    },
    {
      q: "How does BK Teaching Center help build a student's future?",
      a: "We provide an end-to-end academic & career blueprint: (1) Strong conceptual understanding without rote memorization, (2) Dual-teacher 24/7 personal doubt resolution, (3) Parallel preparation for Board exams and JEE/NEET/Olympiads, (4) Early training in modern tech skills like Coding and AI, and (5) Regular diagnostic tests with detailed parent feedback."
    },
    {
      q: "Can I attend both live classes and watch recorded replays?",
      a: "Yes! Every live class is recorded in full HD and stored in your personalized Student Dashboard along with downloadable instructor notes, assignments, and test answer keys for lifetime revision."
    },
    {
      q: "Do you provide verified Certificates of Completion?",
      a: "Yes! Upon finishing courses and passing final capstone assessments, BK TEACHING CENTER issues an official, verifiable digital certificate to showcase on academic and professional profiles."
    }
  ];

  const skillsData = [
    { name: "Frontend & Web Architecture (React 19, Vite, Responsive UX)", progress: 96 },
    { name: "Backend Systems & APIs (Node.js, Express, Microservices)", progress: 93 },
    { name: "Cloud & Database Caching (MongoDB Atlas, Redis, Serverless)", progress: 90 },
    { name: "EdTech Curriculum Design (STEM, Boards, JEE/NEET, Coding)", progress: 98 },
    { name: "Student Mentorship & Academic Growth Strategy", progress: 95 }
  ];

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '2rem 1.5rem 5rem', display: 'flex', flexDirection: 'column', gap: '4.5rem' }}>
      
      {/* 1. Hero Header with 2015 Legacy Badge */}
      <div className="glass-panel" style={{
        padding: '4.5rem 2rem',
        textAlign: 'center',
        background: 'linear-gradient(135deg, rgba(255, 109, 10, 0.12) 0%, rgba(59, 130, 246, 0.12) 50%, rgba(16, 185, 129, 0.08) 100%)',
        position: 'relative',
        overflow: 'hidden',
        border: '1px solid rgba(255, 109, 10, 0.25)',
        boxShadow: '0 20px 50px rgba(0, 0, 0, 0.3)'
      }}>
        {/* Established in 2015 Badge */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.6rem',
          backgroundColor: 'rgba(255, 109, 10, 0.15)',
          border: '1px solid rgba(255, 109, 10, 0.4)',
          padding: '0.45rem 1.25rem',
          borderRadius: 'var(--radius-full)',
          color: '#ff6d0a',
          fontSize: '0.88rem',
          fontWeight: 800,
          letterSpacing: '0.04em',
          marginBottom: '1.5rem',
          boxShadow: '0 0 20px rgba(255, 109, 10, 0.2)'
        }}>
          <Sparkles size={16} /> ESTABLISHED IN 2015 • 10+ YEARS OF ACADEMIC EXCELLENCE
        </div>

        <h1 style={{
          fontSize: 'clamp(2.2rem, 4.5vw, 3.6rem)',
          fontWeight: 900,
          color: 'var(--text-main)',
          marginBottom: '1.25rem',
          letterSpacing: '-0.02em',
          lineHeight: 1.15
        }}>
          From an Offline Classroom in <span style={{ color: '#ff6d0a' }}>2015</span> to a Modern <span style={{ color: '#3b82f6' }}>Digital EdTech Leader</span>
        </h1>

        <p style={{
          fontSize: '1.15rem',
          color: 'var(--text-muted)',
          maxWidth: '850px',
          margin: '0 auto 2.25rem',
          lineHeight: 1.7
        }}>
          Founded in 2015 as a dedicated offline coaching center, <strong>BK TEACHING CENTER</strong> has grown into a premier education platform empowering over <strong style={{ color: 'var(--text-main)' }}>15,000+ students</strong>. Combining 10+ years of proven offline discipline with cutting-edge live interactive classes, 30+ expert faculty, and 200+ courses to build high-achieving futures.
        </p>

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button className="btn-primary" style={{ padding: '0.9rem 2rem', fontSize: '1rem', fontWeight: 700 }} onClick={() => setCurrentView('courses')}>
            <BookOpen size={18} /> Explore 200+ Courses
          </button>
          <button className="btn-secondary" style={{ padding: '0.9rem 2rem', fontSize: '1rem', fontWeight: 700 }} onClick={() => setCurrentView('teachers')}>
            <Users size={18} /> Meet Our 30 Faculty Members
          </button>
          <button 
            className="curious-btn-outline" 
            style={{ padding: '0.9rem 2rem', fontSize: '1rem', fontWeight: 700, borderColor: '#10b981', color: '#10b981' }} 
            onClick={() => onOpenAuth ? onOpenAuth('login') : setCurrentView('courses')}
          >
            🎓 Book Free Demo Class
          </button>
        </div>
      </div>

      {/* 2. Key Institution Metrics & Statistics Grid */}
      <div>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <span style={{ color: '#ff6d0a', fontWeight: 800, fontSize: '0.85rem', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            PROVEN TRACK RECORD & IMPACT
          </span>
          <h2 style={{ fontSize: 'clamp(1.8rem, 3vw, 2.5rem)', color: 'var(--text-main)', marginTop: '0.35rem', fontWeight: 800 }}>
            Numbers That Define Our <span style={{ color: '#ff6d0a' }}>10-Year Legacy</span>
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', maxWidth: '680px', margin: '0.5rem auto 0' }}>
            From a humble offline start to nationwide recognition, our metrics reflect our relentless commitment to student success.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem' }}>
          {[
            { value: '2015', label: 'Year Established', sub: '10+ Years of Academic Trust', icon: '🏛️', color: '#ff6d0a', bg: 'rgba(255, 109, 10, 0.1)' },
            { value: '15,000+', label: 'Students Mentored', sub: 'Offline & Online Across India', icon: '👨‍🎓', color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.1)' },
            { value: '98.4%', label: 'Success Pass Rate', sub: 'Board & Competitive Exams', icon: '🏆', color: '#10b981', bg: 'rgba(16, 185, 129, 0.1)' },
            { value: '30+', label: 'Expert Faculty', sub: '5–18+ Years Experience', icon: '👩‍🏫', color: '#8b5cf6', bg: 'rgba(139, 92, 246, 0.1)' },
            { value: '200+', label: 'Dynamic Courses', sub: 'Grades 1-12, JEE, NEET & Tech', icon: '📚', color: '#06b6d4', bg: 'rgba(6, 182, 212, 0.1)' },
            { value: '50,000+', label: 'Live Class Hours', sub: 'Interactive Sessions Streamed', icon: '🎥', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.1)' },
          ].map((stat, idx) => (
            <div 
              key={idx} 
              className="glass-card" 
              style={{
                textAlign: 'center',
                padding: '2rem 1.5rem',
                border: '1px solid var(--border-color)',
                transition: 'all 0.3s ease',
                position: 'relative',
                overflow: 'hidden'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = stat.color;
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = `0 10px 30px ${stat.bg}`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--border-color)';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <div style={{ fontSize: '2rem', marginBottom: '0.6rem' }}>{stat.icon}</div>
              <div style={{ fontSize: '2.4rem', fontWeight: 900, color: stat.color, letterSpacing: '-0.02em', lineHeight: 1.1 }}>
                {stat.value}
              </div>
              <div style={{ fontSize: '1.02rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '0.4rem' }}>
                {stat.label}
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                {stat.sub}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. The 2015 to 2026 Journey Timeline */}
      <div className="glass-panel" style={{ padding: '3.5rem 2rem', border: '1px solid rgba(59, 130, 246, 0.25)' }}>
        <div style={{ textAlign: 'center', maxWidth: '750px', margin: '0 auto 3rem' }}>
          <span style={{ color: '#3b82f6', fontWeight: 800, fontSize: '0.85rem', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            OUR 10-YEAR EVOLUTION
          </span>
          <h2 style={{ fontSize: 'clamp(1.8rem, 3.2vw, 2.5rem)', color: 'var(--text-main)', marginTop: '0.35rem', fontWeight: 800 }}>
            The Story of <span style={{ color: '#3b82f6' }}>BK Teaching Center</span> (2015 – 2026)
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginTop: '0.5rem' }}>
            Explore how a small offline coaching room grew into a premier technology-driven learning center.
          </p>

          {/* Year Filter Buttons */}
          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', flexWrap: 'wrap', marginTop: '1.5rem' }}>
            {['all', '2015', '2017', '2020', '2023', '2026'].map((yr) => (
              <button
                key={yr}
                onClick={() => setSelectedTimelineYear(yr)}
                style={{
                  padding: '0.4rem 1.1rem',
                  borderRadius: '50px',
                  border: selectedTimelineYear === yr ? '1px solid #3b82f6' : '1px solid var(--border-color)',
                  backgroundColor: selectedTimelineYear === yr ? 'rgba(59, 130, 246, 0.2)' : 'rgba(255, 255, 255, 0.04)',
                  color: selectedTimelineYear === yr ? '#60a5fa' : 'var(--text-muted)',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                {yr === 'all' ? '🌟 All Milestones' : `📅 ${yr}`}
              </button>
            ))}
          </div>
        </div>

        {/* Timeline Cards Container */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: '950px', margin: '0 auto' }}>
          {filteredMilestones.map((item, idx) => (
            <div 
              key={idx}
              className="glass-card"
              style={{
                padding: '2rem',
                borderLeft: '4px solid #3b82f6',
                display: 'grid',
                gridTemplateColumns: 'auto 1fr',
                gap: '1.5rem',
                alignItems: 'flex-start',
                background: 'rgba(15, 23, 42, 0.65)'
              }}
            >
              {/* Year & Icon Column */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '80px' }}>
                <div style={{
                  fontSize: '2rem',
                  width: '56px',
                  height: '56px',
                  borderRadius: '16px',
                  backgroundColor: 'rgba(59, 130, 246, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '0.4rem'
                }}>
                  {item.icon}
                </div>
                <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#3b82f6', letterSpacing: '-0.02em' }}>
                  {item.year}
                </div>
                <span style={{
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  padding: '0.2rem 0.5rem',
                  borderRadius: '30px',
                  backgroundColor: 'rgba(59, 130, 246, 0.1)',
                  color: '#93c5fd',
                  marginTop: '0.2rem',
                  textAlign: 'center'
                }}>
                  {item.badge}
                </span>
              </div>

              {/* Details Column */}
              <div>
                <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.5rem' }}>
                  {item.title}
                </h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.94rem', lineHeight: 1.7, marginBottom: '1rem' }}>
                  {item.desc}
                </p>

                {/* Milestone Stat Highlight */}
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  backgroundColor: 'rgba(16, 185, 129, 0.1)',
                  border: '1px solid rgba(16, 185, 129, 0.25)',
                  padding: '0.35rem 0.85rem',
                  borderRadius: '8px',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  color: '#10b981',
                  marginBottom: '0.8rem'
                }}>
                  <CheckCircle size={15} /> {item.stats}
                </div>

                {/* Bullets */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {item.highlights.map((h, hIdx) => (
                    <span key={hIdx} style={{
                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
                      padding: '0.25rem 0.65rem',
                      borderRadius: '6px',
                      fontSize: '0.78rem',
                      color: 'var(--text-dim)',
                      fontWeight: 600
                    }}>
                      • {h}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. How This Coaching Center Can Build Your Future */}
      <div>
        <div style={{ textAlign: 'center', maxWidth: '800px', margin: '0 auto 3rem' }}>
          <span style={{ color: '#10b981', fontWeight: 800, fontSize: '0.85rem', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            STUDENT SUCCESS BLUEPRINT
          </span>
          <h2 style={{ fontSize: 'clamp(1.8rem, 3.2vw, 2.6rem)', color: 'var(--text-main)', marginTop: '0.35rem', fontWeight: 800 }}>
            How <span style={{ color: '#10b981' }}>BK Teaching Center</span> Builds Your Future
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginTop: '0.5rem', lineHeight: 1.6 }}>
            We don't just prepare students for examinations; we empower them with lifelong analytical thinking, technical expertise, and leadership discipline.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.75rem' }}>
          {futureBuildingPillars.map((pillar, idx) => (
            <div 
              key={idx} 
              className="glass-card"
              style={{
                padding: '2.2rem 1.75rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                border: '1px solid var(--border-color)',
                transition: 'all 0.3s ease',
                position: 'relative'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#10b981';
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 12px 30px rgba(16, 185, 129, 0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--border-color)';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <div>
                <div style={{
                  fontSize: '2.2rem',
                  width: '60px',
                  height: '60px',
                  borderRadius: '16px',
                  backgroundColor: 'rgba(16, 185, 129, 0.12)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1.25rem'
                }}>
                  {pillar.icon}
                </div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.75rem' }}>
                  {pillar.title}
                </h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', lineHeight: 1.7, marginBottom: '1.25rem' }}>
                  {pillar.desc}
                </p>
              </div>

              {/* Future Impact Benefit Box */}
              <div style={{
                padding: '0.85rem 1rem',
                borderRadius: '10px',
                backgroundColor: 'rgba(16, 185, 129, 0.06)',
                borderLeft: '3px solid #10b981',
                fontSize: '0.83rem',
                color: '#34d399',
                fontWeight: 600,
                lineHeight: 1.5
              }}>
                <strong>✨ Future Impact:</strong> {pillar.benefit}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 5. The Founder & Technical Architect Section */}
      <div>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <span style={{ color: '#e11d48', fontWeight: 800, fontSize: '0.85rem', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            FOUNDER & LEADERSHIP
          </span>
          <h2 className="glow-text-rose" style={{
            fontSize: 'clamp(2rem, 3.5vw, 2.75rem)',
            fontWeight: 900,
            color: '#e11d48',
            marginTop: '0.35rem',
            marginBottom: '0.5rem',
            letterSpacing: '-0.02em'
          }}>
            The Founder & Technical Architect
          </h2>
          <p style={{ fontSize: '1.02rem', color: 'var(--text-muted)', maxWidth: '750px', margin: '0 auto' }}>
            Meet Bittu Kumar—Software Engineer, Educator, and Director driving BK Teaching Center’s mission to make world-class education accessible to every student.
          </p>
        </div>

        {/* High-Fidelity Executive Dashboard Panel */}
        <div className="glass-panel" style={{
          padding: 0,
          overflow: 'hidden',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          borderRadius: '24px',
          border: '1px solid rgba(225, 29, 72, 0.25)',
          boxShadow: '0 25px 50px rgba(0, 0, 0, 0.35)'
        }}>
          
          {/* Left Avatar Container */}
          <div style={{
            background: 'radial-gradient(circle at 10% 10%, rgba(59, 130, 246, 0.12) 0%, transparent 50%), radial-gradient(circle at 90% 90%, rgba(225, 29, 72, 0.12) 0%, transparent 50%), radial-gradient(rgba(255, 255, 255, 0.04) 1px, transparent 1px) 0 0 / 16px 16px, linear-gradient(135deg, #050a15 0%, #0d1527 100%)',
            padding: '3.5rem 2rem',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            borderRight: '1px solid rgba(255, 255, 255, 0.08)',
            gap: '1.5rem'
          }}>
            {/* Spinning Gradient Border */}
            <div className="avatar-ring-container">
              <div className="avatar-ring-bg" />
              <div className="avatar-inner">
                <img
                  src={bittuPic}
                  alt="Bittu Kumar - Founder & Lead Software Engineer"
                  style={{
                    width: '100%',
                    height: '100%',
                    borderRadius: '50%',
                    objectFit: 'cover',
                    backgroundColor: '#fff'
                  }}
                />
              </div>
            </div>

            {/* Status indicators */}
            <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'center' }}>
              <div className="glowing-badge" style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                backgroundColor: 'rgba(9, 13, 22, 0.8)',
                border: '1px solid rgba(225, 29, 72, 0.3)',
                padding: '0.4rem 1rem',
                borderRadius: '50px',
                fontSize: '0.8rem',
                fontWeight: 700,
                color: '#f8fafc'
              }}>
                {founderStatus === 'active' ? (
                  <>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10b981', display: 'inline-block', boxShadow: '0 0 8px #10b981' }} />
                    BKT CORE ARCHITECTURE: ACTIVE
                  </>
                ) : (
                  <>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#f59e0b', display: 'inline-block', boxShadow: '0 0 8px #f59e0b' }} />
                    ACADEMIC ADMISSIONS OPEN: 2026
                  </>
                )}
              </div>

              {/* Social Channels Link Tray */}
              <div style={{ display: 'flex', gap: '0.8rem', marginTop: '0.5rem' }}>
                <a href="https://github.com" target="_blank" rel="noreferrer" className="btn-secondary" style={{ padding: '0.5rem', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <GithubIcon size={16} />
                </a>
                <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="btn-secondary" style={{ padding: '0.5rem', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <LinkedinIcon size={16} />
                </a>
                <a href="mailto:krbittu803110@gmail.com" className="btn-secondary" style={{ padding: '0.5rem', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <MailIcon size={16} />
                </a>
              </div>
            </div>
          </div>

          {/* Right Info Details: Dashboard Tabs */}
          <div style={{ padding: '3rem 2.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', justifyContent: 'flex-start' }}>
            
            {/* Header Switchers */}
            <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '0.5rem', gap: '1rem', overflowX: 'auto' }}>
              {[
                { id: 'profile', label: '👤 Bio Profile' },
                { id: 'skills', label: '📊 Skills & Tech Stack' },
                { id: 'terminal', label: '💻 Founder\'s CLI' },
                { id: 'vision', label: '👁️ Vision Statement' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveFounderTab(tab.id)}
                  style={{
                    background: 'none',
                    border: 'none',
                    padding: '0.5rem 0.2rem',
                    color: activeFounderTab === tab.id ? '#e11d48' : 'var(--text-muted)',
                    fontWeight: 700,
                    fontSize: '0.92rem',
                    borderBottom: activeFounderTab === tab.id ? '2px solid #e11d48' : 'none',
                    whiteSpace: 'nowrap',
                    cursor: 'pointer'
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* TAB 1: Biography Profile */}
            {activeFounderTab === 'profile' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <span style={{
                    color: '#e11d48',
                    fontWeight: 800,
                    fontSize: '0.8rem',
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    display: 'block',
                    marginBottom: '0.3rem'
                  }}>
                    FOUNDER, SOFTWARE ARCHITECT & EDUCATIONAL DIRECTOR
                  </span>
                  <h3 style={{
                    fontSize: '2rem',
                    fontWeight: 900,
                    color: 'var(--text-main)',
                    letterSpacing: '-0.02em',
                    margin: 0
                  }}>
                    BITTU KUMAR
                  </h3>
                </div>

                <p style={{ fontSize: '0.94rem', color: 'var(--text-muted)', lineHeight: 1.7, margin: 0 }}>
                  Bittu Kumar is a Software Engineer and visionary educator who founded <strong>BK Teaching Center</strong> in 2015 with the steadfast belief that quality academic coaching and modern technology should be accessible to every student regardless of background.
                </p>

                <p style={{ fontSize: '0.94rem', color: 'var(--text-muted)', lineHeight: 1.7, margin: 0 }}>
                  Starting as an offline classroom in Nalanda, he personally architected the transition into an all-in-one EdTech learning platform hosting 200+ courses, 30+ faculty, automated online test series, and cloud persistence. He continues to lead curriculum innovation, teaching mathematics, software architecture, and mentorship.
                </p>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.5rem' }}>
                  {['#SoftwareEngineering', '#Since2015', '#15kStudents', '#OfflineRoots', '#OnlineExcellence', '#BKTeachingCenter', '#TechEducation'].map((tag, idx) => (
                    <span key={idx} className="glowing-badge" style={{
                      backgroundColor: 'rgba(225, 29, 72, 0.1)',
                      color: '#e11d48',
                      border: '1px solid rgba(225, 29, 72, 0.25)',
                      padding: '0.35rem 0.85rem',
                      borderRadius: '30px',
                      fontSize: '0.78rem',
                      fontWeight: 700
                    }}>
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 2: Dynamic Skill progress bars */}
            {activeFounderTab === 'skills' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.8rem', display: 'block' }}>
                  Core engineering, pedagogical design, and platform technology competencies:
                </span>
                
                {skillsData.map((skill, index) => (
                  <div key={index} className="skill-bar-container">
                    <div className="skill-bar-label">
                      <span>{skill.name}</span>
                      <span style={{ color: '#e11d48' }}>{skill.progress}%</span>
                    </div>
                    <div className="skill-bar-track">
                      <div className="skill-bar-fill" style={{ width: `${skill.progress}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* TAB 3: Developer CLI Terminal Simulator */}
            {activeFounderTab === 'terminal' && (
              <div className="dev-terminal">
                <div className="terminal-header">
                  <div className="terminal-dots">
                    <span className="terminal-dot dot-red" />
                    <span className="terminal-dot dot-yellow" />
                    <span className="terminal-dot dot-green" />
                  </div>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>bittu@bktc-node-1:~</span>
                </div>
                
                <div className="terminal-body" ref={terminalBodyRef}>
                  {terminalLogs.map((log, idx) => (
                    <div key={idx} style={{ whiteSpace: 'pre-wrap', lineHeight: 1.4 }}>
                      {log}
                    </div>
                  ))}
                  
                  <form onSubmit={handleTerminalSubmit} className="terminal-input-row">
                    <span className="terminal-prompt">guest@bktc:~$</span>
                    <input
                      type="text"
                      className="terminal-input-field"
                      placeholder="Type /history or /stats or /help..."
                      value={terminalInput}
                      onChange={e => setTerminalInput(e.target.value)}
                      autoFocus
                    />
                    <span className="terminal-cursor">█</span>
                  </form>
                </div>
              </div>
            )}

            {/* TAB 4: Vision Statement */}
            {activeFounderTab === 'vision' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontStyle: 'italic', position: 'relative' }}>
                <div style={{
                  fontSize: '3.5rem',
                  color: 'rgba(225, 29, 72, 0.1)',
                  position: 'absolute',
                  top: '-2.5rem',
                  left: '-1rem',
                  fontFamily: 'serif'
                }}>“</div>
                <p style={{
                  fontSize: '1.05rem',
                  color: 'var(--text-main)',
                  lineHeight: 1.7,
                  position: 'relative',
                  zIndex: 1,
                  paddingLeft: '1rem'
                }}>
                  When we opened our offline coaching classroom in 2015 with 25 students, our goal was simple: teach every student like family, clarify every doubt, and build unshakeable confidence. Today, with over 15,000 students and live online classes, that core philosophy has never changed. We don't just teach subjects; we build careers and empower dreams.
                </p>
                <div style={{ textAlign: 'right', fontWeight: 800, color: '#e11d48', fontSize: '0.9rem' }}>
                  — BITTU KUMAR, Founder & Lead Architect
                </div>
              </div>
            )}

          </div>
        </div>
      </div>

      {/* 6. Why Choose BK Teaching Center vs Traditional Coaching */}
      <div className="glass-panel" style={{ padding: '3.5rem 2rem' }}>
        <div style={{ textAlign: 'center', maxWidth: '750px', margin: '0 auto 2.5rem' }}>
          <span style={{ color: '#ff6d0a', fontWeight: 800, fontSize: '0.85rem', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            WHY STUDENTS & PARENTS TRUST US
          </span>
          <h2 style={{ fontSize: 'clamp(1.8rem, 3vw, 2.4rem)', color: 'var(--text-main)', marginTop: '0.35rem', fontWeight: 800 }}>
            Why Choose <span style={{ color: '#ff6d0a' }}>BK TEACHING CENTER</span>?
          </h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
          {[
            '10+ Years of Proven Teaching Legacy (Established in 2015)',
            'Over 15,000+ Students Mentored with 98.4% First-Division Success Rate',
            '30+ Expert Faculty with 5-18+ Years Experience from Top Institutions',
            '200+ Multi-Module Courses covering Grades 1-12, JEE, NEET & Coding',
            'Live Interactive Zoom & Google Meet Classes with 2-Way Screen Sharing',
            '24/7 Unlimited Access to Full HD Recorded Video Lectures & PDF Notes',
            'Automated Online Diagnostic Tests with Detailed Performance Analytics',
            'Monthly Parent-Teacher Meetings (PTMs) & Personalized Remedial Batches',
            'Dedicated Student, Teacher, and Administrator Interactive Portals',
            'Official Accredited Certificate of Completion with Digital Verifiable IDs'
          ].map((feat, idx) => (
            <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.85rem' }}>
              <CheckCircle size={20} style={{ color: '#10b981', flexShrink: 0, marginTop: '3px' }} />
              <span style={{ fontSize: '0.95rem', color: 'var(--text-main)', fontWeight: 500, lineHeight: 1.5 }}>
                {feat}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 7. Student Success Stories & Testimonials */}
      <div>
        <div style={{ textAlign: 'center', maxWidth: '700px', margin: '0 auto 2.5rem' }}>
          <span style={{ color: '#8b5cf6', fontWeight: 800, fontSize: '0.85rem', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            ALUMNI VOICES
          </span>
          <h2 style={{ fontSize: 'clamp(1.8rem, 3vw, 2.4rem)', color: 'var(--text-main)', marginTop: '0.35rem', fontWeight: 800 }}>
            Hear from Our <span style={{ color: '#8b5cf6' }}>15,000+ Achievers</span>
          </h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
          {[
            {
              name: 'Rahul Sharma',
              batch: 'Class 10 Board Topper (98.2%)',
              text: 'I joined BK Teaching Center when it was an offline coaching institute. The conceptual clarity given by Bittu Sir in Math and Science helped me top my school with 98.2%. The transition to online classes later made revision effortless!',
              rating: 5,
              badge: 'Offline Batch Alumni'
            },
            {
              name: 'Priya Verma',
              batch: 'JEE Advanced Qualifier (AIR 1420)',
              text: 'The 2-Teacher model and weekly test series at BK Teaching Center are unmatched. Whenever I was stuck in physics problems, my mentor cleared it within minutes. It truly built my engineering career foundation.',
              rating: 5,
              badge: 'JEE Foundation Batch'
            },
            {
              name: 'Aman Raj',
              batch: 'Full-Stack Developer & Python Whiz',
              text: 'Besides school subjects, the coding sandboxes and web development courses gave me skills that college students struggle with. BK Teaching Center shaped both my academic grades and my career path!',
              rating: 5,
              badge: 'Tech & Coding Program'
            }
          ].map((item, idx) => (
            <div key={idx} className="glass-card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', border: '1px solid var(--border-color)' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', gap: '0.2rem', color: '#f59e0b' }}>
                    {[...Array(item.rating)].map((_, rIdx) => (
                      <Star key={rIdx} size={16} fill="#f59e0b" />
                    ))}
                  </div>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '0.25rem 0.65rem', borderRadius: '20px', backgroundColor: 'rgba(139, 92, 246, 0.15)', color: '#a78bfa' }}>
                    {item.badge}
                  </span>
                </div>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', lineHeight: 1.7, fontStyle: 'italic', marginBottom: '1.5rem' }}>
                  "{item.text}"
                </p>
              </div>
              <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
                <div style={{ fontWeight: 800, color: 'var(--text-main)', fontSize: '1rem' }}>{item.name}</div>
                <div style={{ fontSize: '0.8rem', color: '#10b981', fontWeight: 600 }}>{item.batch}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 8. FAQ Accordion */}
      <div>
        <div style={{ textAlign: 'center', maxWidth: '650px', margin: '0 auto 2.5rem' }}>
          <span style={{ color: 'var(--primary)', fontWeight: 800, fontSize: '0.85rem', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            FREQUENTLY ASKED QUESTIONS
          </span>
          <h2 style={{ fontSize: 'clamp(1.8rem, 3vw, 2.4rem)', color: 'var(--text-main)', marginTop: '0.35rem', fontWeight: 800 }}>
            Everything You Need to Know
          </h2>
        </div>

        <div style={{ maxWidth: '880px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {faqs.map((faq, idx) => (
            <div key={idx} className="glass-panel" style={{ overflow: 'hidden' }}>
              <button
                onClick={() => toggleFaq(idx)}
                style={{
                  width: '100%',
                  padding: '1.25rem 1.5rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  background: 'none',
                  border: 'none',
                  textAlign: 'left',
                  color: 'var(--text-main)',
                  fontWeight: 700,
                  fontSize: '1rem',
                  cursor: 'pointer'
                }}
              >
                <span>{faq.q}</span>
                <ChevronDown size={20} style={{ transform: openFaq === idx ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s ease', color: 'var(--primary)', flexShrink: 0 }} />
              </button>
              
              <div className={`smooth-accordion-content ${openFaq === idx ? 'open' : ''}`} style={{
                paddingLeft: '1.5rem',
                paddingRight: '1.5rem',
                color: 'var(--text-muted)',
                fontSize: '0.94rem',
                lineHeight: 1.7,
                borderTop: openFaq === idx ? '1px solid var(--border-color)' : 'none'
              }}>
                <div style={{ paddingBottom: '1.25rem' }}>{faq.a}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 9. Inspiring Call to Action Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #ff6d0a 0%, #ea580c 50%, #3b82f6 100%)',
        borderRadius: '24px',
        padding: '4rem 2rem',
        textAlign: 'center',
        color: '#fff',
        boxShadow: '0 20px 50px rgba(255, 109, 10, 0.35)',
        transition: 'all 0.3s ease',
        cursor: 'pointer'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = '0 0 45px rgba(255, 109, 10, 0.55)';
        e.currentTarget.style.transform = 'translateY(-2px)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = '0 20px 50px rgba(255, 109, 10, 0.35)';
        e.currentTarget.style.transform = 'translateY(0)';
      }}
      >
        <span style={{
          display: 'inline-block',
          backgroundColor: 'rgba(255, 255, 255, 0.2)',
          padding: '0.35rem 1rem',
          borderRadius: '50px',
          fontSize: '0.85rem',
          fontWeight: 800,
          marginBottom: '1rem',
          letterSpacing: '0.05em'
        }}>
          BUILD YOUR FUTURE WITH US
        </span>

        <h2 style={{ fontSize: 'clamp(2rem, 3.8vw, 2.8rem)', fontWeight: 900, marginBottom: '1rem', letterSpacing: '-0.02em' }}>
          Ready to Achieve Academic & Career Excellence?
        </h2>
        <p style={{ fontSize: '1.15rem', opacity: 0.95, maxWidth: '720px', margin: '0 auto 2.25rem', lineHeight: 1.7 }}>
          Join over 15,000+ students taking 200+ courses under 30+ top faculty members at BK TEACHING CENTER today.
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button 
            className="btn-secondary" 
            style={{ backgroundColor: '#fff', color: '#ea580c', padding: '0.95rem 2.4rem', fontSize: '1.05rem', fontWeight: 800, boxShadow: '0 8px 20px rgba(0,0,0,0.2)' }} 
            onClick={() => onOpenAuth ? onOpenAuth('login') : setCurrentView('courses')}
          >
            Get Started / Sign In
          </button>
          <button 
            className="btn-primary" 
            style={{ backgroundColor: '#090d16', color: '#fff', border: '1px solid rgba(255,255,255,0.2)', padding: '0.95rem 2rem', fontSize: '1rem', fontWeight: 700 }} 
            onClick={() => setCurrentView('courses')}
          >
            Browse All 200+ Courses
          </button>
        </div>
      </div>

    </div>
  );
}
