-- Property receipt templates table
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
CREATE INDEX IF NOT EXISTS idx_property_receipt_templates_property_id ON property_receipt_templates(property_id);

-- Add comments for documentation
COMMENT ON TABLE property_receipt_templates IS 'Receipt template settings tied to each property';
COMMENT ON COLUMN property_receipt_templates.wallets IS 'Array of wallet details for UPI payments';

-- Create trigger to update updated_at timestamp
DROP TRIGGER IF EXISTS update_property_receipt_templates_updated_at ON property_receipt_templates;
CREATE TRIGGER update_property_receipt_templates_updated_at
    BEFORE UPDATE ON property_receipt_templates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();