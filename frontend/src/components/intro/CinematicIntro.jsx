import React, { useState, useRef, useEffect } from 'react';
import VintageLamp from './VintageLamp';
import IntroTitleReveal from './IntroTitleReveal';
import { playGlassCrackSound, toggleSound, isSoundEnabled } from '../../services/soundEffects';
import { Volume2, VolumeX, FastForward, Compass } from 'lucide-react';

export default function CinematicIntro({ onCompleteIntro, dashboardPreviewComponent }) {
  const [animationState, setAnimationState] = useState('INTRO_SWINGING');
  const [soundOn, setSoundOn] = useState(isSoundEnabled());
  const [isTransitioningOut, setIsTransitioningOut] = useState(false);
  const clickLockRef = useRef(false);

  const handleLampClick = () => {
    if (clickLockRef.current) return;
    clickLockRef.current = true;

    // Phase A: IMPACT
    setAnimationState('INTRO_IMPACT');
    playGlassCrackSound();

    // Phase B: GLASS CRACK (after 200ms)
    setTimeout(() => {
      setAnimationState('BULB_CRACKING');

      // Phase C: BULB SHATTER (after 350ms)
      setTimeout(() => {
        setAnimationState('BULB_SHATTERING');

        // Phase D & E: TITLE REVEAL & READY TO ENTER (after 600ms)
        setTimeout(() => {
          setAnimationState('TITLE_REVEAL');
        }, 600);
      }, 350);
    }, 200);
  };

  const handleSkip = () => {
    setIsTransitioningOut(true);
    setTimeout(() => {
      onCompleteIntro();
    }, 400);
  };

  const handleEnterDashboard = () => {
    setIsTransitioningOut(true);
    setTimeout(() => {
      onCompleteIntro();
    }, 500);
  };

  const handleToggleSound = () => {
    const newState = toggleSound();
    setSoundOn(newState);
  };

  const isSharpening =
    animationState === 'BULB_SHATTERING' ||
    animationState === 'TITLE_REVEAL' ||
    animationState === 'READY_TO_ENTER';

  return (
    <div
      className={`cinematic-intro-container ${isTransitioningOut ? 'transitioning-out' : ''}`}
      role="region"
      aria-label="Cinematic Investigation Archive Introduction"
    >
      {/* Blurred real dashboard preview behind opening veil */}
      <div className={`intro-dashboard-veil ${isSharpening ? 'sharpening' : ''}`}>
        {dashboardPreviewComponent}
      </div>

      {/* Atmospheric dark vignette */}
      <div className="intro-ambient-vignette" />

      {/* Top Bar with Archive Label & Skip / Sound controls */}
      <header className="intro-top-bar">
        <div className="intro-archive-mark">
          <Compass size={16} color="var(--color-lamp-light)" />
          <span>INVESTIGATION ARCHIVE — DOSSIER PORTAL</span>
        </div>

        <div className="intro-controls">
          <button
            type="button"
            className="intro-sound-btn"
            onClick={handleToggleSound}
            aria-label={soundOn ? 'Mute sound effects' : 'Enable sound effects'}
            title="Toggle Sound"
          >
            {soundOn ? <Volume2 size={14} /> : <VolumeX size={14} />}
            <span>{soundOn ? 'AUDIO ON' : 'MUTED'}</span>
          </button>

          <button
            type="button"
            className="intro-skip-btn"
            onClick={handleSkip}
            data-testid="intro-skip"
            aria-label="Skip cinematic introduction and open investigation dashboard"
          >
            <span>SKIP INTRO</span>
            <FastForward size={14} />
          </button>
        </div>
      </header>

      {/* Interactive Vintage Pendant Lamp */}
      <VintageLamp
        state={animationState}
        onClickLamp={handleLampClick}
      />

      {/* Bottom Area: Instruction hint or Title reveal */}
      <footer className="intro-bottom-area">
        {animationState === 'INTRO_SWINGING' ||
        animationState === 'INTRO_IMPACT' ||
        animationState === 'BULB_CRACKING' ? (
          <div className="intro-instruction-block">
            <h2 className="intro-tagline-mystery">THE TRUTH HIDES IN THE SHADOWS</h2>
            <div className="intro-hint-sub">
              <span>CLICK THE LAMP TO BEGIN</span>
            </div>
          </div>
        ) : (
          <IntroTitleReveal onEnterDashboard={handleEnterDashboard} />
        )}
      </footer>
    </div>
  );
}
