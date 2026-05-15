import React, { useEffect } from 'react';

// toast tipleri: success, error, info, warning
const Toast = ({ message, type = 'info', onClose, duration = 3000 }) => {
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => {
      if (onClose) onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [message, duration, onClose]);

  if (!message) return null;

  const colors = {
    success: { bg: 'linear-gradient(135deg, #C8E6C9 0%, #E8F5E9 100%)', border: '#66BB6A', text: '#2E7D32', icon: '✅' },
    error:   { bg: 'linear-gradient(135deg, #FFCDD2 0%, #FFEBEE 100%)', border: '#EF5350', text: '#C62828', icon: '❌' },
    info:    { bg: 'linear-gradient(135deg, #E1BEE7 0%, #F3E5F5 100%)', border: '#BA68C8', text: '#6A1B9A', icon: '💡' },
    warning: { bg: 'linear-gradient(135deg, #FFE0B2 0%, #FFF3E0 100%)', border: '#FFA726', text: '#E65100', icon: '⚠️' }
  };

  const style = colors[type] || colors.info;

  return (
    <div style={{
      position: 'fixed',
      top: '24px',
      right: '24px',
      zIndex: 9999,
      animation: 'toastSlideIn 0.4s ease-out',
    }}>
      <div style={{
        background: style.bg,
        border: `2px solid ${style.border}`,
        borderRadius: '16px',
        padding: '16px 24px',
        boxShadow: '0 12px 40px rgba(0,0,0,0.15)',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        minWidth: '300px',
        maxWidth: '450px',
        backdropFilter: 'blur(10px)',
      }}>
        <span style={{ fontSize: '1.4rem' }}>{style.icon}</span>
        <span style={{ flex: 1, color: style.text, fontWeight: '600', fontSize: '0.95rem' }}>{message}</span>
        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontSize: '1.2rem',
            color: style.text,
            opacity: 0.6,
            padding: '0 4px',
          }}
        >✕</button>
      </div>

      <style>{`
        @keyframes toastSlideIn {
          from {
            opacity: 0;
            transform: translateX(100px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
    </div>
  );
};

export default Toast;
