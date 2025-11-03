import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, ThemeProvider, NotificationProvider } from './contexts';
import { ProtectedRoute, PublicRoute } from './components/auth';
import { LoginPage, VerifyEmailPage, VerifyPhonePage, ProfilePage } from './pages/auth';
import { PropertyListPageEnhanced, PropertyCreatePageEnhanced, PropertyEditPageEnhanced, PropertyDetailPage, PropertyDashboardPageEnhanced } from './pages/properties';
import { TenantCreatePage, TenantDetailPage, TenantEditPage } from './pages/tenants';
import TenantListPageEnhanced from './pages/tenants/TenantListPageEnhanced';
import { UnitCreatePage, UnitDetailPage, UnitEditPage } from './pages/units';
import UnitListPageEnhanced from './pages/units/UnitListPageEnhanced';
import { LeaseCreatePage, LeaseDetailPage, LeaseEditPage } from './pages/leases';
import LeaseListPageEnhanced from './pages/leases/LeaseListPageEnhanced';
import { PaymentCreatePage, PaymentDetailPage, PaymentEditPage } from './pages/payments';
import PaymentListPageEnhanced from './pages/payments/PaymentListPageEnhanced';
import DashboardEnhanced from './pages/DashboardEnhanced';
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
                    <DashboardEnhanced />
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
                    <PropertyListPageEnhanced />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/properties/create"
                element={
                  <ProtectedRoute>
                    <PropertyCreatePageEnhanced />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/properties/:id/dashboard"
                element={
                  <ProtectedRoute>
                    <PropertyDashboardPageEnhanced />
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
                    <PropertyEditPageEnhanced />
                  </ProtectedRoute>
                }
              />

              <Route path="/tenants" element={<ProtectedRoute><TenantListPageEnhanced /></ProtectedRoute>} />
              <Route path="/tenants/create" element={<ProtectedRoute><div className="min-h-screen bg-background p-8"><TenantCreatePage /></div></ProtectedRoute>} />
              <Route path="/tenants/:id" element={<ProtectedRoute><div className="min-h-screen bg-background p-8"><TenantDetailPage /></div></ProtectedRoute>} />
              <Route path="/tenants/:id/edit" element={<ProtectedRoute><div className="min-h-screen bg-background p-8"><TenantEditPage /></div></ProtectedRoute>} />
              
              <Route path="/units" element={<ProtectedRoute><UnitListPageEnhanced /></ProtectedRoute>} />
              <Route path="/units/create" element={<ProtectedRoute><div className="min-h-screen bg-background p-8"><UnitCreatePage /></div></ProtectedRoute>} />
              <Route path="/units/:id" element={<ProtectedRoute><div className="min-h-screen bg-background p-8"><UnitDetailPage /></div></ProtectedRoute>} />
              <Route path="/units/:id/edit" element={<ProtectedRoute><div className="min-h-screen bg-background p-8"><UnitEditPage /></div></ProtectedRoute>} />
              
              <Route path="/leases" element={<ProtectedRoute><LeaseListPageEnhanced /></ProtectedRoute>} />
              <Route path="/leases/create" element={<ProtectedRoute><div className="min-h-screen bg-background p-8"><LeaseCreatePage /></div></ProtectedRoute>} />
              <Route path="/leases/:id" element={<ProtectedRoute><div className="min-h-screen bg-background p-8"><LeaseDetailPage /></div></ProtectedRoute>} />
              <Route path="/leases/:id/edit" element={<ProtectedRoute><div className="min-h-screen bg-background p-8"><LeaseEditPage /></div></ProtectedRoute>} />
              
              <Route path="/payments" element={<ProtectedRoute><PaymentListPageEnhanced /></ProtectedRoute>} />
              <Route path="/payments/create" element={<ProtectedRoute><div className="min-h-screen bg-background p-8"><PaymentCreatePage /></div></ProtectedRoute>} />
              <Route path="/payments/:id" element={<ProtectedRoute><div className="min-h-screen bg-background p-8"><PaymentDetailPage /></div></ProtectedRoute>} />
              <Route path="/payments/:id/edit" element={<ProtectedRoute><div className="min-h-screen bg-background p-8"><PaymentEditPage /></div></ProtectedRoute>} />

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