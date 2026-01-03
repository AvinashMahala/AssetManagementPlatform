-- Enforce subscription presence when subscription-based billing is expected
-- Location: schema/utilities/042_enforce_subscription.sql

CREATE OR REPLACE FUNCTION check_subscription_presence_for_meter_allocated() RETURNS TRIGGER AS $$
DECLARE
    txn_unit_id UUID;
    meter_type_key VARCHAR;
    count_subs INTEGER;
BEGIN
    -- Find unit_id for the transaction
    SELECT unit_id INTO txn_unit_id FROM rent_transactions WHERE id = NEW.transaction_id;
    IF txn_unit_id IS NULL THEN
        RETURN NEW; -- nothing to check
    END IF;

    -- Get meter_type from meters table
    SELECT meter_type INTO meter_type_key FROM meters WHERE id = NEW.meter_id;
    IF meter_type_key IS NULL THEN
        RETURN NEW; -- can't validate without meter_type
    END IF;

    -- Count subscriptions for this unit and utility type that are meter_allocated
    SELECT COUNT(*) INTO count_subs
    FROM utility_subscriptions s
    JOIN utility_types u ON s.utility_type_id = u.id
    WHERE s.unit_id = txn_unit_id
      AND u.key = meter_type_key
      AND s.billing_method = 'meter_allocated';

    IF count_subs > 0 AND NEW.subscription_id IS NULL THEN
        RAISE EXCEPTION 'Subscription is required for meter-allocated billing when a matching subscription exists for unit % and utility %', txn_unit_id, meter_type_key;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_check_subscription_presence_on_rent_tx_meter_readings ON rent_transaction_meter_readings;
CREATE TRIGGER trg_check_subscription_presence_on_rent_tx_meter_readings
BEFORE INSERT OR UPDATE ON rent_transaction_meter_readings
FOR EACH ROW EXECUTE FUNCTION check_subscription_presence_for_meter_allocated();