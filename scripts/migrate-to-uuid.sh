#!/bin/bash

# Database migration script to convert all IDs from INTEGER to UUID
# This script safely migrates existing data to use UUID primary keys

echo "Starting database migration to convert INTEGER IDs to UUIDs..."

# Database connection details
DB_HOST=${DB_HOST:-localhost}
DB_PORT=${DB_PORT:-5432}
DB_NAME=${DB_NAME:-assetdb}
DB_USER=${DB_USER:-user}
DB_PASSWORD=${DB_PASSWORD:-pass}

# SQL commands to migrate database to UUID
SQL_COMMANDS="
-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS \"uuid-ossp\";

-- Start transaction for atomic migration
BEGIN;

-- Migrate users table to UUID
ALTER TABLE users ADD COLUMN id_uuid UUID DEFAULT uuid_generate_v4();
UPDATE users SET id_uuid = uuid_generate_v4() WHERE id_uuid IS NULL;
ALTER TABLE users DROP CONSTRAINT users_pkey CASCADE;
ALTER TABLE users ADD PRIMARY KEY (id_uuid);
ALTER TABLE users DROP COLUMN id;
ALTER TABLE users RENAME COLUMN id_uuid TO id;

-- Migrate password_reset_methods table to UUID
ALTER TABLE password_reset_methods ADD COLUMN id_uuid UUID DEFAULT uuid_generate_v4();
UPDATE password_reset_methods SET id_uuid = uuid_generate_v4() WHERE id_uuid IS NULL;
ALTER TABLE password_reset_methods DROP CONSTRAINT password_reset_methods_pkey CASCADE;
ALTER TABLE password_reset_methods ADD PRIMARY KEY (id_uuid);
ALTER TABLE password_reset_methods DROP COLUMN id;
ALTER TABLE password_reset_methods RENAME COLUMN id_uuid TO id;

-- Update foreign key references to users table
ALTER TABLE password_reset_methods ADD COLUMN user_id_uuid UUID;
UPDATE password_reset_methods SET user_id_uuid = users.id FROM users WHERE password_reset_methods.user_id = users.id;
ALTER TABLE password_reset_methods DROP CONSTRAINT password_reset_methods_user_id_fkey;
ALTER TABLE password_reset_methods DROP COLUMN user_id;
ALTER TABLE password_reset_methods RENAME COLUMN user_id_uuid TO user_id;
ALTER TABLE password_reset_methods ADD CONSTRAINT password_reset_methods_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id);

-- Migrate security_questions table to UUID
ALTER TABLE security_questions ADD COLUMN id_uuid UUID DEFAULT uuid_generate_v4();
UPDATE security_questions SET id_uuid = uuid_generate_v4() WHERE id_uuid IS NULL;
ALTER TABLE security_questions DROP CONSTRAINT security_questions_pkey CASCADE;
ALTER TABLE security_questions ADD PRIMARY KEY (id_uuid);
ALTER TABLE security_questions DROP COLUMN id;
ALTER TABLE security_questions RENAME COLUMN id_uuid TO id;

-- Update foreign key references to users table
ALTER TABLE security_questions ADD COLUMN user_id_uuid UUID;
UPDATE security_questions SET user_id_uuid = users.id FROM users WHERE security_questions.user_id = users.id;
ALTER TABLE security_questions DROP CONSTRAINT security_questions_user_id_fkey;
ALTER TABLE security_questions DROP COLUMN user_id;
ALTER TABLE security_questions RENAME COLUMN user_id_uuid TO user_id;
ALTER TABLE security_questions ADD CONSTRAINT security_questions_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id);

-- Migrate recovery_codes table to UUID
ALTER TABLE recovery_codes ADD COLUMN id_uuid UUID DEFAULT uuid_generate_v4();
UPDATE recovery_codes SET id_uuid = uuid_generate_v4() WHERE id_uuid IS NULL;
ALTER TABLE recovery_codes DROP CONSTRAINT recovery_codes_pkey CASCADE;
ALTER TABLE recovery_codes ADD PRIMARY KEY (id_uuid);
ALTER TABLE recovery_codes DROP COLUMN id;
ALTER TABLE recovery_codes RENAME COLUMN id_uuid TO id;

-- Update foreign key references to users table
ALTER TABLE recovery_codes ADD COLUMN user_id_uuid UUID;
UPDATE recovery_codes SET user_id_uuid = users.id FROM users WHERE recovery_codes.user_id = users.id;
ALTER TABLE recovery_codes DROP CONSTRAINT recovery_codes_user_id_fkey;
ALTER TABLE recovery_codes DROP COLUMN user_id;
ALTER TABLE recovery_codes RENAME COLUMN user_id_uuid TO user_id;
ALTER TABLE recovery_codes ADD CONSTRAINT recovery_codes_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id);

