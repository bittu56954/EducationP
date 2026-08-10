import React from 'react';

export const CuriousJrHero = ({ onOpenDemoModal, onScrollToPrograms, setCurrentView }) => {
  return (
    <section
      style={{
        position: 'relative',
        padding: '5rem 1.5rem 6rem',
        background: 'radial-gradient(ellipse at 50% 0%, rgba(59, 130, 246, 0.2) 0%, rgba(9, 13, 22, 0) 75%)',
        overflow: 'hidden',
      }}
    >
      {/* Background Decorative Graphic Stars & Floating Elements */}
      <div
        style={{
          position: 'absolute',
          top: '12%',
          left: '4%',
          fontSize: '2.5rem',
          opacity: 0.25,
          filter: 'drop-shadow(0 0 10px #3b82f6)',
          animation: 'pulse 3s infinite ease-in-out',
        }}
      >
        🚀
      </div>
      <div
        style={{
          position: 'absolute',
          bottom: '15%',
          right: '5%',
          fontSize: '2.8rem',
          opacity: 0.25,
          filter: 'drop-shadow(0 0 12px #60a5fa)',
        }}
      >
        🎓
      </div>

      <div style={{ maxWidth: '1240px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '3rem', alignItems: 'center' }}>
        {/* Left Hero Content */}
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.2rem' }}>
            <span style={{
              padding: '0.35rem 0.85rem',
              borderRadius: '50px',
              backgroundColor: 'rgba(59, 130, 246, 0.15)',
              color: '#3b82f6',
              fontSize: '0.82rem',
              fontWeight: 800,
              border: '1px solid rgba(59, 130, 246, 0.3)'
            }}>
              BK TEACHING CENTER
            </span>
            <span style={{ fontSize: '0.85rem', color: '#60a5fa', fontWeight: 700, letterSpacing: '0.04em' }}>
              #1 Academy for School Boards & Competitive Excellence
            </span>
          </div>

          <h1
            style={{
              fontSize: 'clamp(2.3rem, 4.2vw, 3.6rem)',
              fontWeight: 900,
              lineHeight: 1.15,
              color: 'var(--text-main)',
              marginBottom: '1.2rem',
              letterSpacing: '-0.02em'
            }}
          >
            Empowering Future Leaders through <br />
            <span style={{ background: 'linear-gradient(135deg, #3b82f6, #60a5fa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Mastery Education!
            </span>
          </h1>

          <p
            style={{
              fontSize: '1.15rem',
              color: 'var(--text-muted)',
              lineHeight: 1.6,
              marginBottom: '1.5rem',
              maxWidth: '560px',
            }}
          >
            Join <strong>BK Teaching Center</strong> for interactive live online classes, CBSE/ICSE board prep, JEE/NEET competitive training, and coding for Grades 1st to 12th.
          </p>

          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.6rem',
              background: 'rgba(59, 130, 246, 0.1)',
              border: '1px solid rgba(59, 130, 246, 0.3)',
              padding: '0.5rem 1rem',
              borderRadius: '30px',
              marginBottom: '2rem',
            }}
          >
            <span style={{ fontSize: '1.2rem' }}>⭐</span>
            <span style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '0.92rem' }}>
              Top Faculty & 2-Teacher Mentorship Model
            </span>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center' }}>
            <button onClick={() => setCurrentView ? setCurrentView('online-class') : onOpenDemoModal()} className="curious-btn-primary" style={{ backgroundColor: '#3b82f6', borderColor: '#3b82f6' }}>
              Explore Live Online Class &rarr;
            </button>

            <button onClick={() => setCurrentView ? setCurrentView('courses') : onScrollToPrograms()} className="curious-btn-outline">
              View All Courses
            </button>
          </div>

          {/* Social Proof Pills */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginTop: '2.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-color)', flexWrap: 'wrap' }}>
            <div>
              <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#3b82f6' }}>50,000+</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Active Students</div>
            </div>
            <div style={{ width: '1px', height: '30px', background: 'var(--border-color)' }}></div>
            <div>
              <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#10b981' }}>98.5%</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Board Pass Score</div>
            </div>
            <div style={{ width: '1px', height: '30px', background: 'var(--border-color)' }}></div>
            <div>
              <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#f59e0b' }}>4.9 ★</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Parent Rating</div>
            </div>
          </div>
        </div>

        {/* Right Hero Interactive Visual Showcase */}
        <div style={{ position: 'relative' }}>
          <div
            style={{
              position: 'relative',
              background: 'linear-gradient(145deg, rgba(59, 130, 246, 0.15) 0%, rgba(15, 23, 42, 0.8) 100%)',
              border: '2px solid rgba(59, 130, 246, 0.3)',
              borderRadius: '24px',
              padding: '1.8rem',
              boxShadow: '0 20px 50px rgba(0,0,0,0.5), 0 0 30px rgba(59, 130, 246, 0.2)',
            }}
          >
            {/* Live Class Stream Badge */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span className="badge badge-live" style={{ backgroundColor: '#ef4444' }}>● LIVE STREAM</span>
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                  Grade 10 - Physics & Calculus
                </span>
              </div>
              <span style={{ fontSize: '0.8rem', color: '#10b981', fontWeight: 700 }}>
                👥 248 Connected
              </span>
            </div>

            {/* Video / Graphic Frame Box */}
            <div
              style={{
                width: '100%',
                height: '240px',
                borderRadius: '16px',
                background: '#0b132b',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                overflow: 'hidden',
                border: '1px solid rgba(255, 255, 255, 0.1)',
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'radial-gradient(circle at 30% 30%, rgba(59,130,246,0.25) 0%, transparent 60%)',
                }}
              ></div>

              <div style={{ fontSize: '3.8rem', marginBottom: '0.5rem', filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.4))' }}>
                👨‍🏫
              </div>

              <div style={{ textAlign: 'center', zIndex: 1 }}>
                <div style={{ fontWeight: 800, fontSize: '1.1rem', color: '#fff' }}>
                  "Mastering Electromagnetism & Calculus"
                </div>
                <div style={{ fontSize: '0.85rem', color: '#60a5fa', marginTop: '0.2rem' }}>
                  Faculty: Dr. Anand Kumar (Ex-IIT Delhi Professor)
                </div>
              </div>

              <div
                style={{
                  position: 'absolute',
                  bottom: '12px',
                  right: '12px',
                  background: 'linear-gradient(135deg, #10b981, #059669)',
                  color: '#fff',
                  padding: '0.4rem 0.8rem',
                  borderRadius: '20px',
                  fontSize: '0.75rem',
                  fontWeight: 800,
                  boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                }}
              >
                ⚡ Live Quiz Active
              </div>
            </div>

            {/* Feature Mini Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem', marginTop: '1.2rem' }}>
              <div
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  padding: '0.8rem',
                  borderRadius: '12px',
                  border: '1px solid var(--border-color)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.6rem',
                }}
              >
                <div style={{ fontSize: '1.4rem' }}>👨‍🏫</div>
                <div>
                  <div style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-main)' }}>Expert Faculty</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Top Tier Educators</div>
                </div>
              </div>

              <div
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  padding: '0.8rem',
                  borderRadius: '12px',
                  border: '1px solid var(--border-color)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.6rem',
                }}
              >
                <div style={{ fontSize: '1.4rem' }}>📊</div>
                <div>
                  <div style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-main)' }}>Doubt Desk</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>24/7 Instant Solutions</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
