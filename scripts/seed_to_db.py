#!/usr/bin/env python3
"""
Smart Database Seeding from Excel with Dynamic UUID Generation
Reads simplified Excel data (no UUIDs) and generates UUIDs dynamically
while maintaining foreign key relationships through mappings.
"""

import os
import sys
import json
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
rent_transaction_uuids = {}
receipt_uuids = {}

def print_success(msg):
    print(f"{GREEN}✅ {msg}{RESET}")

def print_error(msg):
    print(f"{RED}❌ {msg}{RESET}")

def print_step(msg):
    print(f"{BLUE}🚀 {msg}{RESET}")

def print_info(msg):
    print(f"{YELLOW}ℹ️  {msg}{RESET}")

def print_warning(msg):
    print(f"{RED}⚠️  {msg}{RESET}")

def ask_confirmation(prompt):
    """Ask user for confirmation with y/N default"""
    try:
        response = input(f"{YELLOW}{prompt} (y/N): {RESET}").strip().lower()
        return response in ['y', 'yes']
    except KeyboardInterrupt:
        print("\nOperation cancelled by user.")
        return False

def drop_all_tables(conn):
    """Drop all tables in the correct order (reverse dependencies)"""
    print_step("Dropping all tables...")
    
    cursor = conn.cursor()
    
    # Drop tables in reverse dependency order
    tables_to_drop = [
        'rent_transaction_meter_readings',
        'meter_readings',
        'meters', 
        'rent_transactions',
        'rent_payments',
        'receipts',
        'leases',
        'unit_tenants',
        'tenant_documents',
        'units',
        'property_template_customizations',
        'template_preview_cache',
        'properties',
        'receipt_templates',
        'tenants',
        'recovery_codes',
        'security_questions',
        'password_reset_methods',
        'phone_verification_codes',
        'users'
    ]
    
    for table in tables_to_drop:
        try:
            cursor.execute(f"DROP TABLE IF EXISTS {table} CASCADE")
            print_info(f"Dropped table: {table}")
        except Exception as e:
            print_error(f"Error dropping table {table}: {e}")
    
    cursor.close()
    print_success("All tables dropped")

def create_all_tables(conn):
    """Create all tables from schema files"""
    print_step("Creating database schema...")
    
    schema_dir = 'scripts/schema'
    if not os.path.exists(schema_dir):
        print_error(f"Schema directory not found: {schema_dir}")
        return False
    
    cursor = conn.cursor()
    
    # Get all SQL files in order
    schema_files = sorted([f for f in os.listdir(schema_dir) if f.endswith('.sql')])
    
    for sql_file in schema_files:
        try:
            file_path = os.path.join(schema_dir, sql_file)
            with open(file_path, 'r') as f:
                sql_content = f.read()
            
            # Execute the SQL
            cursor.execute(sql_content)
            print_info(f"Executed schema: {sql_file}")
            
        except Exception as e:
            print_error(f"Error executing {sql_file}: {e}")
            cursor.close()
            return False
    
    cursor.close()
    print_success("Database schema created")
    return True

def clear_all_data(conn):
    """Clear all data from tables (TRUNCATE with CASCADE)"""
    print_step("Clearing all data...")
    
    cursor = conn.cursor()
    
    # Clear tables in reverse dependency order
    tables_to_clear = [
        'rent_transaction_meter_readings',
        'meter_readings',
        'meters',
        'rent_transactions', 
        'rent_payments',
        'receipts',
        'leases',
        'unit_tenants',
        'tenant_documents',
        'units',
        'property_template_customizations',
        'template_preview_cache',
        'properties',
        'receipt_templates',
        'tenants',
        'recovery_codes',
        'security_questions',
        'password_reset_methods',
        'phone_verification_codes',
        'users'
    ]
    
    for table in tables_to_clear:
        try:
            cursor.execute(f"TRUNCATE TABLE {table} CASCADE")
            print_info(f"Cleared data from: {table}")
        except Exception as e:
            print_error(f"Error clearing table {table}: {e}")
    
    cursor.close()
    print_success("All data cleared")

def parse_database_url(database_url):
    """Parse MAIN_DATABASE_URL into connection parameters"""
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
        print_error(f"Error parsing MAIN_DATABASE_URL: {e}")
        return None

