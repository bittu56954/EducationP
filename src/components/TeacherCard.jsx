import React from 'react';
import { Award, BookOpen, GraduationCap, Users } from './Icons';

export function TeacherCard({ teacher, onSelectTeacher }) {
  const profile = teacher.profile || {};
  const skills = profile.skills || ['Software Engineering', 'Computer Science'];

  return (
    <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', height: '100%', position: 'relative' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
        <img 
          src={profile.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${teacher.name}`} 
          alt={teacher.name}
          style={{ width: '64px', height: '64px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--border-glow)' }}
        />
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <h3 style={{ fontSize: '1.1rem', color: 'var(--text-main)' }}>{teacher.name}</h3>
            <span style={{ fontSize: '0.78rem', color: '#f59e0b', fontWeight: 700 }}>★ {profile.rating || '4.9'}</span>
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--secondary)', fontWeight: 600 }}>
            {profile.qualification || 'Senior Instructor'}
          </p>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
            {profile.experienceYears || '8'}+ Years Industry Experience
          </span>
        </div>
      </div>

      <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.25rem', flex: 1, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
        {profile.bio || 'Dedicated educator passionate about teaching cutting-edge tech skills.'}
      </p>

      {/* Skills Badges */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '1.25rem' }}>
        {skills.slice(0, 4).map((skill, idx) => (
          <span key={idx} style={{
            fontSize: '0.72rem',
            backgroundColor: 'rgba(99, 102, 241, 0.12)',
            color: 'var(--primary)',
            padding: '0.2rem 0.55rem',
            borderRadius: 'var(--radius-full)',
            border: '1px solid rgba(99, 102, 241, 0.25)',
            fontWeight: 600
          }}>
            {skill}
          </span>
        ))}
      </div>

      {onSelectTeacher && (
        <button 
          className="btn-secondary" 
          style={{ width: '100%', justifyContent: 'center', fontSize: '0.85rem', padding: '0.6rem' }}
          onClick={() => onSelectTeacher(teacher)}
        >
          View Profile & Courses
        </button>
      )}
    </div>
  );
}
