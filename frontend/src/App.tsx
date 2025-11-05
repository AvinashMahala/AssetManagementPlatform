import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, ThemeProvider, NotificationProvider } from './contexts';
import { ProtectedRoute, PublicRoute } from './components/auth';
import { LoginPage, VerifyEmailPage, VerifyPhonePage, ProfilePage } from './pages/auth';
import { PropertyListPageEnhanced, PropertyCreatePageEnhanced, PropertyEditPageEnhanced, PropertyDetailPage, PropertyDashboardPageEnhanced } from './pages/properties';
import { TenantCreatePageEnhanced, TenantDetailPage, TenantEditPageEnhanced } from './pages/tenants';
import TenantListPageEnhanced from './pages/tenants/TenantListPageEnhanced';
import { UnitCreatePageEnhanced, UnitDetailPage, UnitEditPageEnhanced } from './pages/units';
import UnitListPageEnhanced from './pages/units/UnitListPageEnhanced';
import { LeaseCreatePageEnhanced, LeaseDetailPage, LeaseEditPageEnhanced } from './pages/leases';
import LeaseListPageEnhanced from './pages/leases/LeaseListPageEnhanced';
import { PaymentCreatePageEnhanced, PaymentDetailPage, PaymentEditPageEnhanced } from './pages/payments';
import PaymentListPageEnhanced from './pages/payments/PaymentListPageEnhanced';
import DashboardEnhanced from './pages/DashboardEnhanced';
import TemplateEditor from './pages/TemplateEditor';
import TemplateGallery from './pages/TemplateGallery';
import PropertyTemplateCustomization from './pages/PropertyTemplateCustomization';
import { AppLayout } from './components/layout/AppLayout';

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
                    <AppLayout>
                      <PropertyDetailPage />
                    </AppLayout>
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
              <Route path="/tenants/create" element={<ProtectedRoute><TenantCreatePageEnhanced /></ProtectedRoute>} />
              <Route path="/tenants/:id" element={<ProtectedRoute><AppLayout><TenantDetailPage /></AppLayout></ProtectedRoute>} />
              <Route path="/tenants/:id/edit" element={<ProtectedRoute><TenantEditPageEnhanced /></ProtectedRoute>} />
              
              <Route path="/units" element={<ProtectedRoute><UnitListPageEnhanced /></ProtectedRoute>} />
              <Route path="/units/create" element={<ProtectedRoute><UnitCreatePageEnhanced /></ProtectedRoute>} />
              <Route path="/units/:id" element={<ProtectedRoute><AppLayout><UnitDetailPage /></AppLayout></ProtectedRoute>} />
              <Route path="/units/:id/edit" element={<ProtectedRoute><UnitEditPageEnhanced /></ProtectedRoute>} />
              
              <Route path="/leases" element={<ProtectedRoute><LeaseListPageEnhanced /></ProtectedRoute>} />
              <Route path="/leases/create" element={<ProtectedRoute><LeaseCreatePageEnhanced /></ProtectedRoute>} />
              <Route path="/leases/:id" element={<ProtectedRoute><AppLayout><LeaseDetailPage /></AppLayout></ProtectedRoute>} />
              <Route path="/leases/:id/edit" element={<ProtectedRoute><LeaseEditPageEnhanced /></ProtectedRoute>} />
              
              <Route path="/payments" element={<ProtectedRoute><PaymentListPageEnhanced /></ProtectedRoute>} />
              <Route path="/payments/create" element={<ProtectedRoute><PaymentCreatePageEnhanced /></ProtectedRoute>} />
              <Route path="/payments/:id" element={<ProtectedRoute><AppLayout><PaymentDetailPage /></AppLayout></ProtectedRoute>} />
              <Route path="/payments/:id/edit" element={<ProtectedRoute><PaymentEditPageEnhanced /></ProtectedRoute>} />

              {/* Template routes */}
              <Route path="/templates" element={<ProtectedRoute><TemplateGallery /></ProtectedRoute>} />
              <Route path="/templates/:templateId/editor" element={<ProtectedRoute><TemplateEditor /></ProtectedRoute>} />
              <Route path="/properties/:propertyId/template-customization" element={<ProtectedRoute><PropertyTemplateCustomization /></ProtectedRoute>} />

              <Route
                path="/admin/*"
                element={
                  <ProtectedRoute requiredRole="admin">
                    <AppLayout title="Admin Panel">
                      <div className="text-center py-12">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">Admin Panel</h2>
                        <p className="text-gray-600">Admin functionality coming soon...</p>
                      </div>
                    </AppLayout>
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