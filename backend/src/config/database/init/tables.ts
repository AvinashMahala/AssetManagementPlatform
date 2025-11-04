import { Pool } from 'pg';

export const initializeTables = (pool: Pool) => {
  // Tenants table
  pool.query(`CREATE TABLE IF NOT EXISTS tenants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20) NOT NULL,
    alternate_phone VARCHAR(20),
    date_of_birth DATE,
    gender VARCHAR(10),
    occupation VARCHAR(100),
    company_name VARCHAR(255),
    monthly_income DECIMAL(12,2),
    current_address_street VARCHAR(255) NOT NULL,
    current_address_city VARCHAR(100) NOT NULL,
    current_address_state VARCHAR(100) NOT NULL,
    current_address_pincode VARCHAR(10) NOT NULL,
    permanent_address_street VARCHAR(255) NOT NULL,
    permanent_address_city VARCHAR(100) NOT NULL,
    permanent_address_state VARCHAR(100) NOT NULL,
    permanent_address_pincode VARCHAR(10) NOT NULL,
    emergency_contact_name VARCHAR(255) NOT NULL,
    emergency_contact_relationship VARCHAR(100) NOT NULL,
    emergency_contact_phone VARCHAR(20) NOT NULL,
    status VARCHAR(50) DEFAULT 'active',
    total_rentals INTEGER DEFAULT 0,
    current_property_id UUID,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`, (err) => {
    if (err) {
      console.error('Error creating tenants table', err);
    } else {
      console.log('Tenants table ready');
    }
  });

  // Tenant documents table
  pool.query(`CREATE TABLE IF NOT EXISTS tenant_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    document_type VARCHAR(50) NOT NULL,
    document_number VARCHAR(100),
    file_url TEXT NOT NULL,
    verified BOOLEAN DEFAULT FALSE,
    verified_at TIMESTAMP,
    verified_by UUID REFERENCES users(id),
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`, (err) => {
    if (err) {
      console.error('Error creating tenant_documents table', err);
    } else {
      console.log('Tenant documents table ready');
    }
  });

  // Users table
  pool.query(`CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    role VARCHAR(50) DEFAULT 'user',
    is_email_verified BOOLEAN DEFAULT FALSE,
    is_phone_verified BOOLEAN DEFAULT FALSE,
    email_verification_token VARCHAR(255),
    email_verification_expires TIMESTAMP,
    password_reset_token VARCHAR(255),
    password_reset_expires TIMESTAMP,
    google_id VARCHAR(255) UNIQUE,
    profile_picture TEXT,
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`, (err) => {
    if (err) {
      console.error('Error creating users table', err);
    } else {
      console.log('Users table ready');
    }
  });

  // Phone verification codes table
  pool.query(`CREATE TABLE IF NOT EXISTS phone_verification_codes (
    phone VARCHAR(20) PRIMARY KEY,
    code VARCHAR(10) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`, (err) => {
    if (err) {
      console.error('Error creating phone_verification_codes table', err);
    } else {
      console.log('Phone verification codes table ready');
    }
  });

  // Password reset methods table
  pool.query(`CREATE TABLE IF NOT EXISTS password_reset_methods (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    method_type VARCHAR(50) NOT NULL,
    is_enabled BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, method_type)
  )`, (err) => {
    if (err) {
      console.error('Error creating password_reset_methods table', err);
    } else {
      console.log('Password reset methods table ready');
    }
  });

  // Security questions table
  pool.query(`CREATE TABLE IF NOT EXISTS security_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    question VARCHAR(500) NOT NULL,
    answer_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`, (err) => {
    if (err) {
      console.error('Error creating security_questions table', err);
    } else {
      console.log('Security questions table ready');
    }
  });

  // Recovery codes table
  pool.query(`CREATE TABLE IF NOT EXISTS recovery_codes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    code_hash VARCHAR(255) NOT NULL,
    is_used BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    used_at TIMESTAMP
  )`, (err) => {
    if (err) {
      console.error('Error creating recovery_codes table', err);
    } else {
      console.log('Recovery codes table ready');
    }
  });
};