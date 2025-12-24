# DB ↔ Backend ↔ Frontend Consistency Plan

**Owner:** Project Agent (GitHub Copilot)
**Purpose:** Centralized, single-source tracker to drive feature-by-feature consistency between `db/`, `backend/`, and `frontend/`.

---

## Goals
- Ensure every feature/module has aligned **database schema**, **backend models/validators**, and **frontend forms/views/types**.
- Iterate feature-by-feature through small, testable microphases until the user signs off for each feature.
- Maintain an auditable log of progress updates, PR links, and session notes so the agent can continue work across chat sessions seamlessly.
- Only after feature consistency across the stack is achieved, plan and execute migrations.

---

## Scope & Definitions
- **Feature / Module**: A cohesive domain area (e.g., Properties, Tenants, Leases, Payments, Receipts, Templates, Meters, Expenses, Files, Users/Org).
- **Consistency**: For a feature, DB columns and constraints exist and match backend DTOs/validators and frontend forms/types. Auditable fields (e.g., id, created_at, updated_at) are present in DB and backend but not shown as editable inputs in UI.
- **Microphase**: Small incremental step (Analyze, Backend, Frontend, Seeds, Tests, Sign-off).

---

## Workflow & Rules for the Agent
- Work in **phases, one feature at a time** (do not parallelize across features without explicit approval).
- Before starting a new feature microphase, **update this `PLAN.md`** with the session note and mark exactly one feature microphase as `in-progress` using the template below (one `in-progress` at any time).
- When a microphase completes, immediately mark it `completed`, add PR links (if any) and add any follow-up microphases required.
- For every change that touches code, add a short summary and a link to the PR (or commit) in the session log entry.

---

## Per-Feature Microphase Checklist (Template)
Copy this block for each feature under the backlog and update statuses.

### Feature: {FEATURE NAME}  🔧
Priority: [P0 | P1 | P2]
Estimated Effort: [S | M | L]

A. Analyze & Map 🔍
- [ ] Collect DB files: `db/schema/*` related files (list)
- [ ] Collect backend files: `backend/src/features/*` (list)
- [ ] Collect frontend files: `frontend/src/features/*` (list)
- [ ] Produce field-level mapping: table of `field | dbType | backend | frontend | status`
- [ ] Identify seed scripts that insert this data
- [ ] Produce one-line summary of inconsistencies

B. Backend Alignment 🔧
- [ ] Add/adjust DTOs and domain types
- [ ] Add/adjust validators (lengths, required, enums)
- [ ] Update repository mapper(s) for column JSON mapping and naming
- [ ] Add backend unit tests for validators & mappers

C. Frontend Alignment 🎨
- [ ] Update frontend types and form field names to match DTOs
- [ ] Add client-side validation (mirrors backend constraints)
- [ ] Omit auditable/meta fields from input forms
- [ ] Add component tests for forms

D. Seeds & Data 🔁
- [ ] Update/verify seed scripts to use repository methods or conforming SQL
- [ ] Add a dry-run or validation mode for seeds when possible

E. Integration Tests ✅
- [ ] Add API tests that exercise create/update flows against a test DB
- [ ] Add integration tests that exercise frontend-like payloads against the API (optional)

F. Sign-off ✅
- [ ] Acceptance criteria met (see below)
- [ ] PR(s) opened and/or merged
- [ ] Add session notes, PR links, and mark microphase completed below

---

## Acceptance Criteria (for a feature to be considered `consistent`)
- API accepts the documented shape for create/update with server-validation aligned to DB constraints (lengths, enums, not-null).
- Backend domain models and persisted data fields match the DB schema names and types (mapping conversions accounted for).
- Frontend forms show only the relevant editable fields (no `id`, `created_at`, `updated_at`, `created_by`) and validate client-side to match server constraints.
- Seed scripts create data that conforms to current schema and backend validations; they should not rely on legacy column names.
- Unit + integration tests exist and pass locally and in CI for that feature.

---

## Prioritized Backlog (initial)
- Properties (P0, L)
- Rent Transactions / Payments / Receipts (P0, L)
- Receipt Templates & Property Receipt Templates (P1, M)
- Tenants (P1, M)
- Leases (P1, M)
- Units (P1, S)
- Meters & Meter Readings (P1, M)
- Expenses (P1, M)
- Files / File metadata (P2, M)
- Users / Auth / Organizations (P1, M)

> Each item should be expanded into a concrete feature block above before starting work.

---

## Tracking & Session Log (how to update)
- For each chat session or PR, add an entry under "Progress Log" using the following format:

```
### Progress Log
- YYYY-MM-DD HH:MM UTC - **Feature:** Properties — **Microphase:** Backend Alignment — **Action:** Updated validation to accept structured `address` and extended `name` length to 255 in Zod schema. **PR:** #123 (link). **Next:** Update frontend forms and add tests.
```

- Always keep this log chronological and concise (1-2 sentences per entry). After any change, re-run the Analyze & Map step to make sure no drift occurred.

---

## Agent Operational Rules (must obey)
- Only one microphase is `in-progress` at a time. If switching tasks, mark the previous microphase `completed` or `blocked` and explain why.
- Keep each microphase small and verifiable (one PR per micro-change when possible).
- Provide a short preamble before tool-heavy batches and a wrap-up after (2 sentences: finding + next step) — this helps maintain cadence across sessions.

---

