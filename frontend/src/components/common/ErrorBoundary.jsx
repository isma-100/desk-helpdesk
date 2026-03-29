import React from 'react';
import { ShieldExclamationIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    // In production, send to error tracking service (e.g. Sentry)
    if (process.env.NODE_ENV === 'production') {
      console.error('ErrorBoundary caught:', error, errorInfo);
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
          <div className="max-w-md w-full text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-2xl mb-6">
              <ShieldExclamationIcon className="w-9 h-9 text-red-500" />
            </div>
            <h1 className="text-xl font-semibold text-slate-800 mb-2">Something went wrong</h1>
            <p className="text-sm text-slate-500 mb-6 leading-relaxed">
              An unexpected error occurred. Please try refreshing the page.
              If the problem persists, contact IT support.
            </p>
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mb-6 text-left">
                <summary className="text-xs font-medium text-slate-400 cursor-pointer hover:text-slate-600 mb-2">
                  Error details (dev only)
                </summary>
                <pre className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg p-3 overflow-auto max-h-40 font-mono">
                  {this.state.error.toString()}
                  {this.state.errorInfo?.componentStack}
                </pre>
              </details>
            )}
            <button onClick={this.handleReset} className="btn btn-primary gap-2">
              <ArrowPathIcon className="w-4 h-4" />
              Go to Dashboard
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

// Higher-order component for wrapping individual sections
export const withErrorBoundary = (Component, fallback = null) => {
  return function WrappedComponent(props) {
    return (
      <ErrorBoundary fallback={fallback}>
        <Component {...props} />
      </ErrorBoundary>
    );
  };
};
