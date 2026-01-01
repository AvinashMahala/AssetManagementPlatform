#!/usr/bin/env python3
"""
Database Seeding Script for Expense Data - Asset Management Platform
Populates the database with sample expense data for testing and development.
"""

import os
import sys
import psycopg2
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT
from urllib.parse import urlparse
from dotenv import load_dotenv
import random
from datetime import datetime, timedelta

# Load environment variables from .env file
load_dotenv()

# Color codes for terminal output
GREEN = '\033[92m'
RED = '\033[91m'
BLUE = '\033[94m'
YELLOW = '\033[93m'
RESET = '\033[0m'

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

def get_existing_data(conn):
    """Get existing properties and units for expense seeding"""
    cursor = conn.cursor()

    # Get properties
    cursor.execute("""
        SELECT id, name
        FROM properties
        ORDER BY id
    """)
    properties = cursor.fetchall()

    # Get units
    cursor.execute("""
        SELECT id, property_id, unit_number, name
        FROM units
        ORDER BY id
    """)
    units = cursor.fetchall()

    cursor.close()

    return properties, units

def generate_expense_data(properties, units):
    """Generate sample expense data"""
    expenses = []

    # Expense types and their typical amounts
    expense_types = {
        'wifi_internet': {'amount': (800, 2500), 'frequency': ['monthly']},
        'food_meals': {'amount': (2000, 8000), 'frequency': ['monthly']},
        'inverter_generator': {'amount': (500, 2000), 'frequency': ['monthly']},
        'cable_dish': {'amount': (300, 1000), 'frequency': ['monthly']},
        'surveillance_cameras': {'amount': (1000, 3000), 'frequency': ['monthly', 'one_time']},
        'laundry': {'amount': (500, 1500), 'frequency': ['monthly']},
        'water_bill': {'amount': (500, 2000), 'frequency': ['monthly']},
        'plumbing': {'amount': (1000, 5000), 'frequency': ['one_time', 'monthly']},
        'water_heater': {'amount': (200, 800), 'frequency': ['monthly']},
        'ac_repair': {'amount': (2000, 8000), 'frequency': ['one_time', 'monthly']},
        'furniture_repair': {'amount': (500, 3000), 'frequency': ['one_time']},
        'cleaning': {'amount': (1000, 3000), 'frequency': ['monthly']},
        'housekeeping': {'amount': (1500, 4000), 'frequency': ['monthly']},
        'painting': {'amount': (5000, 15000), 'frequency': ['one_time']},
        'electrical_work': {'amount': (1000, 5000), 'frequency': ['one_time', 'monthly']},
        'other': {'amount': (500, 5000), 'frequency': ['one_time', 'monthly']}
    }

    # Distribution types
    distributions = ['owner_only', 'split_among_tenants', 'specific_units']

    # Current date for reference
    today = datetime.now()

    for property_data in properties:
        property_id, property_name = property_data

        # Get units for this property
        property_units = [unit for unit in units if unit[1] == property_id]

        # Generate 3-8 expenses per property
        num_expenses = random.randint(3, 8)

        for _ in range(num_expenses):
            # Select random expense type
            expense_type = random.choice(list(expense_types.keys()))
            type_config = expense_types[expense_type]

            # Random amount within range
            min_amount, max_amount = type_config['amount']
            amount = round(random.uniform(min_amount, max_amount), 2)

            # Random frequency
            frequency = random.choice(type_config['frequency'])

            # Start date (within last 6 months to 2 months in future)
            days_offset = random.randint(-180, 60)
            start_date = today + timedelta(days=days_offset)

            # End date (optional, 20% chance)
            end_date = None
            if random.random() < 0.2 and frequency != 'one_time':
                # End date 3-12 months after start
                end_days = random.randint(90, 365)
                end_date = start_date + timedelta(days=end_days)

            # Distribution
            distribution = random.choice(distributions)

            # Affected units (if specific_units distribution)
            affected_unit_ids = []
            if distribution == 'specific_units' and property_units:
                # Select 1-3 random units
                num_affected = min(random.randint(1, 3), len(property_units))
                affected_units = random.sample(property_units, num_affected)
                affected_unit_ids = [unit[0] for unit in affected_units]

            # Unit assignment (optional, 60% chance)
            unit_id = None
            if random.random() < 0.6 and property_units:
                unit_id = random.choice(property_units)[0]

            # Description
            descriptions = {
                'wifi_internet': ['Internet connection', 'WiFi service', 'Broadband connection'],
                'food_meals': ['Monthly meal expenses', 'Food supplies', 'Kitchen provisions'],
                'inverter_generator': ['Generator maintenance', 'Inverter service', 'Power backup'],
                'cable_dish': ['Cable TV service', 'Dish connection', 'Entertainment service'],
                'surveillance_cameras': ['Security camera maintenance', 'CCTV system', 'Surveillance equipment'],
                'laundry': ['Laundry service', 'Washing machine maintenance', 'Laundry supplies'],
                'water_bill': ['Water utility bill', 'Water charges', 'Water supply'],
                'plumbing': ['Plumbing repair', 'Pipe maintenance', 'Water system repair'],
                'water_heater': ['Water heater service', 'Geyser maintenance', 'Hot water system'],
                'ac_repair': ['AC repair service', 'Air conditioning maintenance', 'Cooling system'],
                'furniture_repair': ['Furniture repair', 'Wood work', 'Furniture maintenance'],
                'cleaning': ['Cleaning service', 'House cleaning', 'Maintenance cleaning'],
                'housekeeping': ['Housekeeping service', 'Daily cleaning', 'Property maintenance'],
                'painting': ['Interior painting', 'Wall painting', 'Paint work'],
                'electrical_work': ['Electrical repair', 'Wiring work', 'Electrical maintenance'],
                'other': ['Miscellaneous expense', 'General maintenance', 'Property expense']
            }
            description = random.choice(descriptions.get(expense_type, ['General expense']))

            # Status (90% active, 10% inactive)
            status = 'active' if random.random() < 0.9 else 'inactive'

            expenses.append({
                'property_id': property_id,
                'unit_id': unit_id,
                'type': expense_type,
                'description': description,
                'amount': amount,
                'frequency': frequency,
                'start_date': start_date.date(),
                'end_date': end_date.date() if end_date else None,
                'distribution': distribution,
                'affected_unit_ids': affected_unit_ids,
                'status': status,
                'created_by': 'system',
                'created_at': start_date,
                'updated_at': start_date
            })

    return expenses