-- Migrate tenant_documents table foreign key to UUID
ALTER TABLE tenant_documents ADD COLUMN tenant_id_uuid UUID;
UPDATE tenant_documents SET tenant_id_uuid = tenants.id FROM tenants WHERE tenant_documents.tenant_id = tenants.id;
ALTER TABLE tenant_documents DROP CONSTRAINT tenant_documents_tenant_id_fkey;
ALTER TABLE tenant_documents DROP COLUMN tenant_id;
ALTER TABLE tenant_documents RENAME COLUMN tenant_id_uuid TO tenant_id;
ALTER TABLE tenant_documents ADD CONSTRAINT tenant_documents_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES tenants(id);

-- Update verified_by foreign key in tenant_documents
ALTER TABLE tenant_documents ADD COLUMN verified_by_uuid UUID;
UPDATE tenant_documents SET verified_by_uuid = users.id FROM users WHERE tenant_documents.verified_by = users.id;
ALTER TABLE tenant_documents DROP CONSTRAINT tenant_documents_verified_by_fkey;
ALTER TABLE tenant_documents DROP COLUMN verified_by;
ALTER TABLE tenant_documents RENAME COLUMN verified_by_uuid TO verified_by;
ALTER TABLE tenant_documents ADD CONSTRAINT tenant_documents_verified_by_fkey FOREIGN KEY (verified_by) REFERENCES users(id);

-- Create properties table with UUID if it doesn't exist
CREATE TABLE IF NOT EXISTS properties (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  property_type VARCHAR(50) NOT NULL,
  status VARCHAR(50) DEFAULT 'available',
  address_street VARCHAR(255) NOT NULL,
  address_city VARCHAR(100) NOT NULL,
  address_state VARCHAR(100) NOT NULL,
  address_pincode VARCHAR(10) NOT NULL,
  address_landmark VARCHAR(255),
  area DECIMAL(10,2) NOT NULL,
  bedrooms INTEGER,
  bathrooms INTEGER,
  monthly_rent DECIMAL(12,2) NOT NULL,
  security_deposit DECIMAL(12,2) NOT NULL,
  owner_id UUID NOT NULL REFERENCES users(id),
  amenities JSONB,
  photos JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create leases table with UUID if it doesn't exist
CREATE TABLE IF NOT EXISTS leases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_id UUID NOT NULL REFERENCES properties(id),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  lease_start_date DATE NOT NULL,
  lease_end_date DATE NOT NULL,
  monthly_rent DECIMAL(12,2) NOT NULL,
  security_deposit DECIMAL(12,2) NOT NULL,
  maintenance_charges DECIMAL(12,2),
  payment_frequency VARCHAR(20) DEFAULT 'monthly',
  notice_period_days INTEGER DEFAULT 30,
  lock_in_period_months INTEGER,
  conditions JSONB,
  status VARCHAR(50) DEFAULT 'draft',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create rent_payments table with UUID if it doesn't exist
CREATE TABLE IF NOT EXISTS rent_payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lease_id UUID NOT NULL REFERENCES leases(id),
  amount DECIMAL(12,2) NOT NULL,
  due_date DATE NOT NULL,
  paid_date TIMESTAMP,
  payment_method VARCHAR(50),
  transaction_id VARCHAR(255),
  status VARCHAR(50) DEFAULT 'pending',
  late_fee DECIMAL(12,2),
  remarks TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Update tenants table to reference properties with UUID
ALTER TABLE tenants ADD COLUMN current_property_id_uuid UUID;
UPDATE tenants SET current_property_id_uuid = properties.id FROM properties WHERE tenants.current_property_id::text = properties.id::text;
ALTER TABLE tenants DROP COLUMN current_property_id;
ALTER TABLE tenants RENAME COLUMN current_property_id_uuid TO current_property_id;
ALTER TABLE tenants ADD CONSTRAINT tenants_current_property_id_fkey FOREIGN KEY (current_property_id) REFERENCES properties(id);

COMMIT;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_tenants_email ON tenants(email);
CREATE INDEX IF NOT EXISTS idx_properties_owner_id ON properties(owner_id);
CREATE INDEX IF NOT EXISTS idx_leases_property_id ON leases(property_id);
CREATE INDEX IF NOT EXISTS idx_leases_tenant_id ON leases(tenant_id);
CREATE INDEX IF NOT EXISTS idx_rent_payments_lease_id ON rent_payments(lease_id);
"

# Execute the SQL commands
echo "Executing database migration to UUID..."
echo "$SQL_COMMANDS" | PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME"

if [ $? -eq 0 ]; then
    echo "✅ Database migration to UUID completed successfully!"
    echo ""
    echo "Migration Summary:"
    echo "- All tables now use UUID PRIMARY KEY DEFAULT uuid_generate_v4()"
    echo "- Foreign key relationships updated to use UUID references"
    echo "- Existing data preserved with new UUID assignments"
    echo "- Indexes created for optimal query performance"
    echo ""
    echo "Next Steps:"
    echo "1. Update your application code to expect UUID strings instead of integers"
    echo "2. Update Swagger schemas to use 'string' format 'uuid' for all ID fields"
    echo "3. Test all CRUD operations with the new UUID-based system"
else
    echo "❌ Database migration failed!"
    echo "Please check the database logs and ensure you have a backup before retrying."
    exit 1
fi