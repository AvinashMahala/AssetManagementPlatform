-- Rent Transaction Meter Readings Junction Table
-- Links meter readings to rent transactions for utility billing tracking

CREATE TABLE IF NOT EXISTS rent_transaction_meter_readings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Foreign Keys
    transaction_id UUID NOT NULL REFERENCES rent_transactions(id) ON DELETE CASCADE,
    meter_id UUID NOT NULL REFERENCES meters(id) ON DELETE RESTRICT,
    meter_reading_id UUID REFERENCES meter_readings(id) ON DELETE SET NULL,
    
    -- Meter details (snapshot at transaction time)
    meter_name VARCHAR(100) NOT NULL,
    meter_type VARCHAR(50) NOT NULL,
    meter_number VARCHAR(100),
    
    -- Reading Snapshot (captured at transaction time)
    previous_reading DECIMAL(10, 2) NOT NULL CHECK (previous_reading >= 0),
    current_reading DECIMAL(10, 2) NOT NULL CHECK (current_reading >= 0),
    units_consumed DECIMAL(10, 2) NOT NULL CHECK (units_consumed >= 0),
    
    -- Cost Details
    cost_per_unit DECIMAL(10, 4) NOT NULL CHECK (cost_per_unit >= 0),
    fixed_charge DECIMAL(10, 2) DEFAULT 0 CHECK (fixed_charge >= 0),
    total_cost DECIMAL(10, 2) NOT NULL CHECK (total_cost >= 0),
    
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

-- Comments
COMMENT ON TABLE rent_transaction_meter_readings IS 'Junction table linking meter readings to rent transactions for utility billing';
COMMENT ON COLUMN rent_transaction_meter_readings.transaction_id IS 'Reference to the rent transaction';
COMMENT ON COLUMN rent_transaction_meter_readings.meter_id IS 'Reference to the meter';
COMMENT ON COLUMN rent_transaction_meter_readings.meter_reading_id IS 'Optional reference to the actual meter reading record';
COMMENT ON COLUMN rent_transaction_meter_readings.meter_name IS 'Name of the meter at time of transaction';
COMMENT ON COLUMN rent_transaction_meter_readings.meter_type IS 'Type of meter (electricity, water, gas) at time of transaction';
COMMENT ON COLUMN rent_transaction_meter_readings.meter_number IS 'Meter number at time of transaction';
COMMENT ON COLUMN rent_transaction_meter_readings.previous_reading IS 'Previous meter reading value (snapshot)';
COMMENT ON COLUMN rent_transaction_meter_readings.current_reading IS 'Current meter reading value (snapshot)';
COMMENT ON COLUMN rent_transaction_meter_readings.units_consumed IS 'Calculated units consumed (current - previous)';
COMMENT ON COLUMN rent_transaction_meter_readings.cost_per_unit IS 'Cost per unit at time of transaction';
COMMENT ON COLUMN rent_transaction_meter_readings.fixed_charge IS 'Fixed charge applied (e.g., maintenance fee)';
COMMENT ON COLUMN rent_transaction_meter_readings.total_cost IS 'Total cost for this meter reading';
COMMENT ON COLUMN rent_transaction_meter_readings.reading_date IS 'Date and time when the reading was taken';
