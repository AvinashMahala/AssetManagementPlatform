# 🗺️ Backend Refactoring Roadmap: The "God-Level" Architecture

**Objective:** Transform the backend into a **Scalable, Event-Driven, Multi-Organization (Database-per-Org)** system using **Vertical Slice Architecture**.

## 🧠 Context Handoff (Read This First)
**Current Status (Dec 21, 2025):**
*   **Active Task:** Migrating **Unit** feature (Phase 3.1.2).
*   **Recent Wins:**
    *   **Property** feature is fully migrated and legacy files deleted.
    *   **Lease** feature is migrated to `src/features/leases`, but legacy files (`LeaseController`, `LeaseService`) **still exist** and need deletion.
*   **Critical Note:** `server.ts` currently uses a hybrid approach for Units. `UnitModule` handles `/api/units` (CRUD), but legacy `createUnitRoutes` handles `/api/units/:id/tenants`. This needs to be consolidated before deleting legacy Unit files.

**Context for AI Agents:**
*   **Architecture:** Vertical Slices (Features isolated in `src/features/`).
*   **Data Access:** `BaseRepository` (Generic SQL generation) + `OrganizationConnectionManager` (Dynamic DB Switching).
*   **Multi-Tenancy:** "Database-per-Organization".
    *   **Dev Mode:** Defaults to single local DB if no `X-Organization-ID` header.
    *   **Prod Mode:** Requires `X-Organization-ID` header to route to specific Org DB.
*   **Events:** `EventBus` decouples core logic from side effects (emails, logs).
*   **Terminology:** "Organization" = SaaS Customer. "Tenant" = Property Renter.

**Protocol for Each Feature Migration (Strangler Fig Pattern):**
1.  **Scaffold & Migrate:** Copilot creates the new Vertical Slice structure (`src/features/...`) and migrates logic.
2.  **Switch:** Copilot updates `server.ts` to point to the new Feature Module, bypassing legacy routes.
3.  **Verify:** User performs Manual Test to confirm the new implementation works.
4.  **Cleanup:** Copilot deletes the specific legacy files (Controller, Service, Repository, Routes) for *that feature only*.
5.  **Final Check:** Copilot runs `npm run build` to ensure no dangling dependencies.
6.  **Update Doc:** Copilot marks the feature as complete in this roadmap.

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
- [x] **Cleanup:** Delete legacy `LeaseController`, `LeaseService`, `leaseRoutes`. (Note: `LeaseRepository` kept for dependencies).
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

#### 3.1.1 Property (Completed)
- [x] **Action:** Migrate `Property` logic to `src/features/properties/property/`.
- [x] **Action:** Decouple Property Dependencies (File & Receipt Template Controllers).
- [x] **Cleanup:** Delete legacy `PropertyController`, `PropertyService`, `propertyRoutes`.
- [x] **Verification:** Build passed.

#### 3.1.2 Unit
- [x] **Action:** Migrate `Unit` logic to `src/features/properties/unit/`.
- [x] **Switch:** Update `server.ts` to use `UnitModule` exclusively (remove legacy `createUnitRoutes`).
- [x] **Manual Test:** Verify Unit CRUD endpoints.
- [x] **Cleanup:** Delete legacy `UnitController`, `UnitService`, `unitRoutes`.
- [x] **Verification:** Run `npm run build`.

#### 3.1.3 Meter
- [x] **Action:** Migrate `Meter` logic to `src/features/properties/meter/`.
- [x] **Switch:** Update `server.ts` to use `MeterModule`.
- [ ] **Manual Test:** Verify Meter CRUD endpoints.
- [ ] **Cleanup:** Delete legacy `MeterController`, `MeterService`, `meterRoutes`.
- [ ] **Verification:** Run `npm run build`.

### 3.2 Tenants Feature
**Structure:** `src/features/tenants/{tenant, unit-tenant}/{api, core, data}`

#### 3.2.1 Tenant
- [x] **Action:** Migrate `Tenant` logic to `src/features/tenants/tenant/`.
- [x] **Switch:** Update `server.ts` to use `TenantModule`.
- [x] **Manual Test:** Verify Tenant CRUD endpoints.
- [x] **Cleanup:** Delete legacy `TenantController`, `TenantService`, `tenantRoutes`. (Note: `TenantRepository` kept for dependencies).
- [x] **Verification:** Run `npm run build`.

