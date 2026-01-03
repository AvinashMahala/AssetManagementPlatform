# Express → ASP.NET Core Migration Mapping

**Summary**
- The existing `backend/` repo already follows a feature-based layered structure (api → core → data/infrastructure) with `*.routes.ts` factories, controllers (in `api/`), services/use-cases (in `core/`), and repositories (in `data/`). This makes translation to Clean Architecture in .NET straightforward: Controllers → Api project, Services/Use-cases → Services project, Repositories/Db access → Repositories project, Models/DTOs → Models project, and interfaces in an Interfaces project.

---

## Per-feature mapping (high-level)

Note: file references are relative to `backend/`.

1) Auth & User
- Routes / wiring:
  - `src/features/auth/auth/auth.module.ts` (routes: POST /register, POST /login, POST /refresh-token, GET/PUT /profile)
- Controllers:
  - `src/features/auth/auth/api/AuthController.ts`
  - `src/features/auth/user/api/*`
- Services:
  - `src/features/auth/auth/core/AuthService.ts`
  - `src/features/auth/user/core/UserService.ts`
- Repositories:
  - `src/features/auth/user/data/UserRepository.ts`
- Notes: OAuth / Google Identity integration exists; JWT refresh token flows are present.

2) Properties & Units
- Routes:
  - `src/features/properties/property/api/property.routes.ts` (GET /properties, GET /properties/:id, POST, PUT, DELETE, PATCH /:id/status, /:id/template, files sub-router)
  - `src/features/properties/unit/api/unit.routes.ts`
- Controllers: `PropertyController.ts`, `PropertyFileController.ts`, `PropertyReceiptTemplateController.ts`, `UnitController`, etc.
- Services / Use-cases: `core/use-cases/*` and `core/services/*` under property and unit features
- Repos: `src/features/properties/property/data/repository/*.ts`
- Notes: File and template concerns are delegated via injected controllers; multer-based file uploads.

3) Leases
- Routes: `src/features/leases/api/lease.routes.ts` (POST /, GET /, GET /:id, PUT /:id, POST /:id/terminate)
- Controller: `src/features/leases/api/LeaseController.ts`
- Repo: `src/features/leases/data/LeaseRepository.ts`

4) Tenants
- Routes: `src/features/tenants/tenant/api/tenant.routes.ts` (CRUD: POST /, GET /, GET /:id, PUT /:id, DELETE /:id)
- Controller: `TenantController.ts`

5) Finance (Rent Payment, Transactions, Receipts, Templates, Expense)
- Receipts: `src/features/finance/receipt/api/receipt.routes.ts` (listing, generate, download, send-email, property/tenant filters)
- Rent-payments & transactions: dedicated modules (see `src/features/finance/*/*.module.ts`); important transactional flows using EventBus
- Repos: `src/features/finance/*/data/*Repository.ts`

6) Files (File storage)
- Routes: `src/features/files/file-storage/api/file-storage.routes.ts` (GET /, POST /upload, GET /:fileId/download, GET /:fileId/metadata, DELETE /:fileId)
- Controller/Service: `FileStorageController`, `FileStorageService`
- Notes: Uses in-memory multer uploader and external storage adapter(s); DB config for files uses `filesPool` (separate DB/source)

7) Meters & Meter Readings
- Routes: `src/features/properties/meter/presentation/routes/*.ts` (standard CRUD and readings)

8) Admin / Bulk Operations
- Routes: `src/features/admin/bulk-operations/api/bulk-operations.routes.ts`
- This handles bulk generation of payments, receipts, communications.

---

## How to map to .NET Clean Architecture (concrete recommendations)
- Api project: implement controllers corresponding to `*.routes.ts` router factories and controllers. Keep controllers thin, call Services via interfaces.
- Models project: DTOs and domain models; use DTOs for API contracts and ViewModels.
- Interfaces project: repository and service interfaces (e.g., `ILeaseRepository`, `ILeaseService`).
- Services project: business logic, maps to `core`/use-case classes. Write unit tests here.
- Repositories project: implement EF Core `DbContext`, entity configuration, repository implementations using `DbContext` (or Dapper if queries are complex). Include multi-tenant strategies (see below).

---

## Prioritization (recommended minimal cut for production parity)
1. **Auth & User** (login, register, profile, refresh token) — required for protected flows
2. **Leases** (create/list/get/update/terminate) — core domain
3. **Rent Payments & Rent Transactions** (create, list, reconcile) — financial flows and event hooks
4. **Properties & Units** (CRUD, templates, files) — essential domain data
5. **Tenants** (CRUD, listing) — used by many flows
6. **Receipts & Receipt Templates** (generate, download, send) — user-facing and reporting
7. **Files** (upload/download/metadata) — attachments & invoices
8. **Meters & Meter Readings** — operational data
9. **Bulk Operations & Admin** — lower priority but important for migrations and batch processes

---

## Complexity & Risk areas (must plan carefully)
- Multi-tenant DB: `createMultiTenantPool()` and mainPool/filesPool usage — design EF multi-tenancy strategy (one DB per tenant vs. tenantId column + filters).
- Manual DI/composition root: `server.ts` performs manual wiring; replicate with `IServiceCollection` and extension methods in .NET.
- EventBus and background flows: `EventBus` usage across services must be ported or replaced (e.g., MediatR or custom event pub/sub).
- External integrations: Google Identity, Email provider, S3/MinIO file storage, payment processors — migrate adapters and secrets carefully.
- Raw SQL queries: Some repositories likely use hand-written SQL; consider EF Core or Dapper.
- Tests: keep/convert unit tests and postman collections; use integration tests for DB migrations.

---

## Suggested next steps (I can do any of these)
1. Generate a machine-readable endpoint inventory (CSV/JSON) extracted from `*.routes.ts` files to drive tests and swagger parity checks. ✅
2. Scaffold .NET controllers + DTOs for the top 2-3 prioritized features (Auth, Leases, RentPayments) as a reference implementation. ✅
3. Propose a multi-tenant EF Core strategy and scaffold `AppDbContext` with tenant-aware options.

---

If you want, I can now generate an endpoint inventory (CSV + a human-readable table) and/or scaffold the .NET controllers for the top-priority features (Auth → Leases → RentPayments). Which would you like next? (pick: `inventory`, `scaffold:auth`, `scaffold:leases`, `scaffold:rent-payments`, or `all`).
