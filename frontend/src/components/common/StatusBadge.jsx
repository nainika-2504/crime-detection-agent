import React from 'react';

export default function StatusBadge({ status, level }) {
  if (level) {
    const lvl = level.toUpperCase();
    let badgeClass = 'low';
    if (lvl === 'CRITICAL') badgeClass = 'critical';
    else if (lvl === 'HIGH') badgeClass = 'high';
    else if (lvl === 'MEDIUM') badgeClass = 'medium';

    return (
      <span className={`risk-level-badge ${badgeClass}`}>
        {lvl} RISK
      </span>
    );
  }

  const s = status ? status.toUpperCase() : 'UNKNOWN';
  let badgeStyle = 'archival-badge';
  if (s === 'SUSPICIOUS' || s === 'FLAGGED') badgeStyle += ' burgundy';
  else if (s === 'REQUIRES_REVIEW') badgeStyle += ' lamp';

  return (
    <span className={badgeStyle}>
      {s.replace('_', ' ')}
    </span>
  );
}
