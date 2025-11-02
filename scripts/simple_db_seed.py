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
      email VARCHAR(255) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      phone VARCHAR(20),
      role VARCHAR(20) DEFAULT 'user',
      is_email_verified BOOLEAN DEFAULT FALSE,
      is_phone_verified BOOLEAN DEFAULT FALSE,
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
      phone VARCHAR(20) NOT NULL,
      alternate_phone VARCHAR(20),
      date_of_birth DATE,
      gender VARCHAR(20),
      occupation VARCHAR(100),
      company_name VARCHAR(255),
      monthly_income DECIMAL(12,2),
      current_address_street VARCHAR(255),
      current_address_city VARCHAR(100),
      current_address_state VARCHAR(100),
      current_address_pincode VARCHAR(10),
      permanent_address_street VARCHAR(255),
      permanent_address_city VARCHAR(100),
      permanent_address_state VARCHAR(100),
      permanent_address_pincode VARCHAR(10),
      emergency_contact_name VARCHAR(100),
      emergency_contact_relationship VARCHAR(50),
      emergency_contact_phone VARCHAR(20),
      status VARCHAR(50) DEFAULT 'active',
      total_rentals INTEGER DEFAULT 0,
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
      tenant_id UUID NOT NULL REFERENCES tenants(id), -- which tenant paid
      amount DECIMAL(12,2) NOT NULL,
      due_date DATE NOT NULL,
      paid_date DATE,
      status VARCHAR(50) DEFAULT 'pending', -- pending, paid, overdue, partial
      payment_method VARCHAR(50),
      notes TEXT,
      created_by UUID NOT NULL REFERENCES users(id),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    -- Create indexes for performance
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
            'tenant_id': get_tenant_id_by_email(connection, row.get('tenant_email')),
            'amount': convert_value(row.get('amount'), 'decimal'),
            'due_date': convert_value(row.get('due_date'), 'date'),
            'paid_date': convert_value(row.get('paid_date'), 'date'),
            'status': row.get('status', 'pending'),
            'payment_method': row.get('payment_method'),
            'notes': row.get('notes'),
            'created_by': get_user_id_by_username(connection, row.get('created_by_username'))
        }

        columns = ['lease_id', 'tenant_id', 'amount', 'due_date', 'paid_date', 'status',
                  'payment_method', 'notes', 'created_by']
        values = [payment_data[col] for col in columns]

        sql = f"""
        INSERT INTO rent_payments ({', '.join(columns)})
        VALUES ({', '.join(['%s'] * len(columns))})
        """

        execute_sql(connection, sql, values)

    print_success(f"Seeded {len(df)} payments")

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