import React from 'react';

import styles from './ErrorFallback.module.css';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('App Error Boundary caught an error:', error, errorInfo);
  }

  private handleReload = () => {
    this.setState({ hasError: false, error: undefined });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className={styles.wrapper} role="alert">
          <div className={styles.surface}>
            <span className={styles.icon} aria-hidden="true">
              ⚠️
            </span>
            <h1 className={styles.title}>Something went wrong.</h1>
            <p className={styles.copy}>
              We hit an unexpected issue while loading this experience. Try refreshing the page or
              return to the marketplace overview.
            </p>

            <div className={styles.actions}>
              <button type="button" onClick={this.handleReload} className="btn btn-primary">
                Reload page
              </button>
              <a href="/" className="btn btn-secondary">
                Go to homepage
              </a>
            </div>

            {this.state.error && (
              <details className={styles.details}>
                <summary>Technical details</summary>
                <pre>{`${this.state.error.message}\n${this.state.error.stack ?? ''}`}</pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
