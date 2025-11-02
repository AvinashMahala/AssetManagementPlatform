import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, ThemeProvider, NotificationProvider } from './contexts';
import { ProtectedRoute, PublicRoute } from './components/auth';
import { LoginPage, VerifyEmailPage, VerifyPhonePage, ProfilePage } from './pages/auth';
import { PropertyListPageModern, PropertyCreatePage, PropertyEditPage, PropertyDetailPage } from './pages/properties';
import TenantListPage from './pages/tenants/TenantListPage';
import UnitListPage from './pages/units/UnitListPage';
import LeaseListPage from './pages/leases/LeaseListPage';
import PaymentListPage from './pages/payments/PaymentListPage';
import Dashboard from './pages/Dashboard';
import './App.css';

function App() {
  return (
    <Router>
      <ThemeProvider defaultTheme="system" storageKey="asset-management-theme">
        <NotificationProvider maxNotifications={5}>
          <AuthProvider>
            <Routes>
              {/* Public routes - only accessible when not authenticated */}
              <Route
                path="/login"
                element={
                  <PublicRoute>
                    <LoginPage />
                  </PublicRoute>
                }
              />
              <Route
                path="/verify-email"
                element={
                  <PublicRoute>
                    <VerifyEmailPage />
                  </PublicRoute>
                }
              />
              <Route
                path="/verify-phone"
                element={
                  <PublicRoute>
                    <VerifyPhonePage />
                  </PublicRoute>
                }
              />

              {/* Protected routes - require authentication */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
                      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                          <div className="flex justify-between items-center py-4">
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                              Asset Management Platform
                            </h1>
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                              Property Management System
                            </div>
                          </div>
                        </div>
                      </header>

                      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                        <Dashboard />
                      </main>
                    </div>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <ProfilePage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/properties"
                element={
                  <ProtectedRoute>
                    <div className="min-h-screen bg-background">
                      <PropertyListPageModern />
                    </div>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/properties/create"
                element={
                  <ProtectedRoute>
                    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
                      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                          <div className="flex justify-between items-center py-4">
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                              Create Property
                            </h1>
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                              Asset Management Platform
                            </div>
                          </div>
                        </div>
                      </header>

                      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                        <PropertyCreatePage />
                      </main>
                    </div>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/properties/:id"
                element={
                  <ProtectedRoute>
                    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
                      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                          <div className="flex justify-between items-center py-4">
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                              Property Details
                            </h1>
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                              Asset Management Platform
                            </div>
                          </div>
                        </div>
                      </header>

                      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                        <PropertyDetailPage />
                      </main>
                    </div>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/properties/:id/edit"
                element={
                  <ProtectedRoute>
                    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
                      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                          <div className="flex justify-between items-center py-4">
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                              Edit Property
                            </h1>
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                              Asset Management Platform
                            </div>
                          </div>
                        </div>
                      </header>

                      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                        <PropertyEditPage />
                      </main>
                    </div>
                  </ProtectedRoute>
                }
              />

              <Route path="/tenants" element={<ProtectedRoute><div className="min-h-screen bg-background"><TenantListPage /></div></ProtectedRoute>} />
              <Route path="/units" element={<ProtectedRoute><div className="min-h-screen bg-background"><UnitListPage /></div></ProtectedRoute>} />
              <Route path="/leases" element={<ProtectedRoute><div className="min-h-screen bg-background"><LeaseListPage /></div></ProtectedRoute>} />
              <Route path="/payments" element={<ProtectedRoute><div className="min-h-screen bg-background"><PaymentListPage /></div></ProtectedRoute>} />

              {/* Admin-only routes */}
              <Route
                path="/admin/*"
                element={
                  <ProtectedRoute requiredRole="admin">
                    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
                      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                          <div className="flex justify-between items-center py-4">
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                              Admin Panel
                            </h1>
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                              Asset Management Platform
                            </div>
                          </div>
                        </div>
                      </header>

                      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                        <div className="text-center">
                          <h2 className="text-2xl font-bold text-gray-900 mb-4">Admin Panel</h2>
                          <p className="text-gray-600">Admin functionality coming soon...</p>
                        </div>
                      </main>
                    </div>
                  </ProtectedRoute>
                }
              />

              {/* Default redirect */}
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </AuthProvider>
        </NotificationProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;