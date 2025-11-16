#!/usr/bin/env python3
"""
Tenant Data Seeding Script for Asset Management Platform
Seeds tenant data back to the database after cleanup.
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

SEED_DATA_FILE = 'scripts/seed_data_templates.json'

# UUID mappings to maintain foreign key relationships
tenant_uuids = {}

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

def generate_tenant_data():
    """Generate sample tenant data"""
    tenants = [
        {
            'first_name': 'John',
            'last_name': 'Smith',
            'email': 'john.smith@email.com',
            'phone': '+1-555-0101',
            'alternate_phone': '+1-555-0102',
            'date_of_birth': '1985-03-15',
            'gender': 'male',
            'occupation': 'Software Engineer',
            'company_name': 'Tech Solutions Inc.',
            'monthly_income': 7500.00,
            'current_address': {
                'street': '123 Main Street, Apt 4B',
                'city': 'New York',
                'state': 'NY',
                'pincode': '10001'
            },
            'permanent_address': {
                'street': '456 Oak Avenue',
                'city': 'Boston',
                'state': 'MA',
                'pincode': '02101'
            },
            'emergency_contact': {
                'name': 'Jane Smith',
                'relationship': 'Spouse',
                'phone': '+1-555-0103'
            },
            'status': 'active'
        },
        {
            'first_name': 'Sarah',
            'last_name': 'Johnson',
            'email': 'sarah.johnson@email.com',
            'phone': '+1-555-0201',
            'alternate_phone': None,
            'date_of_birth': '1990-07-22',
            'gender': 'female',
            'occupation': 'Marketing Manager',
            'company_name': 'Global Marketing LLC',
            'monthly_income': 6200.00,
            'current_address': {
                'street': '789 Pine Road, Unit 12',
                'city': 'Los Angeles',
                'state': 'CA',
                'pincode': '90210'
            },
            'permanent_address': None,
            'emergency_contact': {
                'name': 'Michael Johnson',
                'relationship': 'Brother',
                'phone': '+1-555-0202'
            },
            'status': 'active'
        },
        {
            'first_name': 'Robert',
            'last_name': 'Davis',
            'email': 'robert.davis@email.com',
            'phone': '+1-555-0301',
            'alternate_phone': '+1-555-0302',
            'date_of_birth': '1978-11-08',
            'gender': 'male',
            'occupation': 'Teacher',
            'company_name': 'City Public Schools',
            'monthly_income': 4800.00,
            'current_address': {
                'street': '321 Elm Street',
                'city': 'Chicago',
                'state': 'IL',
                'pincode': '60601'
            },
            'permanent_address': {
                'street': '654 Maple Drive',
                'city': 'Chicago',
                'state': 'IL',
                'pincode': '60602'
            },
            'emergency_contact': {
                'name': 'Lisa Davis',
                'relationship': 'Sister',
                'phone': '+1-555-0303'
            },
            'status': 'active'
        },
        {
            'first_name': 'Maria',
            'last_name': 'Garcia',
            'email': 'maria.garcia@email.com',
            'phone': '+1-555-0401',
            'alternate_phone': None,
            'date_of_birth': '1988-05-30',
            'gender': 'female',
            'occupation': 'Nurse',
            'company_name': 'General Hospital',
            'monthly_income': 5500.00,
            'current_address': {
                'street': '987 Cedar Lane, Suite 8',
                'city': 'Houston',
                'state': 'TX',
                'pincode': '77001'
            },
            'permanent_address': None,
            'emergency_contact': {
                'name': 'Carlos Garcia',
                'relationship': 'Father',
                'phone': '+1-555-0402'
            },
            'status': 'active'
        },
        {
            'first_name': 'David',
            'last_name': 'Wilson',
            'email': 'david.wilson@email.com',
            'phone': '+1-555-0501',
            'alternate_phone': '+1-555-0502',
            'date_of_birth': '1982-09-12',
            'gender': 'male',
            'occupation': 'Accountant',
            'company_name': 'Financial Services Corp',
            'monthly_income': 6800.00,
            'current_address': {
                'street': '147 Birch Avenue',
                'city': 'Phoenix',
                'state': 'AZ',
                'pincode': '85001'
            },
            'permanent_address': {
                'street': '258 Walnut Street',
                'city': 'Phoenix',
                'state': 'AZ',
                'pincode': '85002'
            },
            'emergency_contact': {
                'name': 'Emily Wilson',
                'relationship': 'Mother',
                'phone': '+1-555-0503'
            },
            'status': 'active'
        }
    ]

    return tenants

def seed_tenants(conn, tenants_data):
    """Seed tenant data into the database"""
    print_step("Seeding tenant data...")

    cursor = conn.cursor()

    inserted_count = 0

    for tenant_data in tenants_data:
        try:
            # Generate UUID for the tenant
            tenant_id = str(uuid.uuid4())
            tenant_uuids[tenant_data['email']] = tenant_id

            # Insert tenant record
            cursor.execute("""
                INSERT INTO tenants (
                    id, first_name, last_name, email, phone, alternate_phone,
                    date_of_birth, gender, occupation, company_name, monthly_income,
                    current_street, current_city, current_state, current_pincode,
                    permanent_street, permanent_city, permanent_state, permanent_pincode,
                    emergency_contact_name, emergency_contact_relationship, emergency_contact_phone,
                    status, created_at, updated_at
                ) VALUES (
                    %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s,
                    %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s,
                    %s, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
                )
            """, (
                tenant_id,
                tenant_data['first_name'],
                tenant_data['last_name'],
                tenant_data['email'],
                tenant_data['phone'],
                tenant_data['alternate_phone'],
                tenant_data['date_of_birth'],
                tenant_data['gender'],
                tenant_data['occupation'],
                tenant_data['company_name'],
                tenant_data['monthly_income'],
                tenant_data['current_address']['street'],
                tenant_data['current_address']['city'],
                tenant_data['current_address']['state'],
                tenant_data['current_address']['pincode'],
                tenant_data['permanent_address']['street'] if tenant_data['permanent_address'] else None,
                tenant_data['permanent_address']['city'] if tenant_data['permanent_address'] else None,
                tenant_data['permanent_address']['state'] if tenant_data['permanent_address'] else None,
                tenant_data['permanent_address']['pincode'] if tenant_data['permanent_address'] else None,
                tenant_data['emergency_contact']['name'],
                tenant_data['emergency_contact']['relationship'],
                tenant_data['emergency_contact']['phone'],
                tenant_data['status']
            ))

            inserted_count += 1
            print_info(f"Inserted tenant: {tenant_data['first_name']} {tenant_data['last_name']}")

        except Exception as e:
            print_error(f"Error inserting tenant {tenant_data['first_name']} {tenant_data['last_name']}: {e}")
            cursor.close()
            return False

    cursor.close()
    print_success(f"Successfully seeded {inserted_count} tenants")
    return True

def main():
    """Main function"""
    print_step("Asset Management Platform - Tenant Data Seeding")
    print("This script will populate tenant data into the database.")
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
            tenants_data = generate_tenant_data()
        else:
            tenants_data = seed_data.get('tenants', generate_tenant_data())

        # Seed tenant data
        if not seed_tenants(conn, tenants_data):
            print_error("Failed to seed tenant data")
            sys.exit(1)

        print_success("Tenant data seeding completed successfully!")

    except Exception as e:
        print_error(f"An unexpected error occurred: {e}")
        sys.exit(1)
    finally:
        conn.close()

if __name__ == "__main__":
    main()