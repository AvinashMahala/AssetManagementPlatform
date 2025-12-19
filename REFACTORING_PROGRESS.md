# Refactoring Progress & Component Hierarchy

**LATEST UPDATE:**
- 🟢 **Documentation:** Generated READMEs for all `src/features/*` modules.
- 🟢 **Quality Audit:** Completed Theme, Resilience, and Performance audits (see `frontend/docs/`).
- 🟢 **Cleanup Complete:** `src/components/ui` and `src/components/common` have been DELETED.
- 🟢 **Architecture Shift:** The application now imports ALL UI components directly from `@/componentDesignLibrary`.
- 🟢 **Feature Migration:** `GoogleOAuthButton` moved to `src/features/auth`. `ErrorBoundary` moved to `src/componentDesignLibrary`.
- 🟢 **Alias Configured:** `@` alias points to `src` in `vite.config.ts` and `tsconfig.app.json`.

This document tracks the refactoring progress of the frontend codebase.
**Goal:** "One Component, One Folder", strict separation of concerns, and elimination of dead code.

## Legend
- 🟢 **Completed:** Refactored, moved to `componentDesignLibrary` or `components/ui`, and strictly typed.
- 🟡 **In Progress:** Currently being worked on.
- 🔴 **Pending:** Needs analysis and refactoring.
- 💀 **Dead Code:** Identified for deletion.

---

## 1. Core UI Components (Leaf Nodes)
*These are the building blocks. They should have NO dependencies on app state or features.*

| Component | Path | Status | Notes |
|-----------|------|--------|-------|
| **Button** | `src/components/ui/button.tsx` | 🟢 | Migrated from `common/Button`. Uses `cva`. |
| **Input** | `src/components/ui/input.tsx` | 🟢 | Migrated from `common/Input`. |
| **Card** | `src/components/ui/card.tsx` | 🟢 | Migrated from `common/Card`. Compound component. |
| **Badge** | `src/components/ui/badge.tsx` | 🟢 | Migrated from `common/Badge`. |
| **Alert** | `src/components/ui/alert.tsx` | 🟢 | Re-export from `componentDesignLibrary`. |
| **Dialog** | `src/components/ui/dialog.tsx` | 🟢 | Re-export from `componentDesignLibrary`. |
| **Select** | `src/components/ui/select.tsx` | 🟢 | Re-export from `componentDesignLibrary`. |
| **Table** | `src/components/ui/table.tsx` | 🟢 | Re-export from `componentDesignLibrary`. |
| **Tabs** | `src/components/ui/tabs.tsx` | 🟢 | Re-export from `componentDesignLibrary`. |
| **Toast** | `src/components/ui/toast.tsx` | 🟢 | Re-export from `componentDesignLibrary`. |
| **Tooltip** | `src/components/ui/tooltip.tsx` | 🟢 | Re-export from `componentDesignLibrary`. |
| **Checkbox** | `src/components/ui/checkbox.tsx` | 🟢 | Re-export from `componentDesignLibrary`. |
| **Label** | `src/components/ui/label.tsx` | 🟢 | Re-export from `componentDesignLibrary`. |
| **Textarea** | `src/components/ui/textarea.tsx` | 🟢 | Re-export from `componentDesignLibrary`. |
| **Skeleton** | `src/components/ui/skeleton.tsx` | 🟢 | Re-export from `componentDesignLibrary`. |
| **Pagination** | `src/components/ui/pagination.tsx` | 🟢 | Re-export from `componentDesignLibrary`. |
| **Form** | `src/components/ui/form.tsx` | 🟢 | Re-export from `componentDesignLibrary`. |
| **FormField** | `src/components/ui/form-field.tsx` | 🟢 | Re-export from `componentDesignLibrary`. |
| **AuthLoading** | `src/components/ui/auth-loading.tsx` | 🟢 | Re-export from `componentDesignLibrary`. |
| **Breadcrumbs** | `src/components/ui/breadcrumbs.tsx` | 🟢 | Re-export from `componentDesignLibrary`. |
| **ChartContainer** | `src/components/ui/ChartContainer.tsx` | 🟢 | Re-export from `componentDesignLibrary`. |
| **Charts** | `src/components/ui/charts.tsx` | 🟢 | Re-export from `componentDesignLibrary`. |
| **ExpandableSection** | `src/components/ui/expandable-section.tsx` | 🟢 | Re-export from `componentDesignLibrary`. |
| **FloatingParticles** | `src/components/ui/floating-particles.tsx` | 🟢 | Re-export from `componentDesignLibrary`. |
| **Loading** | `src/components/ui/loading.tsx` | 🟢 | Re-export from `componentDesignLibrary`. |
| **PasswordInput** | `src/components/ui/password-input.tsx` | 🟢 | Re-export from `componentDesignLibrary`. |
| **StatCard** | `src/components/ui/stat-card.tsx` | 🟢 | Re-export from `componentDesignLibrary`. |
| **ValidationFeedback** | `src/components/ui/validation-feedback.tsx` | 🟢 | Re-export from `componentDesignLibrary`. |

---

## 2. Common Components (Composite/Utility)
*Reusable components that might contain some logic or compose multiple UI atoms.*

| Component | Path | Status | Notes |
|-----------|------|--------|-------|
| **ErrorBoundary** | `src/components/common/ErrorBoundary.tsx` | 🟢 | Kept as utility. |
| **GoogleOAuthButton** | `src/components/common/GoogleOAuthButton.tsx` | 🔴 | Should move to `components/auth` or `ui`. |
| **ConsentDialog** | `src/components/ConsentDialog.tsx` | 🔴 | |
| **UnitUtilitiesManager** | `src/components/units/UnitUtilitiesManager.tsx` | 🔴 | |
| **RentCollectionCalendar** | `src/components/rentCollection/RentCollectionCalendar.tsx` | 🔴 | |

