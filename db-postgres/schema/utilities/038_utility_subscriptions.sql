-- MOVED: original file: ../038_utility_subscriptions.sql
-- Location: schema/utilities/038_utility_subscriptions.sql

-- Utility subscriptions (per-unit billing configuration)
CREATE TABLE IF NOT EXISTS utility_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    unit_id UUID NOT NULL REFERENCES units(id) ON DELETE CASCADE,
    utility_type_id UUID NOT NULL REFERENCES utility_types(id) ON DELETE RESTRICT,
    subscription_name VARCHAR(255),
    is_enabled BOOLEAN DEFAULT TRUE,

    -- Billing policy
    billing_method VARCHAR(20) NOT NULL DEFAULT 'fixed' CHECK (billing_method IN ('fixed', 'meter_allocated')),
    fixed_amount NUMERIC(12, 2),
    billing_multiplier NUMERIC(8, 4) DEFAULT 1.0,

    -- Administrative fields
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT chk_fixed_amount_required CHECK (
        (billing_method = 'fixed' AND fixed_amount IS NOT NULL AND fixed_amount >= 0) OR
        (billing_method = 'meter_allocated')
    ),
    UNIQUE (unit_id, utility_type_id)
);

CREATE INDEX IF NOT EXISTS idx_utility_subscriptions_unit_id ON utility_subscriptions(unit_id);
CREATE INDEX IF NOT EXISTS idx_utility_subscriptions_utility_type_id ON utility_subscriptions(utility_type_id);

COMMENT ON TABLE utility_subscriptions IS 'Per-unit subscription for utility billing (represents business-level utility config)';
COMMENT ON COLUMN utility_subscriptions.billing_multiplier IS 'Multiplier applied to allocated usage for billing (e.g., tenant-specific adjustment)';