#!/usr/bin/env python3
"""
Property Data Seeding Script for Asset Management Platform
Seeds data back to property-related tables after cleanup.
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

SEED_DATA_FILE = 'scripts/seed_data_templates.json'

# UUID mappings to maintain foreign key relationships
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

def load_seed_data(filename):
    """Load seed data from JSON file"""
    print_step(f"Loading seed data from {filename}...")

    if not os.path.exists(filename):
        print_error(f"Seed data file not found: {filename}")
        return None

    try:
        with open(filename, 'r') as f:
            data = json.load(f)
        print_success("Seed data loaded successfully")
        return data
    except Exception as e:
        print_error(f"Error loading seed data: {e}")
        return None

def seed_tenants(conn, tenants_data):
    """Seed tenants data"""
    print_step("Seeding tenants...")

    cursor = conn.cursor()
    seeded = 0

    for tenant in tenants_data:
        try:
            # Generate UUID
            tenant_id = str(uuid.uuid4())
            tenant_uuids[tenant['key']] = tenant_id

            cursor.execute("""
                INSERT INTO tenants (
                    id, name, email, phone, date_of_birth, occupation,
                    monthly_income, emergency_contact_name, emergency_contact_phone,
                    current_address, permanent_address, id_proof_type, id_proof_number,
                    total_rentals, created_at, updated_at
                ) VALUES (
                    %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, NOW(), NOW()
                )
            """, (
                tenant_id, tenant['name'], tenant.get('email'), tenant.get('phone'),
                tenant.get('date_of_birth'), tenant.get('occupation'),
                tenant.get('monthly_income'), tenant.get('emergency_contact_name'),
                tenant.get('emergency_contact_phone'), tenant.get('current_address'),
                tenant.get('permanent_address'), tenant.get('id_proof_type'),
                tenant.get('id_proof_number'), tenant.get('total_rentals', 0)
            ))
            seeded += 1
        except Exception as e:
            print_error(f"Error seeding tenant {tenant.get('name', 'Unknown')}: {e}")

    cursor.close()
    print_success(f"Seeded {seeded} tenants")
    return seeded

def seed_properties(conn, properties_data):
    """Seed properties data"""
    print_step("Seeding properties...")

    cursor = conn.cursor()
    seeded = 0

    for prop in properties_data:
        try:
            # Generate UUID
            property_id = str(uuid.uuid4())
            property_uuids[prop['key']] = property_id

            cursor.execute("""
                INSERT INTO properties (
                    id, name, address, city, state, zip_code, country,
                    property_type, total_units, total_floors, built_year,
                    parking_spaces, amenities, area, description, created_at, updated_at
                ) VALUES (
                    %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, NOW(), NOW()
                )
            """, (
                property_id, prop['name'], prop['address'], prop.get('city', 'Unknown'),
                prop.get('state', 'Unknown'), prop.get('zip_code'), prop.get('country', 'USA'),
                prop.get('property_type', 'residential'), prop.get('total_units', 1),
                prop.get('total_floors', 1), prop.get('built_year'), prop.get('parking_spaces'),
                json.dumps(prop.get('amenities', [])), prop.get('area'), prop.get('description')
            ))
            seeded += 1
        except Exception as e:
            print_error(f"Error seeding property {prop.get('name', 'Unknown')}: {e}")

    cursor.close()
    print_success(f"Seeded {seeded} properties")
    return seeded

def seed_units(conn, units_data):
    """Seed units data"""
    print_step("Seeding units...")

    cursor = conn.cursor()
    seeded = 0

    for unit in units_data:
        try:
            # Generate UUID
            unit_id = str(uuid.uuid4())
            unit_uuids[unit['key']] = unit_id

            # Resolve property FK
            property_id = property_uuids.get(unit['property_key'])
            if not property_id:
                print_error(f"Property key '{unit['property_key']}' not found for unit {unit.get('unit_number', 'Unknown')}")
                continue

            cursor.execute("""
                INSERT INTO units (
                    id, property_id, unit_number, floor, unit_type, bedrooms, bathrooms,
                    area, monthly_rent, security_deposit, maintenance_charges,
                    balconies, max_occupants, amenities, is_occupied, created_at, updated_at
                ) VALUES (
                    %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, NOW(), NOW()
                )
            """, (
                unit_id, property_id, unit['unit_number'], unit.get('floor', 1),
                unit.get('unit_type', 'apartment'), unit.get('bedrooms', 1),
                unit.get('bathrooms', 1), unit.get('area'), unit.get('monthly_rent'),
                unit.get('security_deposit'), unit.get('maintenance_charges', 0),
                unit.get('balconies', 0), unit.get('max_occupants', 2),
                json.dumps(unit.get('amenities', [])), unit.get('is_occupied', False)
            ))
            seeded += 1
        except Exception as e:
            print_error(f"Error seeding unit {unit.get('unit_number', 'Unknown')}: {e}")

    cursor.close()
    print_success(f"Seeded {seeded} units")
    return seeded

def seed_leases(conn, leases_data):
    """Seed leases data"""
    print_step("Seeding leases...")

    cursor = conn.cursor()
    seeded = 0

    for lease in leases_data:
        try:
            # Generate UUID
            lease_id = str(uuid.uuid4())
            lease_uuids[lease['key']] = lease_id

            # Resolve tenant and unit FKs
            tenant_id = tenant_uuids.get(lease['tenant_key'])
            unit_id = unit_uuids.get(lease['unit_key'])

            if not tenant_id:
                print_error(f"Tenant key '{lease['tenant_key']}' not found for lease")
                continue
            if not unit_id:
                print_error(f"Unit key '{lease['unit_key']}' not found for lease")
                continue

            cursor.execute("""
                INSERT INTO leases (
                    id, tenant_id, unit_id, lease_start_date, lease_end_date,
                    monthly_rent, security_deposit, is_active, created_at, updated_at
                ) VALUES (
                    %s, %s, %s, %s, %s, %s, %s, %s, NOW(), NOW()
                )
            """, (
                lease_id, tenant_id, unit_id, lease['lease_start_date'],
                lease.get('lease_end_date'), lease.get('monthly_rent'),
                lease.get('security_deposit'), lease.get('is_active', True)
            ))

            # Create unit_tenant relationship
            cursor.execute("""
                INSERT INTO unit_tenants (unit_id, tenant_id, is_primary, move_in_date, created_at, updated_at)
                VALUES (%s, %s, %s, %s, NOW(), NOW())
                ON CONFLICT (unit_id, tenant_id) DO NOTHING
            """, (unit_id, tenant_id, True, lease['lease_start_date']))

            seeded += 1
        except Exception as e:
            print_error(f"Error seeding lease: {e}")

    cursor.close()
    print_success(f"Seeded {seeded} leases")
    return seeded

def seed_meters(conn, meters_data):
    """Seed meters data"""
    print_step("Seeding meters...")

    cursor = conn.cursor()
    seeded = 0

    for meter in meters_data:
        try:
            # Generate UUID
            meter_id = str(uuid.uuid4())
            meter_uuids[meter['key']] = meter_id

            # Resolve unit FK
            unit_id = unit_uuids.get(meter['unit_key'])
            if not unit_id:
                print_error(f"Unit key '{meter['unit_key']}' not found for meter")
                continue

            cursor.execute("""
                INSERT INTO meters (
                    id, unit_id, meter_type, meter_number, installation_date,
                    is_active, created_at, updated_at
                ) VALUES (
                    %s, %s, %s, %s, %s, %s, NOW(), NOW()
                )
            """, (
                meter_id, unit_id, meter['meter_type'], meter.get('meter_number'),
                meter.get('installation_date'), meter.get('is_active', True)
            ))
            seeded += 1
        except Exception as e:
            print_error(f"Error seeding meter: {e}")

    cursor.close()
    print_success(f"Seeded {seeded} meters")
    return seeded

def seed_expenses(conn, expenses_data):
    """Seed expenses data"""
    print_step("Seeding expenses...")

    cursor = conn.cursor()
    seeded = 0

    for expense in expenses_data:
        try:
            cursor.execute("""
                INSERT INTO expenses (
                    property_id, expense_type, amount, description, expense_date,
                    created_at, updated_at
                ) VALUES (
                    %s, %s, %s, %s, %s, NOW(), NOW()
                )
            """, (
                property_uuids.get(expense.get('property_key')),
                expense['expense_type'], expense['amount'],
                expense.get('description'), expense.get('expense_date')
            ))
            seeded += 1
        except Exception as e:
            print_error(f"Error seeding expense: {e}")

    cursor.close()
    print_success(f"Seeded {seeded} expenses")
    return seeded

def main():
    """Main seeding function"""
    print("\n" + "=" * 70)
    print("🌱 Property Data Seeding Script - Asset Management Platform")
    print("=" * 70)
    print()
    print("This script will seed data back to property-related tables:")
    print("• Properties, Units, Meters, Tenants, Leases, Expenses")
    print()
    print("📋 Data source: scripts/seed_data_templates.json")
    print()

    # Load seed data
    seed_data = load_seed_data(SEED_DATA_FILE)
    if not seed_data:
        print_error("Failed to load seed data")
        return

    # Get database configuration
    db_config = get_db_config()
    print_info(f"Database: {db_config['user']}@{db_config['host']}:{db_config['port']}/{db_config['database']}")

    # Ask for confirmation
    if not ask_confirmation("🟢 Do you want to SEED PROPERTY DATA?"):
        print_info("Operation cancelled by user")
        return

    # Database connection
    try:
        conn = psycopg2.connect(**db_config)
        conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
        print_success("Connected to database")

        seeded_counts = {}

        # Seed in order (respecting foreign key dependencies)
        if 'tenants' in seed_data:
            seeded_counts['tenants'] = seed_tenants(conn, seed_data['tenants'])

        if 'properties' in seed_data:
            seeded_counts['properties'] = seed_properties(conn, seed_data['properties'])

        if 'units' in seed_data:
            seeded_counts['units'] = seed_units(conn, seed_data['units'])

        if 'leases' in seed_data:
            seeded_counts['leases'] = seed_leases(conn, seed_data['leases'])

        if 'meters' in seed_data:
            seeded_counts['meters'] = seed_meters(conn, seed_data['meters'])

        if 'expenses' in seed_data:
            seeded_counts['expenses'] = seed_expenses(conn, seed_data['expenses'])

        conn.close()

        # Print summary
        print_success("Property data seeding completed successfully!")
        print("\n📊 Seeded Data Summary:")
        for table, count in seeded_counts.items():
            print(f"   - {table}: {count} records")

        print("\n" + "=" * 70)
        print("🎉 Seeding Complete!")
        print("📱 You can now use the application with seeded data")
        print("=" * 70)

    except Exception as e:
        print_error(f"Database error: {e}")
        return

if __name__ == '__main__':
    main()