def insert_expense_data(conn, expenses):
    """Insert expense data into the database"""
    print_step(f"Inserting {len(expenses)} expense records...")

    cursor = conn.cursor()

    inserted_count = 0

    for expense in expenses:
        try:
            cursor.execute("""
                INSERT INTO expenses (
                    property_id, unit_id, type, description, amount, frequency,
                    start_date, end_date, distribution, affected_unit_ids,
                    status, created_by, created_at, updated_at
                ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            """, (
                expense['property_id'],
                expense['unit_id'],
                expense['type'],
                expense['description'],
                expense['amount'],
                expense['frequency'],
                expense['start_date'],
                expense['end_date'],
                expense['distribution'],
                expense['affected_unit_ids'] if expense['affected_unit_ids'] else None,
                expense['status'],
                expense['created_by'],
                expense['created_at'],
                expense['updated_at']
            ))
            inserted_count += 1

        except Exception as e:
            print_error(f"Error inserting expense: {e}")
            cursor.close()
            return False

    cursor.close()
    print_success(f"Successfully inserted {inserted_count} expense records")
    return True

def main():
    """Main function"""
    print_step("Asset Management Platform - Expense Data Seeding")
    print("This script will populate the database with sample expense data.")
    print()

    # Connect to database
    conn = connect_to_database()
    if not conn:
        sys.exit(1)

    try:
        # Get existing data
        print_step("Fetching existing property and unit data...")
        properties, units = get_existing_data(conn)

        if not properties:
            print_warning("No properties found. Please seed property data first.")
            print_info("Run the property seeding script before running this one.")
            conn.close()
            sys.exit(1)

        print_info(f"Found {len(properties)} properties and {len(units)} units")

        # Generate expense data
        print_step("Generating sample expense data...")
        expenses = generate_expense_data(properties, units)
        print_info(f"Generated {len(expenses)} expense records")

        # Insert expense data
        if not insert_expense_data(conn, expenses):
            print_error("Failed to insert expense data")
            sys.exit(1)

        print_success("Expense data seeding completed successfully!")

        # Print summary
        print("\n📊 Seeding Summary:")
        print(f"   - Properties Processed: {len(properties)}")
        print(f"   - Expense Records Created: {len(expenses)}")

        # Type breakdown
        type_counts = {}
        for expense in expenses:
            exp_type = expense['type']
            type_counts[exp_type] = type_counts.get(exp_type, 0) + 1

        print("   - Expense Types Created:")
        for exp_type, count in sorted(type_counts.items()):
            print(f"     • {exp_type.replace('_', ' ').title()}: {count} expenses")

        # Frequency breakdown
        freq_counts = {}
        for expense in expenses:
            freq = expense['frequency']
            freq_counts[freq] = freq_counts.get(freq, 0) + 1

        print("   - Frequency Distribution:")
        for freq, count in freq_counts.items():
            print(f"     • {freq.replace('_', ' ').title()}: {count} expenses")

    except Exception as e:
        print_error(f"An unexpected error occurred: {e}")
        sys.exit(1)
    finally:
        conn.close()

if __name__ == "__main__":
    main()