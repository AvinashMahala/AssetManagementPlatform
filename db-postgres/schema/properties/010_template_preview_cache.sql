-- MOVED: original file: ../010_template_preview_cache.sql
-- Location: schema/properties/010_template_preview_cache.sql

-- Template preview cache table
CREATE TABLE IF NOT EXISTS template_preview_cache (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    template_id UUID REFERENCES receipt_templates(id) ON DELETE CASCADE,
    property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
    sample_data JSONB NOT NULL,
    preview_html TEXT,
    preview_pdf_url VARCHAR(500),
    preview_expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);