import React from 'react';

export const KeyHighlightsBar = () => {
  const highlights = [
    {
      icon: '🎥',
      title: 'Live Interactive',
      subtitle: 'Classes with Gamified Badges',
      color: '#ff6d0a',
      bg: 'rgba(255, 109, 10, 0.1)',
    },
    {
      icon: '👩‍🏫',
      title: '24 x 7 Mentor Support',
      subtitle: 'Dedicated 2-Teacher Assistance',
      color: '#0284c7',
      bg: 'rgba(2, 132, 199, 0.1)',
    },
    {
      icon: '📈',
      title: 'Daily Progress',
      subtitle: 'Tracking & Parent PTMs',
      color: '#10b981',
      bg: 'rgba(16, 185, 129, 0.1)',
    },
    {
      icon: '💻',
      title: 'Practice Led',
      subtitle: 'Hands-On Labs & Quizzes',
      color: '#8b5cf6',
      bg: 'rgba(139, 92, 246, 0.1)',
    },
  ];

  return (
    <section style={{ maxWidth: '1200px', margin: '-2.5rem auto 3.5rem', padding: '0 1.5rem', relative: 10, zIndex: 10 }}>
      <div
        style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          borderRadius: '20px',
          padding: '1.5rem 2rem',
          boxShadow: 'var(--shadow-main)',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1.5rem',
        }}
      >
        {highlights.map((item, idx) => (
          <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div
              style={{
                width: '52px',
                height: '52px',
                borderRadius: '14px',
                background: item.bg,
                color: item.color,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.6rem',
                flexShrink: 0,
              }}
            >
              {item.icon}
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: '0.98rem', color: 'var(--text-main)' }}>{item.title}</div>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '0.1rem' }}>{item.subtitle}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
