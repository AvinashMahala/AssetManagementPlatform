-- MOVED: original file: ../021_unit_utilities.sql
-- Location: schema/utilities/021_unit_utilities.sql

-- Legacy compatibility view for unit_utilities - maps to the new subscription model
DROP TABLE IF EXISTS unit_utilities;

CREATE VIEW IF NOT EXISTS unit_utilities AS
SELECT
  s.id,
  s.unit_id,
  u.key AS utility_type,
  COALESCE(s.subscription_name, s.notes) AS utility_name,
  s.is_enabled,
  s.billing_method,
  s.fixed_amount,
  NULL::uuid AS meter_id,
  s.billing_multiplier AS multiplier,
  s.created_at,
  s.updated_at
FROM utility_subscriptions s
JOIN utility_types u ON u.id = s.utility_type_id;

COMMENT ON VIEW unit_utilities IS 'Compatibility view mapped from utility_subscriptions. Use new tables (utility_subscriptions, meter_allocations) for full functionality.';