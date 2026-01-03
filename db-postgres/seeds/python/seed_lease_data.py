#!/usr/bin/env python3
"""
Lease Data Seeding Script for Asset Management Platform
Seeds lease data back to the database after cleanup.
"""

import os
import sys
import json
import psycopg2
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT
import uuid
from urllib.parse import urlparse
from dotenv import load_dotenv
import random
from datetime import datetime, date

# Load environment variables from .env file
load_dotenv()

# Color codes for terminal output
GREEN = '\033[92m'
RED = '\033[91m'
BLUE = '\033[94m'
YELLOW = '\033[93m'
RESET = '\033[0m'

SEED_DATA_FILE = 'db-postgres/seeds/data/seed_data_templates.json'

# UUID mappings to maintain foreign key relationships
lease_uuids = {}

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

def parse_database_url(database_url):
    """Parse MAIN_DATABASE_URL into connection parameters"""
    if not database_url:
        print_error("MAIN_DATABASE_URL environment variable not found")
        return None

    parsed = urlparse(database_url)

    return {
        'host': parsed.hostname,
        'port': parsed.port or 5432,
        'database': parsed.path.lstrip('/'),
        'user': parsed.username,
        'password': parsed.password
    }

def connect_to_database():
    """Connect to the PostgreSQL database"""
    database_url = os.getenv('MAIN_DATABASE_URL')
    if not database_url:
        print_error("MAIN_DATABASE_URL environment variable not found")
        return None

    try:
        conn_params = parse_database_url(database_url)
        if not conn_params:
            return None

        print_step("Connecting to database...")
        conn = psycopg2.connect(**conn_params)
        conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
        print_success("Connected to database successfully")
        return conn
    except Exception as e:
        print_error(f"Failed to connect to database: {e}")
        return None

def load_seed_data():
    """Load seed data from JSON file"""
    try:
        with open(SEED_DATA_FILE, 'r') as f:
            data = json.load(f)
        return data
    except FileNotFoundError:
        print_error(f"Seed data file not found: {SEED_DATA_FILE}")
        return None
    except json.JSONDecodeError as e:
        print_error(f"Error parsing seed data file: {e}")
        return None

def generate_lease_data():
    """Generate sample lease data"""
    # First, we need to get existing units and tenants from the database
    conn = connect_to_database()
    if not conn:
        return []

    cursor = conn.cursor()
    cursor.execute("SELECT id, unit_number, property_id FROM units LIMIT 5")
    units = cursor.fetchall()

    cursor.execute("SELECT id, first_name, last_name FROM tenants LIMIT 5")
    tenants = cursor.fetchall()

    conn.close()

    if not units or not tenants:
        print_warning("No units or tenants found. Please seed those first.")
        return []

    leases = []

    # Create leases for each unit-tenant combination
    for i, (unit_id, unit_number, property_id) in enumerate(units):
        tenant_id, first_name, last_name = tenants[i % len(tenants)]

        # Generate lease dates
        start_date = date(2024, random.randint(1, 6), random.randint(1, 28))
        end_date = date(start_date.year + 1, start_date.month, start_date.day - 1)

        lease = {
            'unit_id': unit_id,
            'tenant_id': tenant_id,
            'start_date': start_date.isoformat(),
            'end_date': end_date.isoformat(),
            'monthly_rent': random.choice([15000, 20000, 25000, 30000, 35000]),
            'security_deposit': random.choice([30000, 40000, 50000, 60000]),
            'maintenance_charges': random.choice([1000, 1500, 2000, 0]),
            'rent_due_day': random.randint(1, 28),
            'terms_conditions': 'Standard lease terms apply. Tenant responsible for utilities. No smoking. Pets allowed with approval.',
            'special_conditions': f'Special conditions for {first_name} {last_name} in Unit {unit_number}',
            'status': 'active'
        }

        leases.append(lease)

    return leases

def seed_leases(conn, leases_data):
    """Seed lease data into the database"""
    print_step("Seeding lease data...")

    cursor = conn.cursor()

    inserted_count = 0

    for lease_data in leases_data:
        try:
            # Generate UUID for the lease
            lease_id = str(uuid.uuid4())
            lease_uuids[f"{lease_data['unit_id']}-{lease_data['tenant_id']}"] = lease_id

            # Insert lease record
            cursor.execute("""
                INSERT INTO leases (
                    id, unit_id, tenant_id, start_date, end_date,
                    monthly_rent, security_deposit, maintenance_charges,
                    rent_due_day, terms_conditions, special_conditions,
                    status, created_at, updated_at
                ) VALUES (
                    %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s,
                    CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
                )
            """, (
                lease_id,
                lease_data['unit_id'],
                lease_data['tenant_id'],
                lease_data['start_date'],
                lease_data['end_date'],
                lease_data['monthly_rent'],
                lease_data['security_deposit'],
                lease_data['maintenance_charges'],
                lease_data['rent_due_day'],
                lease_data['terms_conditions'],
                lease_data['special_conditions'],
                lease_data['status']
            ))

            inserted_count += 1
            print_info(f"Inserted lease: Unit {lease_data['unit_id'][:8]} - {lease_data['monthly_rent']} INR/month")

        except Exception as e:
            print_error(f"Error inserting lease for unit {lease_data['unit_id']}: {e}")
            cursor.close()
            return False

    cursor.close()
    print_success(f"Successfully seeded {inserted_count} leases")
    return True

def main():
    """Main function"""
    print_step("Asset Management Platform - Lease Data Seeding")
    print("This script will populate lease data into the database.")
    print()

    # Connect to database
    conn = connect_to_database()
    if not conn:
        sys.exit(1)

    try:
        # Load seed data
        seed_data = load_seed_data()
        if not seed_data:
            print_warning("Using generated sample data instead of seed file")
            leases_data = generate_lease_data()
        else:
            leases_data = seed_data.get('leases', generate_lease_data())

        if not leases_data:
            print_error("No lease data available to seed")
            sys.exit(1)

        # Seed lease data
        if not seed_leases(conn, leases_data):
            print_error("Failed to seed lease data")
            sys.exit(1)

        print_success("Lease data seeding completed successfully!")

    except Exception as e:
        print_error(f"An unexpected error occurred: {e}")
        sys.exit(1)
    finally:
        conn.close()

if __name__ == "__main__":
    main()