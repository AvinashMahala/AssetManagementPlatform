-- Seed data for receipt templates
-- Insert predefined receipt templates with default settings

-- Clear existing templates (optional - only for fresh setup)
-- TRUNCATE TABLE receipt_templates CASCADE;

-- Basic Template
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
)
ON CONFLICT (id) DO NOTHING;

-- Professional Template
INSERT INTO receipt_templates (name, type, description, default_settings, is_active, is_default, sort_order) VALUES
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
)
ON CONFLICT (id) DO NOTHING;

-- Premium Template
INSERT INTO receipt_templates (name, type, description, default_settings, is_active, is_default, sort_order) VALUES
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
)
ON CONFLICT (id) DO NOTHING;

-- Display inserted templates
SELECT id, name, type, is_default, sort_order 
FROM receipt_templates 
ORDER BY sort_order;
