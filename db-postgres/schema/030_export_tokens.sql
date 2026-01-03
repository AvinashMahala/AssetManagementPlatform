-- 030_export_tokens.sql
-- Table for pre-signed export tokens

CREATE TABLE IF NOT EXISTS export_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  token varchar(64) NOT NULL UNIQUE,
  created_by varchar(256),
  created_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL,
  used boolean NOT NULL DEFAULT FALSE,
  revoked boolean NOT NULL DEFAULT FALSE,
  revoked_by varchar(256),
  revoked_at timestamptz,
  query varchar(1024),
  ids_csv text,
  created_from_ip varchar(64),
  downloaded_at timestamptz,
  downloaded_by_ip varchar(64)
);

CREATE INDEX IF NOT EXISTS idx_export_tokens_token ON export_tokens (token);
CREATE INDEX IF NOT EXISTS idx_export_tokens_revoked ON export_tokens (revoked);