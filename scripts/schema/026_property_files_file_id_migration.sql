-- Migration to update property_files table to use file_id instead of file_url
-- This aligns with the FileStorageService integration

-- Rename the column from file_url to file_id
-- Idempotent rename: only if file_url exists and file_id does not exist
DO $$
BEGIN
	IF EXISTS(
		SELECT 1 FROM information_schema.columns 
		WHERE table_name='property_files' AND column_name='file_url'
	) AND NOT EXISTS(
		SELECT 1 FROM information_schema.columns 
		WHERE table_name='property_files' AND column_name='file_id'
	) THEN
		ALTER TABLE property_files RENAME COLUMN file_url TO file_id;
	END IF;
END;
$$ LANGUAGE plpgsql;

-- Update the comment to reflect the change
-- COMMENT: Add a comment only if file_id column exists
DO $$
BEGIN
	IF EXISTS(
		SELECT 1 FROM information_schema.columns 
		WHERE table_name='property_files' AND column_name='file_id'
	) THEN
		COMMENT ON COLUMN property_files.file_id IS 'Reference to file ID in FileStorageService';
		-- If file_id exists but is not UUID, attempt to cast values and convert the column safely
		IF (SELECT data_type FROM information_schema.columns
				WHERE table_name='property_files' AND column_name='file_id') <> 'uuid' THEN
			-- Create a temporary uuid column if it doesn't exist
			ALTER TABLE property_files ADD COLUMN IF NOT EXISTS file_id_tmp UUID;
			-- Try to populate the temporary column by casting only values that are valid UUIDs
			UPDATE property_files
			SET file_id_tmp = (CASE WHEN file_id ~ '^[0-9a-fA-F\\-]{36}$' THEN file_id::uuid ELSE NULL END);
			-- Drop the old column and rename temporary column
			ALTER TABLE property_files DROP COLUMN IF EXISTS file_id;
			ALTER TABLE property_files RENAME COLUMN file_id_tmp TO file_id;
		END IF;
		-- Add FK to file_metadata if not added already
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