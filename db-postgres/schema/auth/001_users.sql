-- MOVED: original file: ../001_users.sql
-- Location: schema/auth/001_users.sql

-- Users table with full authentication support
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    role VARCHAR(50) DEFAULT 'user',
    
    -- Google OAuth support
    google_id VARCHAR(255) UNIQUE,
    name VARCHAR(255),  -- Full display name (for OAuth users)
    profile_picture VARCHAR(500),  -- URL to user profile picture
    
    -- Email verification
    is_email_verified BOOLEAN DEFAULT FALSE,
    email_verification_token VARCHAR(255),
    email_verification_expires TIMESTAMP,
    
    -- Phone verification
    is_phone_verified BOOLEAN DEFAULT FALSE,
    
    -- Password reset
    password_reset_token VARCHAR(255),
    password_reset_expires TIMESTAMP,
    
    -- Tracking
    last_login TIMESTAMP,
    refresh_token VARCHAR(255),
    refresh_token_expiry TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_google_id ON users(google_id);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);

-- Add comments for documentation
COMMENT ON COLUMN users.google_id IS 'Google OAuth user ID';
COMMENT ON COLUMN users.name IS 'Full display name (for OAuth users)';
COMMENT ON COLUMN users.email_verification_token IS 'Token for email verification';
COMMENT ON COLUMN users.email_verification_expires IS 'Expiration time for email verification token';
COMMENT ON COLUMN users.password_reset_token IS 'Token for password reset';
COMMENT ON COLUMN users.password_reset_expires IS 'Expiration time for password reset token';
COMMENT ON COLUMN users.profile_picture IS 'URL to user profile picture';
COMMENT ON COLUMN users.last_login IS 'Last login timestamp';
COMMENT ON COLUMN users.refresh_token IS 'Optional legacy refresh token (JWT string) retained for compatibility';
COMMENT ON COLUMN users.refresh_token_expiry IS 'Expiration timestamp for per-user refresh token';