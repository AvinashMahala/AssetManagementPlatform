#!/usr/bin/env python3
"""
Create simplified Excel file with seed data - No UUIDs needed!
The flexible_seed.py script will generate UUIDs dynamically and handle foreign keys
Data is loaded from db-postgres/seeds/data/seed_data_templates.json for easier maintenance
"""
import pandas as pd
import json
import os

def convert_to_proper_types(df, int_columns=None):
    """Convert DataFrame columns to proper types (integers stay as integers)"""
    if int_columns:
        for col in int_columns:
            if col in df.columns:
                # Convert to integer, keeping None for null values
                df[col] = df[col].apply(lambda x: int(x) if pd.notna(x) and x is not None else None)
    return df

def load_json_templates():
    """Load seed data templates from JSON file"""
    template_file = 'db-postgres/seeds/data/seed_data_templates.json'
    try:
        with open(template_file, 'r') as f:
            return json.load(f)
    except FileNotFoundError:
        print(f"❌ Template file not found: {template_file}")
        print(f"   Please ensure seed_data_templates.json exists in db-postgres/seeds/data/ directory")
        return None
    except json.JSONDecodeError as e:
        print(f"❌ Error parsing JSON template file: {e}")
        return None

def get_int_columns_for_sheet(sheet_name):
    """Define which columns should be integers for each sheet"""
    int_columns_map = {
        'users': [],
        'tenants': ['monthly_income', 'total_rentals'],
        'properties': ['area', 'total_floors', 'parking_spaces'],
        'units': ['floor', 'area', 'bedrooms', 'bathrooms', 'balconies', 'max_occupants', 
                  'monthly_rent', 'security_deposit', 'maintenance_charges'],
        'leases': ['monthly_rent', 'security_deposit'],
        'rent_payments': ['amount'],
        'meters': [],
        'meter_readings': ['previous_reading', 'current_reading'],
        'rent_transactions': ['days_count', 'base_rent', 'maintenance_charges', 'previous_balance',
                             'total_meter_charges', 'total_expenses', 'total_amount', 'amount_paid', 'new_balance'],
        'rent_transaction_meter_readings': ['previous_reading', 'current_reading', 'units_consumed',
                                            'fixed_charge', 'total_cost'],
        'receipts': ['amount', 'file_size'],
        'tenant_documents': ['file_size']
    }
    return int_columns_map.get(sheet_name, [])

def create_smart_seed_excel():
    """Create Excel file with simplified seed data (no UUIDs) - loads data from JSON templates"""
    output_file = 'scripts/seed_data/seed_data.xlsx'
    
    # Create seed_data directory if it doesn't exist
    os.makedirs('scripts/seed_data', exist_ok=True)
    
    # Load JSON templates
    print("📁 Loading data templates from JSON...")
    templates = load_json_templates()
    if not templates:
        print("❌ Failed to load templates. Exiting.")
        return
    
    print(f"✅ Loaded {len(templates)} sheet templates")
    print("")
    
    # Define the order of sheets to maintain consistency
    sheet_order = [
        'users', 'tenants', 'properties', 'units', 'leases', 'rent_payments',
        'meters', 'meter_readings', 'rent_transactions', 'rent_transaction_meter_readings',
        'receipts', 'tenant_documents'
    ]
    
    # Create Excel writer with options to preserve data types
    with pd.ExcelWriter(output_file, engine='openpyxl') as writer:
        for sheet_name in sheet_order:
            if sheet_name not in templates:
                print(f"⚠️  Warning: Sheet '{sheet_name}' not found in templates, skipping...")
                continue
            
            # Convert JSON data to DataFrame
            sheet_data = pd.DataFrame(templates[sheet_name])
            
            # Convert numeric columns to proper integers
            int_columns = get_int_columns_for_sheet(sheet_name)
            if int_columns:
                sheet_data = convert_to_proper_types(sheet_data, int_columns)
            
            # Write to Excel
            sheet_data.to_excel(writer, sheet_name=sheet_name, index=False)
            print(f"   ✓ {sheet_name} sheet created ({len(sheet_data)} records)")
    
    print(f"")
    print(f"✅ Created smart seed data Excel file: {output_file}")
    print(f"")
    print(f"📊 Summary:")
    total_records = sum(len(templates[sheet]) for sheet in sheet_order if sheet in templates)
    print(f"   Total sheets: {len([s for s in sheet_order if s in templates])}")
    print(f"   Total records: {total_records}")
    print(f"")
    print(f"🎯 Key Features:")
    print(f"   ✓ All data loaded from seed_data_templates.json")
    print(f"   ✓ No UUIDs in Excel - easier to edit!")
    print(f"   ✓ Simple key-based references (e.g., 'ramesh_patel', 'sn_101')")
    print(f"   ✓ Foreign keys resolved automatically by seed_to_db.py")
    print(f"   ✓ Edit JSON file to modify seed data")
    print(f"")
    print(f"📝 Next: Run 'python3 db-postgres/seeds/python/seed_to_db.py' or 'npm run seed:db' to seed database")

if __name__ == '__main__':
    create_smart_seed_excel()
