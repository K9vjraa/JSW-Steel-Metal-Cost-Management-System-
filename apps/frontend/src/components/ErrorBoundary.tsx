import { Component, type ErrorInfo, type ReactNode } from "react";
import { Page500 } from "../pages/ErrorPages";
import { logger } from "../utils/logger";

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = {
    hasError: false,
    error: null
  };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // capturing trace inside diagnostic logs ring buffer
    logger.error(`UI RENDER CRASH: ${error.message}`, {
      stack: error.stack,
      componentStack: info.componentStack
    });
  }

  reset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <Page500 
          error={this.state.error || new Error("Unknown rendering error occurred")} 
          resetErrorBoundary={this.reset} 
        />
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
