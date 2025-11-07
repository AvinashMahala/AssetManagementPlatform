#!/usr/bin/env python3
"""
Simple Database Seeding Script for Asset Management Platform
End-to-end database setup and seeding from Excel in pure Python
"""

import os
import sys
import subprocess
import pandas as pd
import psycopg2
from psycopg2.extras import execute_values
import bcrypt
from datetime import date, datetime
import json

# Database configuration
DB_CONFIG = {
    'host': os.getenv('DB_HOST', 'localhost'),
    'port': os.getenv('DB_PORT', '5432'),
    'database': os.getenv('DB_NAME', 'assetdb'),
    'user': os.getenv('DB_USER', 'user'),
    'password': os.getenv('DB_PASSWORD', 'pass')
}

def print_step(message):
    """Print a step message"""
    print(f"🚀 {message}")

def print_success(message):
    """Print a success message"""
    print(f"✅ {message}")

def print_warning(message):
    """Print a warning message"""
    print(f"⚠️  {message}")

def print_error(message):
    """Print an error message"""
    print(f"❌ {message}")

def get_docker_container():
    """Get Docker container name if using Docker"""
    try:
        # Check if postgres container is running
        result = subprocess.run(['docker', 'ps', '--filter', 'ancestor=postgres', '--format', '{{.Names}}'],
                              capture_output=True, text=True, check=True)
        containers = result.stdout.strip().split('\n')
        if containers and containers[0]:
            return containers[0]

        # Try with name=db
        result = subprocess.run(['docker', 'ps', '--filter', 'name=db', '--format', '{{.Names}}'],
                              capture_output=True, text=True, check=True)
        containers = result.stdout.strip().split('\n')
        if containers and containers[0]:
            return containers[0]

    except subprocess.CalledProcessError:
        pass

    return None

def get_db_connection():
    """Get database connection, handling Docker containers"""
    container = get_docker_container()

    if container:
        print_step("Using Docker container for database connection")
        # For Docker, we'll use docker exec to run psql commands
        return {'docker_container': container}
    else:
        print_step("Using direct database connection")
        try:
            conn = psycopg2.connect(**DB_CONFIG)
            return {'direct': conn}
        except psycopg2.Error as e:
            print_error(f"Database connection failed: {e}")
            sys.exit(1)

def execute_sql(connection, sql, params=None):
    """Execute SQL with proper parameter handling"""
    if 'docker_container' in connection:
        container = connection['docker_container']

        # For Docker exec, we need to build the SQL string with parameters substituted
        if params:
            # Escape single quotes and format parameters
            formatted_params = []
            for param in params:
                if param is None or (isinstance(param, str) and param.strip() == ''):
                    formatted_params.append('NULL')
                elif isinstance(param, str):
                    # Escape single quotes by doubling them
                    escaped = param.replace("'", "''")
                    formatted_params.append(f"'{escaped}'")
                elif isinstance(param, bool):
                    formatted_params.append('true' if param else 'false')
                elif isinstance(param, (date, datetime)):
                    formatted_params.append(f"'{param.isoformat()}'")
                else:
                    formatted_params.append(str(param))

            # Replace %s placeholders with actual values
            sql_with_params = sql
            for param in formatted_params:
                sql_with_params = sql_with_params.replace('%s', param, 1)
        else:
            sql_with_params = sql

        cmd = ['docker', 'exec', container, 'psql', '-U', DB_CONFIG['user'], '-d', DB_CONFIG['database'], '-c', sql_with_params]
        try:
            result = subprocess.run(cmd, capture_output=True, text=True, check=True)
            return result.stdout
        except subprocess.CalledProcessError as e:
            print_error(f"SQL execution failed: {e.stderr.strip()}")
            raise
    else:
        conn = connection['direct']
        with conn.cursor() as cursor:
            cursor.execute(sql, params or ())
        conn.commit()

def check_existing_data(connection):
    """Check if database has existing data"""
    print_step("Checking for existing data...")

    try:
        # Count tables
        sql = "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE'"
        if 'docker_container' in connection:
            container = connection['docker_container']
            cmd = ['docker', 'exec', container, 'psql', '-U', DB_CONFIG['user'], '-d', DB_CONFIG['database'], '-t', '-c', sql]
            result = subprocess.run(cmd, capture_output=True, text=True, check=True)
            table_count = int(result.stdout.strip() or 0)
        else:
            conn = connection['direct']
            with conn.cursor() as cursor:
                cursor.execute(sql)
                table_count = cursor.fetchone()[0]

        if table_count > 0:
            print_warning(f"Found {table_count} existing tables")
            print()
            print("⚠️  WARNING: This will DELETE all existing data!")
            print("   • All user accounts will be lost")
            print("   • All property listings will be lost")
            print("   • All tenant information will be lost")
            print()

            response = input("Continue? (type 'yes' to confirm): ").strip().lower()
            if response != 'yes':
                print_step("Operation cancelled by user")
                sys.exit(0)
            return True
        else:
            print_success("No existing data found")
            return False

    except Exception as e:
        print_error(f"Error checking existing data: {e}")
        return False

