# 🗺️ Frontend Refactoring Roadmap: The "God-Level" Transformation

**Objective:** Complete end-to-end refactoring of `frontend/src` using the `FrontendArchitect` agent across multiple stateless sessions.
**Agent:** `@FrontendArchitect` (Instructions in `.github/agents/FrontendArchitect.agent.md`)
**Protocol:** Manual Verification after each step.

---

## 🏁 Session 1: The Purge (Cleanup & Audit) ✅ COMPLETED
**Goal:** Remove dead weight to make subsequent refactoring easier.
**Target:** `src/components`, `src/pages`, `src/hooks`
**Prompt for Agent:**
> "Read `.github/agents/FrontendArchitect.agent.md`. Start **Phase 1: The Purge**. Scan `src/components` and `src/pages` for unused files. List them, verify usages, and propose a plan to delete or deprecate them. Do not delete anything without my explicit confirmation."

---

## 🏗️ Session 2: The Harvest (UI Foundation) ✅ COMPLETED
**Goal:** Centralize low-level UI components (Atoms/Molecules) into the Design System.
**Target:** `src/components/ui`, `src/components/common` -> `src/componentDesignLibrary`
**Prompt for Agent:**
> "Read `.github/agents/FrontendArchitect.agent.md`. Start **Phase 2: The Harvest**. Analyze `src/components/ui` and `src/components/common`. Identify reusable patterns (Buttons, Inputs, Cards, Modals). Refactor them into `src/componentDesignLibrary` following the 'One Component, One Folder' rule (SCSS modules, types). Update usages in the app."

---

## 🔐 Session 3: Feature Modularization (Auth & Core) ✅ COMPLETED
**Goal:** Refactor Authentication and Navigation into self-contained features.
**Target:** `src/pages/auth`, `src/components/auth`, `src/components/navigation` -> `src/features/auth`, `src/features/navigation`
**Prompt for Agent:**
> "Read `.github/agents/FrontendArchitect.agent.md`. Start **Phase 3: Modularization**. Refactor the Authentication feature. Move `src/pages/auth` and `src/components/auth` into a unified `src/features/auth` structure. Enforce SOLID principles and separate logic (hooks) from view (components)."

---

## 🏠 Session 4: Feature Modularization (Property Management) ✅ COMPLETED
**Goal:** Consolidate Property, Unit, and Tenant logic.
**Target:** `src/features/properties`, `src/pages/tenants`, `src/pages/units`, `src/components/units`
**Prompt for Agent:**
> "Read `.github/agents/FrontendArchitect.agent.md`. Start **Phase 3: Modularization**. Refactor Property and Tenant management. Consolidate `src/features/properties`, `src/pages/tenants`, and `src/pages/units` into `src/features/properties` and `src/features/tenants`. Ensure components use the centralized Design Library."

---

## 💰 Session 5: Feature Modularization (Finance) ✅ COMPLETED
**Goal:** Consolidate Payments, Expenses, and Rent Collection.
**Target:** `src/pages/payments`, `src/pages/expenses`, `src/pages/rent*`, `src/components/rentCollection`
**Prompt for Agent:**
> "Read `.github/agents/FrontendArchitect.agent.md`. Start **Phase 3: Modularization**. Refactor the Finance domain. Group `src/pages/payments`, `src/pages/expenses`, and `src/components/rentCollection` into a `src/features/finance` module. Check for duplicated logic in calculations and extract to utilities."

---

## 🔌 Session 6: Shared Logic & Hooks ✅ COMPLETED
**Goal:** Clean up global hooks and services.
**Target:** `src/hooks`, `src/services`, `src/utils`
**Prompt for Agent:**
> "Read `.github/agents/FrontendArchitect.agent.md`. Analyze `src/hooks` and `src/services`. Identify 'God Hooks' or services doing too much. Apply **Phase 4: SOLID Enforcement** to break them down. Ensure strict typing and remove `any`."

---

## 🎨 Session 7: Final Polish (Styling & Quality) ✅ COMPLETED
**Goal:** Enforce consistency and safety.
**Target:** Entire `src` folder.
**Status:**
- [x] **Theme Enforcer:** Audit complete (`frontend/docs/THEME_AUDIT.md`).
- [x] **Resilience:** Audit complete (`frontend/docs/RESILIENCE_AUDIT.md`).
- [x] **Performance:** Audit complete (`frontend/docs/PERFORMANCE_AUDIT.md`).
- [x] **Documentation:** Generated READMEs for all `src/features/*` folders.

**Prompt for Agent:**
> "Read `.github/agents/FrontendArchitect.agent.md`. Run **Phase 4** and **God-Level Capabilities**.
> 1. **Theme Enforcer:** Check for hardcoded hex values.
> 2. **Resilience:** Ensure ErrorBoundaries are in place.
> 3. **Performance:** Check for heavy imports.
> 4. **Documentation:** Generate READMEs for all `src/features/*` folders."

---

## 🔄 How to Use This Roadmap
1.  Start a new Copilot session.
2.  Paste the **Prompt for Agent** for the current session.
3.  Follow the agent's **Consultation Phase** (Plan -> Approve -> Execute).
4.  Manually verify the changes.
5.  Commit changes: `git commit -m "Refactor: Session X - [Goal]"`.
6.  Move to the next session.
