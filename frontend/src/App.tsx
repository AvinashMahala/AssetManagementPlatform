import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Suspense } from 'react';
import { AuthProvider, ThemeProvider, NotificationProvider } from './contexts';
import { ProtectedRoute, PublicRoute } from './components/auth';
import { ErrorBoundary } from './components/ErrorBoundary';
import { ConsentDialog, DevTools } from './components/ConsentDialog';
import { Toast } from './components/ui/toast';
import { routes } from './config/routes';

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <ThemeProvider defaultTheme="system" storageKey="asset-management-theme">
          <NotificationProvider maxNotifications={5}>
            <AuthProvider>
              {/* Consent dialog for production error reporting */}
              <ConsentDialog />
              
              {/* Dev tools for development mode */}
              <DevTools />
              
              {/* Toast notifications */}
              <Toast />
              
              <Suspense fallback={<div>Loading...</div>}>
                <Routes>
                  {routes.map((route) => (
                    <Route
                      key={route.path}
                      path={route.path}
                      element={
                        route.isPublic ? (
                          <PublicRoute>{route.element}</PublicRoute>
                        ) : route.isProtected ? (
                          route.requiredRole ? (
                            <ProtectedRoute requiredRole={route.requiredRole}>{route.element}</ProtectedRoute>
                          ) : (
                            <ProtectedRoute>{route.element}</ProtectedRoute>
                          )
                        ) : (
                          route.element
                        )
                      }
                    />
                  ))}
                </Routes>
              </Suspense>
          </AuthProvider>
        </NotificationProvider>
      </ThemeProvider>
    </Router>
    </ErrorBoundary>
  );
}

export default App;