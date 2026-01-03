-- MOVED: original file: ../019_meter_readings.sql
-- Location: schema/utilities/019_meter_readings.sql

-- Meter readings table
CREATE TABLE IF NOT EXISTS meter_readings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    meter_id UUID NOT NULL REFERENCES meters(id),
    reading_value NUMERIC(14,6) NOT NULL,
    reading_date TIMESTAMP NOT NULL,
    reading_type VARCHAR(20) DEFAULT 'actual' CHECK (reading_type IN ('actual', 'estimated', 'corrected')),
    units_consumed NUMERIC(14,6),
    total_cost NUMERIC(12,4),
    recorded_by UUID REFERENCES users(id),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT ux_meter_readings_unique_meter_date UNIQUE (meter_id, reading_date)
);

-- Indexes for performance
CREATE UNIQUE INDEX IF NOT EXISTS ux_meter_readings_meter_date ON meter_readings(meter_id, reading_date);
CREATE INDEX IF NOT EXISTS idx_meter_readings_meter_date_desc ON meter_readings(meter_id, reading_date DESC);