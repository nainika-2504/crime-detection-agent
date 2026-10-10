import React from 'react';
import GlassCrack from './GlassCrack';
import GlassShatter from './GlassShatter';

/**
 * High-craftsmanship Vintage Pendant Lamp with SVG lighting, aged metal shade,
 * Edison glass bulb, crack overlay, shatter fragments and dust motes.
 */
export default function VintageLamp({
  state,
  onClickLamp,
}) {
  const isCracking = state === 'BULB_CRACKING';
  const isShattered =
    state === 'BULB_SHATTERING' ||
    state === 'TITLE_REVEAL' ||
    state === 'READY_TO_ENTER' ||
    state === 'DASHBOARD';
  const isImpact = state === 'INTRO_IMPACT';
  const isSettled = state !== 'INTRO_SWINGING';

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClickLamp();
    }
  };

  return (
    <div
      className={`lamp-assembly-viewport ${isImpact ? 'impact' : ''} ${isSettled ? 'settled' : ''}`}
      onClick={onClickLamp}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="button"
      aria-label="Vintage Pendant Lamp: Click to switch on and reveal investigation archive"
      data-testid="intro-lamp"
    >
      {/* Hanging dark cord with brass ceiling fitting */}
      <div className="lamp-cord" />

      {/* Fixture and Lamp Shade Container */}
      <div className="lamp-shade-container">
        <svg
          className="vintage-lamp-svg"
          width="160"
          height="140"
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Shade radial metallic gradient */}
            <radialGradient id="shadeGrad" cx="50%" cy="30%" r="70%">
              <stop offset="0%" stopColor="#4A4744" />
              <stop offset="65%" stopColor="#282624" />
              <stop offset="100%" stopColor="#141312" />
            </radialGradient>

            {/* Antique Brass Accents */}
            <linearGradient id="brassGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#F5DF98" />
              <stop offset="35%" stopColor="#C99B4B" />
              <stop offset="70%" stopColor="#8A6729" />
              <stop offset="100%" stopColor="#E2BE6C" />
            </linearGradient>

            {/* Glass Bulb Glow */}
            <radialGradient id="bulbGlassGrad" cx="45%" cy="35%" r="65%">
              <stop offset="0%" stopColor="rgba(255, 248, 220, 0.95)" />
              <stop offset="40%" stopColor="rgba(235, 188, 112, 0.75)" />
              <stop offset="75%" stopColor="rgba(212, 163, 89, 0.4)" />
              <stop offset="100%" stopColor="rgba(114, 110, 104, 0.25)" />
            </radialGradient>

            {/* Inner Filament Warmth */}
            <filter id="filamentGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="2.5" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Top Hanging Ring & Collar */}
          <ellipse cx="50" cy="5" rx="4" ry="3" stroke="url(#brassGrad)" strokeWidth="1.5" />
          <rect x="47" y="7" width="6" height="5" fill="url(#brassGrad)" rx="1" />

          {/* Aged Shade Cap */}
          <path d="M 43,12 L 57,12 L 55,18 L 45,18 Z" fill="url(#brassGrad)" />

          {/* Flared Antique Industrial Metal Shade */}
          <path
            d="M 45,18 C 45,18 42,28 15,48 C 12,50 12,54 18,54 L 82,54 C 88,54 88,50 85,48 C 58,28 55,18 55,18 Z"
            fill="url(#shadeGrad)"
            stroke="#121110"
            strokeWidth="1.2"
          />

          {/* Shade Rim Brass Lip */}
          <path
            d="M 16,53 C 35,56 65,56 84,53"
            stroke="url(#brassGrad)"
            strokeWidth="1.5"
            strokeLinecap="round"
          />

          {/* Socket Holder Under Shade */}
          <rect x="46" y="52" width="8" height="6" fill="#1C1A18" stroke="url(#brassGrad)" strokeWidth="0.8" />

          {/* Filament (Always visible or sparking) */}
          <g filter="url(#filamentGlow)">
            {/* Internal support wires */}
            <line x1="48" y1="58" x2="48" y2="67" stroke="#9E8345" strokeWidth="0.8" />
            <line x1="52" y1="58" x2="52" y2="67" stroke="#9E8345" strokeWidth="0.8" />
            {/* Glowing loops */}
            <path
              d="M 48,67 Q 50,62 52,67"
              stroke={isShattered ? '#FFF3D4' : '#FFE89C'}
              strokeWidth="1.4"
              fill="none"
            />
          </g>

          {/* Edison Glass Bulb Envelope (Hidden when fully shattered) */}
          {!isShattered && (
            <g>
              {/* Glass teardrop contour */}
              <path
                d="M 44,57 C 40,59 36,68 36,76 C 36,87 42,92 50,92 C 58,92 64,87 64,76 C 64,68 60,59 56,57 Z"
                fill="url(#bulbGlassGrad)"
                stroke="rgba(255, 240, 200, 0.45)"
                strokeWidth="1"
              />
              {/* Glass specular curved highlight */}
              <path
                d="M 40,68 C 38,74 40,82 43,86"
                stroke="rgba(255, 255, 255, 0.65)"
                strokeWidth="1.2"
                strokeLinecap="round"
                fill="none"
              />
            </g>
          )}

          {/* Real-time SVG Crack Branching */}
          {isCracking && <GlassCrack />}
        </svg>

        {/* Shatter particle layer */}
        {isShattered && <GlassShatter />}

        {/* Warm Light Cone illuminating the frosted veiled background */}
        <div className={`lamp-light-cone ${isCracking || isImpact ? 'flash' : ''}`}>
          {/* Subtle floating dust motes inside the light beam */}
          <div className="dust-particle" style={{ left: '35%', top: '30%', width: '3px', height: '3px', animationDelay: '0.2s' }} />
          <div className="dust-particle" style={{ left: '55%', top: '45%', width: '4px', height: '4px', animationDelay: '1.4s' }} />
          <div className="dust-particle" style={{ left: '42%', top: '65%', width: '2px', height: '2px', animationDelay: '2.8s' }} />
          <div className="dust-particle" style={{ left: '62%', top: '25%', width: '3px', height: '3px', animationDelay: '3.6s' }} />
          <div className="dust-particle" style={{ left: '48%', top: '80%', width: '4px', height: '4px', animationDelay: '4.2s' }} />
          <div className="dust-particle" style={{ left: '28%', top: '55%', width: '2px', height: '2px', animationDelay: '5.1s' }} />
        </div>
      </div>
    </div>
  );
}
