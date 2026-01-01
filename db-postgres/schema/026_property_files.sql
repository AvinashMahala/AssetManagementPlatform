-- Property files table for photos and documents
CREATE TABLE IF NOT EXISTS property_files (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    file_name VARCHAR(255) NOT NULL,
    file_id UUID NULL,
    file_type VARCHAR(20) NOT NULL CHECK (file_type IN ('photo', 'document')),
    description TEXT,
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_property_files_property_id ON property_files(property_id);
CREATE INDEX IF NOT EXISTS idx_property_files_file_type ON property_files(file_type);

-- Add comments for documentation
COMMENT ON TABLE property_files IS 'Stores photos and documents uploaded for properties';
COMMENT ON COLUMN property_files.file_type IS 'Type of file: photo or document';
COMMENT ON COLUMN property_files.file_id IS 'Reference to file ID in FileStorageService';

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_property_files_updated_at ON property_files;
CREATE TRIGGER update_property_files_updated_at
    BEFORE UPDATE ON property_files
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add FK to file_metadata if file_id column exists and FK not already added (idempotent)
DO $$
BEGIN
    IF EXISTS(
        SELECT 1 FROM information_schema.columns 
        WHERE table_name='property_files' AND column_name='file_id'
    ) THEN
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.table_constraints tc
            JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
            WHERE tc.table_name='property_files' AND tc.constraint_type = 'FOREIGN KEY' AND kcu.column_name='file_id'
        ) THEN
            ALTER TABLE property_files ADD CONSTRAINT fk_property_files_file_id FOREIGN KEY (file_id) REFERENCES file_metadata(id) ON DELETE SET NULL;
        END IF;
    END IF;
END;
$$ LANGUAGE plpgsql;