# Swagger/OpenAPI Migration & Tracking

This document tracks migration of inline controller Swagger/JSDoc blocks into per-operation files under `src/shared/config/swagger/apis/*/paths/` and the overall plan to keep docs in sync with code.

## Purpose
- Provide a single source-of-truth for migration progress so someone can resume work from another environment or chat session.
- Capture the migration checklist, commands, validation steps, and how to resume.

---

## Status at a glance
- Migration pattern: **one file per operation (path + verb)** stored at `src/shared/config/swagger/apis/<feature>/paths/<path>.<verb>.ts`.
- Validator & CI: `backend/scripts/validate-endpoints.cjs` (heuristic) and script `npm --prefix backend run check-docs` for CI.

| Feature | Status | Notes |
|---|---:|---|
| Properties (property controller, files, templates, UPI) | ✅ Done | Per-op files created under `properties/paths/` and controllers updated to remove inline docs.
| Files (global file-storage) | ⚠️ Partial | Some docs added; verify file-storage route files.
| Receipts & Receipt Template | ⚠️ Partial | Many routes documented but audit recommended.
| Units | ⚠️ Not started | Pending migration
| Tenants | ⚠️ Not started | Pending migration
| Leases | ⚠️ Not started | Pending migration
| Payments / Rent Transactions | ⚠️ Not started | Pending migration

> Note: Status meanings — ✅ Done (migrated + validated), ⚠️ Partial (some files moved; needs verification), ⚠️ Not started.

---

## Migration checklist (per feature)
Follow these steps when migrating a feature (example: `features/xyz`):

1. Run a quick audit to list controller & route files:
   - grep for `@swagger` / `@openapi` in `src/features/xyz/**` to find inline docs.
2. Create folder: `src/shared/config/swagger/apis/xyz/paths/` (if not present).
3. For each documented operation in the controller, create a per-op file following naming convention:
   - `index.get.ts`, `index.post.ts` for `/xyz`
   - `id.get.ts`, `id.put.ts`, `id.delete.ts` for `/xyz/{id}`
   - `nested.fileId.download.get.ts` for complex paths
4. Copy the JSDoc block to the new file and ensure it has `@openapi` at the top and correct YAML indentation.
5. Remove the inline JSDoc block or replace with a single-line note pointing at the new file.
6. Run `npm --prefix backend run generate-swagger` and `npm --prefix backend run validate-swagger` to regenerate and validate `public/openapi.json`.
7. Run `npm --prefix backend run validate-endpoints` (or `npm --prefix backend run check-docs`) and fix any mismatches.
8. Perform a manual spot-check in Swagger UI (`/api-docs`) to ensure operations appear under the correct tag and in alphabetical order.
9. Commit changes (one logical commit per feature). Update this migration doc with the feature status.

---

## How to resume (quick start)
If you return to this task later, do the following:

1. Pull the repo and ensure dependencies installed in `backend`:
   ```bash
   cd backend
   npm install
   ```
2. Regenerate the spec so validator and files are current:
   ```bash
   npm run generate-swagger
   npm run validate-swagger
   ```
3. Run the endpoint validator to detect discrepancies:
   ```bash
   npm run validate-endpoints
   # or run the combined command
   npm run check-docs
   ```
4. Choose a feature with `⚠️` status from the table above and follow the migration checklist.
5. After migration, update the `Status at a glance` table above and push changes.

---

## Commands reference
- `npm --prefix backend run dev:with-swagger` — run dev server and auto-regenerate swagger on changes.
- `npm --prefix backend run generate-swagger` — generate `public/openapi.json`.
- `npm --prefix backend run validate-swagger` — validate generated spec with swagger-cli.
- `npm --prefix backend run validate-endpoints` — heuristic compare of routes vs docs.
- `npm --prefix backend run check-docs` — generate + validate + endpoint check (CI-friendly).

---

## Troubleshooting tips
- If generation fails with YAML duplicate key errors, search for duplicate path+verb across the `paths/` files or leftover inline JSDoc.
- If `validate-endpoints` reports a mismatch but your app uses dynamic route registration, consider skipping that feature in the validator or implementing the runtime inspection approach (see below).

