import React from 'react';
import { Check } from 'lucide-react';

export default function EvidenceIndicators({ values, onChange }) {
  const indicatorsList = [
    {
      key: 'newDevice',
      title: 'New / Unregistered Device',
      desc: 'Hardware identifier or browser agent has no historical linkage to account.',
    },
    {
      key: 'multipleTransfers',
      title: 'Multiple Concurrent Transfers',
      desc: 'Fan-out disbursement across multiple disjoint beneficiary endpoints.',
    },
    {
      key: 'unusualLocation',
      title: 'Unusual Geolocation / ASN',
      desc: 'Access originating outside typical IP subnet, country, or autonomous system.',
    },
    {
      key: 'previousSuspiciousActivity',
      title: 'Prior Suspicious Flag On Record',
      desc: 'Entity or device previously implicated in forensic incident reports.',
    },
    {
      key: 'rapidTransfer',
      title: 'Rapid Velocity Transfers',
      desc: 'High-frequency transaction velocity within compressed execution window.',
    },
  ];

  return (
    <div className="indicators-checkbox-grid">
      {indicatorsList.map((item) => {
        const isChecked = Boolean(values[item.key]);

        return (
          <div
            key={item.key}
            className={`indicator-checkbox-item ${isChecked ? 'checked' : ''}`}
            onClick={() => onChange(item.key, !isChecked)}
            role="checkbox"
            aria-checked={isChecked}
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === ' ' || e.key === 'Enter') {
                e.preventDefault();
                onChange(item.key, !isChecked);
              }
            }}
          >
            <div className="custom-checkbox">
              {isChecked && <Check size={13} strokeWidth={3} />}
            </div>
            <div className="indicator-text-block">
              <span className="indicator-title">{item.title}</span>
              <span className="indicator-desc">{item.desc}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
