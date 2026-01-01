import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Suspense } from 'react';
import { AuthProvider, ThemeProvider, NotificationProvider } from './contexts';
import { RBACProvider } from './contexts/RBACContext';
import { ProtectedRoute, PublicRoute } from '@/features/auth/components';
import { ErrorBoundary, ConsentDialog, DevTools } from '@/componentDesignLibrary';
import { Toast } from '@/componentDesignLibrary';
import { routes } from './config/routes';

/**
 * Main application component that sets up the overall structure and providers.
 * 
 * This component wraps the entire application with necessary context providers,
 * error boundaries, and routing configuration. It handles authentication,
 * theming, notifications, and route protection based on user roles.
 * 
 * @returns {JSX.Element} The root application component
 */
function App() {
  return (
    <ErrorBoundary>
      {/* Router for client-side navigation */}
      <Router>
        {/* Theme provider for managing light/dark/system themes */}
        <ThemeProvider defaultTheme="system" storageKey="asset-management-theme">
          {/* Notification provider for managing toast notifications */}
          <NotificationProvider maxNotifications={5}>
            {/* Authentication provider for user session management */}
            <AuthProvider>
              <RBACProvider>
                {/* Consent dialog for production error reporting */}
                <ConsentDialog />
                
                {/* Dev tools for development mode */}
                <DevTools />
                
                {/* Toast notifications component */}
                <Toast />
                
                {/* Suspense wrapper for lazy-loaded components */}
                <Suspense fallback={<div>Loading...</div>}>
                  <Routes>
                  {/* Map over route configuration to render each route */}
                  {routes.map((route) => (
                    <Route
                      key={route.path}
                      path={route.path}
                      element={
                        // Public routes don't require authentication
                        route.isPublic ? (
                          <PublicRoute>{route.element}</PublicRoute>
                        ) : route.isProtected ? (
                          // Protected routes require authentication and optionally specific roles or permissions
                          route.requiredRole ? (
                            <ProtectedRoute requiredRole={route.requiredRole}>{route.element}</ProtectedRoute>
                          ) : route.requiredPermission ? (
                            <ProtectedRoute requiredPermission={route.requiredPermission}>{route.element}</ProtectedRoute>
                          ) : (
                            <ProtectedRoute>{route.element}</ProtectedRoute>
                          )
                        ) : (
                          // Regular routes without protection
                          route.element
                        )
                      }
                    />
                  ))}
                </Routes>
              </Suspense>
            </RBACProvider>
          </AuthProvider>
        </NotificationProvider>
      </ThemeProvider>
    </Router>
    </ErrorBoundary>
  );
}

export default App;