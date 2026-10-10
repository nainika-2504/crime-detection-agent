import React from 'react';
import StatusBadge from '../common/StatusBadge';
import { ShieldAlert, ShieldCheck, CheckCircle2, MessageSquareQuote, Check } from 'lucide-react';

export default function InvestigationResult({ result, onConsultAssistant }) {
  if (!result) return null;

  const isSuspicious = result.prediction === 'SUSPICIOUS';
  const probPercent = (result.probability * 100).toFixed(1);

  return (
    <div
      className="dossier-result-card"
      data-testid="investigation-result"
      role="region"
      aria-label="Investigation Dossier Findings"
    >
      {/* Dossier Header */}
      <div className="dossier-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div className="dossier-case-id">{result.caseId}</div>
          <span className="archival-badge lamp">VERIFIED MODEL FINDING</span>
        </div>

        <div className="dossier-meta-row">
          <span>TYPE: <strong>{result.investigationType}</strong></span>
          <span>&bull;</span>
          <span>AMOUNT: <strong>${Number(result.transactionAmount || 0).toLocaleString()} USD</strong></span>
          <span>&bull;</span>
          <span>DATE: <strong>{new Date(result.createdAt).toLocaleString()}</strong></span>
        </div>
      </div>

      {/* Model Prediction & Risk Score Banner */}
      <div className={`prediction-banner ${isSuspicious ? 'suspicious' : 'normal'}`}>
        <div className="prediction-title-group">
          <span className="prediction-label">MODEL CLASSIFICATION</span>
          <div
            className="prediction-value"
            data-testid="investigation-prediction"
          >
            {result.prediction}
          </div>
          <span style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)' }}>
            Model Probability: <strong style={{ color: 'var(--color-text-bright)' }}>{probPercent}%</strong> (Statistical Anomaly Confidence)
          </span>
        </div>

        <div className="risk-score-box">
          <span className="prediction-label">CALCULATED RISK SCORE</span>
          <div className="risk-score-value" data-testid="risk-score">
            {result.riskScore}<span style={{ fontSize: '1rem', color: 'var(--color-text-secondary)' }}>/100</span>
          </div>
          <StatusBadge level={result.riskLevel} />
        </div>
      </div>

      {/* Evidence Comparison: Submitted Indicators vs Model Derived */}
      <div className="evidence-audit-block">
        <div className="evidence-audit-title">
          SUBMITTED EVIDENCE AUDIT
        </div>
        <div className="audit-indicator-pills">
          <span className={`indicator-pill ${result.newDevice ? 'asserted' : ''}`}>
            {result.newDevice ? '✓ ' : '— '}New Device
          </span>
          <span className={`indicator-pill ${result.multipleTransfers ? 'asserted' : ''}`}>
            {result.multipleTransfers ? '✓ ' : '— '}Multiple Transfers
          </span>
          <span className={`indicator-pill ${result.unusualLocation ? 'asserted' : ''}`}>
            {result.unusualLocation ? '✓ ' : '— '}Unusual Location ({result.location || 'N/A'})
          </span>
          <span className={`indicator-pill ${result.previousSuspiciousActivity ? 'asserted' : ''}`}>
            {result.previousSuspiciousActivity ? '✓ ' : '— '}Prior Suspicious History
          </span>
          <span className={`indicator-pill ${result.rapidTransfer ? 'asserted' : ''}`}>
            {result.rapidTransfer ? '✓ ' : '— '}Rapid Transfer Velocity
          </span>
          <span className={`indicator-pill ${result.failedLoginAttempts > 0 ? 'asserted' : ''}`}>
            Failed Auth Attempts: {result.failedLoginAttempts || 0}
          </span>
          <span className="indicator-pill">
            Account Maturity: {result.accountAgeDays || 0} days
          </span>
        </div>
      </div>

      {/* Explanation of Prediction */}
      <div style={{ background: '#11100F', padding: '1.25rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border-subtle)' }}>
        <div style={{ fontFamily: 'var(--font-serif)', fontSize: '0.78rem', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--color-lamp-light)', marginBottom: '0.5rem' }}>
          MODEL INFERENCE EXPLANATION
        </div>
        <p style={{ fontSize: '0.86rem', color: 'var(--color-text-primary)', lineHeight: 1.55 }}>
          {result.explanation}
        </p>
      </div>

      {/* Recommended Next Investigative Checks */}
      <div className="recommended-checks-block">
        <div className="recs-title">RECOMMENDED NEXT INVESTIGATIVE PROTOCOLS</div>
        <ul className="recs-list">
          {result.recommendedChecks && result.recommendedChecks.map((check, idx) => (
            <li key={idx} className="recs-item">
              <span className="recs-item-bullet">&bull;</span>
              <span>{check}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Consult Assistant button */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.5rem' }}>
        <div style={{ fontSize: '0.72rem', color: 'var(--color-text-secondary)', fontFamily: 'var(--font-mono)' }}>
          ENGINE: {result.modelVersion || 'RandomForestClassifier v1.2.0'}
        </div>

        {onConsultAssistant && (
          <button
            onClick={() => onConsultAssistant(result)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              background: 'var(--color-accent-burgundy)',
              border: '1px solid var(--color-lamp-light)',
              color: '#EDEAE4',
              padding: '0.55rem 1.25rem',
              fontFamily: 'var(--font-serif)',
              fontSize: '0.76rem',
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              borderRadius: 'var(--radius-archival)',
              cursor: 'pointer',
            }}
          >
            <MessageSquareQuote size={14} />
            <span>CONSULT INVESTIGATION DESK</span>
          </button>
        )}
      </div>

      {/* Legal & Forensic Disclaimer */}
      <div className="investigative-disclaimer">
        IMPORTANT: Model prediction represents an algorithmic risk probability computed via RandomForest feature correlation. It does not establish legal guilt or constitute definitive proof of criminal activity. All outcomes must be verified through formal evidentiary review and authorized chain-of-custody protocols.
      </div>
    </div>
  );
}
