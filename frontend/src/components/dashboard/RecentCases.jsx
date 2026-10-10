import React from 'react';
import StatusBadge from '../common/StatusBadge';
import { Eye, ShieldAlert, FileText } from 'lucide-react';

export default function RecentCases({ cases, onSelectCase }) {
  if (!cases || cases.length === 0) {
    return (
      <div className="recent-cases-section">
        <div className="section-title-bar">
          <div className="section-heading">
            <FileText size={18} />
            <span>RECENT ARCHIVAL CASES</span>
          </div>
        </div>
        <p style={{ color: 'var(--color-text-secondary)', padding: '2rem 1rem', textAlign: 'center' }}>
          No active case records currently logged in this archive cycle.
        </p>
      </div>
    );
  }

  return (
    <section className="recent-cases-section" aria-label="Recent Investigations Archive">
      <div className="section-title-bar">
        <div className="section-heading">
          <FileText size={18} color="var(--color-lamp-light)" />
          <span>RECENT INVESTIGATION DOSSIERS</span>
        </div>
        <span className="archival-badge">CONFIDENTIAL LOG</span>
      </div>

      <table className="cases-table">
        <thead>
          <tr>
            <th>CASE ID</th>
            <th>INVESTIGATION TYPE</th>
            <th>DATE LOGGED</th>
            <th>STATUS</th>
            <th>PREDICTION / RISK</th>
            <th>ACTION</th>
          </tr>
        </thead>
        <tbody>
          {cases.map((c) => {
            const formattedDate = c.createdAt
              ? new Date(c.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                })
              : 'Recent';

            return (
              <tr key={c.caseId}>
                <td className="case-id-cell">{c.caseId}</td>
                <td>
                  <div style={{ fontWeight: 500, color: 'var(--color-text-bright)' }}>
                    {c.investigationType}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--color-text-secondary)' }}>
                    ${Number(c.transactionAmount || 0).toLocaleString()} &bull; {c.location || 'Global'}
                  </div>
                </td>
                <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem' }}>
                  {formattedDate}
                </td>
                <td>
                  <StatusBadge status={c.status} />
                </td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <StatusBadge level={c.riskLevel || (c.prediction === 'SUSPICIOUS' ? 'HIGH' : 'LOW')} />
                    <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)' }}>
                      {c.prediction || 'EVALUATED'}
                    </span>
                  </div>
                </td>
                <td>
                  <button
                    className="case-action-btn"
                    onClick={() => onSelectCase(c)}
                    title={`Open Dossier ${c.caseId}`}
                  >
                    <Eye size={12} />
                    <span>EXAMINE DOSSIER</span>
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </section>
  );
}