def drop_all_tables(connection):
    """Drop all existing tables"""
    print_step("Dropping existing tables...")

    sql = """
    DO $$ DECLARE
        r RECORD;
    BEGIN
        FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
            EXECUTE 'DROP TABLE IF EXISTS ' || quote_ident(r.tablename) || ' CASCADE';
        END LOOP;
    END $$;
    """

    try:
        execute_sql(connection, sql)
        print_success("All tables dropped")
    except Exception as e:
        print_error(f"Error dropping tables: {e}")
        raise

def create_schema(connection):
    """Create fresh database schema"""
    print_step("Creating database schema...")

    schema_sql = """
    -- Enable UUID extension
    CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

    -- Create users table
    CREATE TABLE users (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      username VARCHAR(50) UNIQUE NOT NULL,
      name VARCHAR(100),
      email VARCHAR(255) UNIQUE NOT NULL,
      password VARCHAR(255),
      phone VARCHAR(20),
      role VARCHAR(20) DEFAULT 'user',
      is_email_verified BOOLEAN DEFAULT FALSE,
      is_phone_verified BOOLEAN DEFAULT FALSE,
      email_verification_token VARCHAR(255),
      email_verification_expires TIMESTAMP,
      password_reset_token VARCHAR(255),
      password_reset_expires TIMESTAMP,
      google_id VARCHAR(255),
      profile_picture VARCHAR(500),
      last_login TIMESTAMP,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    -- Create receipt_templates table
    CREATE TABLE receipt_templates (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      name VARCHAR(255) NOT NULL,
      type VARCHAR(50) UNIQUE NOT NULL,
      description TEXT,
      default_settings JSONB NOT NULL,
      is_active BOOLEAN DEFAULT TRUE,
      is_default BOOLEAN DEFAULT FALSE,
      sort_order INTEGER DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    -- Create properties table (buildings/containers)
    CREATE TABLE properties (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      name VARCHAR(255) NOT NULL,
      description TEXT,
      property_type VARCHAR(50) NOT NULL, -- apartment, house, villa, etc.
      status VARCHAR(50) DEFAULT 'active',
      address_street VARCHAR(255) NOT NULL,
      address_city VARCHAR(100) NOT NULL,
      address_state VARCHAR(100) NOT NULL,
      address_pincode VARCHAR(10) NOT NULL,
      address_landmark VARCHAR(255),
      total_area DECIMAL(10,2), -- total building area
      total_floors INTEGER,
      year_built INTEGER,
      parking_spaces INTEGER,
      owner_id UUID NOT NULL REFERENCES users(id),
      template_id UUID REFERENCES receipt_templates(id) ON DELETE SET NULL,
      template_overrides JSONB DEFAULT '{}'::jsonb,
      building_amenities JSONB DEFAULT '[]'::jsonb, -- shared amenities
      building_photos JSONB DEFAULT '[]'::jsonb, -- building exterior photos
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    -- Create units table (rentable units within properties)
    CREATE TABLE units (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
      unit_number VARCHAR(50) NOT NULL, -- e.g., "101", "A-201", "Ground Floor"
      unit_name VARCHAR(255), -- e.g., "Modern 2BHK Apartment - Unit 101"
      description TEXT,
      unit_type VARCHAR(50) NOT NULL, -- apartment, room, studio, etc.
      status VARCHAR(50) DEFAULT 'available', -- available, occupied, maintenance
      floor INTEGER,
      area DECIMAL(10,2) NOT NULL, -- unit area in sq ft
      bedrooms INTEGER,
      bathrooms INTEGER,
      balconies INTEGER,
      furnished BOOLEAN DEFAULT FALSE,
      monthly_rent DECIMAL(12,2) NOT NULL,
      security_deposit DECIMAL(12,2) NOT NULL,
      maintenance_charges DECIMAL(10,2),
      unit_amenities JSONB DEFAULT '[]'::jsonb, -- unit-specific amenities
      unit_photos JSONB DEFAULT '[]'::jsonb, -- unit interior photos
      max_occupants INTEGER DEFAULT 1, -- for shared housing
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(property_id, unit_number) -- unique unit numbers within property
    );

    -- Create tenants table
    CREATE TABLE tenants (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      first_name VARCHAR(100) NOT NULL,
      last_name VARCHAR(100) NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      phone VARCHAR(20),
      alternate_phone VARCHAR(20),
      date_of_birth DATE,
      gender VARCHAR(20),
      occupation VARCHAR(100),
      company_name VARCHAR(255),
      monthly_income DECIMAL(12,2),
      current_address_street VARCHAR(255) NOT NULL,
      current_address_city VARCHAR(100) NOT NULL,
      current_address_state VARCHAR(100) NOT NULL,
      current_address_pincode VARCHAR(10) NOT NULL,
      permanent_address_street VARCHAR(255),
      permanent_address_city VARCHAR(100),
      permanent_address_state VARCHAR(100),
      permanent_address_pincode VARCHAR(10),
      emergency_contact_name VARCHAR(100),
      emergency_contact_relationship VARCHAR(50),
      emergency_contact_phone VARCHAR(20),
      status VARCHAR(50) DEFAULT 'active',
      total_rentals INTEGER DEFAULT 0,
      current_property_id UUID,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    -- Create unit_tenants table (for shared housing support)
    CREATE TABLE unit_tenants (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      unit_id UUID NOT NULL REFERENCES units(id) ON DELETE CASCADE,
      tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
      is_primary_tenant BOOLEAN DEFAULT FALSE, -- main lease holder
      move_in_date DATE,
      move_out_date DATE,
      monthly_rent_share DECIMAL(12,2), -- tenant's share of rent
      security_deposit_share DECIMAL(12,2), -- tenant's share of deposit
      status VARCHAR(50) DEFAULT 'active', -- active, moved_out, evicted
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(unit_id, tenant_id) -- prevent duplicate assignments
    );

    -- Create tenant_documents table
    CREATE TABLE tenant_documents (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
      document_type VARCHAR(50) NOT NULL,
      document_number VARCHAR(100),
      file_url VARCHAR(500) NOT NULL,
      verified BOOLEAN DEFAULT FALSE,
      verified_by UUID REFERENCES users(id),
      uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    -- Create leases table (property-unit-tenant agreements)
    CREATE TABLE leases (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      property_id UUID NOT NULL REFERENCES properties(id),
      unit_id UUID NOT NULL REFERENCES units(id),
      primary_tenant_id UUID NOT NULL REFERENCES tenants(id), -- main lease holder
      start_date DATE NOT NULL,
      end_date DATE NOT NULL,
      monthly_rent DECIMAL(12,2) NOT NULL,
      security_deposit DECIMAL(12,2) NOT NULL,
      status VARCHAR(50) DEFAULT 'active', -- active, expired, terminated
      lease_terms TEXT, -- additional terms and conditions
      signed_at TIMESTAMP,
      created_by UUID NOT NULL REFERENCES users(id),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    -- Create rent_payments table
    CREATE TABLE rent_payments (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      lease_id UUID NOT NULL REFERENCES leases(id),
      property_id UUID NOT NULL REFERENCES properties(id),
      tenant_id UUID NOT NULL REFERENCES tenants(id),
      amount DECIMAL(12,2) NOT NULL,
      due_date DATE NOT NULL,
      paid_date DATE,
      status VARCHAR(50) DEFAULT 'pending',
      payment_method VARCHAR(50),
      transaction_id VARCHAR(255),
      payment_reference VARCHAR(255),
      late_fee DECIMAL(10,2),
      penalty_amount DECIMAL(10,2),
      rent_amount DECIMAL(12,2),
      maintenance_charges DECIMAL(10,2),
      other_charges DECIMAL(10,2),
      notes TEXT,
      created_by UUID NOT NULL REFERENCES users(id),
      updated_by UUID REFERENCES users(id),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    -- Create rent_transactions table (comprehensive rent collection)
    CREATE TABLE rent_transactions (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      lease_id UUID NOT NULL REFERENCES leases(id) ON DELETE CASCADE,
      unit_id UUID REFERENCES units(id),
      tenant_id UUID NOT NULL REFERENCES tenants(id),
      property_id UUID NOT NULL REFERENCES properties(id),
      billing_period_start DATE NOT NULL,
      billing_period_end DATE NOT NULL,
      billing_method VARCHAR(20) NOT NULL DEFAULT 'relative' CHECK (billing_method IN ('relative', 'fixed')),
      days_count INTEGER NOT NULL,
      base_rent DECIMAL(12,2) NOT NULL DEFAULT 0,
      previous_balance DECIMAL(12,2) NOT NULL DEFAULT 0,
      expenses JSONB NOT NULL DEFAULT '[]'::jsonb,
      total_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
      amount_paid DECIMAL(12,2) NOT NULL DEFAULT 0,
      new_balance DECIMAL(12,2) NOT NULL DEFAULT 0,
      paid_date DATE,
      status VARCHAR(20) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'finalized', 'paid', 'cancelled')),
      payment_method VARCHAR(50),
      transaction_id VARCHAR(255),
      payment_reference VARCHAR(255),
      late_fee DECIMAL(10,2) DEFAULT 0,
      penalty_amount DECIMAL(10,2) DEFAULT 0,
      receipt_number VARCHAR(100),
      receipt_generated BOOLEAN NOT NULL DEFAULT FALSE,
      notes TEXT,
      created_by UUID NOT NULL REFERENCES users(id),
      updated_by UUID REFERENCES users(id),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    -- Create meters table (utility meter management)
    CREATE TABLE meters (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      unit_id UUID NOT NULL REFERENCES units(id) ON DELETE CASCADE,
      property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
      meter_type VARCHAR(20) NOT NULL CHECK (meter_type IN ('electricity', 'water', 'gas')),
      meter_name VARCHAR(100) NOT NULL,
      meter_number VARCHAR(50),
      cost_per_unit DECIMAL(10,2) NOT NULL DEFAULT 0 CHECK (cost_per_unit >= 0),
      fixed_charge DECIMAL(10,2) DEFAULT 0 CHECK (fixed_charge >= 0),
      remarks TEXT,
      is_active BOOLEAN NOT NULL DEFAULT TRUE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    -- Create meter_readings table (monthly utility readings)
    CREATE TABLE meter_readings (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      meter_id UUID NOT NULL REFERENCES meters(id) ON DELETE CASCADE,
      reading_date DATE NOT NULL,
      previous_reading DECIMAL(12,2) NOT NULL DEFAULT 0 CHECK (previous_reading >= 0),
      current_reading DECIMAL(12,2) NOT NULL DEFAULT 0 CHECK (current_reading >= 0),
      units_consumed DECIMAL(12,2) NOT NULL DEFAULT 0 CHECK (units_consumed >= 0),
      total_cost DECIMAL(12,2) NOT NULL DEFAULT 0 CHECK (total_cost >= 0),
      meter_photo_url TEXT,
      rent_transaction_id UUID,
      recorded_by UUID NOT NULL REFERENCES users(id),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT check_readings CHECK (current_reading >= previous_reading)
    );

    -- Create receipts table
    CREATE TABLE receipts (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      receipt_number VARCHAR(50) NOT NULL UNIQUE,
      property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
      rent_transaction_id UUID REFERENCES rent_transactions(id) ON DELETE SET NULL,
      tenant_id UUID REFERENCES tenants(id) ON DELETE SET NULL,
      receipt_date DATE NOT NULL,
      amount DECIMAL(10,2) NOT NULL,
      description TEXT,
      receipt_data JSONB NOT NULL,
      pdf_url VARCHAR(500),
      file_size BIGINT,
      status VARCHAR(20) NOT NULL DEFAULT 'generated' CHECK (status IN ('generated', 'sent', 'downloaded')),
      generated_by UUID NOT NULL REFERENCES users(id),
      sent_to VARCHAR(255),
      sent_at TIMESTAMP WITH TIME ZONE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
    CREATE INDEX idx_users_email ON users(email);
    CREATE INDEX idx_users_username ON users(username);
    CREATE INDEX idx_properties_owner_id ON properties(owner_id);
    CREATE INDEX idx_units_property_id ON units(property_id);
    CREATE INDEX idx_units_status ON units(status);
    CREATE INDEX idx_tenants_email ON tenants(email);
    CREATE INDEX idx_unit_tenants_unit_id ON unit_tenants(unit_id);
    CREATE INDEX idx_unit_tenants_tenant_id ON unit_tenants(tenant_id);
    CREATE INDEX idx_leases_property_id ON leases(property_id);
    CREATE INDEX idx_leases_unit_id ON leases(unit_id);
    CREATE INDEX idx_leases_primary_tenant_id ON leases(primary_tenant_id);
    CREATE INDEX idx_rent_payments_lease_id ON rent_payments(lease_id);
    CREATE INDEX idx_rent_payments_tenant_id ON rent_payments(tenant_id);
    CREATE INDEX idx_rent_payments_property_id ON rent_payments(property_id);
    CREATE INDEX idx_meters_unit_id ON meters(unit_id);
    CREATE INDEX idx_meters_property_id ON meters(property_id);
    CREATE INDEX idx_meter_readings_meter_id ON meter_readings(meter_id);
    CREATE INDEX idx_meter_readings_reading_date ON meter_readings(reading_date);
    CREATE INDEX idx_receipts_property_id ON receipts(property_id);
    CREATE INDEX idx_receipts_rent_transaction_id ON receipts(rent_transaction_id);
    CREATE INDEX idx_receipts_tenant_id ON receipts(tenant_id);
    CREATE INDEX idx_receipts_receipt_number ON receipts(receipt_number);
    CREATE INDEX idx_receipts_status ON receipts(status);
    CREATE INDEX idx_receipts_created_at ON receipts(created_at);
    """

    try:
        execute_sql(connection, schema_sql)
        print_success("Database schema created")
    except Exception as e:
        print_error(f"Error creating schema: {e}")
        raise

