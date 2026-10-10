import React, { useState, useEffect } from 'react';
import CinematicIntro from './components/intro/CinematicIntro';
import AppShell from './components/layout/AppShell';
import DashboardPage from './components/dashboard/DashboardPage';
import InvestigationForm from './components/investigation/InvestigationForm';
import InvestigationResult from './components/investigation/InvestigationResult';
import InvestigationAssistant from './components/assistant/InvestigationAssistant';
import {
  getHealthStatus,
  getCasesSummary,
  getRecentCases,
  submitInvestigation,
} from './services/api';

export default function App() {
  const [introCompleted, setIntroCompleted] = useState(() => {
    try {
      return sessionStorage.getItem('ai_investigation_intro_viewed') === 'true';
    } catch (e) {
      return false;
    }
  });

  const [activeTab, setActiveTab] = useState('dashboard');
  const [healthStatus, setHealthStatus] = useState(null);
  const [summary, setSummary] = useState(null);
  const [cases, setCases] = useState([]);
  const [activeCase, setActiveCase] = useState(null);
  const [currentResult, setCurrentResult] = useState(null);
  const [submittingInvestigation, setSubmittingInvestigation] = useState(false);

  // Load backend and case data
  const refreshData = async () => {
    try {
      const [health, sum, recent] = await Promise.all([
        getHealthStatus(),
        getCasesSummary(),
        getRecentCases(),
      ]);
      setHealthStatus(health);
      setSummary(sum);
      setCases(recent);
      if (recent && recent.length > 0 && !activeCase) {
        setActiveCase(recent[0]);
      }
    } catch (err) {
      console.warn('Data initialization notice:', err);
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  const handleCompleteIntro = () => {
    try {
      sessionStorage.setItem('ai_investigation_intro_viewed', 'true');
    } catch (e) {
      // ignore
    }
    setIntroCompleted(true);
  };

  const handleReplayIntro = () => {
    setIntroCompleted(false);
  };

  const handleSelectCase = (caseItem) => {
    setActiveCase(caseItem);
    setCurrentResult(caseItem);
    setActiveTab('investigate');
  };

  const handleConsultAssistant = (caseItem) => {
    setActiveCase(caseItem);
    setActiveTab('assistant');
  };

  const handleSubmitInvestigation = async (formData) => {
    setSubmittingInvestigation(true);
    try {
      const result = await submitInvestigation(formData);
      setCurrentResult(result);
      setActiveCase(result);
      await refreshData();
    } catch (err) {
      console.error('Submission failed:', err);
    } finally {
      setSubmittingInvestigation(false);
    }
  };

  // Dashboard preview rendered behind the intro frosted veil
  const dashboardPreview = (
    <AppShell
      activeTab="dashboard"
      onSelectTab={() => {}}
      onReplayIntro={() => {}}
      healthStatus={healthStatus}
    >
      <DashboardPage
        summary={summary}
        cases={cases}
        onNewInvestigation={() => {}}
        onSelectCase={() => {}}
      />
    </AppShell>
  );

  return (
    <>
      {/* Cinematic Introduction Screen */}
      {!introCompleted && (
        <CinematicIntro
          onCompleteIntro={handleCompleteIntro}
          dashboardPreviewComponent={dashboardPreview}
        />
      )}

      {/* Main Functional Investigation Archive Application */}
      <AppShell
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onReplayIntro={handleReplayIntro}
        healthStatus={healthStatus}
      >
        {activeTab === 'dashboard' && (
          <DashboardPage
            summary={summary}
            cases={cases}
            onNewInvestigation={() => {
              setCurrentResult(null);
              setActiveTab('investigate');
            }}
            onSelectCase={handleSelectCase}
          />
        )}

        {activeTab === 'investigate' && (
          <div className="investigation-view-container">
            <div className="investigation-grid-two-col">
              <InvestigationForm
                onSubmit={handleSubmitInvestigation}
                loading={submittingInvestigation}
              />

              <div>
                {currentResult ? (
                  <InvestigationResult
                    result={currentResult}
                    onConsultAssistant={handleConsultAssistant}
                  />
                ) : (
                  <div className="dossier-result-card" style={{ textAlign: 'center', padding: '3.5rem 2rem' }}>
                    <div className="archival-label" style={{ marginBottom: '1rem' }}>
                      DOSSIER INTAKE STANDBY
                    </div>
                    <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.88rem', maxWidth: '380px', margin: '0 auto' }}>
                      Submit the evidentiary intake form or select an existing case from the archive to generate algorithmic risk classifications.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'assistant' && (
          <div className="investigation-view-container" style={{ maxWidth: '1000px' }}>
            <InvestigationAssistant activeCase={activeCase} />
          </div>
        )}
      </AppShell>
    </>
  );
}
