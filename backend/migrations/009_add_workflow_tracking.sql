-- Migration: Add workflow tracking fields to rent_transactions table
-- This enables streamlined rent collection workflow: invoice -> notification -> payment -> receipt

-- Add workflow status and tracking fields
ALTER TABLE rent_transactions ADD COLUMN IF NOT EXISTS workflow_status VARCHAR(30) NOT NULL DEFAULT 'invoice_pending'
    CHECK (workflow_status IN ('invoice_pending', 'invoice_generated', 'notification_sent', 'payment_pending', 'payment_partial', 'payment_completed', 'receipt_generated', 'workflow_completed'));

-- Invoice tracking
ALTER TABLE rent_transactions ADD COLUMN IF NOT EXISTS invoice_generated BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE rent_transactions ADD COLUMN IF NOT EXISTS invoice_sent_date TIMESTAMP;

-- Notification tracking
ALTER TABLE rent_transactions ADD COLUMN IF NOT EXISTS notification_sent BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE rent_transactions ADD COLUMN IF NOT EXISTS notification_sent_date TIMESTAMP;
ALTER TABLE rent_transactions ADD COLUMN IF NOT EXISTS notification_method VARCHAR(20) CHECK (notification_method IN ('email', 'sms', 'manual'));

-- Payment tracking
ALTER TABLE rent_transactions ADD COLUMN IF NOT EXISTS last_payment_date TIMESTAMP;

-- Receipt tracking
ALTER TABLE rent_transactions ADD COLUMN IF NOT EXISTS receipt_sent BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE rent_transactions ADD COLUMN IF NOT EXISTS receipt_sent_date TIMESTAMP;

-- Workflow completion
ALTER TABLE rent_transactions ADD COLUMN IF NOT EXISTS workflow_completed_date TIMESTAMP;

-- Create indexes for workflow queries
CREATE INDEX IF NOT EXISTS idx_rent_transactions_workflow_status ON rent_transactions(workflow_status);
CREATE INDEX IF NOT EXISTS idx_rent_transactions_invoice_generated ON rent_transactions(invoice_generated);
CREATE INDEX IF NOT EXISTS idx_rent_transactions_notification_sent ON rent_transactions(notification_sent);
CREATE INDEX IF NOT EXISTS idx_rent_transactions_receipt_sent ON rent_transactions(receipt_sent);
CREATE INDEX IF NOT EXISTS idx_rent_transactions_workflow_completed_date ON rent_transactions(workflow_completed_date);

-- Update existing records to have proper workflow status
-- If invoice exists, set to invoice_generated
UPDATE rent_transactions SET workflow_status = 'invoice_generated' WHERE invoice_number IS NOT NULL;
-- If paid, set to payment_completed
UPDATE rent_transactions SET workflow_status = 'payment_completed' WHERE status = 'paid';
-- If receipt generated, set to receipt_generated
UPDATE rent_transactions SET workflow_status = 'receipt_generated' WHERE receipt_generated = TRUE;

-- Add comments for documentation
COMMENT ON COLUMN rent_transactions.workflow_status IS 'Workflow status for streamlined rent collection process';
COMMENT ON COLUMN rent_transactions.invoice_generated IS 'Whether invoice PDF has been generated';
COMMENT ON COLUMN rent_transactions.invoice_sent_date IS 'Date when invoice was sent to tenant';
COMMENT ON COLUMN rent_transactions.notification_sent IS 'Whether notification has been sent to tenant';
COMMENT ON COLUMN rent_transactions.notification_sent_date IS 'Date when notification was sent';
COMMENT ON COLUMN rent_transactions.notification_method IS 'Method used for notification: email, sms, or manual';
COMMENT ON COLUMN rent_transactions.last_payment_date IS 'Date of the most recent payment';
COMMENT ON COLUMN rent_transactions.receipt_sent IS 'Whether receipt has been sent to tenant';
COMMENT ON COLUMN rent_transactions.receipt_sent_date IS 'Date when receipt was sent';
COMMENT ON COLUMN rent_transactions.workflow_completed_date IS 'Date when entire workflow was completed';