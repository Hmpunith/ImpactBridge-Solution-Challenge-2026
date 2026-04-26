/**
 * @fileoverview Main App component for ImpactBridge.
 * Manages tab navigation, user state, and renders all views.
 *
 * @version 1.0.0
 */

import { useState, useEffect, useCallback } from 'react';
import ErrorBoundary from './components/ErrorBoundary';
import NeedExtractor from './components/NeedExtractor';
import NeedsDashboard from './components/NeedsDashboard';
import VolunteerForm from './components/VolunteerForm';
import VolunteerMatcher from './components/VolunteerMatcher';
import ImpactTracker from './components/ImpactTracker';
import { TABS } from './constants';
import { signInWithGoogle, logOut, onAuthChange, trackEvent } from './firebase';
import './index.css';

/**
 * Main application component with tab navigation.
 * @returns {JSX.Element}
 */
function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [user, setUser] = useState(null);
  const [extractedNeeds, setExtractedNeeds] = useState([]);
  const [volunteers, setVolunteers] = useState([]);
  const [statusMessage, setStatusMessage] = useState('');

  useEffect(() => {
    const unsubscribe = onAuthChange((u) => setUser(u));
    return unsubscribe;
  }, []);

  const handleTabChange = useCallback((tabId) => {
    setActiveTab(tabId);
    trackEvent('tab_change', { tab: tabId });
  }, []);

  const handleSignIn = async () => {
    try {
      await signInWithGoogle();
      setStatusMessage('Signed in successfully');
    } catch (err) {
      setStatusMessage('Sign in failed: ' + err.message);
    }
  };

  const handleSignOut = async () => {
    await logOut();
    setStatusMessage('Signed out');
  };

  const handleNeedsExtracted = (needs) => {
    setExtractedNeeds((prev) => [...needs, ...prev]);
    setStatusMessage(`${needs.length} needs extracted successfully`);
    trackEvent('needs_extracted', { count: needs.length });
  };

  const handleVolunteerAdded = (volunteer) => {
    setVolunteers((prev) => [volunteer, ...prev]);
    setStatusMessage('Volunteer registered successfully');
  };

  const renderView = () => {
    switch (activeTab) {
      case 'dashboard':
        return <NeedsDashboard needs={extractedNeeds} />;
      case 'extract':
        return <NeedExtractor onExtracted={handleNeedsExtracted} />;
      case 'volunteers':
        return <VolunteerForm onVolunteerAdded={handleVolunteerAdded} volunteers={volunteers} />;
      case 'match':
        return <VolunteerMatcher needs={extractedNeeds} volunteers={volunteers} />;
      case 'impact':
        return <ImpactTracker needs={extractedNeeds} volunteers={volunteers} />;
      default:
        return <NeedsDashboard needs={extractedNeeds} />;
    }
  };

  return (
    <>
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      <header className="app-header" role="banner">
        <div className="app-logo">
          <span className="app-logo-icon" aria-hidden="true">🌉</span>
          <div>
            <h1 className="app-title">ImpactBridge</h1>
            <span className="app-subtitle">AI-Powered Volunteer Coordination</span>
          </div>
        </div>
        <span role="status" aria-live="polite" className="sr-only">
          {statusMessage}
        </span>
        <div className="auth-section">
          {user ? (
            <>
              <div className="auth-user">
                {user.photoURL && <img src={user.photoURL} alt="" />}
                <span>{user.displayName || 'User'}</span>
              </div>
              <button className="btn-auth" onClick={handleSignOut}>
                Sign Out
              </button>
            </>
          ) : (
            <button className="btn-auth" onClick={handleSignIn}>
              🔑 Sign In with Google
            </button>
          )}
        </div>
      </header>

      <nav className="app-nav" role="tablist" aria-label="Main navigation">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            role="tab"
            className={`nav-tab ${activeTab === tab.id ? 'active' : ''}`}
            aria-selected={activeTab === tab.id}
            aria-controls={`panel-${tab.id}`}
            aria-current={activeTab === tab.id ? 'page' : undefined}
            onClick={() => handleTabChange(tab.id)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleTabChange(tab.id);
              }
            }}
          >
            <span className="nav-tab-icon" aria-hidden="true">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </nav>

      <main id="main-content" className="app-main">
        <ErrorBoundary>
          <section
            role="tabpanel"
            id={`panel-${activeTab}`}
            aria-labelledby={`tab-${activeTab}`}
          >
            {renderView()}
          </section>
        </ErrorBoundary>
      </main>

      <footer className="app-footer" role="contentinfo">
        <p>
          🌉 ImpactBridge — Built with Google Gemini AI, Firebase &amp; Cloud Run
          <br />
          <span>Team Parsec • Solution Challenge 2026</span>
        </p>
      </footer>
    </>
  );
}

export default App;
