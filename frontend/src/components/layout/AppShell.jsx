import React from 'react';
import Header from './Header';

export default function AppShell({
  children,
  activeTab,
  onSelectTab,
  onReplayIntro,
  healthStatus,
}) {
  return (
    <div className="app-shell">
      {/* Archival film grain procedural texture overlay */}
      <div className="archival-grain-overlay" aria-hidden="true" />

      {/* Main Header */}
      <Header
        activeTab={activeTab}
        onSelectTab={onSelectTab}
        onReplayIntro={onReplayIntro}
        healthStatus={healthStatus}
      />

      {/* Viewport Content */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {children}
      </main>

      {/* Archival Classified Footer */}
      <footer
        style={{
          borderTop: '1px solid var(--color-border)',
          background: '#080808',
          padding: '1.25rem 2.5rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '0.74rem',
          color: 'var(--color-text-secondary)',
        }}
      >
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <span className="archival-badge">CLASSIFIED DOSSIER ARCHIVE</span>
          <span>EVIDENTIARY PROTOCOL RFC-9402</span>
        </div>
        <div>
          <span>AI DIGITAL CRIME INVESTIGATION AGENT &copy; 2026 &bull; ALL RIGHTS RESERVED</span>
        </div>
      </footer>
    </div>
  );
}
