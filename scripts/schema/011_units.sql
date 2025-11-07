-- Units table
CREATE TABLE IF NOT EXISTS units (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    unit_number VARCHAR(50) NOT NULL,
    unit_name VARCHAR(255),
    description TEXT,
    unit_type VARCHAR(100),
    status VARCHAR(50) DEFAULT 'available',
    floor INTEGER,
    area NUMERIC(10, 2),
    bedrooms INTEGER,
    bathrooms INTEGER,
    furnished BOOLEAN DEFAULT FALSE,
    furnishing_details JSONB,
    monthly_rent NUMERIC(10, 2),
    security_deposit NUMERIC(10, 2),
    maintenance_charges NUMERIC(10, 2),
    features JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(property_id, unit_number)
);

-- Create index
CREATE INDEX IF NOT EXISTS idx_units_property_id ON units(property_id);
