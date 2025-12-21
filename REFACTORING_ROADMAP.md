# 🗺️ Frontend Architecture Refactoring Roadmap: The Final Consolidation

**Objective:** Complete the transition to a strict **Vertical Slice Architecture**.
**Current Status:** `src/components` is clean. `src/hooks` and `src/services` still contain domain logic that must be moved.

---

## 🚀 Phase 1: The Service Migration (Critical) ✅ COMPLETED
**Goal:** Empty `src/services` completely. All logic must live in `src/features/[feature]/services`.

- [x] **Units Feature**
    - Move `src/services/unitService.ts` -> `src/features/units/services/`
    - Move `src/services/unitUtilityService.ts` -> `src/features/units/services/`
- [x] **Meters Feature**
    - Move `src/services/meterService.ts` -> `src/features/meters/services/`
- [x] **Assets Feature** (Check if feature exists, if not create `src/features/assets`)
    - Move `src/services/assetService.ts` -> `src/features/assets/services/`
- [x] **Templates Feature**
    - Move `src/services/templateService.ts` -> `src/features/templates/services/`
- [x] **Bulk Operations Feature**
    - Move `src/services/bulkOperationsService.ts` -> `src/features/bulkOperations/services/`
- [x] **Files Feature**
    - Move `src/services/fileService.ts` -> `src/features/files/services/`

---

## 🎣 Phase 2: The Hook Migration ✅ COMPLETED
**Goal:** Empty `src/hooks` of domain logic.

- [x] **Units Feature**
    - Move `src/hooks/useUnits.ts` -> `src/features/units/hooks/`
    - Move `src/hooks/useUnitUtilities.ts` -> `src/features/units/hooks/`
- [x] **Meters Feature**
    - Move `src/hooks/useMeters.ts` -> `src/features/meters/hooks/`
- [x] **Assets Feature**
    - Move `src/hooks/useAssets.ts` -> `src/features/assets/hooks/`
- [x] **Dashboard Feature**
    - Move `src/hooks/useDashboardStats.ts` -> `src/features/dashboard/hooks/`
    - Move `src/hooks/useChartCarousel.ts` -> `src/features/dashboard/hooks/`
    - Move `src/hooks/useActivityItems.ts` -> `src/features/dashboard/hooks/`
- [x] **Admin/Navigation Feature**
    - Move `src/hooks/useNavigationConfig.ts` -> `src/features/admin/hooks/` (or appropriate feature)

---

## 📦 Phase 3: Type Colocation ✅ COMPLETED
**Goal:** Move domain types to their features.

- [x] **Assets Feature**
    - Move `src/types/asset.ts` -> `src/features/assets/types/`
- [x] **Review Shared Types**
    - Analyze `src/types/index.ts` and `src/types/common.ts` to ensure no hidden domain logic.

---

## 🏰 Phase 4: Feature Standardization ("God-Level" Hygiene) ✅ COMPLETED
**Goal:** Ensure every feature follows the strict folder structure.

**Standard Structure:**
```text
src/features/[feature]/
├── components/
├── hooks/
├── pages/
├── services/
├── types/
└── index.ts (Public API)
```

- [x] **Dashboard:** Create `types/` folder.
- [x] **Admin:** Create `hooks/`, `services/`, `types/` folders if needed, or verify they are truly not needed.
- [x] **Templates:** Standardize structure.
- [x] **Barrel Files:** Ensure every feature has an `index.ts` exporting only what is necessary.

---

## 🧹 Phase 5: The Final Purge ✅ COMPLETED
**Goal:** Remove empty directories and unused files.

- [x] **Refactor Bulk Operations Feature:** Remove dependencies on `@/services`.
- [x] **Refactor Files Feature:** Remove dependencies on `@/services`.
- [x] **Refactor Meters Feature:** Remove dependencies on `@/hooks`.
- [x] **Refactor Finance Feature:** Remove dependencies on `@/services` and `@/hooks`.
- [x] **Refactor Properties Feature:** Remove dependencies on `@/services` and `@/hooks`.
- [x] **Refactor Remaining Features:** Dashboard, Leases, Units, Tenants, Auth, Admin.
- [x] **Deprecate Central Indexes:** Add `@deprecated` to `src/services/index.ts` and `src/hooks/index.ts`.
- [x] Delete `src/services` (Empty).
- [x] Delete `src/hooks/index.ts`.
- [x] Verify no circular dependencies between features.

## 🎉 Refactoring Complete!
The codebase now follows a strict **Vertical Slice Architecture**.
- All domain logic is in `src/features`.
- `src/components` contains only dumb UI components.
- `src/hooks` contains only generic hooks (`useApi`, `useDragAndDrop`).
- `src/services` is gone.
