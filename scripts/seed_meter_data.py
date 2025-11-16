#!/usr/bin/env python3
"""
Meter Data Seeding Script
Seeds meter-related data back to the database after cleanup.
"""

import psycopg2
import os
import uuid
from dotenv import load_dotenv
import sys
from datetime import datetime, timedelta
import random

# Load environment variables
load_dotenv()

def get_db_connection():
    """Establish database connection"""
    try:
        return psycopg2.connect(
            host=os.getenv('DB_HOST', 'localhost'),
            database=os.getenv('DB_NAME', 'asset_management'),
            user=os.getenv('DB_USER', 'postgres'),
            password=os.getenv('DB_PASSWORD'),
            port=os.getenv('DB_PORT', '5432')
        )
    except Exception as e:
        print(f"Database connection failed: {e}")
        sys.exit(1)

def confirm_action():
    """Get user confirmation before proceeding"""
    print("\n🌱 This will seed sample meter data into your database.")
    print("This includes:")
    print("  - Meters for existing units")
    print("  - Sample meter readings with historical data")

    while True:
        response = input("\nDo you want to continue? (yes/no): ").lower().strip()
        if response in ['yes', 'y']:
            return True
        elif response in ['no', 'n']:
            print("Operation cancelled.")
            return False
        else:
            print("Please enter 'yes' or 'no'.")

def get_existing_units(cursor):
    """Get existing units from database"""
    cursor.execute("SELECT id, unit_number, property_id FROM units ORDER BY unit_number")
    return cursor.fetchall()

def get_existing_properties(cursor):
    """Get existing properties for meter name generation"""
    cursor.execute("SELECT id, name FROM properties")
    return cursor.fetchall()

def generate_meter_name(property_name, unit_number, meter_type):
    """Generate a descriptive meter name"""
    return f"{property_name} - Unit {unit_number} - {meter_type.title()}"

def seed_meters(cursor, units, properties):
    """Seed sample meters"""
    print("📊 Seeding meters...")

    meter_types = ['ELECTRICITY', 'WATER', 'GAS']
    properties_dict = {p[0]: p[1] for p in properties}

    meters_data = []

    for unit_id, unit_number, property_id in units:
        property_name = properties_dict.get(property_id, "Unknown Property")

        # Create 1-3 meters per unit (electricity is most common, water/gas less frequent)
        num_meters = random.choices([1, 2, 3], weights=[0.6, 0.3, 0.1])[0]

        selected_types = random.sample(meter_types, min(num_meters, len(meter_types)))

        for meter_type in selected_types:
            meter_id = str(uuid.uuid4())
            meter_name = generate_meter_name(property_name, unit_number, meter_type)
            meter_number = f"M{random.randint(10000, 99999)}"

            # Pricing based on meter type
            if meter_type == 'ELECTRICITY':
                cost_per_unit = round(random.uniform(6.0, 12.0), 2)
                fixed_charge = round(random.uniform(50, 200), 2)
            elif meter_type == 'WATER':
                cost_per_unit = round(random.uniform(2.0, 8.0), 2)
                fixed_charge = round(random.uniform(20, 100), 2)
            else:  # GAS
                cost_per_unit = round(random.uniform(40.0, 80.0), 2)
                fixed_charge = round(random.uniform(100, 300), 2)

            remarks = f"Auto-generated {meter_type.lower()} meter for unit {unit_number}"
            is_active = random.choice([True, True, True, False])  # 75% active

            meters_data.append((
                meter_id, property_id, unit_id, meter_type, meter_name,
                meter_number, cost_per_unit, fixed_charge, remarks, is_active
            ))

    # Insert meters
    cursor.executemany("""
        INSERT INTO meters (
            id, property_id, unit_id, meter_type, meter_name,
            meter_number, cost_per_unit, fixed_charge, remarks, is_active,
            created_at, updated_at
        ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, NOW(), NOW())
    """, meters_data)

    print(f"  ✓ Created {len(meters_data)} meters")
    return meters_data

def seed_meter_readings(cursor, meters_data):
    """Seed sample meter readings"""
    print("📈 Seeding meter readings...")

    readings_data = []

    for meter in meters_data:
        meter_id = meter[0]
        meter_type = meter[3]

        # Generate readings for the past 6-12 months
        num_readings = random.randint(6, 12)
        base_reading = random.randint(1000, 10000)

        for i in range(num_readings):
            reading_id = str(uuid.uuid4())
            reading_date = datetime.now() - timedelta(days=30 * i)
            reading_value = base_reading + random.randint(50, 500) * (i + 1)

            readings_data.append((
                reading_id, meter_id, meter_type, reading_value, reading_date.date()
            ))

    cursor.executemany("""
        INSERT INTO meter_readings (
            id, meter_id, meter_type, reading_value, reading_date, created_at, updated_at
        ) VALUES (%s, %s, %s, %s, %s, NOW(), NOW())
    """, readings_data)

    print(f"  ✓ Created {len(readings_data)} meter readings")

def main():
    print("🌱 Meter Data Seeding Script")
    print("=" * 40)

    if not confirm_action():
        return

    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        # Check if units exist
        units = get_existing_units(cursor)
        if not units:
            print("❌ No units found in database. Please seed units first.")
            sys.exit(1)

        properties = get_existing_properties(cursor)
        if not properties:
            print("❌ No properties found in database. Please seed properties first.")
            sys.exit(1)

        print(f"📋 Found {len(units)} units across {len(properties)} properties")

        # Seed data
        meters_data = seed_meters(cursor, units, properties)
        seed_meter_readings(cursor, meters_data)

        conn.commit()
        print("\n✅ Meter data seeding completed successfully!")
        print(f"   Created {len(meters_data)} meters with associated readings")

    except Exception as e:
        conn.rollback()
        print(f"❌ Error during seeding: {e}")
        sys.exit(1)
    finally:
        cursor.close()
        conn.close()

if __name__ == "__main__":
    main()