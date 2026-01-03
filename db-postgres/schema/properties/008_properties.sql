-- MOVED: original file: ../008_properties.sql
-- Location: schema/properties/008_properties.sql

-- Properties table
CREATE TABLE IF NOT EXISTS properties (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    property_type VARCHAR(100),
    status VARCHAR(50) DEFAULT 'active',
    currency VARCHAR(10) DEFAULT 'INR',
    address_street VARCHAR(255),
    address_city VARCHAR(100),
    address_state VARCHAR(100),
    address_pincode VARCHAR(10),
    address_country VARCHAR(100) DEFAULT 'India',
    address_landmark VARCHAR(255), -- Landmark or nearby location reference
    area NUMERIC(10, 2),
    total_floors INTEGER,
    year_built INTEGER,
    parking_spaces INTEGER,
    amenities JSONB DEFAULT '{
      "basic": [],
      "luxury": [],
      "additionalInfo": {
        "petFriendly": false,
        "smokingAllowed": false,
        "eventsAllowed": false
      }
    }'::jsonb,
    owner_id UUID REFERENCES users(id),
    owner_name VARCHAR(255),
    owner_mobile_numbers JSONB DEFAULT '[]'::jsonb,
    owner_email_ids JSONB DEFAULT '[]'::jsonb,
    owner_website VARCHAR(500),
    co_owners JSONB DEFAULT '[]'::jsonb,
    template_id UUID REFERENCES receipt_templates(id),
    template_overrides JSONB,
    receipt_settings JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT check_owner_mobile_numbers_length CHECK (jsonb_array_length(owner_mobile_numbers) <= 5),
    CONSTRAINT check_owner_email_ids_length CHECK (jsonb_array_length(owner_email_ids) <= 5)
);

-- Create index
CREATE INDEX IF NOT EXISTS idx_properties_owner_id ON properties(owner_id);