-- NEW: triggers to keep updated_at columns current
-- Location: schema/misc/041_update_timestamps.sql

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Attach triggers to frequently updated tables
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_update_meters_updated_at') THEN
        CREATE TRIGGER trg_update_meters_updated_at BEFORE UPDATE ON meters FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_update_meter_readings_updated_at') THEN
        CREATE TRIGGER trg_update_meter_readings_updated_at BEFORE UPDATE ON meter_readings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_update_meter_allocations_updated_at') THEN
        CREATE TRIGGER trg_update_meter_allocations_updated_at BEFORE UPDATE ON meter_allocations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_update_utility_subscriptions_updated_at') THEN
        CREATE TRIGGER trg_update_utility_subscriptions_updated_at BEFORE UPDATE ON utility_subscriptions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_update_rent_tx_meter_readings_updated_at') THEN
        CREATE TRIGGER trg_update_rent_tx_meter_readings_updated_at BEFORE UPDATE ON rent_transaction_meter_readings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_update_rent_transactions_updated_at') THEN
        CREATE TRIGGER trg_update_rent_transactions_updated_at BEFORE UPDATE ON rent_transactions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_update_rent_payments_updated_at') THEN
        CREATE TRIGGER trg_update_rent_payments_updated_at BEFORE UPDATE ON rent_payments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
END;
$$;