#!/usr/bin/env python3
"""
Database Seeding Script for Payment Data - Asset Management Platform
Populates the database with sample payment data for testing and development.
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
    """Get existing leases and tenants for payment seeding"""
    cursor = conn.cursor()

    # Get leases
    cursor.execute("""
        SELECT id, tenant_id, unit_id, monthly_rent, start_date, end_date
        FROM leases
        WHERE end_date > CURRENT_DATE
        ORDER BY id
    """)
    leases = cursor.fetchall()

    # Get tenants
    cursor.execute("""
        SELECT id, first_name, last_name
        FROM tenants
        ORDER BY id
    """)
    tenants = cursor.fetchall()

    cursor.close()

    return leases, tenants

def generate_payment_data(leases, tenants):
    """Generate sample payment data"""
    payments = []

    # Payment statuses
    statuses = ['paid', 'pending', 'overdue', 'partial']

    # Payment methods
    methods = ['cash', 'bank_transfer', 'check', 'online']

    # Current date for reference
    today = datetime.now()

    for lease in leases:
        lease_id, tenant_id, unit_id, monthly_rent, start_date, end_date = lease

        # Generate payments for the last 6 months
        for months_back in range(6, 0, -1):
            payment_date = today - timedelta(days=30 * months_back)

            # Skip if payment date is before lease start
            if payment_date < start_date:
                continue

            # Randomly decide if payment was made
            if random.random() < 0.85:  # 85% chance of payment
                # Random status with bias towards paid
                status_weights = [0.7, 0.15, 0.1, 0.05]  # paid, pending, overdue, partial
                status = random.choices(statuses, weights=status_weights)[0]

                # Amount based on status
                if status == 'partial':
                    amount = monthly_rent * random.uniform(0.3, 0.9)
                else:
                    amount = monthly_rent

                # Payment date (within the month)
                payment_month_start = payment_date.replace(day=1)
                payment_month_end = payment_date.replace(day=28) + timedelta(days=4)
                payment_month_end = payment_month_end - timedelta(days=payment_month_end.day)

                actual_payment_date = payment_month_start + timedelta(
                    days=random.randint(0, (payment_month_end - payment_month_start).days)
                )

                # Due date (typically 1st of month)
                due_date = payment_date.replace(day=1)

                # Payment method
                method = random.choice(methods)

                # Notes
                notes_options = [
                    None,
                    "Paid on time",
                    "Late payment",
                    "Partial payment - remaining due next month",
                    "Bank transfer",
                    "Cash payment at office"
                ]
                notes = random.choice(notes_options)

                payments.append({
                    'lease_id': lease_id,
                    'tenant_id': tenant_id,
                    'amount': round(amount, 2),
                    'payment_date': actual_payment_date.date(),
                    'due_date': due_date.date(),
                    'status': status,
                    'payment_method': method,
                    'notes': notes,
                    'created_at': actual_payment_date,
                    'updated_at': actual_payment_date
                })

    return payments

def insert_payment_data(conn, payments):
    """Insert payment data into the database"""
    print_step(f"Inserting {len(payments)} payment records...")

    cursor = conn.cursor()

    inserted_count = 0

    for payment in payments:
        try:
            cursor.execute("""
                INSERT INTO rent_payments (
                    lease_id, tenant_id, amount, payment_date, due_date,
                    status, payment_method, notes, created_at, updated_at
                ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            """, (
                payment['lease_id'],
                payment['tenant_id'],
                payment['amount'],
                payment['payment_date'],
                payment['due_date'],
                payment['status'],
                payment['payment_method'],
                payment['notes'],
                payment['created_at'],
                payment['updated_at']
            ))
            inserted_count += 1

        except Exception as e:
            print_error(f"Error inserting payment: {e}")
            cursor.close()
            return False

    cursor.close()
    print_success(f"Successfully inserted {inserted_count} payment records")
    return True

def main():
    """Main function"""
    print_step("Asset Management Platform - Payment Data Seeding")
    print("This script will populate the database with sample payment data.")
    print()

    # Connect to database
    conn = connect_to_database()
    if not conn:
        sys.exit(1)

    try:
        # Get existing data
        print_step("Fetching existing lease and tenant data...")
        leases, tenants = get_existing_data(conn)

        if not leases:
            print_warning("No active leases found. Please seed lease data first.")
            print_info("Run the lease seeding script before running this one.")
            conn.close()
            sys.exit(1)

        print_info(f"Found {len(leases)} active leases and {len(tenants)} tenants")

        # Generate payment data
        print_step("Generating sample payment data...")
        payments = generate_payment_data(leases, tenants)
        print_info(f"Generated {len(payments)} payment records")

        # Insert payment data
        if not insert_payment_data(conn, payments):
            print_error("Failed to insert payment data")
            sys.exit(1)

        print_success("Payment data seeding completed successfully!")

        # Print summary
        print("\n📊 Seeding Summary:")
        print(f"   - Active Leases Processed: {len(leases)}")
        print(f"   - Payment Records Created: {len(payments)}")

        # Status breakdown
        status_counts = {}
        for payment in payments:
            status = payment['status']
            status_counts[status] = status_counts.get(status, 0) + 1

        print("   - Payment Status Breakdown:")
        for status, count in status_counts.items():
            print(f"     • {status.title()}: {count} payments")

    except Exception as e:
        print_error(f"An unexpected error occurred: {e}")
        sys.exit(1)
    finally:
        conn.close()

if __name__ == "__main__":
    main()