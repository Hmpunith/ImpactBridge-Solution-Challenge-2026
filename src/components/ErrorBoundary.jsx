import React from 'react';

/**
 * React Error Boundary — catches rendering errors gracefully.
 */
export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div role="alert" className="card" style={{ margin: '24px', textAlign: 'center' }}>
          <h2>⚠️ Something went wrong</h2>
          <p style={{ color: 'var(--text-secondary)', marginTop: '8px' }}>
            {this.state.error?.message || 'An unexpected error occurred.'}
          </p>
          <button
            className="btn-primary"
            style={{ marginTop: '16px' }}
            onClick={() => this.setState({ hasError: false, error: null })}
          >
            Try Again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
