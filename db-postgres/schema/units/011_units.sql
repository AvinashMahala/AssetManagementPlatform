-- MOVED: original file: ../011_units.sql
-- Location: schema/units/011_units.sql

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
    balconies INTEGER,
    furnished BOOLEAN DEFAULT FALSE,
    max_occupants INTEGER,
    unit_amenities JSONB DEFAULT '[]'::jsonb,
    unit_photos JSONB DEFAULT '[]'::jsonb,
    monthly_rent NUMERIC(10, 2),
    security_deposit NUMERIC(10, 2),
    maintenance_charges NUMERIC(10, 2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(property_id, unit_number)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_units_property_id ON units(property_id);
CREATE INDEX IF NOT EXISTS idx_units_unit_amenities ON units USING GIN (unit_amenities);
CREATE INDEX IF NOT EXISTS idx_units_unit_photos ON units USING GIN (unit_photos);