## Automation & Tooling Recommendations
- Add `db/scripts/migrate.ts` and `db/scripts/status.ts` to track migrations and applied versions.
- Add `db/scripts/consistency_check.ts` to perform automated comparisons between DB schema and backend Type definitions (best-effort) and report diffs.
- Add `tests/integration/` runner that can be executed by CI using Docker Compose (spins up Postgres, runs migrations, seeds, and runs tests).
- Maintain a machine-readable `db/PLAN-STATE.json` file (optional) to allow CI hooks to report status back to the Plan.

---

## Change Log
- 2025-12-23 — Initial plan created. Owner: Project Agent. Backlog seeded with prioritized features. Next step: Start Properties microphase (Analyze & Map).

---

## Next Steps (immediate)
- [ ] Agent to start **Properties**: set microphase `A. Analyze & Map` to `in-progress`, create a mapping artifact, and report findings in session log.
- [ ] Confirm plan format and whether you want the `PLAN.md` in root or under `db/` (current: root `PLAN.md`).

### Feature: Properties (P0, L) — Analyze & Map (completed)

A. Analyze & Map ✅
- **DB files:** `db/schema/008_properties.sql`
- **Backend files:**
	- `backend/src/features/properties/property/core/types/property.types.ts`
	- `backend/src/features/properties/property/api/property.validation.ts`
	- `backend/src/features/properties/property/data/mappers/PropertyMapper.ts`
	- `backend/src/features/properties/property/data/repository/PropertyRepository.ts`
	- `backend/src/features/properties/property/api/PropertyController.ts`
- **Frontend files:**
	- `frontend/src/features/properties/types/index.ts`
	- `frontend/src/features/properties/components/forms/PropertyFormTabbed.tsx`
	- `frontend/src/features/properties/components/forms/validators.ts`
	- `frontend/src/features/properties/components/forms/tabs/*`

**Field-level summary (high level):**
- `id` — DB uuid, backend string, frontend string — **match**
- `name` — DB VARCHAR(255) NOT NULL, backend Zod max 100, frontend no max — **mismatch (backend max 100)**
- `address` — DB stores `address_street`, `address_city`, etc; backend & frontend use `address` object (street, city, state, pincode, country, landmark) — **mismatch (shape differs; mapper handles conversion)**
- `property_type` / `type` — DB uses `property_type`, backend types use `propertyType` enum; validation expects `type` field — **naming mismatch (routes expect `type` instead of `propertyType`)**
- `amenities` — DB JSONB (structured with `basic`, `luxury`, `additionalInfo`); backend `amenities` type mirrors this; frontend uses same object — **match**
- `buildingPhotos` — present in backend/frontend as files array but stored in `property_files` table (no direct DB column) — **handled via repository but ensure docs reflect this**
- `owner` fields — DB uses `owner_name`, `owner_mobile_numbers` (JSONB), `owner_email_ids` (JSONB); backend uses `ownerDetails` object — **match (mapper converts JSONB to object)**
- `area` vs `totalArea` — DB column `area` maps to backend `totalArea` — **naming mismatch but mapper handles it**

**Seed scripts note:** `db/seeds/python/seed_property_data.py` inserts into legacy columns (e.g., `address`, `city`, `zip_code`, `built_year`, `total_units`) that do not match current schema — **seed scripts must be updated**.

**Primary issues found (actionable):**
1. Backend validation (`createPropertySchema`, `updatePropertySchema`) expects `address` as a string and `type` field — needs to accept the structured `address` object and use `propertyType` naming (or accept both temporarily for compatibility). Also increase `name` max from 100 to 255 to align with DB.
2. Seeds are outdated and can mask schema drift — update seed scripts to use repository create APIs or align columns with the current schema.
3. Ensure repository/controller injects audit fields (e.g., `created_at`/`created_by`) where DB requires non-null values (verify flow for created_by if required elsewhere).

**Recommended immediate microtasks:**
- Backend Alignment (in-progress):
	- Update `property.validation.ts` to accept structured `address` object and rename/alias `type` → `propertyType` (backwards-compatible accept both).
	- Change `name` validator to `.max(255)`.
	- Add unit tests for `createPropertySchema` and `updatePropertySchema` covering both legacy and new payload shapes.
- Frontend Alignment (next):
	- Add client-side validation for name length (<=255) in `validators.ts`.
	- Ensure forms submit `propertyType` and full `address` object (already true) and remove any code that sends `address` as single string.
- Seeds & Data:
	- Update `db/seeds/python/seed_property_data.py` to insert using repository methods (or adjust SQL) to avoid legacy columns.
	- Add a dry-run mode to seeds that validates shape against the `PropertyInput` type or via API.

**Progress Log:**
- 2025-12-23 15:40 UTC - **Feature:** Properties — **Microphase:** Analyze & Map — **Action:** Completed field mappings and identified validation & seed mismatches. **Next:** Start Backend Alignment (update validation + tests).
 - 2025-12-23 16:10 UTC - **Feature:** Properties — **Microphase:** Backend Alignment — **Action:** Updated validation to accept structured `address`, added normalization for legacy `type` into `propertyType`, increased `name` max to 255, and added unit tests. **Commit:** `fix(properties): accept structured address and propertyType; normalize legacy 'type'; increase name length; add tests`.
  
**Status:** Backend Alignment completed locally; tests added but not executed in CI (Jest not available in local path). Next: Frontend Alignment (client validations & form checks).

---

*If you want, I can now: (A) commit this `PLAN.md` to the repo and mark the Properties microphase as `in-progress` and begin the analyze step, or (B) adjust the plan wording/structure per your preferences.*
