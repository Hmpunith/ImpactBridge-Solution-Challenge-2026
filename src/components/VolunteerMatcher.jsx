/**
 * @fileoverview AI Volunteer Matcher component.
 * Uses Gemini AI to match volunteers to community needs.
 */

import { useState } from 'react';
import { API_BASE } from '../constants';
import { trackEvent } from '../firebase';

/**
 * VolunteerMatcher — AI-powered matching engine.
 * @param {object} props
 * @param {Array} props.needs - Extracted community needs
 * @param {Array} props.volunteers - Registered volunteers
 */
export default function VolunteerMatcher({ needs, volunteers }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  const canMatch = needs.length > 0 && volunteers.length > 0;

  const handleMatch = async () => {
    setLoading(true);
    setError('');
    setResult(null);
    trackEvent('match_started', { needs: needs.length, volunteers: volunteers.length });

    try {
      const res = await fetch(`${API_BASE}/match-volunteers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ needs, volunteers }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Matching failed');
      }

      const data = await res.json();
      setResult(data);
      trackEvent('match_success', { matchCount: data.matches.length });
    } catch (err) {
      setError(err.message);
      trackEvent('match_error', { error: err.message });
    } finally {
      setLoading(false);
    }
  };

  const getScoreClass = (score) => {
    if (score >= 80) return 'excellent';
    if (score >= 50) return 'good';
    return 'fair';
  };

  return (
    <div>
      <div className="section-header">
        <h2 className="section-title">
          <span aria-hidden="true">🎯</span> AI Smart Matching
        </h2>
        <p className="section-description">
          Gemini AI matches available volunteers to community needs based on
          skills, proximity, and urgency.
        </p>
      </div>

      {/* Status Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon" aria-hidden="true">📋</div>
          <div className="stat-value">{needs.length}</div>
          <div className="stat-label">Needs Available</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" aria-hidden="true">👥</div>
          <div className="stat-value">{volunteers.length}</div>
          <div className="stat-label">Volunteers Ready</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" aria-hidden="true">🎯</div>
          <div className="stat-value">{result?.matches?.length || '—'}</div>
          <div className="stat-label">Matches Made</div>
        </div>
      </div>

      {!canMatch ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-state-icon" aria-hidden="true">🔗</div>
            <p className="empty-state-text">Both needs and volunteers are required</p>
            <p className="empty-state-hint">
              Extract needs in the <strong>AI Parser</strong> tab and register
              volunteers in the <strong>Volunteers</strong> tab first.
            </p>
          </div>
        </div>
      ) : (
        <div className="card" style={{ marginBottom: '16px' }}>
          <button
            className="btn-primary"
            onClick={handleMatch}
            disabled={loading}
            aria-busy={loading}
            style={{ width: '100%' }}
          >
            {loading ? (
              <span className="loading-spinner">
                <span className="spinner" aria-hidden="true"></span>
                Gemini AI is matching volunteers...
              </span>
            ) : (
              '🎯 Run AI Matching'
            )}
          </button>
        </div>
      )}

      {error && (
        <div className="alert alert-error" role="alert" aria-live="assertive">
          ⚠️ {error}
        </div>
      )}

      {result && (
        <>
          {/* Matches */}
          {result.matches.length > 0 && (
            <div className="card" style={{ marginBottom: '16px' }}>
              <h3 className="card-title" style={{ marginBottom: '16px' }}>
                ✅ Matched Assignments ({result.matches.length})
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {result.matches.map((match, i) => (
                  <div key={i} className="match-card">
                    <div className={`match-score ${getScoreClass(match.matchScore)}`}>
                      {match.matchScore}%
                    </div>
                    <div className="match-info">
                      <div className="match-title">
                        {match.volunteerName} → {match.needTitle}
                      </div>
                      <div className="match-reason">{match.reason}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Unmatched */}
          {result.unmatchedNeeds.length > 0 && (
            <div className="card" style={{ marginBottom: '16px' }}>
              <h3 className="card-title" style={{ marginBottom: '12px' }}>
                ⚠️ Unmatched Needs ({result.unmatchedNeeds.length})
              </h3>
              {result.unmatchedNeeds.map((need, i) => (
                <div key={i} style={{ padding: '8px 0', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                  • {need}
                </div>
              ))}
            </div>
          )}

          {/* Suggestions */}
          {result.suggestions.length > 0 && (
            <div className="card">
              <h3 className="card-title" style={{ marginBottom: '12px' }}>
                💡 AI Suggestions
              </h3>
              <ul className="insights-list">
                {result.suggestions.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}
    </div>
  );
}
