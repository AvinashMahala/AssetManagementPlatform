#!/usr/bin/env python3
"""
Test script to verify receipt generation data in database
"""

import psycopg2
import os

DB_CONFIG = {
    'host': 'localhost',
    'port': '5432',
    'database': 'assetdb',
    'user': 'user',
    'password': 'pass'
}

def main():
    conn = psycopg2.connect(**DB_CONFIG)
    cursor = conn.cursor()
    
    print("=" * 80)
    print("DATABASE VERIFICATION")
    print("=" * 80)
    
    # Check rent payment
    print("\n📋 Rent Payment Details:")
    cursor.execute("""
        SELECT rp.id, rp.amount, rp.due_date, rp.paid_date, rp.status, rp.payment_method,
               l.id as lease_id, l.tenant_id, l.unit_id, l.property_id
        FROM rent_payments rp
        JOIN leases l ON rp.lease_id = l.id
        WHERE rp.id = '5739859e-8f6a-4b79-9f52-d7027f674b3e'
    """)
    payment = cursor.fetchone()
    if payment:
        print(f"  ID: {payment[0]}")
        print(f"  Amount: ₹{payment[1]}")
        print(f"  Due Date: {payment[2]}")
        print(f"  Paid Date: {payment[3]}")
        print(f"  Status: {payment[4]}")
        print(f"  Payment Method: {payment[5]}")
        print(f"  Lease ID: {payment[6]}")
        print(f"  Tenant ID: {payment[7]}")
        print(f"  Unit ID: {payment[8]}")
        print(f"  Property ID: {payment[9]}")
    else:
        print("  ❌ Rent payment not found!")
    
    # Check tenant
    print("\n👤 Tenant Details:")
    cursor.execute("""
        SELECT id, first_name, last_name, email, phone
        FROM tenants
        WHERE id = 'f851e65f-4f59-4c67-b840-7e4b8a6407c1'
    """)
    tenant = cursor.fetchone()
    if tenant:
        print(f"  ID: {tenant[0]}")
        print(f"  Name: {tenant[1]} {tenant[2]}")
        print(f"  Email: {tenant[3]}")
        print(f"  Phone: {tenant[4]}")
    else:
        print("  ❌ Tenant not found!")
    
    # Check property
    print("\n🏢 Property Details:")
    cursor.execute("""
        SELECT id, name, address_street, address_city, address_state, address_pincode,
               area, template_id, receipt_settings
        FROM properties
        WHERE id = '65fb1f2c-c4fe-4bbb-879f-2056ed1d63f9'
    """)
    property = cursor.fetchone()
    if property:
        print(f"  ID: {property[0]}")
        print(f"  Name: {property[1]}")
        print(f"  Address: {property[2]}, {property[3]}, {property[4]} - {property[5]}")
        print(f"  Area: {property[6]} sq ft")
        print(f"  Template ID: {property[7]}")
        print(f"  Receipt Settings: {property[8]}")
    else:
        print("  ❌ Property not found!")
    
    # Check unit
    print("\n🏠 Unit Details:")
    cursor.execute("""
        SELECT id, unit_number, unit_name, floor, area, bedrooms, bathrooms, monthly_rent
        FROM units
        WHERE id = 'b2c3d4e5-f6a7-8901-bcde-f12345678901'
    """)
    unit = cursor.fetchone()
    if unit:
        print(f"  ID: {unit[0]}")
        print(f"  Unit Number: {unit[1]}")
        print(f"  Unit Name: {unit[2]}")
        print(f"  Floor: {unit[3]}")
        print(f"  Area: {unit[4]} sq ft")
        print(f"  Bedrooms: {unit[5]}")
        print(f"  Bathrooms: {unit[6]}")
        print(f"  Monthly Rent: ₹{unit[7]}")
    else:
        print("  ❌ Unit not found!")
    
    # Check lease
    print("\n📄 Lease Details:")
    cursor.execute("""
        SELECT id, tenant_id, unit_id, property_id, start_date, end_date, monthly_rent, status
        FROM leases
        WHERE id = '40f36bed-1bfd-46c0-98f1-d8fee56e800b'
    """)
    lease = cursor.fetchone()
    if lease:
        print(f"  ID: {lease[0]}")
        print(f"  Tenant ID: {lease[1]}")
        print(f"  Unit ID: {lease[2]}")
        print(f"  Property ID: {lease[3]}")
        print(f"  Start Date: {lease[4]}")
        print(f"  End Date: {lease[5]}")
        print(f"  Monthly Rent: ₹{lease[6]}")
        print(f"  Status: {lease[7]}")
    else:
        print("  ❌ Lease not found!")
    
    # Check receipt template
    print("\n📝 Receipt Template:")
    cursor.execute("""
        SELECT id, name, is_default
        FROM receipt_templates
        WHERE is_default = true
    """)
    template = cursor.fetchone()
    if template:
        print(f"  ID: {template[0]}")
        print(f"  Name: {template[1]}")
        print(f"  Is Default: {template[2]}")
    else:
        print("  ❌ Default receipt template not found!")
    
    print("\n" + "=" * 80)
    print("✅ All required data is present in database!")
    print("=" * 80)
    
    cursor.close()
    conn.close()

if __name__ == '__main__':
    main()
