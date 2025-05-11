import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { withTranslation, WithTranslation } from 'react-i18next';

interface Props extends WithTranslation {
  children: ReactNode;
  fallback?: ReactNode;
  onReset?: () => void;
  showHomeButton?: boolean;
  logErrorToService?: boolean;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

/**
 * Enhanced error boundary component to catch and display errors gracefully
 * with improved UI and error reporting
 */
class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error to console
    console.error("Uncaught error:", error, errorInfo);

    // Store error info in state for potential display
    this.setState({ errorInfo });

    // Log to error reporting service if enabled
    if (this.props.logErrorToService) {
      // This would be where you'd send to your error reporting service
      // Example: errorReportingService.captureException(error, { extra: errorInfo });
      console.log("Error would be reported to service:", error.message);
    }
  }

  private handleReset = () => {
    // Reset the error state
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });

    // Call the onReset prop if provided
    if (this.props.onReset) {
      this.props.onReset();
    }

    // Show a toast notification
    toast.success(this.props.t('errors.application_recovered'));
  };

  public render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="flex items-center justify-center min-h-[70vh] p-4">
          <Card className="w-full max-w-md border-destructive/20">
            <CardHeader className="pb-2">
              <div className="flex justify-center mb-4">
                <div className="p-3 rounded-full bg-destructive/10">
                  <AlertTriangle className="h-8 w-8 text-destructive" />
                </div>
              </div>
              <CardTitle className="text-xl text-center">
                {this.props.t('errors.something_went_wrong')}
              </CardTitle>
            </CardHeader>

            <CardContent>
              <p className="text-muted-foreground text-center mb-4">
                {this.state.error?.message || this.props.t('errors.unexpected_error')}
              </p>

              {/* Show stack trace in development environment */}
              {process.env.NODE_ENV === 'development' && this.state.error?.stack && (
                <div className="mt-4 p-3 bg-muted rounded-md overflow-auto max-h-[200px] text-xs">
                  <pre>{this.state.error.stack}</pre>
                </div>
              )}
            </CardContent>

            <CardFooter className="flex gap-2 justify-center">
              <Button
                onClick={this.handleReset}
                className="gap-1"
              >
                <RefreshCw className="h-4 w-4" />
                {this.props.t('common.try_again')}
              </Button>

              {this.props.showHomeButton && (
                <Button
                  variant="outline"
                  asChild
                  className="gap-1"
                >
                  <Link to="/">
                    <Home className="h-4 w-4" />
                    {this.props.t('common.go_home')}
                  </Link>
                </Button>
              )}
            </CardFooter>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

export default withTranslation()(ErrorBoundary);