### Advanced: runtime inspection approach (future improvement)
- Export a `createApp()` factory from `server.ts` that constructs and returns an Express `app` without starting the listener.
- In a Node script, import that factory and call `app._router.stack` to inspect registered routes at runtime. This produces exact route counts and avoids false positives from the static grep heuristic.

---

If you want, I can:
- Add a per-feature checklist and pre-fill it with file lists (I can auto-generate by scanning controllers), or
- Create a GitHub issue template for each feature migration with the steps and links to files.

Tell me which you'd like me to do next and I will proceed. 
 
---

## Auto-generated per-feature checklist (pre-filled)

The checklist below was generated automatically by scanning controller files for `@swagger` JSDoc blocks. It lists discovered paths and suggested per-operation filenames (one file per path+verb). Checkboxes are left un-checked for items that still need migration.

> **Note:** This is a best-effort scan — please review each operation and adjust the target filename if you prefer a different grouping.


---

## Auto-generated per-feature checklist (pre-filled)

The checklist below was generated automatically by scanning controller files for `@swagger` JSDoc blocks. It lists discovered paths and suggested per-operation filenames (one file per path+verb). Checkboxes are left un-checked for items that still need migration.

> **Note:** This is a best-effort scan — please review each operation and adjust the target filename if you prefer a different grouping.

### Auto-generated per-feature checklist (generated)

The following checklist was generated by scanning controller files for `@swagger` blocks. Each operation lists suggested per-op filenames (follow the project naming convention).

#### Feature: **admin**

- **Controller:** `/features/admin/bulk-operations/api/BulkOperationsController.ts`
   - Path: `/bulk/rent-collection` — Verbs: post
      - Suggested files:
         - [ ] `paths/bulk.rent-collection.post.ts`
   - Path: `/bulk/payments` — Verbs: post
      - Suggested files:
         - [ ] `paths/bulk.payments.post.ts`
   - Path: `/bulk/receipts` — Verbs: post
      - Suggested files:
         - [ ] `paths/bulk.receipts.post.ts`
   - Path: `/bulk/communication` — Verbs: post
      - Suggested files:
         - [ ] `paths/bulk.communication.post.ts`
   - Path: `/api/bulk/export` — Verbs: post
      - Suggested files:
         - [ ] `paths/api.bulk.export.post.ts`
   - Path: `/api/bulk/validate-receipts` — Verbs: get
      - Suggested files:
         - [ ] `paths/api.bulk.validate-receipts.get.ts`

#### Feature: **auth**

- **Controller:** `/features/auth/auth/api/AuthController.ts`
   - Path: `/auth/register` — Verbs: post
      - Suggested files:
         - [ ] `paths/auth.register.post.ts`
   - Path: `/auth/login` — Verbs: post
      - Suggested files:
         - [ ] `paths/auth.login.post.ts`
   - Path: `/auth/refresh-token` — Verbs: post
      - Suggested files:
         - [ ] `paths/auth.refresh-token.post.ts`
- **Controller:** `/features/auth/user/api/UserController.ts`
   - Path: `/users` — Verbs: get
      - Suggested files:
         - [ ] `paths/users.get.ts`
   - Path: `/users/{id}` — Verbs: get
      - Suggested files:
         - [ ] `paths/users.id.get.ts`
   - Path: `/users` — Verbs: post
      - Suggested files:
         - [ ] `paths/users.post.ts`
   - Path: `/users/{id}` — Verbs: put
      - Suggested files:
         - [ ] `paths/users.id.put.ts`
   - Path: `/users/{id}` — Verbs: delete
      - Suggested files:
         - [ ] `paths/users.id.delete.ts`

#### Feature: **files**

- **Controller:** `/features/files/file-storage/api/FileStorageController.ts`
   - Path: `/files/upload` — Verbs: post
      - Suggested files:
         - [ ] `paths/files.upload.post.ts`
   - Path: `/files/{fileId}/download` — Verbs: get
      - Suggested files:
         - [ ] `paths/files.fileId.download.get.ts`

#### Feature: **finance**

