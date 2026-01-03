-- MOVED: original file: ../037_utility_types.sql
-- Location: schema/utilities/037_utility_types.sql

-- Utility types table: canonical list of utilities
CREATE TABLE IF NOT EXISTS utility_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    unit_of_measure VARCHAR(50), -- e.g., 'kWh', 'm3', 'units'
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_utility_types_key ON utility_types(key);

COMMENT ON TABLE utility_types IS 'Canonical list of utility types (electricity, water, gas, etc.)';
COMMENT ON COLUMN utility_types.unit_of_measure IS 'Unit of measure for this utility type, for display and conversions';