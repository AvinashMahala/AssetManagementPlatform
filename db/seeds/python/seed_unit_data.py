#!/usr/bin/env python3
"""
Unit Data Seeding Script
Seeds unit-related data back to the database after cleanup.
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
    print("\n🌱 This will seed sample unit data into your database.")
    print("This includes:")
    print("  - Sample units for existing properties")
    print("  - Associated leases and rent payments")
    print("  - Unit-tenant relationships")
    print("  - Sample meter readings")

    while True:
        response = input("\nDo you want to continue? (yes/no): ").lower().strip()
        if response in ['yes', 'y']:
            return True
        elif response in ['no', 'n']:
            print("Operation cancelled.")
            return False
        else:
            print("Please enter 'yes' or 'no'.")

def get_existing_properties(cursor):
    """Get existing properties from database"""
    cursor.execute("SELECT id, name FROM properties ORDER BY name")
    return cursor.fetchall()

def seed_units(cursor, properties):
    """Seed sample units"""
    print("🏢 Seeding units...")

    unit_types = ['APARTMENT', 'STUDIO', 'HOUSE', 'VILLA', 'COMMERCIAL']
    statuses = ['AVAILABLE', 'OCCUPIED', 'VACANT']
    amenities_list = ['WiFi', 'AC', 'TV', 'Washing Machine', 'Parking']

    units_data = []
    unit_counter = 1

    for prop_id, prop_name in properties:
        # Create 3-8 units per property
        num_units = random.randint(3, 8)

        for i in range(num_units):
            unit_id = str(uuid.uuid4())
            unit_number = f"{unit_counter:03d}"
            floor = (unit_counter - 1) // 4  # 4 units per floor
            unit_type = random.choice(unit_types)
            status = random.choice(statuses)
            area = random.randint(500, 2500)
            bedrooms = random.randint(1, 4) if unit_type != 'STUDIO' else 0
            bathrooms = random.randint(1, 3)
            balconies = random.randint(0, 2)
            furnished = random.choice([True, False])
            monthly_rent = random.randint(8000, 50000)
            security_deposit = monthly_rent * random.randint(1, 3)
            maintenance = random.randint(500, 3000)

            # Random amenities
            num_amenities = random.randint(0, len(amenities_list))
            amenities = random.sample(amenities_list, num_amenities)

            units_data.append((
                unit_id, prop_id, unit_number, floor, unit_type, status,
                area, bedrooms, bathrooms, balconies, furnished,
                monthly_rent, security_deposit, maintenance,
                amenities, f"Beautiful {unit_type.lower()} in {prop_name}"
            ))

            unit_counter += 1

    # Insert units
    cursor.executemany("""
        INSERT INTO units (
            id, property_id, unit_number, floor, unit_type, status,
            area, bedrooms, bathrooms, balconies, furnished,
            monthly_rent, security_deposit, maintenance_charges,
            unit_amenities, description, created_at, updated_at
        ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, NOW(), NOW())
    """, units_data)

    print(f"  ✓ Created {len(units_data)} units")
    return units_data

def seed_leases_and_payments(cursor, units_data):
    """Seed leases and rent payments for occupied units"""
    print("📄 Seeding leases and payments...")

    occupied_units = [unit for unit in units_data if unit[5] == 'OCCUPIED']  # status is at index 5

    if not occupied_units:
        print("  ⚠️  No occupied units found, skipping leases and payments")
        return

    # Get existing tenants
    cursor.execute("SELECT id FROM tenants ORDER BY id")
    tenants = cursor.fetchall()

    if not tenants:
        print("  ⚠️  No tenants found, skipping leases and payments")
        return

    leases_data = []
    payments_data = []

    for unit in occupied_units[:min(len(occupied_units), len(tenants))]:  # Don't exceed tenant count
        unit_id = unit[0]
        tenant_id = random.choice(tenants)[0]

        lease_id = str(uuid.uuid4())
        start_date = datetime.now() - timedelta(days=random.randint(0, 365))
        end_date = start_date + timedelta(days=365)

        monthly_rent = unit[11]  # monthly_rent is at index 11

        leases_data.append((
            lease_id, unit_id, tenant_id, start_date.date(),
            end_date.date(), monthly_rent, 'ACTIVE'
        ))

        # Create some rent payments
        num_payments = random.randint(1, 6)
        for i in range(num_payments):
            payment_id = str(uuid.uuid4())
            payment_date = start_date + timedelta(days=30 * i)
            amount = monthly_rent
            status = random.choice(['PAID', 'PENDING', 'OVERDUE'])

            payments_data.append((
                payment_id, lease_id, payment_date.date(), amount, status
            ))

    # Insert leases
    cursor.executemany("""
        INSERT INTO leases (
            id, unit_id, tenant_id, start_date, end_date,
            monthly_rent, status, created_at, updated_at
        ) VALUES (%s, %s, %s, %s, %s, %s, %s, NOW(), NOW())
    """, leases_data)

    # Insert payments
    cursor.executemany("""
        INSERT INTO rent_payments (
            id, lease_id, payment_date, amount, status, created_at, updated_at
        ) VALUES (%s, %s, %s, %s, %s, NOW(), NOW())
    """, payments_data)

    print(f"  ✓ Created {len(leases_data)} leases")
    print(f"  ✓ Created {len(payments_data)} rent payments")

def seed_meter_readings(cursor, units_data):
    """Seed sample meter readings"""
    print("📊 Seeding meter readings...")

    meter_types = ['ELECTRICITY', 'WATER', 'GAS']

    readings_data = []

    for unit in units_data:
        unit_id = unit[0]
        num_readings = random.randint(1, 5)

        for _ in range(num_readings):
            reading_id = str(uuid.uuid4())
            meter_type = random.choice(meter_types)
            reading_value = random.randint(100, 10000)
            reading_date = datetime.now() - timedelta(days=random.randint(0, 180))

            readings_data.append((
                reading_id, unit_id, meter_type, reading_value, reading_date.date()
            ))

    cursor.executemany("""
        INSERT INTO meter_readings (
            id, unit_id, meter_type, reading_value, reading_date, created_at, updated_at
        ) VALUES (%s, %s, %s, %s, %s, NOW(), NOW())
    """, readings_data)

    print(f"  ✓ Created {len(readings_data)} meter readings")

def main():
    print("🌱 Unit Data Seeding Script")
    print("=" * 40)

    if not confirm_action():
        return

    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        # Check if properties exist
        properties = get_existing_properties(cursor)
        if not properties:
            print("❌ No properties found in database. Please seed properties first.")
            sys.exit(1)

        print(f"📋 Found {len(properties)} properties to create units for")

        # Seed data
        units_data = seed_units(cursor, properties)
        seed_leases_and_payments(cursor, units_data)
        seed_meter_readings(cursor, units_data)

        conn.commit()
        print("\n✅ Unit data seeding completed successfully!")
        print(f"   Created {len(units_data)} units with associated data")

    except Exception as e:
        conn.rollback()
        print(f"❌ Error during seeding: {e}")
        sys.exit(1)
    finally:
        cursor.close()
        conn.close()

if __name__ == "__main__":
    main()