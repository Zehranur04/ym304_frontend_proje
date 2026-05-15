import React from 'react';

// onay gerektiren işlemler için kullanılan modal (silme, tamamlama vs.)
const ConfirmModal = ({ message, onConfirm, onCancel }) => {
  if (!message) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.35)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9998,
      animation: 'modalFadeIn 0.25s ease-out',
    }}>
      <div style={{
        background: 'linear-gradient(135deg, #ffffff 0%, #F3E5F5 100%)',
        borderRadius: '24px',
        padding: '32px',
        maxWidth: '420px',
        width: '90%',
        boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
        border: '1px solid rgba(255,255,255,0.6)',
        animation: 'modalScaleIn 0.3s ease-out',
      }}>
        <div style={{ textAlign: 'center', marginBottom: '8px' }}>
          <span style={{ fontSize: '2.5rem' }}>🤔</span>
        </div>
        <p style={{
          color: '#3b237c',
          fontSize: '1.05rem',
          fontWeight: '600',
          textAlign: 'center',
          marginBottom: '24px',
          lineHeight: '1.5',
        }}>{message}</p>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
          <button
            onClick={onCancel}
            style={{
              padding: '12px 28px',
              background: '#F3E5F5',
              color: '#6A1B9A',
              border: '1px solid #E1BEE7',
              borderRadius: '12px',
              fontWeight: 'bold',
              cursor: 'pointer',
              fontSize: '0.9rem',
              transition: '0.2s',
            }}
          >Vazgeç</button>
          <button
            onClick={onConfirm}
            style={{
              padding: '12px 28px',
              background: '#4A148C',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              fontWeight: 'bold',
              cursor: 'pointer',
              fontSize: '0.9rem',
              transition: '0.2s',
            }}
          >Evet, Devam Et</button>
        </div>
      </div>

      <style>{`
        @keyframes modalFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes modalScaleIn {
          from { opacity: 0; transform: scale(0.85); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
};

export default ConfirmModal;
