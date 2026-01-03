-- MOVED: original file: ../029_session_jtis.sql
-- Location: schema/auth/029_session_jtis.sql

-- Adds persistent storage for access token JTIs (JTI allowlist fallback to DB).
CREATE TABLE IF NOT EXISTS session_jtis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES session_tokens(id) ON DELETE CASCADE,
  jti VARCHAR(100) NOT NULL UNIQUE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_session_jtis_session_id ON session_jtis(session_id);
CREATE INDEX IF NOT EXISTS idx_session_jtis_jti ON session_jtis(jti);