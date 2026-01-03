-- MOVED: original file: ../028_session_tokens.sql
-- Location: schema/auth/028_session_tokens.sql

-- Adds a per-device/session-backed refresh token store.
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