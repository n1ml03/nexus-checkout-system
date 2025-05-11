
import { Suspense, lazy } from "react";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClientProvider } from "@tanstack/react-query";
import { createQueryClient, preloadEssentialData } from "@/lib/react-query";
import {
  createBrowserRouter,
  RouterProvider,
  createRoutesFromElements,
  Route
} from "react-router-dom";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { CartProvider } from "@/contexts/CartContext";
import { OrderProvider } from "@/contexts/OrderContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { NotificationProvider } from "@/contexts/NotificationContext";
import { AuthProvider } from "@/contexts/AuthContext";
import ErrorBoundary from "@/components/common/ErrorBoundary";
import RouteErrorBoundary from "@/components/common/RouteErrorBoundary";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import MainLayout from "@/components/layouts/MainLayout";
import HomePage from "@/pages/HomePage";
import NotFound from "@/pages/NotFound";
import { Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";

// Lazy-loaded components for code splitting with explicit chunk names
const ProductsPage = lazy(() => import(/* webpackChunkName: "products" */ "@/pages/ProductsPage"));
const CartPage = lazy(() => import(/* webpackChunkName: "cart" */ "@/pages/CartPage"));
const CheckoutPage = lazy(() => import(/* webpackChunkName: "checkout" */ "@/pages/CheckoutPage"));
const OrdersPage = lazy(() => import(/* webpackChunkName: "orders" */ "@/pages/OrdersPage"));
const CustomersPage = lazy(() => import(/* webpackChunkName: "customers" */ "@/pages/CustomersPage"));
const ScanToPayPage = lazy(() => import(/* webpackChunkName: "scan-to-pay" */ "@/pages/ScanToPayPage"));

// Authentication pages
const LoginPage = lazy(() => import(/* webpackChunkName: "auth" */ "@/pages/LoginPage"));
const RegisterPage = lazy(() => import(/* webpackChunkName: "auth" */ "@/pages/RegisterPage"));
const ForgotPasswordPage = lazy(() => import(/* webpackChunkName: "auth" */ "@/pages/ForgotPasswordPage"));
const ResetPasswordPage = lazy(() => import(/* webpackChunkName: "auth" */ "@/pages/ResetPasswordPage"));
const ProfilePage = lazy(() => import(/* webpackChunkName: "auth" */ "@/pages/ProfilePage"));

// Analytics page with dynamic import for better code splitting
const AnalyticsPage = lazy(() => {
  // This creates a separate chunk for the analytics page
  return import(/* webpackChunkName: "analytics" */ "@/pages/AnalyticsPage");
});

// Loading fallback component
const LoadingFallback = () => {
  const { t } = useTranslation();

  return (
    <div className="flex items-center justify-center h-[70vh]">
      <div className="flex flex-col items-center gap-2">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">{t('ui.loading')}</p>
      </div>
    </div>
  );
};

// Create optimized query client with enhanced caching
const queryClient = createQueryClient();

// Preload essential data when the app initializes
preloadEssentialData(queryClient);

// Create router with future flags enabled
const router = createBrowserRouter(
  createRoutesFromElements(
    <>
      {/* Main layout with protected routes */}
      <Route
        path="/"
        element={<MainLayout />}
        errorElement={<RouteErrorBoundary />}
      >
        <Route index element={<HomePage />} />
        <Route
          path="products"
          element={
            <Suspense fallback={<LoadingFallback />}>
              <ProductsPage />
            </Suspense>
          }
          errorElement={<RouteErrorBoundary />}
        />
        <Route
          path="cart"
          element={
            <Suspense fallback={<LoadingFallback />}>
              <CartPage />
            </Suspense>
          }
          errorElement={<RouteErrorBoundary />}
        />
        <Route
          path="checkout"
          element={
            <Suspense fallback={<LoadingFallback />}>
              <CheckoutPage />
            </Suspense>
          }
          errorElement={<RouteErrorBoundary />}
        />
        <Route
          path="scan-to-pay"
          element={
            <Suspense fallback={<LoadingFallback />}>
              <ScanToPayPage />
            </Suspense>
          }
          errorElement={<RouteErrorBoundary />}
        />
        <Route
          path="orders"
          element={
            <Suspense fallback={<LoadingFallback />}>
              <ProtectedRoute>
                <OrdersPage />
              </ProtectedRoute>
            </Suspense>
          }
          errorElement={<RouteErrorBoundary />}
        />
        <Route
          path="analytics"
          element={
            <Suspense fallback={<LoadingFallback />}>
              <ProtectedRoute>
                <AnalyticsPage />
              </ProtectedRoute>
            </Suspense>
          }
          errorElement={<RouteErrorBoundary />}
        />
        <Route
          path="customers"
          element={
            <Suspense fallback={<LoadingFallback />}>
              <ProtectedRoute>
                <CustomersPage />
              </ProtectedRoute>
            </Suspense>
          }
          errorElement={<RouteErrorBoundary />}
        />
        <Route
          path="profile"
          element={
            <Suspense fallback={<LoadingFallback />}>
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            </Suspense>
          }
          errorElement={<RouteErrorBoundary />}
        />
      </Route>

      {/* Authentication routes */}
      <Route
        path="login"
        element={
          <Suspense fallback={<LoadingFallback />}>
            <LoginPage />
          </Suspense>
        }
        errorElement={<RouteErrorBoundary />}
      />
      <Route
        path="register"
        element={
          <Suspense fallback={<LoadingFallback />}>
            <RegisterPage />
          </Suspense>
        }
        errorElement={<RouteErrorBoundary />}
      />
      <Route
        path="forgot-password"
        element={
          <Suspense fallback={<LoadingFallback />}>
            <ForgotPasswordPage />
          </Suspense>
        }
        errorElement={<RouteErrorBoundary />}
      />
      <Route
        path="reset-password"
        element={
          <Suspense fallback={<LoadingFallback />}>
            <ResetPasswordPage />
          </Suspense>
        }
        errorElement={<RouteErrorBoundary />}
      />

      {/* 404 route */}
      <Route path="*" element={<NotFound />} />
    </>
  )
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <CartProvider>
            <OrderProvider>
              <NotificationProvider>
                <TooltipProvider>
                  <Sonner />
                  <ErrorBoundary
                    showHomeButton={true}
                    logErrorToService={true}
                    onReset={() => {
                      // Optional callback when the error boundary resets
                      console.log("Error boundary reset");
                    }}
                  >
                    <Suspense fallback={<LoadingFallback />}>
                      <RouterProvider
                        router={router}
                        future={{
                          v7_startTransition: true
                        }}
                      />
                    </Suspense>
                  </ErrorBoundary>
                </TooltipProvider>
              </NotificationProvider>
            </OrderProvider>
          </CartProvider>
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
