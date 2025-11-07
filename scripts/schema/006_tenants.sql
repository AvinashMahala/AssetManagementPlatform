-- Tenants table
CREATE TABLE IF NOT EXISTS tenants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20),
    alternate_phone VARCHAR(20),
    date_of_birth DATE,
    gender VARCHAR(10),
    occupation VARCHAR(100),
    company_name VARCHAR(255),
    monthly_income DECIMAL(12, 2),
    current_address_street VARCHAR(255) NOT NULL,
    current_address_city VARCHAR(100) NOT NULL,
    current_address_state VARCHAR(100) NOT NULL,
    current_address_pincode VARCHAR(10) NOT NULL,
    permanent_address_street VARCHAR(255),
    permanent_address_city VARCHAR(100),
    permanent_address_state VARCHAR(100),
    permanent_address_pincode VARCHAR(10),
    emergency_contact_name VARCHAR(100),
    emergency_contact_relationship VARCHAR(50),
    emergency_contact_phone VARCHAR(20),
    status VARCHAR(50) DEFAULT 'active',
    total_rentals INTEGER DEFAULT 0,
    current_property_id UUID,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index
CREATE INDEX IF NOT EXISTS idx_tenants_email ON tenants(email);
