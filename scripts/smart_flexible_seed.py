#!/usr/bin/env python3
"""
Smart Database Seeding from Excel with Dynamic UUID Generation
Reads simplified Excel data (no UUIDs) and generates UUIDs dynamically
while maintaining foreign key relationships through mappings.
"""

import os
import sys
import psycopg2
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT
import bcrypt
import uuid
import pandas as pd
from urllib.parse import urlparse
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Color codes for terminal output
GREEN = '\033[92m'
RED = '\033[91m'
BLUE = '\033[94m'
YELLOW = '\033[93m'
RESET = '\033[0m'

SEED_DATA_FILE = 'scripts/seed_data/seed_data.xlsx'

# UUID mappings to maintain foreign key relationships
user_uuids = {}
tenant_uuids = {}
property_uuids = {}
unit_uuids = {}
lease_uuids = {}
meter_uuids = {}

def print_success(msg):
    print(f"{GREEN}✅ {msg}{RESET}")

def print_error(msg):
    print(f"{RED}❌ {msg}{RESET}")

def print_step(msg):
    print(f"{BLUE}🚀 {msg}{RESET}")

def print_info(msg):
    print(f"{YELLOW}ℹ️  {msg}{RESET}")

def parse_database_url(database_url):
    """Parse DATABASE_URL into connection parameters"""
    if not database_url:
        return None
    
    try:
        result = urlparse(database_url)
        return {
            'host': result.hostname or 'localhost',
            'port': result.port or 5432,
            'database': result.path.lstrip('/') if result.path else 'asset_management',
            'user': result.username or 'postgres',
            'password': result.password or 'postgres'
        }
    except Exception as e:
        print_error(f"Error parsing DATABASE_URL: {e}")
        return None

def get_db_config():
    """Get database configuration from .env file or environment variables"""
    # Try to parse DATABASE_URL first
    database_url = os.getenv('DATABASE_URL')
    if database_url:
        config = parse_database_url(database_url)
        if config:
            return config
    
    # Fall back to individual environment variables
    return {
        'host': os.getenv('DB_HOST', 'localhost'),
        'port': int(os.getenv('DB_PORT', 5432)),
        'database': os.getenv('DB_NAME', 'asset_management'),
        'user': os.getenv('DB_USER', 'postgres'),
        'password': os.getenv('DB_PASSWORD', 'postgres')
    }

def load_excel_data(filename):
    """Load all sheets from Excel file"""
    print_step(f"Loading seed data from {filename}...")
    
    if not os.path.exists(filename):
        print_error(f"Seed data file not found: {filename}")
        print_info("Run 'python3 scripts/smart_seed_excel.py' first to create it")
        return None
    
    try:
        excel_file = pd.ExcelFile(filename)
        data = {}
        
        # Define integer columns for each sheet to prevent decimal conversion
        integer_columns = {
            'users': [],
            'tenants': ['monthly_income', 'total_rentals'],
            'properties': ['total_units', 'total_floors', 'parking_spaces'],
            'units': ['floor', 'bedrooms', 'bathrooms', 'area', 'monthly_rent', 'security_deposit', 'maintenance_charges'],
            'leases': ['monthly_rent', 'security_deposit'],
            'rent_payments': ['amount'],
            'meters': [],
            'meter_readings': ['reading_value']
        }
        
        for sheet_name in excel_file.sheet_names:
            df = pd.read_excel(excel_file, sheet_name=sheet_name)
            
            # Convert specified columns to integers (handling NaN properly)
            if sheet_name in integer_columns:
                for col in integer_columns[sheet_name]:
                    if col in df.columns:
                        # Convert to Int64 (nullable integer type) to handle NaN
                        df[col] = pd.to_numeric(df[col], errors='coerce').astype('Int64')
                        # Convert Int64 to regular int where not null, None where null
                        df[col] = df[col].apply(lambda x: int(x) if pd.notna(x) else None)
            
            # Replace NaN with None for proper NULL handling
            df = df.where(pd.notna(df), None)
            data[sheet_name] = df
            print_info(f"Loaded {len(df)} rows from '{sheet_name}'")
        
        print_success(f"Loaded {len(data)} sheets from Excel")
        return data
    except Exception as e:
        print_error(f"Error loading Excel file: {e}")
        return None

