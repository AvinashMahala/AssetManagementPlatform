-- Meter readings table
-- Location: schema/utilities/019_meter_readings.sql

CREATE TABLE IF NOT EXISTS meter_readings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    meter_id UUID NOT NULL REFERENCES meters(id) ON DELETE CASCADE,

    -- Recorded values
    previous_reading NUMERIC(14,6) DEFAULT 0 CHECK (previous_reading >= 0),
    current_reading NUMERIC(14,6) NOT NULL CHECK (current_reading >= 0),

    -- Derived value: stored for convenience and querying (Postgres 12+)
    units_consumed NUMERIC(14,6) GENERATED ALWAYS AS (current_reading - COALESCE(previous_reading, 0)) STORED,

    -- Optional cost snapshot - not required by EF model but useful for persistence
    total_cost NUMERIC(12,2) CHECK (total_cost >= 0),

    reading_date TIMESTAMP NOT NULL,
    recorded_by UUID REFERENCES users(id),
    notes TEXT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT chk_current_greater_or_equal CHECK (current_reading >= COALESCE(previous_reading, 0))
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_meter_readings_meter_id_reading_date ON meter_readings(meter_id, reading_date);

-- Prevent duplicate readings at the exact same timestamp for the same meter
CREATE UNIQUE INDEX IF NOT EXISTS ux_meter_readings_meter_id_reading_date ON meter_readings(meter_id, reading_date);

COMMENT ON TABLE meter_readings IS 'Meter reading snapshots (previous/current readings). Units consumed is a generated column (current - previous).';