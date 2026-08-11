import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Shield } from './Icons';

export function AdminAuth({ onSuccess, onSwitchToUserAuth }) {
  const { adminLogin } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [fieldErrors, setFieldErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const validate = (data) => {
    const errors = {};
    const cleanEmail = (data.email || '').trim();
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!cleanEmail) {
      errors.email = 'Admin email address is required.';
    } else if (!emailRegex.test(cleanEmail)) {
      errors.email = 'Please enter a valid email address (e.g. admin@bkteachingcenter.com).';
    }

    if (!data.password) {
      errors.password = 'Password is required.';
    }

    return errors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const updatedFormData = { ...formData, [name]: value };
    setFormData(updatedFormData);
    setError('');

    // Real-time validation
    setTouched(prev => ({ ...prev, [name]: true }));
    const errors = validate(updatedFormData);
    setFieldErrors(prev => ({ ...prev, [name]: errors[name] || '' }));
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    const errors = validate({ ...formData, [name]: value });
    setFieldErrors(prev => ({ ...prev, [name]: errors[name] || '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    setTouched({ email: true, password: true });
    const errors = validate(formData);
    setFieldErrors(errors);

    if (Object.keys(errors).length > 0) {
      const firstError = Object.values(errors)[0];
      setError(firstError || 'Please provide valid admin credentials.');
      return;
    }

    setLoading(true);

    try {
      const cleanEmail = formData.email.trim().toLowerCase();
      await adminLogin(cleanEmail, formData.password);
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err.message || 'Admin authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '480px', margin: '0 auto', fontFamily: 'inherit' }}>
      {/* Admin Portal Header Banner */}
      <div style={{
        backgroundColor: 'rgba(245, 158, 11, 0.1)',
        border: '1px solid rgba(245, 158, 11, 0.3)',
        borderRadius: 'var(--radius-md)',
        padding: '1.2rem',
        marginBottom: '1.5rem',
        textAlign: 'center'
      }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.5rem',
          color: '#f59e0b',
          fontWeight: 800,
          fontSize: '0.95rem',
          letterSpacing: '0.04em',
          textTransform: 'uppercase',
          marginBottom: '0.35rem'
        }}>
          <Shield size={20} /> Dedicated Admin Portal
        </div>
        <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.45 }}>
          Restricted access gate for system administration. Public Admin registration is disabled; only the single pre-configured Administrator can log in.
        </p>
      </div>

      <div style={{
        textAlign: 'center',
        marginBottom: '1.5rem',
        borderBottom: '2px solid #f59e0b',
        paddingBottom: '0.5rem',
        color: '#f59e0b',
        fontWeight: 800,
        fontSize: '1.1rem'
      }}>
        Administrator Login
      </div>

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

      <form onSubmit={handleSubmit} noValidate onDoubleClick={(e) => e.preventDefault()} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: (touched.email && fieldErrors.email) ? '#ef4444' : 'var(--text-muted)' }}>
              Admin Email Address *
            </label>
            {formData.email && !fieldErrors.email && (
              <span style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 600 }}>✓ Valid Format</span>
            )}
          </div>
          <input
            type="email"
            name="email"
            required
            placeholder="admin@bkteachingcenter.com"
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

        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: (touched.password && fieldErrors.password) ? '#ef4444' : 'var(--text-muted)' }}>
              Password *
            </label>
          </div>
          <input
            type="password"
            name="password"
            required
            placeholder="••••••••"
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

        <button
          type="submit"
          className="btn-primary"
          onDoubleClick={(e) => e.preventDefault()}
          style={{
            width: '100%',
            justifyContent: 'center',
            padding: '0.85rem',
            marginTop: '0.5rem',
            backgroundColor: '#f59e0b',
            borderColor: '#f59e0b',
            color: '#111',
            fontWeight: 800
          }}
          disabled={loading}
        >
          {loading ? 'Authenticating Admin...' : 'Sign In as Administrator'}
        </button>
      </form>

      {/* Switch to Regular User Auth Link */}
      <div style={{ textAlign: 'center', marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
        <button
          type="button"
          onClick={onSwitchToUserAuth}
          style={{
            background: 'none',
            border: 'none',
            color: '#3b82f6',
            fontSize: '0.88rem',
            fontWeight: 600,
            cursor: 'pointer',
            textDecoration: 'underline'
          }}
        >
          ← Switch to Student / Teacher Portal
        </button>
      </div>
    </div>
  );
}
