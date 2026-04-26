/**
 * @fileoverview Volunteer registration form.
 * Allows volunteers to sign up with skills and availability.
 */

import { useState } from 'react';
import { SKILLS } from '../constants';
import { trackEvent } from '../firebase';

/**
 * VolunteerForm — Register a volunteer + list existing ones.
 * @param {object} props
 * @param {Function} props.onVolunteerAdded - Callback
 * @param {Array} props.volunteers - Existing volunteers
 */
export default function VolunteerForm({ onVolunteerAdded, volunteers }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [location, setLocation] = useState('');
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [availability, setAvailability] = useState('weekends');
  const [success, setSuccess] = useState('');

  const toggleSkill = (skill) => {
    setSelectedSkills((prev) =>
      prev.includes(skill)
        ? prev.filter((s) => s !== skill)
        : [...prev, skill]
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim() || selectedSkills.length === 0) return;

    const volunteer = {
      name: name.trim(),
      email: email.trim(),
      location: location.trim(),
      skills: selectedSkills,
      availability,
      registeredAt: new Date().toISOString(),
    };

    onVolunteerAdded(volunteer);
    trackEvent('volunteer_form_submit', { skillCount: selectedSkills.length });
    setSuccess(`${name} registered successfully!`);
    setName('');
    setEmail('');
    setLocation('');
    setSelectedSkills([]);
    setTimeout(() => setSuccess(''), 3000);
  };

  return (
    <div>
      <div className="section-header">
        <h2 className="section-title">
          <span aria-hidden="true">👥</span> Volunteer Registry
        </h2>
        <p className="section-description">
          Register volunteers with their skills, location, and availability
          for AI-powered matching.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        {/* Registration Form */}
        <div className="card">
          <h3 className="card-title" style={{ marginBottom: '16px' }}>
            ➕ Register Volunteer
          </h3>

          {success && (
            <div className="alert alert-success" role="status" aria-live="polite">
              ✅ {success}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="vol-name" className="form-label">Full Name *</label>
              <input
                id="vol-name"
                className="input"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="e.g., Priya Sharma"
                aria-required="true"
              />
            </div>

            <div className="form-group">
              <label htmlFor="vol-email" className="form-label">Email</label>
              <input
                id="vol-email"
                className="input"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="priya@example.com"
              />
            </div>

            <div className="form-group">
              <label htmlFor="vol-location" className="form-label">Location</label>
              <input
                id="vol-location"
                className="input"
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g., Bangalore, Sector 4"
              />
            </div>

            <div className="form-group">
              <label htmlFor="vol-availability" className="form-label">Availability</label>
              <select
                id="vol-availability"
                className="input"
                value={availability}
                onChange={(e) => setAvailability(e.target.value)}
              >
                <option value="weekdays">Weekdays</option>
                <option value="weekends">Weekends</option>
                <option value="flexible">Flexible</option>
                <option value="emergency-only">Emergency Only</option>
              </select>
            </div>

            <div className="form-group">
              <span className="form-label">Skills *</span>
              <div className="skills-container" role="group" aria-label="Select volunteer skills">
                {SKILLS.map((skill) => (
                  <button
                    key={skill}
                    type="button"
                    className={`skill-chip ${selectedSkills.includes(skill) ? 'selected' : ''}`}
                    onClick={() => toggleSkill(skill)}
                    aria-pressed={selectedSkills.includes(skill)}
                  >
                    {skill}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              className="btn-primary"
              disabled={!name.trim() || selectedSkills.length === 0}
              style={{ width: '100%' }}
            >
              ✅ Register Volunteer
            </button>
          </form>
        </div>

        {/* Registered List */}
        <div className="card">
          <h3 className="card-title" style={{ marginBottom: '16px' }}>
            📋 Registered Volunteers ({volunteers.length})
          </h3>

          {volunteers.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {volunteers.map((vol, i) => (
                <div key={i} className="match-card">
                  <div className="match-score excellent" aria-label="Available">
                    👤
                  </div>
                  <div className="match-info">
                    <div className="match-title">{vol.name}</div>
                    <div className="match-subtitle">
                      📍 {vol.location || 'Not specified'} • ⏰ {vol.availability}
                    </div>
                    <div className="need-meta" style={{ marginTop: '8px' }}>
                      {vol.skills.map((s, j) => (
                        <span key={j} className="need-tag">{s}</span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-state-icon" aria-hidden="true">👤</div>
              <p className="empty-state-text">No volunteers registered yet</p>
              <p className="empty-state-hint">Fill out the form to add volunteers.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
