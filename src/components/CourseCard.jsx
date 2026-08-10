import React from 'react';
import { BookOpen, Clock, GraduationCap, CheckCircle } from './Icons';

export function CourseCard({ course, onEnroll, onViewDetails, isEnrolled, user, onEdit, onDelete }) {
  const teacher = course.teacher;
  const rating = course.rating || '4.9';

  return (
    <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: 0, overflow: 'hidden' }}>
      {/* Thumbnail */}
      <div style={{ position: 'relative', height: '160px', overflow: 'hidden' }}>
        <img 
          src={course.thumbnail || course.image} 
          alt={course.title} 
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
        <div style={{
          position: 'absolute',
          top: '0.75rem',
          right: '0.75rem',
          backgroundColor: 'rgba(9, 13, 22, 0.85)',
          padding: '0.25rem 0.65rem',
          borderRadius: 'var(--radius-full)',
          fontSize: '0.75rem',
          fontWeight: 700,
          color: 'var(--secondary)',
          border: '1px solid var(--border-color)'
        }}>
          {course.category}
        </div>
        <div style={{
          position: 'absolute',
          bottom: '0.75rem',
          left: '0.75rem',
          backgroundColor: 'var(--primary)',
          color: '#fff',
          padding: '0.25rem 0.75rem',
          borderRadius: 'var(--radius-sm)',
          fontSize: '0.85rem',
          fontWeight: 800
        }}>
          ₹{course.price}
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
          <div style={{ display: 'flex', gap: '0.35rem', alignItems: 'center' }}>
            <span className="badge badge-student" style={{ fontSize: '0.7rem' }}>{course.level}</span>
            <span className="badge badge-student" style={{ backgroundColor: 'rgba(16, 185, 129, 0.15)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.3)', fontSize: '0.68rem', fontWeight: 800 }}>
              ⏳ 1 Year Access
            </span>
          </div>
          <span style={{ fontSize: '0.78rem', color: '#f59e0b', fontWeight: 700 }}>
            ★ {rating} ({course.enrolledStudentsCount || 100})
          </span>
        </div>

        <h3 
          onClick={() => onViewDetails && onViewDetails(course)}
          style={{ 
            fontSize: '1.05rem', 
            color: 'var(--text-main)', 
            marginBottom: '0.5rem', 
            height: '2.6rem', 
            overflow: 'hidden', 
            display: '-webkit-box', 
            WebkitLineClamp: 2, 
            WebkitBoxOrient: 'vertical',
            cursor: onViewDetails ? 'pointer' : 'default'
          }}
        >
          {course.title}
        </h3>

        <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '1rem', flex: 1, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {course.description}
        </p>

        {/* Instructor Info */}
        {teacher && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', padding: '0.5rem 0', borderTop: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)', marginBottom: '1rem' }}>
            <img 
              src={teacher.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${teacher.name}`} 
              alt={teacher.name} 
              style={{ width: '26px', height: '26px', borderRadius: '50%', objectFit: 'cover' }}
            />
            <div style={{ fontSize: '0.78rem' }}>
              <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>{teacher.name}</div>
            </div>
          </div>
        )}

        {/* Card Actions */}
        <div style={{ marginTop: 'auto', display: 'flex', gap: '0.5rem' }}>
          {isEnrolled ? (
            <button className="btn-success" style={{ width: '100%', justifyContent: 'center', fontWeight: 700 }} onClick={() => onViewDetails && onViewDetails(course)}>
              <CheckCircle size={16} /> Access Course
            </button>
          ) : user && (user.role === 'teacher' || user.role === 'admin') ? (
            <div style={{ display: 'flex', gap: '0.5rem', width: '100%' }}>
              {onEdit && (
                <button className="btn-secondary" style={{ flex: 1, justifyContent: 'center', padding: '0.5rem' }} onClick={() => onEdit(course)}>
                  Edit
                </button>
              )}
              {onDelete && (
                <button className="btn-danger" style={{ flex: 1, justifyContent: 'center', padding: '0.5rem' }} onClick={() => onDelete(course._id)}>
                  Delete
                </button>
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '0.5rem', width: '100%' }}>
              <button className="btn-secondary" style={{ flex: 1, justifyContent: 'center', padding: '0.5rem', fontSize: '0.82rem' }} onClick={() => onViewDetails && onViewDetails(course)}>
                Syllabus
              </button>
              <button className="curious-btn-primary" style={{ flex: 1, justifyContent: 'center', padding: '0.5rem', fontSize: '0.82rem', backgroundColor: '#3b82f6', borderColor: '#3b82f6' }} onClick={() => onEnroll && onEnroll(course)}>
                Buy (₹{course.price})
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
