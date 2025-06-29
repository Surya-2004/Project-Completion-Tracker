import React from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center">
              <AlertTriangle className="w-12 h-12 text-red-500" />
            </div>
            <h2 className="text-xl font-semibold">Something went wrong</h2>
            <p className="text-muted-foreground max-w-md">
              An unexpected error occurred while loading the interview data. 
              Please try refreshing the page or contact support if the issue persists.
            </p>
            <Button onClick={this.handleRetry} className="flex items-center gap-2">
              <RefreshCw className="w-4 h-4" />
              Retry
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary; 