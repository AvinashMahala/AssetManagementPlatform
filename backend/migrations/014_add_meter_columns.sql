-- Migration: Add missing columns to meters table
-- Description: Adds meter_name, cost_per_unit, fixed_charge, remarks, and is_active columns to meters table
-- Author: System
-- Date: 2025-11-12

-- Add missing columns to meters table
ALTER TABLE meters
ADD COLUMN IF NOT EXISTS meter_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS cost_per_unit DECIMAL(10, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS fixed_charge DECIMAL(10, 2),
ADD COLUMN IF NOT EXISTS remarks TEXT,
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;

-- Add comments for documentation
COMMENT ON COLUMN meters.meter_name IS 'Display name for the meter';
COMMENT ON COLUMN meters.cost_per_unit IS 'Cost per unit for meter-based billing';
COMMENT ON COLUMN meters.fixed_charge IS 'Fixed monthly charge for the meter';
COMMENT ON COLUMN meters.remarks IS 'Additional remarks or notes about the meter';
COMMENT ON COLUMN meters.is_active IS 'Whether the meter is active and in use';