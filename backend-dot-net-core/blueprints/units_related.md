# Units feature — audit & duplicate detection blueprint

Purpose: Implement data audit for Unit create/update and DB-backed duplicate detection similar to the properties blueprint.

---

## TL;DR
- Add `DataAuditResult` / `DataAuditIssue` models and `UnitAuditHelper` to compare client payload vs persisted entity and return an audit envelope when `?audit=true` is requested.
- Duplicate detection for create/update based on normalized key: PropertyId + UnitNumber + Floor + UnitType + Name.
- Add repository method `FindByNormalizedKeyAsync` and a DB script to detect duplicates and create a unique index concurrently.
- Update `UnitService` (`CreateWithAuditAsync` / `UpdateWithAuditAsync`) to enforce duplicates and return `DataAuditResult` when requested.
- Update `UnitsController` to support `?audit=true` and return `201 Created` with `dataAudit` envelope or `409 Conflict` on duplicates with details.

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

---

## How to test manually
1. Run `dotnet test` to run unit tests (includes `UnitServiceTests`).
2. Start the API and POST to `/api/v1/units?audit=true` with a payload missing `status` and observe `dataAudit` indicates `status` defaulted.
3. Try to create two units with same normalized key (same propId, unitNumber, floor, unitType, and name) and expect `409 Conflict` with `{ code: 'DUPLICATE_UNIT', details: { existingId, ... } }`.
4. Run the SQL SELECT in `006_units_dedupe_and_unique_index.sql` to find existing duplicates before creating DB index.

---

## Follow-ups
- Add an integration test for controller-level audit and conflict responses.
- Add a migration/runbook to create the unique DB index after duplicates cleaned.
- Update OpenAPI docs to document the `dataAudit` envelope and `409` response shape.
