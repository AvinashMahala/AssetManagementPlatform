-- Migration: Add enhanced property details and receipt templates
-- This migration adds owner details, amenities, files, and receipt template functionality to properties

-- Add owner details columns to properties table
ALTER TABLE properties ADD COLUMN IF NOT EXISTS owner_name VARCHAR(255);
ALTER TABLE properties ADD COLUMN IF NOT EXISTS owner_mobile_numbers JSONB DEFAULT '[]'::jsonb; -- Array of up to 5 mobile numbers
ALTER TABLE properties ADD COLUMN IF NOT EXISTS owner_email_ids JSONB DEFAULT '[]'::jsonb; -- Array of up to 5 email IDs
ALTER TABLE properties ADD COLUMN IF NOT EXISTS owner_website VARCHAR(500);

-- Add enhanced amenities and additional info
ALTER TABLE properties ADD COLUMN IF NOT EXISTS amenities JSONB DEFAULT '{
  "basic": [],
  "luxury": [],
  "additionalInfo": {
    "petFriendly": false,
    "smokingAllowed": false,
    "eventsAllowed": false
  }
}'::jsonb;

-- Create property_files table for photos and documents
CREATE TABLE IF NOT EXISTS property_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  file_name VARCHAR(255) NOT NULL,
  file_url TEXT NOT NULL,
  file_type VARCHAR(20) NOT NULL CHECK (file_type IN ('photo', 'document')),
  description TEXT,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create property_receipt_templates table
CREATE TABLE IF NOT EXISTS property_receipt_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE UNIQUE,

  -- Bank Details
  bank_name VARCHAR(255),
  account_number VARCHAR(50),
  ifsc_code VARCHAR(20),
  account_holder_name VARCHAR(255),

  -- Wallet Details (JSON array of wallet objects)
  wallets JSONB DEFAULT '[]'::jsonb,

  -- Payment QR Code
  payment_qr_code_url TEXT,

  -- Signature and Watermark
  signature_url TEXT,
  watermark_url TEXT,

  -- Additional receipt information
  additional_info JSONB DEFAULT '{
    "termsAndConditions": null,
    "paymentInstructions": null,
    "contactInfo": null,
    "customFooter": null
  }'::jsonb,

  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_property_files_property_id ON property_files(property_id);
CREATE INDEX IF NOT EXISTS idx_property_files_file_type ON property_files(file_type);
CREATE INDEX IF NOT EXISTS idx_property_receipt_templates_property_id ON property_receipt_templates(property_id);

-- Add constraints to ensure mobile numbers and email IDs don't exceed 5
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'check_owner_mobile_numbers_length') THEN
        ALTER TABLE properties ADD CONSTRAINT check_owner_mobile_numbers_length
        CHECK (jsonb_array_length(owner_mobile_numbers) <= 5);
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'check_owner_email_ids_length') THEN
        ALTER TABLE properties ADD CONSTRAINT check_owner_email_ids_length
        CHECK (jsonb_array_length(owner_email_ids) <= 5);
    END IF;
END $$;

-- Add comments for documentation
COMMENT ON COLUMN properties.owner_name IS 'Primary owner name for the property';
COMMENT ON COLUMN properties.owner_mobile_numbers IS 'Array of up to 5 mobile numbers for the property owner';
COMMENT ON COLUMN properties.owner_email_ids IS 'Array of up to 5 email IDs for the property owner';
COMMENT ON COLUMN properties.owner_website IS 'Website URL for the property owner';
COMMENT ON COLUMN properties.amenities IS 'Enhanced amenities structure with basic, luxury, and additional info';

COMMENT ON TABLE property_files IS 'Stores photos and documents uploaded for properties';
COMMENT ON COLUMN property_files.file_type IS 'Type of file: photo or document';

COMMENT ON TABLE property_receipt_templates IS 'Receipt template settings tied to each property';
COMMENT ON COLUMN property_receipt_templates.wallets IS 'Array of wallet details for UPI payments';

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_property_files_updated_at
    BEFORE UPDATE ON property_files
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_property_receipt_templates_updated_at
    BEFORE UPDATE ON property_receipt_templates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();