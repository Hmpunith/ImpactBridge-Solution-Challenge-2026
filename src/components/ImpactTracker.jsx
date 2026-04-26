/**
 * @fileoverview Impact Tracker component.
 * Shows metrics and AI-generated impact reports.
 */

import { useState } from 'react';
import { API_BASE } from '../constants';
import { trackEvent } from '../firebase';

/**
 * ImpactTracker — Displays social impact metrics and AI reports.
 * @param {object} props
 * @param {Array} props.needs - Extracted needs
 * @param {Array} props.volunteers - Registered volunteers
 */
export default function ImpactTracker({ needs, volunteers }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [report, setReport] = useState(null);

  const impactData = {
    totalNeeds: needs.length,
    totalVolunteers: volunteers.length,
    criticalNeeds: needs.filter((n) => n.urgency === 'critical').length,
    totalSkills: [...new Set(volunteers.flatMap((v) => v.skills))].length,
    estimatedPeopleHelped: needs.reduce((sum, n) => sum + (n.estimatedVolunteers || 0) * 10, 0),
  };

  const handleGenerateReport = async () => {
    setLoading(true);
    setError('');
    trackEvent('impact_report_started');

    try {
      const res = await fetch(`${API_BASE}/impact-report`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: impactData }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Report generation failed');
      }

      const data = await res.json();
      setReport(data);
      trackEvent('impact_report_success');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="section-header">
        <h2 className="section-title">
          <span aria-hidden="true">📈</span> Impact Tracker
        </h2>
        <p className="section-description">
          Track your social impact and generate AI-powered analysis reports.
        </p>
      </div>

      {/* Live Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon" aria-hidden="true">📋</div>
          <div className="stat-value">{impactData.totalNeeds}</div>
          <div className="stat-label">Needs Identified</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" aria-hidden="true">👥</div>
          <div className="stat-value">{impactData.totalVolunteers}</div>
          <div className="stat-label">Volunteers</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" aria-hidden="true">🚨</div>
          <div className="stat-value" style={{ color: 'var(--critical)' }}>
            {impactData.criticalNeeds}
          </div>
          <div className="stat-label">Critical Needs</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" aria-hidden="true">🌍</div>
          <div className="stat-value">{impactData.estimatedPeopleHelped}</div>
          <div className="stat-label">Est. People Helped</div>
        </div>
      </div>

      {/* Generate Report */}
      <div className="card" style={{ marginBottom: '16px' }}>
        <button
          className="btn-primary"
          onClick={handleGenerateReport}
          disabled={loading || needs.length === 0}
          aria-busy={loading}
          style={{ width: '100%' }}
        >
          {loading ? (
            <span className="loading-spinner">
              <span className="spinner" aria-hidden="true"></span>
              Generating AI Impact Report...
            </span>
          ) : (
            '📊 Generate AI Impact Report'
          )}
        </button>
      </div>

      {error && (
        <div className="alert alert-error" role="alert" aria-live="assertive">
          ⚠️ {error}
        </div>
      )}

      {report && (
        <div className="card">
          <h3 className="impact-headline">{report.headline}</h3>

          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-value">{report.metrics.livesImpacted}</div>
              <div className="stat-label">Lives Impacted</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{report.metrics.hoursContributed}</div>
              <div className="stat-label">Hours Contributed</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{report.metrics.needsResolved}</div>
              <div className="stat-label">Needs Resolved</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{report.metrics.activeVolunteers}</div>
              <div className="stat-label">Active Volunteers</div>
            </div>
          </div>

          <h4 style={{ marginTop: '20px', marginBottom: '12px' }}>💡 Key Insights</h4>
          <ul className="insights-list">
            {report.insights.map((insight, i) => (
              <li key={i}>{insight}</li>
            ))}
          </ul>

          <h4 style={{ marginTop: '20px', marginBottom: '12px' }}>🎯 Recommendations</h4>
          <ul className="insights-list">
            {report.recommendations.map((rec, i) => (
              <li key={i}>{rec}</li>
            ))}
          </ul>
        </div>
      )}

      {needs.length === 0 && (
        <div className="card">
          <div className="empty-state">
            <div className="empty-state-icon" aria-hidden="true">📈</div>
            <p className="empty-state-text">No impact data yet</p>
            <p className="empty-state-hint">
              Start by extracting needs in the <strong>AI Parser</strong> tab.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
