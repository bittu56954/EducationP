import React from 'react';

export const OlympiadRankers = () => {
  const champions = [
    {
      name: 'Aarav Sharma',
      grade: 'Class 5th',
      rank: 'AIR 1 - National Science Olympiad (NSO)',
      quote: 'CuriousJr’s 2-teacher model and interactive quizzes helped me top the NSO Olympiad effortlessly!',
      avatar: '👨‍🎓',
      score: '99.4% in Science & Maths',
      parent: 'Rajesh Sharma (Software Engineer, Delhi)',
    },
    {
      name: 'Ananya Verma',
      grade: 'Class 7th',
      rank: 'AIR 3 - International Math Olympiad (IMO)',
      quote: 'The Mental Math superpowers speed drills taught me calculations tricks that save minutes per question!',
      avatar: '👩‍🎓',
      score: '100/100 Math Score',
      parent: 'Sunita Verma (Bank Manager, Mumbai)',
    },
    {
      name: 'Rohan Gupta',
      grade: 'Class 4th',
      rank: 'Top Cambridge English Scholar',
      quote: 'I built my own Android space runner game after attending CuriousJr live coding sessions!',
      avatar: '🧑‍💻',
      score: 'Published 3 Apps on Store',
      parent: 'Vikram Gupta (Business Owner, Bangalore)',
    },
  ];

  return (
    <section style={{ padding: '5rem 1.5rem', background: 'radial-gradient(ellipse at 50% 100%, rgba(253, 226, 114, 0.08) 0%, rgba(9, 13, 22, 0) 70%)', position: 'relative' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
          <span className="curious-badge-pw" style={{ marginBottom: '0.6rem', display: 'inline-block' }}>
            Proven Hall of Fame
          </span>
          <h2 style={{ fontSize: 'clamp(2rem, 3.5vw, 2.8rem)', fontWeight: 800, color: 'var(--text-main)' }}>
            Trusted by <span style={{ color: '#ff6d0a' }}>Olympiad Rankers 🏆</span>
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', maxWidth: '600px', margin: '0.4rem auto 0' }}>
            Giving wings to a million dreams, empowering young champions across India every single day.
          </p>
        </div>

        {/* Champions Cards Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
          {champions.map((champ, index) => (
            <div
              key={index}
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                borderRadius: '20px',
                padding: '1.8rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                transition: 'all 0.3s ease',
                position: 'relative',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.2rem' }}>
                  <div
                    style={{
                      width: '56px',
                      height: '56px',
                      borderRadius: '50%',
                      background: 'rgba(255,109,10,0.15)',
                      border: '2px solid #ff6d0a',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '2rem',
                    }}
                  >
                    {champ.avatar}
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)' }}>{champ.name}</h3>
                    <span style={{ fontSize: '0.82rem', color: '#ff6d0a', fontWeight: 700 }}>{champ.grade}</span>
                  </div>
                </div>

                <div
                  style={{
                    background: 'rgba(253, 226, 114, 0.12)',
                    color: '#fde272',
                    padding: '0.4rem 0.8rem',
                    borderRadius: '8px',
                    fontSize: '0.8rem',
                    fontWeight: 800,
                    marginBottom: '1rem',
                    border: '1px solid rgba(253, 226, 114, 0.25)',
                  }}
                >
                  🏅 {champ.rank}
                </div>

                <p style={{ fontSize: '0.92rem', color: 'var(--text-main)', fontStyle: 'italic', lineHeight: 1.6, marginBottom: '1.2rem' }}>
                  "{champ.quote}"
                </p>
              </div>

              <div style={{ paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#10b981', marginBottom: '0.2rem' }}>
                  🎯 {champ.score}
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  Parent: {champ.parent}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
