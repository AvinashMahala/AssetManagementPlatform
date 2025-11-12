-- Migration to add CASCADE DELETE for tenant foreign key constraints
-- This allows tenants to be deleted even if they have related records

-- Update leases table foreign key constraint
ALTER TABLE leases
DROP CONSTRAINT leases_tenant_id_fkey,
ADD CONSTRAINT leases_tenant_id_fkey
FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE;

-- Update rent_payments table foreign key constraint
ALTER TABLE rent_payments
DROP CONSTRAINT rent_payments_tenant_id_fkey,
ADD CONSTRAINT rent_payments_tenant_id_fkey
FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE;

-- Note: unit_tenants table already has ON DELETE CASCADE, so no change needed