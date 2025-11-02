#!/bin/bash

# Database migration script for authentication features
# Run this script to update the database schema for user authentication

echo "Starting database migration for authentication features..."

# Database connection details
DB_HOST=${DB_HOST:-localhost}
DB_PORT=${DB_PORT:-5432}
DB_NAME=${DB_NAME:-assetdb}
DB_USER=${DB_USER:-user}
DB_PASSWORD=${DB_PASSWORD:-pass}

# SQL commands to update the users table
SQL_COMMANDS="
-- Add authentication columns to users table
ALTER TABLE users
ADD COLUMN IF NOT EXISTS phone VARCHAR(20),
ADD COLUMN IF NOT EXISTS is_email_verified BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS is_phone_verified BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS email_verification_token VARCHAR(255),
ADD COLUMN IF NOT EXISTS email_verification_expires TIMESTAMP,
ADD COLUMN IF NOT EXISTS password_reset_token VARCHAR(255),
ADD COLUMN IF NOT EXISTS password_reset_expires TIMESTAMP,
ADD COLUMN IF NOT EXISTS google_id VARCHAR(255) UNIQUE,
ADD COLUMN IF NOT EXISTS profile_picture TEXT,
ADD COLUMN IF NOT EXISTS last_login TIMESTAMP,
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- Create index for email verification token
CREATE INDEX IF NOT EXISTS idx_users_email_verification_token ON users(email_verification_token);

-- Create index for password reset token
CREATE INDEX IF NOT EXISTS idx_users_password_reset_token ON users(password_reset_token);

-- Create index for Google ID
CREATE INDEX IF NOT EXISTS idx_users_google_id ON users(google_id);

-- Update existing users to have email verified if they were created before this migration
UPDATE users SET is_email_verified = TRUE WHERE is_email_verified IS NULL;

-- Create email verification tokens table for additional security
CREATE TABLE IF NOT EXISTS email_verification_tokens (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  token VARCHAR(255) NOT NULL UNIQUE,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create password reset tokens table
CREATE TABLE IF NOT EXISTS password_reset_tokens (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  token VARCHAR(255) NOT NULL UNIQUE,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create phone verification codes table
CREATE TABLE IF NOT EXISTS phone_verification_codes (
  id SERIAL PRIMARY KEY,
  phone VARCHAR(20) NOT NULL,
  code VARCHAR(6) NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_email_tokens_user_id ON email_verification_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_email_tokens_token ON email_verification_tokens(token);
CREATE INDEX IF NOT EXISTS idx_password_reset_user_id ON password_reset_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_password_reset_token ON password_reset_tokens(token);
CREATE INDEX IF NOT EXISTS idx_phone_codes_phone ON phone_verification_codes(phone);
"

# Execute the SQL commands
echo "Executing database migration..."
echo "$SQL_COMMANDS" | PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME"

if [ $? -eq 0 ]; then
    echo "✅ Database migration completed successfully!"
    echo ""
    echo "New user table structure:"
    echo "- phone: VARCHAR(20) - Optional phone number"
    echo "- is_email_verified: BOOLEAN - Email verification status"
    echo "- is_phone_verified: BOOLEAN - Phone verification status"
    echo "- email_verification_token: VARCHAR(255) - Email verification token"
    echo "- email_verification_expires: TIMESTAMP - Token expiration"
    echo "- password_reset_token: VARCHAR(255) - Password reset token"
    echo "- password_reset_expires: TIMESTAMP - Reset token expiration"
    echo "- google_id: VARCHAR(255) - Google OAuth ID"
    echo "- profile_picture: TEXT - Profile picture URL"
    echo "- last_login: TIMESTAMP - Last login timestamp"
    echo "- created_at: TIMESTAMP - Account creation timestamp"
    echo "- updated_at: TIMESTAMP - Last update timestamp"
    echo ""
    echo "New tables created:"
    echo "- email_verification_tokens: Secure email verification storage"
    echo "- password_reset_tokens: Secure password reset storage"
    echo "- phone_verification_codes: SMS verification codes"
else
    echo "❌ Database migration failed!"
    exit 1
fi