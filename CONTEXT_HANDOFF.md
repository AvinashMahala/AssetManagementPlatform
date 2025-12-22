# 🤝 Context Handoff: AssetManagementPlatform

**Date:** December 21, 2025
**Current Phase:** Backend Refactoring - Phase 3.3 (Finance Feature)

## 🎯 Current Mission
We are migrating the backend from a Layered Architecture (Controllers/Services/Repositories) to a **Vertical Slice Architecture** (`src/features/{domain}/{feature}`). We are using the **Strangler Fig Pattern** to incrementally replace legacy code.

## 🚧 Status: Phase 3.3 (Finance) - READY TO START

### ✅ Completed
1.  **Infrastructure:** `src/shared/` is established (BaseRepository, EventBus, etc.).
2.  **Leases Feature:**
    *   Fully migrated to `src/features/leases/`.
    *   Legacy `LeaseController`, `LeaseService`, `leaseRoutes` **DELETED**.
    *   Legacy `LeaseRepository` marked as **DEPRECATED** (kept for dependencies).
3.  **Properties Feature:**
    *   `Property` fully migrated and legacy files deleted.
    *   `Unit` fully migrated and legacy files deleted.
    *   `Meter` migrated to `src/features/properties/meter/` and active in `server.ts`.
4.  **Tenants Feature:**
    *   `UnitTenant` (Lease Association) fully migrated and legacy files deleted.
    *   `Tenant` migrated to `src/features/tenants/tenant/` and active in `server.ts`.
    *   Legacy `TenantController`, `TenantService`, `tenantRoutes` **DELETED**.
    *   Legacy `TenantRepository` marked as **DEPRECATED** (kept for dependencies).
5.  **Finance Feature:**
    *   `Expense` fully migrated and legacy files deleted.
    *   `RentPayment` migrated to `src/features/finance/rent-payment/`.
    *   `RentTransaction` migrated to `src/features/finance/rent-transaction/`.
    *   Legacy `RentPaymentController`, `rentPaymentRoutes` **DELETED**.
    *   Legacy `RentTransactionController`, `rentTransactionRoutes` **DELETED**.
    *   Legacy Services kept for dependencies.
6.  **Auth Feature:**
    *   `Auth` migrated to `src/features/auth/auth/`.
    *   `User` migrated to `src/features/auth/user/`.
    *   Legacy `UserController`, `authRoutes`, `userRoutes` **DELETED**.
    *   Legacy `UserService` kept for dependencies.
7.  **Files Feature:**
    *   `FileStorage` migrated to `src/features/files/file-storage/`.
    *   Legacy `FileController`, `FileStorageService`, `fileRoutes` **DELETED**.
8.  **Build Status:** `npm run build` passes.

### ⏳ Pending / Next Steps
1.  **Phase 4 (Multi-Org):** Start Multi-Organization implementation.
    *   **Master DB:** Setup `organizations` table.
    *   **Middleware:** Implement `OrganizationMiddleware`.
2.  **Meter Cleanup (BLOCKED):**
    *   Legacy `MeterService` and `MeterRepository` **cannot be deleted yet**.
    *   **Blocker:** `UnitUtilityService` and `RentTransactionService` depend on the legacy Meter service/repo.
3.  **Legacy Repository Cleanup:**
    *   `TenantRepository` and `LeaseRepository` are deprecated but still used by Finance services. Once Finance is migrated, these can be deleted.

## ��️ Architecture Notes
*   **Hybrid State:**
    *   **New:** `src/features/` (Leases, Properties, Units, Meters, UnitTenants, Tenants).
    *   **Legacy:** `src/controllers/`, `src/services/` (Finance, Auth, UnitUtility, etc.).
*   **Dependency Injection:** New features use manual DI in `server.ts`. Legacy services use `DependencyContainer.ts`.
*   **Deprecated Repositories:** `TenantRepository` and `LeaseRepository` in `src/repositories/` are deprecated. Do not use them in new code. Use the ones in `src/features/...`.

## 🚀 How to Resume
1.  **Read:** `BACKEND_REFACTORING_ROADMAP.md`.
2.  **Action:** Start Phase 3.3.1 (Expense Feature).
    *   Scaffold `src/features/finance/expense/`.
    *   Migrate logic from `ExpenseController` and `ExpenseService`.
