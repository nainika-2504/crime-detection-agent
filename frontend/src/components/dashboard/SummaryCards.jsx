import React from 'react';
import { Archive, AlertOctagon, CheckCircle2, Clock } from 'lucide-react';

export default function SummaryCards({ summary }) {
  const {
    totalCases = 14,
    requiresReview = 5,
    completedInvestigations = 9,
    recentCount = 5,
  } = summary || {};

  return (
    <div className="summary-cards-grid">
      {/* 1. Total Cases */}
      <div className="stat-card">
        <div className="stat-header">
          <span className="stat-label">TOTAL CASES IN ARCHIVE</span>
          <Archive size={18} className="stat-icon" />
        </div>
        <div className="stat-value">{totalCases}</div>
        <div className="stat-subtext">Registered evidentiary dossiers</div>
      </div>

      {/* 2. Cases Requiring Review */}
      <div className="stat-card alert">
        <div className="stat-header">
          <span className="stat-label">CASES REQUIRING REVIEW</span>
          <AlertOctagon size={18} className="stat-icon" />
        </div>
        <div className="stat-value" style={{ color: '#FFA5A5' }}>
          {requiresReview}
        </div>
        <div className="stat-subtext">High risk or flagged suspicious</div>
      </div>

      {/* 3. Investigations Completed */}
      <div className="stat-card">
        <div className="stat-header">
          <span className="stat-label">INVESTIGATIONS COMPLETED</span>
          <CheckCircle2 size={18} className="stat-icon" style={{ color: '#96C49D' }} />
        </div>
        <div className="stat-value" style={{ color: '#96C49D' }}>
          {completedInvestigations}
        </div>
        <div className="stat-subtext">Forensic triages concluded</div>
      </div>

      {/* 4. Recent Investigations */}
      <div className="stat-card">
        <div className="stat-header">
          <span className="stat-label">RECENT INVESTIGATIONS</span>
          <Clock size={18} className="stat-icon" />
        </div>
        <div className="stat-value">{recentCount}</div>
        <div className="stat-subtext">Active cases logged this cycle</div>
      </div>
    </div>
  );
}
