-- File metadata and related tables for comprehensive file storage system
-- This includes metadata, content chunks, and access logging

-- File metadata table
CREATE TABLE IF NOT EXISTS file_metadata (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_type VARCHAR(50), -- 'property', 'unit', 'tenant', 'general' (nullable for general files)
    entity_id UUID, -- Foreign key to main database (nullable for general files)
    filename VARCHAR(255) NOT NULL,
    original_name VARCHAR(255) NOT NULL,
    file_size BIGINT NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    file_hash VARCHAR(128), -- SHA-256 for integrity
    category VARCHAR(50), -- 'photo', 'document', 'contract', 'receipt', 'general'
    tags TEXT[], -- Array of tags for searching
    uploaded_by UUID,
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_accessed TIMESTAMP WITH TIME ZONE,
    is_deleted BOOLEAN DEFAULT FALSE,
    deleted_at TIMESTAMP WITH TIME ZONE,
    version INTEGER DEFAULT 1,
    parent_file_id UUID -- For file versioning
);

-- File content table (for chunked storage)
CREATE TABLE IF NOT EXISTS file_content (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    metadata_id UUID NOT NULL REFERENCES file_metadata(id) ON DELETE CASCADE,
    chunk_number INTEGER NOT NULL DEFAULT 0, -- For large file chunking
    chunk_data BYTEA NOT NULL,
    chunk_size INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- File access log table (audit trail)
CREATE TABLE IF NOT EXISTS file_access_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    file_id UUID NOT NULL REFERENCES file_metadata(id),
    user_id UUID NOT NULL,
    access_type VARCHAR(20) NOT NULL, -- 'view', 'download', 'upload', 'delete'
    ip_address INET,
    user_agent TEXT,
    accessed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_file_metadata_entity ON file_metadata(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_file_metadata_category ON file_metadata(category);
CREATE INDEX IF NOT EXISTS idx_file_metadata_uploaded_by ON file_metadata(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_file_metadata_hash ON file_metadata(file_hash);
CREATE INDEX IF NOT EXISTS idx_file_content_metadata ON file_content(metadata_id, chunk_number);
CREATE INDEX IF NOT EXISTS idx_file_access_log_file_id ON file_access_log(file_id);

-- Add comments for documentation
COMMENT ON TABLE file_metadata IS 'Stores metadata for all uploaded files';
COMMENT ON TABLE file_content IS 'Stores actual file content in chunks';
COMMENT ON TABLE file_access_log IS 'Audit log for file access operations';
COMMENT ON COLUMN file_metadata.entity_type IS 'Entity type: property, unit, tenant, general (nullable for general files)';
COMMENT ON COLUMN file_metadata.entity_id IS 'Entity ID (nullable for general files)';
COMMENT ON COLUMN file_metadata.uploaded_by IS 'User who uploaded the file (nullable for anonymous uploads)';