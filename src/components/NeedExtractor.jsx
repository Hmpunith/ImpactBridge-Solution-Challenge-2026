/**
 * @fileoverview AI Need Extractor component.
 * Parses unstructured community data using Gemini AI.
 */

import { useState } from 'react';
import { SAMPLE_DATA, API_BASE } from '../constants';
import { trackEvent } from '../firebase';

/**
 * NeedExtractor — Paste survey/report text, AI extracts structured needs.
 * @param {object} props
 * @param {Function} props.onExtracted - Callback when needs are extracted
 */
export default function NeedExtractor({ onExtracted }) {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  const handleExtract = async () => {
    if (!text.trim()) {
      setError('Please enter community data to analyze.');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);
    trackEvent('extract_started', { textLength: text.length });

    try {
      const res = await fetch(`${API_BASE}/extract-needs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: text.trim() }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to extract needs');
      }

      const data = await res.json();
      setResult(data);
      onExtracted(data.needs);
      trackEvent('extract_success', { needsCount: data.needs.length });
    } catch (err) {
      setError(err.message);
      trackEvent('extract_error', { error: err.message });
    } finally {
      setLoading(false);
    }
  };

  const loadSample = () => {
    setText(SAMPLE_DATA);
    trackEvent('sample_loaded');
  };

  return (
    <div>
      <div className="section-header">
        <h2 className="section-title">
          <span aria-hidden="true">🤖</span> AI Data Parser
        </h2>
        <p className="section-description">
          Paste raw community survey data, field reports, or NGO notes. Gemini AI
          will extract structured, prioritized needs automatically.
        </p>
      </div>

      <div className="card" style={{ marginBottom: '16px' }}>
        <div className="card-header">
          <span className="card-title">📝 Raw Community Data</span>
          <button className="btn-secondary" onClick={loadSample}>
            📋 Load Sample Data
          </button>
        </div>

        <label htmlFor="community-data" className="form-label">
          Paste survey responses, field reports, or notes below:
        </label>
        <textarea
          id="community-data"
          className="textarea"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Paste your unstructured community data here..."
          aria-label="Community data text input"
          aria-describedby="data-hint"
        />
        <p id="data-hint" style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '8px' }}>
          Tip: Include details about location, urgency, and type of help needed for best results.
        </p>

        <div style={{ display: 'flex', gap: '12px', marginTop: '16px', alignItems: 'center' }}>
          <button
            className="btn-primary"
            onClick={handleExtract}
            disabled={loading || !text.trim()}
            aria-busy={loading}
          >
            {loading ? (
              <span className="loading-spinner">
                <span className="spinner" aria-hidden="true"></span>
                Analyzing with Gemini AI...
              </span>
            ) : (
              '✨ Extract Needs with AI'
            )}
          </button>
          {text && (
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              {text.length} characters
            </span>
          )}
        </div>
      </div>

      {error && (
        <div className="alert alert-error" role="alert" aria-live="assertive">
          ⚠️ {error}
        </div>
      )}

      {result && (
        <div className="card">
          <div className="alert alert-success" role="status">
            ✅ {result.summary}
          </div>
          <div className="needs-grid">
            {result.needs.map((need, i) => (
              <div key={i} className={`need-card ${need.urgency}`}>
                <div className="need-header">
                  <span className="need-title">{need.title}</span>
                  <span className={`urgency-badge ${need.urgency}`}>{need.urgency}</span>
                </div>
                <p className="need-description">{need.description}</p>
                <div className="need-meta">
                  <span className="need-tag">{need.category}</span>
                  <span className="need-tag">👥 {need.estimatedVolunteers} needed</span>
                  {need.skills.map((s, j) => (
                    <span key={j} className="need-tag">{s}</span>
                  ))}
                </div>
                <div className="need-location">📍 {need.location}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