- **Controller:** `/features/finance/expense/api/ExpenseController.ts`
   - Path: `/expenses` — Verbs: post
      - Suggested files:
         - [ ] `paths/expenses.post.ts`
   - Path: `/expenses/{id}` — Verbs: put
      - Suggested files:
         - [ ] `paths/expenses.id.put.ts`
   - Path: `/expenses/{id}` — Verbs: delete
      - Suggested files:
         - [ ] `paths/expenses.id.delete.ts`
   - Path: `/expenses/{id}` — Verbs: get
      - Suggested files:
         - [ ] `paths/expenses.id.get.ts`
   - Path: `/expenses` — Verbs: get
      - Suggested files:
         - [ ] `paths/expenses.get.ts`
   - Path: `/expenses/property/{propertyId}` — Verbs: get
      - Suggested files:
         - [ ] `paths/expenses.property.propertyId.get.ts`
   - Path: `/expenses/unit/{unitId}` — Verbs: get
      - Suggested files:
         - [ ] `paths/expenses.unit.unitId.get.ts`
- **Controller:** `/features/finance/receipt/api/ReceiptController.ts`
   - Path: `/receipts` — Verbs: get
      - Suggested files:
         - [ ] `paths/receipts.get.ts`
   - Path: `/receipts/{id}` — Verbs: get
      - Suggested files:
         - [ ] `paths/receipts.id.get.ts`
   - Path: `/receipts/number/{receiptNumber}` — Verbs: get
      - Suggested files:
         - [ ] `paths/receipts.number.receiptNumber.get.ts`
   - Path: `/receipts/property/{propertyId}` — Verbs: get
      - Suggested files:
         - [ ] `paths/receipts.property.propertyId.get.ts`
- **Controller:** `/features/finance/receipt-template/api/ReceiptTemplateController.ts`
   - Path: `/api/receipt-templates` — Verbs: get
      - Suggested files:
         - [ ] `paths/api.receipt-templates.get.ts`
   - Path: `/api/receipt-templates/{id}` — Verbs: get
      - Suggested files:
         - [ ] `paths/api.receipt-templates.id.get.ts`
   - Path: `/api/receipt-templates/type/{type}` — Verbs: get
      - Suggested files:
         - [ ] `paths/api.receipt-templates.type.type.get.ts`
   - Path: `/api/receipt-templates` — Verbs: post
      - Suggested files:
         - [ ] `paths/api.receipt-templates.post.ts`
   - Path: `/api/receipt-templates/{id}` — Verbs: put
      - Suggested files:
         - [ ] `paths/api.receipt-templates.id.put.ts`
   - Path: `/api/receipt-templates/{id}` — Verbs: delete
      - Suggested files:
         - [ ] `paths/api.receipt-templates.id.delete.ts`
   - Path: `/api/receipt-templates/default` — Verbs: get
      - Suggested files:
         - [ ] `paths/api.receipt-templates.default.get.ts`
   - Path: `/api/receipt-templates/{id}/default` — Verbs: put
      - Suggested files:
         - [ ] `paths/api.receipt-templates.id.default.put.ts`
   - Path: `/api/receipt-templates/available` — Verbs: get
      - Suggested files:
         - [ ] `paths/api.receipt-templates.available.get.ts`
   - Path: `/api/properties/{propertyId}/template` — Verbs: get
      - Suggested files:
         - [ ] `paths/api.properties.propertyId.template.get.ts`
   - Path: `/api/properties/{propertyId}/template` — Verbs: put
      - Suggested files:
         - [ ] `paths/api.properties.propertyId.template.put.ts`
- **Controller:** `/features/finance/receipt-template/api/TemplateController.ts`
   - Path: `/templates` — Verbs: get
      - Suggested files:
         - [ ] `paths/templates.get.ts`
   - Path: `/templates/{id}` — Verbs: get
      - Suggested files:
         - [ ] `paths/templates.id.get.ts`
   - Path: `/templates/property/{propertyId}/settings` — Verbs: get
      - Suggested files:
         - [ ] `paths/templates.property.propertyId.settings.get.ts`
   - Path: `/templates/property/{propertyId}/settings` — Verbs: put
      - Suggested files:
         - [ ] `paths/templates.property.propertyId.settings.put.ts`
   - Path: `/templates/placeholders` — Verbs: get
      - Suggested files:
         - [ ] `paths/templates.placeholders.get.ts`
   - Path: `/templates/{id}/preview` — Verbs: post
      - Suggested files:
         - [ ] `paths/templates.id.preview.post.ts`
