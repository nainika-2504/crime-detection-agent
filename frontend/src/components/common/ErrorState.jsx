import React from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';

export default function ErrorState({ message, onRetry }) {
  return (
    <div
      style={{
        background: 'rgba(55, 30, 30, 0.45)',
        border: '1px solid var(--color-accent-burgundy-border)',
        borderRadius: 'var(--radius-sm)',
        padding: '1.75rem 2rem',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '1rem',
        textAlign: 'center',
      }}
      role="alert"
    >
      <div
        style={{
          color: '#E27979',
          display: 'flex',
          alignItems: 'center',
          gap: '0.6rem',
          fontFamily: 'var(--font-serif)',
          fontSize: '0.9rem',
          letterSpacing: '0.14em',
          textTransform: 'uppercase',
        }}
      >
        <AlertTriangle size={18} />
        <span>Investigation Query Exception</span>
      </div>

      <p style={{ color: 'var(--color-text-primary)', fontSize: '0.86rem', maxWidth: '500px' }}>
        {message || 'An unexpected anomaly occurred while querying the investigation services.'}
      </p>

      {onRetry && (
        <button
          onClick={onRetry}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            background: 'var(--color-surface-elevated)',
            border: '1px solid var(--color-border)',
            color: 'var(--color-text-bright)',
            padding: '0.45rem 1rem',
            fontFamily: 'var(--font-serif)',
            fontSize: '0.75rem',
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            borderRadius: 'var(--radius-archival)',
            cursor: 'pointer',
          }}
        >
          <RotateCcw size={13} />
          <span>Retry Operation</span>
        </button>
      )}
    </div>
  );
}
