-- Receipts table
CREATE TABLE IF NOT EXISTS receipts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    receipt_number VARCHAR(100) NOT NULL UNIQUE,
    property_id UUID NOT NULL REFERENCES properties(id),
    rent_transaction_id UUID REFERENCES rent_transactions(id),
    tenant_id UUID REFERENCES tenants(id),
    receipt_date TIMESTAMP NOT NULL,
    amount DECIMAL(12,2) NOT NULL,
    description TEXT NOT NULL,
    receipt_data JSONB NOT NULL,
    pdf_url TEXT,
    file_size INTEGER,
    status VARCHAR(50) DEFAULT 'generated',
    generated_by UUID NOT NULL REFERENCES users(id),
    sent_to VARCHAR(255),
    sent_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
