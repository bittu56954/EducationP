import React, { useState, useRef, useEffect } from 'react';
import { GraduationCap, Award, BookOpen, Users, Shield, Video, CheckCircle, Sparkles, ChevronDown } from '../components/Icons';
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
  
  // Interactive Founder Tab System
  // Tabs: 'profile' | 'skills' | 'terminal' | 'vision'
  const [activeFounderTab, setActiveFounderTab] = useState('profile');
  
  // Interactive Methodology pillar deep-dives
  const [expandedPillar, setExpandedPillar] = useState(null);

  // Status simulation: fluctuates for fun
  const [founderStatus, setFounderStatus] = useState('active'); // 'active' | 'baking'
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
    'Type /help to query system capabilities.'
  ]);
  const terminalBodyRef = useRef(null);

  const toggleFaq = (idx) => {
    setOpenFaq(openFaq === idx ? null : idx);
  };

  // Scroll terminal logs to bottom when updated
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
        '  /deploy          - Compile frontend & sync edges',
        '  /bake-sourdough  - Initiate culinary oven preheat',
        '  /system-info     - Retrieve founder tech stack specs',
        '  /clear           - Wipe console buffer logs'
      );
    } else if (cmd === '/clear') {
      setTerminalLogs([]);
      setTerminalInput('');
      return;
    } else if (cmd === '/system-info') {
      response.push(
        'FOUNDER: Bittu Kumar',
        'ROLE: Lead Software Architect & Culinary Engineer',
        'CORES: 12 Virtual Nodes',
        'ACTIVE RUNTIMES: Node v20.x, React 18, Nginx-Reverse-Proxy',
        'DATABASES: MongoDB (Indexed persistence layer)',
        'FAVORITE DOUGH: 80% Hydration, Wild Yeast Sourdough'
      );
    } else if (cmd === '/deploy') {
      response.push(
        '[1/3] Bundling assets via Vite builder...',
        '[2/3] Optimization step: clearing stale cache bundles...',
        '[3/3] Frontend deployed to edge CDN nodes! status: 200 OK (0.39s)'
      );
    } else if (cmd === '/bake-sourdough') {
      response.push(
        '[Oven] Activating stone-oven deck heating elements... 🔥',
        '[Oven] Preheated deck to 235°C. Loading 24-hr fermented dough.',
        '[Bake] Retaining steam injection for crust blister formation...',
        '[Bake] Done! Fresh golden artisanal sourdough bread is ready. 🥖'
      );
    } else {
      response.push(`bkt-sh: command not recognized: "${cmd}". Enter /help for a list.`);
    }

    setTerminalLogs(prev => [...prev, ...response]);
    setTerminalInput('');
  };

  const faqs = [
    {
      q: "What is BK TEACHING CENTER?",
      a: "BK TEACHING CENTER is a premier modern online learning institution offering over 200 accredited tech & design courses taught by 30+ industry leaders, research scientists, and senior architects."
    },
    {
      q: "How do live online classes work?",
      a: "Students participate in real-time interactive Zoom and Google Meet sessions hosted by our certified instructors. You can ask questions live, review code on screen, and access recorded replays anytime."
    },
    {
      q: "Will I receive a Certificate of Completion?",
      a: "Yes! Upon finishing course lessons and capstone projects, BK TEACHING CENTER awards an official verified digital certificate with verifiable credentials."
    },
    {
      q: "Can I register as a Teacher or Student?",
      a: "Absolutely! Anyone can sign up as a Student to purchase courses and attend live classes, or apply/register as a Teacher to publish courses and lead live mentorship sessions."
    }
  ];

  // Specific Deep Dive text for the methodology cards
  const pillarDetails = {
    0: "Our video ecosystem operates on low-latency protocols, enabling dual-screen code-share, visual drawing boards, and sub-second chat. You aren't just listening to a video; you are pair programming with your instructor.",
    1: "With a massive repository of 200+ courses, we design modern pathways covering everything from basic Javascript paradigms to advanced deployment architecture, dockerization, and system orchestration.",
    2: "Every graduate gets a cryptographically secure digital certificate hash value verifiable on public ledger systems, proving to HR teams and hiring panels that your credential is 100% genuine.",
    3: "Students receive dynamic custom dashboards containing progress tracking. Teachers gain specialized tools for code evaluation, grading modules, and scheduling Google Meet calendar hooks."
  };

  // Skill data for Tab 2
  const skillsData = [
    { name: "Frontend Engineering (React / Vite / State)", progress: 95 },
    { name: "Backend Architectures (Node.js / Express / Microservices)", progress: 92 },
    { name: "Database Caching & Tuning (MongoDB / Redis / Indexes)", progress: 88 },
    { name: "DevOps & Cloud Systems (Ubuntu / Nginx / SSL / Actions)", progress: 85 },
    { name: "Culinary Thermodynamics (80% Hydration Sourdough Baking)", progress: 99 }
  ];

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '2rem 1.5rem 5rem', display: 'flex', flexDirection: 'column', gap: '4rem' }}>
      
      {/* About Hero Banner */}
      <div className="glass-panel" style={{
        padding: '4rem 2rem',
        textAlign: 'center',
        background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(6, 182, 212, 0.1) 100%)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.5rem',
          backgroundColor: 'var(--primary-glow)',
          border: '1px solid var(--border-glow)',
          padding: '0.4rem 1rem',
          borderRadius: 'var(--radius-full)',
          color: 'var(--primary)',
          fontSize: '0.85rem',
          fontWeight: 700,
          marginBottom: '1.25rem'
        }}>
          <Sparkles size={16} /> ABOUT BK TEACHING CENTER
        </div>

        <h1 style={{
          fontSize: 'clamp(2.2rem, 4vw, 3.5rem)',
          fontWeight: 800,
          color: 'var(--text-main)',
          marginBottom: '1.25rem',
          letterSpacing: '-0.02em'
        }}>
          Empowering the Next Generation of Tech Leaders & Engineers
        </h1>

        <p style={{
          fontSize: '1.1rem',
          color: 'var(--text-muted)',
          maxWidth: '800px',
          margin: '0 auto 2rem',
          lineHeight: 1.6
        }}>
          Founded with a clear purpose: to bridge the gap between academic theory and real-world industrial software engineering. **BK TEACHING CENTER** combines rigorous curriculum, 30+ veteran faculty members, and 200+ dynamic courses into a seamless online learning ecosystem.
        </p>

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button className="btn-primary" style={{ padding: '0.85rem 1.8rem', fontSize: '0.95rem' }} onClick={() => setCurrentView('courses')}>
            <BookOpen size={18} /> Explore 200+ Courses
          </button>
          <button className="btn-secondary" style={{ padding: '0.85rem 1.8rem', fontSize: '0.95rem' }} onClick={() => setCurrentView('teachers')}>
            <Users size={18} /> Meet Our 30 Teachers
          </button>
        </div>
      </div>

      {/* The Founder & Technical Architect Section */}
      <div>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <h2 className="glow-text-rose" style={{
            fontSize: 'clamp(2rem, 3.5vw, 2.75rem)',
            fontWeight: 900,
            color: '#e11d48',
            marginBottom: '0.5rem',
            letterSpacing: '-0.02em'
          }}>
            The Founder & Technical Architect
          </h2>
          <p style={{ fontSize: '1.05rem', color: 'var(--text-muted)', maxWidth: '750px', margin: '0 auto' }}>
            Explore the vision, core stacks, and interact directly with the founder's software sandboxes.
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
                    BAKING SOURDOUGH DECK: 235°C
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
                <a href="mailto:admissions@bkteachingcenter.com" className="btn-secondary" style={{ padding: '0.5rem', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
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
                { id: 'skills', label: '📊 Skills Stack' },
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
                    whiteSpace: 'nowrap'
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
                    FOUNDER, LEAD SOFTWARE ENGINEER & CULINARY ARCHITECT
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
                  Bittu Kumar is a Software Engineer and technical founder pioneering next-generation online learning & e-commerce frameworks, database persistence configurations, and responsive UI structures. Deeply passionate about the intersection of technology and gourmet culinary execution, he established <strong style={{ color: 'var(--text-main)' }}>BK Teaching Center</strong> to merge the precision of clean coding with stone-oven sourdough baking and state-of-the-art digital education.
                </p>

                <p style={{ fontSize: '0.94rem', color: 'var(--text-muted)', lineHeight: 1.7, margin: 0 }}>
                  Under his active oversight, the platform employs optimized routing nodes, dynamically fetched settings, and persistent document repositories. Bittu sets strict benchmarks for clean, maintainable system architectures.
                </p>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.5rem' }}>
                  {['#SoftwareEngineering', '#ArtisanalSourdough', '#InteractiveUX', '#CleanArchitectures', '#OnlineEducation', '#BKTeachingCenter'].map((tag, idx) => (
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
                  Clicking the tabs above or inspecting this chart shows the founder's technical depth:
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
                      placeholder="Type /help..."
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
                  Like cold fermentation, good software engineering cannot be rushed. It takes clean inputs, precise timing, and a controlled environment to rise correctly. At BK Teaching Center, we build developers the same way—layer by layer, teaching them the core principles of persistence, architecture, and deployment.
                </p>
                <div style={{ textAlign: 'right', fontWeight: 800, color: '#e11d48', fontSize: '0.9rem' }}>
                  — BITTU KUMAR, founder
                </div>
              </div>
            )}

          </div>
        </div>
      </div>

      {/* Core Platform Pillars */}
      <div>
        <div style={{ textAlign: 'center', maxWidth: '700px', margin: '0 auto 3rem' }}>
          <span style={{ color: 'var(--secondary)', fontWeight: 700, fontSize: '0.85rem', letterSpacing: '0.05em' }}>OUR METHODOLOGY</span>
          <h2 style={{ fontSize: '2.2rem', color: 'var(--text-main)', marginTop: '0.25rem' }}>The BK Teaching Approach</h2>
          <p style={{ color: 'var(--text-dim)', fontSize: '0.88rem', marginTop: '0.4rem' }}>
            (Click on any card to reveal details of our technical implementation)
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
          
          {[
            {
              icon: <Video size={24} />,
              color: 'var(--primary)',
              bg: 'rgba(99, 102, 241, 0.15)',
              title: "Interactive Live Classes",
              desc: "Direct live Google Meet & Zoom sessions with 30+ faculty members. Ask questions, work through code reviews, and collaborate in real-time."
            },
            {
              icon: <BookOpen size={24} />,
              color: 'var(--secondary)',
              bg: 'rgba(6, 182, 212, 0.15)',
              title: "200+ Dynamic Courses",
              desc: "Structured multi-module syllabi covering Web Development, Data Science, AI/ML, Cloud Infrastructure, Mobile Development, and Cybersecurity."
            },
            {
              icon: <Award size={24} />,
              color: 'var(--accent)',
              bg: 'rgba(16, 185, 129, 0.15)',
              title: "Accredited Certification",
              desc: "Earn industry-recognized certificates of completion to demonstrate technical competence to tech recruiters worldwide."
            },
            {
              icon: <Shield size={24} />,
              color: '#f59e0b',
              bg: 'rgba(245, 158, 11, 0.15)',
              title: "Role-Based Access",
              desc: "Dedicated Student dashboard for course enrollment and progress, Teacher dashboard for course creation & live sessions, and Admin control panel."
            }
          ].map((pillar, idx) => (
            <div
              key={idx}
              className="glass-card"
              onClick={() => setExpandedPillar(expandedPillar === idx ? null : idx)}
              style={{
                cursor: 'pointer',
                borderColor: expandedPillar === idx ? pillar.color : 'var(--border-color)',
                boxShadow: expandedPillar === idx ? `0 0 20px ${pillar.bg}` : 'none'
              }}
            >
              <div style={{
                width: '3rem',
                height: '3rem',
                borderRadius: 'var(--radius-md)',
                background: pillar.bg,
                color: pillar.color,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1.25rem'
              }}>
                {pillar.icon}
              </div>
              <h3 style={{ fontSize: '1.2rem', color: 'var(--text-main)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span>{pillar.title}</span>
                <span style={{ fontSize: '0.8rem', color: pillar.color }}>
                  {expandedPillar === idx ? '▲ Less' : '▼ More'}
                </span>
              </h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: expandedPillar === idx ? '1rem' : 0 }}>
                {pillar.desc}
              </p>
              
              {/* Pillar expanded data */}
              {expandedPillar === idx && (
                <div style={{
                  padding: '0.85rem 1rem',
                  borderRadius: '10px',
                  backgroundColor: 'rgba(9, 13, 22, 0.6)',
                  borderLeft: `3px solid ${pillar.color}`,
                  color: 'var(--text-muted)',
                  fontSize: '0.82rem',
                  lineHeight: 1.5,
                  animation: 'blinker 0.15s ease'
                }}>
                  {pillarDetails[idx]}
                </div>
              )}
            </div>
          ))}

        </div>
      </div>

      {/* Platform Key Features Comparison */}
      <div className="glass-panel" style={{ padding: '3rem 2rem' }}>
        <h2 style={{ fontSize: '1.8rem', color: 'var(--text-main)', textAlign: 'center', marginBottom: '2rem' }}>
          Why Students Choose BK TEACHING CENTER
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.5rem' }}>
          {[
            '30+ Expert Instructors with 5-18+ years industry experience',
            '200+ Dynamic Courses with updated 2026 tech stack modules',
            'Live Google Meet & Zoom sessions with calendar scheduling',
            'Interactive course enrollment & instant progress tracking',
            'Role-based dashboards for Students, Teachers & Admins',
            'Accredited Certificate of Completion for every finished course',
            'Lifetime access to course materials & syllabus updates',
            'Responsive UI optimized for Mobile, Tablet, and Desktop'
          ].map((feat, idx) => (
            <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
              <CheckCircle size={20} style={{ color: 'var(--accent)', flexShrink: 0, marginTop: '2px' }} />
              <span style={{ fontSize: '0.95rem', color: 'var(--text-main)', fontWeight: 500 }}>{feat}</span>
            </div>
          ))}
        </div>
      </div>

      {/* FAQ Accordion */}
      <div>
        <div style={{ textAlign: 'center', maxWidth: '600px', margin: '0 auto 2.5rem' }}>
          <span style={{ color: 'var(--primary)', fontWeight: 700, fontSize: '0.85rem' }}>FREQUENTLY ASKED QUESTIONS</span>
          <h2 style={{ fontSize: '2rem', color: 'var(--text-main)', marginTop: '0.25rem' }}>Got Questions? We Have Answers</h2>
        </div>

        <div style={{ maxWidth: '840px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
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
                  fontSize: '1rem'
                }}
              >
                <span>{faq.q}</span>
                <ChevronDown size={20} style={{ transform: openFaq === idx ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s ease', color: 'var(--primary)' }} />
              </button>
              
              {/* Smooth sliding height transition container */}
              <div className={`smooth-accordion-content ${openFaq === idx ? 'open' : ''}`} style={{
                paddingLeft: '1.5rem',
                paddingRight: '1.5rem',
                color: 'var(--text-muted)',
                fontSize: '0.92rem',
                lineHeight: 1.6,
                borderTop: openFaq === idx ? '1px solid var(--border-color)' : 'none'
              }}>
                <div style={{ paddingBottom: '1.25rem' }}>{faq.a}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA Box */}
      <div style={{
        background: 'linear-gradient(135deg, var(--primary) 0%, #4338ca 100%)',
        borderRadius: 'var(--radius-lg)',
        padding: '3.5rem 2rem',
        textAlign: 'center',
        color: '#fff',
        boxShadow: 'var(--shadow-glow)',
        transition: 'all 0.3s ease',
        cursor: 'pointer'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = '0 0 35px rgba(255, 109, 10, 0.4)';
        e.currentTarget.style.transform = 'translateY(-2px)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = 'var(--shadow-glow)';
        e.currentTarget.style.transform = 'translateY(0)';
      }}
      >
        <h2 style={{ fontSize: '2.2rem', fontWeight: 800, marginBottom: '1rem' }}>
          Ready to Start Your Learning Journey?
        </h2>
        <p style={{ fontSize: '1.1rem', opacity: 0.9, maxWidth: '650px', margin: '0 auto 2rem' }}>
          Join over 12,000+ students taking 200+ courses under 30+ top instructors at BK TEACHING CENTER today.
        </p>
        <button className="btn-secondary" style={{ backgroundColor: '#fff', color: '#4338ca', padding: '0.9rem 2.2rem', fontSize: '1rem', fontWeight: 700 }} onClick={() => onOpenAuth('register')}>
          Register Now for Free
        </button>
      </div>

    </div>
  );
}

