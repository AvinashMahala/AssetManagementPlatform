#!/usr/bin/env python3
"""
Unit Data Cleanup Script
Clears all unit-related data while preserving core system data.
"""

import psycopg2
import os
from dotenv import load_dotenv
import sys

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
    print("\n⚠️  WARNING: This will delete ALL unit-related data!")
    print("This includes:")
    print("  - All units")
    print("  - Unit-tenant relationships")
    print("  - Leases associated with units")
    print("  - Rent payments for those leases")
    print("  - Meter readings for units")
    print("\nCore system data (users, properties, tenants) will be preserved.")

    while True:
        response = input("\nAre you sure you want to continue? (yes/no): ").lower().strip()
        if response in ['yes', 'y']:
            return True
        elif response in ['no', 'n']:
            print("Operation cancelled.")
            return False
        else:
            print("Please enter 'yes' or 'no'.")

def clean_unit_data():
    """Clean all unit-related data using CASCADE deletes"""
    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        print("🧹 Starting unit data cleanup...")

        # Delete in order to handle foreign key constraints
        tables_to_clean = [
            ('meter_readings', 'meter_readings'),
            ('rent_payments', 'rent_payments'),
            ('leases', 'leases'),
            ('unit_tenants', 'unit_tenants'),
            ('units', 'units')
        ]

        for table_name, description in tables_to_clean:
            print(f"  Deleting from {description}...")
            cursor.execute(f"DELETE FROM {table_name}")
            deleted_count = cursor.rowcount
            print(f"    ✓ Deleted {deleted_count} records from {description}")

        # Reset sequences
        sequences_to_reset = [
            'units_id_seq',
            'leases_id_seq',
            'rent_payments_id_seq',
            'unit_tenants_id_seq',
            'meter_readings_id_seq'
        ]

        for seq_name in sequences_to_reset:
            try:
                cursor.execute(f"ALTER SEQUENCE {seq_name} RESTART WITH 1")
                print(f"    ✓ Reset sequence {seq_name}")
            except psycopg2.Error as e:
                print(f"    ⚠️  Could not reset sequence {seq_name}: {e}")

        conn.commit()
        print("✅ Unit data cleanup completed successfully!")

    except Exception as e:
        conn.rollback()
        print(f"❌ Error during cleanup: {e}")
        sys.exit(1)
    finally:
        cursor.close()
        conn.close()

def main():
    print("🏢 Unit Data Cleanup Script")
    print("=" * 40)

    if not confirm_action():
        return

    clean_unit_data()

    print("\n🎉 Cleanup complete! Your database is now ready for fresh unit data.")
    print("   You can now run the seeding script to populate sample units.")

if __name__ == "__main__":
    main()