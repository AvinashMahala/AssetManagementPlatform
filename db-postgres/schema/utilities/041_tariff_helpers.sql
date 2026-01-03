-- Helpers for tariffs: validation and selection
-- Location: schema/utilities/041_tariff_helpers.sql

-- Validate tiered_rates JSON structure: array of objects with numeric threshold and rate
CREATE OR REPLACE FUNCTION validate_tiered_rates(tiers JSONB) RETURNS BOOLEAN AS $$
DECLARE
    item JSONB;
    idx INT := 0;
BEGIN
    IF tiers IS NULL THEN
        RETURN TRUE;
    END IF;

    IF jsonb_typeof(tiers) <> 'array' THEN
        RETURN FALSE;
    END IF;

    FOR idx IN 0 .. jsonb_array_length(tiers) - 1 LOOP
        item := tiers -> idx;
        IF jsonb_typeof(item) <> 'object' THEN
            RETURN FALSE;
        END IF;
        -- threshold and rate must be present and numeric >= 0
        IF (item -> 'threshold') IS NULL OR (item -> 'rate') IS NULL THEN
            RETURN FALSE;
        END IF;
        BEGIN
            IF (item ->> 'threshold')::numeric < 0 THEN
                RETURN FALSE;
            END IF;
            IF (item ->> 'rate')::numeric < 0 THEN
                RETURN FALSE;
            END IF;
        EXCEPTION WHEN OTHERS THEN
            RETURN FALSE;
        END;
    END LOOP;

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Add validation constraint using the above function (idempotent)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'chk_tariffs_validate_tiers'
    ) THEN
        ALTER TABLE tariffs ADD CONSTRAINT chk_tariffs_validate_tiers CHECK (validate_tiered_rates(tiered_rates));
    END IF;
END$$;

-- Tariff selection function
-- Precedence: subscription-specific (subscription_id matches), then meter-specific (meter_id matches), then utility-type (fallback)
-- Within each scope choose the tariff with the latest effective_from <= p_date
CREATE OR REPLACE FUNCTION get_applicable_tariff(p_subscription_id UUID, p_meter_id UUID, p_utility_type_id UUID, p_date DATE) RETURNS TABLE(
    id UUID,
    utility_type_id UUID,
    subscription_id UUID,
    meter_id UUID,
    name VARCHAR,
    description TEXT,
    effective_from DATE,
    effective_to DATE,
    rate_per_unit NUMERIC(14,6),
    fixed_charge NUMERIC(12,2),
    tiered_rates JSONB
) AS $$
BEGIN
    RETURN QUERY
    SELECT t.id, t.utility_type_id, t.subscription_id, t.meter_id, t.name, t.description, t.effective_from, t.effective_to, t.rate_per_unit, t.fixed_charge, t.tiered_rates
    FROM tariffs t
    WHERE t.utility_type_id = p_utility_type_id
      AND t.effective_from <= p_date
      AND (t.effective_to IS NULL OR t.effective_to >= p_date)
      AND (
          (p_subscription_id IS NOT NULL AND t.subscription_id = p_subscription_id)
          OR (p_subscription_id IS NULL AND p_meter_id IS NOT NULL AND t.meter_id = p_meter_id)
          OR (t.subscription_id IS NULL AND t.meter_id IS NULL)
      )
    ORDER BY 
        CASE WHEN t.subscription_id = p_subscription_id THEN 1
             WHEN t.meter_id = p_meter_id THEN 2
             ELSE 3 END,
        t.effective_from DESC
    LIMIT 1;
END;
$$ LANGUAGE plpgsql;