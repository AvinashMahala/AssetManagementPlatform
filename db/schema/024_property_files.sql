-- Property files table for photos and documents
CREATE TABLE IF NOT EXISTS property_files (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    file_name VARCHAR(255) NOT NULL,
    file_url TEXT NOT NULL,
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