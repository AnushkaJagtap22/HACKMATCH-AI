import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    // In production: send to Sentry / LogRocket
    console.error('ErrorBoundary caught:', error, info.componentStack);
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div style={{
        minHeight: '100vh',
        background: 'var(--ink)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
      }}>
        <div style={{ textAlign: 'center', maxWidth: 480 }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚡</div>
          <h2 style={{
            fontFamily: 'var(--font-display)',
            color: 'var(--text)',
            marginBottom: '0.75rem',
            fontWeight: 300,
          }}>
            Something went wrong
          </h2>
          <p style={{ color: 'var(--text-2)', marginBottom: '2rem', lineHeight: 1.6 }}>
            An unexpected error occurred. This has been logged and we'll look into it.
          </p>
          {process.env.NODE_ENV === 'development' && this.state.error && (
            <pre style={{
              background: 'var(--surface)',
              border: '1px solid rgba(240,92,122,0.3)',
              borderRadius: 8,
              padding: '1rem',
              fontSize: 12,
              fontFamily: 'var(--font-mono)',
              color: 'var(--rose)',
              textAlign: 'left',
              overflow: 'auto',
              marginBottom: '1.5rem',
              maxHeight: 200,
            }}>
              {this.state.error.toString()}
            </pre>
          )}
          <button
            className="btn btn-primary"
            onClick={() => {
              this.setState({ hasError: false, error: null });
              window.location.href = '/dashboard';
            }}
          >
            Return to dashboard
          </button>
        </div>
      </div>
    );
  }
}
