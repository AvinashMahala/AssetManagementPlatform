# Units feature — audit & duplicate detection blueprint

Purpose: Implement data audit for Unit create/update and DB-backed duplicate detection similar to the properties blueprint.

---

## TL;DR
- Add `DataAuditResult` / `DataAuditIssue` models and `UnitAuditHelper` to compare client payload vs persisted entity and return an audit envelope when `?audit=true` is requested.
- Duplicate detection for create/update based on normalized key: PropertyId + UnitNumber + Floor + UnitType + Name.
- Add repository method `FindByNormalizedKeyAsync` and a DB script to detect duplicates and create a unique index concurrently.
- Update `UnitService` (`CreateWithAuditAsync` / `UpdateWithAuditAsync`) to enforce duplicates and return `DataAuditResult` when requested.
- Update `UnitsController` to support `?audit=true` and return `201 Created` with `dataAudit` envelope or `409 Conflict` on duplicates with details.
- Frontend: added an **admin-only** "Run data audit" checkbox in Unit Create/Edit forms; when selected the UI appends `?audit=true`. On `dataAudit.success === false` the UI opens the `AdminAuditModal` with issue list and a View Record action.

---

## Files changed / added
- `src/MyApp.Models/UnitDataAudit.cs` — add audit models
- `src/MyApp.Shared/Exceptions/DuplicateUnitException.cs` — new exception
- `src/MyApp.Repositories/UnitRepository.cs` — add `FindByNormalizedKeyAsync`
- `src/MyApp.Services/Helpers/UnitAuditHelper.cs` — compare fields and produce `DataAuditResult`
- `src/MyApp.Services/UnitService.cs` — add `CreateWithAuditAsync` / `UpdateWithAuditAsync` with duplicate checks
- `src/MyApp.Api/Controllers/UnitsController.cs` — support `?audit=true` and map `DuplicateUnitException` to 409
- `db-postgres/sql-scripts/006_units_dedupe_and_unique_index.sql` — duplicate detection + index script
- `src/MyApp.Tests.Unit/UnitServiceTests.cs` — added tests for duplicate detection and audit defaulting behavior
- Frontend UI: `src/features/units/components/forms/UnitFormTabbed.tsx` (admin-only audit checkbox), `src/features/units/pages/Create/UnitCreatePage.tsx` and `src/features/units/pages/Edit/UnitEditPage.tsx` (open `AdminAuditModal` on audit failure), and `src/features/common/components/AdminAuditModal/AdminAuditModal.tsx`.

---

## How to test manually
1. Run `dotnet test` to run unit tests (includes `UnitServiceTests`).
2. Start the API and POST to `/api/v1/units?audit=true` with a payload missing `status` and observe `dataAudit` indicates `status` defaulted.
3. Try to create two units with same normalized key (same propId, unitNumber, floor, unitType, and name) and expect `409 Conflict` with `{ code: 'DUPLICATE_UNIT', details: { existingId, ... } }`.
4. Run the SQL SELECT in `006_units_dedupe_and_unique_index.sql` to find existing duplicates before creating DB index.

---

## Frontend & UX testing (manual + E2E)
1. As an **admin**, open the Unit Create or Edit form and verify a "Run data audit" checkbox is visible in the footer (and header toggle if applicable).
2. Check the box and submit the form; the client will call the API with `?audit=true`.
3. If the API responds with `dataAudit` and `success === false`, verify the `AdminAuditModal` opens showing `dataAudit.issues` (field, requested, stored, reason), and that the "View record" action navigates to the unit edit page for review.
4. If `dataAudit.success === true`, verify a success notification is shown and the modal does not open.
5. If the form is submitted without the audit checkbox, verify the API does not include a `dataAudit` object in the response and the user flows behave as before.
6. Add an E2E test that:
   - Logs in as an admin, opens the Create Unit form, checks the audit checkbox, posts a payload that triggers defaulting/truncation mismatches, and asserts the modal opens with the expected issue list and View action.
7. Add tests that assert Duplicate unit returns `409` and the UI surfaces an inline error instead of opening the modal.

---

## Follow-ups
- Add an integration test for controller-level audit and conflict responses.
- Add a migration/runbook to create the unique DB index after duplicates cleaned.
- Update OpenAPI docs to document the `dataAudit` envelope and `409` response shape.
