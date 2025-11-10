#!/usr/bin/env python3
"""
Comprehensive Database Verification System
Verifies table schemas, data integrity, and relationships after seeding
"""

import os
import sys
import psycopg2
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT
import pandas as pd
from urllib.parse import urlparse
from dotenv import load_dotenv
from typing import Dict, List, Tuple, Any

# Load environment variables
load_dotenv()

# Color codes for terminal output
GREEN = '\033[92m'
RED = '\033[91m'
BLUE = '\033[94m'
YELLOW = '\033[93m'
CYAN = '\033[96m'
MAGENTA = '\033[95m'
RESET = '\033[0m'

class DatabaseVerifier:
    def __init__(self):
        self.conn = None
        self.cursor = None
        self.issues = []
        self.warnings = []

    def log_success(self, msg: str):
        print(f"{GREEN}✅ {msg}{RESET}")

    def log_error(self, msg: str):
        print(f"{RED}❌ {msg}{RESET}")
        self.issues.append(msg)

    def log_warning(self, msg: str):
        print(f"{YELLOW}⚠️  {msg}{RESET}")
        self.warnings.append(msg)

    def log_info(self, msg: str):
        print(f"{BLUE}ℹ️  {msg}{RESET}")

    def log_step(self, msg: str):
        print(f"{CYAN}🚀 {msg}{RESET}")

    def log_section(self, msg: str):
        print(f"{MAGENTA}📋 {msg}{RESET}")

    def get_db_config(self):
        """Get database configuration"""
        database_url = os.getenv('MAIN_DATABASE_URL')
        if database_url:
            result = urlparse(database_url)
            return {
                'host': result.hostname or 'localhost',
                'port': result.port or 5432,
                'database': result.path.lstrip('/') if result.path else 'asset_management',
                'user': result.username or 'postgres',
                'password': result.password or 'postgres'
            }

        return {
            'host': os.getenv('DB_HOST', 'localhost'),
            'port': int(os.getenv('DB_PORT', 5432)),
            'database': os.getenv('DB_NAME', 'asset_platform_main'),
            'user': os.getenv('DB_USER', 'user'),
            'password': os.getenv('DB_PASSWORD', 'pass')
        }

    def connect(self):
        """Connect to database"""
        try:
            config = self.get_db_config()
            self.conn = psycopg2.connect(**config)
            self.conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
            self.cursor = self.conn.cursor()
            self.log_success("Connected to database")
            return True
        except Exception as e:
            self.log_error(f"Failed to connect to database: {e}")
            return False

    def disconnect(self):
        """Close database connection"""
        if self.cursor:
            self.cursor.close()
        if self.conn:
            self.conn.close()

    def get_expected_tables(self) -> Dict[str, Dict]:
        """Define expected table schemas based on actual database"""
        return {
            'users': {
                'columns': {
                    'id': 'uuid',
                    'username': 'character varying',
                    'email': 'character varying',
                    'password': 'character varying',
                    'phone': 'character varying',
                    'role': 'character varying',
                    'google_id': 'character varying',
                    'profile_picture': 'character varying',
                    'is_email_verified': 'boolean',
                    'is_phone_verified': 'boolean',
                    'email_verification_token': 'character varying',
                    'email_verification_expires': 'timestamp without time zone',
                    'password_reset_token': 'character varying',
                    'password_reset_expires': 'timestamp without time zone',
                    'last_login': 'timestamp without time zone',
                    'created_at': 'timestamp without time zone',
                    'updated_at': 'timestamp without time zone'
                },
                'constraints': ['users_pkey', 'users_username_key', 'users_email_key', 'users_google_id_key'],
                'expected_count': 4
            },
            'properties': {
                'columns': {
                    'id': 'uuid',
                    'name': 'character varying',
                    'description': 'text',
                    'property_type': 'character varying',
                    'status': 'character varying',
                    'address_street': 'character varying',
                    'address_city': 'character varying',
                    'address_state': 'character varying',
                    'address_pincode': 'character varying',
                    'address_country': 'character varying',
                    'area': 'numeric',
                    'total_floors': 'integer',
                    'construction_year': 'integer',
                    'parking_spaces': 'integer',
                    'amenities': 'jsonb',
                    'owner_id': 'uuid',
                    'template_id': 'uuid',
                    'template_overrides': 'jsonb',
                    'receipt_settings': 'jsonb',
                    'created_at': 'timestamp without time zone',
                    'updated_at': 'timestamp without time zone'
                },
                'constraints': ['properties_pkey', 'properties_owner_id_fkey', 'fk_properties_template_id', 'properties_template_id_fkey'],
                'expected_count': 3
            },
            'units': {
                'columns': {
                    'id': 'uuid',
                    'property_id': 'uuid',
                    'unit_number': 'character varying',
                    'unit_name': 'character varying',
                    'description': 'text',
                    'unit_type': 'character varying',
                    'status': 'character varying',
                    'floor': 'integer',
                    'area': 'numeric',
                    'bedrooms': 'integer',
                    'bathrooms': 'integer',
                    'balconies': 'integer',
                    'furnished': 'boolean',
                    'max_occupants': 'integer',
                    'unit_amenities': 'jsonb',
                    'unit_photos': 'jsonb',
                    'monthly_rent': 'numeric',
                    'security_deposit': 'numeric',
                    'maintenance_charges': 'numeric',
                    'created_at': 'timestamp without time zone',
                    'updated_at': 'timestamp without time zone'
                },
                'constraints': ['units_pkey', 'units_property_id_unit_number_key', 'units_property_id_fkey'],
                'expected_count': 12
            },
            'tenants': {
                'columns': {
                    'id': 'uuid',
                    'first_name': 'character varying',
                    'last_name': 'character varying',
                    'email': 'character varying',
                    'phone': 'character varying',
                    'alternate_phone': 'character varying',
                    'date_of_birth': 'date',
                    'gender': 'character varying',
                    'occupation': 'character varying',
                    'company_name': 'character varying',
                    'monthly_income': 'numeric',
                    'current_address_street': 'character varying',
                    'current_address_city': 'character varying',
                    'current_address_state': 'character varying',
                    'current_address_pincode': 'character varying',
                    'permanent_address_street': 'character varying',
                    'permanent_address_city': 'character varying',
                    'permanent_address_state': 'character varying',
                    'permanent_address_pincode': 'character varying',
                    'emergency_contact_name': 'character varying',
                    'emergency_contact_relationship': 'character varying',
                    'emergency_contact_phone': 'character varying',
                    'status': 'character varying',
                    'total_rentals': 'integer',
                    'current_property_id': 'uuid',
                    'created_at': 'timestamp without time zone',
                    'updated_at': 'timestamp without time zone'
                },
                'constraints': ['tenants_pkey', 'tenants_email_key'],
                'expected_count': 15
            },
            'leases': {
                'columns': {
                    'id': 'uuid',
                    'property_id': 'uuid',
                    'unit_id': 'uuid',
                    'tenant_id': 'uuid',
                    'start_date': 'date',
                    'end_date': 'date',
                    'monthly_rent': 'numeric',
                    'security_deposit': 'numeric',
                    'late_fee_amount': 'numeric',
                    'grace_period_days': 'integer',
                    'payment_due_day': 'integer',
                    'terms_conditions': 'text',
                    'special_clauses': 'text',
                    'status': 'character varying',
                    'signed_at': 'timestamp without time zone',
                    'created_at': 'timestamp without time zone',
                    'updated_at': 'timestamp without time zone'
                },
                'constraints': ['leases_pkey', 'leases_property_id_fkey', 'leases_unit_id_fkey', 'leases_tenant_id_fkey'],
                'expected_count': 12
            },
            'unit_tenants': {
                'columns': {
                    'id': 'uuid',
                    'unit_id': 'uuid',
                    'tenant_id': 'uuid',
                    'move_in_date': 'date',
                    'move_out_date': 'date',
                    'is_primary': 'boolean',
                    'created_at': 'timestamp without time zone',
                    'updated_at': 'timestamp without time zone'
                },
                'constraints': ['unit_tenants_pkey', 'unit_tenants_unit_id_fkey', 'unit_tenants_tenant_id_fkey'],
                'expected_count': 12
            },
            'rent_payments': {
                'columns': {
                    'id': 'uuid',
                    'lease_id': 'uuid',
                    'property_id': 'uuid',
                    'tenant_id': 'uuid',
                    'amount': 'numeric',
                    'due_date': 'date',
                    'paid_date': 'date',
                    'payment_method': 'character varying',
                    'transaction_reference': 'character varying',
                    'status': 'character varying',
                    'late_fee': 'numeric',
                    'notes': 'text',
                    'created_by': 'uuid',
                    'created_at': 'timestamp without time zone',
                    'updated_at': 'timestamp without time zone'
                },
                'constraints': ['rent_payments_pkey', 'rent_payments_lease_id_fkey', 'rent_payments_property_id_fkey', 'rent_payments_tenant_id_fkey', 'rent_payments_created_by_fkey'],
                'expected_count': 38
            },
            'meters': {
                'columns': {
                    'id': 'uuid',
                    'property_id': 'uuid',
                    'unit_id': 'uuid',
                    'meter_type': 'character varying',
                    'meter_number': 'character varying',
                    'installation_date': 'date',
                    'status': 'character varying',
                    'created_at': 'timestamp without time zone',
                    'updated_at': 'timestamp without time zone'
                },
                'constraints': ['meters_pkey', 'meters_property_id_fkey', 'meters_unit_id_fkey'],
                'expected_count': 0  # Currently not seeded
            },
            'meter_readings': {
                'columns': {
                    'id': 'uuid',
                    'meter_id': 'uuid',
                    'previous_reading': 'numeric',
                    'current_reading': 'numeric',
                    'reading_date': 'date',
                    'recorded_by': 'uuid',
                    'notes': 'text',
                    'created_at': 'timestamp without time zone'
                },
                'constraints': ['meter_readings_pkey', 'meter_readings_meter_id_fkey'],
                'expected_count': 39  # Currently seeded with data
            },
            'expenses': {
                'columns': {
                    'id': 'uuid',
                    'property_id': 'uuid',
                    'unit_id': 'uuid',
                    'expense_type': 'character varying',
                    'description': 'text',
                    'amount': 'numeric',
                    'expense_date': 'date',
                    'due_date': 'date',
                    'paid_date': 'date',
                    'status': 'character varying',
                    'frequency': 'character varying',
                    'distribution_method': 'character varying',
                    'bill_attachment_url': 'text',
                    'bill_file_size': 'integer',
                    'notes': 'text',
                    'recurring_id': 'uuid',
                    'created_by': 'uuid',
                    'updated_by': 'uuid',
                    'created_at': 'timestamp without time zone',
                    'updated_at': 'timestamp without time zone'
                },
                'constraints': ['expenses_pkey', 'expenses_property_id_fkey', 'expenses_unit_id_fkey', 'expenses_created_by_fkey', 'expenses_updated_by_fkey'],
                'expected_count': 10  # Sample expenses seeded
            }
        }

    def verify_table_exists(self, table_name: str) -> bool:
        """Check if table exists"""
        try:
            self.cursor.execute("""
                SELECT EXISTS (
                    SELECT FROM information_schema.tables
                    WHERE table_schema = 'public'
                    AND table_name = %s
                )
            """, (table_name,))
            exists = self.cursor.fetchone()[0]
            if exists:
                self.log_success(f"Table '{table_name}' exists")
                return True
            else:
                self.log_error(f"Table '{table_name}' does not exist")
                return False
        except Exception as e:
            self.log_error(f"Error checking table '{table_name}': {e}")
            return False

    def verify_table_schema(self, table_name: str, expected_schema: Dict) -> bool:
        """Verify table schema matches expectations"""
        try:
            # Get actual columns
            self.cursor.execute("""
                SELECT column_name, data_type
                FROM information_schema.columns
                WHERE table_schema = 'public'
                AND table_name = %s
                ORDER BY column_name
            """, (table_name,))

            actual_columns = {row[0]: row[1] for row in self.cursor.fetchall()}

            # Check columns
            expected_columns = expected_schema['columns']
            all_good = True

            # Check for missing columns
            for col, expected_type in expected_columns.items():
                if col not in actual_columns:
                    self.log_error(f"Table '{table_name}' missing column '{col}'")
                    all_good = False
                elif actual_columns[col] != expected_type:
                    self.log_warning(f"Table '{table_name}' column '{col}' type mismatch: expected {expected_type}, got {actual_columns[col]}")

            # Check for extra columns (warning only)
            for col in actual_columns:
                if col not in expected_columns:
                    self.log_warning(f"Table '{table_name}' has unexpected column '{col}'")

            # Check constraints
            expected_constraints = expected_schema.get('constraints', [])
            if expected_constraints:
                self.cursor.execute("""
                    SELECT conname
                    FROM pg_constraint c
                    JOIN pg_class t ON c.conrelid = t.oid
                    WHERE t.relname = %s
                    AND c.contype IN ('p', 'f', 'u')
                """, (table_name,))

                actual_constraints = [row[0] for row in self.cursor.fetchall()]

                for constraint in expected_constraints:
                    if constraint not in actual_constraints:
                        self.log_error(f"Table '{table_name}' missing constraint '{constraint}'")
                        all_good = False

            return all_good

        except Exception as e:
            self.log_error(f"Error verifying schema for table '{table_name}': {e}")
            return False

    def verify_table_data(self, table_name: str, expected_count: int) -> bool:
        """Verify table has expected amount of data"""
        try:
            self.cursor.execute(f"SELECT COUNT(*) FROM {table_name}")
            actual_count = self.cursor.fetchone()[0]

            if actual_count == expected_count:
                self.log_success(f"Table '{table_name}' has expected {expected_count} records")
                return True
            elif actual_count == 0:
                self.log_error(f"Table '{table_name}' is empty (expected {expected_count})")
                return False
            else:
                self.log_warning(f"Table '{table_name}' has {actual_count} records (expected {expected_count})")
                return True  # Not a failure, just a warning

        except Exception as e:
            self.log_error(f"Error checking data count for table '{table_name}': {e}")
            return False

    def verify_relationships(self) -> bool:
        """Verify all foreign key relationships are valid"""
        self.log_section("RELATIONSHIP INTEGRITY CHECK")

        all_good = True

        try:
            # Check leases have valid references
            self.cursor.execute("""
                SELECT COUNT(*) FROM leases l
                LEFT JOIN properties p ON l.property_id = p.id
                LEFT JOIN units u ON l.unit_id = u.id
                LEFT JOIN tenants t ON l.tenant_id = t.id
                WHERE p.id IS NULL OR u.id IS NULL OR t.id IS NULL
            """)
            orphaned_leases = self.cursor.fetchone()[0]
            if orphaned_leases > 0:
                self.log_error(f"Found {orphaned_leases} leases with invalid references")
                all_good = False
            else:
                self.log_success("All leases have valid property, unit, and tenant references")

            # Check units have valid property references
            self.cursor.execute("""
                SELECT COUNT(*) FROM units u
                LEFT JOIN properties p ON u.property_id = p.id
                WHERE p.id IS NULL
            """)
            orphaned_units = self.cursor.fetchone()[0]
            if orphaned_units > 0:
                self.log_error(f"Found {orphaned_units} units with invalid property references")
                all_good = False
            else:
                self.log_success("All units have valid property references")

            # Check properties have valid owner references
            self.cursor.execute("""
                SELECT COUNT(*) FROM properties p
                LEFT JOIN users u ON p.owner_id = u.id
                WHERE u.id IS NULL
            """)
            orphaned_properties = self.cursor.fetchone()[0]
            if orphaned_properties > 0:
                self.log_error(f"Found {orphaned_properties} properties with invalid owner references")
                all_good = False
            else:
                self.log_success("All properties have valid owner references")

            # Check payments have valid references
            self.cursor.execute("""
                SELECT COUNT(*) FROM rent_payments rp
                LEFT JOIN leases l ON rp.lease_id = l.id
                LEFT JOIN tenants t ON rp.tenant_id = t.id
                WHERE l.id IS NULL OR t.id IS NULL
            """)
            orphaned_payments = self.cursor.fetchone()[0]
            if orphaned_payments > 0:
                self.log_error(f"Found {orphaned_payments} payments with invalid references")
                all_good = False
            else:
                self.log_success("All payments have valid lease and tenant references")

            # Check unit_tenants have valid references
            self.cursor.execute("""
                SELECT COUNT(*) FROM unit_tenants ut
                LEFT JOIN units u ON ut.unit_id = u.id
                LEFT JOIN tenants t ON ut.tenant_id = t.id
                WHERE u.id IS NULL OR t.id IS NULL
            """)
            orphaned_unit_tenants = self.cursor.fetchone()[0]
            if orphaned_unit_tenants > 0:
                self.log_error(f"Found {orphaned_unit_tenants} unit_tenants with invalid references")
                all_good = False
            else:
                self.log_success("All unit_tenants have valid unit and tenant references")

            # Check meters have valid references
            self.cursor.execute("""
                SELECT COUNT(*) FROM meters m
                LEFT JOIN properties p ON m.property_id = p.id
                LEFT JOIN units u ON m.unit_id = u.id
                WHERE p.id IS NULL OR u.id IS NULL
            """)
            orphaned_meters = self.cursor.fetchone()[0]
            if orphaned_meters > 0:
                self.log_error(f"Found {orphaned_meters} meters with invalid references")
                all_good = False
            else:
                self.log_success("All meters have valid property and unit references")

            # Check meter readings have valid meter references
            self.cursor.execute("""
                SELECT COUNT(*) FROM meter_readings mr
                LEFT JOIN meters m ON mr.meter_id = m.id
                WHERE m.id IS NULL
            """)
            orphaned_readings = self.cursor.fetchone()[0]
            if orphaned_readings > 0:
                self.log_error(f"Found {orphaned_readings} meter readings with invalid meter references")
                all_good = False
            else:
                self.log_success("All meter readings have valid meter references")

        except Exception as e:
            self.log_error(f"Error checking relationships: {e}")
            all_good = False

        return all_good

    def verify_data_quality(self) -> bool:
        """Verify data quality and business rules"""
        self.log_section("DATA QUALITY CHECK")

        all_good = True

        try:
            # Check lease date validity
            self.cursor.execute("""
                SELECT COUNT(*) FROM leases
                WHERE start_date >= end_date
            """)
            invalid_lease_dates = self.cursor.fetchone()[0]
            if invalid_lease_dates > 0:
                self.log_error(f"Found {invalid_lease_dates} leases with invalid date ranges (start >= end)")
                all_good = False
            else:
                self.log_success("All leases have valid date ranges")

            # Check payment amounts are positive
            self.cursor.execute("""
                SELECT COUNT(*) FROM rent_payments
                WHERE amount <= 0
            """)
            invalid_payment_amounts = self.cursor.fetchone()[0]
            if invalid_payment_amounts > 0:
                self.log_error(f"Found {invalid_payment_amounts} payments with invalid amounts (<= 0)")
                all_good = False
            else:
                self.log_success("All payments have valid positive amounts")

            # Check unit numbers are unique within properties
            self.cursor.execute("""
                SELECT COUNT(*) FROM (
                    SELECT property_id, unit_number, COUNT(*)
                    FROM units
                    GROUP BY property_id, unit_number
                    HAVING COUNT(*) > 1
                ) duplicates
            """)
            duplicate_unit_numbers = self.cursor.fetchone()[0]
            if duplicate_unit_numbers > 0:
                self.log_error(f"Found duplicate unit numbers within properties")
                all_good = False
            else:
                self.log_success("All unit numbers are unique within properties")

            # Check tenant emails are unique
            self.cursor.execute("""
                SELECT COUNT(*) FROM (
                    SELECT email, COUNT(*)
                    FROM tenants
                    WHERE email IS NOT NULL
                    GROUP BY email
                    HAVING COUNT(*) > 1
                ) duplicates
            """)
            duplicate_emails = self.cursor.fetchone()[0]
            if duplicate_emails > 0:
                self.log_error(f"Found duplicate tenant emails")
                all_good = False
            else:
                self.log_success("All tenant emails are unique")

        except Exception as e:
            self.log_error(f"Error checking data quality: {e}")
            all_good = False

        return all_good

    def run_verification(self) -> bool:
        """Run complete verification suite"""
        print("\n" + "=" * 80)
        print("🔍 COMPREHENSIVE DATABASE VERIFICATION SYSTEM")
        print("=" * 80 + "\n")

        if not self.connect():
            return False

        try:
            expected_tables = self.get_expected_tables()
            overall_success = True

            # 1. Verify all tables exist
            self.log_section("TABLE EXISTENCE CHECK")
            for table_name in expected_tables.keys():
                if not self.verify_table_exists(table_name):
                    overall_success = False

            # 2. Verify table schemas
            self.log_section("SCHEMA VERIFICATION")
            for table_name, schema in expected_tables.items():
                if not self.verify_table_schema(table_name, schema):
                    overall_success = False

            # 3. Verify data counts
            self.log_section("DATA COUNT VERIFICATION")
            for table_name, schema in expected_tables.items():
                if not self.verify_table_data(table_name, schema['expected_count']):
                    overall_success = False

            # 4. Verify relationships
            if not self.verify_relationships():
                overall_success = False

            # 5. Verify data quality
            if not self.verify_data_quality():
                overall_success = False

            # Summary
            print("\n" + "=" * 80)
            if overall_success and not self.issues:
                self.log_success("🎉 ALL VERIFICATION CHECKS PASSED!")
                self.log_success("Database is properly seeded with correct schema and relationships")
            else:
                self.log_error("❌ VERIFICATION FAILED!")
                print(f"\nIssues found: {len(self.issues)}")
                for issue in self.issues:
                    print(f"  - {issue}")

            if self.warnings:
                print(f"\nWarnings: {len(self.warnings)}")
                for warning in self.warnings:
                    print(f"  - {warning}")

            print("=" * 80)

            return overall_success and not self.issues

        finally:
            self.disconnect()

def main():
    """Main verification function"""
    verifier = DatabaseVerifier()
    success = verifier.run_verification()
    sys.exit(0 if success else 1)

if __name__ == '__main__':
    main()