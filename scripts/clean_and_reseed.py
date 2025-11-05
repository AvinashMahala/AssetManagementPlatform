#!/usr/bin/env python3
"""
Clean and Reseed Database Script
Drops all tables and recreates with fresh schema and sample data
"""

import os
import sys
import psycopg2
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT
import bcrypt
from datetime import datetime, date, timedelta

# Database configuration
DB_CONFIG = {
    'host': os.getenv('DB_HOST', 'localhost'),
    'port': os.getenv('DB_PORT', '5432'),
    'database': os.getenv('DB_NAME', 'assetdb'),
    'user': os.getenv('DB_USER', 'user'),
    'password': os.getenv('DB_PASSWORD', 'pass')
}

def print_step(message):
    print(f"🚀 {message}")

def print_success(message):
    print(f"✅ {message}")

def print_error(message):
    print(f"❌ {message}")

def get_db_connection():
    """Get database connection"""
    try:
        conn = psycopg2.connect(**DB_CONFIG)
        conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
        return conn
    except psycopg2.Error as e:
        print_error(f"Database connection failed: {e}")
        sys.exit(1)

def drop_all_tables(conn):
    """Drop all existing tables"""
    print_step("Dropping all existing tables...")
    
    cursor = conn.cursor()
    
    # Drop in reverse dependency order
    tables = [
        'meter_readings',
        'meters',
        'template_preview_cache',
        'rent_transactions',
        'receipts',
        'rent_payments',
        'leases',
        'unit_tenants',
        'tenant_documents',
        'units',
        'property_template_customizations',
        'properties',
        'receipt_templates',
        'tenants',
        'recovery_codes',
        'security_questions',
        'password_reset_methods',
        'phone_verification_codes',
        'users'
    ]
    
    for table in tables:
        try:
            cursor.execute(f"DROP TABLE IF EXISTS {table} CASCADE")
            print(f"  Dropped {table}")
        except Exception as e:
            print(f"  Warning dropping {table}: {e}")
    
    cursor.close()
    print_success("All tables dropped")

