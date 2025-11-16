-- Meters table
CREATE TABLE IF NOT EXISTS meters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID NOT NULL REFERENCES properties(id),
    unit_id UUID REFERENCES units(id),
    meter_type VARCHAR(50) NOT NULL,
    meter_number VARCHAR(100) NOT NULL,
    meter_name VARCHAR(255), -- Display name for the meter
    multiplier NUMERIC(5, 2) DEFAULT 1.0,
    cost_per_unit DECIMAL(10, 2) DEFAULT 0, -- Cost per unit for meter-based billing
    fixed_charge DECIMAL(10, 2), -- Fixed monthly charge for the meter
    remarks TEXT, -- Additional remarks or notes about the meter
    installation_date DATE,
    status VARCHAR(50) DEFAULT 'active',
    is_active BOOLEAN DEFAULT TRUE, -- Whether the meter is active and in use
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add comments for documentation
COMMENT ON COLUMN meters.meter_name IS 'Display name for the meter';
COMMENT ON COLUMN meters.cost_per_unit IS 'Cost per unit for meter-based billing';
COMMENT ON COLUMN meters.fixed_charge IS 'Fixed monthly charge for the meter';
COMMENT ON COLUMN meters.remarks IS 'Additional remarks or notes about the meter';
COMMENT ON COLUMN meters.is_active IS 'Whether the meter is active and in use';
