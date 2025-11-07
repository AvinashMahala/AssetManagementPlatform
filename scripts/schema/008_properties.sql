-- Properties table
CREATE TABLE IF NOT EXISTS properties (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    property_type VARCHAR(100),
    status VARCHAR(50) DEFAULT 'active',
    address_street VARCHAR(255),
    address_city VARCHAR(100),
    address_state VARCHAR(100),
    address_pincode VARCHAR(10),
    address_country VARCHAR(100) DEFAULT 'India',
    area NUMERIC(10, 2),
    total_floors INTEGER,
    construction_year INTEGER,
    parking_spaces INTEGER,
    amenities JSONB,
    owner_id UUID REFERENCES users(id),
    template_id UUID REFERENCES receipt_templates(id),
    template_overrides JSONB,
    receipt_settings JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index
CREATE INDEX IF NOT EXISTS idx_properties_owner_id ON properties(owner_id);
