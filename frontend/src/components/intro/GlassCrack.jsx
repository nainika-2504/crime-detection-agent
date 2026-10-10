import React from 'react';

/**
 * Branching glass fracture paths rendered inside the bulb
 */
export default function GlassCrack() {
  return (
    <g className="glass-crack-group" pointerEvents="none">
      {/* Primary fracture line */}
      <path
        d="M 50,42 L 53,50 L 48,58 L 52,65 L 49,74 L 54,82"
        className="glass-crack-line"
      />
      {/* Secondary branch left */}
      <path
        d="M 48,58 L 40,54 L 35,58 L 31,56"
        className="glass-crack-line"
        style={{ animationDelay: '0.06s' }}
      />
      {/* Secondary branch right */}
      <path
        d="M 52,65 L 62,68 L 68,64 L 72,70"
        className="glass-crack-line"
        style={{ animationDelay: '0.08s' }}
      />
      {/* Micro-fissures */}
      <path
        d="M 53,50 L 60,46"
        className="glass-crack-line"
        style={{ animationDelay: '0.12s' }}
      />
      <path
        d="M 49,74 L 42,78 L 38,84"
        className="glass-crack-line"
        style={{ animationDelay: '0.1s' }}
      />
    </g>
  );
}