def hash_password(password):
    """Hash password using bcrypt"""
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def seed_users(conn, df):
    """Seed users with dynamic UUID generation"""
    print_step("Seeding users...")
    
    cursor = conn.cursor()
    seeded = 0
    
    for _, row in df.iterrows():
        try:
            # Generate UUID
            user_id = str(uuid.uuid4())
            user_uuids[row['key']] = user_id
            
            # Hash password
            hashed_pwd = hash_password(row['password_plain'])
            
            cursor.execute("""
                INSERT INTO users (
                    id, username, email, password_hash, phone, role,
                    is_email_verified, is_phone_verified
                ) VALUES (
                    %s, %s, %s, %s, %s, %s, %s, %s
                )
                ON CONFLICT (email) DO NOTHING
            """, (
                user_id, row['username'], row['email'], hashed_pwd,
                row.get('phone'), row.get('role', 'user'),
                row.get('is_email_verified', False),
                row.get('is_phone_verified', False)
            ))
            seeded += 1
        except Exception as e:
            print_error(f"Error seeding user {row.get('key', 'unknown')}: {e}")
    
    cursor.close()
    print_success(f"Seeded {seeded} users")

def seed_tenants(conn, df):
    """Seed tenants with dynamic UUID generation"""
    print_step("Seeding tenants...")
    
    cursor = conn.cursor()
    seeded = 0
    
    for _, row in df.iterrows():
        try:
            # Generate UUID
            tenant_id = str(uuid.uuid4())
            tenant_uuids[row['key']] = tenant_id
            
            cursor.execute("""
                INSERT INTO tenants (
                    id, first_name, last_name, email, phone, alternate_phone,
                    date_of_birth, gender, occupation, company_name, monthly_income,
                    current_address_street, current_address_city, current_address_state,
                    current_address_pincode, permanent_address_street, permanent_address_city,
                    permanent_address_state, permanent_address_pincode,
                    emergency_contact_name, emergency_contact_relationship,
                    emergency_contact_phone, status, total_rentals
                ) VALUES (
                    %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s,
                    %s, %s, %s, %s, %s, %s, %s, %s, %s
                )
                ON CONFLICT (id) DO NOTHING
            """, (
                tenant_id, row['first_name'], row['last_name'], row.get('email'),
                row.get('phone'), row.get('alternate_phone'), row.get('date_of_birth'),
                row.get('gender'), row.get('occupation'), row.get('company_name'),
                row.get('monthly_income'), row.get('current_address_street'),
                row.get('current_address_city'), row.get('current_address_state'),
                row.get('current_address_pincode'), row.get('permanent_address_street'),
                row.get('permanent_address_city'), row.get('permanent_address_state'),
                row.get('permanent_address_pincode'), row.get('emergency_contact_name'),
                row.get('emergency_contact_relationship'), row.get('emergency_contact_phone'),
                row.get('status', 'active'), row.get('total_rentals', 0)
            ))
            seeded += 1
        except Exception as e:
            print_error(f"Error seeding tenant {row.get('key', 'unknown')}: {e}")
    
    cursor.close()
    print_success(f"Seeded {seeded} tenants")

def seed_properties(conn, df):
    """Seed properties with owner FK resolution"""
    print_step("Seeding properties...")
    
    cursor = conn.cursor()
    seeded = 0
    
    for _, row in df.iterrows():
        try:
            # Generate UUID
            property_id = str(uuid.uuid4())
            property_uuids[row['key']] = property_id
            
            # Resolve owner FK
            owner_id = user_uuids.get(row['owner_key'])
            if not owner_id:
                print_error(f"Owner key '{row['owner_key']}' not found for property '{row['key']}'")
                continue
            
            cursor.execute("""
                INSERT INTO properties (
                    id, name, description, property_type, status,
                    address_street, address_city, address_state, address_pincode,
                    area, total_floors, parking_spaces, owner_id
                ) VALUES (
                    %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s
                )
                ON CONFLICT (id) DO NOTHING
            """, (
                property_id, row['name'], row.get('description'),
                row.get('property_type', 'apartment'), row.get('status', 'active'),
                row.get('address_street'), row.get('address_city'),
                row.get('address_state'), row.get('address_pincode'),
                row.get('area'), row.get('total_floors'), row.get('parking_spaces'),
                owner_id
            ))
            seeded += 1
        except Exception as e:
            print_error(f"Error seeding property {row.get('key', 'unknown')}: {e}")
    
    cursor.close()
    print_success(f"Seeded {seeded} properties")

