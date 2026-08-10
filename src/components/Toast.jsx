import React, { useEffect } from 'react';
import { CheckCircle, XCircle } from './Icons';

export function Toast({ message, type = 'success', onClose }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const isSuccess = type === 'success';

  return (
    <div style={{
      position: 'fixed',
      bottom: '1.5rem',
      right: '1.5rem',
      backgroundColor: isSuccess ? 'rgba(16, 185, 129, 0.95)' : 'rgba(239, 68, 68, 0.95)',
      color: '#ffffff',
      padding: '0.85rem 1.25rem',
      borderRadius: 'var(--radius-sm)',
      boxShadow: '0 10px 25px rgba(0,0,0,0.3)',
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
      zIndex: 2000,
      fontWeight: 500,
      fontSize: '0.92rem'
    }}>
      {isSuccess ? <CheckCircle size={20} /> : <XCircle size={20} />}
      <span>{message}</span>
    </div>
  );
}
