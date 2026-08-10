import React from 'react';
import { Video, Calendar, Clock, ExternalLink, Users, CheckCircle, Play } from './Icons';

export function ClassCard({ 
  onlineClass, 
  classItem, 
  onDelete, 
  onEdit, 
  onJoin, 
  onStartLive, 
  onComplete,
  isStudent = false,
  isTeacher = false,
  isEnrolled = true
}) {
  const cls = onlineClass || classItem || {};
  const rawDate = cls.scheduledAt || cls.startTime;
  const scheduledDate = rawDate ? new Date(rawDate) : new Date();
  const formattedDate = scheduledDate.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
  const formattedTime = scheduledDate.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });

  const isZoom = cls.platform === 'Zoom';
  const status = (cls.status || 'upcoming').toLowerCase();

  const getStatusBadge = () => {
    if (status === 'live') {
      return (
        <span style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.4rem',
          backgroundColor: 'rgba(239, 68, 68, 0.2)',
          color: '#ef4444',
          border: '1px solid rgba(239, 68, 68, 0.4)',
          padding: '0.25rem 0.75rem',
          borderRadius: '20px',
          fontSize: '0.75rem',
          fontWeight: 800,
          letterSpacing: '0.05em'
        }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#ef4444', display: 'inline-block', boxShadow: '0 0 8px #ef4444' }} />
          LIVE NOW
        </span>
      );
    }
    if (status === 'completed') {
      return (
        <span style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.3rem',
          backgroundColor: 'rgba(16, 185, 129, 0.15)',
          color: '#10b981',
          border: '1px solid rgba(16, 185, 129, 0.3)',
          padding: '0.25rem 0.75rem',
          borderRadius: '20px',
          fontSize: '0.75rem',
          fontWeight: 700
        }}>
          <CheckCircle size={14} /> COMPLETED
        </span>
      );
    }
    return (
      <span style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.3rem',
        backgroundColor: 'rgba(99, 102, 241, 0.15)',
        color: '#6366f1',
        border: '1px solid rgba(99, 102, 241, 0.3)',
        padding: '0.25rem 0.75rem',
        borderRadius: '20px',
        fontSize: '0.75rem',
        fontWeight: 700
      }}>
        <Calendar size={14} /> UPCOMING
      </span>
    );
  };

  const getBorderColor = () => {
    if (status === 'live') return '4px solid #ef4444';
    if (status === 'completed') return '4px solid #10b981';
    return isZoom ? '4px solid #2D8CFF' : '4px solid #6366f1';
  };

  const handleJoinClick = (e) => {
    if (onJoin) {
      e.preventDefault();
      onJoin(cls);
    }
  };

  return (
    <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', borderLeft: getBorderColor() }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
            {getStatusBadge()}
            {cls.subject && (
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', backgroundColor: 'rgba(255, 255, 255, 0.05)', padding: '0.2rem 0.6rem', borderRadius: '4px' }}>
                {cls.subject}
              </span>
            )}
          </div>
          <h3 style={{ fontSize: '1.15rem', color: 'var(--text-main)', margin: '0.2rem 0', fontWeight: 700 }}>
            {cls.title || 'Untitled Class'}
          </h3>
          {cls.courseTitle && (
            <span style={{ fontSize: '0.82rem', color: 'var(--secondary)', fontWeight: 600 }}>
              Course: {cls.courseTitle}
            </span>
          )}
        </div>

        <span style={{
          backgroundColor: isZoom ? 'rgba(45, 140, 255, 0.15)' : 'rgba(0, 131, 45, 0.15)',
          color: isZoom ? '#60A5FA' : '#4ADE80',
          padding: '0.3rem 0.75rem',
          borderRadius: 'var(--radius-full)',
          fontSize: '0.75rem',
          fontWeight: 700,
          border: `1px solid ${isZoom ? 'rgba(45, 140, 255, 0.3)' : 'rgba(0, 131, 45, 0.3)'}`
        }}>
          {cls.platform || 'Google Meet'}
        </span>
      </div>

      {cls.description && (
        <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
          {cls.description}
        </p>
      )}

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.25rem', fontSize: '0.85rem', color: 'var(--text-muted)', background: 'rgba(255, 255, 255, 0.03)', padding: '0.75rem', borderRadius: 'var(--radius-sm)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <Calendar size={16} className="text-primary" /> {formattedDate} at {formattedTime}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <Clock size={16} className="text-secondary" /> {cls.durationMinutes || 60} Minutes
        </div>
        {cls.teacherName && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Users size={16} /> Instructor: {cls.teacherName}
          </div>
        )}
      </div>

      <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
        {status === 'live' ? (
          <a
            href={cls.meetingLink || cls.joinUrl || '#'}
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleJoinClick}
            className="btn-primary"
            style={{
              flex: 1,
              justifyContent: 'center',
              textDecoration: 'none',
              background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
              fontWeight: 800
            }}
          >
            <ExternalLink size={18} /> Join Live Class Now
          </a>
        ) : status === 'upcoming' ? (
          <button
            onClick={handleJoinClick}
            className="btn-secondary"
            style={{ flex: 1, justifyContent: 'center' }}
          >
            <Calendar size={18} /> {isTeacher ? 'View Scheduled Room' : 'Scheduled (Starts Soon)'}
          </button>
        ) : (
          <a
            href={cls.meetingLink || cls.joinUrl || '#'}
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleJoinClick}
            className="btn-secondary"
            style={{ flex: 1, justifyContent: 'center', textDecoration: 'none' }}
          >
            <Play size={18} /> Watch Recorded Replay
          </a>
        )}

        {/* Teacher / Admin Controls */}
        {isTeacher && (
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {status !== 'live' && status !== 'completed' && onStartLive && (
              <button 
                className="btn-primary" 
                style={{ backgroundColor: '#ef4444', borderColor: '#dc2626', fontSize: '0.82rem' }}
                onClick={() => onStartLive(cls._id)}
              >
                <Video size={15} /> Start Class
              </button>
            )}
            {status === 'live' && onComplete && (
              <button 
                className="btn-primary" 
                style={{ backgroundColor: '#10b981', borderColor: '#059669', fontSize: '0.82rem' }}
                onClick={() => onComplete(cls._id)}
              >
                <CheckCircle size={15} /> Mark Complete
              </button>
            )}
            {onEdit && (
              <button className="btn-secondary" style={{ fontSize: '0.82rem' }} onClick={() => onEdit(cls)}>
                Edit
              </button>
            )}
            {onDelete && (
              <button className="btn-danger" style={{ fontSize: '0.82rem' }} onClick={() => onDelete(cls._id)}>
                Delete
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
