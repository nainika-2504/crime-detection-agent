import React, { useState } from 'react';
import EvidenceIndicators from './EvidenceIndicators';
import { Send, FileSearch, Fingerprint, Layers, AlertTriangle } from 'lucide-react';

export default function InvestigationForm({ onSubmit, loading }) {
  const [formData, setFormData] = useState({
    caseId: `CASE-2026-${Math.floor(1000 + Math.random() * 9000)}`,
    investigationType: 'Financial Fraud & Laundering',
    caseDescription: 'High-value outbound wire transfer triggered automated threshold alert.',
    transactionAmount: 18500,
    location: 'CH (Geneva)',
    accountAgeDays: 45,
    transactionFrequency: 22,
    failedLoginAttempts: 3,
    newDevice: true,
    multipleTransfers: false,
    unusualLocation: true,
    previousSuspiciousActivity: false,
    rapidTransfer: true,
    investigatorNotes: 'Suspect IP geolocated to cloud hosting provider. Expedited review requested.',
  });

  const [formError, setFormError] = useState('');

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.caseId.trim()) {
      setFormError('Case ID is required.');
      return;
    }
    if (isNaN(Number(formData.transactionAmount)) || Number(formData.transactionAmount) <= 0) {
      setFormError('Please enter a valid transaction amount.');
      return;
    }
    setFormError('');
    onSubmit(formData);
  };

  return (
    <div
      className="investigation-form-card"
      data-testid="investigation-form"
      role="form"
      aria-label="New Digital Crime Investigation Form"
    >
      <div className="form-header-bar">
        <div>
          <h2 className="form-main-title">EVIDENTIARY INTAKE DOSSIER</h2>
          <p className="form-subtitle">
            Enter verified incident parameters for algorithmic correlation and risk classification.
          </p>
        </div>
        <div className="archival-badge burgundy">
          <Fingerprint size={13} />
          <span>FORENSIC PROTOCOL</span>
        </div>
      </div>

      {formError && (
        <div style={{ color: '#E27979', marginBottom: '1.25rem', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <AlertTriangle size={14} />
          <span>{formError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Section 1: CASE INFORMATION */}
        <fieldset className="form-field-group">
          <legend className="group-legend">
            <FileSearch size={14} />
            <span>CASE INFORMATION</span>
          </legend>

          <div className="fields-grid-2">
            <div className="field-control">
              <label htmlFor="caseId" className="field-label">
                <span>CASE IDENTIFIER</span>
                <span className="field-help">Required</span>
              </label>
              <input
                id="caseId"
                type="text"
                className="input-text"
                value={formData.caseId}
                onChange={(e) => handleChange('caseId', e.target.value)}
                placeholder="e.g. CASE-2026-9142"
                required
              />
            </div>

            <div className="field-control">
              <label htmlFor="investigationType" className="field-label">
                <span>INVESTIGATION TYPE</span>
              </label>
              <select
                id="investigationType"
                className="input-select"
                value={formData.investigationType}
                onChange={(e) => handleChange('investigationType', e.target.value)}
              >
                <option value="Financial Fraud & Laundering">Financial Fraud & Laundering</option>
                <option value="Account Takeover (ATO)">Account Takeover (ATO)</option>
                <option value="Synthetic Identity Fraud">Synthetic Identity Fraud</option>
                <option value="Wire Transfer Structuring">Wire Transfer Structuring</option>
                <option value="Unauthorized Server Intrusion">Unauthorized Server Intrusion</option>
              </select>
            </div>
          </div>

          <div className="field-control" style={{ marginTop: '1.25rem' }}>
            <label htmlFor="caseDescription" className="field-label">
              <span>CASE DESCRIPTION</span>
              <span className="field-help">Summary of observed anomaly</span>
            </label>
            <textarea
              id="caseDescription"
              className="input-textarea"
              rows={2}
              value={formData.caseDescription}
              onChange={(e) => handleChange('caseDescription', e.target.value)}
              placeholder="Describe trigger circumstances..."
            />
          </div>
        </fieldset>

        {/* Section 2: TRANSACTION DETAILS */}
        <fieldset className="form-field-group">
          <legend className="group-legend">
            <Layers size={14} />
            <span>TRANSACTION DETAILS</span>
          </legend>

          <div className="fields-grid-2">
            <div className="field-control">
              <label htmlFor="transactionAmount" className="field-label">
                <span>TRANSACTION AMOUNT (USD)</span>
              </label>
              <input
                id="transactionAmount"
                type="number"
                step="any"
                className="input-text"
                value={formData.transactionAmount}
                onChange={(e) => handleChange('transactionAmount', e.target.value)}
                placeholder="10000"
                required
              />
            </div>

            <div className="field-control">
              <label htmlFor="location" className="field-label">
                <span>LOCATION / JURISDICTION</span>
              </label>
              <input
                id="location"
                type="text"
                className="input-text"
                value={formData.location}
                onChange={(e) => handleChange('location', e.target.value)}
                placeholder="e.g. US (California) or KY"
              />
            </div>
          </div>

          <div className="fields-grid-3" style={{ marginTop: '1.25rem' }}>
            <div className="field-control">
              <label htmlFor="accountAgeDays" className="field-label">
                <span>ACCOUNT AGE (DAYS)</span>
              </label>
              <input
                id="accountAgeDays"
                type="number"
                className="input-text"
                value={formData.accountAgeDays}
                onChange={(e) => handleChange('accountAgeDays', e.target.value)}
                placeholder="Days since genesis"
              />
            </div>

            <div className="field-control">
              <label htmlFor="transactionFrequency" className="field-label">
                <span>MONTHLY FREQUENCY</span>
              </label>
              <input
                id="transactionFrequency"
                type="number"
                className="input-text"
                value={formData.transactionFrequency}
                onChange={(e) => handleChange('transactionFrequency', e.target.value)}
                placeholder="Transactions / month"
              />
            </div>

            <div className="field-control">
              <label htmlFor="failedLoginAttempts" className="field-label">
                <span>FAILED LOGIN ATTEMPTS</span>
              </label>
              <input
                id="failedLoginAttempts"
                type="number"
                className="input-text"
                value={formData.failedLoginAttempts}
                onChange={(e) => handleChange('failedLoginAttempts', e.target.value)}
                placeholder="Failed auth count"
              />
            </div>
          </div>
        </fieldset>

        {/* Section 3: ACTIVITY INDICATORS */}
        <fieldset className="form-field-group">
          <legend className="group-legend">
            <Fingerprint size={14} />
            <span>ACTIVITY INDICATORS</span>
          </legend>

          <EvidenceIndicators
            values={formData}
            onChange={(field, val) => handleChange(field, val)}
          />
        </fieldset>

        {/* Section 4: INVESTIGATION NOTES */}
        <fieldset className="form-field-group">
          <legend className="group-legend">
            <span>INVESTIGATION NOTES</span>
          </legend>

          <div className="field-control">
            <label htmlFor="investigatorNotes" className="field-label">
              <span>SPECIAL REMARKS / EVIDENCE REFERENCES</span>
            </label>
            <textarea
              id="investigatorNotes"
              className="input-textarea"
              rows={2}
              value={formData.investigatorNotes}
              onChange={(e) => handleChange('investigatorNotes', e.target.value)}
              placeholder="Document chain-of-custody notes or correlation leads..."
            />
          </div>
        </fieldset>

        {/* Action Controls */}
        <div className="form-submit-container">
          <div className="archival-label">
            AI AGENT &bull; RANDOM FOREST CLASSIFIER INFERENCE
          </div>

          <button
            type="submit"
            className="btn-start-investigation"
            disabled={loading}
            data-testid="start-investigation"
          >
            <Send size={15} />
            <span>{loading ? 'ANALYZING EVIDENCE...' : 'START INVESTIGATION'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
