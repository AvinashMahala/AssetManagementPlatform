-- MOVED: original file: ../007_receipt_templates.sql
-- Location: schema/properties/007_receipt_templates.sql

-- Receipt templates table for customizable receipt designs
CREATE TABLE IF NOT EXISTS receipt_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('basic', 'professional', 'premium')),
    description TEXT,
    default_settings JSONB NOT NULL,
    template_html TEXT,
    template_css JSONB,
    layout_config JSONB,
    placeholders JSONB,
    preview_image_url VARCHAR(500),
    is_active BOOLEAN NOT NULL DEFAULT true,
    is_default BOOLEAN NOT NULL DEFAULT false,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_receipt_templates_type ON receipt_templates(type);
CREATE INDEX IF NOT EXISTS idx_receipt_templates_is_active ON receipt_templates(is_active);
CREATE INDEX IF NOT EXISTS idx_receipt_templates_is_default ON receipt_templates(is_default);
CREATE INDEX IF NOT EXISTS idx_receipt_templates_sort_order ON receipt_templates(sort_order);