### Step-by-Step Refactoring Plan for Express + TypeScript Backend

This plan is designed for an agent (developer or AI-assisted refactorer) to refactor the codebase in **controlled phases**, ensuring **consistency** with the feature-based layered architecture (api → core → domain → infrastructure + *.routes.ts per subfeature). The goal is a **perfect, scalable structure**: all features self-contained, manual DI decentralized, `server.ts` declarative and short (~100 lines), and no remnant NestJS-style modules.

**Important Agent Instructions**:
- **Do NOT perform any testing** (unit, integration, endpoint, smoke, load, etc.).
- **Do NOT create Git commits, branches, or PRs**. The user will handle all version control manually.
- **Always refer to `backend/src/features-new`** as the single source of truth for:
  - Folder layout (api/, core/, domain/, infrastructure/)
  - File naming conventions
  - Controller pattern (`registerRoutes(router)`)
  - `*.routes.ts` implementation (DI, route mounting)
  - Use-case vs. service usage
  - Error/mapper/validation organization
- When creating or refactoring any feature/subfeature, **copy or mirror** the closest matching example from `backend/src/features-new` exactly.
- Focus only on code movement, restructuring, and implementation. No verification steps are required from the agent.

**Assumptions**:
- Follow the README structure exactly (e.g., nesting for multi-subfeature domains like finance/properties/tenants; flat for singles like auth/files).
- Use manual DI in *.routes.ts (inject shared deps like mainPool, eventBus).
- Test each phase (unit/integration) before proceeding.
- Commit after each phase for rollback.
- Total time estimate: 1-2 days per phase for a medium codebase, depending on complexity.

#### Phase 0: Preparation (Setup & Audit – 1-2 hours)
1. **Backup Codebase**: Create a Git branch (`refactor-to-consistent-architecture`) and commit the current state.
2. **Audit Features**: List all features/subfeatures from `server.ts` imports:
   - Flat: auth, files, leases, admin/bulk-operations.
   - Nested: properties (property, unit, meter, unit-utility), tenants (tenant, unit-tenant), finance (expense, receipt, receipt-template, rent-payment, rent-transaction).
   - Note legacy mixes (e.g., PropertyModule vs. createReceiptRoutes).
3. **Add Shared Deps Interface**: In `shared/types/`, create `SharedDeps` type:
      ```ts
      export interface SharedDeps {
        mainPool: any; // Pool type
        filesPool?: any;
        eventBus: EventBus;
        // Add more globals as needed (e.g., userService if shared)
      }
      ```
4. **Update README**: Add a "Migration Notes" section tracking completed phases.
5. **Setup Testing**: Ensure unit tests run (`npm test`). Add a smoke test for API endpoints.
6. **Clean server.ts Temporarily**: Comment out unrefactored routes to isolate phases.

**Milestone**: Codebase audited; ready for phased migrations. Run tests – all should pass.

#### Phase 1: Refactor Flat/Single Features (auth, files, leases, admin – 4-8 hours)
Focus on simpler, non-nested features first.

For each (e.g., auth):
1. **Create Structure**: If not already, organize into `features/auth/` with api/, core/, domain/, infrastructure/.
2. **Migrate Logic**:
   - Move controllers/DTOs/validations → api/
   - Move services/use-cases/interfaces/types/constants/errors → core/
   - Move models/errors → domain/
   - Move repositories/schemas/queries/mappers → infrastructure/
3. **Create auth.routes.ts**:
   - Instantiate repos/services/use-cases/controllers inside.
   - Implement `registerAuthRoutes(parentRouter: Router, deps: SharedDeps)`:
     - Use deps.mainPool for repos.
     - Controller exposes `registerRoutes(router)`.
   - Mount routes (e.g., parentRouter.use('/auth', router)).
4. **Remove Old Module**: Delete AuthModule if exists; update imports.
5. **Integrate in server.ts**: Replace `v1Router.use('/auth', new AuthModule(...).router)` with `registerAuthRoutes(v1Router, { mainPool, eventBus })`.
6. **Test**: Run unit tests for auth; curl/test endpoints (e.g., /api/auth/login). Fix bugs.

Repeat for files, leases, admin/bulk-operations.

**Milestone**: All flat features refactored. server.ts has 4 new register calls. Tests pass; no regressions.

