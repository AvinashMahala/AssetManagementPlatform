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
    address_landmark VARCHAR(255), -- Landmark or nearby location reference
    area NUMERIC(10, 2),
    total_floors INTEGER,
    construction_year INTEGER,
    parking_spaces INTEGER,
    amenities JSONB DEFAULT '{
      "basic": [],
      "luxury": [],
      "additionalInfo": {
        "petFriendly": false,
        "smokingAllowed": false,
        "eventsAllowed": false
      }
    }'::jsonb, -- Enhanced amenities structure
    owner_id UUID REFERENCES users(id),
    owner_name VARCHAR(255), -- Primary owner name
    owner_mobile_numbers JSONB DEFAULT '[]'::jsonb, -- Array of up to 5 mobile numbers
    owner_email_ids JSONB DEFAULT '[]'::jsonb, -- Array of up to 5 email IDs
    owner_website VARCHAR(500), -- Website URL for the property owner
    co_owners JSONB DEFAULT '[]'::jsonb, -- Array of co-owner user IDs
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

-- Add comments for documentation
COMMENT ON COLUMN properties.address_landmark IS 'Landmark or nearby location reference for the property address';
COMMENT ON COLUMN properties.amenities IS 'Enhanced amenities structure with basic, luxury, and additional info';
COMMENT ON COLUMN properties.owner_name IS 'Primary owner name for the property';
COMMENT ON COLUMN properties.owner_mobile_numbers IS 'Array of up to 5 mobile numbers for the property owner';
COMMENT ON COLUMN properties.owner_email_ids IS 'Array of up to 5 email IDs for the property owner';
COMMENT ON COLUMN properties.owner_website IS 'Website URL for the property owner';
COMMENT ON COLUMN properties.co_owners IS 'Array of co-owner user IDs';
