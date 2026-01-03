# Properties feature blueprint — changes, patterns, and runbook

Purpose: A compact reference describing what we changed for the Property create flow (fields, deduplication, and data-loss reporting) and a reproducible pattern you can copy for other features.

---

## TL;DR ✅
- Expanded the Create/Update DTOs to accept full property fields (address components, amenities, owner arrays, templates, receipt settings).
- Implemented deduplication (normalized key lookup + unique DB index script) + safe race handling (map DB unique violation to 409 conflict).
- Added **data-loss reporting** (audit): the API can return a `dataAudit` object comparing requested vs stored values when `?audit=true` (supported on both Create and Update).
- Edit endpoint (`PUT /api/v1/properties/{id}?audit=true`) now returns an audit envelope when requested.
- Frontend: added an **admin-only** "Run data audit" checkbox (footer and header toggle) in Property Create/Edit forms; when selected the frontend appends `?audit=true` and, if the returned `dataAudit.success === false`, shows an **AdminAuditModal** displaying `dataAudit.issues` and a "View record" action.
- Added unit tests and a SQL script to detect duplicates and create a normalized unique index concurrently.

---

## Files of interest 🔧
- DTOs: `src/MyApp.Models/PropertyDtos.cs`
- Property model helpers: `src/MyApp.Models/Property.cs`
- Audit model: `src/MyApp.Models/DataAudit.cs`
- Audit helper: `src/MyApp.Services/Helpers/PropertyAuditHelper.cs`
- Repository additions: `src/MyApp.Interfaces/Repositories/IPropertyRepository.cs` and `src/MyApp.Repositories/PropertyRepository.cs` (added `FindByNormalizedKeyAsync`)
- Service: `src/MyApp.Services/PropertyService.cs` (pre-create check, JSON serialization, unique constraint handling, `AuditCreation`)
- Controller: `src/MyApp.Api/Controllers/PropertiesController.cs` (supports `?audit=true`, returns 409 on duplicate)
- Duplicate SQL script: `db-postgres/sql-scripts/005_properties_dedupe_and_unique_index.sql`
- Unit tests: `src/MyApp.Tests.Unit/PropertyServiceTests.cs` (added `AuditCreation_Should_Report_Issues_When_Different`)
- Frontend UI: `src/features/properties/components/forms/PropertyFormTabbed.tsx` (admin-only audit toggle + footer checkbox), `src/componentDesignLibrary/forms/generic-tabbed-form/*` (added `footerCenter` slot), `src/features/common/components/AdminAuditModal/AdminAuditModal.tsx` (modal to render `dataAudit.issues`), `src/features/properties/pages/Create/PropertyCreate.tsx` and `src/features/properties/pages/Edit/PropertyEdit.tsx` (open modal on audit failure).

---

## Design patterns & rationale 💡
1. Normalized uniqueness key
   - Combine fields: OwnerId + Name + PropertyType + Currency + Address and address components.
   - Normalization rules: lower(), trim and collapse whitespace, remove punctuation as needed — **must** match the DB index expressions exactly.

2. Pre-create lookup + DB enforcement
   - Pre-create: `FindByNormalizedKeyAsync(...)` in repository to give early feedback (
   avoid false-positives where appropriate).
   - DB: create a **CONCURRENT** unique index on normalized expressions to enforce uniqueness at scale.
   - Race condition: if a concurrent insert wins, catch `DbUpdateException`, detect index name in error, re-query normalized lookup, and throw `DuplicatePropertyException` to return 409 with `existingId`.

3. Data-loss audit (reporting)
   - Implement `DataAuditResult` and `DataAuditIssue`, and a `PropertyAuditHelper.CompareCreateRequestToProperty(req, persisted)` helper.
   - Controller accepts `?audit=true`. When present, it returns a compact envelope with `dataAudit` showing differences and reasons (e.g., `normalized_or_truncated`, `defaulted`, `coerced`).

---