def load_excel_data():
    """Load data from Excel file"""
    print_step("Loading Excel data...")

    excel_file = 'test_data/test_data.xlsx'
    if not os.path.exists(excel_file):
        print_error(f"Excel file not found: {excel_file}")
        sys.exit(1)

    try:
        # Read all sheets except Instructions
        sheets = pd.read_excel(excel_file, sheet_name=None, dtype=str)
        if 'Instructions' in sheets:
            del sheets['Instructions']

        print_success(f"Loaded {len(sheets)} data sheets")
        return sheets

    except Exception as e:
        print_error(f"Error loading Excel: {e}")
        sys.exit(1)

def convert_value(value, target_type):
    """Convert string value to appropriate type"""
    if pd.isna(value) or str(value).strip() == '':
        return None

    value_str = str(value).strip()

    try:
        if target_type == 'boolean':
            return value_str.lower() in ['true', '1', 'yes', 'y']
        elif target_type == 'integer':
            return int(float(value_str))
        elif target_type == 'decimal':
            return float(value_str)
        elif target_type == 'date':
            return datetime.strptime(value_str, '%Y-%m-%d').date()
        elif target_type == 'jsonb':
            # For Docker exec, we need to escape JSON properly
            if value_str.startswith('[') and value_str.endswith(']'):
                # It's already JSON array syntax
                return value_str
            else:
                # Parse and convert to JSON
                parsed = json.loads(value_str) if value_str else []
                return json.dumps(parsed)
        else:
            return value_str
    except:
        return None