def create_schema(conn):
    """Create fresh database schema"""
    print_step("Creating database schema...")
    
    cursor = conn.cursor()
    
    # Create tables in order (respecting foreign keys)
    tables = [
        # Users table
        """
        CREATE TABLE users (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            username VARCHAR(255) UNIQUE NOT NULL,
            email VARCHAR(255) UNIQUE NOT NULL,
            password VARCHAR(255) NOT NULL,
            phone VARCHAR(20),
            role VARCHAR(50) DEFAULT 'user',
            google_id VARCHAR(255) UNIQUE,
            profile_picture VARCHAR(255),
            is_email_verified BOOLEAN DEFAULT FALSE,
            is_phone_verified BOOLEAN DEFAULT FALSE,
            email_verification_token VARCHAR(255),
            email_verification_expires TIMESTAMP,
            password_reset_token VARCHAR(255),
            password_reset_expires TIMESTAMP,
            last_login TIMESTAMP,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
        """,
        
        # Phone verification codes
        """
        CREATE TABLE phone_verification_codes (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            phone VARCHAR(20) NOT NULL,
            code VARCHAR(6) NOT NULL,
            expires_at TIMESTAMP NOT NULL,
            verified BOOLEAN DEFAULT FALSE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
        """,
        
        # Password reset methods
        """
        CREATE TABLE password_reset_methods (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            method_type VARCHAR(50) NOT NULL,
            is_enabled BOOLEAN DEFAULT TRUE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
        """,
        
        # Security questions
        """
        CREATE TABLE security_questions (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            question VARCHAR(255) NOT NULL,
            answer_hash VARCHAR(255) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
        """,
        
        # Recovery codes
        """
        CREATE TABLE recovery_codes (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            code_hash VARCHAR(255) NOT NULL,
            used BOOLEAN DEFAULT FALSE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            used_at TIMESTAMP
        )
        """,
        
        # Tenants table
        """
        CREATE TABLE tenants (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            first_name VARCHAR(255) NOT NULL,
            last_name VARCHAR(255) NOT NULL,
            email VARCHAR(255) UNIQUE NOT NULL,
            phone VARCHAR(20) NOT NULL,
            date_of_birth DATE,
            gender VARCHAR(20),
            occupation VARCHAR(255),
            monthly_income NUMERIC(10, 2),
            id_proof_type VARCHAR(50),
            id_proof_number VARCHAR(100),
            current_address_street VARCHAR(255),
            current_address_city VARCHAR(100),
            current_address_state VARCHAR(100),
            current_address_pincode VARCHAR(10),
            permanent_address_street VARCHAR(255),
            permanent_address_city VARCHAR(100),
            permanent_address_state VARCHAR(100),
            permanent_address_pincode VARCHAR(10),
            emergency_contact_name VARCHAR(255),
            emergency_contact_relationship VARCHAR(100),
            emergency_contact_phone VARCHAR(20),
            status VARCHAR(50) DEFAULT 'active',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
        """,
        
        # Receipt templates
        """
        CREATE TABLE receipt_templates (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            name VARCHAR(100) NOT NULL,
            type VARCHAR(20) NOT NULL CHECK (type IN ('basic', 'professional', 'premium')),
            description TEXT,
            default_settings JSONB NOT NULL,
            template_html TEXT,
            template_css JSONB,
            layout_config JSONB,
            placeholders JSONB,
            preview_image_url VARCHAR(500),
            is_active BOOLEAN NOT NULL DEFAULT true,
            is_default BOOLEAN NOT NULL DEFAULT false,
            sort_order INTEGER NOT NULL DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
        """,
        
        # Properties table
        """
        CREATE TABLE properties (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            name VARCHAR(255) NOT NULL,
            description TEXT,
            property_type VARCHAR(100),
            status VARCHAR(50) DEFAULT 'active',
            address_street VARCHAR(255),
            address_city VARCHAR(100),
            address_state VARCHAR(100),
            address_pincode VARCHAR(10),
            address_country VARCHAR(100) DEFAULT 'India',
            area NUMERIC(10, 2),
            total_floors INTEGER,
            construction_year INTEGER,
            parking_spaces INTEGER,
            amenities JSONB,
            owner_id UUID REFERENCES users(id),
            template_id UUID REFERENCES receipt_templates(id),
            template_overrides JSONB,
            receipt_settings JSONB,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
        """,
        
        # Property Template Customizations
        """
        CREATE TABLE property_template_customizations (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
            template_id UUID NOT NULL REFERENCES receipt_templates(id) ON DELETE CASCADE,
            custom_styles JSONB,
            custom_logo_url VARCHAR(500),
            custom_header TEXT,
            custom_footer TEXT,
            show_qr_code BOOLEAN DEFAULT FALSE,
            qr_code_data JSONB,
            qr_code_position VARCHAR(50) DEFAULT 'bottom-right',
            qr_code_size INTEGER DEFAULT 100,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(property_id, template_id)
        )
        """,
        
        # Template Preview Cache
        """
        CREATE TABLE template_preview_cache (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            template_id UUID REFERENCES receipt_templates(id) ON DELETE CASCADE,
            property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
            sample_data JSONB NOT NULL,
            preview_html TEXT,
            preview_pdf_url VARCHAR(500),
            preview_expires_at TIMESTAMP NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
        """,
        
        # Units table
        """
        CREATE TABLE units (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
            unit_number VARCHAR(50) NOT NULL,
            unit_name VARCHAR(255),
            description TEXT,
            unit_type VARCHAR(100),
            status VARCHAR(50) DEFAULT 'available',
            floor INTEGER,
            area NUMERIC(10, 2),
            bedrooms INTEGER,
            bathrooms INTEGER,
            furnished BOOLEAN DEFAULT FALSE,
            furnishing_details JSONB,
            monthly_rent NUMERIC(10, 2),
            security_deposit NUMERIC(10, 2),
            maintenance_charges NUMERIC(10, 2),
            features JSONB,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(property_id, unit_number)
        )
        """,
        
        # Tenant documents
        """
        CREATE TABLE tenant_documents (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
            document_type VARCHAR(100) NOT NULL,
            document_name VARCHAR(255) NOT NULL,
            document_url VARCHAR(500) NOT NULL,
            file_size INTEGER,
            uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
        """,
        
        # Unit tenants (junction table)
        """
        CREATE TABLE unit_tenants (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            unit_id UUID NOT NULL REFERENCES units(id) ON DELETE CASCADE,
            tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
            move_in_date DATE NOT NULL,
            move_out_date DATE,
            is_primary BOOLEAN DEFAULT FALSE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
        """,
        
        # Leases table
        """
        CREATE TABLE leases (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            property_id UUID NOT NULL REFERENCES properties(id),
            unit_id UUID NOT NULL REFERENCES units(id),
            tenant_id UUID NOT NULL REFERENCES tenants(id),
            start_date DATE NOT NULL,
            end_date DATE NOT NULL,
            monthly_rent NUMERIC(10, 2) NOT NULL,
            security_deposit NUMERIC(10, 2),
            late_fee_amount NUMERIC(10, 2),
            grace_period_days INTEGER DEFAULT 3,
            payment_due_day INTEGER DEFAULT 1,
            terms_conditions TEXT,
            special_clauses TEXT,
            status VARCHAR(50) DEFAULT 'draft',
            signed_at TIMESTAMP,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
        """,
        
        # Rent payments table
        """
        CREATE TABLE rent_payments (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            lease_id UUID NOT NULL REFERENCES leases(id),
            property_id UUID NOT NULL REFERENCES properties(id),
            tenant_id UUID NOT NULL REFERENCES tenants(id),
            amount NUMERIC(10, 2) NOT NULL,
            due_date DATE NOT NULL,
            paid_date DATE,
            payment_method VARCHAR(50),
            transaction_reference VARCHAR(255),
            status VARCHAR(50) DEFAULT 'pending',
            late_fee NUMERIC(10, 2) DEFAULT 0,
            notes TEXT,
            created_by UUID REFERENCES users(id),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
        """,
        
        # Rent transactions table
        """
        CREATE TABLE rent_transactions (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            rent_payment_id UUID NOT NULL REFERENCES rent_payments(id),
            transaction_type VARCHAR(50) NOT NULL,
            amount NUMERIC(10, 2) NOT NULL,
            transaction_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            payment_method VARCHAR(50),
            reference_number VARCHAR(255),
            status VARCHAR(50) DEFAULT 'completed',
            notes TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
        """,
        
        # Receipts table
        """
        CREATE TABLE receipts (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            receipt_number VARCHAR(100) NOT NULL UNIQUE,
            property_id UUID NOT NULL REFERENCES properties(id),
            rent_transaction_id UUID REFERENCES rent_transactions(id),
            tenant_id UUID REFERENCES tenants(id),
            receipt_date TIMESTAMP NOT NULL,
            amount DECIMAL(12,2) NOT NULL,
            description TEXT NOT NULL,
            receipt_data JSONB NOT NULL,
            pdf_url TEXT,
            file_size INTEGER,
            status VARCHAR(50) DEFAULT 'generated',
            generated_by UUID NOT NULL REFERENCES users(id),
            sent_to VARCHAR(255),
            sent_at TIMESTAMP,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
        """,
        
        # Meters table
        """
        CREATE TABLE meters (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            property_id UUID NOT NULL REFERENCES properties(id),
            unit_id UUID REFERENCES units(id),
            meter_type VARCHAR(50) NOT NULL,
            meter_number VARCHAR(100) NOT NULL,
            installation_date DATE,
            status VARCHAR(50) DEFAULT 'active',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
        """,
        
        # Meter readings table
        """
        CREATE TABLE meter_readings (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            meter_id UUID NOT NULL REFERENCES meters(id),
            reading_value NUMERIC(10, 2) NOT NULL,
            reading_date DATE NOT NULL,
            recorded_by UUID REFERENCES users(id),
            notes TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
        """
    ]
    
    # Execute table creation
    for table_sql in tables:
        try:
            cursor.execute(table_sql)
        except Exception as e:
            print(f"  Error creating table: {e}")
            raise
    
    # Create indexes
    indexes = [
        "CREATE INDEX idx_properties_owner_id ON properties(owner_id)",
        "CREATE INDEX idx_units_property_id ON units(property_id)",
        "CREATE INDEX idx_leases_property_id ON leases(property_id)",
        "CREATE INDEX idx_rent_payments_lease_id ON rent_payments(lease_id)",
        "CREATE INDEX idx_users_email ON users(email)",
        "CREATE INDEX idx_tenants_email ON tenants(email)"
    ]
    
    for index_sql in indexes:
        try:
            cursor.execute(index_sql)
        except Exception as e:
            print(f"  Warning creating index: {e}")
    
    # Insert default receipt template
    cursor.execute("""
        INSERT INTO receipt_templates (
            name, type, description, default_settings, template_html, template_css, 
            layout_config, placeholders, is_active, is_default, sort_order
        )
        VALUES (
            'Basic Template',
            'basic',
            'Simple and clean receipt template for basic needs',
            '{"theme":{"primaryColor":"#2563eb","secondaryColor":"#64748b","fontFamily":"Arial, sans-serif","fontSize":"medium"},"layout":{"showLogo":false,"logoPosition":"top-left","showWatermark":false,"paperSize":"a4","orientation":"portrait"},"content":{"showPropertyAddress":true,"showTenantAddress":true,"showPaymentBreakdown":true,"showBalanceForward":true,"showTermsAndConditions":false,"showSignature":true,"signatureText":"Landlord Signature"},"paymentOptions":{"showBankDetails":true,"showUPI":true,"showQRCode":false,"showWallets":false},"numbering":{"prefix":"REC","startNumber":1,"includeYear":true,"includeMonth":true}}',
            NULL,
            '{"colors":{"primary":"#2563eb","secondary":"#64748b","text":"#1e293b","background":"#ffffff","border":"#e2e8f0"},"fonts":{"heading":{"family":"Arial, sans-serif","size":18,"weight":"bold"},"body":{"family":"Arial, sans-serif","size":12,"weight":"normal"},"caption":{"family":"Arial, sans-serif","size":10,"weight":"normal"}},"spacing":{"section":15,"field":8},"borders":{"width":1,"color":"#e2e8f0","radius":4}}',
            '{"margins":{"top":50,"right":50,"bottom":50,"left":50},"spacing":{"section":20,"field":10},"pageSize":"A4","orientation":"portrait","showHeader":true,"showFooter":true}',
            '{"property":["{{property.name}}","{{property.address}}","{{property.phone}}","{{property.email}}"],"landlord":["{{landlord.name}}","{{landlord.email}}","{{landlord.phone}}"],"tenant":["{{tenant.name}}","{{tenant.email}}","{{tenant.phone}}","{{tenant.address}}"],"payment":["{{payment.amount}}","{{payment.date}}","{{payment.method}}","{{payment.reference}}"],"receipt":["{{receipt.number}}","{{receipt.date}}"],"period":["{{period.from}}","{{period.to}}"],"breakdown":["{{breakdown.baseRent}}","{{breakdown.totalAmount}}","{{breakdown.amountPaid}}","{{breakdown.balance}}"]}',
            true,
            true,
            1
        )
    """)
    
    cursor.close()
    print_success("Database schema created")

