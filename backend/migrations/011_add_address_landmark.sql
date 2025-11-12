-- Migration: Add address_landmark column to properties table
-- This migration adds the missing address_landmark column to the properties table

-- Add address_landmark column to properties table
ALTER TABLE properties ADD COLUMN IF NOT EXISTS address_landmark VARCHAR(255);

-- Add comment for documentation
COMMENT ON COLUMN properties.address_landmark IS 'Landmark or nearby location reference for the property address';