def hash_password(password):
    """Hash password using bcrypt"""
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def seed_users(connection, df):
    """Seed users table"""
    print_step("Seeding users...")

    for _, row in df.iterrows():
        user_data = {
            'username': row.get('username', '').strip(),
            'email': row.get('email', '').strip(),
            'password': hash_password(row.get('password', 'password123')),
            'phone': row.get('phone'),
            'role': row.get('role', 'user'),
            'is_email_verified': convert_value(row.get('is_email_verified'), 'boolean'),
            'is_phone_verified': convert_value(row.get('is_phone_verified'), 'boolean')
        }

        columns = ['username', 'email', 'password', 'phone', 'role', 'is_email_verified', 'is_phone_verified']
        values = [user_data[col] for col in columns]

        sql = f"""
        INSERT INTO users ({', '.join(columns)})
        VALUES ({', '.join(['%s'] * len(columns))})
        """

        execute_sql(connection, sql, values)

    print_success(f"Seeded {len(df)} users")

def seed_properties(connection, df):
    """Seed properties table (buildings)"""
    print_step("Seeding properties...")

    for _, row in df.iterrows():
        prop_data = {
            'name': row.get('name', '').strip(),
            'description': row.get('description'),
            'property_type': row.get('property_type', 'apartment'),
            'status': row.get('status', 'active'),
            'address_street': row.get('address_street'),
            'address_city': row.get('address_city'),
            'address_state': row.get('address_state'),
            'address_pincode': row.get('address_pincode'),
            'address_landmark': row.get('address_landmark'),
            'total_area': convert_value(row.get('total_area'), 'decimal'),
            'total_floors': convert_value(row.get('total_floors'), 'integer'),
            'year_built': convert_value(row.get('year_built'), 'integer'),
            'parking_spaces': convert_value(row.get('parking_spaces'), 'integer'),
            'owner_id': get_user_id_by_username(connection, row.get('owner_username')),
            'building_amenities': convert_value(row.get('building_amenities'), 'jsonb'),
            'building_photos': convert_value(row.get('building_photos'), 'jsonb')
        }

        columns = ['name', 'description', 'property_type', 'status', 'address_street',
                  'address_city', 'address_state', 'address_pincode', 'address_landmark',
                  'total_area', 'total_floors', 'year_built', 'parking_spaces', 'owner_id',
                  'building_amenities', 'building_photos']
        values = [prop_data[col] for col in columns]

        sql = f"""
        INSERT INTO properties ({', '.join(columns)})
        VALUES ({', '.join(['%s'] * len(columns))})
        """

        execute_sql(connection, sql, values)

    print_success(f"Seeded {len(df)} properties")

