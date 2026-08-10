import React from 'react';
import { GraduationCap, Mail, Phone, MapPin } from './Icons';

export function Footer({ setCurrentView }) {
  const handleNav = (view) => {
    if (setCurrentView) {
      setCurrentView(view);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <footer style={{
      backgroundColor: '#070a11',
      borderTop: '1px solid var(--border-color)',
      padding: '4rem 2rem 2rem',
      marginTop: 'auto',
      color: 'var(--text-muted)'
    }}>
      <div style={{
        maxWidth: '1280px',
        margin: '0 auto',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '2.5rem',
        paddingBottom: '3rem',
        borderBottom: '1px solid var(--border-color)'
      }}>
        {/* Brand & Purpose */}
        <div style={{ gridColumn: 'span 2' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
            <div style={{
              width: '2.6rem',
              height: '2.6rem',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              boxShadow: '0 4px 14px rgba(59, 130, 246, 0.4)'
            }}>
              <GraduationCap size={22} />
            </div>
            <div>
              <span style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--text-main)', letterSpacing: '-0.02em', lineHeight: 1 }}>
                BK <span style={{ color: '#3b82f6' }}>TEACHING CENTER</span>
              </span>
              <div style={{ fontSize: '0.65rem', color: '#3b82f6', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                Excellence in Education & Future Leaders
              </div>
            </div>
          </div>

          <p style={{ fontSize: '0.92rem', lineHeight: 1.6, color: 'var(--text-muted)', marginBottom: '1.5rem', maxWidth: '480px' }}>
            BK Teaching Center provides world-class tuition, competitive exam preparation (JEE/NEET/Olympiads), live online classes, and coding programs for Grades 1 to 12.
          </p>

          <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.88rem', flexWrap: 'wrap' }}>
            <div>
              <div style={{ color: 'var(--text-main)', fontWeight: 700 }}>📞 Admissions Desk</div>
              <a href="tel:9876543210" style={{ color: '#3b82f6', fontWeight: 700 }}>+91 9905401908</a>
            </div>
            <div>
              <div style={{ color: 'var(--text-main)', fontWeight: 700 }}>✉️ Email Support</div>
              <a href="mailto:info@bkteachingcenter.com" style={{ color: '#3b82f6', fontWeight: 700 }}>krbittu803110@gmail.com</a>
            </div>
          </div>
        </div>

        {/* Quick Navigation Links */}
        <div>
          <h4 style={{ color: 'var(--text-main)', fontSize: '1.05rem', fontWeight: 800, marginBottom: '1.25rem' }}>
            Quick Navigation
          </h4>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.88rem' }}>
            <li><button onClick={() => handleNav('home')} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', textAlign: 'left' }}>Home</button></li>
            <li><button onClick={() => handleNav('about')} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', textAlign: 'left' }}>About Us</button></li>
            <li><button onClick={() => handleNav('contact')} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', textAlign: 'left' }}>Contact Us</button></li>
            <li><button onClick={() => handleNav('dashboard')} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', textAlign: 'left' }}>Student Dashboard</button></li>
            <li><button onClick={() => handleNav('courses')} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', textAlign: 'left' }}>All Courses</button></li>
            <li><button onClick={() => handleNav('teachers')} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', textAlign: 'left' }}>Our Faculty</button></li>
            <li><button onClick={() => handleNav('online-class')} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', textAlign: 'left' }}>Live Online Class</button></li>
          </ul>
        </div>

        {/* Programs & Courses */}
        <div>
          <h4 style={{ color: 'var(--text-main)', fontSize: '1.05rem', fontWeight: 800, marginBottom: '1.25rem' }}>
            Academic Programs
          </h4>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.88rem' }}>
            <li><button onClick={() => handleNav('courses')} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>CBSE / ICSE Board Prep</button></li>
            <li><button onClick={() => handleNav('courses')} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>JEE Main & Advanced</button></li>
            <li><button onClick={() => handleNav('courses')} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>NEET Medical Entrance</button></li>
            <li><button onClick={() => handleNav('courses')} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>Olympiad & Foundation</button></li>
            <li><button onClick={() => handleNav('courses')} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>Coding, Robotics & AI</button></li>
          </ul>
        </div>

        {/* Center Campus Info */}
        <div>
          <h4 style={{ color: 'var(--text-main)', fontSize: '1.05rem', fontWeight: 800, marginBottom: '1.25rem' }}>
            Campus Location
          </h4>
          <p style={{ fontSize: '0.85rem', lineHeight: 1.5, color: 'var(--text-muted)', marginBottom: '1rem' }}>
            BK Teaching Center, Knowledge Hub Campus, Harnaut Nalanda 803110
          </p>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button onClick={() => handleNav('contact')} className="curious-btn-outline" style={{ padding: '0.45rem 0.9rem', fontSize: '0.8rem' }}>
              View Center Map
            </button>
          </div>
        </div>
      </div>

      {/* Copyright Line */}
      <div style={{
        maxWidth: '1280px',
        margin: '0 auto',
        paddingTop: '2rem',
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '1rem',
        fontSize: '0.85rem'
      }}>
        <div>
          Copyright © 2026 BK Teaching Center. All rights reserved.
        </div>
        <div style={{ display: 'flex', gap: '1rem', color: '#3b82f6', fontWeight: 700 }}>
          <span>BK Learning Platform</span>
          <span>•</span>
          <span>4.9 ★ Student Rating</span>
          <span>•</span>
          <span>50,000+ Enrolled Students</span>
        </div>
      </div>
    </footer>
  );
}
