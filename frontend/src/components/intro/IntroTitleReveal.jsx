import React from 'react';
import { ArrowRight, ShieldAlert, Sparkles } from 'lucide-react';

export default function IntroTitleReveal({ onEnterDashboard }) {
  return (
    <div className="intro-revealed-title-block" data-testid="intro-title">
      <div className="archival-badge burgundy">
        <ShieldAlert size={13} />
        <span>CLASSIFIED DOSSIER ARCHIVE — REF #7099</span>
      </div>

      <h1 className="intro-title-header">
        AI DIGITAL CRIME
        <span>INVESTIGATION AGENT</span>
      </h1>

      <p className="intro-story-tagline">
        &ldquo;Every clue has a story. Every shadow leaves evidence.&rdquo;
      </p>

      <button
        className="intro-enter-btn"
        onClick={onEnterDashboard}
        data-testid="enter-investigation"
      >
        <span>ENTER INVESTIGATION</span>
        <ArrowRight size={16} />
      </button>
    </div>
  );
}
