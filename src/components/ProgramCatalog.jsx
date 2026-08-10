import React, { useState } from 'react';

export const ProgramCatalog = ({ onOpenDemoModal }) => {
  const [selectedClass, setSelectedClass] = useState('Class 5');

  const classesList = ['Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5', 'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10'];

  const programs = [
    {
      id: 'after-school',
      title: 'After-School Tuition',
      tagline: 'Fuel your child\'s academic growth! See their confidence & grades skyrocket.',
      badge: 'CBSE, ICSE & State Boards',
      badgeBg: 'rgba(255, 109, 10, 0.15)',
      badgeColor: '#ff6d0a',
      bgCard: 'linear-gradient(180deg, rgba(255, 109, 10, 0.08) 0%, rgba(15, 23, 42, 0.6) 100%)',
      borderColor: 'rgba(255, 109, 10, 0.25)',
      icon: '📚',
      details: [
        { label: 'Target Classes', value: '1st to 10th', icon: '🏫' },
        { label: 'Live Schedule', value: '6 Days / Week', icon: '📅' },
        { label: 'Key Subjects', value: 'English, Maths, Science, SST', icon: '📖' },
        { label: 'Batch Size', value: 'Small Interactive Batches', icon: '👥' },
      ],
      price: '₹499 / month',
    },
    {
      id: 'english-cambridge',
      title: 'Learn English (Cambridge)',
      tagline: 'Help your child master English speaking & grammar. Get Cambridge certified!',
      badge: 'CEFR & Cambridge Aligned',
      badgeBg: 'rgba(16, 185, 129, 0.15)',
      badgeColor: '#10b981',
      bgCard: 'linear-gradient(180deg, rgba(16, 185, 129, 0.08) 0%, rgba(15, 23, 42, 0.6) 100%)',
      borderColor: 'rgba(16, 185, 129, 0.25)',
      icon: '🗣️',
      details: [
        { label: 'Target Classes', value: '1st to 8th', icon: '🏫' },
        { label: 'Live Schedule', value: '3 Days / Week', icon: '📅' },
        { label: 'Batch Size', value: '4-5 Learners per Class', icon: '👥' },
        { label: 'Focus Area', value: 'Public Speaking, Vocabulary & Accent', icon: '🎙️' },
      ],
      price: '₹599 / month',
    },
    {
      id: 'maths-superpowers',
      title: 'Maths Superpowers',
      tagline: 'Unlock your child\'s Math super powers! Solve complex calculations in just seconds.',
      badge: 'Vedic Math & Mental Tricks',
      badgeBg: 'rgba(2, 132, 199, 0.15)',
      badgeColor: '#38bdf8',
      bgCard: 'linear-gradient(180deg, rgba(2, 132, 199, 0.08) 0%, rgba(15, 23, 42, 0.6) 100%)',
      borderColor: 'rgba(2, 132, 199, 0.25)',
      icon: '📐',
      details: [
        { label: 'Target Classes', value: '1st to 8th', icon: '🏫' },
        { label: 'Live Schedule', value: '2 Days / Week', icon: '📅' },
        { label: 'Batch Size', value: '10-12 Learners per Class', icon: '👥' },
        { label: 'Focus Area', value: 'Speed Calculation & Logic Puzzles', icon: '⚡' },
      ],
      price: '₹399 / month',
    },
    {
      id: 'coding-ai',
      title: 'Coding & AI for Kids',
      tagline: 'Build mobile apps, games & AI programs. Transform your kid from user to creator!',
      badge: 'Block Coding to Python',
      badgeBg: 'rgba(139, 92, 246, 0.15)',
      badgeColor: '#c084fc',
      bgCard: 'linear-gradient(180deg, rgba(139, 92, 246, 0.08) 0%, rgba(15, 23, 42, 0.6) 100%)',
      borderColor: 'rgba(139, 92, 246, 0.25)',
      icon: '💻',
      details: [
        { label: 'Target Classes', value: '1st to 10th', icon: '🏫' },
        { label: 'Live Schedule', value: '2-3 Days / Week', icon: '📅' },
        { label: 'Projects Built', value: '15+ Mobile Apps & Games', icon: '📱' },
        { label: 'Curriculum', value: 'Blockly, JavaScript, Python & AI', icon: '⚙️' },
      ],
      price: '₹699 / month',
    },
  ];

  return (
    <section id="learning-programs" style={{ padding: '5rem 1.5rem', position: 'relative' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Section Header */}
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <span className="curious-badge-pw" style={{ marginBottom: '0.8rem', display: 'inline-block' }}>
            BK TEACHING CENTER COURSES
          </span>
          <h2 style={{ fontSize: 'clamp(2rem, 3.5vw, 2.8rem)', fontWeight: 800, color: 'var(--text-main)' }}>
            Pick a learning program & get <span style={{ color: '#3b82f6' }}>started! ⭐</span>
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', marginTop: '0.4rem', maxWidth: '600px', margin: '0.4rem auto 0' }}>
            Select your child's class to view customized courses tailored for their academic grade.
          </p>

          {/* Class Filter Bar */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.6rem',
              marginTop: '2rem',
              background: 'var(--bg-card)',
              padding: '0.8rem',
              borderRadius: '9999px',
              border: '1px solid var(--border-color)',
              maxWidth: '900px',
              margin: '2rem auto 0',
            }}
          >
            {classesList.map((cls) => (
              <button
                key={cls}
                onClick={() => setSelectedClass(cls)}
                className={`grade-pill ${selectedClass === cls ? 'active' : ''}`}
              >
                {cls}
              </button>
            ))}
          </div>
        </div>

        {/* Program Cards Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(270px, 1fr))',
            gap: '1.8rem',
          }}
        >
          {programs.map((prog) => (
            <div
              key={prog.id}
              className="program-card"
              style={{
                background: prog.bgCard,
                borderColor: prog.borderColor,
              }}
            >
              <div>
                {/* Header Badge & Icon */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                  <div style={{ fontSize: '2.5rem' }}>{prog.icon}</div>
                  <span
                    style={{
                      background: prog.badgeBg,
                      color: prog.badgeColor,
                      padding: '0.35rem 0.75rem',
                      borderRadius: '20px',
                      fontSize: '0.75rem',
                      fontWeight: 800,
                      border: `1px solid ${prog.badgeColor}40`,
                    }}
                  >
                    {prog.badge}
                  </span>
                </div>

                <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.5rem' }}>
                  {prog.title}
                </h3>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: '1.2rem' }}>
                  {prog.tagline}
                </p>

                {/* Key Details List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', marginBottom: '1.5rem' }}>
                  {prog.details.map((dt, index) => (
                    <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.85rem' }}>
                      <span style={{ fontSize: '1.1rem' }}>{dt.icon}</span>
                      <span style={{ color: 'var(--text-muted)' }}>{dt.label}:</span>
                      <strong style={{ color: 'var(--text-main)', marginLeft: 'auto' }}>{dt.value}</strong>
                    </div>
                  ))}
                </div>
              </div>

              {/* Price & Action CTA */}
              <div style={{ paddingTop: '1rem', borderTop: '1px solid var(--border-color)', marginTop: 'auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.8rem' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Starting at</span>
                  <span style={{ fontSize: '1.15rem', fontWeight: 800, color: '#ff6d0a' }}>{prog.price}</span>
                </div>
                <button
                  onClick={() => onOpenDemoModal(selectedClass, prog.title)}
                  className="curious-btn-primary"
                  style={{ width: '100%', justifyContent: 'center', padding: '0.75rem 1rem', fontSize: '0.95rem' }}
                >
                  Book a Free Demo Class
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