## How to test (Postman / manual) 🧪
1. POST to `POST /api/v1/properties?audit=true` with full JSON body and Authorization header.
2. Expect `201 Created` with body:
```json
{
  "success": true,
  "property": { /* persisted */ },
  "dataAudit": {
    "success": false,
    "issues": [{ "field":"currency","requested":"","stored":"INR","reason":"normalized_or_defaulted" }]
  }
}
```
3. To intentionally trigger audits:
   - Leave `currency` blank → expect defaulting issue.
   - Send very long strings → expect `normalized_or_truncated` if DB or mapping truncates.
   - Send arrays/objects (amenities, owner arrays) and ensure serialized JSON matches stored JSON.
4. To trigger duplicate path: POST a duplicate property and expect **409 Conflict** with `{ code: 'DUPLICATE_PROPERTY', existingId }`.

PUT (edit) testing with audit
1. PUT to `PUT /api/v1/properties/{id}?audit=true` with the update JSON body and Authorization header.
2. Expect `200 OK` with body:
```json
{
  "success": true,
  "property": { /* persisted */ },
  "dataAudit": {
    "success": false,
    "issues": [{ "field":"name","requested":"NewName","stored":"TruncatedName","reason":"normalized_or_truncated" }]
  }
}
```
3. To intentionally trigger edit-audit issues:
   - Update `currency` to empty string to confirm defaulting behavior.
   - Update owner arrays and check JSON differences.
   - Modify fields in ways that cause normalization/truncation; ensure audit reports the problems.

Frontend & UX testing (manual + E2E)
1. As an **admin** (role includes `admin`): open Create or Edit Property form and verify an **admin-only** "Run data audit" checkbox is visible in the footer and header toggle.
2. Check the checkbox and submit the form; the client will call the API with `?audit=true`.
3. If the API responds with `dataAudit` and `success === false`, verify the `AdminAuditModal` opens showing `dataAudit.issues` (field, requested, stored, reason), and that the "View record" action navigates to the edit page for review.
4. If `dataAudit.success === true`, verify a success notification is shown and the modal does not open.
5. If the form is submitted without the audit checkbox, verify the API does not include a `dataAudit` object in the response and the user flows behave as before (navigation to created entity or listing). 
6. Add an E2E test that:
   - Logs in as an admin, opens the Create Property form, checks the audit checkbox, posts a payload that triggers defaulting/truncation mismatches, and asserts the modal opens with the expected issue list and View action.
7. Add tests that assert Duplicate property returns `409` and the UI surfaces an inline error instead of opening the modal.

---

## Migration & runbook 🛠️
1. Run the provided SELECT in `005_properties_dedupe_and_unique_index.sql` to **find** duplicates.
2. Resolve duplicates (manual or scripted rules). Document any merges or owner decisions.
3. After cleanup, run index creation (the script uses `CREATE UNIQUE INDEX CONCURRENTLY ...`).
4. Monitor app logs for unique constraint violation errors — they should translate to 409 responses.
5. Rollback: if index creation fails due to duplicates, revert the index step and fix duplicates first.

---

## Checklist if you want to copy this pattern to another feature 📝
1. Identify the uniqueness definition (fields + owner/context).
2. Agree and implement normalization rules (must be identical in repo lookup and DB index).
3. Add `FindByNormalizedKeyAsync` to the repository and implement the SQL using normalization functions.
4. Add pre-create check in service, return friendly error if found.
5. Add DB index creation script (CONCURRENTLY) and duplicate detection SELECT in a migration SQL file.
6. Handle `DbUpdateException` for unique constraint violation mapping to a domain-specific exception.
7. Implement a simple `DataAudit` helper if the feature needs a compare/verify step.
8. Add unit tests and at least one integration test exercising create+audit and duplicate flows.
9. Update OpenAPI docs and Postman collection (optional but recommended).

---

## Common pitfalls & tips ⚠️
- Keep normalization logic DRY: if you change it, update repo SQL, index expression, and audit comparisons.
- Prefer `CONCURRENTLY` for large tables; ensure duplicates cleaned before index creation.
- Ensure JSON serialization matches DB expectations (the model exposes convenience accessors like `OwnerMobileNumbersArray` to abstract serialization).

---

If you'd like, I can now:
- add an integration test that POSTs with `?audit=true` and asserts expected issues, or
- prepare a Postman collection with example requests and scripts.

</properties_related.md>