-- Rent transactions table for comprehensive rent collection system
-- This table handles monthly billing periods, expenses, balances, and receipts
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
CREATE INDEX IF NOT EXISTS idx_rent_transactions_paid_date ON rent_transactions(paid_date);
CREATE INDEX IF NOT EXISTS idx_rent_transactions_invoice_number ON rent_transactions(invoice_number);
CREATE INDEX IF NOT EXISTS idx_rent_transactions_receipt_number ON rent_transactions(receipt_number);
CREATE INDEX IF NOT EXISTS idx_rent_transactions_created_at ON rent_transactions(created_at);

-- Add comments for documentation
COMMENT ON TABLE rent_transactions IS 'Comprehensive rent collection transactions with billing periods, expenses, and balances';
COMMENT ON COLUMN rent_transactions.billing_method IS 'relative: date-to-date billing, fixed: 1st of month billing';
COMMENT ON COLUMN rent_transactions.expenses IS 'JSON array of expense line items with type, description, and amount';
COMMENT ON COLUMN rent_transactions.payments IS 'JSON array of payment records with date, amount, method';
COMMENT ON COLUMN rent_transactions.previous_balance IS 'Balance carried forward from previous billing period (can be negative for advances)';
COMMENT ON COLUMN rent_transactions.new_balance IS 'Outstanding balance after payment (can be negative for overpayments)';
COMMENT ON COLUMN rent_transactions.total_meter_charges IS 'Total utility/meter charges for this billing period';
COMMENT ON COLUMN rent_transactions.total_expenses IS 'Total additional expenses for this billing period';