- **Controller:** `/features/finance/rent-payment/api/RentPaymentController.ts`
   - Path: `/rent-payments` — Verbs: get
      - Suggested files:
         - [ ] `paths/rent-payments.get.ts`
   - Path: `/rent-payments/{id}` — Verbs: get
      - Suggested files:
         - [ ] `paths/rent-payments.id.get.ts`
   - Path: `/rent-payments/lease/{leaseId}` — Verbs: get
      - Suggested files:
         - [ ] `paths/rent-payments.lease.leaseId.get.ts`
   - Path: `/rent-payments/property/{propertyId}` — Verbs: get
      - Suggested files:
         - [ ] `paths/rent-payments.property.propertyId.get.ts`
   - Path: `/rent-payments/tenant/{tenantId}` — Verbs: get
      - Suggested files:
         - [ ] `paths/rent-payments.tenant.tenantId.get.ts`
   - Path: `/rent-payments` — Verbs: post
      - Suggested files:
         - [ ] `paths/rent-payments.post.ts`
   - Path: `/rent-payments/{id}` — Verbs: put
      - Suggested files:
         - [ ] `paths/rent-payments.id.put.ts`
   - Path: `/rent-payments/{id}` — Verbs: delete
      - Suggested files:
         - [ ] `paths/rent-payments.id.delete.ts`
- **Controller:** `/features/finance/rent-transaction/api/RentTransactionController.ts`
   - Path: `/rent-transactions` — Verbs: get
      - Suggested files:
         - [ ] `paths/rent-transactions.get.ts`
   - Path: `/rent-transactions/{id}` — Verbs: get
      - Suggested files:
         - [ ] `paths/rent-transactions.id.get.ts`
   - Path: `/rent-transactions/lease/{leaseId}` — Verbs: get
      - Suggested files:
         - [ ] `paths/rent-transactions.lease.leaseId.get.ts`
   - Path: `/rent-transactions/property/{propertyId}` — Verbs: get
      - Suggested files:
         - [ ] `paths/rent-transactions.property.propertyId.get.ts`
   - Path: `/rent-transactions/tenant/{tenantId}` — Verbs: get
      - Suggested files:
         - [ ] `paths/rent-transactions.tenant.tenantId.get.ts`
   - Path: `/rent-transactions/unit/{unitId}` — Verbs: get
      - Suggested files:
         - [ ] `paths/rent-transactions.unit.unitId.get.ts`
   - Path: `/rent-transactions` — Verbs: post
      - Suggested files:
         - [ ] `paths/rent-transactions.post.ts`
   - Path: `/rent-transactions/{id}` — Verbs: put
      - Suggested files:
         - [ ] `paths/rent-transactions.id.put.ts`
   - Path: `/rent-transactions/{id}` — Verbs: delete
      - Suggested files:
         - [ ] `paths/rent-transactions.id.delete.ts`

#### Feature: **leases**

- **Controller:** `/features/leases/api/LeaseController.ts`
   - Path: `/leases` — Verbs: post
      - Suggested files:
         - [ ] `paths/leases.post.ts`
   - Path: `/leases/{id}` — Verbs: put
      - Suggested files:
         - [ ] `paths/leases.id.put.ts`
   - Path: `/leases/{id}/terminate` — Verbs: post
      - Suggested files:
         - [ ] `paths/leases.id.terminate.post.ts`
   - Path: `/leases/{id}` — Verbs: get
      - Suggested files:
         - [ ] `paths/leases.id.get.ts`
   - Path: `/leases` — Verbs: get
      - Suggested files:
         - [ ] `paths/leases.get.ts`

#### Feature: **properties**

