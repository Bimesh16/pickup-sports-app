import React from 'react';

type Props = {
  children: React.ReactNode;
  fallback?: React.ReactNode | ((error: any, reset: () => void) => React.ReactNode);
};

type State = { hasError: boolean; error: any };

export class ErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: any): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: any, info: any) {
    // eslint-disable-next-line no-console
    console.error('UI ErrorBoundary caught an error', error, info);
  }

  reset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      const { fallback } = this.props;
      if (typeof fallback === 'function') {
        return (fallback as (error: any, reset: () => void) => React.ReactNode)(this.state.error, this.reset);
      }
      if (fallback) return fallback;

      const msg = (this.state.error && (this.state.error.message || String(this.state.error))) || 'Something went wrong.';
      return (
        <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: 'linear-gradient(135deg,#0f172a,#111827)' }}>
          <div style={{ maxWidth: 520, padding: 24, borderRadius: 16, background: 'rgba(255,255,255,0.08)', color: 'white', textAlign: 'center', boxShadow: '0 10px 30px rgba(0,0,0,0.35)' }}>
            <div style={{ fontSize: 56, lineHeight: 1, marginBottom: 8 }}>😬</div>
            <h2 style={{ margin: '0 0 8px', fontSize: 22, fontWeight: 800 }}>We dropped the ball</h2>
            <p style={{ margin: '0 0 16px', color: 'rgba(255,255,255,0.8)' }}>{msg}</p>
            <button onClick={this.reset} style={{ padding: '10px 16px', borderRadius: 12, background: '#ef4444', color: 'white', border: 'none', fontWeight: 700, cursor: 'pointer' }}>Try again</button>
          </div>
        </div>
      );
    }
    return this.props.children as React.ReactElement;
  }
}

export function withErrorBoundary<T>(Component: React.ComponentType<T>, fallback?: Props['fallback']) {
  return function Wrapped(props: T) {
    return (
      <ErrorBoundary fallback={fallback}>
        <Component {...props} />
      </ErrorBoundary>
    );
  };
}