def seed_units(connection, df):
    """Seed units table"""
    print_step("Seeding units...")

    for _, row in df.iterrows():
        unit_data = {
            'property_id': get_property_id_by_name(connection, row.get('property_name')),
            'unit_number': row.get('unit_number', '').strip(),
            'unit_name': row.get('unit_name'),
            'description': row.get('description'),
            'unit_type': row.get('unit_type', 'apartment'),
            'status': row.get('status', 'available'),
            'floor': convert_value(row.get('floor'), 'integer'),
            'area': convert_value(row.get('area'), 'decimal'),
            'bedrooms': convert_value(row.get('bedrooms'), 'integer'),
            'bathrooms': convert_value(row.get('bathrooms'), 'integer'),
            'balconies': convert_value(row.get('balconies'), 'integer'),
            'furnished': convert_value(row.get('furnished'), 'boolean'),
            'monthly_rent': convert_value(row.get('monthly_rent'), 'decimal'),
            'security_deposit': convert_value(row.get('security_deposit'), 'decimal'),
            'maintenance_charges': convert_value(row.get('maintenance_charges'), 'decimal'),
            'unit_amenities': convert_value(row.get('unit_amenities'), 'jsonb'),
            'unit_photos': convert_value(row.get('unit_photos'), 'jsonb'),
            'max_occupants': convert_value(row.get('max_occupants'), 'integer')
        }

        columns = ['property_id', 'unit_number', 'unit_name', 'description', 'unit_type', 'status',
                  'floor', 'area', 'bedrooms', 'bathrooms', 'balconies', 'furnished', 'monthly_rent',
                  'security_deposit', 'maintenance_charges', 'unit_amenities', 'unit_photos', 'max_occupants']
        values = [unit_data[col] for col in columns]

        sql = f"""
        INSERT INTO units ({', '.join(columns)})
        VALUES ({', '.join(['%s'] * len(columns))})
        """

        execute_sql(connection, sql, values)

    print_success(f"Seeded {len(df)} units")

def seed_tenants(connection, df):
    """Seed tenants table"""
    print_step("Seeding tenants...")

    for _, row in df.iterrows():
        tenant_data = {
            'first_name': row.get('first_name'),
            'last_name': row.get('last_name'),
            'email': row.get('email', '').strip(),
            'phone': row.get('phone'),
            'alternate_phone': row.get('alternate_phone'),
            'date_of_birth': convert_value(row.get('date_of_birth'), 'date'),
            'gender': row.get('gender'),
            'occupation': row.get('occupation'),
            'monthly_income': convert_value(row.get('monthly_income'), 'decimal'),
            'current_address_street': row.get('current_address_street'),
            'current_address_city': row.get('current_address_city'),
            'current_address_state': row.get('current_address_state'),
            'current_address_pincode': row.get('current_address_pincode'),
            'emergency_contact_name': row.get('emergency_contact_name'),
            'emergency_contact_relationship': row.get('emergency_contact_relationship'),
            'emergency_contact_phone': row.get('emergency_contact_phone'),
            'status': row.get('status', 'active')
        }

        columns = ['first_name', 'last_name', 'email', 'phone', 'alternate_phone', 'date_of_birth',
                  'gender', 'occupation', 'monthly_income', 'current_address_street', 'current_address_city',
                  'current_address_state', 'current_address_pincode', 'emergency_contact_name',
                  'emergency_contact_relationship', 'emergency_contact_phone', 'status']
        values = [tenant_data[col] for col in columns]

        sql = f"""
        INSERT INTO tenants ({', '.join(columns)})
        VALUES ({', '.join(['%s'] * len(columns))})
        """

        execute_sql(connection, sql, values)

    print_success(f"Seeded {len(df)} tenants")

