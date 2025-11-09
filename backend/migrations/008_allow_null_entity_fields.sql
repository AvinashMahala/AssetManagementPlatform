-- Migration: Allow NULL values for entity_type, entity_id, and uploaded_by in file_metadata table
-- This enables general file uploads that are not associated with specific entities

-- Allow NULL values for entity_type and entity_id (for general uploads)
ALTER TABLE file_metadata ALTER COLUMN entity_type DROP NOT NULL;
ALTER TABLE file_metadata ALTER COLUMN entity_id DROP NOT NULL;

-- Allow NULL values for uploaded_by (for anonymous uploads or system uploads)
ALTER TABLE file_metadata ALTER COLUMN uploaded_by DROP NOT NULL;

-- Update the comment to reflect the changes
COMMENT ON COLUMN file_metadata.entity_type IS 'Entity type: property, unit, tenant, general (nullable for general files)';
COMMENT ON COLUMN file_metadata.entity_id IS 'Entity ID (nullable for general files)';
COMMENT ON COLUMN file_metadata.uploaded_by IS 'User who uploaded the file (nullable for anonymous uploads)';