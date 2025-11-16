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

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_receipt_templates_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_receipt_templates_updated_at ON receipt_templates;
CREATE TRIGGER trigger_update_receipt_templates_updated_at
    BEFORE UPDATE ON receipt_templates
    FOR EACH ROW
    EXECUTE FUNCTION update_receipt_templates_updated_at();

-- Add comments for documentation
COMMENT ON TABLE receipt_templates IS 'Predefined receipt templates with customizable settings';
COMMENT ON COLUMN receipt_templates.default_settings IS 'JSON configuration for theme, layout, content, payment options, and numbering';