def seed_unit_tenants(connection, df):
    """Seed unit_tenants table (tenant-unit assignments)"""
    print_step("Seeding unit-tenant assignments...")

    for _, row in df.iterrows():
        unit_tenant_data = {
            'unit_id': get_unit_id(connection, row.get('property_name'), row.get('unit_number')),
            'tenant_id': get_tenant_id_by_email(connection, row.get('tenant_email')),
            'is_primary_tenant': convert_value(row.get('is_primary_tenant'), 'boolean'),
            'move_in_date': convert_value(row.get('move_in_date'), 'date'),
            'move_out_date': convert_value(row.get('move_out_date'), 'date'),
            'monthly_rent_share': convert_value(row.get('monthly_rent_share'), 'decimal'),
            'security_deposit_share': convert_value(row.get('security_deposit_share'), 'decimal'),
            'status': row.get('status', 'active')
        }

        columns = ['unit_id', 'tenant_id', 'is_primary_tenant', 'move_in_date', 'move_out_date',
                  'monthly_rent_share', 'security_deposit_share', 'status']
        values = [unit_tenant_data[col] for col in columns]

        sql = f"""
        INSERT INTO unit_tenants ({', '.join(columns)})
        VALUES ({', '.join(['%s'] * len(columns))})
        """

        execute_sql(connection, sql, values)

    print_success(f"Seeded {len(df)} unit-tenant assignments")

def get_user_id_by_username(connection, username):
    """Get user ID by username"""
    if not username:
        return None

    sql = "SELECT id FROM users WHERE username = %s"
    if 'docker_container' in connection:
        container = connection['docker_container']
        cmd = ['docker', 'exec', container, 'psql', '-U', DB_CONFIG['user'], '-d', DB_CONFIG['database'],
               '-t', '-c', f"SELECT id FROM users WHERE username = '{username}'"]
        try:
            result = subprocess.run(cmd, capture_output=True, text=True, check=True)
            return result.stdout.strip()
        except:
            return None
    else:
        conn = connection['direct']
        with conn.cursor() as cursor:
            cursor.execute(sql, (username,))
            result = cursor.fetchone()
            return result[0] if result else None

def get_property_id_by_name(connection, name):
    """Get property ID by name"""
    if not name:
        return None

    sql = "SELECT id FROM properties WHERE name = %s"
    if 'docker_container' in connection:
        container = connection['docker_container']
        cmd = ['docker', 'exec', container, 'psql', '-U', DB_CONFIG['user'], '-d', DB_CONFIG['database'],
               '-t', '-c', f"SELECT id FROM properties WHERE name = '{name}'"]
        try:
            result = subprocess.run(cmd, capture_output=True, text=True, check=True)
            return result.stdout.strip()
        except:
            return None
    else:
        conn = connection['direct']
        with conn.cursor() as cursor:
            cursor.execute(sql, (name,))
            result = cursor.fetchone()
            return result[0] if result else None

def get_unit_id(connection, property_name, unit_number):
    """Get unit ID by property name and unit number"""
    if not property_name or not unit_number:
        return None

    property_id = get_property_id_by_name(connection, property_name)
    if not property_id:
        return None

    sql = "SELECT id FROM units WHERE property_id = %s AND unit_number = %s"
    if 'docker_container' in connection:
        container = connection['docker_container']
        cmd = ['docker', 'exec', container, 'psql', '-U', DB_CONFIG['user'], '-d', DB_CONFIG['database'],
               '-t', '-c', f"SELECT id FROM units WHERE property_id = '{property_id}' AND unit_number = '{unit_number}'"]
        try:
            result = subprocess.run(cmd, capture_output=True, text=True, check=True)
            return result.stdout.strip()
        except:
            return None
    else:
        conn = connection['direct']
        with conn.cursor() as cursor:
            cursor.execute(sql, (property_id, unit_number))
            result = cursor.fetchone()
            return result[0] if result else None

def seed_leases(connection, df):
    """Seed leases table"""
    print_step("Seeding leases...")

    for _, row in df.iterrows():
        lease_data = {
            'property_id': get_property_id_by_name(connection, row.get('property_name')),
            'unit_id': get_unit_id(connection, row.get('property_name'), row.get('unit_number')),
            'primary_tenant_id': get_tenant_id_by_email(connection, row.get('primary_tenant_email')),
            'start_date': convert_value(row.get('start_date'), 'date'),
            'end_date': convert_value(row.get('end_date'), 'date'),
            'monthly_rent': convert_value(row.get('monthly_rent'), 'decimal'),
            'security_deposit': convert_value(row.get('security_deposit'), 'decimal'),
            'status': row.get('status', 'active'),
            'lease_terms': row.get('lease_terms'),
            'signed_at': convert_value(row.get('signed_at'), 'date'),
            'created_by': get_user_id_by_username(connection, row.get('created_by_username'))
        }

        columns = ['property_id', 'unit_id', 'primary_tenant_id', 'start_date', 'end_date',
                  'monthly_rent', 'security_deposit', 'status', 'lease_terms', 'signed_at', 'created_by']
        values = [lease_data[col] for col in columns]

        sql = f"""
        INSERT INTO leases ({', '.join(columns)})
        VALUES ({', '.join(['%s'] * len(columns))})
        """

        execute_sql(connection, sql, values)

    print_success(f"Seeded {len(df)} leases")

