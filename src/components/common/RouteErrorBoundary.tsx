import { useRouteError, isRouteErrorResponse, useNavigate } from 'react-router-dom';
import { AlertTriangle, ArrowLeft, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useTranslation } from 'react-i18next';

/**
 * A component that displays route errors in a user-friendly way.
 * This is designed to be used with React Router's errorElement prop.
 */
const RouteErrorBoundary = () => {
  const error = useRouteError();
  const navigate = useNavigate();
  const { t } = useTranslation();

  // Extract error details based on the type of error
  let errorTitle = t('errors.something_went_wrong');
  let errorMessage = t('errors.unexpected_error');
  let statusCode: number | null = null;

  // Handle React Router error responses
  if (isRouteErrorResponse(error)) {
    statusCode = error.status;
    errorMessage = error.data?.message || error.statusText;

    // Set specific error titles based on status code
    if (error.status === 404) {
      errorTitle = t('errors.not_found');
      errorMessage = t('errors.page_not_found_message');
    } else if (error.status === 401) {
      errorTitle = t('errors.unauthorized');
      errorMessage = t('errors.login_required');
    } else if (error.status === 403) {
      errorTitle = t('errors.forbidden');
      errorMessage = t('errors.access_denied');
    } else if (error.status >= 500) {
      errorTitle = t('errors.server_error');
      errorMessage = t('errors.server_problem');
    }
  }
  // Handle standard Error objects
  else if (error instanceof Error) {
    errorMessage = error.message;
    // Check for network errors
    if (error.name === 'NetworkError' || errorMessage.includes('network')) {
      errorTitle = t('errors.network_error');
      errorMessage = t('errors.check_connection');
    }
  }

  // Log the error for debugging
  console.error('Route error:', error);

  return (
    <div className="flex items-center justify-center min-h-[70vh] p-4">
      <Card className="w-full max-w-md border-destructive/20">
        <CardHeader className="pb-2">
          <div className="flex justify-center mb-4">
            <div className="p-3 rounded-full bg-destructive/10">
              <AlertTriangle className="h-8 w-8 text-destructive" />
            </div>
          </div>
          <CardTitle className="text-xl text-center">
            {statusCode ? `${statusCode} - ${errorTitle}` : errorTitle}
          </CardTitle>
        </CardHeader>

        <CardContent>
          <p className="text-muted-foreground text-center">{errorMessage}</p>
        </CardContent>

        <CardFooter className="flex gap-2 justify-center">
          <Button
            variant="outline"
            onClick={() => navigate(-1)}
            className="gap-1"
          >
            <ArrowLeft className="h-4 w-4" />
            {t('common.go_back')}
          </Button>

          <Button
            onClick={() => window.location.reload()}
            className="gap-1"
          >
            <RefreshCw className="h-4 w-4" />
            {t('common.refresh')}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default RouteErrorBoundary;
