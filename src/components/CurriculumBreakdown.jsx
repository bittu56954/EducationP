import React, { useState } from 'react';

export const CurriculumBreakdown = ({ onOpenDemoModal }) => {
  const [openFaq, setOpenFaq] = useState(null);

  const faqs = [
    {
      q: 'What is BK Teaching Center’s Two-Teacher Model & how does it help my child?',
      a: 'In our Two-Teacher live model, 1 Master Educator delivers the main interactive concepts while a dedicated 2nd Personal Mentor focuses 1-on-1 on answering your child’s live doubts, correcting worksheets, and tracking attention in real-time. This guarantees zero unresolved doubts.',
    },
    {
      q: 'How does the FREE Live Demo Class work?',
      a: 'The free live demo is a 45-minute interactive session where your child experiences BK Teaching Center’s live classroom, interactive concepts, and our academic counsellor provides a complete learning roadmap tailored for your child’s grade.',
    },
    {
      q: 'Which boards & classes does BK Teaching Center support?',
      a: 'We cover complete school curriculum for Classes 1st to 12th aligned with CBSE, ICSE, and major Indian State Boards, as well as JEE & NEET entrance prep modules.',
    },
    {
      q: 'What device or setup is required for attending live classes?',
      a: 'Your child can join live classes from any Android phone, iPhone, iPad, Tablet, Laptop, or Computer with a stable internet connection.',
    },
    {
      q: 'Is there a refund policy if we decide to pause classes?',
      a: 'Yes! BK Teaching Center provides a 100% no-questions-asked refund policy within the first 14 days of subscription if you are not completely satisfied.',
    },
  ];

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <section style={{ padding: '5rem 1.5rem', position: 'relative' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        {/* Section Header */}
        <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
          <span className="curious-badge-pw" style={{ marginBottom: '0.6rem', display: 'inline-block' }}>
            Got Questions?
          </span>
          <h2 style={{ fontSize: 'clamp(2rem, 3.5vw, 2.8rem)', fontWeight: 800, color: 'var(--text-main)' }}>
            Frequently Asked <span style={{ color: '#ff6d0a' }}>Questions 🤔</span>
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', marginTop: '0.4rem' }}>
            Everything you need to know about CuriousJr live tuition, trial classes, & mentors.
          </p>
        </div>

        {/* FAQ Accordion */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '4rem' }}>
          {faqs.map((faq, index) => {
            const isOpen = openFaq === index;
            return (
              <div
                key={index}
                style={{
                  background: 'var(--bg-card)',
                  border: `1.5px solid ${isOpen ? '#ff6d0a' : 'var(--border-color)'}`,
                  borderRadius: '16px',
                  overflow: 'hidden',
                  transition: 'all 0.3s ease',
                }}
              >
                <button
                  onClick={() => toggleFaq(index)}
                  style={{
                    width: '100%',
                    padding: '1.4rem 1.8rem',
                    background: 'transparent',
                    border: 'none',
                    textAlign: 'left',
                    color: 'var(--text-main)',
                    fontSize: '1.1rem',
                    fontWeight: 700,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    cursor: 'pointer',
                  }}
                >
                  <span>{faq.q}</span>
                  <span
                    style={{
                      fontSize: '1.4rem',
                      color: '#ff6d0a',
                      transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                      transition: 'transform 0.3s ease',
                    }}
                  >
                    ▼
                  </span>
                </button>
                {isOpen && (
                  <div
                    style={{
                      padding: '0 1.8rem 1.4rem',
                      color: 'var(--text-muted)',
                      fontSize: '0.98rem',
                      lineHeight: 1.6,
                      borderTop: '1px solid rgba(255,255,255,0.05)',
                      paddingTop: '1rem',
                    }}
                  >
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Bottom CTA Banner */}
        <div
          style={{
            background: 'linear-gradient(135deg, rgba(255, 109, 10, 0.2) 0%, rgba(15, 23, 42, 0.9) 100%)',
            border: '2px solid #ff6d0a',
            borderRadius: '24px',
            padding: '3rem 2rem',
            textAlign: 'center',
            boxShadow: '0 20px 40px rgba(255,109,10,0.15)',
          }}
        >
          <span className="curious-badge-pw" style={{ marginBottom: '1rem', display: 'inline-block' }}>
            Transform Your Child's Learning Journey
          </span>
          <h2 style={{ fontSize: 'clamp(1.8rem, 3vw, 2.5rem)', fontWeight: 800, color: '#fff', marginBottom: '0.8rem' }}>
            Book a 1-on-1 FREE Demo Session Today!
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', maxWidth: '600px', margin: '0 auto 1.8rem' }}>
            Join 50,000+ students mastering School Curriculum, Mental Math, Cambridge English & Live Coding.
          </p>
          <button onClick={() => onOpenDemoModal('Class 5', 'After-School Tuition')} className="curious-btn-primary" style={{ fontSize: '1.1rem', padding: '0.9rem 2.2rem' }}>
            Book Your Free Trial Class Now &rarr;
          </button>
        </div>
      </div>
    </section>
  );
};
