-- Migration: 004_add_receipt_templates.sql
-- Description: Add receipt_templates table and template_id column to properties table
-- Date: 2025-11-03

-- Add template_id column to properties table
ALTER TABLE properties
ADD COLUMN IF NOT EXISTS template_id UUID REFERENCES receipt_templates(id) ON DELETE SET NULL;

-- Create receipt_templates table
CREATE TABLE IF NOT EXISTS receipt_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('basic', 'professional', 'premium')),
    description TEXT,
    default_settings JSONB NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    is_default BOOLEAN NOT NULL DEFAULT false,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_receipt_templates_type ON receipt_templates(type);
CREATE INDEX IF NOT EXISTS idx_receipt_templates_is_active ON receipt_templates(is_active);
CREATE INDEX IF NOT EXISTS idx_receipt_templates_sort_order ON receipt_templates(sort_order);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_receipt_templates_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_receipt_templates_updated_at
    BEFORE UPDATE ON receipt_templates
    FOR EACH ROW
    EXECUTE FUNCTION update_receipt_templates_updated_at();

-- Insert predefined templates
INSERT INTO receipt_templates (name, type, description, default_settings, is_active, is_default, sort_order) VALUES
(
    'Basic Template',
    'basic',
    'Simple and clean receipt template with essential information',
    '{
        "theme": {
            "primaryColor": "#000000",
            "secondaryColor": "#666666",
            "fontFamily": "Arial",
            "fontSize": "medium"
        },
        "layout": {
            "showLogo": false,
            "logoPosition": "top-left",
            "showWatermark": false,
            "paperSize": "a4",
            "orientation": "portrait"
        },
        "content": {
            "showPropertyAddress": true,
            "showTenantAddress": false,
            "showPaymentBreakdown": true,
            "showBalanceForward": true,
            "showTermsAndConditions": false,
            "showSignature": false
        },
        "paymentOptions": {
            "showBankDetails": true,
            "showUPI": false,
            "showQRCode": false,
            "showWallets": false
        },
        "numbering": {
            "prefix": "REC",
            "startNumber": 1,
            "includeYear": true,
            "includeMonth": false
        }
    }'::jsonb,
    true,
    true,
    1
),
(
    'Professional Template',
    'professional',
    'Professional template with company branding and detailed information',
    '{
        "theme": {
            "primaryColor": "#1a365d",
            "secondaryColor": "#2d3748",
            "fontFamily": "Times New Roman",
            "fontSize": "medium"
        },
        "layout": {
            "showLogo": true,
            "logoPosition": "top-center",
            "showWatermark": true,
            "watermarkText": "OFFICIAL RECEIPT",
            "paperSize": "a4",
            "orientation": "portrait"
        },
        "content": {
            "showPropertyAddress": true,
            "showTenantAddress": true,
            "showPaymentBreakdown": true,
            "showBalanceForward": true,
            "showTermsAndConditions": true,
            "termsAndConditionsText": "This receipt is computer generated and does not require signature.",
            "showSignature": true,
            "signatureText": "Authorized Signatory"
        },
        "paymentOptions": {
            "showBankDetails": true,
            "showUPI": true,
            "showQRCode": true,
            "showWallets": true
        },
        "numbering": {
            "prefix": "RNT",
            "startNumber": 1,
            "includeYear": true,
            "includeMonth": true
        }
    }'::jsonb,
    true,
    false,
    2
),
(
    'Premium Template',
    'premium',
    'Premium template with advanced styling and comprehensive payment options',
    '{
        "theme": {
            "primaryColor": "#2b6cb0",
            "secondaryColor": "#3182ce",
            "fontFamily": "Georgia",
            "fontSize": "large"
        },
        "layout": {
            "showLogo": true,
            "logoPosition": "top-right",
            "showWatermark": true,
            "watermarkText": "CONFIDENTIAL",
            "paperSize": "a4",
            "orientation": "portrait"
        },
        "content": {
            "showPropertyAddress": true,
            "showTenantAddress": true,
            "showPaymentBreakdown": true,
            "showBalanceForward": true,
            "showTermsAndConditions": true,
            "termsAndConditionsText": "This is an official receipt. Please retain for your records. Late payments may incur additional charges.",
            "showSignature": true,
            "signatureText": "Property Management"
        },
        "paymentOptions": {
            "showBankDetails": true,
            "showUPI": true,
            "showQRCode": true,
            "showWallets": true
        },
        "numbering": {
            "prefix": "PMR",
            "startNumber": 1000,
            "includeYear": true,
            "includeMonth": true
        }
    }'::jsonb,
    true,
    false,
    3
);