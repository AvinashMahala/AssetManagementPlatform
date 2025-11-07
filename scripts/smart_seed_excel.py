#!/usr/bin/env python3
"""
Create simplified Excel file with seed data - No UUIDs needed!
The flexible_seed.py script will generate UUIDs dynamically and handle foreign keys
"""
import pandas as pd
import os

def convert_to_proper_types(df, int_columns=None):
    """Convert DataFrame columns to proper types (integers stay as integers)"""
    if int_columns:
        for col in int_columns:
            if col in df.columns:
                # Convert to integer, keeping None for null values
                df[col] = df[col].apply(lambda x: int(x) if pd.notna(x) and x is not None else None)
    return df

def create_smart_seed_excel():
    """Create Excel file with simplified seed data (no UUIDs)"""
    output_file = 'scripts/seed_data/seed_data.xlsx'
    
    # Create seed_data directory if it doesn't exist
    os.makedirs('scripts/seed_data', exist_ok=True)
    
    # Create Excel writer with options to preserve data types
    with pd.ExcelWriter(output_file, engine='openpyxl') as writer:
        
        # 1. Users (Admin + 3 Property Owners) - Use simple keys
        users_data = pd.DataFrame([
            {
                'key': 'admin',
                'username': 'admin',
                'email': 'admin@assetplatform.com',
                'password_plain': 'admin123',
                'phone': '+919437123456',
                'role': 'admin',
                'is_email_verified': True,
                'is_phone_verified': True
            },
            {
                'key': 'ramesh_patel',
                'username': 'ramesh_patel',
                'email': 'ramesh.patel@example.com',
                'password_plain': 'owner123',
                'phone': '+919437234567',
                'role': 'user',
                'is_email_verified': True,
                'is_phone_verified': True
            },
            {
                'key': 'sunita_das',
                'username': 'sunita_das',
                'email': 'sunita.das@example.com',
                'password_plain': 'owner123',
                'phone': '+919437345678',
                'role': 'user',
                'is_email_verified': True,
                'is_phone_verified': True
            },
            {
                'key': 'prakash_nayak',
                'username': 'prakash_nayak',
                'email': 'prakash.nayak@example.com',
                'password_plain': 'owner123',
                'phone': '+919437456789',
                'role': 'user',
                'is_email_verified': True,
                'is_phone_verified': True
            }
        ])
        users_data.to_excel(writer, sheet_name='users', index=False)
        
        # 2. Tenants (15 realistic Odisha tenants) - Use simple keys
        tenants_data = pd.DataFrame([
            {'key': 'rajesh_kumar', 'first_name': 'Rajesh', 'last_name': 'Kumar', 'email': 'rajesh.kumar@techcorp.com',
             'phone': '+919437567890', 'alternate_phone': '+916370123456', 'date_of_birth': '1988-05-15', 'gender': 'male',
             'occupation': 'Software Engineer', 'company_name': 'Infosys Bhubaneswar', 'monthly_income': 75000,
             'current_address_street': 'Plot 45, Nayapalli', 'current_address_city': 'Bhubaneswar',
             'current_address_state': 'Odisha', 'current_address_pincode': '751012',
             'permanent_address_street': 'Gajapati Nagar, Lane 3', 'permanent_address_city': 'Berhampur',
             'permanent_address_state': 'Odisha', 'permanent_address_pincode': '760001',
             'emergency_contact_name': 'Priya Kumar', 'emergency_contact_relationship': 'Spouse',
             'emergency_contact_phone': '+919437567891', 'status': 'active', 'total_rentals': 2},
            
            {'key': 'priya_sharma', 'first_name': 'Priya', 'last_name': 'Sharma', 'email': 'priya.sharma@dav.edu',
             'phone': '+919437678901', 'alternate_phone': None, 'date_of_birth': '1992-08-20', 'gender': 'female',
             'occupation': 'School Teacher', 'company_name': 'DAV Public School', 'monthly_income': 42000,
             'current_address_street': 'Saheed Nagar, Unit 6', 'current_address_city': 'Bhubaneswar',
             'current_address_state': 'Odisha', 'current_address_pincode': '751007',
             'permanent_address_street': None, 'permanent_address_city': None,
             'permanent_address_state': None, 'permanent_address_pincode': None,
             'emergency_contact_name': 'Ramesh Sharma', 'emergency_contact_relationship': 'Father',
             'emergency_contact_phone': '+919437678902', 'status': 'active', 'total_rentals': 1},
            
            {'key': 'amit_patel', 'first_name': 'Amit', 'last_name': 'Patel', 'email': 'amit.patel@gmail.com',
             'phone': '+919437789012', 'alternate_phone': '+916371234567', 'date_of_birth': '1985-03-12', 'gender': 'male',
             'occupation': 'Business Analyst', 'company_name': 'TCS Bhubaneswar', 'monthly_income': 68000,
             'current_address_street': 'Janpath, Near Raj Bhavan', 'current_address_city': 'Bhubaneswar',
             'current_address_state': 'Odisha', 'current_address_pincode': '751001',
             'permanent_address_street': 'Station Road', 'permanent_address_city': 'Cuttack',
             'permanent_address_state': 'Odisha', 'permanent_address_pincode': '753001',
             'emergency_contact_name': 'Kavita Patel', 'emergency_contact_relationship': 'Sister',
             'emergency_contact_phone': '+919437789013', 'status': 'active', 'total_rentals': 1},
            
            {'key': 'sneha_reddy', 'first_name': 'Sneha', 'last_name': 'Reddy', 'email': 'sneha.reddy@wipro.com',
             'phone': '+919437890123', 'alternate_phone': '+916372345678', 'date_of_birth': '1990-11-25', 'gender': 'female',
             'occupation': 'HR Manager', 'company_name': 'Wipro Technologies', 'monthly_income': 85000,
             'current_address_street': 'Patia, Gajapati Nagar', 'current_address_city': 'Bhubaneswar',
             'current_address_state': 'Odisha', 'current_address_pincode': '751024',
             'permanent_address_street': 'Chandrasekharpur, Plot 234', 'permanent_address_city': 'Bhubaneswar',
             'permanent_address_state': 'Odisha', 'permanent_address_pincode': '751016',
             'emergency_contact_name': 'Ravi Reddy', 'emergency_contact_relationship': 'Brother',
             'emergency_contact_phone': '+919437890124', 'status': 'active', 'total_rentals': 3},
            
            {'key': 'deepak_mishra', 'first_name': 'Deepak', 'last_name': 'Mishra', 'email': 'dr.deepak.mishra@aiims.in',
             'phone': '+919437901234', 'alternate_phone': None, 'date_of_birth': '1987-01-10', 'gender': 'male',
             'occupation': 'Medical Officer', 'company_name': 'AIIMS Bhubaneswar', 'monthly_income': 95000,
             'current_address_street': 'Khandagiri Vihar', 'current_address_city': 'Bhubaneswar',
             'current_address_state': 'Odisha', 'current_address_pincode': '751030',
             'permanent_address_street': 'Medical Colony', 'permanent_address_city': 'Sambalpur',
             'permanent_address_state': 'Odisha', 'permanent_address_pincode': '768001',
             'emergency_contact_name': 'Anjali Mishra', 'emergency_contact_relationship': 'Spouse',
             'emergency_contact_phone': '+919437901235', 'status': 'active', 'total_rentals': 2},
            
            {'key': 'rahul_nayak', 'first_name': 'Rahul', 'last_name': 'Nayak', 'email': 'rahul.nayak@student.kiit.ac.in',
             'phone': '+919438012345', 'alternate_phone': None, 'date_of_birth': '2001-07-18', 'gender': 'male',
             'occupation': 'Student', 'company_name': 'KIIT University', 'monthly_income': 15000,
             'current_address_street': 'Campus 7, KIIT', 'current_address_city': 'Bhubaneswar',
             'current_address_state': 'Odisha', 'current_address_pincode': '751024',
             'permanent_address_street': 'Jagannath Road', 'permanent_address_city': 'Puri',
             'permanent_address_state': 'Odisha', 'permanent_address_pincode': '752001',
             'emergency_contact_name': 'Suresh Nayak', 'emergency_contact_relationship': 'Father',
             'emergency_contact_phone': '+919438012346', 'status': 'active', 'total_rentals': 1},
            
            {'key': 'anita_das', 'first_name': 'Anita', 'last_name': 'Das', 'email': 'anita.das@marketing.com',
             'phone': '+919438123456', 'alternate_phone': '+916373456789', 'date_of_birth': '1993-04-05', 'gender': 'female',
             'occupation': 'Marketing Executive', 'company_name': 'Mindtree Ltd', 'monthly_income': 52000,
             'current_address_street': 'Vani Vihar, Near Market', 'current_address_city': 'Bhubaneswar',
             'current_address_state': 'Odisha', 'current_address_pincode': '751004',
             'permanent_address_street': 'Link Road', 'permanent_address_city': 'Cuttack',
             'permanent_address_state': 'Odisha', 'permanent_address_pincode': '753012',
             'emergency_contact_name': 'Bijay Das', 'emergency_contact_relationship': 'Brother',
             'emergency_contact_phone': '+919438123457', 'status': 'active', 'total_rentals': 1},
            
            {'key': 'suresh_behera', 'first_name': 'Suresh', 'last_name': 'Behera', 'email': 'suresh.behera@sbi.co.in',
             'phone': '+919438234567', 'alternate_phone': None, 'date_of_birth': '1984-09-30', 'gender': 'male',
             'occupation': 'Bank Manager', 'company_name': 'State Bank of India', 'monthly_income': 78000,
             'current_address_street': 'Rasulgarh, Industrial Estate', 'current_address_city': 'Bhubaneswar',
             'current_address_state': 'Odisha', 'current_address_pincode': '751010',
             'permanent_address_street': 'College Square', 'permanent_address_city': 'Berhampur',
             'permanent_address_state': 'Odisha', 'permanent_address_pincode': '760002',
             'emergency_contact_name': 'Sarita Behera', 'emergency_contact_relationship': 'Spouse',
             'emergency_contact_phone': '+919438234568', 'status': 'active', 'total_rentals': 2},
            
            {'key': 'meera_sahoo', 'first_name': 'Meera', 'last_name': 'Sahoo', 'email': 'meera.sahoo@architects.com',
             'phone': '+919438345678', 'alternate_phone': '+916374567890', 'date_of_birth': '1991-12-08', 'gender': 'female',
             'occupation': 'Architect', 'company_name': 'Urban Design Studio', 'monthly_income': 62000,
             'current_address_street': 'Jaydev Vihar, Plot 89', 'current_address_city': 'Bhubaneswar',
             'current_address_state': 'Odisha', 'current_address_pincode': '751013',
             'permanent_address_street': None, 'permanent_address_city': None,
             'permanent_address_state': None, 'permanent_address_pincode': None,
             'emergency_contact_name': 'Prakash Sahoo', 'emergency_contact_relationship': 'Father',
             'emergency_contact_phone': '+919438345679', 'status': 'active', 'total_rentals': 1},
            
            {'key': 'vikram_singh', 'first_name': 'Vikram', 'last_name': 'Singh', 'email': 'vikram.singh@hotels.com',
             'phone': '+919438456789', 'alternate_phone': None, 'date_of_birth': '1989-06-22', 'gender': 'male',
             'occupation': 'Executive Chef', 'company_name': 'Mayfair Hotels', 'monthly_income': 58000,
             'current_address_street': 'Kalpana Square Area', 'current_address_city': 'Bhubaneswar',
             'current_address_state': 'Odisha', 'current_address_pincode': '751014',
             'permanent_address_street': 'Station Bazaar', 'permanent_address_city': 'Rourkela',
             'permanent_address_state': 'Odisha', 'permanent_address_pincode': '769001',
             'emergency_contact_name': 'Simran Singh', 'emergency_contact_relationship': 'Sister',
             'emergency_contact_phone': '+919438456790', 'status': 'active', 'total_rentals': 1},
            
            {'key': 'lakshmi_panda', 'first_name': 'Lakshmi', 'last_name': 'Panda', 'email': 'lakshmi.panda@finance.com',
             'phone': '+919438567890', 'alternate_phone': '+916375678901', 'date_of_birth': '1986-02-14', 'gender': 'female',
             'occupation': 'Senior Accountant', 'company_name': 'ICICI Bank', 'monthly_income': 72000,
             'current_address_street': 'Old Town, Near Temple', 'current_address_city': 'Bhubaneswar',
             'current_address_state': 'Odisha', 'current_address_pincode': '751002',
             'permanent_address_street': 'Badambadi', 'permanent_address_city': 'Cuttack',
             'permanent_address_state': 'Odisha', 'permanent_address_pincode': '753009',
             'emergency_contact_name': 'Narayan Panda', 'emergency_contact_relationship': 'Spouse',
             'emergency_contact_phone': '+919438567891', 'status': 'active', 'total_rentals': 2},
            
            {'key': 'santosh_jena', 'first_name': 'Santosh', 'last_name': 'Jena', 'email': 'santosh.jena@construction.com',
             'phone': '+919438678901', 'alternate_phone': None, 'date_of_birth': '1983-10-05', 'gender': 'male',
             'occupation': 'Civil Engineer', 'company_name': 'L&T Construction', 'monthly_income': 82000,
             'current_address_street': 'Sundarpada, Phase 2', 'current_address_city': 'Bhubaneswar',
             'current_address_state': 'Odisha', 'current_address_pincode': '751025',
             'permanent_address_street': 'College Road', 'permanent_address_city': 'Balasore',
             'permanent_address_state': 'Odisha', 'permanent_address_pincode': '756001',
             'emergency_contact_name': 'Sunita Jena', 'emergency_contact_relationship': 'Spouse',
             'emergency_contact_phone': '+919438678902', 'status': 'active', 'total_rentals': 3},
            
            {'key': 'kavita_mohanty', 'first_name': 'Kavita', 'last_name': 'Mohanty', 'email': 'kavita.mohanty@pharmacy.com',
             'phone': '+919438789012', 'alternate_phone': None, 'date_of_birth': '1994-08-17', 'gender': 'female',
             'occupation': 'Pharmacist', 'company_name': 'Apollo Pharmacy', 'monthly_income': 38000,
             'current_address_street': 'Baramunda, Market Complex', 'current_address_city': 'Bhubaneswar',
             'current_address_state': 'Odisha', 'current_address_pincode': '751003',
             'permanent_address_street': None, 'permanent_address_city': None,
             'permanent_address_state': None, 'permanent_address_pincode': None,
             'emergency_contact_name': 'Rajesh Mohanty', 'emergency_contact_relationship': 'Father',
             'emergency_contact_phone': '+919438789013', 'status': 'active', 'total_rentals': 1},
            
            {'key': 'pooja_swain', 'first_name': 'Pooja', 'last_name': 'Swain', 'email': 'pooja.swain@freelance.com',
             'phone': '+919438890123', 'alternate_phone': '+916376789012', 'date_of_birth': '1995-05-28', 'gender': 'female',
             'occupation': 'Content Writer', 'company_name': 'Freelance', 'monthly_income': 35000,
             'current_address_street': 'Kalinga Nagar, Block C', 'current_address_city': 'Bhubaneswar',
             'current_address_state': 'Odisha', 'current_address_pincode': '751003',
             'permanent_address_street': 'Gandhi Nagar', 'permanent_address_city': 'Bhubaneswar',
             'permanent_address_state': 'Odisha', 'permanent_address_pincode': '751009',
             'emergency_contact_name': 'Sunita Swain', 'emergency_contact_relationship': 'Mother',
             'emergency_contact_phone': '+919438890124', 'status': 'active', 'total_rentals': 1},
            
            {'key': 'biswa_rout', 'first_name': 'Biswa', 'last_name': 'Rout', 'email': 'biswa.rout@sales.com',
             'phone': '+919438901234', 'alternate_phone': None, 'date_of_birth': '1982-11-11', 'gender': 'male',
             'occupation': 'Sales Manager', 'company_name': 'Godrej Consumer Products', 'monthly_income': 88000,
             'current_address_street': 'Mancheswar, Industrial Area', 'current_address_city': 'Bhubaneswar',
             'current_address_state': 'Odisha', 'current_address_pincode': '751010',
             'permanent_address_street': 'Ranihat', 'permanent_address_city': 'Cuttack',
             'permanent_address_state': 'Odisha', 'permanent_address_pincode': '753001',
             'emergency_contact_name': 'Pallavi Rout', 'emergency_contact_relationship': 'Spouse',
             'emergency_contact_phone': '+919438901235', 'status': 'active', 'total_rentals': 2}
        ])
        # Convert numeric columns to proper integers
        tenants_data = convert_to_proper_types(tenants_data, ['monthly_income', 'total_rentals'])
        tenants_data.to_excel(writer, sheet_name='tenants', index=False)
        
        # 3. Properties - Reference owners by key
        properties_data = pd.DataFrame([
            {'key': 'saheed_nagar', 'owner_key': 'ramesh_patel', 'name': 'Saheed Nagar Residency',
             'description': 'Modern apartment complex in prime Saheed Nagar area with excellent connectivity',
             'property_type': 'apartment', 'status': 'active', 'address_street': 'Plot 234, Saheed Nagar',
             'address_city': 'Bhubaneswar', 'address_state': 'Odisha', 'address_pincode': '751007',
             'area': 5000, 'total_floors': 4, 'parking_spaces': 8},
            
            {'key': 'jaydev_vihar', 'owner_key': 'sunita_das', 'name': 'Jaydev Vihar Apartments',
             'description': 'Premium residential apartments near Utkal University with modern amenities',
             'property_type': 'apartment', 'status': 'active', 'address_street': 'Plot 89/A, Jaydev Vihar',
             'address_city': 'Bhubaneswar', 'address_state': 'Odisha', 'address_pincode': '751013',
             'area': 4200, 'total_floors': 3, 'parking_spaces': 6},
            
            {'key': 'patia_green', 'owner_key': 'prakash_nayak', 'name': 'Patia Green Residency',
             'description': 'Family-friendly apartments in growing Patia area, close to IT companies and KIIT',
             'property_type': 'apartment', 'status': 'active', 'address_street': 'Chandaka Industrial Estate Road, Patia',
             'address_city': 'Bhubaneswar', 'address_state': 'Odisha', 'address_pincode': '751024',
             'area': 6000, 'total_floors': 5, 'parking_spaces': 10}
        ])
        # Convert numeric columns to proper integers
        properties_data = convert_to_proper_types(properties_data, ['area', 'total_floors', 'parking_spaces', 'total_units'])
        properties_data.to_excel(writer, sheet_name='properties', index=False)
        
        # 4. Units - Reference properties by key
        units_data = pd.DataFrame([
            # Saheed Nagar units
            {'key': 'sn_101', 'property_key': 'saheed_nagar', 'unit_number': '101', 'unit_name': 'Ground Floor 2BHK',
             'description': 'Spacious 2BHK with balcony', 'unit_type': 'apartment', 'status': 'occupied',
             'floor': 1, 'area': 1050, 'bedrooms': 2, 'bathrooms': 2, 'furnished': True,
             'monthly_rent': 12000, 'security_deposit': 36000, 'maintenance_charges': 1500},
            
            {'key': 'sn_201', 'property_key': 'saheed_nagar', 'unit_number': '201', 'unit_name': 'First Floor 3BHK',
             'description': 'Premium 3BHK with modern kitchen', 'unit_type': 'apartment', 'status': 'occupied',
             'floor': 2, 'area': 1450, 'bedrooms': 3, 'bathrooms': 3, 'furnished': True,
             'monthly_rent': 18000, 'security_deposit': 54000, 'maintenance_charges': 2000},
            
            {'key': 'sn_301', 'property_key': 'saheed_nagar', 'unit_number': '301', 'unit_name': 'Second Floor 1BHK',
             'description': 'Cozy 1BHK for small families', 'unit_type': 'apartment', 'status': 'occupied',
             'floor': 3, 'area': 650, 'bedrooms': 1, 'bathrooms': 1, 'furnished': False,
             'monthly_rent': 8000, 'security_deposit': 24000, 'maintenance_charges': 1000},
            
            {'key': 'sn_401', 'property_key': 'saheed_nagar', 'unit_number': '401', 'unit_name': 'Third Floor 1RK',
             'description': 'Compact 1RK ideal for students', 'unit_type': 'apartment', 'status': 'occupied',
             'floor': 4, 'area': 350, 'bedrooms': 1, 'bathrooms': 1, 'furnished': False,
             'monthly_rent': 5500, 'security_deposit': 16500, 'maintenance_charges': 800},
            
            # Jaydev Vihar units
            {'key': 'jv_a101', 'property_key': 'jaydev_vihar', 'unit_number': 'A-101', 'unit_name': 'Block A 2BHK',
             'description': 'Well-ventilated 2BHK near university', 'unit_type': 'apartment', 'status': 'occupied',
             'floor': 1, 'area': 980, 'bedrooms': 2, 'bathrooms': 2, 'furnished': True,
             'monthly_rent': 14000, 'security_deposit': 42000, 'maintenance_charges': 1800},
            
            {'key': 'jv_a201', 'property_key': 'jaydev_vihar', 'unit_number': 'A-201', 'unit_name': 'Block A 3BHK Premium',
             'description': 'Luxurious 3BHK with city view', 'unit_type': 'apartment', 'status': 'occupied',
             'floor': 2, 'area': 1550, 'bedrooms': 3, 'bathrooms': 3, 'furnished': True,
             'monthly_rent': 22000, 'security_deposit': 66000, 'maintenance_charges': 2500},
            
            {'key': 'jv_b101', 'property_key': 'jaydev_vihar', 'unit_number': 'B-101', 'unit_name': 'Block B 1BHK',
             'description': 'Affordable 1BHK with good light', 'unit_type': 'apartment', 'status': 'occupied',
             'floor': 1, 'area': 720, 'bedrooms': 1, 'bathrooms': 1, 'furnished': False,
             'monthly_rent': 9500, 'security_deposit': 28500, 'maintenance_charges': 1200},
            
            {'key': 'jv_b301', 'property_key': 'jaydev_vihar', 'unit_number': 'B-301', 'unit_name': 'Block B 1RK',
             'description': 'Budget-friendly 1RK for students', 'unit_type': 'apartment', 'status': 'available',
             'floor': 3, 'area': 380, 'bedrooms': 1, 'bathrooms': 1, 'furnished': False,
             'monthly_rent': 6000, 'security_deposit': 18000, 'maintenance_charges': 900},
            
            # Patia Green units
            {'key': 'pt_g101', 'property_key': 'patia_green', 'unit_number': 'G-101', 'unit_name': 'Green Wing 2BHK',
             'description': 'Modern 2BHK near IT parks', 'unit_type': 'apartment', 'status': 'occupied',
             'floor': 1, 'area': 1100, 'bedrooms': 2, 'bathrooms': 2, 'furnished': True,
             'monthly_rent': 15000, 'security_deposit': 45000, 'maintenance_charges': 1800},
            
            {'key': 'pt_g301', 'property_key': 'patia_green', 'unit_number': 'G-301', 'unit_name': 'Green Wing 3BHK Deluxe',
             'description': 'Spacious 3BHK with premium fittings', 'unit_type': 'apartment', 'status': 'occupied',
             'floor': 3, 'area': 1600, 'bedrooms': 3, 'bathrooms': 3, 'furnished': True,
             'monthly_rent': 25000, 'security_deposit': 75000, 'maintenance_charges': 3000},
            
            {'key': 'pt_e201', 'property_key': 'patia_green', 'unit_number': 'E-201', 'unit_name': 'East Wing 1BHK',
             'description': 'Comfortable 1BHK with ventilation', 'unit_type': 'apartment', 'status': 'occupied',
             'floor': 2, 'area': 750, 'bedrooms': 1, 'bathrooms': 1, 'furnished': True,
             'monthly_rent': 10000, 'security_deposit': 30000, 'maintenance_charges': 1300},
            
            {'key': 'pt_e501', 'property_key': 'patia_green', 'unit_number': 'E-501', 'unit_name': 'East Wing 1RK',
             'description': 'Top floor 1RK with view', 'unit_type': 'apartment', 'status': 'occupied',
             'floor': 5, 'area': 400, 'bedrooms': 1, 'bathrooms': 1, 'furnished': False,
             'monthly_rent': 7000, 'security_deposit': 21000, 'maintenance_charges': 1000}
        ])
        # Convert numeric columns to proper integers
        units_data = convert_to_proper_types(units_data, ['floor', 'area', 'bedrooms', 'bathrooms', 'monthly_rent', 'security_deposit', 'maintenance_charges'])
        units_data.to_excel(writer, sheet_name='units', index=False)
        
        # 5. Leases - Reference by keys
        leases_data = pd.DataFrame([
            {'unit_key': 'sn_101', 'tenant_key': 'rajesh_kumar', 'start_date': '2024-01-01', 'end_date': '2024-12-31',
             'monthly_rent': 12000, 'security_deposit': 36000, 'status': 'active', 'signed_at': '2023-12-20'},
            {'unit_key': 'sn_201', 'tenant_key': 'sneha_reddy', 'start_date': '2024-03-01', 'end_date': '2025-02-28',
             'monthly_rent': 18000, 'security_deposit': 54000, 'status': 'active', 'signed_at': '2024-02-15'},
            {'unit_key': 'sn_301', 'tenant_key': 'priya_sharma', 'start_date': '2024-02-01', 'end_date': '2025-01-31',
             'monthly_rent': 8000, 'security_deposit': 24000, 'status': 'active', 'signed_at': '2024-01-15'},
            {'unit_key': 'sn_401', 'tenant_key': 'rahul_nayak', 'start_date': '2024-07-01', 'end_date': '2025-06-30',
             'monthly_rent': 5500, 'security_deposit': 16500, 'status': 'active', 'signed_at': '2024-06-15'},
            {'unit_key': 'jv_a101', 'tenant_key': 'amit_patel', 'start_date': '2024-01-15', 'end_date': '2025-01-14',
             'monthly_rent': 14000, 'security_deposit': 42000, 'status': 'active', 'signed_at': '2024-01-05'},
            {'unit_key': 'jv_a201', 'tenant_key': 'deepak_mishra', 'start_date': '2024-04-01', 'end_date': '2025-03-31',
             'monthly_rent': 22000, 'security_deposit': 66000, 'status': 'active', 'signed_at': '2024-03-20'},
            {'unit_key': 'jv_b101', 'tenant_key': 'anita_das', 'start_date': '2024-06-01', 'end_date': '2025-05-31',
             'monthly_rent': 9500, 'security_deposit': 28500, 'status': 'active', 'signed_at': '2024-05-20'},
            {'unit_key': 'pt_g101', 'tenant_key': 'suresh_behera', 'start_date': '2024-02-15', 'end_date': '2025-02-14',
             'monthly_rent': 15000, 'security_deposit': 45000, 'status': 'active', 'signed_at': '2024-02-01'},
            {'unit_key': 'pt_g301', 'tenant_key': 'santosh_jena', 'start_date': '2024-05-01', 'end_date': '2025-04-30',
             'monthly_rent': 25000, 'security_deposit': 75000, 'status': 'active', 'signed_at': '2024-04-15'},
            {'unit_key': 'pt_e201', 'tenant_key': 'meera_sahoo', 'start_date': '2024-03-15', 'end_date': '2025-03-14',
             'monthly_rent': 10000, 'security_deposit': 30000, 'status': 'active', 'signed_at': '2024-03-01'},
            {'unit_key': 'pt_e501', 'tenant_key': 'pooja_swain', 'start_date': '2024-08-01', 'end_date': '2025-07-31',
             'monthly_rent': 7000, 'security_deposit': 21000, 'status': 'active', 'signed_at': '2024-07-20'},
            # Historical lease
            {'unit_key': 'sn_101', 'tenant_key': 'lakshmi_panda', 'start_date': '2023-01-01', 'end_date': '2023-12-31',
             'monthly_rent': 11000, 'security_deposit': 33000, 'status': 'completed', 'signed_at': '2022-12-15'}
        ])
        # Convert numeric columns to proper integers
        leases_data = convert_to_proper_types(leases_data, ['monthly_rent', 'security_deposit'])
        leases_data.to_excel(writer, sheet_name='leases', index=False)
        
        # 6. Rent Payments - Reference leases by unit_key + tenant_key combination
        # Format: unit_key|tenant_key to uniquely identify lease
        rent_payments_data = pd.DataFrame([
            # Payment structure: lease_ref, month, amount, due_date, paid_date, status, method, notes
            # Rajesh Kumar payments
            {'lease_ref': 'sn_101|rajesh_kumar', 'month': '2024-02', 'amount': 12000, 'due_date': '2024-02-01',
             'paid_date': '2024-01-31', 'status': 'paid', 'payment_method': 'online', 'notes': 'February rent'},
            {'lease_ref': 'sn_101|rajesh_kumar', 'month': '2024-03', 'amount': 12000, 'due_date': '2024-03-01',
             'paid_date': '2024-02-28', 'status': 'paid', 'payment_method': 'online', 'notes': 'March rent'},
            {'lease_ref': 'sn_101|rajesh_kumar', 'month': '2024-04', 'amount': 12000, 'due_date': '2024-04-01',
             'paid_date': '2024-03-30', 'status': 'paid', 'payment_method': 'upi', 'notes': 'April rent'},
            {'lease_ref': 'sn_101|rajesh_kumar', 'month': '2024-05', 'amount': 12000, 'due_date': '2024-05-01',
             'paid_date': '2024-04-29', 'status': 'paid', 'payment_method': 'online', 'notes': 'May rent'},
            {'lease_ref': 'sn_101|rajesh_kumar', 'month': '2024-06', 'amount': 12000, 'due_date': '2024-06-01',
             'paid_date': '2024-05-31', 'status': 'paid', 'payment_method': 'online', 'notes': 'June rent'},
            
            # Sneha Reddy payments
            {'lease_ref': 'sn_201|sneha_reddy', 'month': '2024-04', 'amount': 18000, 'due_date': '2024-04-01',
             'paid_date': '2024-03-31', 'status': 'paid', 'payment_method': 'check', 'notes': 'April rent'},
            {'lease_ref': 'sn_201|sneha_reddy', 'month': '2024-05', 'amount': 18000, 'due_date': '2024-05-01',
             'paid_date': '2024-04-30', 'status': 'paid', 'payment_method': 'online', 'notes': 'May rent'},
            {'lease_ref': 'sn_201|sneha_reddy', 'month': '2024-06', 'amount': 18000, 'due_date': '2024-06-01',
             'paid_date': '2024-05-29', 'status': 'paid', 'payment_method': 'online', 'notes': 'June rent'},
            {'lease_ref': 'sn_201|sneha_reddy', 'month': '2024-07', 'amount': 18000, 'due_date': '2024-07-01',
             'paid_date': '2024-06-30', 'status': 'paid', 'payment_method': 'online', 'notes': 'July rent'},
            
            # More payment records for other tenants...
            {'lease_ref': 'sn_301|priya_sharma', 'month': '2024-03', 'amount': 8000, 'due_date': '2024-03-01',
             'paid_date': '2024-03-01', 'status': 'paid', 'payment_method': 'cash', 'notes': 'March rent'},
            {'lease_ref': 'sn_301|priya_sharma', 'month': '2024-04', 'amount': 8000, 'due_date': '2024-04-01',
             'paid_date': '2024-04-02', 'status': 'paid', 'payment_method': 'upi', 'notes': 'April rent'},
            {'lease_ref': 'sn_301|priya_sharma', 'month': '2024-05', 'amount': 8000, 'due_date': '2024-05-01',
             'paid_date': '2024-05-01', 'status': 'paid', 'payment_method': 'upi', 'notes': 'May rent'},
            {'lease_ref': 'sn_301|priya_sharma', 'month': '2024-06', 'amount': 8000, 'due_date': '2024-06-01',
             'paid_date': None, 'status': 'pending', 'payment_method': None, 'notes': 'June rent - Pending'},
            
            {'lease_ref': 'sn_401|rahul_nayak', 'month': '2024-08', 'amount': 5500, 'due_date': '2024-08-01',
             'paid_date': '2024-07-31', 'status': 'paid', 'payment_method': 'online', 'notes': 'August - First payment'},
            {'lease_ref': 'sn_401|rahul_nayak', 'month': '2024-09', 'amount': 5500, 'due_date': '2024-09-01',
             'paid_date': '2024-08-30', 'status': 'paid', 'payment_method': 'upi', 'notes': 'September rent'},
            
            # Amit Patel
            {'lease_ref': 'jv_a101|amit_patel', 'month': '2024-02', 'amount': 14000, 'due_date': '2024-02-15',
             'paid_date': '2024-02-14', 'status': 'paid', 'payment_method': 'online', 'notes': 'February rent'},
            {'lease_ref': 'jv_a101|amit_patel', 'month': '2024-03', 'amount': 14000, 'due_date': '2024-03-15',
             'paid_date': '2024-03-13', 'status': 'paid', 'payment_method': 'online', 'notes': 'March rent'},
            {'lease_ref': 'jv_a101|amit_patel', 'month': '2024-04', 'amount': 14000, 'due_date': '2024-04-15',
             'paid_date': '2024-04-14', 'status': 'paid', 'payment_method': 'upi', 'notes': 'April rent'},
            {'lease_ref': 'jv_a101|amit_patel', 'month': '2024-05', 'amount': 14000, 'due_date': '2024-05-15',
             'paid_date': '2024-05-14', 'status': 'paid', 'payment_method': 'online', 'notes': 'May rent'},
            
            # Continue with more payments for comprehensive data (30+ more rows)...
            {'lease_ref': 'jv_a201|deepak_mishra', 'month': '2024-05', 'amount': 22000, 'due_date': '2024-05-01',
             'paid_date': '2024-04-30', 'status': 'paid', 'payment_method': 'online', 'notes': 'May - First month'},
            {'lease_ref': 'jv_a201|deepak_mishra', 'month': '2024-06', 'amount': 22000, 'due_date': '2024-06-01',
             'paid_date': '2024-05-31', 'status': 'paid', 'payment_method': 'check', 'notes': 'June rent'},
            
            {'lease_ref': 'jv_b101|anita_das', 'month': '2024-07', 'amount': 9500, 'due_date': '2024-07-01',
             'paid_date': '2024-06-29', 'status': 'paid', 'payment_method': 'upi', 'notes': 'July rent'},
            {'lease_ref': 'jv_b101|anita_das', 'month': '2024-08', 'amount': 9500, 'due_date': '2024-08-01',
             'paid_date': '2024-07-31', 'status': 'paid', 'payment_method': 'online', 'notes': 'August rent'},
            {'lease_ref': 'jv_b101|anita_das', 'month': '2024-09', 'amount': 9500, 'due_date': '2024-09-01',
             'paid_date': None, 'status': 'overdue', 'payment_method': None, 'notes': 'September - Overdue'},
            
            {'lease_ref': 'pt_g101|suresh_behera', 'month': '2024-03', 'amount': 15000, 'due_date': '2024-03-15',
             'paid_date': '2024-03-14', 'status': 'paid', 'payment_method': 'online', 'notes': 'March rent'},
            {'lease_ref': 'pt_g101|suresh_behera', 'month': '2024-04', 'amount': 15000, 'due_date': '2024-04-15',
             'paid_date': '2024-04-14', 'status': 'paid', 'payment_method': 'online', 'notes': 'April rent'},
            {'lease_ref': 'pt_g101|suresh_behera', 'month': '2024-05', 'amount': 15000, 'due_date': '2024-05-15',
             'paid_date': '2024-05-13', 'status': 'paid', 'payment_method': 'check', 'notes': 'May rent'},
            
            {'lease_ref': 'pt_g301|santosh_jena', 'month': '2024-06', 'amount': 25000, 'due_date': '2024-06-01',
             'paid_date': '2024-05-30', 'status': 'paid', 'payment_method': 'online', 'notes': 'June - First month'},
            {'lease_ref': 'pt_g301|santosh_jena', 'month': '2024-07', 'amount': 25000, 'due_date': '2024-07-01',
             'paid_date': '2024-06-29', 'status': 'paid', 'payment_method': 'online', 'notes': 'July rent'},
            {'lease_ref': 'pt_g301|santosh_jena', 'month': '2024-08', 'amount': 25000, 'due_date': '2024-08-01',
             'paid_date': '2024-07-31', 'status': 'paid', 'payment_method': 'check', 'notes': 'August rent'},
            
            {'lease_ref': 'pt_e201|meera_sahoo', 'month': '2024-04', 'amount': 10000, 'due_date': '2024-04-15',
             'paid_date': '2024-04-14', 'status': 'paid', 'payment_method': 'upi', 'notes': 'April rent'},
            {'lease_ref': 'pt_e201|meera_sahoo', 'month': '2024-05', 'amount': 10000, 'due_date': '2024-05-15',
             'paid_date': '2024-05-15', 'status': 'paid', 'payment_method': 'online', 'notes': 'May rent'},
            {'lease_ref': 'pt_e201|meera_sahoo', 'month': '2024-06', 'amount': 10000, 'due_date': '2024-06-15',
             'paid_date': '2024-06-14', 'status': 'paid', 'payment_method': 'upi', 'notes': 'June rent'},
            {'lease_ref': 'pt_e201|meera_sahoo', 'month': '2024-07', 'amount': 10000, 'due_date': '2024-07-15',
             'paid_date': '2024-07-13', 'status': 'paid', 'payment_method': 'online', 'notes': 'July rent'},
            
            {'lease_ref': 'pt_e501|pooja_swain', 'month': '2024-09', 'amount': 7000, 'due_date': '2024-09-01',
             'paid_date': '2024-08-30', 'status': 'paid', 'payment_method': 'upi', 'notes': 'September - First'},
            {'lease_ref': 'pt_e501|pooja_swain', 'month': '2024-10', 'amount': 7000, 'due_date': '2024-10-01',
             'paid_date': None, 'status': 'pending', 'payment_method': None, 'notes': 'October - Pending'},
            
            # Historical payments
            {'lease_ref': 'sn_101|lakshmi_panda', 'month': '2023-11', 'amount': 11000, 'due_date': '2023-11-01',
             'paid_date': '2023-10-30', 'status': 'paid', 'payment_method': 'online', 'notes': 'November 2023'},
            {'lease_ref': 'sn_101|lakshmi_panda', 'month': '2023-12', 'amount': 11000, 'due_date': '2023-12-01',
             'paid_date': '2023-11-29', 'status': 'paid', 'payment_method': 'check', 'notes': 'December 2023 - Final'}
        ])
        # Convert numeric columns to proper integers
        rent_payments_data = convert_to_proper_types(rent_payments_data, ['amount'])
        rent_payments_data.to_excel(writer, sheet_name='rent_payments', index=False)
        
        # 7. Meters - Reference units by key (no property_id needed, will be derived)
        meters_data = pd.DataFrame([
            {'unit_key': 'sn_101', 'meter_type': 'electricity', 'meter_number': 'BBSR-SN-101-E', 'installation_date': '2024-01-01', 'status': 'active'},
            {'unit_key': 'sn_201', 'meter_type': 'electricity', 'meter_number': 'BBSR-SN-201-E', 'installation_date': '2024-03-01', 'status': 'active'},
            {'unit_key': 'sn_301', 'meter_type': 'electricity', 'meter_number': 'BBSR-SN-301-E', 'installation_date': '2024-02-01', 'status': 'active'},
            {'unit_key': 'sn_401', 'meter_type': 'electricity', 'meter_number': 'BBSR-SN-401-E', 'installation_date': '2024-07-01', 'status': 'active'},
            {'unit_key': 'jv_a101', 'meter_type': 'electricity', 'meter_number': 'BBSR-JV-A101-E', 'installation_date': '2024-01-15', 'status': 'active'},
            {'unit_key': 'jv_a201', 'meter_type': 'electricity', 'meter_number': 'BBSR-JV-A201-E', 'installation_date': '2024-04-01', 'status': 'active'},
            {'unit_key': 'jv_b101', 'meter_type': 'electricity', 'meter_number': 'BBSR-JV-B101-E', 'installation_date': '2024-06-01', 'status': 'active'},
            {'unit_key': 'jv_b301', 'meter_type': 'electricity', 'meter_number': 'BBSR-JV-B301-E', 'installation_date': '2024-01-10', 'status': 'inactive'},
            {'unit_key': 'pt_g101', 'meter_type': 'electricity', 'meter_number': 'BBSR-PT-G101-E', 'installation_date': '2024-02-15', 'status': 'active'},
            {'unit_key': 'pt_g301', 'meter_type': 'electricity', 'meter_number': 'BBSR-PT-G301-E', 'installation_date': '2024-05-01', 'status': 'active'},
            {'unit_key': 'pt_e201', 'meter_type': 'electricity', 'meter_number': 'BBSR-PT-E201-E', 'installation_date': '2024-03-15', 'status': 'active'},
            {'unit_key': 'pt_e501', 'meter_type': 'electricity', 'meter_number': 'BBSR-PT-E501-E', 'installation_date': '2024-08-01', 'status': 'active'}
        ])
        meters_data.to_excel(writer, sheet_name='meters', index=False)
        
        # 8. Meter Readings - Reference meters by meter_number
        # Format: meter_number, reading_date, reading_value, reading_type, notes
        readings = []
        
        # Simplified readings - meter_number, date, value
        readings_data = [
            ('BBSR-SN-101-E', '2024-02-01', 320), ('BBSR-SN-101-E', '2024-03-01', 655),
            ('BBSR-SN-101-E', '2024-04-01', 985), ('BBSR-SN-101-E', '2024-05-01', 1320),
            ('BBSR-SN-101-E', '2024-06-01', 1650),
            
            ('BBSR-SN-201-E', '2024-04-01', 450), ('BBSR-SN-201-E', '2024-05-01', 920),
            ('BBSR-SN-201-E', '2024-06-01', 1380), ('BBSR-SN-201-E', '2024-07-01', 1850),
            
            ('BBSR-SN-301-E', '2024-03-01', 180), ('BBSR-SN-301-E', '2024-04-01', 368),
            ('BBSR-SN-301-E', '2024-05-01', 550), ('BBSR-SN-301-E', '2024-06-01', 735),
            
            ('BBSR-SN-401-E', '2024-08-01', 120), ('BBSR-SN-401-E', '2024-09-01', 245),
            
            ('BBSR-JV-A101-E', '2024-02-15', 350), ('BBSR-JV-A101-E', '2024-03-15', 715),
            ('BBSR-JV-A101-E', '2024-04-15', 1070), ('BBSR-JV-A101-E', '2024-05-15', 1430),
            ('BBSR-JV-A101-E', '2024-06-15', 1795),
            
            ('BBSR-JV-A201-E', '2024-05-01', 500), ('BBSR-JV-A201-E', '2024-06-01', 1030),
            ('BBSR-JV-A201-E', '2024-07-01', 1570),
            
            ('BBSR-JV-B101-E', '2024-07-01', 200), ('BBSR-JV-B101-E', '2024-08-01', 415),
            ('BBSR-JV-B101-E', '2024-09-01', 630),
            
            ('BBSR-PT-G101-E', '2024-03-15', 380), ('BBSR-PT-G101-E', '2024-04-15', 775),
            ('BBSR-PT-G101-E', '2024-05-15', 1165), ('BBSR-PT-G101-E', '2024-06-15', 1560),
            
            ('BBSR-PT-G301-E', '2024-06-01', 550), ('BBSR-PT-G301-E', '2024-07-01', 1125),
            ('BBSR-PT-G301-E', '2024-08-01', 1705),
            
            ('BBSR-PT-E201-E', '2024-04-15', 220), ('BBSR-PT-E201-E', '2024-05-15', 455),
            ('BBSR-PT-E201-E', '2024-06-15', 685), ('BBSR-PT-E201-E', '2024-07-15', 920),
            ('BBSR-PT-E201-E', '2024-08-15', 1150),
            
            ('BBSR-PT-E501-E', '2024-09-01', 140)
        ]
        
        meter_readings_data = pd.DataFrame([
            {'meter_number': num, 'reading_date': date, 'reading_value': value, 
             'reading_type': 'actual', 'notes': f'Reading for {date[:7]}'}
            for num, date, value in readings_data
        ])
        # Convert numeric columns to proper integers
        meter_readings_data = convert_to_proper_types(meter_readings_data, ['reading_value'])
        meter_readings_data.to_excel(writer, sheet_name='meter_readings', index=False)
    
    print(f"✅ Created smart seed data Excel file: {output_file}")
    print(f"")
    print(f"📊 Sheets created (no UUIDs - cleaner data!):")
    print(f"   - users (4 users with simple keys)")
    print(f"   - tenants (15 tenants with keys)")
    print(f"   - properties (3 properties with owner_key refs)")
    print(f"   - units (12 units with property_key refs)")
    print(f"   - leases (12 leases with unit/tenant_key refs)")
    print(f"   - rent_payments (40 payments with lease_ref)")
    print(f"   - meters (12 meters with unit_key refs)")
    print(f"   - meter_readings (41 readings with meter_number)")
    print(f"")
    print(f"🎯 Key Features:")
    print(f"   ✓ No UUIDs in Excel - easier to edit!")
    print(f"   ✓ Simple key-based references (e.g., 'ramesh_patel', 'sn_101')")
    print(f"   ✓ Foreign keys resolved automatically by script")
    print(f"   ✓ Add new rows easily - script generates UUIDs")
    print(f"")
    print(f"📝 Next: Run 'python3 scripts/smart_flexible_seed.py' to seed database")

if __name__ == '__main__':
    create_smart_seed_excel()
