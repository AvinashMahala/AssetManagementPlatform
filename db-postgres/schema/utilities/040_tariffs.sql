-- NEW: tariffs table - supports time-varying rates, per-subscription/meter overrides
-- Location: schema/utilities/040_tariffs.sql

CREATE TABLE IF NOT EXISTS tariffs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    utility_type_id UUID NOT NULL REFERENCES utility_types(id) ON DELETE RESTRICT,
    subscription_id UUID REFERENCES utility_subscriptions(id) ON DELETE SET NULL,
    meter_id UUID REFERENCES meters(id) ON DELETE SET NULL,
    name VARCHAR(255),
    description TEXT,

    -- Effective range
    effective_from DATE NOT NULL DEFAULT CURRENT_DATE,
    effective_to DATE,

    -- Pricing
    rate_per_unit NUMERIC(14,6) NOT NULL DEFAULT 0,
    fixed_charge NUMERIC(12,2) DEFAULT 0,
    -- Optional tiered structure (JSON): [{"threshold":100, "rate":1.2}, ...]
    tiered_rates JSONB DEFAULT '[]'::jsonb,

    metadata JSONB DEFAULT '{}'::jsonb,

    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_tariffs_utility_type ON tariffs(utility_type_id);
CREATE INDEX IF NOT EXISTS idx_tariffs_subscription ON tariffs(subscription_id);
CREATE INDEX IF NOT EXISTS idx_tariffs_meter ON tariffs(meter_id);
CREATE INDEX IF NOT EXISTS idx_tariffs_effective_range ON tariffs(effective_from, effective_to);

-- Ensure effective range is valid
ALTER TABLE tariffs ADD CONSTRAINT chk_tariff_effective_range CHECK (effective_to IS NULL OR effective_from <= effective_to);

-- Index to speed queries for currently active tariffs (no effective_to)
CREATE INDEX IF NOT EXISTS idx_tariffs_active ON tariffs(effective_from) WHERE effective_to IS NULL;

COMMENT ON TABLE tariffs IS 'Time-varying tariff definitions for utility billing; can be scoped to utility type, subscription, or specific meter.';