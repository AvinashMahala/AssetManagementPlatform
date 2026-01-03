-- MOVED: original file: ../016_rent_transactions.sql
-- Location: schema/billing/016_rent_transactions.sql

-- Rent transactions table for comprehensive rent collection system
CREATE TABLE IF NOT EXISTS rent_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lease_id UUID NOT NULL REFERENCES leases(id) ON DELETE CASCADE,
    unit_id UUID REFERENCES units(id),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    property_id UUID NOT NULL REFERENCES properties(id),

    -- Billing period
    billing_period_start DATE NOT NULL,
    billing_period_end DATE NOT NULL,
    billing_method VARCHAR(20) NOT NULL DEFAULT 'relative' CHECK (billing_method IN ('relative', 'fixed')),
    days_count INTEGER NOT NULL,

    -- Amounts
    base_rent DECIMAL(12,2) NOT NULL DEFAULT 0,
    maintenance_charges DECIMAL(12,2) NOT NULL DEFAULT 0,
    previous_balance DECIMAL(12,2) NOT NULL DEFAULT 0,
    total_meter_charges DECIMAL(12,2) NOT NULL DEFAULT 0,
    total_expenses DECIMAL(12,2) NOT NULL DEFAULT 0,
    expenses JSONB NOT NULL DEFAULT '[]'::jsonb,
    total_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
    amount_paid DECIMAL(12,2) NOT NULL DEFAULT 0,
    new_balance DECIMAL(12,2) NOT NULL DEFAULT 0,
    
    -- Payment details
    payments JSONB NOT NULL DEFAULT '[]'::jsonb,
    paid_date DATE,
    status VARCHAR(20) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'finalized', 'paid', 'cancelled')),
    payment_method VARCHAR(50),
    transaction_id VARCHAR(255),
    payment_reference VARCHAR(255),
    late_fee DECIMAL(10,2) DEFAULT 0,
    penalty_amount DECIMAL(10,2) DEFAULT 0,

    -- Receipt and invoice
    receipt_number VARCHAR(100),
    receipt_generated BOOLEAN NOT NULL DEFAULT FALSE,
    invoice_number VARCHAR(100),
    invoice_date DATE,
    invoice_pdf_url VARCHAR(500),

    -- Workflow tracking fields
    workflow_status VARCHAR(30) NOT NULL DEFAULT 'invoice_pending'
        CHECK (workflow_status IN ('invoice_pending', 'invoice_generated', 'notification_sent', 'payment_pending', 'payment_partial', 'payment_completed', 'receipt_generated', 'workflow_completed')),
    invoice_generated BOOLEAN NOT NULL DEFAULT FALSE,
    invoice_sent_date TIMESTAMP,
    notification_sent BOOLEAN NOT NULL DEFAULT FALSE,
    notification_sent_date TIMESTAMP,
    notification_method VARCHAR(20) CHECK (notification_method IN ('email', 'sms', 'manual')),
    last_payment_date TIMESTAMP,
    receipt_sent BOOLEAN NOT NULL DEFAULT FALSE,
    receipt_sent_date TIMESTAMP,
    workflow_completed_date TIMESTAMP,

    -- Notes and tracking
    notes TEXT,
    created_by UUID NOT NULL REFERENCES users(id),
    updated_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_rent_transactions_lease_id ON rent_transactions(lease_id);
CREATE INDEX IF NOT EXISTS idx_rent_transactions_unit_id ON rent_transactions(unit_id);
CREATE INDEX IF NOT EXISTS idx_rent_transactions_tenant_id ON rent_transactions(tenant_id);
CREATE INDEX IF NOT EXISTS idx_rent_transactions_property_id ON rent_transactions(property_id);
CREATE INDEX IF NOT EXISTS idx_rent_transactions_billing_period ON rent_transactions(billing_period_start, billing_period_end);
CREATE INDEX IF NOT EXISTS idx_rent_transactions_status ON rent_transactions(status);