# DB Schema - Contextual Organization

This folder contains SQL schema files grouped into contextual subfolders to improve discoverability and reflect logical relationships and deployment order.

Recommended grouping and order (by folder):

1. auth/ (users, sessions, roles, permissions)
2. organizations/ (organizations / multi-tenant)
3. properties/ (property definitions, templates, property-level configs)
4. units/ (units, leases, unit-tenancy relationships)
5. tenants/ (tenant profiles, tenant documents)
6. utilities/ (utility types, subscriptions, meters, readings, allocations, tariffs)
7. billing/ (rent transactions, payments, receipts, expenses)

---

## Utility Billing Changes (added)
- **Tariffs**: Added `schema/utilities/040_tariffs.sql` to support time-varying and tiered pricing scoped to utility types, subscriptions, or specific meters.
- **Precision normalization**: Reading values and transaction snapshots now use NUMERIC(14,6) precision to avoid fractional truncation across readings and billing snapshots.
- **Indexes & constraints**: Added indexes for efficient "latest reading before date" queries and a CHECK for `reading_type` plus a unique constraint for `(meter_id, reading_date)`.
- **Allocation safety**: A trigger enforces that overlapping `meter_allocations` for the same meter do not sum to > 1.0.
- **Timestamps**: A trigger function `update_updated_at_column()` is provided in `schema/misc/041_update_timestamps.sql` and attached to commonly updated billing/utility tables to keep `updated_at` consistent.

These changes are safe for development — no migrations were executed; only DDL files were added/updated. If you want, I can also prepare a small migration plan to bring an existing database in sync (not executed by default).
8. files/ (file metadata, content chunks, access logs)
9. audit/ (audit events)
10. misc/ (export tokens, other utilities)

Notes:
- For backward compatibility the legacy `unit_utilities` is provided as a view (`schema/utilities/021_unit_utilities.sql`) mapping to the new `utility_subscriptions` model.
- The original top-level files were copied into these folders with a header noting the move. The originals remain in place for now to avoid destructive changes; if you'd like, I can remove them and replace with `README` or a migration manifest.

If you'd like I can:
- Remove the old flat files and keep only the grouped folders (non-destructive for development if you confirm), or
- Add a top-level import ordering file that runs grouped SQL files in dependency order.

Would you like me to remove the original root-level schema files next (so only grouped folders remain) or keep duplicates for now?