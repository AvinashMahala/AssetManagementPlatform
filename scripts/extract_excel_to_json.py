#!/usr/bin/env python3
"""
Extract data from seed_data.xlsx and convert to JSON format for seed_data_templates.json
"""
import pandas as pd
import json
import os

def extract_excel_to_json():
    """Read Excel file and convert all sheets to JSON"""
    excel_file = 'scripts/seed_data/seed_data.xlsx'
    output_file = 'scripts/seed_data_templates.json'
    
    if not os.path.exists(excel_file):
        print(f"❌ Excel file not found: {excel_file}")
        print(f"   Please run 'python3 scripts/smart_seed_excel.py' first")
        return
    
    print(f"📁 Reading Excel file: {excel_file}")
    
    # Read all sheets from Excel
    excel_data = pd.read_excel(excel_file, sheet_name=None, engine='openpyxl')
    
    # Convert to JSON-serializable format
    json_data = {}
    
    for sheet_name, df in excel_data.items():
        print(f"   Processing sheet: {sheet_name} ({len(df)} records)")
        
        # Convert DataFrame to list of dictionaries
        # Handle NaN values and convert to None
        records = df.replace({pd.NA: None, pd.NaT: None}).to_dict(orient='records')
        
        # Clean up the records
        cleaned_records = []
        for record in records:
            cleaned_record = {}
            for key, value in record.items():
                # Convert numpy/pandas types to Python native types
                if pd.isna(value):
                    cleaned_record[key] = None
                elif isinstance(value, (pd.Timestamp, pd.datetime)):
                    cleaned_record[key] = value.strftime('%Y-%m-%d')
                elif isinstance(value, (bool, pd.BooleanDtype)):
                    cleaned_record[key] = bool(value)
                elif isinstance(value, (int, pd.Int64Dtype)):
                    cleaned_record[key] = int(value)
                elif isinstance(value, (float, pd.Float64Dtype)):
                    # Check if it's actually an integer
                    if value == int(value):
                        cleaned_record[key] = int(value)
                    else:
                        cleaned_record[key] = float(value)
                else:
                    cleaned_record[key] = value
            cleaned_records.append(cleaned_record)
        
        json_data[sheet_name] = cleaned_records
    
    # Write to JSON file with nice formatting
    with open(output_file, 'w') as f:
        json.dump(json_data, f, indent=2, ensure_ascii=False)
    
    print(f"")
    print(f"✅ Successfully created {output_file}")
    print(f"")
    print(f"📊 Sheets extracted:")
    for sheet_name, records in json_data.items():
        print(f"   - {sheet_name}: {len(records)} records")
    print(f"")
    print(f"📝 Next: Run 'python3 scripts/smart_seed_excel.py' to test JSON-based generation")

if __name__ == '__main__':
    extract_excel_to_json()
