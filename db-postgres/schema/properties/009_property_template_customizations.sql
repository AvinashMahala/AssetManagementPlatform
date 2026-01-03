-- MOVED: original file: ../009_property_template_customizations.sql
-- Location: schema/properties/009_property_template_customizations.sql

-- Property template customizations table
CREATE TABLE IF NOT EXISTS property_template_customizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    template_id UUID NOT NULL REFERENCES receipt_templates(id) ON DELETE CASCADE,
    custom_styles JSONB,
    custom_logo_url VARCHAR(500),
    custom_header TEXT,
    custom_footer TEXT,
    show_qr_code BOOLEAN DEFAULT FALSE,
    qr_code_data JSONB,
    qr_code_position VARCHAR(50) DEFAULT 'bottom-right',
    qr_code_size INTEGER DEFAULT 100,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(property_id, template_id)
);