-- MOVED: original file: ../004_security_questions.sql
-- Location: schema/auth/004_security_questions.sql

-- Security questions table
CREATE TABLE IF NOT EXISTS security_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    question VARCHAR(255) NOT NULL,
    answer_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);