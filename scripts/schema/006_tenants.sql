-- Tenants table with complete address and contact information
CREATE TABLE IF NOT EXISTS tenants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20),  -- Primary phone (optional)
    alternate_phone VARCHAR(20),  -- Alternate contact phone number
    date_of_birth DATE,
    gender VARCHAR(10),
    occupation VARCHAR(100),
    company_name VARCHAR(255),  -- Employer company name
    monthly_income DECIMAL(12, 2),
    
    -- Current address (required)
    current_address_street VARCHAR(255) NOT NULL,
    current_address_city VARCHAR(100) NOT NULL,
    current_address_state VARCHAR(100) NOT NULL,
    current_address_pincode VARCHAR(10) NOT NULL,
    
    -- Permanent address (optional)
    permanent_address_street VARCHAR(255),
    permanent_address_city VARCHAR(100),
    permanent_address_state VARCHAR(100),
    permanent_address_pincode VARCHAR(10),
    
    -- Emergency contact
    emergency_contact_name VARCHAR(100),
    emergency_contact_relationship VARCHAR(50),
    emergency_contact_phone VARCHAR(20),
    
    -- Status and tracking
    status VARCHAR(50) DEFAULT 'active',
    total_rentals INTEGER DEFAULT 0,  -- Total number of rental agreements
    current_property_id UUID,  -- Current property residence (UUID reference)
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    CONSTRAINT check_total_rentals_non_negative CHECK (total_rentals >= 0)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_tenants_email ON tenants(email);
CREATE INDEX IF NOT EXISTS idx_tenants_phone ON tenants(phone);
CREATE INDEX IF NOT EXISTS idx_tenants_alternate_phone ON tenants(alternate_phone);
CREATE INDEX IF NOT EXISTS idx_tenants_company_name ON tenants(company_name);
CREATE INDEX IF NOT EXISTS idx_tenants_current_property_id ON tenants(current_property_id);
CREATE INDEX IF NOT EXISTS idx_tenants_status ON tenants(status);

-- Add comments for documentation
COMMENT ON COLUMN tenants.alternate_phone IS 'Alternate contact phone number';
COMMENT ON COLUMN tenants.company_name IS 'Employer company name';
COMMENT ON COLUMN tenants.total_rentals IS 'Total number of rental agreements';
COMMENT ON COLUMN tenants.current_property_id IS 'Current property residence (UUID reference)';
