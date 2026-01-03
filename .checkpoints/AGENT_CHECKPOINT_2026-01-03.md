# Agent Checkpoint — Asset Management Platform

Date: 2026-01-03
Agent: GitHub Copilot (Raptor mini (Preview))

---

## 1) Purpose
This checkpoint captures the end-to-end work performed in this chat session: schema normalization for utilities & billing, DDL and trigger additions, and a complete backend implementation (models, repositories, services, controllers, OpenAPI docs, and Postman examples) so a future agent or developer can pick up exactly where work left off.

---

## 2) High-level summary of what was implemented
- Database (DDL) changes (files under `db-postgres/schema`):
  - utilities:
    - `018_meters.sql` (indexes, unique meter number),
    - `019_meter_readings.sql` (reading_type CHECK, unique meter+date, indexes),
    - `020_rent_transaction_meter_readings.sql` (precision increased to NUMERIC(14,6), meter_name length aligned),
    - `021_unit_utilities.sql` (compatibility VIEW),
    - `037_utility_types.sql`, `038_utility_subscriptions.sql`, `039_meter_allocations.sql` (allocation trigger added),
    - `040_tariffs.sql` (tariffs table added, effective-range check, active index),
    - `041_tariff_helpers.sql` (validate_tiered_rates, get_applicable_tariff),
    - `042_enforce_subscription.sql` (trigger ensuring subscription presence for meter_allocated snapshots),
  - misc:
    - `041_update_timestamps.sql` (trigger to auto-set `updated_at` on updates),
  - billing:
    - `023_payments_sync.sql` (triggers to keep `rent_transactions.payments` in sync with `rent_payments`).

- Backend (.NET Core) changes (project: `backend-dot-net-core`):
  - Models added/updated: `Tariff`, `MeterAllocation`, `UtilitySubscription`, `UtilityType`, `RentTransactionMeterReading`.
  - Repositories added: `TariffRepository`, `MeterAllocationRepository`, `UtilitySubscriptionRepository`, `UtilityTypeRepository`, `RentTransactionMeterReadingRepository` and interfaces under `MyApp.Interfaces.Repositories`.
  - Services added: `TariffService`, `MeterAllocationService`, `BillingService` (billing runner), and interface `IBillingService`.
  - Controller APIs added: `TariffsController`, `MeterAllocationsController`, `BillingController` (`POST /api/billing/run-for-lease`) and augmentation to `RentTransactionsController` to list meter-reading snapshots.
  - DTOs & request validation: Request DTOs added for Tariff (`TariffCreateRequest`, `TariffUpdateRequest`) and MeterAllocation (`MeterAllocationCreateRequest`, `MeterAllocationUpdateRequest`). Controllers accept DTOs and return friendly 400 responses.
  - App-level validation: overlapping allocation checks (prevent sum > 1), pre-checks in billing runner (error if subscription expects meter_allocated but no allocations exist). DB triggers still present for final safety.
  - Swagger/OpenAPI: XML doc generation enabled, controllers annotated with `ProducesResponseType`, examples loaded from `ApiDocs/Controllers/*`, custom swagger filters pick up request/response examples.
  - Postman collection: `docs/postman/Billing.postman_collection.json` with create tariff, create allocation, run billing examples.

- Documentation: Updated `db-postgres/schema/README.md`, added `db-postgres/schema/DEVELOPER_GUIDE.md` (tariff precedence, tier format, billing snapshot expectations), `docs/BILLING_API_README.md` and ApiDocs examples for endpoints.

---

