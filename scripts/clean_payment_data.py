#!/usr/bin/env python3
"""
Database Cleanup Script for Payment Data - Asset Management Platform
Clears payment-related data while preserving other data.
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

def clear_payment_data(conn):
    """Clear payment-related data from the database"""
    print_step("Clearing payment-related data...")

    cursor = conn.cursor()

    # Tables to clear (in order to respect foreign key constraints)
    tables_to_clear = [
        'rent_payments',                    # Rent payments
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
    print_success("Payment-related data cleared successfully!")
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
        'rent_payments_id_seq',
    ]

    for sequence in sequences_to_reset:
        try:
            cursor.execute(f"ALTER SEQUENCE {sequence} RESTART WITH 1")
            print_info(f"Reset sequence: {sequence}")
        except Exception as e:
            print_error(f"Error resetting sequence {sequence}: {e}")
            cursor.close()
            return False

    cursor.close()
    print_success("Database sequences reset successfully")
    return True

def main():
    """Main function"""
    print_step("Asset Management Platform - Payment Data Cleanup")
    print("This script will clear all payment-related data from the database.")
    print("⚠️  WARNING: This action cannot be undone!")
    print()

    # Ask for confirmation
    if not ask_confirmation("Are you sure you want to clear all payment data?"):
        print_info("Operation cancelled by user.")
        return

    # Connect to database
    conn = connect_to_database()
    if not conn:
        sys.exit(1)

    try:
        # Clear payment data
        if not clear_payment_data(conn):
            print_error("Failed to clear payment data")
            sys.exit(1)

        # Reset sequences
        if not reset_sequences(conn):
            print_error("Failed to reset sequences")
            sys.exit(1)

        print_success("Payment data cleanup completed successfully!")
        print_info("You can now run the payment seeding script to populate fresh data.")

    except Exception as e:
        print_error(f"An unexpected error occurred: {e}")
        sys.exit(1)
    finally:
        conn.close()

if __name__ == "__main__":
    main()