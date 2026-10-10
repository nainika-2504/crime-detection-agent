import React, { useRef } from 'react';
import SummaryCards from './SummaryCards';
import RecentCases from './RecentCases';
import { PlusCircle, Search, ScrollText } from 'lucide-react';

export default function DashboardPage({
  summary,
  cases,
  onNewInvestigation,
  onSelectCase,
}) {
  const casesSectionRef = useRef(null);

  const handleScrollToCases = () => {
    if (casesSectionRef.current) {
      casesSectionRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="dashboard-page-container">
      {/* Editorial Dark Academia Hero */}
      <section className="dashboard-hero" aria-label="Investigation Welcome Hero">
        <h1 className="hero-heading">
          Uncover the Evidence.
        </h1>
        <p className="hero-description">
          An AI-assisted environment for examining suspicious activity, correlating evidence and organizing investigative findings.
        </p>

        <div className="hero-actions">
          <button
            className="btn-primary-action"
            onClick={onNewInvestigation}
          >
            <PlusCircle size={15} />
            <span>NEW INVESTIGATION</span>
          </button>

          <button
            className="btn-secondary-action"
            onClick={handleScrollToCases}
          >
            <ScrollText size={15} />
            <span>VIEW CASES</span>
          </button>
        </div>
      </section>

      {/* 4 Summary Cards */}
      <SummaryCards summary={summary} />

      {/* Recent Cases Section */}
      <div ref={casesSectionRef}>
        <RecentCases cases={cases} onSelectCase={onSelectCase} />
      </div>
    </div>
  );
}
