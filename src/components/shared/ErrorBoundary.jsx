import React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';

/**
 * Generic React error boundary.
 *
 * Wrap around route groups or individual page sections so a single
 * component crash doesn't take down the whole app.
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
    console.error('[ErrorBoundary] Uncaught error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  handleGoHome = () => {
    window.location.href = '/Home';
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex flex-col items-center justify-center py-20 px-4 text-center max-w-md mx-auto">
          <div className="w-16 h-16 rounded-2xl bg-destructive/10 flex items-center justify-center mx-auto mb-5">
            <AlertTriangle className="w-8 h-8 text-destructive" />
          </div>
          <h2 className="font-display text-xl font-bold text-foreground mb-2">
            Ups! Nešto je pošlo po krivu.
          </h2>
          <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
            Dogodila se neočekivana greška. Pokušajte osvježiti stranicu ili se vratite na početnu.
          </p>

          {import.meta.env.DEV && this.state.error && (
            <pre className="text-xs text-left bg-muted/50 border border-border/60 rounded-xl p-4 mb-6 max-w-full overflow-x-auto whitespace-pre-wrap break-words">
              {this.state.error.message || String(this.state.error)}
            </pre>
          )}

          <div className="flex gap-3">
            <Button
              variant="outline"
              className="rounded-2xl"
              onClick={this.handleReset}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Pokušaj ponovo
            </Button>
            <Button
              className="rounded-2xl"
              onClick={this.handleGoHome}
            >
              <Home className="w-4 h-4 mr-2" />
              Početna
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}