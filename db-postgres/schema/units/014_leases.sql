-- MOVED: original file: ../014_leases.sql
-- Location: schema/units/014_leases.sql

-- Leases table
CREATE TABLE IF NOT EXISTS leases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID NOT NULL REFERENCES properties(id),
    unit_id UUID NOT NULL REFERENCES units(id),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    monthly_rent NUMERIC(10, 2) NOT NULL,
    security_deposit NUMERIC(10, 2),
    late_fee_amount NUMERIC(10, 2),
    grace_period_days INTEGER DEFAULT 3,
    payment_due_day INTEGER DEFAULT 1,
    terms_conditions TEXT,
    special_clauses TEXT,
    status VARCHAR(50) DEFAULT 'draft',
    notice_period_days INTEGER,
    auto_renewal BOOLEAN DEFAULT FALSE,
    maintenance_charges NUMERIC(10, 2),
    payment_frequency VARCHAR(20) DEFAULT 'monthly',
    rent_due_day INTEGER DEFAULT 1,
    electricity_charges NUMERIC(10, 2),
    water_charges NUMERIC(10, 2),
    other_charges NUMERIC(10, 2),
    pets_allowed BOOLEAN DEFAULT FALSE,
    smoking_allowed BOOLEAN DEFAULT FALSE,
    subletting_allowed BOOLEAN DEFAULT FALSE,
    special_conditions TEXT,
    signed_at TIMESTAMP,
    terminated_at TIMESTAMP,
    termination_reason TEXT,
    lease_document_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index
CREATE INDEX IF NOT EXISTS idx_leases_property_id ON leases(property_id);