import React from 'react';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';
import logger from '../utils/logger';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    logger.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({
      error,
      errorInfo
    });
    
    // TODO: Send to error tracking service
    // Sentry.captureException(error, { extra: errorInfo });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <ErrorFallback
          error={this.state.error}
          errorInfo={this.state.errorInfo}
          onReset={this.handleReset}
        />
      );
    }

    return this.props.children;
  }
}

const ErrorFallback = ({ error, errorInfo, onReset }) => {
  const [showDetails, setShowDetails] = React.useState(false);
  const isDev = import.meta.env.DEV;

  const handleTryAgain = () => {
    // Reload the page to reset everything
    window.location.reload();
  };

  const handleGoHome = () => {
    window.location.href = '/dashboard';
  };

  // Format error message for display
  const getErrorMessage = () => {
    if (!error) return 'Unknown error occurred';
    
    // Try to extract a meaningful error message
    if (error.message) return error.message;
    if (typeof error === 'string') return error;
    return error.toString();
  };

  // Format error stack/details
  const getErrorDetails = () => {
    const parts = [];
    
    if (error?.stack) {
      parts.push('Stack Trace:');
      parts.push(error.stack);
    }
    
    if (errorInfo?.componentStack) {
      parts.push('\nComponent Stack:');
      parts.push(errorInfo.componentStack);
    }
    
    if (error?.toString && error.toString() !== getErrorMessage()) {
      parts.push('\nFull Error:');
      parts.push(error.toString());
    }
    
    return parts.join('\n');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-purple-950 to-slate-900 p-4">
      <div className="max-w-2xl w-full bg-gradient-to-br from-red-900/40 to-slate-900/40 backdrop-blur-xl rounded-2xl p-8 border border-red-700/30 shadow-2xl">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-red-600/20 rounded-full mb-4">
            <AlertCircle className="w-10 h-10 text-red-400" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Oops! Something went wrong</h1>
          <p className="text-red-200/80">
            We're sorry for the inconvenience. The error has been logged and we'll look into it.
          </p>
        </div>

        {/* Always show error message */}
        {error && (
          <div className="mb-6 p-4 bg-red-900/30 rounded-lg border border-red-700/50">
            <div className="flex items-start justify-between mb-2">
              <h3 className="text-sm font-semibold text-red-300">Error Message:</h3>
              <button
                onClick={() => setShowDetails(!showDetails)}
                className="text-xs text-red-300 hover:text-red-200 underline"
              >
                {showDetails ? 'Hide Details' : 'Show Details'}
              </button>
            </div>
            <p className="text-sm text-red-200/90 font-mono mb-2 break-words">
              {getErrorMessage()}
            </p>
            
            {/* Show detailed error info when expanded */}
            {showDetails && getErrorDetails() && (
              <div className="mt-3 pt-3 border-t border-red-700/50">
                <pre className="text-xs text-red-200/70 overflow-auto max-h-60 font-mono whitespace-pre-wrap break-words">
                  {getErrorDetails()}
                </pre>
              </div>
            )}
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleTryAgain}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-purple-500/50 transition-all"
          >
            <RefreshCw className="w-5 h-5" />
            Try Again
          </button>
          <button
            onClick={handleGoHome}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-white/10 text-white font-semibold rounded-xl hover:bg-white/20 transition-all border border-white/20"
          >
            <Home className="w-5 h-5" />
            Go Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default ErrorBoundary;

