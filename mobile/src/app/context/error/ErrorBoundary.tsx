import * as Sentry from "@sentry/react-native";

import React, { Component, ReactNode } from "react";

import * as Updates from "expo-updates";

import { log } from "@/utils/logging";

import { ErrorFallback } from "./ErrorFallback";

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: (error: Error, resetError: () => void) => ReactNode;
}

export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    Sentry.captureException(error, {
      contexts: {
        react: {
          componentStack: errorInfo.componentStack
        }
      },
      tags: {
        errorBoundary: true
      }
    });
  }

  resetError = async () => {
    try {
      this.setState({
        hasError: false,
        error: null
      });

      log("ErrorBoundary: Reloading app after error", "info");
      await Updates.reloadAsync();
    } catch (reloadError) {
      log(`ErrorBoundary: Failed to reload app - ${reloadError}`, "error");
      this.setState({
        hasError: false,
        error: null
      });
    }
  };

  render() {
    if (this.state.hasError && this.state.error) {
      if (this.props.fallback) {
        return this.props.fallback(this.state.error, this.resetError);
      }

      return (
        <ErrorFallback error={this.state.error} resetError={this.resetError} />
      );
    }

    return this.props.children;
  }
}
