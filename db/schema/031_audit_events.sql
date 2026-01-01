-- 031_audit_events.sql
-- Table for audit/event logging

CREATE TABLE IF NOT EXISTS audit_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor varchar(200) NOT NULL,
  action varchar(200) NOT NULL,
  resource_type varchar(200) NOT NULL,
  resource_id varchar(50),
  data jsonb NOT NULL,
  occurred_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_audit_events_actor ON audit_events (actor);
CREATE INDEX IF NOT EXISTS idx_audit_events_resource_type ON audit_events (resource_type);
CREATE INDEX IF NOT EXISTS idx_audit_events_occurred_at ON audit_events (occurred_at);
