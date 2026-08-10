import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { GraduationCap, Bell, LogOut, Sun, Moon, Menu, X, BookOpen, UserCheck, ShieldCheck } from './Icons';

export function Navbar({ onOpenAuth, onOpenDemoModal, currentView = 'home', setCurrentView, theme = 'dark', toggleTheme }) {
  const { user, logout } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (user) {
      api.getNotifications()
        .then(res => setNotifications(res.notifications || []))
        .catch(err => console.error('Failed to load notifications:', err));
    }
  }, [user]);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const handleNavClick = (view, authMode = 'login') => {
    if (view === 'login' || view === 'register') {
      if (onOpenAuth) {
        onOpenAuth(authMode);
      } else if (setCurrentView) {
        setCurrentView(view);
      }
    } else if (setCurrentView) {
      setCurrentView(view);
    }
    setMobileMenuOpen(false);
  };

  const navItems = [
    { id: 'home', label: 'Home' },
    { id: 'about', label: 'About' },
    { id: 'contact', label: 'Contact' },
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'courses', label: 'Courses' },
    { id: 'teachers', label: 'Teachers' },
    { id: 'online-class', label: 'Online Class' }
  ];

  return (
    <nav style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      height: '4.8rem',
      backgroundColor: theme === 'dark' ? 'rgba(9, 13, 22, 0.95)' : 'rgba(255, 255, 255, 0.96)',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      borderBottom: '1px solid var(--border-color)',
      zIndex: 1000,
      display: 'flex',
      alignItems: 'center',
      padding: '0 1.2rem',
      transition: 'all 0.3s ease'
    }}>
      <div style={{
        maxWidth: '1280px',
        width: '100%',
        margin: '0 auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        {/* BK Teaching Center Professional Logo */}
        <button
          onClick={() => handleNavClick('home')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.8rem',
            background: 'none',
            border: 'none',
            padding: 0,
            textAlign: 'left',
            cursor: 'pointer'
          }}
        >
          {/* Enhanced Professional Logo Crest Icon */}
          <div style={{
            position: 'relative',
            width: '2.8rem',
            height: '2.8rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            {/* Outer Orbit Pulse */}
            <div style={{
              position: 'absolute',
              inset: '-4px',
              borderRadius: '12px',
              background: 'radial-gradient(circle, rgba(59, 130, 246, 0.3) 0%, transparent 70%)',
              animation: 'pulse 2.5s infinite ease-in-out'
            }} />
            
            {/* Squircle with high-end tech gradient */}
            <div style={{
              width: '100%',
              height: '100%',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #2563eb 0%, #ff6d0a 100%)',
              padding: '2px',
              boxShadow: '0 4px 16px rgba(37, 99, 235, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <div style={{
                width: '100%',
                height: '100%',
                borderRadius: '10px',
                backgroundColor: theme === 'dark' ? '#090d16' : '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#2563eb' }}>
                  <path d="M22 10v6M2 10l10-5 10 5-10 5z"></path>
                  <path d="M6 12v5c3 3 9 3 12 0v-5"></path>
                </svg>
              </div>
            </div>
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <span style={{
                fontSize: '1.25rem',
                fontWeight: 900,
                color: 'var(--text-main)',
                letterSpacing: '-0.03em',
                lineHeight: 1
              }}>
                BK <span style={{ color: '#2563eb' }}>TEACHING</span>
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.15rem' }}>
              <span style={{
                fontSize: '0.62rem',
                color: '#ff6d0a',
                fontWeight: 800,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.2rem'
              }}>
                <span style={{ width: '4px', height: '4px', borderRadius: '50%', backgroundColor: '#ff6d0a' }} />
                TECH PLATFORM
              </span>
            </div>
          </div>
        </button>

        {/* Desktop Nav Items (Only requested 9 items) */}
        <div className="desktop-nav" style={{ display: 'flex', alignItems: 'center', gap: '1.1rem' }}>
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              style={{
                background: 'none',
                border: 'none',
                padding: '0.4rem 0.6rem',
                fontSize: '0.9rem',
                fontWeight: currentView === item.id ? 800 : 600,
                color: currentView === item.id ? '#3b82f6' : 'var(--text-main)',
                cursor: 'pointer',
                borderBottom: currentView === item.id ? '2px solid #3b82f6' : '2px solid transparent',
                transition: 'all 0.2s ease'
              }}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Action Buttons: Theme Toggle + Login + Register / User Badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            aria-label="Toggle theme"
            style={{
              background: 'rgba(255, 255, 255, 0.06)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-main)',
              width: '2.4rem',
              height: '2.4rem',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer'
            }}
          >
            {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
          </button>

          {/* User Status / Login & Register Buttons */}
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <button
                onClick={() => handleNavClick('dashboard')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  background: 'rgba(59, 130, 246, 0.1)',
                  border: '1px solid rgba(59, 130, 246, 0.3)',
                  padding: '0.45rem 0.8rem',
                  borderRadius: '10px',
                  color: '#3b82f6',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  cursor: 'pointer'
                }}
              >
                {user.name} ({user.role})
              </button>
              <button
                onClick={logout}
                title="Logout"
                style={{
                  background: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.2)',
                  color: '#ef4444',
                  width: '2.4rem',
                  height: '2.4rem',
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer'
                }}
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <div className="desktop-auth-btns" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <button
                onClick={() => handleNavClick('login', 'login')}
                className="curious-btn-outline"
                style={{ padding: '0.45rem 0.8rem', fontSize: '0.85rem', borderRadius: '9px' }}
              >
                Login
              </button>
              <button
                onClick={() => handleNavClick('register', 'register')}
                className="curious-btn-primary"
                style={{ padding: '0.45rem 0.8rem', fontSize: '0.85rem', borderRadius: '9px', backgroundColor: '#3b82f6', borderColor: '#3b82f6' }}
              >
                Register
              </button>
              <button
                onClick={() => handleNavClick('admin-auth', 'admin')}
                style={{
                  padding: '0.45rem 0.8rem',
                  fontSize: '0.82rem',
                  borderRadius: '9px',
                  backgroundColor: 'rgba(245, 158, 11, 0.12)',
                  border: '1px solid rgba(245, 158, 11, 0.4)',
                  color: '#f59e0b',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem'
                }}
              >
                <ShieldCheck size={14} /> Admin Portal
              </button>
            </div>
          )}

          {/* Mobile Hamburger Toggle Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="mobile-hamburger-btn"
            aria-label="Toggle menu"
            style={{
              background: 'rgba(255, 255, 255, 0.06)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-main)',
              width: '2.5rem',
              height: '2.5rem',
              borderRadius: '10px',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer'
            }}
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Responsive Navigation Drawer */}
      {mobileMenuOpen && (
        <div style={{
          position: 'fixed',
          top: '4.8rem',
          left: 0,
          right: 0,
          backgroundColor: theme === 'dark' ? '#090d16' : '#ffffff',
          borderBottom: '1px solid var(--border-color)',
          padding: '1.5rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.8rem',
          boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
          zIndex: 999
        }}>
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              style={{
                padding: '0.75rem 1rem',
                borderRadius: '10px',
                textAlign: 'left',
                background: currentView === item.id ? 'rgba(59, 130, 246, 0.12)' : 'transparent',
                color: currentView === item.id ? '#3b82f6' : 'var(--text-main)',
                fontWeight: currentView === item.id ? 800 : 600,
                fontSize: '1rem',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              {item.label}
            </button>
          ))}

          {!user && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem', marginTop: '0.8rem', paddingTop: '0.8rem', borderTop: '1px solid var(--border-color)' }}>
              <button
                onClick={() => handleNavClick('login', 'login')}
                className="curious-btn-outline"
                style={{ padding: '0.75rem', fontSize: '0.9rem', width: '100%' }}
              >
                Login
              </button>
              <button
                onClick={() => handleNavClick('register', 'register')}
                className="curious-btn-primary"
                style={{ padding: '0.75rem', fontSize: '0.9rem', width: '100%', backgroundColor: '#3b82f6' }}
              >
                Register
              </button>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
