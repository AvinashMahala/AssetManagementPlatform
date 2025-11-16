-- Migration to update property_files table to use file_id instead of file_url
-- This aligns with the FileStorageService integration

-- Rename the column from file_url to file_id
ALTER TABLE property_files RENAME COLUMN file_url TO file_id;

-- Update the comment to reflect the change
COMMENT ON COLUMN property_files.file_id IS 'Reference to file ID in FileStorageService';