def seed_units(conn, df):
    """Seed units with property FK resolution"""
    print_step("Seeding units...")
    
    cursor = conn.cursor()
    seeded = 0
    
    for _, row in df.iterrows():
        try:
            # Generate UUID
            unit_id = str(uuid.uuid4())
            unit_uuids[row['key']] = unit_id
            
            # Resolve property FK
            property_id = property_uuids.get(row['property_key'])
            if not property_id:
                print_error(f"Property key '{row['property_key']}' not found for unit '{row['key']}'")
                continue
            
            cursor.execute("""
                INSERT INTO units (
                    id, property_id, unit_number, unit_name, description,
                    unit_type, status, floor, area, bedrooms, bathrooms,
                    furnished, monthly_rent, security_deposit, maintenance_charges
                ) VALUES (
                    %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s
                )
                ON CONFLICT (id) DO NOTHING
            """, (
                unit_id, property_id, row['unit_number'], row.get('unit_name'),
                row.get('description'), row.get('unit_type', 'apartment'),
                row.get('status', 'available'), row.get('floor'),
                row.get('area'), row.get('bedrooms'), row.get('bathrooms'),
                row.get('furnished', False), row.get('monthly_rent'),
                row.get('security_deposit'), row.get('maintenance_charges')
            ))
            seeded += 1
        except Exception as e:
            print_error(f"Error seeding unit {row.get('key', 'unknown')}: {e}")
    
    cursor.close()
    print_success(f"Seeded {seeded} units")

def seed_leases(conn, df):
    """Seed leases with unit and tenant FK resolution"""
    print_step("Seeding leases...")
    
    cursor = conn.cursor()
    seeded = 0
    
    for _, row in df.iterrows():
        try:
            # Generate UUID
            lease_id = str(uuid.uuid4())
            
            # Resolve FKs
            unit_id = unit_uuids.get(row['unit_key'])
            tenant_id = tenant_uuids.get(row['tenant_key'])
            
            if not unit_id:
                print_error(f"Unit key '{row['unit_key']}' not found")
                continue
            if not tenant_id:
                print_error(f"Tenant key '{row['tenant_key']}' not found")
                continue
            
            # Get property_id from unit
            cursor.execute("SELECT property_id FROM units WHERE id = %s", (unit_id,))
            result = cursor.fetchone()
            if not result:
                print_error(f"Could not find property for unit '{row['unit_key']}'")
                continue
            property_id = result[0]
            
            # Store lease UUID with composite key
            lease_key = f"{row['unit_key']}|{row['tenant_key']}"
            lease_uuids[lease_key] = lease_id
            
            cursor.execute("""
                INSERT INTO leases (
                    id, property_id, unit_id, tenant_id,
                    start_date, end_date, monthly_rent, security_deposit,
                    status, signed_at
                ) VALUES (
                    %s, %s, %s, %s, %s, %s, %s, %s, %s, %s
                )
                ON CONFLICT (id) DO NOTHING
            """, (
                lease_id, property_id, unit_id, tenant_id,
                row['start_date'], row['end_date'], row['monthly_rent'],
                row['security_deposit'], row.get('status', 'active'),
                row.get('signed_at')
            ))
            seeded += 1
        except Exception as e:
            print_error(f"Error seeding lease: {e}")
    
    cursor.close()
    print_success(f"Seeded {seeded} leases")

def seed_rent_payments(conn, df):
    """Seed rent payments with lease FK resolution"""
    print_step("Seeding rent payments...")
    
    cursor = conn.cursor()
    seeded = 0
    
    for _, row in df.iterrows():
        try:
            # Generate UUID
            payment_id = str(uuid.uuid4())
            
            # Resolve lease FK using composite key
            lease_id = lease_uuids.get(row['lease_ref'])
            if not lease_id:
                print_error(f"Lease ref '{row['lease_ref']}' not found")
                continue
            
            # Get property_id and tenant_id from lease
            cursor.execute("""
                SELECT property_id, tenant_id 
                FROM leases WHERE id = %s
            """, (lease_id,))
            result = cursor.fetchone()
            if not result:
                print_error(f"Could not find lease details for '{row['lease_ref']}'")
                continue
            property_id, tenant_id = result
            
            # Get created_by from property owner
            cursor.execute("SELECT owner_id FROM properties WHERE id = %s", (property_id,))
            result = cursor.fetchone()
            created_by = result[0] if result else None
            
            cursor.execute("""
                INSERT INTO rent_payments (
                    id, lease_id, property_id, tenant_id, amount,
                    due_date, paid_date, status, payment_method,
                    created_by, notes
                ) VALUES (
                    %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s
                )
                ON CONFLICT (id) DO NOTHING
            """, (
                payment_id, lease_id, property_id, tenant_id, row['amount'],
                row['due_date'], row.get('paid_date'), row.get('status', 'pending'),
                row.get('payment_method'), created_by, row.get('notes')
            ))
            seeded += 1
        except Exception as e:
            print_error(f"Error seeding rent payment: {e}")
    
    cursor.close()
    print_success(f"Seeded {seeded} rent payments")

