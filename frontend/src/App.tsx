import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, ThemeProvider, NotificationProvider } from './contexts';
import { ProtectedRoute, PublicRoute } from './components/auth';
import { ErrorBoundary } from './components/ErrorBoundary';
import { ConsentDialog, DevTools } from './components/ConsentDialog';
import { LoginPage, VerifyEmailPage, VerifyPhonePage, ProfilePage } from './pages/auth';
import { PropertyListPageEnhanced, PropertyCreatePageEnhanced, PropertyCreatePageTabbed, PropertyEditPageEnhanced, PropertyDetailPage, PropertyDashboardPageEnhanced } from './pages/properties';
import { TenantCreatePageTabbedEnhanced, TenantDetailPage, TenantEditPage } from './pages/tenants';
import TenantListPageEnhanced from './pages/tenants/TenantListPageEnhanced';
import { TenantDashboardPage } from './pages/tenants/TenantDashboardPage';
import { UnitCreatePageTabbedEnhanced, UnitDetailPage, UnitDashboardPage, UnitEditPage } from './pages/units';
import UnitListPageEnhanced from './pages/units/UnitListPageEnhanced';
import { LeaseCreatePageTabbedEnhanced, LeaseDetailPage, LeaseEditPage } from './pages/leases';
import LeaseListPageEnhanced from './pages/leases/LeaseListPageEnhanced';
import { PaymentCreatePageTabbedEnhanced, PaymentDetailPage, PaymentEditPage } from './pages/payments';
import PaymentListPageEnhanced from './pages/payments/PaymentListPageEnhanced';
import ExpenseListPage from './pages/expenses/ExpenseListPage';
import ExpenseCreatePageTabbedEnhanced from './pages/expenses/ExpenseCreatePageTabbedEnhanced';
import ExpenseDetailPage from './pages/expenses/ExpenseDetailPage';
import { ExpenseEditPage } from './pages/expenses';
import NavigationConfigPage from './pages/NavigationConfigPage';
import DashboardEnhanced from './pages/DashboardEnhanced';
import TemplateEditor from './pages/TemplateEditor';
import TemplateGallery from './pages/TemplateGallery';
import PropertyTemplateCustomization from './pages/PropertyTemplateCustomization';
import { PropertyRentCollectionPage, UnitRentCollectionPage, MonthlySummaryDashboard, RentCollectionWorkflowDashboard } from './pages/rentCollection';
import { MeterListPageEnhanced, MeterCreatePageTabbedEnhanced, MeterEditPage, MeterDetailPage, MeterReadingCreatePage } from './pages/meters';
import FilesPage from './pages/FilesPage';
import { RentTransactionInvoicePage, RentTransactionRecordPaymentPage, RentTransactionReceiptPage } from './pages/rentTransactions';
import { BulkOperationsDashboard } from './pages/bulkOperations/BulkOperationsDashboard';
import { AppLayout } from './components/layout/AppLayout';
import { Toast } from './components/ui/toast';

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
                path="/navigation-config"
                element={
                  <ProtectedRoute>
                    <NavigationConfigPage />
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
                path="/properties/create-tabbed"
                element={
                  <ProtectedRoute>
                    <PropertyCreatePageTabbed />
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
              <Route path="/tenants/create" element={<Navigate to="/tenants/create-tabbed" replace />} />
              <Route path="/tenants/create-tabbed" element={<ProtectedRoute><TenantCreatePageTabbedEnhanced /></ProtectedRoute>} />
              <Route path="/tenants/:id" element={<ProtectedRoute><AppLayout><TenantDetailPage /></AppLayout></ProtectedRoute>} />
              <Route path="/tenants/:id/dashboard" element={<ProtectedRoute><TenantDashboardPage /></ProtectedRoute>} />
              <Route path="/tenants/:id/edit" element={<ProtectedRoute><TenantEditPage /></ProtectedRoute>} />
              
              <Route path="/units" element={<ProtectedRoute><UnitListPageEnhanced /></ProtectedRoute>} />
              <Route path="/units/create" element={<ProtectedRoute><UnitCreatePageTabbedEnhanced /></ProtectedRoute>} />
              <Route path="/units/create-tabbed" element={<ProtectedRoute><UnitCreatePageTabbedEnhanced /></ProtectedRoute>} />
              <Route path="/units/:id" element={<ProtectedRoute><AppLayout><UnitDetailPage /></AppLayout></ProtectedRoute>} />
              <Route path="/units/:id/dashboard" element={<ProtectedRoute><AppLayout><UnitDashboardPage /></AppLayout></ProtectedRoute>} />
              <Route path="/units/:id/edit" element={<ProtectedRoute><UnitEditPage /></ProtectedRoute>} />
              
              <Route path="/leases" element={<ProtectedRoute><LeaseListPageEnhanced /></ProtectedRoute>} />
              <Route path="/leases/create" element={<Navigate to="/leases/create-tabbed" replace />} />
              <Route path="/leases/create-tabbed" element={<ProtectedRoute><LeaseCreatePageTabbedEnhanced /></ProtectedRoute>} />
              <Route path="/leases/:id" element={<ProtectedRoute><AppLayout><LeaseDetailPage /></AppLayout></ProtectedRoute>} />
              <Route path="/leases/:id/edit" element={<ProtectedRoute><LeaseEditPage /></ProtectedRoute>} />
              
              <Route path="/payments" element={<ProtectedRoute><PaymentListPageEnhanced /></ProtectedRoute>} />
              <Route path="/payments/create" element={<Navigate to="/payments/create-tabbed" replace />} />
              <Route path="/payments/create-tabbed" element={<ProtectedRoute><PaymentCreatePageTabbedEnhanced /></ProtectedRoute>} />
              <Route path="/payments/:id" element={<ProtectedRoute><AppLayout><PaymentDetailPage /></AppLayout></ProtectedRoute>} />
              <Route path="/payments/:id/edit" element={<ProtectedRoute><PaymentEditPage /></ProtectedRoute>} />

              <Route path="/expenses" element={<ProtectedRoute><ExpenseListPage /></ProtectedRoute>} />
              <Route path="/expenses/create" element={<Navigate to="/expenses/create-tabbed" replace />} />
              <Route path="/expenses/create-tabbed" element={<ProtectedRoute><ExpenseCreatePageTabbedEnhanced /></ProtectedRoute>} />
              <Route path="/expenses/:id" element={<ProtectedRoute><ExpenseDetailPage /></ProtectedRoute>} />
              <Route path="/expenses/:id/edit" element={<ProtectedRoute><ExpenseEditPage /></ProtectedRoute>} />

              <Route path="/files" element={<ProtectedRoute><FilesPage /></ProtectedRoute>} />

              <Route path="/meters" element={<ProtectedRoute><MeterListPageEnhanced /></ProtectedRoute>} />
              <Route path="/meters/create" element={<ProtectedRoute><MeterCreatePageTabbedEnhanced /></ProtectedRoute>} />
              <Route path="/meters/create-tabbed" element={<ProtectedRoute><MeterCreatePageTabbedEnhanced /></ProtectedRoute>} />
              <Route path="/meters/:id" element={<ProtectedRoute><MeterDetailPage /></ProtectedRoute>} />
              <Route path="/meters/:id/edit" element={<ProtectedRoute><MeterEditPage /></ProtectedRoute>} />
              <Route path="/meters/:id/readings/create" element={<ProtectedRoute><MeterReadingCreatePage /></ProtectedRoute>} />

              {/* Template routes */}
              <Route path="/templates" element={<ProtectedRoute><TemplateGallery /></ProtectedRoute>} />
              <Route path="/templates/:templateId/editor" element={<ProtectedRoute><TemplateEditor /></ProtectedRoute>} />
              <Route path="/properties/:propertyId/template-customization" element={<ProtectedRoute><PropertyTemplateCustomization /></ProtectedRoute>} />

              {/* Rent Collection routes */}
              <Route path="/properties/:propertyId/rent-collection" element={<ProtectedRoute><PropertyRentCollectionPage /></ProtectedRoute>} />
              <Route path="/properties/:propertyId/rent-collection/monthly-summary" element={<ProtectedRoute><MonthlySummaryDashboard /></ProtectedRoute>} />
              <Route path="/rent-collection/workflow-dashboard" element={<ProtectedRoute><RentCollectionWorkflowDashboard /></ProtectedRoute>} />
              <Route path="/properties/:propertyId/units/:unitId/collect-rent" element={<ProtectedRoute><UnitRentCollectionPage /></ProtectedRoute>} />

              {/* Rent Transaction routes */}
              <Route path="/rent-transactions/:transactionId/invoice" element={<ProtectedRoute><RentTransactionInvoicePage /></ProtectedRoute>} />
              <Route path="/rent-transactions/:transactionId/record-payment" element={<ProtectedRoute><RentTransactionRecordPaymentPage /></ProtectedRoute>} />
              <Route path="/rent-transactions/:transactionId/receipt" element={<ProtectedRoute><RentTransactionReceiptPage /></ProtectedRoute>} />

              {/* Bulk Operations */}
              <Route path="/bulk-operations" element={<ProtectedRoute><BulkOperationsDashboard /></ProtectedRoute>} />

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
    </ErrorBoundary>
  );
}

export default App;