## 3) Important files & locations (quick map)
- DB DDL: `db-postgres/schema/utilities/*`, `db-postgres/schema/billing/*`, `db-postgres/schema/misc/*`
- DB helpers: `db-postgres/schema/utilities/041_tariff_helpers.sql`, `042_enforce_subscription.sql` (triggers) and `023_payments_sync.sql`
- Backend models: `backend-dot-net-core/src/MyApp.Models/*` (Tariff.cs, MeterAllocation.cs, etc.)
- Repos: `backend-dot-net-core/src/MyApp.Repositories/*Repository.cs` (TariffRepository, MeterAllocationRepository, RentTransactionMeterReadingRepository)
- Services: `backend-dot-net-core/src/MyApp.Services/*Service.cs` (TariffService, MeterAllocationService, BillingService)
- Controllers: `backend-dot-net-core/src/MyApp.Api/Controllers/*.cs` (TariffsController, MeterAllocationsController, BillingController)
- API docs examples: `ApiDocs/Controllers/**` (request.json, responses/*.json)
- Postman: `docs/postman/Billing.postman_collection.json`
- Checkpoint file: `.checkpoints/AGENT_CHECKPOINT_2026-01-03.md` (this file)

---

## 4) How to resume work (for next agent) — checklist
1. **Familiarize**: Read this file and `db-postgres/schema/DEVELOPER_GUIDE.md` for tariff selection rules and `docs/BILLING_API_README.md` for manual test steps.
2. **Environment**: Ensure dev Postgres is available and `MAIN_DATABASE_URL` or connection string is set. Local dev uses `appsettings.Development.json` or environment variables similar to existing repo patterns.
3. **Apply DDL**: Run the SQL files under `db-postgres/schema` in order (or use existing seed scripts, ensuring `db-postgres/schema` is referenced). No data migrations were executed by the agent — running the DDL against a fresh dev DB is recommended.
4. **Build & Run Backend**:
   - In `backend-dot-net-core`: `dotnet build`, `dotnet run --project src/MyApp.Api` (ensure XML doc is generated so Swagger shows summaries).
5. **Manual test flow** (quick smoke):
   - Create a utility type (if not seeded). Create a tariff (POST /api/tariffs).
   - Create a unit subscription (use existing Unit Utilities / UtilitySubscriptions APIs or insert via repo).
   - Create meter and meter readings (start & end). Create meter allocation(s).
   - Trigger billing: POST `/api/billing/run-for-lease?leaseId=...&startDate=...&endDate=...` and verify `rent_transactions` and meter-reading snapshots.
6. **Swagger / Postman**: Open Swagger UI (dev env) — examples will be shown from `ApiDocs`. Import `docs/postman/Billing.postman_collection.json` for quick manual testing.

---

## 5) Known assumptions & limitations / items left for future work
- No production migrations were executed; DDL changes are files only — you must apply them to dev DB. The approach is deliberate (you requested no migrations).
- No automated tests were added (explicit request). Manual testing recommended using Postman & Swagger.
- Tariff resolution is implemented (subscription → meter → utility-type, latest `effective_from`). Future: add priority weights or richer conflict resolution if needed.
- Payments: `rent_transactions.payments` is a denormalized JSONB cache maintained by DB triggers; consider eventual migration to explicit relational linkage if desired.
- Edge cases: tariff tiering is validated by a DB helper that checks structure, but the billing runner does simple rate application. If complex stepwise tier calculations are required, implement `applyTieredRates` logic in billing service.

---

## 6) Suggested next tasks (priority order)
1. Add response DTOs and map controllers to them (stability & API evolution). — Useful before expanding frontend usage. ✅ (recommended)
2. Add sample seed script that creates a working demonstration dataset for a property/unit/meter/subscription/readings/tariff so testers can run billing instantly. — High ROI. ✅ (helpful)
3. Optional: Implement advanced tiered rate calculations (billing service) and edge-case tests. ✅
4. Post-merge: consider small integration tests that exercise billing runner with seeded data (not requested yet).

---

## 7) If you pick this up next
- Start by running the DDL and a local backend instance, then follow the Manual test flow above.
- For any schema drift/behavioral question, inspect the DB DDL first (`db-postgres/schema/*`) and the billing service (`backend-dot-net-core/src/MyApp.Services/BillingService.cs`) for implemented assumptions.

---

If you want, I can also open a short PR summary (files changed with line-level notes) or create a small seed SQL script that sets up a sample lease/unit/utility/tariff/readings and demonstrates one billing run. Which would you prefer next?