def seed_meters(conn, df):
    """Seed meters with unit FK resolution"""
    print_step("Seeding meters...")
    
    cursor = conn.cursor()
    seeded = 0
    
    for _, row in df.iterrows():
        try:
            # Generate UUID
            meter_id = str(uuid.uuid4())
            meter_uuids[row['meter_number']] = meter_id
            
            # Resolve unit FK
            unit_id = unit_uuids.get(row['unit_key'])
            if not unit_id:
                print_error(f"Unit key '{row['unit_key']}' not found for meter")
                continue
            
            # Get property_id from unit
            cursor.execute("SELECT property_id FROM units WHERE id = %s", (unit_id,))
            result = cursor.fetchone()
            if not result:
                print_error(f"Could not find property for unit '{row['unit_key']}'")
                continue
            property_id = result[0]
            
            cursor.execute("""
                INSERT INTO meters (
                    id, property_id, unit_id, meter_type, meter_number,
                    installation_date, status
                ) VALUES (
                    %s, %s, %s, %s, %s, %s, %s
                )
                ON CONFLICT (id) DO NOTHING
            """, (
                meter_id, property_id, unit_id, row['meter_type'],
                row['meter_number'], row['installation_date'],
                row.get('status', 'active')
            ))
            seeded += 1
        except Exception as e:
            print_error(f"Error seeding meter {row.get('meter_number', 'unknown')}: {e}")
    
    cursor.close()
    print_success(f"Seeded {seeded} meters")

def seed_meter_readings(conn, df):
    """Seed meter readings with meter FK resolution"""
    print_step("Seeding meter readings...")
    
    cursor = conn.cursor()
    seeded = 0
    
    for _, row in df.iterrows():
        try:
            # Generate UUID
            reading_id = str(uuid.uuid4())
            
            # Resolve meter FK
            meter_id = meter_uuids.get(row['meter_number'])
            if not meter_id:
                print_error(f"Meter number '{row['meter_number']}' not found")
                continue
            
            cursor.execute("""
                INSERT INTO meter_readings (
                    id, meter_id, reading_date, reading_value,
                    reading_type, notes
                ) VALUES (
                    %s, %s, %s, %s, %s, %s
                )
                ON CONFLICT (id) DO NOTHING
            """, (
                reading_id, meter_id, row['reading_date'],
                row['reading_value'], row.get('reading_type', 'actual'),
                row.get('notes')
            ))
            seeded += 1
        except Exception as e:
            print_error(f"Error seeding meter reading: {e}")
    
    cursor.close()
    print_success(f"Seeded {seeded} meter readings")

def main():
    """Main seeding function"""
    print("\n" + "=" * 70)
    print("Smart Database Seeding with Dynamic UUID Generation")
    print("=" * 70 + "\n")
    
    # Load Excel data
    seed_data = load_excel_data(SEED_DATA_FILE)
    if not seed_data:
        print_error("Failed to load seed data")
        return
    
    # Get database configuration
    db_config = get_db_config()
    print_info(f"Database: {db_config['user']}@{db_config['host']}:{db_config['port']}/{db_config['database']}")
    
    # Database connection
    try:
        conn = psycopg2.connect(**db_config)
        conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
        print_success("Connected to database")
        
        # Seed in order (respecting foreign key dependencies)
        if 'users' in seed_data:
            seed_users(conn, seed_data['users'])
        
        if 'tenants' in seed_data:
            seed_tenants(conn, seed_data['tenants'])
        
        if 'properties' in seed_data:
            seed_properties(conn, seed_data['properties'])
        
        if 'units' in seed_data:
            seed_units(conn, seed_data['units'])
        
        if 'leases' in seed_data:
            seed_leases(conn, seed_data['leases'])
        
        if 'rent_payments' in seed_data:
            seed_rent_payments(conn, seed_data['rent_payments'])
        
        if 'meters' in seed_data:
            seed_meters(conn, seed_data['meters'])
        
        if 'meter_readings' in seed_data:
            seed_meter_readings(conn, seed_data['meter_readings'])
        
        conn.close()
        
        print()
        print("=" * 70)
        print_success("Database seeded successfully!")
        print("=" * 70)
        print()
        print("🔑 Test Credentials:")
        print("   Username: admin")
        print("   Password: admin123")
        print()
        print("📊 Seeded Data Summary:")
        print(f"   - Users: {len(user_uuids)}")
        print(f"   - Tenants: {len(tenant_uuids)}")
        print(f"   - Properties: {len(property_uuids)}")
        print(f"   - Units: {len(unit_uuids)}")
        print(f"   - Leases: {len(lease_uuids)}")
        print(f"   - Meters: {len(meter_uuids)}")
        print()
        print("✨ All UUIDs generated dynamically!")
        print("📝 Edit Excel file to add more data, then re-run this script")
        print()
        
    except Exception as e:
        print_error(f"Database error: {e}")
        return

if __name__ == '__main__':
    main()
