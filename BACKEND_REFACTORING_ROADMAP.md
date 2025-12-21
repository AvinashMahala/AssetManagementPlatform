# 🗺️ Backend Refactoring Roadmap: The "God-Level" Architecture

**Objective:** Transform the backend into a **Scalable, Event-Driven, Multi-Organization (Database-per-Org)** system using **Vertical Slice Architecture**.

**Context for AI Agents:**
*   **Architecture:** Vertical Slices (Features isolated in `src/features/`).
*   **Data Access:** `BaseRepository` (Generic SQL generation) + `OrganizationConnectionManager` (Dynamic DB Switching).
*   **Multi-Tenancy:** "Database-per-Organization".
    *   **Dev Mode:** Defaults to single local DB if no `X-Organization-ID` header.
    *   **Prod Mode:** Requires `X-Organization-ID` header to route to specific Org DB.
*   **Events:** `EventBus` decouples core logic from side effects (emails, logs).
*   **Terminology:** "Organization" = SaaS Customer. "Tenant" = Property Renter.

**Protocol for Each Step:**
1.  **Execute:** Copilot performs the code changes.
2.  **Test:** User performs the specified Manual Test.
3.  **Confirm:** User confirms "Test Passed".
4.  **Update:** Copilot marks the step as `[x]` in this document.

---

## 🏗️ Phase 1: The Bedrock (Shared Infrastructure)
**Goal:** Build the reusable foundation so features can be lightweight.

### 1.1 Directory & Base Classes
- [x] **Action:** Create `src/shared/` structure.
- [x] **Action:** Implement `BaseRepository.ts` (Generic CRUD + Dynamic SQL).
- [x] **Action:** Implement `EventBus.ts` (Pub/Sub).
- [x] **Action:** Implement `OrganizationConnectionManager.ts` (DB Switching Logic).
    *   *Note:* Must support "Dev Mode Fallback" (use default DB if no header).
- [x] **Manual Test:** Verify files exist in `src/shared/infrastructure/`.
- [x] **Update Doc:** Mark 1.1 as complete.

### 1.2 Shared Utilities Migration
- [x] **Action:** Move `utils/`, `middlewares/`, `types/` to `src/shared/`.
- [x] **Action:** Update imports in existing code (using search/replace) to point to `@/shared/...`.
- [x] **Manual Test:** Run `npm run build` to ensure no import errors.
- [x] **Update Doc:** Mark 1.2 as complete.

---

## 🚀 Phase 2: The Pilot (Lease Feature)
**Goal:** Prove the architecture with one complex feature.

### 2.1 Scaffold & Core
- [x] **Action:** Create `src/features/leases/{api,core,data,handlers}`.
- [x] **Action:** Define `Lease` interface in `core/lease.types.ts`.
- [x] **Action:** Define `LeaseCreated` event in `core/lease.events.ts`.
- [x] **Manual Test:** Verify folder structure and type definitions.
- [x] **Update Doc:** Mark 2.1 as complete.

### 2.2 Data Layer
- [x] **Action:** Implement `LeaseRepository` (extending `BaseRepository`).
- [x] **Action:** Add custom method `findExpiringSoon` to Repo.
- [x] **Manual Test:** Verify compilation.
- [x] **Update Doc:** Mark 2.2 as complete.

### 2.3 Service Layer
- [x] **Action:** Implement `LeaseService` (using Repo + EventBus).
- [x] **Manual Test:** Review `LeaseService` code to ensure it uses `EventBus` instead of direct dependencies.
- [x] **Update Doc:** Mark 2.3 as complete.

### 2.4 API Layer
- [x] **Action:** Implement `LeaseController` and `lease.routes.ts`.
- [x] **Action:** Register new routes in `server.ts`.
- [x] **Manual Test:** Use Postman/Curl to `POST /api/leases` and verify console log from Handler.
- [x] **Update Doc:** Mark 2.4 as complete.

---

## 📦 Phase 3: The Great Migration (Core Features)
**Goal:** Move remaining domains into the new structure. *Execute one by one.*

**Architectural Pattern for Features (The "Hybrid" Standard):**

**Prerequisite:** Shared Use Case Interface
```typescript
// src/shared/core/IUseCase.ts
export interface IUseCase<IRequest, IResponse> {
  execute(request: IRequest): Promise<IResponse> | IResponse;
}
```

Each sub-feature (e.g., `property`, `unit`) must follow this strict structure:
```text
src/features/{domain}/{sub-feature}/
├── index.ts                    # Public API Gatekeeper (Exports Module & Interfaces)
├── {name}.module.ts            # Composition Root (Wires Controller, Use Cases, Repo)
├── README.md                   # Feature Documentation
├── __tests__/                  # Co-located Tests
│   ├── use-cases/
│   └── api/
│
├── api/                        # HTTP Layer (The "Air Gap")
│   ├── dtos/                   # Network Contracts (Request/Response)
│   │   ├── Create{Name}Req.ts
│   │   └── {Name}Response.ts
│   ├── mappers/                # Domain Entity -> API Response Mappers
│   │   └── {Name}ApiMapper.ts
│   ├── validation/             # Input Validation (Zod Schemas)
│   │   └── {name}.schema.ts
│   ├── {Name}Controller.ts
│   └── {name}.routes.ts
│
├── core/                       # Domain Layer (Pure Business Logic)
│   ├── use-cases/              # 👈 Atomic Business Logic (Commands)
│   │   ├── Create{Name}.usecase.ts
│   │   ├── Update{Name}.usecase.ts
│   │   ├── Delete{Name}.usecase.ts
│   │   └── {BusinessAction}.usecase.ts (e.g. Archive, Publish)
│   ├── interfaces/             # Contracts (Dependency Inversion)
│   │   └── I{Name}Repository.ts
│   ├── types/                  # Domain Entities & Value Objects
│   │   ├── {name}.types.ts
│   │   └── {name}.events.ts
│   └── errors/                 # Feature-specific Domain Errors
│       └── {Name}NotFoundError.ts
│
└── data/                       # Data Access Layer (The "Shield")
    ├── repository/             # ✍️ WRITES (Repository Pattern)
    │   └── {Name}Repository.ts # Implements I{Name}Repository
    ├── queries/                # ⚡️ READS (CQRS Pattern)
    │   ├── Get{Name}ById.query.ts
    │   ├── List{Name}s.query.ts      # Handles filtering/sorting/pagination
    │   └── Get{Name}Dashboard.query.ts
    ├── interfaces/             # DB Row Interfaces (snake_case)
    │   └── I{Name}Row.ts
    ├── schema/                 # DB Definitions
    │   └── {name}.jsonb.ts     # Zod Schemas for JSONB columns
    ├── validators/             # Runtime Row Validation (Zod)
    │   └── {Name}RowValidator.ts
    ├── errors/                 # DB Error Translation
    │   └── {Name}DbErrorMapper.ts
    └── mappers/                # DB Row -> Domain Entity Mappers
        └── {Name}Mapper.ts
```

