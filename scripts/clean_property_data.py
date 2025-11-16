#!/usr/bin/env python3
"""
Database Cleanup Script for Asset Management Platform
Clears data from specific tables while preserving other data.
"""

import os
import sys
import psycopg2
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT
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

def clear_property_related_data(conn):
    """Clear data from property-related tables while preserving other data"""
    print_step("Clearing property-related data...")

    cursor = conn.cursor()

    # Tables to clear in reverse dependency order
    # This preserves: users, receipt_templates, and other core data
    tables_to_clear = [
        'rent_transaction_meter_readings',  # Junction table
        'meter_readings',                   # Meter readings
        'meters',                          # Meters
        'rent_transactions',               # Rent transactions
        'rent_payments',                   # Rent payments
        'receipts',                        # Receipts
        'leases',                          # Leases
        'unit_tenants',                    # Unit-tenant relationships
        'tenant_documents',                # Tenant documents
        'units',                           # Units
        'property_template_customizations', # Property customizations
        'template_preview_cache',          # Template cache
        'properties',                      # Properties
        'tenants',                         # Tenants
        'expenses'                         # Expenses
    ]

    cleared_counts = {}

    for table in tables_to_clear:
        try:
            # Get count before clearing
            cursor.execute(f"SELECT COUNT(*) FROM {table}")
            count_before = cursor.fetchone()[0]

            # Clear the table
            cursor.execute(f"TRUNCATE TABLE {table} CASCADE")
            cleared_counts[table] = count_before
            print_info(f"Cleared {count_before} records from: {table}")

        except Exception as e:
            print_error(f"Error clearing table {table}: {e}")
            cursor.close()
            return False

    cursor.close()

    # Print summary
    print_success("Property-related data cleared successfully!")
    print("\n📊 Cleared Data Summary:")
    for table, count in cleared_counts.items():
        print(f"   - {table}: {count} records")

    return True

def reset_sequences(conn):
    """Reset auto-increment sequences for the cleared tables"""
    print_step("Resetting database sequences...")

    cursor = conn.cursor()

    # Sequences to reset
    sequences_to_reset = [
        'properties_id_seq',
        'units_id_seq',
        'meters_id_seq',
        'tenants_id_seq',
        'leases_id_seq',
        'rent_payments_id_seq',
        'rent_transactions_id_seq',
        'receipts_id_seq',
        'expenses_id_seq',
        'meter_readings_id_seq',
        'tenant_documents_id_seq',
        'property_template_customizations_id_seq',
        'template_preview_cache_id_seq'
    ]

    for sequence in sequences_to_reset:
        try:
            cursor.execute(f"ALTER SEQUENCE {sequence} RESTART WITH 1")
            print_info(f"Reset sequence: {sequence}")
        except Exception as e:
            print_warning(f"Could not reset sequence {sequence}: {e}")

    cursor.close()
    print_success("Sequences reset")

def verify_data_integrity(conn):
    """Verify that core data is preserved and property data is cleared"""
    print_step("Verifying data integrity...")

    cursor = conn.cursor()

    # Check that core tables still have data
    core_tables = {
        'users': 'Users (should be preserved)',
        'receipt_templates': 'Receipt templates (should be preserved)'
    }

    print("\n🔍 Core Data Verification:")
    for table, description in core_tables.items():
        try:
            cursor.execute(f"SELECT COUNT(*) FROM {table}")
            count = cursor.fetchone()[0]
            if count > 0:
                print_success(f"{description}: {count} records preserved")
            else:
                print_warning(f"{description}: No records found")
        except Exception as e:
            print_error(f"Error checking {table}: {e}")

    # Check that property tables are cleared
    property_tables = {
        'properties': 'Properties',
        'units': 'Units',
        'tenants': 'Tenants',
        'leases': 'Leases',
        'meters': 'Meters',
        'rent_payments': 'Rent payments',
        'expenses': 'Expenses'
    }

    print("\n🏠 Property Data Verification:")
    for table, description in property_tables.items():
        try:
            cursor.execute(f"SELECT COUNT(*) FROM {table}")
            count = cursor.fetchone()[0]
            if count == 0:
                print_success(f"{description}: Cleared (0 records)")
            else:
                print_warning(f"{description}: Still has {count} records")
        except Exception as e:
            print_error(f"Error checking {table}: {e}")

    cursor.close()

def main():
    """Main cleanup function"""
    print("\n" + "=" * 70)
    print("🧹 Database Cleanup Script - Asset Management Platform")
    print("=" * 70)
    print()
    print("This script will clear data from property-related tables:")
    print("• Properties, Units, Meters, Tenants, Leases")
    print("• Rent Payments, Transactions, Receipts")
    print("• Expenses and related junction tables")
    print()
    print("✅ PRESERVED: Users, Receipt Templates, and other core data")
    print("⚠️  WARNING: This action cannot be undone!")
    print()

    # Get database configuration
    db_config = get_db_config()
    print_info(f"Database: {db_config['user']}@{db_config['host']}:{db_config['port']}/{db_config['database']}")

    # Ask for confirmation
    if not ask_confirmation("🔴 Do you want to CLEAR PROPERTY-RELATED DATA?"):
        print_info("Operation cancelled by user")
        return

    # Database connection
    try:
        conn = psycopg2.connect(**db_config)
        conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
        print_success("Connected to database")

        # Clear property-related data
        if not clear_property_related_data(conn):
            print_error("Data clearing failed")
            conn.close()
            return

        # Reset sequences
        reset_sequences(conn)

        # Verify data integrity
        verify_data_integrity(conn)

        conn.close()
        print_success("Database cleanup completed successfully!")

        print("\n" + "=" * 70)
        print("🎉 Cleanup Complete!")
        print("📝 Next steps:")
        print("   1. Run the seeding script to restore data")
        print("   2. Or manually add new property data through the UI")
        print("=" * 70)

    except Exception as e:
        print_error(f"Database error: {e}")
        return

if __name__ == '__main__':
    main()