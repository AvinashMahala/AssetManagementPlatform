# 🗺️ Frontend Refactoring Roadmap: The "Vertical Slice" Perfection

**Objective:** Finalize the transition to a pure Vertical Slice Architecture. Eliminate all "Split Brain" logic and "Global Dumps".
**Agent:** `@FrontendArchitect`
**Protocol:** Manual Verification after each step.

---

## 🧹 Session 1: The Component Migration (Stop the Leakage)
**Goal:** Move domain-specific components out of `src/components` and into their respective features.
**Target:** `src/components/forms`, `src/components/receipts`, `src/components/units`
**Prompt for Agent:**
> "Analyze `src/components`. Identify components that contain domain logic (e.g., `EnhancedAmenitiesForm`, `ReceiptGenerator`). Move them to their corresponding `src/features/[feature]/components` folder. Ensure `src/components` ONLY contains generic, shared UI logic. Update all imports."

---

## 🎣 Session 2: The Hook & Service Migration (Colocation)
**Goal:** Empty the global `src/hooks` and `src/services` folders of domain-specific logic.
**Target:** `src/hooks`, `src/services`
**Prompt for Agent:**
> "Analyze `src/hooks` and `src/services`. Move domain-specific files (e.g., `useProperties.ts`, `propertyService.ts`) into `src/features/[feature]/hooks` and `src/features/[feature]/services`. Keep only truly generic utilities (like `useApi`, `useDebounce`) in the global folders. Update all imports."

---

## 🌐 Session 3: The API Unification (One Way to Rule Them All)
**Goal:** Merge the conflicting API layers into a single, robust client.
**Target:** `src/utils/apiService.ts`, `src/services/apiClient.ts`
**Prompt for Agent:**
> "Refactor the API layer. Merge the logging capabilities of `src/utils/apiService.ts` into the class-based `src/services/apiClient.ts`. Ensure there is ONLY ONE way to make HTTP requests. Delete `src/utils/apiService.ts` and update all consumers to use the unified `ApiClient`."

---

## 🎨 Session 4: Style & Type Consolidation
**Goal:** Move orphaned styles and types to their features.
**Target:** `src/styles`, `src/types`
**Prompt for Agent:**
> "1. Move styles from `src/styles/dashboard` to `src/features/dashboard`.
> 2. Analyze `src/types`. Move domain-specific types (e.g., `property.ts`, `tenant.ts`) to `src/features/[feature]/types`.
> 3. Ensure `src/types` only contains shared definitions (e.g., `api.ts`, `common.ts`)."

---

## 🏷️ Session 5: Naming Convention & Barrel File Polish
**Goal:** Enforce the "God-Level" naming standards.
**Target:** Entire `src` folder.
**Prompt for Agent:**
> "Audit the codebase for naming convention violations:
> 1. Ensure all Feature folders are `kebab-case`.
> 2. Ensure all Component folders are `PascalCase`.
> 3. Ensure all Boolean props start with `is/has/should`.
> 4. Verify every component folder has an `index.ts` barrel file.
> 5. Rename `features/bulkOperations` to `features/bulk-operations`."

---

## 🔄 How to Use This Roadmap
1.  Start a new Copilot session.
2.  Paste the **Prompt for Agent** for the current session.
3.  Follow the agent's **Consultation Phase** (Plan -> Approve -> Execute).
4.  Manually verify the changes.
5.  Commit changes: `git commit -m "Refactor: Session X - [Goal]"`.
6.  Move to the next session.