### 3.1 Properties Feature
**Structure:** `src/features/properties/{property, unit, meter}/{api, core, data}`
- [ ] **Action:** Migrate `Property` logic to `src/features/properties/property/`.
- [ ] **Action:** Migrate `Unit` logic to `src/features/properties/unit/`.
- [ ] **Action:** Migrate `Meter` logic to `src/features/properties/meter/`.
- [ ] **Manual Test:** Verify Property, Unit, and Meter CRUD endpoints.
- [ ] **Update Doc:** Mark 3.1 as complete.

### 3.2 Tenants Feature
**Structure:** `src/features/tenants/{tenant, unit-tenant}/{api, core, data}`
- [ ] **Action:** Migrate `Tenant` logic to `src/features/tenants/tenant/`.
- [ ] **Action:** Migrate `UnitTenant` (Lease Association) logic to `src/features/tenants/unit-tenant/`.
- [ ] **Manual Test:** Verify Tenant CRUD endpoints.
- [ ] **Update Doc:** Mark 3.2 as complete.

### 3.3 Finance Feature
**Structure:** `src/features/finance/{expense, rent-payment, rent-transaction}/{api, core, data}`
- [ ] **Action:** Migrate `Expense` logic to `src/features/finance/expense/`.
- [ ] **Action:** Migrate `RentPayment` logic to `src/features/finance/rent-payment/`.
- [ ] **Action:** Migrate `RentTransaction` logic to `src/features/finance/rent-transaction/`.
- [ ] **Manual Test:** Verify Payment recording.
- [ ] **Update Doc:** Mark 3.3 as complete.

### 3.4 Auth Feature
**Structure:** `src/features/auth/{auth, user, role}/{api, core, data}`
- [ ] **Action:** Migrate `Auth` (Login/Register) logic to `src/features/auth/auth/`.
- [ ] **Action:** Migrate `User` logic to `src/features/auth/user/`.
- [ ] **Action:** Migrate `Role` logic to `src/features/auth/role/`.
- [ ] **Manual Test:** Verify Login/Register flows.
- [ ] **Update Doc:** Mark 3.4 as complete.

### 3.5 Files Feature
**Structure:** `src/features/files/{file-storage, property-file}/{api, core, data}`
- [ ] **Action:** Migrate `FileStorage` logic to `src/features/files/file-storage/`.
- [ ] **Action:** Migrate `PropertyFile` logic to `src/features/files/property-file/`.
- [ ] **Manual Test:** Verify File Upload/Download.
- [ ] **Update Doc:** Mark 3.5 as complete.

---

## 🏢 Phase 4: Multi-Organization Activation
**Goal:** Enable the "Database-per-Organization" capability.

### 4.1 Master Database Setup
- [ ] **Action:** Create `organizations` table in the default DB.
- [ ] **Action:** Seed initial organization data.
- [ ] **Manual Test:** Check Database for `organizations` table.
- [ ] **Update Doc:** Mark 4.1 as complete.

### 4.2 Middleware & Connection Switching
- [ ] **Action:** Create `OrganizationMiddleware` to extract `X-Organization-ID`.
    *   *Logic:* If `NODE_ENV=dev` and no header, use Default Pool. Else, use Org Pool.
- [ ] **Action:** Integrate with `OrganizationConnectionManager` to attach `req.db`.
- [ ] **Manual Test:** Send request with `X-Organization-ID` header and verify it hits the correct DB.
- [ ] **Update Doc:** Mark 4.2 as complete.

### 4.3 Onboarding Automation
- [ ] **Action:** Create `scripts/onboard-organization.ts`.
- [ ] **Action:** Implement automated DB creation and migration running.
- [ ] **Manual Test:** Run script to create a new Org DB and verify tables exist.
- [ ] **Update Doc:** Mark 4.3 as complete.

---

## 🧹 Phase 5: Cleanup & Legacy Removal
**Goal:** Remove the scaffolding of the old architecture.

### 5.1 Server & DI Cleanup
- [ ] **Action:** Refactor `server.ts` to simply register Feature Routes.
- [ ] **Action:** Delete the massive `DependencyContainer.ts`.
- [ ] **Manual Test:** Run full test suite to ensure no regressions.
- [ ] **Update Doc:** Mark 5.1 as complete.

### 5.2 Delete Old Folders
- [ ] **Action:** Remove top-level `controllers/`, `services/`, `repositories/`.
- [ ] **Manual Test:** Verify clean build and directory structure.
- [ ] **Update Doc:** Mark 5.2 as complete.
