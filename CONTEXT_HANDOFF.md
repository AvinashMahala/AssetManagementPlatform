# 🤝 Context Handoff: AssetManagementPlatform

**Date:** December 21, 2025
**Current Phase:** Backend Refactoring - Phase 3.1 (Properties Feature)

## 🎯 Current Mission
We are migrating the backend from a Layered Architecture (Controllers/Services/Repositories) to a **Vertical Slice Architecture** (`src/features/{domain}/{feature}`). We are using the **Strangler Fig Pattern** to incrementally replace legacy code.

## 🚧 Status: Phase 3.1 (Properties) - IN PROGRESS

### ✅ Completed
1.  **Infrastructure:** `src/shared/` is established (BaseRepository, EventBus, etc.).
2.  **Leases Feature:** Fully migrated to `src/features/leases/`.
3.  **Properties Feature (Partial):**
    *   `Property` core logic migrated to `src/features/properties/property/`.
    *   `Unit` core logic migrated to `src/features/properties/unit/`.
    *   **CRITICAL:** `PropertyFileController` and `PropertyReceiptTemplateController` have been **decoupled** from the legacy `PropertyService`. They now reside in `src/features/properties/property/api/` but temporarily inject legacy services (`PropertyFileService`, `PropertyReceiptTemplateService`) via `DependencyContainer`.
    *   `server.ts` is updated to use the new controllers.
    *   `npm run build` passes.

### ⏳ Pending / Next Steps
1.  **Migrate Meters:** Move `Meter` logic from `src/controllers/MeterController.ts` and `src/services/MeterService.ts` to `src/features/properties/meter/`.
2.  **Manual Verification:** User needs to verify Property, Unit, and Meter endpoints.
3.  **Phase 3.2 (Tenants):** Begin migration of Tenant feature.

## 🏗️ Architecture Notes
*   **Hybrid State:** The application is currently running in a hybrid state.
    *   **New:** `src/features/` (Leases, Properties, Units).
    *   **Legacy:** `src/controllers/`, `src/services/` (Tenants, Finance, Auth, etc.).
*   **Dependency Injection:** We are using `DependencyContainer.ts` to manage legacy services. New features use manual dependency injection in `server.ts` (Composition Root).
*   **Goal:** Empty out `src/controllers/` and `src/services/` completely so they can be deleted in Phase 5.

## 🚀 How to Resume
1.  **Read:** `BACKEND_REFACTORING_ROADMAP.md` to see the full plan.
2.  **Action:** Start the **Meter Migration**.
    *   Create `src/features/properties/meter/` structure.
    *   Migrate `Meter` model, repository, use cases, and controller.
    *   Update `server.ts` to use the new `MeterController`.
