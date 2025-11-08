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
CREATE INDEX IF NOT EXISTS idx_receipts_created_at ON receipts(created_at);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_receipts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_receipts_updated_at
    BEFORE UPDATE ON receipts
    FOR EACH ROW
    EXECUTE FUNCTION update_receipts_updated_at();

-- Add comments for documentation
COMMENT ON TABLE receipts IS 'Stores generated receipt records with PDF links and metadata';
COMMENT ON COLUMN receipts.receipt_data IS 'JSON data used to generate the receipt PDF';
COMMENT ON COLUMN receipts.pdf_url IS 'Path to the generated PDF file';
COMMENT ON COLUMN receipts.file_size IS 'Size of the PDF file in bytes';
