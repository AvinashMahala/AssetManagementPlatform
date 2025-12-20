# 🗺️ Frontend Architecture Refactoring Roadmap: The "Vertical Slice" Evolution

**Objective:** Transition from a Layered Architecture (Components/Hooks/Services) to a strict **Vertical Slice Architecture (Features)**.
**Goal:** Eliminate "Split Brain" logic, enforce strict boundaries, and achieve "God-Level" modularity.
**Current State:** Hybrid (Features exist, but shared folders are polluted).

---

## 🏗️ Phase 1: The Great Migration (Components) ✅ COMPLETED
**Goal:** Purge `src/components` of domain-specific logic. Move "Smart" components to their respective features.
**Rule:** `src/components` must ONLY contain generic, business-agnostic UI (e.g., `AppLayout`, `DateRangePicker`).

- [x] **Properties Migration**
    - Move `src/components/forms/EnhancedAmenitiesForm.tsx` -> `src/features/properties/components/forms/`
    - Move `src/components/forms/PropertyFileUpload.tsx` -> `src/features/properties/components/forms/`
    - Move `src/components/forms/UnitFormTabbed.tsx` -> `src/features/units/components/forms/`
- [x] **Finance Migration**
    - Move `src/components/receipts/*` -> `src/features/finance/components/receipts/`
    - Move `src/components/forms/ExpenseFormTabbed.tsx` -> `src/features/finance/components/forms/`
    - Move `src/components/forms/PaymentFormTabbed.tsx` -> `src/features/finance/components/forms/`
- [x] **Tenants Migration**
    - Move `src/components/forms/TenantFormTabbed.tsx` -> `src/features/tenants/components/forms/`
    - Move `src/components/forms/OwnerContactForm.tsx` -> `src/features/tenants/components/forms/` (or properties depending on usage)
- [x] **Auth Migration**
    - Move `src/components/forms/PasswordResetForm.tsx` -> `src/features/auth/components/forms/`
    - Move `src/components/ConsentDialog.tsx` -> `src/features/auth/components/` (if auth specific) or `src/components/common` (if generic).

---

## 🧠 Phase 2: The Logic Relocation (Hooks & Services) ✅ COMPLETED
**Goal:** Empty `src/hooks` and `src/services` of domain logic.
**Rule:** If a hook/service mentions "Tenant", "Property", or "Expense", it belongs in a feature.

- [x] **Service Migration**
    - Move `src/services/propertyService.ts` -> `src/features/properties/services/`
    - Move `src/services/tenantService.ts` -> `src/features/tenants/services/`
    - Move `src/services/expenseService.ts` -> `src/features/finance/services/`
    - Move `src/services/paymentService.ts` -> `src/features/finance/services/`
    - Move `src/services/receiptService.ts` -> `src/features/finance/services/`
    - Move `src/services/authService.ts` -> `src/features/auth/services/`
- [x] **Hook Migration**
    - Move `src/hooks/useProperties.ts` -> `src/features/properties/hooks/`
    - Move `src/hooks/useTenants.ts` -> `src/features/tenants/hooks/`
    - Move `src/hooks/useExpenses.ts` -> `src/features/finance/hooks/`
    - Move `src/hooks/usePayments.ts` -> `src/features/finance/hooks/`

---

## 🔌 Phase 3: The API Unification
**Goal:** Resolve the "Split Brain" API layer.
**Problem:** `src/utils/apiService.ts` (Logging) vs `src/services/apiClient.ts` (Class-based).

- [ ] **Merge Logic:** Refactor `src/services/apiClient.ts` to include the logging and error handling capabilities of `src/utils/apiService.ts`.
- [ ] **Update Usages:** Find all usages of `apiService` and replace with `apiClient`.
- [ ] **Delete:** Remove `src/utils/apiService.ts`.
- [ ] **Move:** Move `src/services/apiClient.ts` to `src/lib/apiClient.ts` (It is a core library, not a service).

---

## 📦 Phase 4: Type Colocation
**Goal:** Move domain types closer to their usage.

- [ ] Move `src/types/property.ts` -> `src/features/properties/types/index.ts`
- [ ] Move `src/types/tenant.ts` -> `src/features/tenants/types/index.ts`
- [ ] Move `src/types/expense.ts` -> `src/features/finance/types/index.ts`
- [ ] Update all imports to point to the new locations.

---

## 🎨 Phase 5: Style & Convention Cleanup
**Goal:** Enforce naming conventions and clean up orphaned styles.

- [ ] **Styles:** Move `src/styles/dashboard/*` -> `src/features/dashboard/styles/` or colocate as modules.
- [ ] **Naming:** Rename `src/features/bulkOperations` -> `src/features/bulk-operations`.
- [ ] **Naming:** Ensure all Page components end with `Page.tsx`.
- [ ] **Naming:** Ensure all boolean props start with `is`, `has`, or `should`.

---

## 🏁 Definition of Done
1. `src/components` only contains truly generic UI.
2. `src/hooks` only contains generic React hooks (e.g., `useDebounce`).
3. `src/services` is empty or deleted (replaced by `src/lib` and feature services).
4. `src/features` is self-contained (Logic, UI, Styles, Types all together).
