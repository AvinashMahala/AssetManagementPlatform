-- Meter readings table
CREATE TABLE IF NOT EXISTS meter_readings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    meter_id UUID NOT NULL REFERENCES meters(id),
    previous_reading NUMERIC(10, 2) DEFAULT 0,
    current_reading NUMERIC(10, 2) NOT NULL,
    reading_date DATE NOT NULL,
    recorded_by UUID REFERENCES users(id),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
