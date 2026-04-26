/**
 * @fileoverview Needs Dashboard component.
 * Displays extracted community needs in filterable card grid.
 */

import { useState } from 'react';
import { CATEGORIES, URGENCY_LEVELS } from '../constants';

/**
 * NeedsDashboard — Shows all extracted needs with filters.
 * @param {object} props
 * @param {Array} props.needs - Array of need objects
 */
export default function NeedsDashboard({ needs }) {
  const [filter, setFilter] = useState('all');

  const filteredNeeds = filter === 'all'
    ? needs
    : needs.filter((n) => n.urgency === filter);

  const urgencyCounts = {
    critical: needs.filter((n) => n.urgency === 'critical').length,
    high: needs.filter((n) => n.urgency === 'high').length,
    medium: needs.filter((n) => n.urgency === 'medium').length,
    low: needs.filter((n) => n.urgency === 'low').length,
  };

  return (
    <div>
      <div className="section-header">
        <h2 className="section-title">
          <span aria-hidden="true">📊</span> Needs Dashboard
        </h2>
        <p className="section-description">
          All community needs extracted by AI, prioritized by urgency.
        </p>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon" aria-hidden="true">📋</div>
          <div className="stat-value">{needs.length}</div>
          <div className="stat-label">Total Needs</div>
        </div>
        {Object.entries(URGENCY_LEVELS).map(([key, val]) => (
          <div key={key} className="stat-card">
            <div className="stat-value" style={{ color: val.color }}>
              {urgencyCounts[key]}
            </div>
            <div className="stat-label">{val.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      {needs.length > 0 && (
        <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
          <button
            className={`skill-chip ${filter === 'all' ? 'selected' : ''}`}
            onClick={() => setFilter('all')}
            aria-pressed={filter === 'all'}
          >
            All ({needs.length})
          </button>
          {Object.entries(URGENCY_LEVELS).map(([key, val]) => (
            <button
              key={key}
              className={`skill-chip ${filter === key ? 'selected' : ''}`}
              onClick={() => setFilter(key)}
              aria-pressed={filter === key}
            >
              {val.label} ({urgencyCounts[key]})
            </button>
          ))}
        </div>
      )}

      {/* Needs Grid */}
      {filteredNeeds.length > 0 ? (
        <div className="needs-grid">
          {filteredNeeds.map((need, i) => (
            <div key={i} className={`need-card ${need.urgency}`}>
              <div className="need-header">
                <span className="need-title">
                  {CATEGORIES.find((c) => c.id === need.category)?.icon || '📋'}{' '}
                  {need.title}
                </span>
                <span className={`urgency-badge ${need.urgency}`}>{need.urgency}</span>
              </div>
              <p className="need-description">{need.description}</p>
              <div className="need-meta">
                <span className="need-tag">{need.category}</span>
                <span className="need-tag">👥 {need.estimatedVolunteers}</span>
                {need.skills.slice(0, 3).map((s, j) => (
                  <span key={j} className="need-tag">{s}</span>
                ))}
              </div>
              <div className="need-location">📍 {need.location}</div>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <div className="empty-state-icon" aria-hidden="true">🔍</div>
          <p className="empty-state-text">No needs extracted yet</p>
          <p className="empty-state-hint">
            Go to the <strong>AI Parser</strong> tab to extract needs from community data.
          </p>
        </div>
      )}
    </div>
  );
}
