-- Migration: Add co_owners column to properties table
-- This migration adds the missing co_owners column to the properties table

-- Add co_owners column to properties table
ALTER TABLE properties ADD COLUMN IF NOT EXISTS co_owners JSONB DEFAULT '[]'::jsonb;

-- Add comment for documentation
COMMENT ON COLUMN properties.co_owners IS 'Array of co-owner user IDs';