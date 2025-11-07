-- Migration: Make permanent address fields nullable in tenants table
-- Date: 2025-11-06
-- Description: The permanent address should be optional, but was incorrectly marked as NOT NULL

ALTER TABLE tenants
ALTER COLUMN permanent_address_street DROP NOT NULL,
ALTER COLUMN permanent_address_city DROP NOT NULL,
ALTER COLUMN permanent_address_state DROP NOT NULL,
ALTER COLUMN permanent_address_pincode DROP NOT NULL;