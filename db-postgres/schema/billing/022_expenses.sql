-- MOVED: original file: ../022_expenses.sql
-- Location: schema/billing/022_expenses.sql

-- Create expenses table
CREATE TABLE IF NOT EXISTS expenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID NOT NULL REFERENCES properties(id),
    unit_id UUID REFERENCES units(id),
    type VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    amount DECIMAL(12,2) NOT NULL,
    frequency VARCHAR(50) DEFAULT 'one_time',
    start_date DATE NOT NULL,
    end_date DATE,
    distribution VARCHAR(50) DEFAULT 'owner_only',
    affected_unit_ids JSONB,
    bill_photo_url TEXT,
    status VARCHAR(50) DEFAULT 'active',
    is_active BOOLEAN DEFAULT true,
    created_by UUID NOT NULL REFERENCES users(id),
    updated_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for expenses table
CREATE INDEX IF NOT EXISTS idx_expenses_property_id ON expenses(property_id);
CREATE INDEX IF NOT EXISTS idx_expenses_unit_id ON expenses(unit_id);
CREATE INDEX IF NOT EXISTS idx_expenses_type ON expenses(type);
CREATE INDEX IF NOT EXISTS idx_expenses_status ON expenses(status);
CREATE INDEX IF NOT EXISTS idx_expenses_start_date ON expenses(start_date);
CREATE INDEX IF NOT EXISTS idx_expenses_is_active ON expenses(is_active);