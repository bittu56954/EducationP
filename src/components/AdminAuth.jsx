import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Shield } from './Icons';

export function AdminAuth({ onSuccess, onSwitchToUserAuth }) {
  const { adminLogin } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.email.trim() || !formData.password.trim()) {
      setError('All fields are mandatory. Please enter both email and password.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email.trim())) {
      setError('Please enter a valid email address.');
      return;
    }

    setLoading(true);

    try {
      await adminLogin(formData.email, formData.password);
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

      <form onSubmit={handleSubmit} onDoubleClick={(e) => e.preventDefault()} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div>
          <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem', color: 'var(--text-muted)' }}>
            Admin Email Address *
          </label>
          <input
            type="email"
            name="email"
            required
            placeholder="admin@bkteachingcenter.com"
            value={formData.email}
            onChange={handleChange}
          />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem', color: 'var(--text-muted)' }}>
            Password *
          </label>
          <input
            type="password"
            name="password"
            required
            placeholder="••••••••"
            value={formData.password}
            onChange={handleChange}
          />
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
