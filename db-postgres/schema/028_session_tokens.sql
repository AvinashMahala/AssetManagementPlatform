-- 028_session_tokens.sql
-- Adds a per-device/session-backed refresh token store.
-- Postgres-friendly SQL that should work with the project's DB setup.

CREATE TABLE IF NOT EXISTS session_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  refresh_token_hash VARCHAR(64) NOT NULL UNIQUE,
  issued_at TIMESTAMP WITH TIME ZONE NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  revoked BOOLEAN NOT NULL DEFAULT FALSE,
  device_info TEXT,
  ip_address TEXT,
  user_agent TEXT,
  last_used_at TIMESTAMP WITH TIME ZONE,
  replaced_by_session_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_session_tokens_user_id ON session_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_session_tokens_revoked ON session_tokens(revoked);

-- Note: If your Postgres instance does not have the `pgcrypto` extension, you can replace
-- the default `gen_random_uuid()` with `uuid_generate_v4()` if the `uuid-ossp` extension
-- is available, or generate UUIDs from the application layer.

-- Backcompat note: This file should be run when setting up a new DB to ensure the
-- server-side session-based refresh token store is present.
