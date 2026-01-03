-- MOVED: original file: ../015_rent_payments.sql
-- Location: schema/billing/015_rent_payments.sql

-- Rent payments table
CREATE TABLE IF NOT EXISTS rent_payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lease_id UUID NOT NULL REFERENCES leases(id),
    property_id UUID NOT NULL REFERENCES properties(id),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    amount NUMERIC(10, 2) NOT NULL,
    due_date DATE NOT NULL,
    paid_date DATE,
    payment_method VARCHAR(50),
    transaction_reference VARCHAR(255),
    status VARCHAR(50) DEFAULT 'pending',
    late_fee NUMERIC(10, 2) DEFAULT 0,
    penalty_amount NUMERIC(10, 2) DEFAULT 0,
    rent_amount NUMERIC(10, 2),
    maintenance_charges NUMERIC(10, 2) DEFAULT 0,
    other_charges NUMERIC(10, 2) DEFAULT 0,
    notes TEXT,
    created_by UUID REFERENCES users(id),
    updated_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index
CREATE INDEX IF NOT EXISTS idx_rent_payments_lease_id ON rent_payments(lease_id);
CREATE INDEX IF NOT EXISTS idx_rent_payments_tenant_id ON rent_payments(tenant_id);
CREATE INDEX IF NOT EXISTS idx_rent_payments_property_id ON rent_payments(property_id);
CREATE INDEX IF NOT EXISTS idx_rent_payments_status ON rent_payments(status);
CREATE INDEX IF NOT EXISTS idx_rent_payments_due_date ON rent_payments(due_date);
CREATE INDEX IF NOT EXISTS idx_rent_payments_paid_date ON rent_payments(paid_date);