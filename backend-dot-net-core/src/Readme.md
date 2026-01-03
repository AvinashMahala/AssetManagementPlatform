```
Users/Actors
[Owner]   [Property Manager]   [Tenant]   [Technician]   [Admin]
   |             |               |            |             |
   +-------------+---------------+------------+-------------+
                                 |
                                 v
                           [Property]  (owner_id)                    (1)
                              |
                              v
                            [Unit]  <------ lease ---- [Lease] ---> [Tenant]
                              |                             |
                              |                             v
             +----------------+----------------+
             |                                 |
             v                                 v
[Utility Subscriptions]                 [Base Rent / Lease Terms]
(unit_id, utility_type, billing_method,  (monthly rent, discounts)
 fixed_amount?, billing_multiplier?, is_enabled)
     |                      \
     |                       \
     |                        \
     |                         \
     v                          v
[Meter Allocations] <-----> [Meters (devices)]  (meter_id, meter_type, device_multiplier, status)
 (allocation_fraction, effective_from/to)       |
     |                                           |
     v                                           v
              [Meter Readings]  (meter_id, reading_value, reading_date, reading_type)
                            |
                            v
                      +-------------------------------+
                      |    Billing Engine / Runner    |
                      | - Fetch subscriptions for unit|
                      | - Resolve meter allocations   |
                      | - Compute usage (current - prev reading) |
                      | - Apply tariffs, multipliers, allocation rules |
                      | - Create snapshots (audit)    |
                      +-------------------------------+
                                     |
                                     v
                      [rent_transaction_meter_readings] (snapshot: units_consumed, cost_per_unit, total_cost, reading_date, meter_id, meter_reading_id)
                                     |
                                     v
                          [rent_transactions]  (aggregate totals, base_rent, total_meter_charges, payments JSON, balances)
                                     |
                                     v
                              Invoice generation  -> (PDF stored, invoice_number)
                                     |
                                     v
                    Notification (email/sms) -> Payment received -> Payment recorded
                                     |
                                     v
                               Receipt generated -> balance update
                                     |
                                     v
                                 Audit & Reports
```


Numbered lifecycle steps (concise) ✅
Admin/Owner registers Property and Units; leases are created linking Units ↔ Tenants.
For each Unit, create one-or-more Utility Subscriptions (utility_type can be custom): either
fixed billing (fixed_amount) or
meter-based (subscription links to meter(s) via meter_allocations) with billing_multiplier or allocation rule.
Meters (devices) are registered at property level, assigned to allocations (supports many-to-many; fractional split or rule-based).
Meter readings are collected regularly and stored as single readings: reading_value + reading_date + reading_type (actual/estimated).
Billing run for a billing period:
For each subscription: resolve meters & allocations → derive previous & current readings → compute usage (current - previous).
Apply tariffs (time/effective-based), device multiplier, subscription billing_multiplier, and allocation fraction.
Create per-meter snapshot rows (rent_transaction_meter_readings) for audit (store computed units & costs).
Aggregate meter charge lines into rent_transactions.total_meter_charges; include base rent, maintenance, expenses, and sum to total_amount.
Generate Invoice + send notification(s); tenant/tenant portal views invoice.
Record Payments; update amount_paid, new_balance, produce receipts and workflow state changes.
Audit trails: all snapshots and historic tariffs remain for full reproducibility.
Edge cases & important rules ⚠️
Shared meter support: meter_allocations allow fractional splits; the billing engine must validate allocation sums and handle default-allocation fallback.
Meter replacement: keep meters immutable (historical readings stay tied to old meter); allocations get effective_from/on.
Reading corrections/estimates: reading types (estimated/corrected) and adjustment transactions must be supported (create correction entries or balance-adjusting transactions).
Time-varying tariffs: store tariff effective ranges so a billing run spanning a tariff boundary proratably applies rates.
Custom utilities: utility_type can be user-defined with metadata; UI must support friendly names and units (kWh, m3, etc.).
Auditability: keep snapshots in rent_transaction_meter_readings with all computed fields (units, rates, total) — don't recompute past invoice totals from live data alone.
Backend & Frontend touchpoints (short) 🔁
Backend:
New APIs: manage utility_subscriptions, meter_allocations, tariffs.
Billing service: deterministic billing run that writes snapshots and transactions.
Migrations: backfill existing unit_utilities → utility_subscriptions + meter_allocations.
Frontend:
Unit UI: show subscriptions, billing method, meter assignments, allocation editor.
Meter inventory: readings timeline, replacement workflow, read adjustments.
Billing preview: show computed meter charges, allocation breakdown, and invoice preview before finalize.


```
Frontend (React + Vite)
  └─> UI Pages & Forms
        └─> API Client (Axios)
              └─> Backend API (Node/Express)
                    ├─ Controllers (HTTP layer)
                    ├─ Services (Business logic: billing runner, meter allocation, payments)
                    ├─ Repositories (DB access / mappers)
                    └─ Workers / Scheduler
                          ├─ Billing Runner (schedules scans -> uses tariffs + allocations -> writes rent_transaction_meter_readings)
                          └─ Background jobs (notifications, receipts)
                             |
                             v
                     PostgreSQL (db-postgres)
                     ├─ auth/ (users, sessions, roles)
                     ├─ properties/ (properties, templates)
                     ├─ units/ (units, leases)
                     ├─ tenants/
                     ├─ utilities/
                     |    ├─ utility_types
                     |    ├─ utility_subscriptions
                     |    ├─ meters
                     |    ├─ meter_readings
                     |    ├─ meter_allocations
                     |    └─ tariffs
                     ├─ billing/ (rent_transactions, rent_payments, receipts)
                     ├─ files/
                     ├─ audit/
                     └─ misc/ (triggers, helpers)
```