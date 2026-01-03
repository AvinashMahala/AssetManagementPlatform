-- MOVED: original file: ../039_meter_allocations.sql
-- Location: schema/utilities/039_meter_allocations.sql

-- Meter allocations: link meters to utility subscriptions (supports shared meters & apportioned splits)
CREATE TABLE IF NOT EXISTS meter_allocations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    meter_id UUID NOT NULL REFERENCES meters(id) ON DELETE CASCADE,
    subscription_id UUID NOT NULL REFERENCES utility_subscriptions(id) ON DELETE CASCADE,
    allocation_fraction NUMERIC(8,6) NOT NULL DEFAULT 1.0 CHECK (allocation_fraction >= 0 AND allocation_fraction <= 1),
    allocation_rule JSONB DEFAULT '{}'::jsonb, -- optional rules (e.g., area-based, occupancy-based)
    effective_from DATE DEFAULT CURRENT_DATE,
    effective_to DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_meter_allocations_meter_id ON meter_allocations(meter_id);
CREATE INDEX IF NOT EXISTS idx_meter_allocations_subscription_id ON meter_allocations(subscription_id);

COMMENT ON TABLE meter_allocations IS 'Many-to-many mapping that assigns a portion of a meter to a subscription (unit)';
COMMENT ON COLUMN meter_allocations.allocation_rule IS 'Optional rule describing how allocation is computed (JSON)';

-- Trigger to ensure overlapping allocations for a meter do not sum to more than 1.0
CREATE OR REPLACE FUNCTION check_meter_allocations_total() RETURNS TRIGGER AS $$
DECLARE
    overlap_sum NUMERIC := 0;
BEGIN
    SELECT COALESCE(SUM(allocation_fraction),0) INTO overlap_sum
    FROM meter_allocations
    WHERE meter_id = NEW.meter_id
      AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000')
      AND (effective_to IS NULL OR NEW.effective_from IS NULL OR effective_to >= NEW.effective_from)
      AND (NEW.effective_to IS NULL OR effective_from IS NULL OR effective_from <= NEW.effective_to);

    overlap_sum := overlap_sum + NEW.allocation_fraction;
    IF overlap_sum > 1.000001 THEN
        RAISE EXCEPTION 'Total allocation fraction for meter % in overlapping period exceeds 1.0 (sum=%).', NEW.meter_id, overlap_sum;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_check_meter_allocations_total
BEFORE INSERT OR UPDATE ON meter_allocations
FOR EACH ROW EXECUTE FUNCTION check_meter_allocations_total();