#### Phase 2: Refactor Properties Domain (Nested – 6-12 hours)
Handle multi-subfeature domains like properties (property, unit, meter, unit-utility).

1. **Organize Nesting**: Ensure `features/properties/` with subfolders (property/, unit/, meter/, unit-utility/).
2. **Refactor Each Subfeature** (e.g., property):
   - Migrate files to layers (as in Phase 1).
   - Create `property.routes.ts`: `registerPropertyRoutes(parentRouter: Router, deps: SharedDeps)`
     - Handle specific DI (e.g., PropertyRepository, GetPropertiesUseCase, PropertyController).
3. **Create Parent Aggregator**: `features/properties/properties.routes.ts`
   - `registerPropertiesRoutes(parentRouter: Router, deps: SharedDeps)`
     - Call registerPropertyRoutes(financeRouter, deps), etc.
     - parentRouter.use('/properties', propertiesRouter).
4. **Remove Old Modules**: Delete PropertyModule, UnitModule, MeterModule.
5. **Integrate in server.ts**: Replace old uses with `registerPropertiesRoutes(v1Router, { mainPool, eventBus })`.
6. **Test**: End-to-end for properties endpoints (e.g., /api/properties, /api/units). Verify shared deps (e.g., fileStorageService if cross-feature).

**Milestone**: Properties domain consistent. server.ts simplified further.

#### Phase 3: Refactor Tenants Domain (Nested – 4-8 hours)
Similar to Phase 2.

1. **Nest**: `features/tenants/tenant/`, `features/tenants/unit-tenant/`.
2. **Subfeature routes.ts**: Create for tenant and unit-tenant.
3. **Parent tenants.routes.ts**: Aggregate subfeatures.
4. **Remove Modules**: TenantModule, UnitTenantModule.
5. **Integrate & Test**: Add to server.ts; test tenant endpoints.

**Milestone**: Tenants consistent.

#### Phase 4: Refactor Finance Domain (Nested – 8-16 hours)
Most complex – expense, receipt, receipt-template, rent-payment, rent-transaction.

1. **Nest**: `features/finance/expense/`, etc.
2. **Refactor Subfeatures**:
   - Migrate to layers.
   - Create *.routes.ts per subfeature (e.g., registerExpenseRoutes).
   - Handle inter-deps (e.g., receiptService uses rentTransactionRepository).
3. **Parent finance.routes.ts**: Aggregate all.
4. **Remove Modules**: ExpenseModule, RentPaymentModule, RentTransactionModule.
5. **Integrate & Test**: Add to server.ts; focus on transaction flows (payments, receipts).

**Milestone**: Finance consistent. All features refactored.

#### Phase 5: Final Cleanup & Optimization (2-4 hours)
1. **Remove Legacy Code**: Delete unused imports/files (e.g., old controllers/services in non-layered paths).
2. **Centralize Shared Services**: If services like userService are used across features, move to `shared/infrastructure/services/` and inject via deps.
3. **Refine server.ts**: Ensure it's declarative – only middleware, health, Swagger, and registerXxxRoutes calls. Remove all top-level DI.
4. **Global Middleware**: Keep auth/organization as-is, but ensure features use them if needed.
5. **Update README**: Add examples of new routes.ts; mark migration complete.
6. **Full Testing**: Run all tests; load test API; check logs for errors.
7. **Performance Check**: Verify no connection leaks (pools).
8. **Merge**: PR review; merge to main.

**Milestone**: Codebase perfect – consistent, clean, scalable. No NestJS remnants.

#### General Guidelines Across Phases
- **Consistency**: Always match README (e.g., file naming: camelCase, explicit mappers).
- **Error Handling**: Use layer-specific errors; central handler in server.ts.
- **Deps Passing**: Use SharedDeps for globals; avoid tight coupling.
- **If Stuck**: Isolate issues – refactor one subfeature at a time.
- **Tools**: Use code_execution tool if needed to test snippets during planning.
- **Perfection Check**: After all, audit: No centralized DI in server.ts; all features have routes.ts; URLs logical (/api/finance/expense).

Follow this phased approach – it minimizes downtime/risk while achieving a flawless refactor. If executing as an agent, report progress per phase.