---

## 3. Feature Components (Domain Specific)
*Components tied to specific business logic (Properties, Tenants, etc).*

### Dashboard
- [ ] `src/features/dashboard/ActivityCard/ActivityCard.tsx`
- [ ] `src/features/dashboard/AlertsSection/AlertsSection.tsx`
- [ ] `src/features/dashboard/ChartsCarousel/ChartsCarousel.tsx`
- [ ] `src/features/dashboard/DashboardEnhanced/DashboardEnhanced.tsx`
- [ ] `src/features/dashboard/StatsSection/StatsSection.tsx`

### Properties
- [ ] `src/features/properties/Create/PropertyCreate.tsx`
- [ ] `src/features/properties/Dashboard/PropertyDashboard.tsx`
- [ ] `src/features/properties/Detail/PropertyDetail.tsx`
- [ ] `src/features/properties/Edit/PropertyEdit.tsx`
- [ ] `src/features/properties/List/PropertyList.tsx`
- [ ] `src/features/properties/components/PropertyCard/PropertyCard.tsx`
- [ ] `src/features/properties/form/PropertyFormTabbed.tsx`

### Files
- [ ] `src/components/files/FileGallery.tsx`
- [ ] `src/components/files/FileUpload.tsx`
- [ ] `src/components/files/PropertyFileGallery.tsx`
- [ ] `src/components/files/RecentFilesWidget.tsx`

### Receipts
- [ ] `src/components/receipts/ReceiptGenerator.tsx`
- [ ] `src/components/receipts/ReceiptList.tsx`
- [ ] `src/components/receipts/ReceiptPreviewModal.tsx`

---

## 4. Form Components
*Complex forms used across pages.*

- [ ] `src/components/forms/LoginForm.tsx`
- [ ] `src/components/forms/RegisterForm.tsx`
- [ ] `src/components/forms/ResetPasswordForm.tsx`
- [ ] `src/components/forms/VerifyEmailForm.tsx`
- [ ] `src/components/forms/VerifyPhoneForm.tsx`
- [ ] `src/components/forms/ProfileForm.tsx`
- [ ] `src/components/forms/PropertyFileUpload.tsx`
- [ ] `src/components/forms/TenantFormTabbed.tsx`
- [ ] `src/components/forms/UnitFormTabbed.tsx`
- [ ] `src/components/forms/LeaseFormTabbed.tsx`
- [ ] `src/components/forms/PaymentFormTabbed.tsx`
- [ ] `src/components/forms/ExpenseFormTabbed.tsx`
- [ ] `src/components/forms/MeterFormTabbed.tsx`

---

## 5. Layout Components
*Shell and navigation structures.*

- [ ] `src/components/layout/AppLayout.tsx`
- [ ] `src/components/layout/header/Header.tsx`
- [ ] `src/components/layout/sidebar/Sidebar.tsx`
- [ ] `src/components/layout/mobile-sidebar/MobileSidebar.tsx`

---

## 6. Pages (Root Nodes)
*Top-level route handlers.*

### Auth
- [ ] `src/pages/auth/LoginPage.tsx`
- [ ] `src/pages/auth/ProfilePage.tsx`
- [ ] `src/pages/auth/VerifyEmailPage.tsx`
- [ ] `src/pages/auth/VerifyPhonePage.tsx`

### Properties
- [ ] `src/pages/PropertyTemplateCustomization.tsx`

### Units
- [ ] `src/pages/units/UnitDashboardPage/UnitDashboardPage.tsx`
- [ ] `src/pages/units/UnitDetailPage/UnitDetailPage.tsx`
- [ ] `src/pages/units/UnitEditPage/UnitEditPage.tsx`
- [ ] `src/pages/units/UnitListPageEnhanced/UnitListPageEnhanced.tsx`

### Tenants
- [ ] `src/pages/tenants/TenantDashboardPage.tsx`
- [ ] `src/pages/tenants/TenantDetailPage.tsx`
- [ ] `src/pages/tenants/TenantEditPage.tsx`
- [ ] `src/pages/tenants/TenantListPageEnhanced.tsx`

### Leases
- [ ] `src/pages/leases/LeaseDetailPage.tsx`
- [ ] `src/pages/leases/LeaseEditPage.tsx`
- [ ] `src/pages/leases/LeaseListPageEnhanced.tsx`

### Payments & Expenses
- [ ] `src/pages/payments/PaymentDetailPage.tsx`
- [ ] `src/pages/payments/PaymentEditPage.tsx`
- [ ] `src/pages/payments/PaymentListPageEnhanced.tsx`
- [ ] `src/pages/expenses/ExpenseDetailPage.tsx`
- [ ] `src/pages/expenses/ExpenseEditPage.tsx`
- [ ] `src/pages/expenses/ExpenseListPageEnhanced.tsx`

### Meters
- [ ] `src/pages/meters/MeterDetailPage.tsx`
- [ ] `src/pages/meters/MeterEditPage.tsx`
- [ ] `src/pages/meters/MeterListPageEnhanced.tsx`

### Bulk Operations
- [ ] `src/pages/bulkOperations/BulkOperationsDashboard.tsx`

### Files
- [ ] `src/pages/files-page-enhanced/FilesPageEnhanced.tsx`