- **Controller:** `/features/properties/unit/api/UnitController.ts`
   - Path: `/units` — Verbs: get
      - Suggested files:
         - [ ] `paths/units.get.ts`
   - Path: `/units/{id}` — Verbs: get
      - Suggested files:
         - [ ] `paths/units.id.get.ts`
   - Path: `/units` — Verbs: post
      - Suggested files:
         - [ ] `paths/units.post.ts`
   - Path: `/units/{id}` — Verbs: put
      - Suggested files:
         - [ ] `paths/units.id.put.ts`
   - Path: `/units/{id}` — Verbs: delete
      - Suggested files:
         - [ ] `paths/units.id.delete.ts`
   - Path: `/units/{id}/status` — Verbs: patch
      - Suggested files:
         - [ ] `paths/units.id.status.patch.ts`
   - Path: `/units/{id}/analytics` — Verbs: get
      - Suggested files:
         - [ ] `paths/units.id.analytics.get.ts`
- **Controller:** `/features/properties/unit-utility/api/UnitUtilityController.ts`
   - Path: `/api/unit-utilities` — Verbs: get
      - Suggested files:
         - [ ] `paths/api.unit-utilities.get.ts`
   - Path: `/api/unit-utilities/{id}` — Verbs: get
      - Suggested files:
         - [ ] `paths/api.unit-utilities.id.get.ts`
   - Path: `/api/unit-utilities` — Verbs: post
      - Suggested files:
         - [ ] `paths/api.unit-utilities.post.ts`
   - Path: `/api/unit-utilities/{id}` — Verbs: put
      - Suggested files:
         - [ ] `paths/api.unit-utilities.id.put.ts`
   - Path: `/api/unit-utilities/{id}` — Verbs: delete
      - Suggested files:
         - [ ] `paths/api.unit-utilities.id.delete.ts`
   - Path: `/api/unit-utilities/{id}/toggle` — Verbs: patch
      - Suggested files:
         - [ ] `paths/api.unit-utilities.id.toggle.patch.ts`
   - Path: `/api/unit-utilities/{unitId}/charges` — Verbs: get
      - Suggested files:
         - [ ] `paths/api.unit-utilities.unitId.charges.get.ts`
   - Path: `/api/unit-utilities/{unitId}/summary` — Verbs: get
      - Suggested files:
         - [ ] `paths/api.unit-utilities.unitId.summary.get.ts`
   - Path: `/api/unit-utilities/{unitId}/validate` — Verbs: get
      - Suggested files:
         - [ ] `paths/api.unit-utilities.unitId.validate.get.ts`

#### Feature: **tenants**

- **Controller:** `/features/tenants/tenant/api/TenantController.ts`
   - Path: `/tenants` — Verbs: post
      - Suggested files:
         - [ ] `paths/tenants.post.ts`
   - Path: `/tenants/{id}` — Verbs: put
      - Suggested files:
         - [ ] `paths/tenants.id.put.ts`
   - Path: `/tenants/{id}` — Verbs: get
      - Suggested files:
         - [ ] `paths/tenants.id.get.ts`
   - Path: `/tenants` — Verbs: get
      - Suggested files:
         - [ ] `paths/tenants.get.ts`
   - Path: `/tenants/{id}` — Verbs: delete
      - Suggested files:
         - [ ] `paths/tenants.id.delete.ts`
- **Controller:** `/features/tenants/unit-tenant/api/UnitTenantController.ts`
   - Path: `/units/{id}/tenants` — Verbs: get
      - Suggested files:
         - [ ] `paths/units.id.tenants.get.ts`
   - Path: `/unit-tenants` — Verbs: get
      - Suggested files:
         - [ ] `paths/unit-tenants.get.ts`
   - Path: `/unit-tenants/{id}` — Verbs: get
      - Suggested files:
         - [ ] `paths/unit-tenants.id.get.ts`
   - Path: `/unit-tenants` — Verbs: post
      - Suggested files:
         - [ ] `paths/unit-tenants.post.ts`
   - Path: `/units/{unitId}/tenants/{tenantId}` — Verbs: put
      - Suggested files:
         - [ ] `paths/units.unitId.tenants.tenantId.put.ts`
   - Path: `/units/{unitId}/tenants/{tenantId}` — Verbs: delete
      - Suggested files:
         - [ ] `paths/units.unitId.tenants.tenantId.delete.ts`

