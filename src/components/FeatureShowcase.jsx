import React, { useState } from 'react';

export const FeatureShowcase = () => {
  const [activeFeature, setActiveFeature] = useState(0);

  const features = [
    {
      title: 'Interactive Live Classes',
      subtitle: 'Gamified animations, live polling & instant badges make learning fun & effective.',
      icon: '🎮',
      graphicIcon: '🚀',
      bullets: [
        'Live polls & real-time leaderboard after every topic',
        'Gamified XP badges & virtual star trophies',
        '3D animated visual simulations for Math & Science',
      ],
      videoTitle: 'Live Gamified Class Room Experience',
    },
    {
      title: 'The Two-Teacher Model',
      subtitle: 'Master Educator delivers high quality concepts while a Dedicated Mentor solves doubts instantly.',
      icon: '👩‍🏫',
      graphicIcon: '💡',
      bullets: [
        '1 Master Teacher explaining core syllabus concepts',
        '1 Personal Mentor answering student queries 1-on-1 during class',
        'Zero unresolved doubts before class ends',
      ],
      videoTitle: '2-Teacher Live Classroom System',
    },
    {
      title: 'Tailored Practice Solutions',
      subtitle: 'Personalized practice exercises & worksheets designed to reinforce weak areas.',
      icon: '📝',
      graphicIcon: '⚡',
      bullets: [
        'Adaptive practice questions matching kid\'s speed',
        'Chapter-wise mock quizzes & Olympiad preparation',
        'Instant step-by-step solution breakdowns',
      ],
      videoTitle: 'Adaptive Practice Engine',
    },
    {
      title: '24/7 Homework Assistance',
      subtitle: 'No more homework struggles! Get instant step-by-step mentor support anytime.',
      icon: '🤝',
      graphicIcon: '📚',
      bullets: [
        'Snap a picture of any homework problem',
        'Senior mentor guides your child through the solution',
        'Builds independent problem solving confidence',
      ],
      videoTitle: '24/7 Mentor Homework Desk',
    },
    {
      title: 'Daily Performance Tracking',
      subtitle: 'Stay seamlessly connected with your child\'s learning journey through detailed reports.',
      icon: '📊',
      graphicIcon: '📈',
      bullets: [
        'Comprehensive Parent App dashboard',
        'Weekly accuracy & attendance analytics',
        'Regular Parent-Teacher Meetings (PTMs)',
      ],
      videoTitle: 'Parent Analytics Dashboard',
    },
  ];

  return (
    <section style={{ padding: '5rem 1.5rem', position: 'relative' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
          <span className="curious-badge-pw" style={{ marginBottom: '0.6rem', display: 'inline-block' }}>
            BK TEACHING CENTER PEDAGOGY
          </span>
          <h2 style={{ fontSize: 'clamp(2rem, 3.5vw, 2.8rem)', fontWeight: 800, color: 'var(--text-main)' }}>
            Hands-On Learning <span style={{ color: '#3b82f6' }}>& Excellence! 🌟</span>
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', maxWidth: '600px', margin: '0.4rem auto 0' }}>
            Discover how BK Teaching Center’s unique platform helps your child achieve academic mastery.
          </p>
        </div>

        {/* Feature Switcher Layout */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '2.5rem', alignItems: 'center' }}>
          {/* Left Feature Buttons Stack */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {features.map((feat, idx) => {
              const isActive = activeFeature === idx;
              return (
                <div
                  key={idx}
                  onClick={() => setActiveFeature(idx)}
                  style={{
                    padding: '1.2rem 1.5rem',
                    borderRadius: '16px',
                    border: `1.5px solid ${isActive ? '#ff6d0a' : 'var(--border-color)'}`,
                    background: isActive ? 'linear-gradient(135deg, rgba(255,109,10,0.12) 0%, rgba(15,23,42,0.7) 100%)' : 'var(--bg-card)',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    boxShadow: isActive ? '0 8px 25px rgba(255,109,10,0.2)' : 'none',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                    <span style={{ fontSize: '1.5rem' }}>{feat.icon}</span>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: isActive ? '#ff6d0a' : 'var(--text-main)' }}>
                      {feat.title}
                    </h3>
                  </div>
                  {isActive && (
                    <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginTop: '0.6rem', lineHeight: 1.5 }}>
                      {feat.subtitle}
                    </p>
                  )}
                </div>
              );
            })}
          </div>

          {/* Right Detailed Preview Display */}
          <div
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              borderRadius: '24px',
              padding: '2.2rem',
              boxShadow: 'var(--shadow-main)',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
              <div
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '16px',
                  background: 'rgba(255, 109, 10, 0.15)',
                  color: '#ff6d0a',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.8rem',
                }}
              >
                {features[activeFeature].graphicIcon}
              </div>
              <div>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)' }}>
                  {features[activeFeature].title}
                </h3>
                <span style={{ fontSize: '0.82rem', color: '#10b981', fontWeight: 700 }}>
                  CuriousJr Exclusive Feature
                </span>
              </div>
            </div>

            {/* Feature Bullets */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', marginBottom: '2rem' }}>
              {features[activeFeature].bullets.map((b, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.7rem', fontSize: '0.95rem' }}>
                  <span style={{ color: '#ff6d0a', fontWeight: 800 }}>✓</span>
                  <span style={{ color: 'var(--text-main)' }}>{b}</span>
                </div>
              ))}
            </div>

            {/* Interactive Visual Graphic Box */}
            <div
              style={{
                width: '100%',
                height: '180px',
                borderRadius: '16px',
                background: 'linear-gradient(135deg, #090d16 0%, #1e293b 100%)',
                border: '1px solid var(--border-color)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'column',
                gap: '0.5rem',
              }}
            >
              <div style={{ fontSize: '2.5rem' }}>{features[activeFeature].icon}</div>
              <div style={{ fontWeight: 800, color: '#fff', fontSize: '1.05rem' }}>
                {features[activeFeature].videoTitle}
              </div>
              <div style={{ fontSize: '0.8rem', color: '#38bdf8' }}>
                Interactive Demonstration Enabled
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
