-- MOVED: original file: ../002_phone_verification_codes.sql
-- Location: schema/auth/002_phone_verification_codes.sql

-- Phone verification codes table
CREATE TABLE IF NOT EXISTS phone_verification_codes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    phone VARCHAR(20) NOT NULL,
    code VARCHAR(6) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);