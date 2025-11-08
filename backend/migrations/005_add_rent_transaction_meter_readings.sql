-- Migration: Add rent_transaction_meter_readings junction table
-- Description: Links meter readings to rent transactions for billing purposes
-- Author: System
-- Date: 2024-11-08

-- Create junction table for linking meter readings to transactions
CREATE TABLE IF NOT EXISTS rent_transaction_meter_readings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id UUID NOT NULL REFERENCES rent_transactions(id) ON DELETE CASCADE,
  meter_id UUID NOT NULL REFERENCES meters(id) ON DELETE RESTRICT,
  meter_reading_id UUID REFERENCES meter_readings(id) ON DELETE SET NULL,
  
  -- Reading details (snapshot at time of transaction)
  previous_reading DECIMAL(10, 2) NOT NULL,
  current_reading DECIMAL(10, 2) NOT NULL,
  units_consumed DECIMAL(10, 2) NOT NULL,
  cost_per_unit DECIMAL(10, 4) NOT NULL,
  fixed_charge DECIMAL(10, 2) DEFAULT 0,
  total_cost DECIMAL(10, 2) NOT NULL,
  
  -- Metadata
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- Constraints
  CONSTRAINT chk_current_greater_than_previous CHECK (current_reading >= previous_reading),
  CONSTRAINT chk_positive_units CHECK (units_consumed >= 0),
  CONSTRAINT chk_positive_cost CHECK (total_cost >= 0)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_transaction_meter_readings_transaction_id 
  ON rent_transaction_meter_readings(transaction_id);

CREATE INDEX IF NOT EXISTS idx_transaction_meter_readings_meter_id 
  ON rent_transaction_meter_readings(meter_id);

CREATE INDEX IF NOT EXISTS idx_transaction_meter_readings_meter_reading_id 
  ON rent_transaction_meter_readings(meter_reading_id);

-- Add comment to table
COMMENT ON TABLE rent_transaction_meter_readings IS 'Junction table linking meter readings to rent transactions for utility billing';

-- Add comments to columns
COMMENT ON COLUMN rent_transaction_meter_readings.transaction_id IS 'Reference to the rent transaction';
COMMENT ON COLUMN rent_transaction_meter_readings.meter_id IS 'Reference to the meter being read';
COMMENT ON COLUMN rent_transaction_meter_readings.meter_reading_id IS 'Reference to the actual meter reading record (optional)';
COMMENT ON COLUMN rent_transaction_meter_readings.previous_reading IS 'Previous meter reading value';
COMMENT ON COLUMN rent_transaction_meter_readings.current_reading IS 'Current meter reading value';
COMMENT ON COLUMN rent_transaction_meter_readings.units_consumed IS 'Units consumed (current - previous)';
COMMENT ON COLUMN rent_transaction_meter_readings.cost_per_unit IS 'Cost per unit at time of transaction';
COMMENT ON COLUMN rent_transaction_meter_readings.fixed_charge IS 'Fixed monthly charge for the meter';
COMMENT ON COLUMN rent_transaction_meter_readings.total_cost IS 'Total cost for this meter ((units * cost_per_unit) + fixed_charge)';
