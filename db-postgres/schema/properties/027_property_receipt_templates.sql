-- MOVED: original file: ../027_property_receipt_templates.sql
-- Location: schema/properties/027_property_receipt_templates.sql

-- Property specific receipt templates table
CREATE TABLE IF NOT EXISTS property_receipt_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    template_id UUID NOT NULL REFERENCES receipt_templates(id) ON DELETE CASCADE,
    overrides JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);