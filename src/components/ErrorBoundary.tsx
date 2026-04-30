import React, { Component, ReactNode, ErrorInfo } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = {
    hasError: false,
    error: null
  };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      let message = 'Something went wrong.';
      try {
        const errorData = JSON.parse(this.state.error?.message || '{}');
        if (errorData.error && errorData.error.includes('Missing or insufficient permissions')) {
          message = 'You do not have permission to perform this action. Please check your admin status.';
        } else if (errorData.error && errorData.error.includes('Could not connect to the database')) {
          message = 'Unable to reach the database. This is usually caused by an adblocker (like Brave Shields), strict network proxy, or temporary connection issues.';
        }
      } catch (e) {
        // Not a JSON error
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-6 text-center">
          <div className="max-w-md">
            <h1 className="text-4xl font-medium tracking-tighter mb-4">Oops!</h1>
            <p className="text-gray-500 mb-8">{message}</p>
            <button 
              onClick={() => window.location.reload()}
              className="bg-[#1F2021] text-white px-8 py-3 rounded-full text-sm font-medium hover:bg-gray-800 transition-all"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return (this as any).props.children;
  }
}
