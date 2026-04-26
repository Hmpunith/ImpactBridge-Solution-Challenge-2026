/**
 * @fileoverview Accessibility tests for ImpactBridge.
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

describe('Accessibility', () => {
  it('should have a single h1', () => {
    render(<App />);
    const headings = screen.getAllByRole('heading', { level: 1 });
    expect(headings).toHaveLength(1);
  });

  it('should have skip link targeting main content', () => {
    render(<App />);
    const skipLink = screen.getByText('Skip to main content');
    expect(skipLink).toHaveAttribute('href', '#main-content');
  });

  it('should have main landmark with id', () => {
    render(<App />);
    const main = screen.getByRole('main');
    expect(main).toHaveAttribute('id', 'main-content');
  });

  it('should have banner landmark', () => {
    render(<App />);
    expect(screen.getByRole('banner')).toBeInTheDocument();
  });

  it('should have contentinfo landmark', () => {
    render(<App />);
    expect(screen.getByRole('contentinfo')).toBeInTheDocument();
  });

  it('should have tablist navigation', () => {
    render(<App />);
    expect(screen.getByRole('tablist')).toBeInTheDocument();
  });

  it('should have aria-selected on active tab', () => {
    render(<App />);
    const tabs = screen.getAllByRole('tab');
    const activeTab = tabs.find((t) => t.getAttribute('aria-selected') === 'true');
    expect(activeTab).toBeTruthy();
  });

  it('should have aria-current on active tab', () => {
    render(<App />);
    const tabs = screen.getAllByRole('tab');
    const currentTab = tabs.find((t) => t.getAttribute('aria-current') === 'page');
    expect(currentTab).toBeTruthy();
  });

  it('should have tabpanel role on content', () => {
    render(<App />);
    expect(screen.getByRole('tabpanel')).toBeInTheDocument();
  });

  it('should have status region for announcements', () => {
    render(<App />);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });
});
