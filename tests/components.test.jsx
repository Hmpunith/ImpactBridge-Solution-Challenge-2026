/**
 * @fileoverview Component tests for ImpactBridge.
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

vi.mock('../src/firebase', () => ({
  trackEvent: vi.fn(),
  signInWithGoogle: vi.fn(),
  logOut: vi.fn(),
  onAuthChange: vi.fn((cb) => { cb(null); return () => {}; }),
}));

import App from '../src/App';
import ErrorBoundary from '../src/components/ErrorBoundary';
import NeedsDashboard from '../src/components/NeedsDashboard';
import NeedExtractor from '../src/components/NeedExtractor';
import VolunteerForm from '../src/components/VolunteerForm';
import VolunteerMatcher from '../src/components/VolunteerMatcher';
import ImpactTracker from '../src/components/ImpactTracker';

describe('App Component', () => {
  it('renders the app title', () => {
    render(<App />);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('ImpactBridge');
  });

  it('renders navigation tabs', () => {
    render(<App />);
    expect(screen.getByRole('tab', { name: /Dashboard/ })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /AI Parser/ })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Volunteers/ })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /AI Match/ })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Impact/ })).toBeInTheDocument();
  });

  it('renders skip link', () => {
    render(<App />);
    expect(screen.getByText('Skip to main content')).toHaveAttribute('href', '#main-content');
  });

  it('renders sign in button when no user', () => {
    render(<App />);
    expect(screen.getByText(/Sign In with Google/)).toBeInTheDocument();
  });

  it('renders footer with team name', () => {
    render(<App />);
    expect(screen.getByText(/Team Parsec/)).toBeInTheDocument();
  });
});

describe('NeedsDashboard', () => {
  it('renders empty state when no needs', () => {
    render(<NeedsDashboard needs={[]} />);
    expect(screen.getByText('No needs extracted yet')).toBeInTheDocument();
  });

  it('renders needs when provided', () => {
    const needs = [{
      title: 'Test Need', description: 'Desc', category: 'Education',
      urgency: 'high', estimatedVolunteers: 5, skills: ['teaching'], location: 'Test'
    }];
    render(<NeedsDashboard needs={needs} />);
    expect(screen.getByText(/Test Need/)).toBeInTheDocument();
  });

  it('shows correct stats', () => {
    const needs = [
      { title: 'A', urgency: 'critical', category: 'Education', description: '', estimatedVolunteers: 1, skills: [], location: '' },
      { title: 'B', urgency: 'high', category: 'Healthcare', description: '', estimatedVolunteers: 2, skills: [], location: '' },
    ];
    render(<NeedsDashboard needs={needs} />);
    expect(screen.getByText('Total Needs').previousSibling).toHaveTextContent('2');
  });
});

describe('NeedExtractor', () => {
  it('renders the parser interface', () => {
    render(<NeedExtractor onExtracted={() => {}} />);
    expect(screen.getByText(/AI Data Parser/)).toBeInTheDocument();
  });

  it('renders sample data button', () => {
    render(<NeedExtractor onExtracted={() => {}} />);
    expect(screen.getByText(/Load Sample Data/)).toBeInTheDocument();
  });

  it('renders the extract button disabled when empty', () => {
    render(<NeedExtractor onExtracted={() => {}} />);
    expect(screen.getByText(/Extract Needs with AI/)).toBeDisabled();
  });
});

describe('VolunteerForm', () => {
  it('renders the registration form', () => {
    render(<VolunteerForm onVolunteerAdded={() => {}} volunteers={[]} />);
    expect(screen.getByRole('heading', { name: /Register Volunteer/ })).toBeInTheDocument();
  });

  it('renders skill chips', () => {
    render(<VolunteerForm onVolunteerAdded={() => {}} volunteers={[]} />);
    expect(screen.getByRole('button', { name: 'Teaching' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Medical' })).toBeInTheDocument();
  });

  it('renders empty volunteer list', () => {
    render(<VolunteerForm onVolunteerAdded={() => {}} volunteers={[]} />);
    expect(screen.getByText('No volunteers registered yet')).toBeInTheDocument();
  });
});

describe('VolunteerMatcher', () => {
  it('shows requirement message when no data', () => {
    render(<VolunteerMatcher needs={[]} volunteers={[]} />);
    expect(screen.getByText('Both needs and volunteers are required')).toBeInTheDocument();
  });
});

describe('ImpactTracker', () => {
  it('shows empty state with no data', () => {
    render(<ImpactTracker needs={[]} volunteers={[]} />);
    expect(screen.getByText('No impact data yet')).toBeInTheDocument();
  });

  it('shows stats when data exists', () => {
    const needs = [{ urgency: 'critical', estimatedVolunteers: 5 }];
    render(<ImpactTracker needs={needs} volunteers={[{ skills: ['teaching'] }]} />);
    expect(screen.getByText('Needs Identified').previousSibling).toHaveTextContent('1');
  });
});

describe('ErrorBoundary', () => {
  it('renders children normally', () => {
    render(<ErrorBoundary><div>Content</div></ErrorBoundary>);
    expect(screen.getByText('Content')).toBeInTheDocument();
  });
});