def get_tenant_id_by_email(connection, email):
    """Get tenant ID by email"""
    if not email:
        return None

    sql = "SELECT id FROM tenants WHERE email = %s"
    if 'docker_container' in connection:
        container = connection['docker_container']
        cmd = ['docker', 'exec', container, 'psql', '-U', DB_CONFIG['user'], '-d', DB_CONFIG['database'],
               '-t', '-c', f"SELECT id FROM tenants WHERE email = '{email}'"]
        try:
            result = subprocess.run(cmd, capture_output=True, text=True, check=True)
            return result.stdout.strip()
        except:
            return None
    else:
        conn = connection['direct']
        with conn.cursor() as cursor:
            cursor.execute(sql, (email,))
            result = cursor.fetchone()
            return result[0] if result else None

def seed_payments(connection, df):
    """Seed rent payments table"""
    print_step("Seeding payments...")

    for _, row in df.iterrows():
        payment_data = {
            'lease_id': get_lease_id(connection, row.get('property_name'), row.get('unit_number'), row.get('primary_tenant_email')),
            'property_id': get_property_id_by_name(connection, row.get('property_name')),
            'tenant_id': get_tenant_id_by_email(connection, row.get('tenant_email')),
            'amount': convert_value(row.get('amount'), 'decimal'),
            'due_date': convert_value(row.get('due_date'), 'date'),
            'paid_date': convert_value(row.get('paid_date'), 'date'),
            'status': row.get('status', 'pending'),
            'payment_method': row.get('payment_method'),
            'notes': row.get('notes'),
            'created_by': get_user_id_by_username(connection, row.get('created_by_username'))
        }

        columns = ['lease_id', 'property_id', 'tenant_id', 'amount', 'due_date', 'paid_date', 'status',
                  'payment_method', 'notes', 'created_by']
        values = [payment_data[col] for col in columns]

        sql = f"""
        INSERT INTO rent_payments ({', '.join(columns)})
        VALUES ({', '.join(['%s'] * len(columns))})
        """

        execute_sql(connection, sql, values)

    print_success(f"Seeded {len(df)} payments")

def seed_receipt_templates(connection):
    """Seed receipt templates table"""
    print_step("Seeding receipt templates...")

    templates = [
        {
            'name': 'Basic Template',
            'type': 'basic',
            'description': 'Simple and clean receipt template for basic needs',
            'default_settings': {
                'theme': {'primaryColor': '#2563eb', 'secondaryColor': '#64748b', 'fontFamily': 'Arial, sans-serif', 'fontSize': 'medium'},
                'layout': {'showLogo': False, 'logoPosition': 'top-left', 'showWatermark': False, 'paperSize': 'a4', 'orientation': 'portrait'},
                'content': {'showPropertyAddress': True, 'showTenantAddress': True, 'showPaymentBreakdown': True, 'showBalanceForward': True, 'showTermsAndConditions': False, 'showSignature': True, 'signatureText': 'Landlord Signature'},
                'paymentOptions': {'showBankDetails': True, 'showUPI': True, 'showQRCode': False, 'showWallets': False},
                'numbering': {'prefix': 'REC', 'startNumber': 1, 'includeYear': True, 'includeMonth': True}
            },
            'is_active': True,
            'is_default': True,
            'sort_order': 1
        },
        {
            'name': 'Professional Template',
            'type': 'professional',
            'description': 'Professional template with enhanced styling and features',
            'default_settings': {
                'theme': {'primaryColor': '#1e40af', 'secondaryColor': '#374151', 'fontFamily': 'Georgia, serif', 'fontSize': 'medium'},
                'layout': {'showLogo': True, 'logoPosition': 'top-center', 'showWatermark': True, 'watermarkText': 'OFFICIAL RECEIPT', 'paperSize': 'a4', 'orientation': 'portrait'},
                'content': {'showPropertyAddress': True, 'showTenantAddress': True, 'showPaymentBreakdown': True, 'showBalanceForward': True, 'showTermsAndConditions': True, 'termsAndConditionsText': 'This receipt is computer generated and does not require signature.', 'showSignature': True, 'signatureText': 'Authorized Signatory'},
                'paymentOptions': {'showBankDetails': True, 'showUPI': True, 'showQRCode': True, 'showWallets': True},
                'numbering': {'prefix': 'RNT', 'startNumber': 1, 'includeYear': True, 'includeMonth': True}
            },
            'is_active': True,
            'is_default': False,
            'sort_order': 2
        },
        {
            'name': 'Premium Template',
            'type': 'premium',
            'description': 'Premium template with advanced features and elegant design',
            'default_settings': {
                'theme': {'primaryColor': '#7c3aed', 'secondaryColor': '#1f2937', 'fontFamily': 'Times New Roman, serif', 'fontSize': 'large'},
                'layout': {'showLogo': True, 'logoPosition': 'top-center', 'showWatermark': True, 'watermarkText': 'CONFIDENTIAL', 'paperSize': 'a4', 'orientation': 'portrait'},
                'content': {'showPropertyAddress': True, 'showTenantAddress': True, 'showPaymentBreakdown': True, 'showBalanceForward': True, 'showTermsAndConditions': True, 'termsAndConditionsText': 'This is an official receipt. All payments are subject to verification. For any queries, please contact the property management office.', 'showSignature': True, 'signatureText': 'Property Manager'},
                'paymentOptions': {'showBankDetails': True, 'showUPI': True, 'showQRCode': True, 'showWallets': True},
                'numbering': {'prefix': 'PMR', 'startNumber': 1, 'includeYear': True, 'includeMonth': True}
            },
            'is_active': True,
            'is_default': False,
            'sort_order': 3
        }
    ]

    for template in templates:
        # Check if template already exists
        if 'docker_container' in connection:
            container = connection['docker_container']
            cmd = ['docker', 'exec', container, 'psql', '-U', DB_CONFIG['user'], '-d', DB_CONFIG['database'],
                   '-t', '-c', f"SELECT COUNT(*) FROM receipt_templates WHERE type = '{template['type']}'"]
            try:
                result = subprocess.run(cmd, capture_output=True, text=True, check=True)
                count = int(result.stdout.strip() or 0)
                if count > 0:
                    print(f"Template {template['type']} already exists, skipping...")
                    continue
            except:
                pass  # Continue with insertion if check fails
        else:
            conn = connection['direct']
            with conn.cursor() as cursor:
                cursor.execute("SELECT COUNT(*) FROM receipt_templates WHERE type = %s", (template['type'],))
                count = cursor.fetchone()[0]
                if count > 0:
                    print(f"Template {template['type']} already exists, skipping...")
                    continue

        template_data = {
            'name': template['name'],
            'type': template['type'],
            'description': template['description'],
            'default_settings': json.dumps(template['default_settings']),
            'is_active': template['is_active'],
            'is_default': template['is_default'],
            'sort_order': template['sort_order']
        }

        columns = ['name', 'type', 'description', 'default_settings', 'is_active', 'is_default', 'sort_order']
        values = [template_data[col] for col in columns]

        sql = f"""
        INSERT INTO receipt_templates ({', '.join(columns)})
        VALUES ({', '.join(['%s'] * len(columns))})
        """

        execute_sql(connection, sql, values)

    print_success(f"Seeded receipt templates")