def get_db_config():
    """Get database configuration from .env file or environment variables"""
    # Try to parse MAIN_DATABASE_URL first
    database_url = os.getenv('MAIN_DATABASE_URL')
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
            'properties': ['total_units', 'total_floors', 'parking_spaces', 'area'],
            'units': ['floor', 'bedrooms', 'bathrooms', 'area', 'monthly_rent', 'security_deposit', 'maintenance_charges', 'balconies', 'max_occupants'],
            'leases': ['monthly_rent', 'security_deposit'],
            'rent_payments': ['amount'],
            'meters': [],
            'meter_readings': ['previous_reading', 'current_reading'],
            'rent_transactions': ['days_count', 'base_rent', 'maintenance_charges', 'previous_balance', 'total_meter_charges', 'total_expenses', 'total_amount', 'amount_paid', 'new_balance'],
            'rent_transaction_meter_readings': ['previous_reading', 'current_reading', 'units_consumed', 'fixed_charge', 'total_cost'],
            'receipts': ['amount', 'file_size'],
            'tenant_documents': ['file_size']
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
                    id, username, email, password, phone, role,
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
                    balconies, max_occupants, furnished, unit_amenities, unit_photos,
                    monthly_rent, security_deposit, maintenance_charges
                ) VALUES (
                    %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s
                )
                ON CONFLICT (id) DO NOTHING
            """, (
                unit_id, property_id, row['unit_number'], row.get('unit_name'),
                row.get('description'), row.get('unit_type', 'apartment'),
                row.get('status', 'available'), row.get('floor'),
                row.get('area'), row.get('bedrooms'), row.get('bathrooms'),
                row.get('balconies'), row.get('max_occupants'), row.get('furnished', False),
                row.get('unit_amenities'), row.get('unit_photos'),
                row.get('monthly_rent'), row.get('security_deposit'), row.get('maintenance_charges')
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

def seed_unit_tenants(conn, df=None):
    """Seed unit_tenants junction table from leases"""
    print_step("Seeding unit tenants...")
    
    cursor = conn.cursor()
    seeded = 0
    
    # Get all leases to create unit_tenant relationships
    cursor.execute("""
        SELECT l.id, l.unit_id, l.tenant_id, l.start_date, l.end_date, l.status
        FROM leases l
        ORDER BY l.created_at
    """)
    
    leases = cursor.fetchall()
    
    for lease in leases:
        try:
            lease_id, unit_id, tenant_id, start_date, end_date, status = lease
            
            # Check if unit_tenant relationship already exists
            cursor.execute("""
                SELECT id FROM unit_tenants 
                WHERE unit_id = %s AND tenant_id = %s
            """, (unit_id, tenant_id))
            
            existing = cursor.fetchone()
            
            if not existing:
                # Create unit_tenant relationship
                unit_tenant_id = str(uuid.uuid4())
                
                cursor.execute("""
                    INSERT INTO unit_tenants (
                        id, unit_id, tenant_id, move_in_date, move_out_date, 
                        is_primary
                    ) VALUES (
                        %s, %s, %s, %s, %s, %s
                    )
                """, (
                    unit_tenant_id, unit_id, tenant_id, start_date, 
                    end_date if status == 'completed' else None, True
                ))
                seeded += 1
        
        except Exception as e:
            print_error(f"Error seeding unit tenant relationship: {e}")
    
    cursor.close()
    print_success(f"Seeded {seeded} unit tenant relationships")

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
                    multiplier, installation_date, status
                ) VALUES (
                    %s, %s, %s, %s, %s, %s, %s, %s
                )
                ON CONFLICT (id) DO NOTHING
            """, (
                meter_id, property_id, unit_id, row['meter_type'],
                row['meter_number'], row.get('multiplier', 1.0),
                row['installation_date'], row.get('status', 'active')
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
                    id, meter_id, reading_date, previous_reading, current_reading,
                    recorded_by, notes
                ) VALUES (
                    %s, %s, %s, %s, %s, %s, %s
                )
                ON CONFLICT (id) DO NOTHING
            """, (
                reading_id, meter_id, row['reading_date'],
                row['previous_reading'], row['current_reading'],
                row.get('recorded_by'), row.get('notes')
            ))
            seeded += 1
        except Exception as e:
            print_error(f"Error seeding meter reading: {e}")
    
    cursor.close()
    print_success(f"Seeded {seeded} meter readings")

def seed_rent_transactions(conn, df):
    """Seed rent transactions with lease FK resolution"""
    print_step("Seeding rent transactions...")
    
    cursor = conn.cursor()
    seeded = 0
    
    for _, row in df.iterrows():
        try:
            # Generate UUID
            transaction_id = str(uuid.uuid4())
            rent_transaction_uuids[row['key']] = transaction_id
            
            # Resolve lease FK using composite key
            lease_id = lease_uuids.get(row['lease_ref'])
            if not lease_id:
                print_error(f"Lease ref '{row['lease_ref']}' not found")
                continue
            
            # Get property_id, unit_id, tenant_id from lease
            cursor.execute("""
                SELECT property_id, unit_id, tenant_id 
                FROM leases WHERE id = %s
            """, (lease_id,))
            result = cursor.fetchone()
            if not result:
                print_error(f"Could not find lease details for '{row['lease_ref']}'")
                continue
            property_id, unit_id, tenant_id = result
            
            # Get created_by from property owner
            cursor.execute("SELECT owner_id FROM properties WHERE id = %s", (property_id,))
            owner_result = cursor.fetchone()
            created_by = owner_result[0] if owner_result else None
            
            if not created_by:
                print_error(f"Could not find owner for property")
                continue
            
            # Map status values to match backend enum
            # pending/overdue -> finalized (invoice generated but not paid)
            status = row.get('status', 'draft')
            if status in ['pending', 'overdue', 'partial']:
                status = 'finalized'
            
            cursor.execute("""
                INSERT INTO rent_transactions (
                    id, lease_id, property_id, unit_id, tenant_id,
                    billing_period_start, billing_period_end, billing_method,
                    days_count, base_rent, maintenance_charges, previous_balance,
                    total_meter_charges, total_expenses, total_amount,
                    amount_paid, new_balance, status, invoice_number,
                    invoice_date, receipt_number, receipt_generated, notes,
                    created_by
                ) VALUES (
                    %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s,
                    %s, %s, %s, %s, %s, %s, %s, %s, %s
                )
                ON CONFLICT (id) DO NOTHING
            """, (
                transaction_id, lease_id, property_id, unit_id, tenant_id,
                row['billing_period_start'], row['billing_period_end'],
                row.get('billing_method', 'relative'), row.get('days_count'),
                row.get('base_rent'), row.get('maintenance_charges'),
                row.get('previous_balance', 0), row.get('total_meter_charges', 0),
                row.get('total_expenses', 0), row.get('total_amount'),
                row.get('amount_paid', 0), row.get('new_balance', 0),
                status, row.get('invoice_number'),
                row.get('invoice_date'), row.get('receipt_number'),
                row.get('receipt_generated', False), row.get('notes'),
                created_by
            ))
            seeded += 1
        except Exception as e:
            print_error(f"Error seeding rent transaction: {e}")
    
    cursor.close()
    print_success(f"Seeded {seeded} rent transactions")

def seed_rent_transaction_meter_readings(conn, df):
    """Seed rent transaction meter readings junction table"""
    print_step("Seeding rent transaction meter readings...")
    
    cursor = conn.cursor()
    seeded = 0
    
    for _, row in df.iterrows():
        try:
            # Generate UUID
            junction_id = str(uuid.uuid4())
            
            # Resolve transaction FK
            transaction_id = rent_transaction_uuids.get(row['transaction_key'])
            if not transaction_id:
                print_error(f"Transaction key '{row['transaction_key']}' not found")
                continue
            
            # Resolve meter FK
            meter_id = meter_uuids.get(row['meter_number'])
            if not meter_id:
                print_error(f"Meter number '{row['meter_number']}' not found")
                continue
            
            cursor.execute("""
                INSERT INTO rent_transaction_meter_readings (
                    id, transaction_id, meter_id, meter_name, meter_type,
                    previous_reading, current_reading, units_consumed,
                    cost_per_unit, fixed_charge, total_cost, reading_date
                ) VALUES (
                    %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s
                )
                ON CONFLICT (id) DO NOTHING
            """, (
                junction_id, transaction_id, meter_id, row.get('meter_name'),
                row.get('meter_type'), row.get('previous_reading'),
                row.get('current_reading'), row.get('units_consumed'),
                row.get('cost_per_unit', 5.0), row.get('fixed_charge', 0),
                row.get('total_cost'), row.get('reading_date')
            ))
            seeded += 1
        except Exception as e:
            print_error(f"Error seeding rent transaction meter reading: {e}")
    
    cursor.close()
    print_success(f"Seeded {seeded} rent transaction meter readings")

def seed_receipts(conn, df):
    """Seed receipts with transaction FK resolution"""
    print_step("Seeding receipts...")
    
    cursor = conn.cursor()
    seeded = 0
    
    for _, row in df.iterrows():
        try:
            # Generate UUID
            receipt_id = str(uuid.uuid4())
            receipt_uuids[row['receipt_number']] = receipt_id
            
            # Resolve transaction FK
            transaction_id = rent_transaction_uuids.get(row['transaction_key'])
            if not transaction_id:
                print_error(f"Transaction key '{row['transaction_key']}' not found")
                continue
            
            # Get property_id, tenant_id, and created_by from transaction
            cursor.execute("""
                SELECT rt.property_id, rt.tenant_id, rt.created_by,
                       rt.billing_period_start, rt.billing_period_end,
                       rt.base_rent, rt.maintenance_charges, rt.total_amount,
                       u.unit_number, t.first_name, t.last_name, t.email,
                       p.name as property_name
                FROM rent_transactions rt
                JOIN units u ON rt.unit_id = u.id
                JOIN tenants t ON rt.tenant_id = t.id
                JOIN properties p ON rt.property_id = p.id
                WHERE rt.id = %s
            """, (transaction_id,))
            result = cursor.fetchone()
            if not result:
                print_error(f"Could not find transaction details for '{row['transaction_key']}'")
                continue
            
            property_id, tenant_id, generated_by, billing_start, billing_end, \
                base_rent, maintenance, total_amount, unit_number, \
                tenant_first, tenant_last, tenant_email, property_name = result
            
            # Create receipt_data JSONB with transaction details
            receipt_data = {
                "receipt_number": row['receipt_number'],
                "receipt_date": str(row['receipt_date']),
                "property": {
                    "name": property_name
                },
                "unit": {
                    "number": unit_number
                },
                "tenant": {
                    "name": f"{tenant_first} {tenant_last}",
                    "email": tenant_email
                },
                "billing_period": {
                    "start": str(billing_start),
                    "end": str(billing_end)
                },
                "charges": {
                    "base_rent": float(base_rent),
                    "maintenance": float(maintenance),
                    "total": float(total_amount)
                }
            }
            
            cursor.execute("""
                INSERT INTO receipts (
                    id, rent_transaction_id, property_id, tenant_id,
                    receipt_number, receipt_date, amount, description,
                    receipt_data, status, pdf_url, file_size, generated_by
                ) VALUES (
                    %s, %s, %s, %s, %s, %s, %s, %s, %s::jsonb, %s, %s, %s, %s
                )
                ON CONFLICT (receipt_number) DO NOTHING
            """, (
                receipt_id, transaction_id, property_id, tenant_id,
                row['receipt_number'], row['receipt_date'], row['amount'],
                row.get('description'), 
                json.dumps(receipt_data),  # Properly serialize to JSON
                row.get('status', 'generated'),
                row.get('pdf_url'), row.get('file_size'),
                generated_by
            ))
            seeded += 1
        except Exception as e:
            print_error(f"Error seeding receipt: {e}")
    
    cursor.close()
    print_success(f"Seeded {seeded} receipts")

def seed_tenant_documents(conn, df):
    """Seed tenant documents with tenant FK resolution"""
    print_step("Seeding tenant documents...")
    
    cursor = conn.cursor()
    seeded = 0
    
    for _, row in df.iterrows():
        try:
            # Generate UUID
            document_id = str(uuid.uuid4())
            
            # Resolve tenant FK
            tenant_id = tenant_uuids.get(row['tenant_key'])
            if not tenant_id:
                print_error(f"Tenant key '{row['tenant_key']}' not found")
                continue
            
            cursor.execute("""
                INSERT INTO tenant_documents (
                    id, tenant_id, document_type, document_name,
                    document_url, file_size
                ) VALUES (
                    %s, %s, %s, %s, %s, %s
                )
                ON CONFLICT (id) DO NOTHING
            """, (
                document_id, tenant_id, row['document_type'],
                row.get('document_name'), row.get('file_path'),
                row.get('file_size')
            ))
            seeded += 1
        except Exception as e:
            print_error(f"Error seeding tenant document: {e}")
    
    cursor.close()
    print_success(f"Seeded {seeded} tenant documents")

def seed_receipt_templates(conn):
    """Seed receipt templates from SQL file"""
    print_step("Seeding receipt templates...")
    
    cursor = conn.cursor()
    
    try:
        template_file = 'scripts/seed_data/receipt_templates.sql'
        if not os.path.exists(template_file):
            print_warning(f"Receipt templates file not found: {template_file}")
            print_info("Skipping receipt templates seeding")
            cursor.close()
            return
        
        with open(template_file, 'r') as f:
            sql_content = f.read()
        
        # Execute the SQL
        cursor.execute(sql_content)
        
        # Count seeded templates
        cursor.execute("SELECT COUNT(*) FROM receipt_templates")
        count = cursor.fetchone()[0]
        
        cursor.close()
        print_success(f"Seeded {count} receipt templates")
        
    except Exception as e:
        print_error(f"Error seeding receipt templates: {e}")
        cursor.close()

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
        
        # STEP 1: Schema Deletion
        print_warning("⚠️  STEP 1: Schema Deletion")
        print_warning("This will DROP ALL TABLES in the database!")
        if not ask_confirmation("🔴 Do you want to DROP ALL TABLES?"):
            print_info("Schema deletion skipped")
        else:
            drop_all_tables(conn)
        
        # STEP 2: Schema Creation
        print_warning("⚠️  STEP 2: Schema Creation")
        print_warning("This will CREATE ALL TABLES in the database!")
        if not ask_confirmation("🟡 Do you want to CREATE ALL TABLES?"):
            print_info("Schema creation skipped")
        else:
            if not create_all_tables(conn):
                print_error("Schema creation failed")
                conn.close()
                return
        
        # STEP 3: Data Deletion
        print_warning("⚠️  STEP 3: Data Deletion")
        print_warning("This will CLEAR ALL DATA from existing tables!")
        if not ask_confirmation("🟠 Do you want to CLEAR ALL DATA?"):
            print_info("Data deletion skipped")
        else:
            clear_all_data(conn)
        
        # STEP 4: Data Creation/Seeding
        print_warning("⚠️  STEP 4: Data Creation/Seeding")
        print_warning("This will INSERT SEED DATA into the database!")
        if not ask_confirmation("🟢 Do you want to SEED THE DATABASE?"):
            print_info("Data seeding skipped")
        else:
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
            
            # Always seed unit_tenants from leases (required for proper relationships)
            seed_unit_tenants(conn, None)
            
            if 'rent_payments' in seed_data:
                seed_rent_payments(conn, seed_data['rent_payments'])
            
            if 'meters' in seed_data:
                seed_meters(conn, seed_data['meters'])
            
            if 'meter_readings' in seed_data:
                seed_meter_readings(conn, seed_data['meter_readings'])
            
            if 'rent_transactions' in seed_data:
                seed_rent_transactions(conn, seed_data['rent_transactions'])
            
            if 'rent_transaction_meter_readings' in seed_data:
                seed_rent_transaction_meter_readings(conn, seed_data['rent_transaction_meter_readings'])
            
            if 'receipts' in seed_data:
                seed_receipts(conn, seed_data['receipts'])
            
            if 'tenant_documents' in seed_data:
                seed_tenant_documents(conn, seed_data['tenant_documents'])
            
            # Seed receipt templates from SQL file
            seed_receipt_templates(conn)
        
        conn.close()
        
        print()
        print("=" * 70)
        print_success("Database operations completed!")
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
        print(f"   - Meter Readings: {len(seed_data.get('meter_readings', []))}")
        print(f"   - Rent Transactions: {len(rent_transaction_uuids)}")
        print(f"   - Rent Transaction Meter Readings: {len(seed_data.get('rent_transaction_meter_readings', []))}")
        print(f"   - Receipts: {len(receipt_uuids)}")
        print(f"   - Tenant Documents: {len(seed_data.get('tenant_documents', []))}")
        print()
        print("✨ All UUIDs generated dynamically!")
        print("📝 Edit JSON file (seed_data_templates.json) to add more data")
        print("📝 Then run smart_seed_excel.py to generate Excel, and re-run this script")
        print()
        
    except Exception as e:
        print_error(f"Database error: {e}")
        return

if __name__ == '__main__':
    main()
