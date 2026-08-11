import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { AdminAuth } from '../components/AdminAuth';
import { GraduationCap, Shield, Users, Sparkles, CheckCircle, Phone, Lock, Mail, UserCheck, AlertCircle } from '../components/Icons';

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
  
  const [fieldErrors, setFieldErrors] = useState({});
  const [touched, setTouched] = useState({});
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

  // Pure validation function across all fields
  const validate = (data, isLoginMode, currentRole) => {
    const errors = {};

    // Email Validation
    const cleanEmail = (data.email || '').trim();
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!cleanEmail) {
      errors.email = 'Email address is required.';
    } else if (!emailRegex.test(cleanEmail)) {
      errors.email = 'Please enter a valid email address (e.g. name@example.com).';
    }

    // Password Validation
    const password = data.password || '';
    if (!password) {
      errors.password = 'Password is required.';
    } else if (!isLoginMode && password.length < 8) {
      errors.password = `Password must be at least 8 characters long (currently ${password.length}/8).`;
    }

    // Registration-only fields
    if (!isLoginMode) {
      // Name Validation
      const name = (data.name || '').trim();
      const nameLettersCount = name.replace(/[^a-zA-Z]/g, '').length;
      if (!name) {
        errors.name = 'Full Name is required.';
      } else if (nameLettersCount < 4) {
        errors.name = `Name must contain at least 4 letters (currently ${nameLettersCount}/4).`;
      }

      // Phone Validation (Strictly 10 digits check)
      const phone = (data.phone || '').trim();
      if (!phone) {
        errors.phone = 'Mobile number is required.';
      } else if (/[^\d]/.test(phone)) {
        errors.phone = 'Mobile number can only contain digits (0-9).';
      } else if (phone.length > 10) {
        errors.phone = `Mobile number cannot exceed 10 digits (currently ${phone.length} digits entered).`;
      } else if (phone.length < 10) {
        errors.phone = `Mobile number must be exactly 10 digits (currently ${phone.length}/10 digits).`;
      }

      // Teacher Qualification
      if (currentRole === 'teacher') {
        const qual = (data.qualification || '').trim();
        if (!qual) {
          errors.qualification = 'Qualification / Highest Degree is mandatory for Teacher registration.';
        }
      }

      // Terms of Service agreement
      if (!data.agreedToTerms) {
        errors.agreedToTerms = 'You must agree to the Terms of Service & Privacy Policy to register.';
      }
    }

    return errors;
  };

  const validateSingleField = (name, value, currentFormData, isLoginMode, currentRole) => {
    const tempData = { ...currentFormData, [name]: value };
    const allErrors = validate(tempData, isLoginMode, currentRole);
    return allErrors[name] || '';
  };

  const handleChange = (e) => {
    const { name, type } = e.target;
    let value = type === 'checkbox' ? e.target.checked : e.target.value;

    const updatedFormData = { ...formData, [name]: value };
    setFormData(updatedFormData);
    setError('');

    // Mark as touched and immediately validate in real-time
    setTouched(prev => ({ ...prev, [name]: true }));
    const errorMsg = validateSingleField(name, value, updatedFormData, isLogin, role);
    setFieldErrors(prev => ({ ...prev, [name]: errorMsg }));
  };

  const handleBlur = (e) => {
    const { name, type } = e.target;
    const value = type === 'checkbox' ? e.target.checked : e.target.value;
    setTouched(prev => ({ ...prev, [name]: true }));
    const errorMsg = validateSingleField(name, value, formData, isLogin, role);
    setFieldErrors(prev => ({ ...prev, [name]: errorMsg }));
  };

  const handleSwitchMode = (modeIsLogin) => {
    setIsLogin(modeIsLogin);
    setError('');
    setSuccess('');
    setFieldErrors({});
    setTouched({});
    if (onSwitchMode) onSwitchMode(modeIsLogin ? 'login' : 'register');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Mark all fields as touched to display all red errors at once
    setTouched({
      name: true,
      email: true,
      password: true,
      phone: true,
      qualification: true,
      agreedToTerms: true
    });

    const validationErrors = validate(formData, isLogin, role);
    setFieldErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      const firstErrorMessage = Object.values(validationErrors)[0];
      setError(firstErrorMessage || 'Please fix all highlighted errors before submitting.');
      return;
    }

    setLoading(true);

    try {
      const cleanEmail = formData.email.trim().toLowerCase();
      if (isLogin) {
        await login(cleanEmail, formData.password);
        if (onSuccess) onSuccess();
      } else {
        await register({
          ...formData,
          email: cleanEmail,
          name: formData.name.trim(),
          phone: formData.phone.trim(),
          role
        });
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
          onClick={() => handleSwitchMode(true)}
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
          onClick={() => handleSwitchMode(false)}
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
          <div style={{ marginBottom: (error.includes('already registered') || error.includes('No account found')) ? '0.5rem' : 0 }}>
            {error}
          </div>
          {error.includes('already registered') && (
            <button
              type="button"
              onClick={() => {
                handleSwitchMode(true);
              }}
              style={{
                background: 'rgba(59, 130, 246, 0.2)',
                color: '#60a5fa',
                border: '1px solid #3b82f6',
                borderRadius: '4px',
                padding: '0.35rem 0.7rem',
                fontSize: '0.82rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'inline-block'
              }}
            >
              👉 Switch to Login with this email
            </button>
          )}
          {error.includes('No account found') && (
            <button
              type="button"
              onClick={() => {
                handleSwitchMode(false);
              }}
              style={{
                background: 'rgba(168, 85, 247, 0.2)',
                color: '#c084fc',
                border: '1px solid #a855f7',
                borderRadius: '4px',
                padding: '0.35rem 0.7rem',
                fontSize: '0.82rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'inline-block'
              }}
            >
              👉 Register a new account with this email
            </button>
          )}
        </div>
      )}

      {/* Info notice about 1-account-per-email policy */}
      <div style={{
        backgroundColor: isLogin ? 'rgba(59, 130, 246, 0.08)' : 'rgba(168, 85, 247, 0.08)',
        border: `1px solid ${isLogin ? 'rgba(59, 130, 246, 0.2)' : 'rgba(168, 85, 247, 0.2)'}`,
        borderRadius: 'var(--radius-sm)',
        padding: '0.6rem 0.8rem',
        marginBottom: '1rem',
        fontSize: '0.8rem',
        color: 'var(--text-muted)',
        lineHeight: 1.4
      }}>
        {isLogin ? (
          <span>🔑 <strong>Always sign in</strong> using the same email address and password you used when registering.</span>
        ) : (
          <span>🛡️ <strong>Single Registration Policy:</strong> Each email address can be registered only once in the system.</span>
        )}
      </div>

      <form onSubmit={handleSubmit} noValidate onDoubleClick={(e) => e.preventDefault()} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
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
                  onClick={() => {
                    setRole('student');
                    setFieldErrors(prev => ({ ...prev, qualification: '' }));
                  }}
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
                  onClick={() => {
                    setRole('teacher');
                    if (touched.qualification && !formData.qualification.trim()) {
                      setFieldErrors(prev => ({ ...prev, qualification: 'Qualification / Highest Degree is mandatory for Teacher registration.' }));
                    }
                  }}
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
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: (touched.name && fieldErrors.name) ? '#ef4444' : 'var(--text-muted)' }}>
                  Full Name *
                </label>
                {formData.name.trim().replace(/[^a-zA-Z]/g, '').length >= 4 && !fieldErrors.name && (
                  <span style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 600 }}>✓ Valid Name</span>
                )}
              </div>
              <input 
                type="text" 
                name="name" 
                required 
                placeholder="Enter Your Name (min 4 letters)" 
                value={formData.name} 
                onChange={handleChange}
                onBlur={handleBlur}
                className={(touched.name && fieldErrors.name) ? 'input-field-error' : ''}
              />
              {touched.name && fieldErrors.name && (
                <div className="field-error-msg">
                  <span>⚠️</span>
                  <span>{fieldErrors.name}</span>
                </div>
              )}
            </div>
          </>
        )}

        {/* Email */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: (touched.email && fieldErrors.email) ? '#ef4444' : 'var(--text-muted)' }}>
              Email Address *
            </label>
            {formData.email && !fieldErrors.email && (
              <span style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 600 }}>✓ Valid Email</span>
            )}
          </div>
          <input 
            type="email" 
            name="email" 
            required 
            placeholder="Enter Your Email (e.g. name@example.com)" 
            value={formData.email} 
            onChange={handleChange}
            onBlur={handleBlur}
            className={(touched.email && fieldErrors.email) ? 'input-field-error' : ''}
          />
          {touched.email && fieldErrors.email && (
            <div className="field-error-msg">
              <span>⚠️</span>
              <span>{fieldErrors.email}</span>
            </div>
          )}
        </div>

        {/* Password */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: (touched.password && fieldErrors.password) ? '#ef4444' : 'var(--text-muted)' }}>
              Password *
            </label>
            {!isLogin && (
              <span style={{
                fontSize: '0.75rem',
                fontWeight: 600,
                color: formData.password.length >= 8 ? '#10b981' : formData.password.length > 0 ? '#f59e0b' : 'var(--text-dim)'
              }}>
                {formData.password.length >= 8 ? '✓ Strong (8+ chars)' : `${formData.password.length}/8 chars min`}
              </span>
            )}
          </div>
          <input 
            type="password" 
            name="password" 
            required 
            placeholder={isLogin ? "Enter Your Password" : "Create a password (min 8 characters)"}
            value={formData.password} 
            onChange={handleChange}
            onBlur={handleBlur}
            className={(touched.password && fieldErrors.password) ? 'input-field-error' : ''}
          />
          {touched.password && fieldErrors.password && (
            <div className="field-error-msg">
              <span>⚠️</span>
              <span>{fieldErrors.password}</span>
            </div>
          )}
        </div>

        {!isLogin && (
          <>
            {/* Mobile Number */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: (touched.phone && fieldErrors.phone) ? '#ef4444' : 'var(--text-muted)' }}>
                  Mobile Number (10 Digits) *
                </label>
                <span style={{
                  fontSize: '0.74rem',
                  fontWeight: 700,
                  padding: '0.12rem 0.45rem',
                  borderRadius: '4px',
                  backgroundColor: formData.phone.length === 10 && /^\d{10}$/.test(formData.phone)
                    ? 'rgba(16, 185, 129, 0.15)'
                    : formData.phone.length > 10
                    ? 'rgba(239, 68, 68, 0.2)'
                    : 'rgba(255, 255, 255, 0.08)',
                  color: formData.phone.length === 10 && /^\d{10}$/.test(formData.phone)
                    ? '#34d399'
                    : formData.phone.length > 10
                    ? '#ef4444'
                    : 'var(--text-muted)'
                }}>
                  {formData.phone.length === 10 && /^\d{10}$/.test(formData.phone)
                    ? '✓ 10 Digits'
                    : formData.phone.length > 10
                    ? `⚠️ ${formData.phone.length}/10 (Exceeds 10 digits)`
                    : `${formData.phone.length}/10 Digits`}
                </span>
              </div>
              <input 
                type="tel" 
                name="phone" 
                required 
                placeholder="Enter 10-digit mobile number (e.g. 9876543210)" 
                value={formData.phone} 
                onChange={handleChange}
                onBlur={handleBlur}
                className={(touched.phone && fieldErrors.phone) ? 'input-field-error' : ''}
              />
              {touched.phone && fieldErrors.phone && (
                <div className="field-error-msg">
                  <span>⚠️</span>
                  <span>{fieldErrors.phone}</span>
                </div>
              )}
            </div>

            {/* Qualification if Teacher */}
            {role === 'teacher' && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: 600, color: (touched.qualification && fieldErrors.qualification) ? '#ef4444' : 'var(--text-muted)' }}>
                    Qualification / Highest Degree *
                  </label>
                  {formData.qualification.trim() && (
                    <span style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 600 }}>✓ Added</span>
                  )}
                </div>
                <input 
                  type="text" 
                  name="qualification" 
                  placeholder="e.g. M.Sc. Mathematics, B.Tech, Ph.D." 
                  value={formData.qualification} 
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={(touched.qualification && fieldErrors.qualification) ? 'input-field-error' : ''}
                />
                {touched.qualification && fieldErrors.qualification && (
                  <div className="field-error-msg">
                    <span>⚠️</span>
                    <span>{fieldErrors.qualification}</span>
                  </div>
                )}
              </div>
            )}

            {/* Checkbox: Terms & Agreement */}
            <div>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem', marginTop: '0.3rem' }}>
                <input
                  type="checkbox"
                  id="user-terms"
                  name="agreedToTerms"
                  checked={formData.agreedToTerms}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  style={{ width: '18px', height: '18px', marginTop: '0.15rem', cursor: 'pointer' }}
                />
                <label htmlFor="user-terms" style={{ fontSize: '0.82rem', color: (touched.agreedToTerms && fieldErrors.agreedToTerms) ? '#ef4444' : 'var(--text-main)', cursor: 'pointer', lineHeight: 1.4 }}>
                  I agree to the <strong>Terms of Service & Privacy Policy</strong> of BK Teaching Center.
                </label>
              </div>
              {touched.agreedToTerms && fieldErrors.agreedToTerms && (
                <div className="field-error-msg" style={{ marginLeft: '1.8rem', marginTop: '0.25rem' }}>
                  <span>⚠️</span>
                  <span>{fieldErrors.agreedToTerms}</span>
                </div>
              )}
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
