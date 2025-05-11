import { ReactNode } from "react";
// Original imports commented out for reference
// import { Navigate, useLocation } from "react-router-dom";
// import { useAuth } from "@/hooks/useAuth";
// import LoadingState from "@/components/ui/loading-state";

interface ProtectedRouteProps {
  children: ReactNode;
  redirectTo?: string;
}

/**
 * A wrapper component that protects routes requiring authentication.
 * TEMPORARILY MODIFIED: Authentication check is bypassed to allow access without login.
 */
const ProtectedRoute = ({
  children,
  // redirectTo parameter kept for API compatibility
  redirectTo = "/login"
}: ProtectedRouteProps) => {
  // Original authentication code commented out
  // const { isAuthenticated, isLoading } = useAuth();
  // const location = useLocation();

  // TEMPORARILY DISABLED: Authentication check is bypassed
  // Always render the protected content regardless of authentication status
  return <>{children}</>;

  /* ORIGINAL CODE (COMMENTED OUT):
  // If authentication is still loading, show a loading state
  if (isLoading) {
    return <LoadingState />;
  }

  // If not authenticated, redirect to login with the return URL
  if (!isAuthenticated) {
    return (
      <Navigate
        to={redirectTo}
        state={{ from: location.pathname }}
        replace
      />
    );
  }

  // If authenticated, render the protected content
  return <>{children}</>;
  */
};

export default ProtectedRoute;
