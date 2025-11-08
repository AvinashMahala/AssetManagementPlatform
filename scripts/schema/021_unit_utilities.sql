-- Unit Utilities table
CREATE TABLE IF NOT EXISTS unit_utilities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    unit_id UUID NOT NULL REFERENCES units(id) ON DELETE CASCADE,
    property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    utility_type VARCHAR(50) NOT NULL,
    utility_name VARCHAR(255) NOT NULL,
    is_enabled BOOLEAN DEFAULT TRUE,
    billing_method VARCHAR(20) NOT NULL DEFAULT 'fixed',
    fixed_amount NUMERIC(10, 2),
    meter_id UUID REFERENCES meters(id) ON DELETE SET NULL,
    multiplier NUMERIC(5, 2) DEFAULT 1.0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_billing_method CHECK (billing_method IN ('fixed', 'meter_based')),
    CONSTRAINT chk_fixed_amount_required CHECK (
        (billing_method = 'fixed' AND fixed_amount IS NOT NULL AND fixed_amount >= 0) OR
        (billing_method = 'meter_based')
    ),
    CONSTRAINT chk_meter_required CHECK (
        (billing_method = 'meter_based' AND meter_id IS NOT NULL) OR
        (billing_method = 'fixed')
    ),
    CONSTRAINT chk_multiplier_positive CHECK (multiplier > 0),
    UNIQUE(unit_id, utility_type)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_unit_utilities_unit_id ON unit_utilities(unit_id);
CREATE INDEX IF NOT EXISTS idx_unit_utilities_property_id ON unit_utilities(property_id);
CREATE INDEX IF NOT EXISTS idx_unit_utilities_meter_id ON unit_utilities(meter_id);
CREATE INDEX IF NOT EXISTS idx_unit_utilities_utility_type ON unit_utilities(utility_type);

-- Add comments
COMMENT ON TABLE unit_utilities IS 'Configurable utilities for each unit (electricity, water, gas, etc.)';
COMMENT ON COLUMN unit_utilities.utility_type IS 'Type of utility (electricity, water, gas, etc.)';
COMMENT ON COLUMN unit_utilities.utility_name IS 'Display name for the utility';
COMMENT ON COLUMN unit_utilities.is_enabled IS 'Whether this utility is active for billing';
COMMENT ON COLUMN unit_utilities.billing_method IS 'How the utility is billed: fixed or meter_based';
COMMENT ON COLUMN unit_utilities.fixed_amount IS 'Monthly fixed amount when billing_method is fixed';
COMMENT ON COLUMN unit_utilities.meter_id IS 'Linked meter when billing_method is meter_based';
COMMENT ON COLUMN unit_utilities.multiplier IS 'Multiplier applied to meter readings';