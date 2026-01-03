-- MOVED: original file: ../017_receipts.sql
-- Location: schema/billing/017_receipts.sql

-- Receipts table for tracking generated receipts
CREATE TABLE IF NOT EXISTS receipts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    receipt_number VARCHAR(100) NOT NULL UNIQUE,
    property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    rent_transaction_id UUID REFERENCES rent_transactions(id) ON DELETE SET NULL,
    tenant_id UUID REFERENCES tenants(id) ON DELETE SET NULL,
    receipt_date DATE NOT NULL,
    amount DECIMAL(12,2) NOT NULL,
    description TEXT,
    receipt_data JSONB NOT NULL,
    pdf_url VARCHAR(500),
    file_size BIGINT,
    status VARCHAR(20) NOT NULL DEFAULT 'generated' CHECK (status IN ('generated', 'sent', 'downloaded')),
    generated_by UUID NOT NULL REFERENCES users(id),
    sent_to VARCHAR(255),
    sent_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_receipts_property_id ON receipts(property_id);
CREATE INDEX IF NOT EXISTS idx_receipts_rent_transaction_id ON receipts(rent_transaction_id);
CREATE INDEX IF NOT EXISTS idx_receipts_tenant_id ON receipts(tenant_id);
CREATE INDEX IF NOT EXISTS idx_receipts_receipt_number ON receipts(receipt_number);
CREATE INDEX IF NOT EXISTS idx_receipts_status ON receipts(status);
CREATE INDEX IF NOT EXISTS idx_receipts_receipt_date ON receipts(receipt_date);