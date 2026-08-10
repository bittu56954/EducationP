import React from 'react';
import { Modal } from './Modal';
import { GraduationCap, Award, BookOpen, Clock, CheckCircle } from './Icons';

export function TeacherDetailModal({ teacher, isOpen, onClose, courses = [], onViewCourse }) {
  if (!teacher) return null;

  // Filter courses taught by this teacher
  const teacherCourses = courses.filter(c => c.teacherId === teacher._id || c.teacher?.name === teacher.name);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Instructor Profile - ${teacher.name}`}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxHeight: '75vh', overflowY: 'auto', paddingRight: '0.5rem' }}>
        
        {/* Profile Header */}
        <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <img 
            src={teacher.profile?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80'} 
            alt={teacher.name} 
            style={{ width: '84px', height: '84px', borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--primary)' }}
          />
          <div style={{ flex: 1 }}>
            <h3 style={{ fontSize: '1.4rem', color: 'var(--text-main)', marginBottom: '0.25rem' }}>{teacher.name}</h3>
            <p style={{ color: 'var(--secondary)', fontWeight: 600, fontSize: '0.92rem' }}>
              {teacher.profile?.qualification || 'Senior Faculty & Department Lead'}
            </p>
            <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
              <span className="badge badge-teacher" style={{ fontSize: '0.75rem' }}>
                <Award size={14} /> {teacher.profile?.experienceYears || 8}+ Years Experience
              </span>
              <span className="badge badge-active" style={{ fontSize: '0.75rem' }}>
                ★ {teacher.profile?.rating || '4.9'} Instructor Rating
              </span>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                📞 {teacher.profile?.phone || '+1 (800) 555-BKTC'}
              </span>
            </div>
          </div>
        </div>

        {/* Bio */}
        <div style={{ background: 'var(--bg-glass)', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
          <h4 style={{ fontSize: '0.95rem', color: 'var(--text-main)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <GraduationCap size={18} style={{ color: 'var(--primary)' }} /> Biography & Academic Approach
          </h4>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
            {teacher.profile?.bio || `${teacher.name} is a renowned educator and industry pioneer at BK TEACHING CENTER, dedicated to building hands-on mastery and software engineering excellence.`}
          </p>
        </div>

        {/* Skills & Subjects */}
        <div>
          <h4 style={{ fontSize: '0.95rem', color: 'var(--text-main)', marginBottom: '0.75rem' }}>
            Core Expertise & Taught Subjects
          </h4>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {(teacher.profile?.skills || ['Software Engineering', 'System Architecture', 'Algorithms', 'Cloud Computing']).map((skill, idx) => (
              <span key={idx} style={{
                background: 'rgba(99, 102, 241, 0.12)',
                color: 'var(--primary)',
                border: '1px solid var(--border-glow)',
                padding: '0.35rem 0.85rem',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.8rem',
                fontWeight: 600
              }}>
                ✓ {skill}
              </span>
            ))}
          </div>
        </div>

        {/* Courses Taught by Teacher */}
        <div>
          <h4 style={{ fontSize: '1rem', color: 'var(--text-main)', marginBottom: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>Courses Taught ({teacherCourses.length})</span>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>BK TEACHING CENTER Curriculum</span>
          </h4>

          {teacherCourses.length === 0 ? (
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>This instructor is currently preparing upcoming modules.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '220px', overflowY: 'auto' }}>
              {teacherCourses.slice(0, 5).map(course => (
                <div key={course._id} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '0.75rem 1rem',
                  backgroundColor: 'var(--bg-glass)',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-color)'
                }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--text-main)' }}>{course.title}</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'flex', gap: '0.75rem', marginTop: '0.2rem' }}>
                      <span>{course.category}</span>
                      <span>• {course.level}</span>
                      <span>• {course.duration}</span>
                    </div>
                  </div>
                  <button 
                    className="btn-secondary" 
                    style={{ padding: '0.4rem 0.85rem', fontSize: '0.78rem' }}
                    onClick={() => {
                      onClose();
                      if (onViewCourse) onViewCourse(course);
                    }}
                  >
                    View Details
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </Modal>
  );
}
