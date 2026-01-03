-- MOVED: original file: ../020_rent_transaction_meter_readings.sql
-- Location: schema/utilities/020_rent_transaction_meter_readings.sql

-- Rent Transaction Meter Readings Junction Table
-- Links meter readings to rent transactions for utility billing tracking

CREATE TABLE IF NOT EXISTS rent_transaction_meter_readings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Foreign Keys
    transaction_id UUID NOT NULL REFERENCES rent_transactions(id) ON DELETE CASCADE,
    meter_id UUID NOT NULL REFERENCES meters(id) ON DELETE RESTRICT,
    meter_reading_id UUID REFERENCES meter_readings(id) ON DELETE SET NULL,
    subscription_id UUID REFERENCES utility_subscriptions(id) ON DELETE SET NULL,

    -- Meter details (snapshot at transaction time)
    meter_name VARCHAR(255) NOT NULL,
    meter_type VARCHAR(50) NOT NULL,
    meter_number VARCHAR(100),
    
    -- Reading Snapshot (captured at transaction time)
    previous_reading NUMERIC(14,6) NOT NULL CHECK (previous_reading >= 0),
    current_reading NUMERIC(14,6) NOT NULL CHECK (current_reading >= 0),
    units_consumed NUMERIC(14,6) NOT NULL CHECK (units_consumed >= 0),
    
    -- Cost Details
    cost_per_unit NUMERIC(14,6) NOT NULL CHECK (cost_per_unit >= 0),
    fixed_charge NUMERIC(12,2) DEFAULT 0 CHECK (fixed_charge >= 0),
    total_cost NUMERIC(12,2) NOT NULL CHECK (total_cost >= 0),
    
    -- Reading timestamp
    reading_date TIMESTAMP NOT NULL,
    
    -- Metadata
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    CONSTRAINT chk_current_greater_than_previous CHECK (current_reading >= previous_reading)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_transaction_meter_readings_transaction_id 
    ON rent_transaction_meter_readings(transaction_id);
    
CREATE INDEX IF NOT EXISTS idx_transaction_meter_readings_meter_id 
    ON rent_transaction_meter_readings(meter_id);
    
CREATE INDEX IF NOT EXISTS idx_transaction_meter_readings_meter_reading_id 
    ON rent_transaction_meter_readings(meter_reading_id);

CREATE INDEX IF NOT EXISTS idx_transaction_meter_readings_reading_date
    ON rent_transaction_meter_readings(reading_date);