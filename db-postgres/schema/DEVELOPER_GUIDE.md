# DB Developer Guide — Utilities & Billing

This short guide documents the tariff selection rules, `tiered_rates` JSON format, and billing snapshot expectations for contributors.

## Tariff selection precedence
When determining which tariff applies for billing at a given date, use the following precedence (highest to lowest):
1. **Subscription-specific** (`tariffs.subscription_id = subscription.id`) — highest priority
2. **Meter-specific** (`tariffs.meter_id = meter.id`)
3. **Utility-type default** (`tariffs` with subscription_id IS NULL and meter_id IS NULL)

Within the same precedence scope, choose the tariff with the **latest `effective_from`** that is <= billing date.

A helper function `get_applicable_tariff(subscription_id, meter_id, utility_type_id, date)` is provided in `schema/utilities/041_tariff_helpers.sql` to perform this selection.

## Tariff effective ranges
- `effective_from` is inclusive; `effective_to` is inclusive. The schema enforces `effective_to IS NULL OR effective_from <= effective_to`.
- When multiple overlapping tariffs exist for the same scope, the helper function resolves by precedence and `effective_from` recency.

## `tiered_rates` JSON structure (example)
`tiered_rates` is an array of objects in the form:

```
[
  { "threshold": 100, "rate": 1.2 },
  { "threshold": 300, "rate": 1.5 },
  { "threshold": null, "rate": 2.0 }  -- null threshold indicates 'above previous thresholds'
]
```
- `threshold` and `rate` must be non-negative numbers (threshold may be null for the final "catch-all" tier).
- A DB-level validation function `validate_tiered_rates(JSONB)` exists to validate basic structure (present in `041_tariff_helpers.sql`).

## Billing snapshot expectations
- `rent_transaction_meter_readings` stores immutable snapshots used for invoice generation and auditability. It captures previous/current readings, units consumed, and the tariff used (rate and fixed charge) at the time of billing.
- Reading precision is NUMERIC(14,6) to reduce rounding errors.

## Payments cache
- `rent_transactions.payments` is maintained as a denormalized JSONB cache. Triggers in `schema/billing/023_payments_sync.sql` automatically recompute payments when `rent_payments` or `rent_transactions` change using the matching rules described in the trigger code.

## Subscription enforcement
- A trigger (`schema/utilities/042_enforce_subscription.sql`) ensures that when a unit has a subscription configured with `billing_method = 'meter_allocated'`, any `rent_transaction_meter_readings` rows for that meter & transaction must include a `subscription_id`.

## Notes & Future Work
- Consider adding more advanced tariff conflict resolution (priority weights) and richer tier validation if needed.
- Consider adding unit/invariant checks (e.g., meter.unit_id belongs to meter.property_id) as desired.

---
This document is intentionally short — add implementation notes or examples here as we iterate.