import React from 'react';
import { Compass } from 'lucide-react';

export default function LoadingState({ message = 'Accessing classified evidence archive...' }) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '3rem 2rem',
        gap: '1.25rem',
        color: 'var(--color-text-secondary)',
      }}
      role="status"
    >
      <div
        style={{
          width: '38px',
          height: '38px',
          border: '2px solid rgba(212, 163, 89, 0.25)',
          borderTopColor: 'var(--color-lamp-light)',
          borderRadius: '50%',
          animation: 'spin 1.2s linear infinite',
        }}
      />
      <div
        style={{
          fontFamily: 'var(--font-serif)',
          fontSize: '0.85rem',
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          color: 'var(--color-lamp-light)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
        }}
      >
        <Compass size={14} />
        <span>{message}</span>
      </div>
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