#### 3.2.2 UnitTenant (Lease Association)
- [x] **Action:** Migrate `UnitTenant` logic to `src/features/tenants/unit-tenant/`.
- [x] **Switch:** Update `server.ts` to use `UnitTenantModule`.
- [x] **Manual Test:** Verify Unit-Tenant association flows.
- [x] **Cleanup:** Delete legacy `UnitTenantController`, `UnitTenantService`, `unitTenantRoutes`.
- [x] **Verification:** Run `npm run build`.

### 3.3 Finance Feature
**Structure:** `src/features/finance/{expense, rent-payment, rent-transaction}/{api, core, data}`

#### 3.3.1 Expense
- [x] **Action:** Migrate `Expense` logic to `src/features/finance/expense/`.
- [x] **Switch:** Update `server.ts` to use `ExpenseModule`.
- [x] **Manual Test:** Verify Expense CRUD (Fixed runtime bug with `affectedUnitIds`).
- [x] **Cleanup:** Delete legacy `ExpenseController`, `ExpenseService`, `expenseRoutes`.
- [x] **Verification:** Run `npm run build`.

#### 3.3.2 RentPayment
- [x] **Action:** Migrate `RentPayment` logic to `src/features/finance/rent-payment/`.
- [x] **Switch:** Update `server.ts` to use `RentPaymentModule`.
- [x] **Manual Test:** Verify Payment recording.
- [x] **Cleanup:** Delete legacy `RentPaymentController`, `rentPaymentRoutes`. (`RentPaymentService` kept for `ReceiptService` dependency).
- [x] **Verification:** Run `npm run build`.

#### 3.3.3 RentTransaction
- [x] **Action:** Migrate `RentTransaction` logic to `src/features/finance/rent-transaction/`.
- [x] **Switch:** Update `server.ts` to use `RentTransactionModule`.
- [x] **Manual Test:** Verify Transaction logs.
- [x] **Cleanup:** Delete legacy `RentTransactionController`, `rentTransactionRoutes`. (`RentTransactionService` kept for dependencies).
- [x] **Verification:** Run `npm run build`.

### 3.4 Auth Feature
**Structure:** `src/features/auth/{auth, user, role}/{api, core, data}`

#### 3.4.1 Auth & User
- [x] **Action:** Migrate `Auth` (Login/Register) logic to `src/features/auth/auth/`.
- [x] **Action:** Migrate `User` logic to `src/features/auth/user/`.
- [x] **Switch:** Update `server.ts` to use `AuthModule` and `UserModule`.
- [x] **Manual Test:** Verify Login/Register flows.
- [x] **Cleanup:** Delete legacy `UserController`, `authRoutes`, `userRoutes`. (`UserService` kept for dependencies).
- [x] **Verification:** Run `npm run build`.

### 3.5 Files Feature
**Structure:** `src/features/files/{file-storage, property-file}/{api, core, data}`

#### 3.5.1 File Storage
- [x] **Action:** Migrate `FileStorage` logic to `src/features/files/file-storage/`.
- [x] **Switch:** Update `server.ts` to use `FileModule`.
- [x] **Manual Test:** Verify File Upload/Download.
- [x] **Cleanup:** Delete legacy `FileController`, `FileStorageService`, `fileRoutes`.
- [x] **Verification:** Run `npm run build`.

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

## 🏁 Phase 5: Final Polish
**Goal:** Final system-wide cleanup and verification.

### 5.1 Server & DI Cleanup
- [ ] **Action:** Refactor `server.ts` to simply register Feature Routes.
- [ ] **Action:** Delete the massive `DependencyContainer.ts`.
- [ ] **Manual Test:** Run full test suite to ensure no regressions.
- [ ] **Update Doc:** Mark 5.1 as complete.

### 5.2 Final Verification
- [ ] **Action:** Verify no legacy folders (`controllers/`, `services/`, `repositories/`) exist.
- [ ] **Manual Test:** Run `npm run build` and `npm test`.
- [ ] **Update Doc:** Mark 5.2 as complete.
