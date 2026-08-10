import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { AdminAuth } from '../components/AdminAuth';
import { GraduationCap, Shield, Users, Sparkles, CheckCircle, Phone, Lock, Mail, UserCheck } from '../components/Icons';

export function LoginSignup({ onSuccess, initialMode = 'login', onOpenAdminAuth, onSwitchMode }) {
  const { login, register } = useAuth();
  const [isLogin, setIsLogin] = useState(initialMode === 'login');
  const [showAdminAuth, setShowAdminAuth] = useState(false);
  const [role, setRole] = useState('student');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    qualification: '',
    bio: '',
    agreedToTerms: false
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  if (showAdminAuth) {
    return (
      <AdminAuth
        onSuccess={onSuccess}
        onSwitchToUserAuth={() => setShowAdminAuth(false)}
      />
    );
  }

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!isLogin) {
      if (!formData.name.trim() || !formData.email.trim() || !formData.password.trim() || !formData.phone.trim()) {
        setError('All fields are mandatory to fill in.');
        return;
      }
      if (role === 'teacher' && !formData.qualification.trim()) {
        setError('Qualification is mandatory for Teacher registration.');
        return;
      }
      if (!formData.agreedToTerms) {
        setError('You must agree to the Terms of Service & Privacy Policy to register.');
        return;
      }

      // Name: should be at least 4 letters
      const nameLettersCount = formData.name.trim().replace(/[^a-zA-Z]/g, '').length;
      if (nameLettersCount < 4) {
        setError('The name should contain at least 4 letters.');
        return;
      }

      // Email: must be valid
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email.trim())) {
        setError('Please enter a valid email address.');
        return;
      }

      // Password: must be at least 8 characters
      if (formData.password.length < 8) {
        setError('The password must be at least 8 characters long.');
        return;
      }

      // Phone: exactly 10 digits
      const phoneRegex = /^\d{10}$/;
      if (!phoneRegex.test(formData.phone.trim())) {
        setError('The mobile number must be exactly 10 digits.');
        return;
      }
    } else {
      if (!formData.email.trim() || !formData.password.trim()) {
        setError('Please fill in both email and password.');
        return;
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email.trim())) {
        setError('Please enter a valid email address.');
        return;
      }
    }

    setLoading(true);

    try {
      if (isLogin) {
        await login(formData.email, formData.password);
        if (onSuccess) onSuccess();
      } else {
        await register({ ...formData, role });
        setSuccess('Registration successful! Click "Sign In" below to log in with your credentials.');
        setIsLogin(true);
        if (onSwitchMode) onSwitchMode('login');
      }
    } catch (err) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '480px', margin: '0 auto', fontFamily: 'inherit' }}>

      {/* Auth Tabs: Login vs Register */}
      <div style={{ display: 'flex', borderBottom: '1px solid var(--border-color)', marginBottom: '1.5rem' }}>
        <button
          type="button"
          onClick={() => { setIsLogin(true); setError(''); setSuccess(''); if (onSwitchMode) onSwitchMode('login'); }}
          style={{
            flex: 1,
            padding: '0.85rem',
            background: 'none',
            color: isLogin ? 'var(--primary)' : 'var(--text-muted)',
            borderBottom: isLogin ? '2px solid var(--primary)' : 'none',
            fontWeight: isLogin ? 800 : 500,
            fontSize: '1rem',
            cursor: 'pointer'
          }}
        >
          Login
        </button>
        <button
          type="button"
          onClick={() => { setIsLogin(false); setError(''); setSuccess(''); if (onSwitchMode) onSwitchMode('register'); }}
          style={{
            flex: 1,
            padding: '0.85rem',
            background: 'none',
            color: !isLogin ? 'var(--primary)' : 'var(--text-muted)',
            borderBottom: !isLogin ? '2px solid var(--primary)' : 'none',
            fontWeight: !isLogin ? 800 : 500,
            fontSize: '1rem',
            cursor: 'pointer'
          }}
        >
          Register Account
        </button>
      </div>

      {success && (
        <div style={{
          backgroundColor: 'rgba(16, 185, 129, 0.15)',
          color: '#34d399',
          border: '1px solid rgba(16, 185, 129, 0.3)',
          padding: '0.75rem',
          borderRadius: 'var(--radius-sm)',
          marginBottom: '1rem',
          fontSize: '0.88rem'
        }}>
          {success}
        </div>
      )}

      {error && (
        <div style={{
          backgroundColor: 'rgba(239, 68, 68, 0.15)',
          color: '#f87171',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          padding: '0.75rem',
          borderRadius: 'var(--radius-sm)',
          marginBottom: '1rem',
          fontSize: '0.88rem'
        }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} onDoubleClick={(e) => e.preventDefault()} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {!isLogin && (
          <>
            {/* Role Selection: Student / Teacher */}
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.4rem', color: 'var(--text-main)' }}>
                Select Role (Student / Teacher) *
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <button
                  type="button"
                  onClick={() => setRole('student')}
                  style={{
                    padding: '0.75rem 0.5rem',
                    borderRadius: 'var(--radius-sm)',
                    border: role === 'student' ? '2px solid #3b82f6' : '1px solid var(--border-color)',
                    backgroundColor: role === 'student' ? 'rgba(59, 130, 246, 0.12)' : 'var(--bg-glass)',
                    color: role === 'student' ? '#3b82f6' : 'var(--text-muted)',
                    fontWeight: 700,
                    fontSize: '0.9rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.4rem',
                    cursor: 'pointer'
                  }}
                >
                  🎓 Student
                </button>
                <button
                  type="button"
                  onClick={() => setRole('teacher')}
                  style={{
                    padding: '0.75rem 0.5rem',
                    borderRadius: 'var(--radius-sm)',
                    border: role === 'teacher' ? '2px solid #a855f7' : '1px solid var(--border-color)',
                    backgroundColor: role === 'teacher' ? 'rgba(168, 85, 247, 0.12)' : 'var(--bg-glass)',
                    color: role === 'teacher' ? '#a855f7' : 'var(--text-muted)',
                    fontWeight: 700,
                    fontSize: '0.9rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.4rem',
                    cursor: 'pointer'
                  }}
                >
                  👩‍🏫 Teacher
                </button>
              </div>
            </div>

            {/* Name */}
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem', color: 'var(--text-muted)' }}>
                Full Name *
              </label>
              <input 
                type="text" 
                name="name" 
                required 
                placeholder="Enter Your Name :" 
                value={formData.name} 
                onChange={handleChange} 
              />
            </div>
          </>
        )}

        {/* Email */}
        <div>
          <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem', color: 'var(--text-muted)' }}>
            Email Address *
          </label>
          <input 
            type="email" 
            name="email" 
            required 
            placeholder="Enter Your Email : " 
            value={formData.email} 
            onChange={handleChange} 
          />
        </div>

        {/* Password */}
        <div>
          <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem', color: 'var(--text-muted)' }}>
            Password *
          </label>
          <input 
            type="password" 
            name="password" 
            required 
            placeholder="Enter Your Password" 
            value={formData.password} 
            onChange={handleChange} 
          />
        </div>

        {!isLogin && (
          <>
            {/* Mobile Number */}
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem', color: 'var(--text-muted)' }}>
                Mobile Number *
              </label>
              <input 
                type="tel" 
                name="phone" 
                required 
                placeholder="EnterYour mobile number" 
                value={formData.phone} 
                onChange={handleChange} 
              />
            </div>

            {/* Qualification if Teacher */}
            {role === 'teacher' && (
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem', color: 'var(--text-muted)' }}>
                  Qualification / Highest Degree
                </label>
                <input 
                  type="text" 
                  name="qualification" 
                  placeholder="Enter Your qualification" 
                  value={formData.qualification} 
                  onChange={handleChange} 
                />
              </div>
            )}

            {/* Checkbox: Terms & Agreement */}
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem', marginTop: '0.3rem' }}>
              <input
                type="checkbox"
                id="user-terms"
                name="agreedToTerms"
                checked={formData.agreedToTerms}
                onChange={handleChange}
                style={{ width: '18px', height: '18px', marginTop: '0.15rem', cursor: 'pointer' }}
              />
              <label htmlFor="user-terms" style={{ fontSize: '0.82rem', color: 'var(--text-main)', cursor: 'pointer', lineHeight: 1.4 }}>
                I agree to the <strong>Terms of Service & Privacy Policy</strong> of BK Teaching Center.
              </label>
            </div>
          </>
        )}

        <button 
          type="submit" 
          className="btn-primary" 
          onDoubleClick={(e) => e.preventDefault()}
          style={{ width: '100%', justifyContent: 'center', padding: '0.85rem', marginTop: '0.5rem', backgroundColor: '#3b82f6', borderColor: '#3b82f6' }} 
          disabled={loading}
        >
          {loading ? 'Processing...' : isLogin ? 'Sign In' : `Create ${role === 'teacher' ? 'Teacher' : 'Student'} Account`}
        </button>
      </form>

      {/* Switch to Admin Portal Link */}
      <div style={{ textAlign: 'center', marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
        <button
          type="button"
          onClick={() => {
            if (onOpenAdminAuth) onOpenAdminAuth();
            else setShowAdminAuth(true);
          }}
          style={{
            background: 'none',
            border: 'none',
            color: '#f59e0b',
            fontSize: '0.85rem',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.35rem'
          }}
        >
          <Shield size={15} /> Access Admin Portal Login →
        </button>
      </div>
    </div>
  );
}

