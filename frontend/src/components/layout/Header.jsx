import React from 'react';
import { ShieldCheck, ShieldAlert, RotateCcw, FolderOpen, PlusCircle, MessageSquareQuote } from 'lucide-react';

export default function Header({
  activeTab,
  onSelectTab,
  onReplayIntro,
  healthStatus,
}) {
  const isHealthy = healthStatus && healthStatus.status === 'UP';

  return (
    <header className="app-header">
      {/* Brand & Archival Insignia */}
      <div className="header-brand">
        <div className="archive-seal" title="Classified Digital Crime Archive Insignia">
          <ShieldAlert size={20} />
        </div>
        <div className="brand-titles">
          <div className="brand-main-title">
            AI DIGITAL CRIME INVESTIGATION AGENT
          </div>
          <div className="brand-sub-title">
            INVESTIGATION ARCHIVE — DIVISION 07
          </div>
        </div>
      </div>

      {/* Navigation & Controls */}
      <div className="header-actions">
        {/* Navigation Tabs */}
        <nav className="nav-links" aria-label="Investigation Navigation">
          <button
            className={`nav-item-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => onSelectTab('dashboard')}
          >
            <FolderOpen size={14} />
            <span>ARCHIVE DASHBOARD</span>
          </button>

          <button
            className={`nav-item-btn ${activeTab === 'investigate' ? 'active' : ''}`}
            onClick={() => onSelectTab('investigate')}
          >
            <PlusCircle size={14} />
            <span>NEW INVESTIGATION</span>
          </button>

          <button
            className={`nav-item-btn ${activeTab === 'assistant' ? 'active' : ''}`}
            onClick={() => onSelectTab('assistant')}
          >
            <MessageSquareQuote size={14} />
            <span>INVESTIGATION DESK</span>
          </button>
        </nav>

        {/* Real-time backend system status */}
        <div
          className="system-status-pill"
          title={`Backend: ${isHealthy ? 'Live Operational' : 'Client Inference Active'} | DB: PostgreSQL/Supabase`}
        >
          <span className={`status-dot ${isHealthy ? '' : 'disconnected'}`} />
          <span>{isHealthy ? 'SERVICES ONLINE' : 'HYBRID AGENT READY'}</span>
        </div>

        {/* Replay Cinematic Intro button */}
        <button
          className="replay-intro-btn"
          onClick={onReplayIntro}
          title="Replay the cinematic lamp reveal sequence"
          aria-label="Replay intro animation"
        >
          <RotateCcw size={12} />
          <span>REPLAY INTRO</span>
        </button>
      </div>
    </header>
  );
}