def get_lease_id(connection, property_name, unit_number, primary_tenant_email):
    """Get lease ID by property, unit, and primary tenant"""
    if not property_name or not unit_number or not primary_tenant_email:
        return None

    property_id = get_property_id_by_name(connection, property_name)
    unit_id = get_unit_id(connection, property_name, unit_number)
    tenant_id = get_tenant_id_by_email(connection, primary_tenant_email)

    if not property_id or not unit_id or not tenant_id:
        return None

    sql = "SELECT id FROM leases WHERE property_id = %s AND unit_id = %s AND primary_tenant_id = %s"
    if 'docker_container' in connection:
        container = connection['docker_container']
        cmd = ['docker', 'exec', container, 'psql', '-U', DB_CONFIG['user'], '-d', DB_CONFIG['database'],
               '-t', '-c', f"SELECT id FROM leases WHERE property_id = '{property_id}' AND unit_id = '{unit_id}' AND primary_tenant_id = '{tenant_id}'"]
        try:
            result = subprocess.run(cmd, capture_output=True, text=True, check=True)
            return result.stdout.strip()
        except:
            return None
    else:
        conn = connection['direct']
        with conn.cursor() as cursor:
            cursor.execute(sql, (property_id, unit_id, tenant_id))
            result = cursor.fetchone()
            return result[0] if result else None

def show_credentials(sheets):
    """Show test credentials"""
    print()
    print("🔐 Test Credentials:")
    if 'users' in sheets:
        for _, row in sheets['users'].iterrows():
            username = row.get('username', '').strip()
            password = row.get('password', 'password123')
            if username:
                print(f"   • {username}: {password}")

def main():
    """Main function"""
    print("🗄️  Asset Management Database Seeding")
    print("=" * 40)
    print()

    # Get database connection
    connection = get_db_connection()

    # Check for existing data
    has_existing_data = check_existing_data(connection)

    # Drop tables if needed
    if has_existing_data:
        drop_all_tables(connection)

    # Create fresh schema
    create_schema(connection)

    # Load Excel data
    sheets = load_excel_data()

    # Seed data in order
    if 'users' in sheets:
        seed_users(connection, sheets['users'])

    if 'properties' in sheets:
        seed_properties(connection, sheets['properties'])

    if 'units' in sheets:
        seed_units(connection, sheets['units'])

    if 'tenants' in sheets:
        seed_tenants(connection, sheets['tenants'])

    if 'unit_tenants' in sheets:
        seed_unit_tenants(connection, sheets['unit_tenants'])

    if 'leases' in sheets:
        seed_leases(connection, sheets['leases'])

    if 'rent_payments' in sheets:
        seed_payments(connection, sheets['rent_payments'])

    # Seed receipt templates (always seed these)
    seed_receipt_templates(connection)

    # Show credentials
    show_credentials(sheets)

    # Close connection
    if 'direct' in connection:
        connection['direct'].close()

    print()
    print_success("Database seeding completed!")
    print()
    print("Your database now has fresh test data. 🎉")

if __name__ == "__main__":
    main()