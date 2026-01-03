-- Sync payments: compute payments JSONB cache on rent_transactions
-- Location: schema/billing/023_payments_sync.sql

CREATE OR REPLACE FUNCTION compute_and_update_payments_for_rent_transaction(p_txn_id UUID) RETURNS VOID AS $$
DECLARE
    txn RECORD;
    payments_json JSONB;
BEGIN
    SELECT * INTO txn FROM rent_transactions WHERE id = p_txn_id;
    IF NOT FOUND THEN
        RETURN;
    END IF;

    SELECT COALESCE(jsonb_agg(jsonb_build_object(
        'id', rp.id,
        'amount', rp.amount,
        'due_date', rp.due_date,
        'paid_date', rp.paid_date,
        'payment_method', rp.payment_method,
        'transaction_reference', rp.transaction_reference,
        'status', rp.status
    ) ORDER BY rp.paid_date NULLS LAST), '[]'::jsonb)
    INTO payments_json
    FROM rent_payments rp
    WHERE rp.lease_id = txn.lease_id
      AND (
          (rp.paid_date IS NOT NULL AND rp.paid_date BETWEEN txn.billing_period_start AND txn.billing_period_end)
          OR (rp.paid_date IS NULL AND rp.due_date BETWEEN txn.billing_period_start AND txn.billing_period_end)
      );

    UPDATE rent_transactions SET payments = payments_json WHERE id = p_txn_id;
END;
$$ LANGUAGE plpgsql;

-- Trigger: when a rent_transaction is inserted/updated, recompute its payments cache
CREATE OR REPLACE FUNCTION trg_recompute_payments_on_rent_transactions() RETURNS TRIGGER AS $$
BEGIN
    PERFORM compute_and_update_payments_for_rent_transaction(NEW.id);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_recompute_payments_on_rent_transactions ON rent_transactions;
CREATE TRIGGER trg_recompute_payments_on_rent_transactions
AFTER INSERT OR UPDATE ON rent_transactions
FOR EACH ROW EXECUTE FUNCTION trg_recompute_payments_on_rent_transactions();

-- Trigger: when a rent_payment is inserted/updated/deleted, find matching rent_transactions and recompute
CREATE OR REPLACE FUNCTION trg_recompute_payments_on_rent_payments() RETURNS TRIGGER AS $$
DECLARE
    txn_id UUID;
BEGIN
    -- For INSERT/UPDATE use NEW; for DELETE use OLD
    IF (TG_OP = 'DELETE') THEN
        -- Use OLD values
        FOR txn_id IN
            SELECT id FROM rent_transactions rt
            WHERE rt.lease_id = OLD.lease_id
              AND (
                  (OLD.paid_date IS NOT NULL AND OLD.paid_date BETWEEN rt.billing_period_start AND rt.billing_period_end)
                  OR (OLD.paid_date IS NULL AND OLD.due_date BETWEEN rt.billing_period_start AND rt.billing_period_end)
              )
        LOOP
            PERFORM compute_and_update_payments_for_rent_transaction(txn_id);
        END LOOP;
    ELSE
        FOR txn_id IN
            SELECT id FROM rent_transactions rt
            WHERE rt.lease_id = NEW.lease_id
              AND (
                  (NEW.paid_date IS NOT NULL AND NEW.paid_date BETWEEN rt.billing_period_start AND rt.billing_period_end)
                  OR (NEW.paid_date IS NULL AND NEW.due_date BETWEEN rt.billing_period_start AND rt.billing_period_end)
              )
        LOOP
            PERFORM compute_and_update_payments_for_rent_transaction(txn_id);
        END LOOP;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_recompute_payments_on_rent_payments ON rent_payments;
CREATE TRIGGER trg_recompute_payments_on_rent_payments
AFTER INSERT OR UPDATE OR DELETE ON rent_payments
FOR EACH ROW EXECUTE FUNCTION trg_recompute_payments_on_rent_payments();