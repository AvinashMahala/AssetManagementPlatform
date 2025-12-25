# 🗺️ Backend Refactoring Roadmap: The "God-Level" Architecture

**Objective:** Transform the backend into a **Scalable, Event-Driven, Multi-Organization (Database-per-Org)** system using **Vertical Slice Architecture**.

## 🧠 Context Handoff (Read This First)
**Current Status (Feb 24, 2025):**
*   **Active Task:** Phase 6 (Legacy Elimination).
*   **Recent Wins:**
    *   **Phase 6.3 Complete:** Tenant & Lease repositories migrated and legacy files deleted.
    *   **Phase 6.2 (Partial):** Meter & MeterReading migrated and legacy files deleted.
    *   **Phase 5 Complete:** Server refactored, DI container removed, legacy folders moved to `src/features/legacy`.
    *   **Multi-Organization** feature (Phase 4) activated.

**Context for AI Agents:**
*   **Architecture:** Vertical Slices (Features isolated in `src/features/`).
*   **Data Access:** `BaseRepository` (Generic SQL generation) + `OrganizationConnectionManager` (Dynamic DB Switching).
*   **Multi-Tenancy:** "Database-per-Organization".
*   **Events:** `EventBus` decouples core logic.

---

## 🏗️ Phase 1: The Bedrock (Shared Infrastructure)
- [x] 1.1 Directory & Base Classes
- [x] 1.2 Shared Utilities Migration

## 🚀 Phase 2: The Pilot (Lease Feature)
- [x] 2.1 Scaffold & Core
- [x] 2.2 Data Layer
- [x] 2.3 Service Layer
- [x] 2.4 API Layer

## 📦 Phase 3: The Great Migration (Core Features)
- [x] 3.1 Properties Feature (Property, Unit, Meter)
- [x] 3.2 Tenants Feature (Tenant, UnitTenant)
- [x] 3.3 Finance Feature (Expense, RentPayment, RentTransaction)
- [x] 3.4 Auth Feature (Auth, User)
- [x] 3.5 Files Feature (FileStorage)

## 🏢 Phase 4: Multi-Organization Activation
- [x] 4.1 Master Database Setup
- [x] 4.2 Middleware & Connection Switching
- [x] 4.3 Onboarding Automation

## 🏁 Phase 5: Final Polish
- [x] 5.1 Server & DI Cleanup
- [x] 5.2 Final Verification

---

## 🧹 Phase 6: Legacy Elimination (The Great Consolidation)
**Goal:** Completely remove `src/features/legacy` by migrating all remaining logic to Feature Modules.

### 6.1 Auth & User Consolidation
- [x] **Action:** Migrate `PasswordResetService`, `SecurityQuestionRepository`, `RecoveryCodeRepository` to `src/features/auth`.
- [x] **Action:** Ensure `features/auth/user` covers all `legacy/UserService` functionality.
- [x] **Cleanup:** Delete legacy Auth files.

### 6.2 Property & Meter Consolidation
- [x] **Action:** Migrate `PropertyFile*` and `PropertyReceiptTemplate*` to `src/features/properties/property` (or `files` / `receipt-template`).
- [x] **Action:** Verify `features/properties/property/data/PropertyRepository` covers all legacy queries.
- [x] **Action:** Verify `features/properties/meter` covers all legacy Meter logic.
- [x] **Cleanup:** Delete legacy Property & Meter files.

### 6.3 Tenant & Lease Consolidation
- [x] **Action:** Verify `features/tenants/tenant` covers all legacy Tenant logic.
- [x] **Action:** Verify `features/leases` covers all legacy Lease logic.
- [x] **Cleanup:** Delete legacy Tenant & Lease repositories.

### 6.4 Finance Consolidation (The Big One)
- [x] **Action:** Analyze `legacy/RentTransactionService` (1400 lines) and break it down into Use Cases in `features/finance/rent-transaction`.
- [x] **Action:** Migrate `RentPaymentService` logic.
- [x] **Cleanup:** Delete legacy Finance files.

### 6.5 Templates & Notifications
- [x] **Action:** Move `NotificationService` to `src/shared/infrastructure/notifications`.
- [x] **Action:** Integrate `Template*` services into `features/finance/receipt-template`.
- [x] **Cleanup:** Delete remaining legacy files and the `src/features/legacy` folder.

### 6.6 Global Types & Interfaces Consolidation
- [x] **Action:** Migrate Finance types (`RentTransaction`, `Payment`, `Receipt`) to `features/finance`.
- [x] **Action:** Migrate Property types (`Property`, `Unit`, `Meter`) to `features/properties`.
- [x] **Action:** Migrate Tenant/Lease types to `features/tenants` & `features/leases`.
- [x] **Action:** Migrate Auth types (`User`) to `features/auth`.
- [x] **Cleanup:** Delete `src/models` and `src/interfaces`.

## 🏁 Phase 7: Final Verification
- [ ] **Action:** Run all tests.
- [ ] **Action:** Verify application startup.
- [ ] **Action:** Check for any broken imports.
