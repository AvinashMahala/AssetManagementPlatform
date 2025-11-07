-- Migration: Fix Tenants Schema Consistency
-- Purpose: Align database schema with backend/frontend implementation
-- Date: 2025-11-06

-- Add missing columns
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS alternate_phone VARCHAR(20);
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS company_name VARCHAR(255);
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS total_rentals INTEGER DEFAULT 0;
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS current_property_id UUID;

-- Make phone nullable (optional field in implementation)
ALTER TABLE tenants ALTER COLUMN phone DROP NOT NULL;

-- Make current address fields required (matches validation)
ALTER TABLE tenants ALTER COLUMN current_address_street SET NOT NULL;
ALTER TABLE tenants ALTER COLUMN current_address_city SET NOT NULL;
ALTER TABLE tenants ALTER COLUMN current_address_state SET NOT NULL;
ALTER TABLE tenants ALTER COLUMN current_address_pincode SET NOT NULL;

-- Add check constraints for data integrity
ALTER TABLE tenants ADD CONSTRAINT check_total_rentals_non_negative 
  CHECK (total_rentals >= 0);

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_tenants_alternate_phone ON tenants(alternate_phone);
CREATE INDEX IF NOT EXISTS idx_tenants_company_name ON tenants(company_name);
CREATE INDEX IF NOT EXISTS idx_tenants_current_property_id ON tenants(current_property_id);

-- Update existing records to have default values for new columns
UPDATE tenants 
SET total_rentals = 0 
WHERE total_rentals IS NULL;

-- Add comment for documentation
COMMENT ON COLUMN tenants.alternate_phone IS 'Alternate contact phone number';
COMMENT ON COLUMN tenants.company_name IS 'Employer company name';
COMMENT ON COLUMN tenants.total_rentals IS 'Total number of rental agreements';
COMMENT ON COLUMN tenants.current_property_id IS 'Current property residence (UUID reference)';