def seed_users(conn):
    """Seed users data"""
    print_step("Seeding users...")
    
    cursor = conn.cursor()
    
    # Hash passwords
    admin_password = bcrypt.hashpw('admin123'.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
    user_password = bcrypt.hashpw('user123'.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
    
    users = [
        ('e2f9046a-1909-4a8f-b510-d0d6fbdc700a', 'admin', 'admin@assetplatform.com', admin_password, '+91-9876543210', 'admin', True, True),
        ('d9d19624-026c-4b54-bd1b-9eec092630ca', 'john_owner', 'john.doe@example.com', user_password, '+91-9876543211', 'user', True, True),
        ('f40a33a6-8f4c-4a1d-bd26-857920024739', 'dev_user', 'dev@example.com', user_password, '+91-9876543212', 'admin', True, True)
    ]
    
    for user in users:
        cursor.execute("""
            INSERT INTO users (id, username, email, password, phone, role, is_email_verified, is_phone_verified)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
        """, user)
    
    cursor.close()
    print_success(f"Seeded {len(users)} users")

def seed_tenants(conn):
    """Seed tenants data"""
    print_step("Seeding tenants...")
    
    cursor = conn.cursor()
    
    tenants = [
        ('2c5e1f2f-835a-4e00-bd5c-4f7491fb27ff', 'Rajesh', 'Kumar', 'rajesh.kumar@example.com', '+91-9876543214', 
         '1985-05-15', 'male', 'Software Engineer', 35000, 'active'),
        ('f851e65f-4f59-4c67-b840-7e4b8a6407c1', 'Priya', 'Sharma', 'priya.sharma@example.com', '+91-9876543215',
         '1990-08-20', 'female', 'Marketing Manager', 45000, 'active'),
    ]
    
    for tenant in tenants:
        cursor.execute("""
            INSERT INTO tenants (
                id, first_name, last_name, email, phone, date_of_birth, gender, occupation, monthly_income, status,
                current_address_street, current_address_city, current_address_state, current_address_pincode,
                permanent_address_street, permanent_address_city, permanent_address_state, permanent_address_pincode,
                emergency_contact_name, emergency_contact_relationship, emergency_contact_phone
            ) VALUES (
                %s, %s, %s, %s, %s, %s, %s, %s, %s, %s,
                '123 Current St', 'Mumbai', 'Maharashtra', '400001',
                '456 Permanent St', 'Mumbai', 'Maharashtra', '400002',
                'Emergency Contact', 'Family', '+91-9999999999'
            )
        """, tenant)
    
    cursor.close()
    print_success(f"Seeded {len(tenants)} tenants")

def seed_properties_and_units(conn):
    """Seed properties and units"""
    print_step("Seeding properties and units...")
    
    cursor = conn.cursor()
    
    # Get template ID
    cursor.execute("SELECT id FROM receipt_templates WHERE is_default = true LIMIT 1")
    template_id = cursor.fetchone()[0]
    
    # Property 1
    property1_id = '030912e1-e4f7-48b6-9e38-334e852c4374'
    cursor.execute("""
        INSERT INTO properties (
            id, name, description, property_type, status,
            address_street, address_city, address_state, address_pincode,
            area, total_floors, parking_spaces, owner_id, template_id
        ) VALUES (
            %s, 'Modern 2BHK Apartment', 'Luxury apartment in prime location', 'apartment', 'active',
            '123 MG Road', 'Bangalore', 'Karnataka', '560001',
            1200, 5, 2, 'd9d19624-026c-4b54-bd1b-9eec092630ca', %s
        )
    """, (property1_id, template_id))
    
    # Unit for Property 1
    unit1_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'
    cursor.execute("""
        INSERT INTO units (
            id, property_id, unit_number, unit_name, description, unit_type, status,
            floor, area, bedrooms, bathrooms, furnished, monthly_rent, security_deposit, maintenance_charges
        ) VALUES (
            %s, %s, '101', 'Modern 2BHK - Unit 101', 'Spacious 2BHK with modern amenities', 'apartment', 'occupied',
            1, 1000, 2, 2, true, 42000, 126000, 2000
        )
    """, (unit1_id, property1_id))
    
    # Property 2
    property2_id = '65fb1f2c-c4fe-4bbb-879f-2056ed1d63f9'
    cursor.execute("""
        INSERT INTO properties (
            id, name, description, property_type, status,
            address_street, address_city, address_state, address_pincode,
            area, total_floors, parking_spaces, owner_id, template_id
        ) VALUES (
            %s, 'Luxury Villa', 'Independent villa with garden', 'villa', 'active',
            '456 Park Avenue', 'Mumbai', 'Maharashtra', '400050',
            2500, 2, 4, 'd9d19624-026c-4b54-bd1b-9eec092630ca', %s
        )
    """, (property2_id, template_id))
    
    # Unit for Property 2
    unit2_id = 'b2c3d4e5-f6a7-8901-bcde-f12345678901'
    cursor.execute("""
        INSERT INTO units (
            id, property_id, unit_number, unit_name, description, unit_type, status,
            floor, area, bedrooms, bathrooms, furnished, monthly_rent, security_deposit, maintenance_charges
        ) VALUES (
            %s, %s, 'VILLA', 'Luxury Villa - Full Property', 'Complete villa with garden and parking', 'villa', 'occupied',
            0, 2500, 4, 3, true, 78000, 234000, 5000
        )
    """, (unit2_id, property2_id))
    
    cursor.close()
    print_success("Seeded properties and units")

def seed_leases(conn):
    """Seed leases"""
    print_step("Seeding leases...")
    
    cursor = conn.cursor()
    
    # Lease 1
    lease1_id = '15fcf874-719f-4754-a206-f0e38429e741'
    cursor.execute("""
        INSERT INTO leases (
            id, property_id, unit_id, tenant_id,
            start_date, end_date, monthly_rent, security_deposit, status, signed_at
        ) VALUES (
            %s, '030912e1-e4f7-48b6-9e38-334e852c4374', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', '2c5e1f2f-835a-4e00-bd5c-4f7491fb27ff',
            '2024-01-15', '2025-01-14', 42000, 126000, 'active', '2024-01-10'
        )
    """, (lease1_id,))
    
    # Lease 2
    lease2_id = '40f36bed-1bfd-46c0-98f1-d8fee56e800b'
    cursor.execute("""
        INSERT INTO leases (
            id, property_id, unit_id, tenant_id,
            start_date, end_date, monthly_rent, security_deposit, status, signed_at
        ) VALUES (
            %s, '65fb1f2c-c4fe-4bbb-879f-2056ed1d63f9', 'b2c3d4e5-f6a7-8901-bcde-f12345678901', 'f851e65f-4f59-4c67-b840-7e4b8a6407c1',
            '2024-02-01', '2025-01-31', 78000, 234000, 'active', '2024-01-25'
        )
    """, (lease2_id,))
    
    cursor.close()
    print_success("Seeded leases")

def seed_rent_payments(conn):
    """Seed rent payments"""
    print_step("Seeding rent payments...")
    
    cursor = conn.cursor()
    
    payments = [
        ('5739859e-8f6a-4b79-9f52-d7027f674b3e', '40f36bed-1bfd-46c0-98f1-d8fee56e800b', '65fb1f2c-c4fe-4bbb-879f-2056ed1d63f9',
         'f851e65f-4f59-4c67-b840-7e4b8a6407c1', 78000, '2024-03-01', '2024-02-28', 'paid', 'check', 'd9d19624-026c-4b54-bd1b-9eec092630ca'),
        ('6849960f-9a0a-5c80-a063-e8137a785c4f', '15fcf874-719f-4754-a206-f0e38429e741', '030912e1-e4f7-48b6-9e38-334e852c4374',
         '2c5e1f2f-835a-4e00-bd5c-4f7491fb27ff', 42000, '2024-02-15', '2024-02-14', 'paid', 'online', 'd9d19624-026c-4b54-bd1b-9eec092630ca'),
    ]
    
    for payment in payments:
        cursor.execute("""
            INSERT INTO rent_payments (
                id, lease_id, property_id, tenant_id, amount, due_date, paid_date, status, payment_method, created_by, notes
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """, (*payment, f'{payment[8].capitalize()} rent payment'))
    
    cursor.close()
    print_success(f"Seeded {len(payments)} rent payments")

def main():
    """Main function"""
    print("=" * 60)
    print("🗄️  Asset Management Database Clean & Reseed")
    print("=" * 60)
    print()
    
    # Confirm action
    print("⚠️  WARNING: This will DELETE ALL DATA and recreate the database!")
    response = input("Type 'YES' to continue: ").strip()
    if response != 'YES':
        print_step("Operation cancelled")
        sys.exit(0)
    
    print()
    
    # Connect to database
    conn = get_db_connection()
    
    try:
        # Drop all tables
        drop_all_tables(conn)
        
        # Create schema
        create_schema(conn)
        
        # Seed data
        seed_users(conn)
        seed_tenants(conn)
        seed_properties_and_units(conn)
        seed_leases(conn)
        seed_rent_payments(conn)
        
        print()
        print("=" * 60)
        print_success("Database cleaned and reseeded successfully!")
        print("=" * 60)
        print()
        print("🔑 Test Credentials:")
        print("   Admin: admin@assetplatform.com / admin123")
        print("   User:  john.doe@example.com / user123")
        print()
        
    except Exception as e:
        print_error(f"Error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
    finally:
        conn.close()

if __name__ == '__main__':
    main()
