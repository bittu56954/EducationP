import React from 'react';
import { BookOpen, Video, Users, GraduationCap, Shield, Plus, Bell, Calendar, Play, User, FileText, MessageSquare } from './Icons';

export function Sidebar({ user, activeTab, setActiveTab }) {
  if (!user) return null;

  const studentTabs = [
    { id: 'enrolled', label: 'Purchased Courses & Hub', icon: BookOpen },
    { id: 'tests', label: '📝 Weekly Online Tests', icon: FileText },
    { id: 'exams', label: '🏆 Online Exam Portal', icon: GraduationCap },
    { id: 'messages', label: '💬 Chat & Messages', icon: MessageSquare },
    { id: 'payments', label: 'Payments & Receipts', icon: FileText },
    { id: 'profile', label: 'My Profile', icon: User },
    { id: 'live', label: 'Scheduled Live Classes', icon: Video },
    { id: 'notes', label: 'Class Notes & Handouts', icon: BookOpen },
    { id: 'videos', label: 'Recorded Class Videos', icon: Play },
    { id: 'catalog', label: 'Browse Course Catalog', icon: GraduationCap }
  ];

  const teacherTabs = [
    { id: 'profile', label: 'My Profile & Schedule', icon: User },
    { id: 'tests', label: '📝 Manage Weekly Tests', icon: FileText },
    { id: 'exams', label: '🏆 Online Exams', icon: GraduationCap },
    { id: 'messages', label: '💬 Chat & Messages', icon: MessageSquare },
    { id: 'purchases', label: 'Course Purchases', icon: BookOpen },
    { id: 'classes', label: 'My Live Classes', icon: Video },
    { id: 'courses', label: 'My Courses', icon: GraduationCap },
    { id: 'notes', label: 'Class Notes', icon: BookOpen },
    { id: 'videos', label: 'Recorded Videos', icon: Play },
    { id: 'students', label: 'Enrolled Students', icon: Users }
  ];

  const adminTabs = [
    { id: 'purchases', label: 'Course Purchases', icon: BookOpen },
    { id: 'exams', label: '🏆 Manage Online Exams', icon: Shield },
    { id: 'teachers', label: 'Manage Teachers', icon: Users },
    { id: 'users', label: 'Registered Users', icon: Users },
    { id: 'classes', label: 'Schedule Live Classes', icon: Video },
    { id: 'notes', label: 'Provide Class Notes', icon: BookOpen },
    { id: 'videos', label: 'Upload Recorded Videos', icon: Play },
    { id: 'courses', label: 'Manage Courses', icon: GraduationCap },
    { id: 'stats', label: 'Platform Overview', icon: Shield }
  ];

  const tabs = user.role === 'teacher' ? teacherTabs : user.role === 'admin' ? adminTabs : studentTabs;
  const roleLabel = user.role === 'teacher' ? 'Teacher Studio' : user.role === 'admin' ? 'System Admin Panel' : 'Student Portal';
  const roleBadgeColor = user.role === 'teacher' ? '#a855f7' : user.role === 'admin' ? '#3b82f6' : '#10b981';
  const roleBadgeBg = user.role === 'teacher' ? 'rgba(168, 85, 247, 0.15)' : user.role === 'admin' ? 'rgba(59, 130, 246, 0.15)' : 'rgba(16, 185, 129, 0.15)';

  return (
    <aside style={{
      backgroundColor: 'rgba(12, 17, 29, 0.85)',
      borderRight: '1px solid var(--border-color)',
      padding: '2rem 1.25rem',
      display: 'flex',
      flexDirection: 'column',
      gap: '0.5rem',
      width: '260px',
      flexShrink: 0
    }}>
      <div style={{ marginBottom: '1.5rem', padding: '0 0.5rem' }}>
        <span style={{ 
          fontSize: '0.72rem', 
          fontWeight: 800, 
          color: roleBadgeColor, 
          textTransform: 'uppercase', 
          letterSpacing: '0.08em',
          backgroundColor: roleBadgeBg,
          padding: '0.2rem 0.6rem',
          borderRadius: '50px'
        }}>
          {roleLabel}
        </span>
        <h4 style={{ fontSize: '1.1rem', color: 'var(--text-main)', marginTop: '0.6rem', fontWeight: 800 }}>
          Welcome, {user.name.split(' ')[0]} 👋
        </h4>
      </div>

      {tabs.map((tab) => {
        const IconComponent = tab.icon;
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.85rem',
              padding: '0.85rem 1rem',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: isActive ? 'rgba(168, 85, 247, 0.18)' : 'transparent',
              color: isActive ? '#ffffff' : 'var(--text-muted)',
              border: isActive ? '1px solid rgba(168, 85, 247, 0.4)' : '1px solid transparent',
              fontWeight: isActive ? 800 : 600,
              fontSize: '0.9rem',
              textAlign: 'left',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            <IconComponent size={18} style={{ color: isActive ? '#a855f7' : 'var(--text-muted)' }} />
            <span>{tab.label}</span>
          </button>
        );
      })}
    </aside>
  );
}
