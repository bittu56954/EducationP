import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { Footer } from './components/Footer';
import { Modal } from './components/Modal';
import { Toast } from './components/Toast';
import { BookDemoModal } from './components/BookDemoModal';
import { AdminAuth } from './components/AdminAuth';
import { PaymentCheckoutModal } from './components/PaymentCheckoutModal';

import { LandingPage } from './pages/LandingPage';
import { AboutPage } from './pages/AboutPage';
import { ContactPage } from './pages/ContactPage';
import { OnlineClassPage } from './pages/OnlineClassPage';
import { CoursesPage } from './pages/CoursesPage';
import { TeachersPage } from './pages/TeachersPage';
import { LoginSignup } from './pages/LoginSignup';
import { StudentDashboard } from './pages/StudentDashboard';
import { TeacherDashboard } from './pages/TeacherDashboard';
import { AdminDashboard } from './pages/AdminDashboard';
import { api } from './services/api';

function MainApp() {
  const { user, loading } = useAuth();
  
  // Navigation & View Routing State
  // Views: 'home' | 'about' | 'contact' | 'dashboard' | 'courses' | 'teachers' | 'online-class' | 'login' | 'register' | 'admin-auth'
  const [currentView, setCurrentView] = useState('home');
  const [activeTab, setActiveTab] = useState('enrolled');
  
  // Theme State
  const [theme, setTheme] = useState(() => localStorage.getItem('bktc_theme') || 'dark');
  
  // Auth Modal State
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState('login'); // 'login' | 'register' | 'admin'
  const [toast, setToast] = useState(null);
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);
  const [checkoutCourse, setCheckoutCourse] = useState(null);

  // Apply Theme Effect
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('bktc_theme', theme);
  }, [theme]);

  // Adjust active Tab based on user role when switching to dashboard
  useEffect(() => {
    if (user) {
      if (user.role === 'teacher') setActiveTab('profile');
      else if (user.role === 'admin') setActiveTab('teachers');
      else setActiveTab('enrolled');
    }
  }, [user]);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-dark)', color: 'var(--text-muted)' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#3b82f6', marginBottom: '0.5rem', letterSpacing: '-0.02em' }}>
            BK TEACHING CENTER
          </div>
          <p style={{ fontSize: '0.9rem' }}>Loading learning platform environment...</p>
        </div>
      </div>
    );
  }

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  const handleOpenAuth = (mode = 'login') => {
    setAuthMode(mode);
    setIsAuthModalOpen(true);
  };

  const handleAuthSuccess = () => {
    setIsAuthModalOpen(false);
    setCurrentView('dashboard');
    setToast({ message: `Welcome to BK TEACHING CENTER, ${user?.name || 'User'}!`, type: 'success' });
  };

  const handleEnrollCourse = (course) => {
    if (!user) {
      setToast({ message: 'Authentication Required: Please log in or register before purchasing this course.', type: 'danger' });
      handleOpenAuth('login');
      return;
    }
    const courseObj = typeof course === 'object' ? course : { _id: course, title: 'Accredited Course', price: 49 };
    setCheckoutCourse(courseObj);
  };

  const handlePaymentSuccess = async (courseId, paymentDetails) => {
    try {
      const res = await api.enroll(courseId, paymentDetails);
      setToast({ message: '🎉 Course Purchased & Access Granted Successfully!', type: 'success' });
      setCurrentView('dashboard');
      setActiveTab('enrolled');
      return res;
    } catch (err) {
      setToast({ message: err.message || 'Payment processing failed', type: 'danger' });
      throw err;
    }
  };

  const handleOpenDemoModal = () => {
    if (!user) {
      setToast({ message: 'Authentication Required: Please log in or register before booking a demo class.', type: 'danger' });
      handleOpenAuth('login');
      return;
    }
    setIsDemoModalOpen(true);
  };

  return (
    <div className="app-container">
      {/* Top Header Navbar */}
      <Navbar 
        onOpenAuth={handleOpenAuth} 
        onOpenDemoModal={handleOpenDemoModal}
        currentView={currentView}
        setCurrentView={(view) => {
          if (view === 'dashboard' && !user) {
            setToast({ message: 'Dashboard Access Restricted: Please log in first.', type: 'danger' });
            handleOpenAuth('login');
            return;
          }
          setCurrentView(view);
        }}
        theme={theme}
        toggleTheme={toggleTheme}
      />

      {/* Main Body Routing */}
      <main className="main-content">
        {currentView === 'dashboard' ? (
          user ? (
            <div className="dashboard-layout" style={{ paddingTop: '4.8rem' }}>
              <Sidebar user={user} activeTab={activeTab} setActiveTab={setActiveTab} />
              <div style={{ flex: 1, backgroundColor: 'var(--bg-glass)', minHeight: 'calc(100vh - 4.5rem)' }}>
                {user.role === 'student' ? (
                  <StudentDashboard activeTab={activeTab} setToast={setToast} />
                ) : user.role === 'teacher' ? (
                  <TeacherDashboard activeTab={activeTab} setToast={setToast} />
                ) : (
                  <AdminDashboard activeTab={activeTab} setToast={setToast} />
                )}
              </div>
            </div>
          ) : (
            <div style={{ paddingTop: '7rem', paddingBottom: '5rem', minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', paddingLeft: '1.5rem', paddingRight: '1.5rem' }}>
              <div style={{ maxWidth: '520px', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '24px', padding: '3.5rem 2rem', boxShadow: '0 20px 40px rgba(0,0,0,0.4)' }}>
                <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>🔒</div>
                <div style={{ display: 'inline-block', backgroundColor: 'rgba(239, 68, 68, 0.12)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.3)', padding: '0.3rem 0.8rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '0.8rem' }}>
                  Restricted Access Gate
                </div>
                <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.8rem' }}>
                  Dashboard Is Protected
                </h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: '2rem', lineHeight: 1.6 }}>
                  Please log in to access your classroom, enrolled courses, and grade reports. If you don't have an account yet, create one in seconds.
                </p>
                <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                  <button onClick={() => handleOpenAuth('login')} className="curious-btn-primary" style={{ padding: '0.8rem 1.6rem', backgroundColor: '#3b82f6', borderColor: '#3b82f6' }}>
                    Login Now
                  </button>
                  <button onClick={() => handleOpenAuth('register')} className="curious-btn-outline" style={{ padding: '0.8rem 1.6rem' }}>
                    Register Account
                  </button>
                  <button onClick={() => handleOpenAuth('admin')} className="curious-btn-outline" style={{ padding: '0.8rem 1.6rem', color: '#f59e0b', borderColor: 'rgba(245,158,11,0.4)' }}>
                    Admin Portal
                  </button>
                </div>
              </div>
            </div>
          )
        ) : currentView === 'about' ? (
          <AboutPage onOpenAuth={handleOpenAuth} setCurrentView={setCurrentView} />
        ) : currentView === 'contact' ? (
          <ContactPage onOpenAuth={handleOpenAuth} setToast={setToast} />
        ) : currentView === 'online-class' ? (
          <OnlineClassPage onOpenAuth={handleOpenAuth} user={user} />
        ) : currentView === 'courses' ? (
          <CoursesPage onOpenAuth={handleOpenAuth} onEnrollCourse={handleEnrollCourse} user={user} />
        ) : currentView === 'teachers' ? (
          <TeachersPage onViewCourse={(course) => handleEnrollCourse(course)} />
        ) : currentView === 'admin-auth' ? (
          <div style={{ paddingTop: '7rem', paddingBottom: '5rem', minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: '100%', maxWidth: '520px', padding: '0 1.5rem' }}>
              <AdminAuth onSuccess={handleAuthSuccess} onSwitchToUserAuth={() => setCurrentView('login')} />
            </div>
          </div>
        ) : currentView === 'login' || currentView === 'register' ? (
          <div style={{ paddingTop: '7rem', paddingBottom: '5rem', minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: '100%', maxWidth: '520px', padding: '0 1.5rem' }}>
              <LoginSignup 
                onSuccess={handleAuthSuccess} 
                initialMode={currentView} 
                onOpenAdminAuth={() => setCurrentView('admin-auth')}
                onSwitchMode={(mode) => setCurrentView(mode)}
              />
            </div>
          </div>
        ) : (
          <LandingPage 
            onOpenAuth={handleOpenAuth} 
            setCurrentView={setCurrentView} 
            user={user} 
            onEnrollCourse={handleEnrollCourse} 
          />
        )}
      </main>

      {/* Main Footer */}
      <Footer setCurrentView={setCurrentView} />

      {/* Global Book Demo Class Modal */}
      <BookDemoModal
        isOpen={isDemoModalOpen}
        onClose={() => setIsDemoModalOpen(false)}
        user={user}
      />

      {/* Authentication Modal */}
      <Modal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
        title={authMode === 'admin' ? "BK TEACHING CENTER - ADMIN PORTAL" : "BK TEACHING CENTER"}
      >
        {authMode === 'admin' ? (
          <AdminAuth 
            onSuccess={handleAuthSuccess} 
            onSwitchToUserAuth={() => setAuthMode('login')} 
          />
        ) : (
          <LoginSignup 
            onSuccess={handleAuthSuccess} 
            initialMode={authMode} 
            onOpenAdminAuth={() => setAuthMode('admin')} 
            onSwitchMode={(mode) => setAuthMode(mode)}
          />
        )}
      </Modal>

      {/* Global Course Payment & Checkout Gateway Modal */}
      <PaymentCheckoutModal
        course={checkoutCourse}
        isOpen={Boolean(checkoutCourse)}
        onClose={() => setCheckoutCourse(null)}
        onPaymentSuccess={handlePaymentSuccess}
        user={user}
      />

      {/* Global Toast Alert */}
      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
