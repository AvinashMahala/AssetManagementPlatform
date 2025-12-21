# 🗺️ Refactoring Roadmap: Property Dashboard Modularization

**Objective:** Deconstruct the monolithic `PropertyDashboard` and its 2000-line SCSS file into a modular, maintainable, and scalable architecture using CSS Modules and Custom Hooks.

**Current Status:** ✅ **COMPLETED**. The monolith has been slain.

---

## 🎨 Phase 1: Style Modularization (The Split)
**Goal:** Break the SCSS monolith into component-specific CSS Modules.

- [x] **Create Module Files**
    - [x] `src/features/properties/pages/Dashboard/PropertyStatsSection.module.scss`
    - [x] `src/features/properties/pages/Dashboard/PropertyChartsSection.module.scss`
    - [x] `src/features/properties/pages/Dashboard/PropertyAlertsSection.module.scss`
    - [x] `src/features/properties/pages/Dashboard/PropertyDashboard.module.scss` (Layout only)
    - [x] `src/features/properties/pages/Dashboard/PropertyTabsSection.module.scss`
- [x] **Migrate Styles**
    - [x] Move `.key-metrics`, `.metric-card` styles to `PropertyStatsSection.module.scss`
    - [x] Move chart styles to `PropertyChartsSection.module.scss`
    - [x] Move alert styles to `PropertyAlertsSection.module.scss`
    - [x] Move layout/container styles to `PropertyDashboard.module.scss`
    - [x] Move tabs/list styles to `PropertyTabsSection.module.scss`

---

## 🧠 Phase 2: Logic Extraction (The Clean)
**Goal:** Separate business logic and UI logic from the view.

- [x] **Extract Data Hook**
    - [x] Create `src/features/properties/hooks/usePropertyDashboard.ts`
    - [x] Move `useProperty`, `useUnits`, `useLeases`, `usePayments`, `useTenants` calls there.
    - [x] Return aggregated data ready for the view.
- [x] **Extract UI Hook**
    - [x] Create `src/features/properties/hooks/useScrollReveal.ts`
    - [x] Move scroll animation logic (IntersectionObserver/scroll listeners) there.

---

## 🧩 Phase 3: Component Isolation & Integration
**Goal:** Wire everything together using the new modules.

- [x] **Refactor Sub-Components**
    - [x] Update `PropertyStatsSection.tsx` to use `styles.module.scss`
    - [x] Update `PropertyChartsSection.tsx` to use `styles.module.scss`
    - [x] Update `PropertyAlertsSection.tsx` to use `styles.module.scss`
    - [x] Update `PropertyTabsSection.tsx` to use `styles.module.scss`
- [x] **Refactor Main Dashboard**
    - [x] Update `PropertyDashboard.tsx` to use `usePropertyDashboard` and `useScrollReveal`.
    - [x] Remove old SCSS import.
- [x] **Cleanup**
    - [x] Delete `PropertyDashboard.scss` (The Monolith).

---

## ✅ Definition of Done
- [x] No global class names used in the dashboard.
- [x] `PropertyDashboard.tsx` is significantly reduced in complexity.
- [x] All styles are scoped via CSS Modules.
- [x] No regression in UI or animations.
