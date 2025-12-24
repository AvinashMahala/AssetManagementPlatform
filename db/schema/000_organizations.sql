-- Organizations table for Multi-Tenancy
CREATE TABLE IF NOT EXISTS organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    db_name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_organizations_slug ON organizations(slug);

-- Comments
COMMENT ON TABLE organizations IS 'Master table for multi-tenant organizations';
COMMENT ON COLUMN organizations.slug IS 'Unique identifier for URL routing or API headers';
COMMENT ON COLUMN organizations.db_name IS 'Name of the dedicated database for this organization';
