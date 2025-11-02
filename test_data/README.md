# Test Data Instructions

This folder contains the Excel file used for database seeding. The `test_data.xlsx` file provides sample data for testing the Asset Management Platform.

## Excel File Structure

The Excel file contains multiple sheets, each representing a database table:

### users Sheet
Contains user accounts for testing. Columns:
- `username` - Unique username
- `email` - Unique email address
- `password` - Plain text password (will be hashed automatically)
- `phone` - Phone number (optional)
- `role` - User role: 'admin', 'user', etc.
- `is_email_verified` - 'true'/'false'
- `is_phone_verified` - 'true'/'false'

### properties Sheet
Contains property listings. Columns:
- `name` - Property name
- `description` - Property description
- `property_type` - 'apartment', 'house', etc.
- `status` - 'available', 'rented', etc.
- `address_street` - Street address
- `address_city` - City
- `address_state` - State
- `address_pincode` - Postal code
- `area` - Area in sq ft
- `bedrooms` - Number of bedrooms
- `bathrooms` - Number of bathrooms
- `monthly_rent` - Monthly rent amount
- `security_deposit` - Security deposit
- `owner_username` - References users.username
- `amenities` - JSON array like: ["wifi", "parking"]
- `photos` - JSON array like: ["photo1.jpg", "photo2.jpg"]

### tenants Sheet
Contains tenant information. Columns:
- `first_name` - First name
- `last_name` - Last name
- `email` - Unique email
- `phone` - Phone number
- `alternate_phone` - Alternate phone (optional)
- `date_of_birth` - YYYY-MM-DD format
- `gender` - Gender
- `occupation` - Job title
- `monthly_income` - Monthly income
- `current_address_*` - Current address fields
- `emergency_contact_*` - Emergency contact details
- `status` - 'active', 'inactive', etc.
- `current_property_name` - References properties.name (optional)

### leases Sheet
Contains lease agreements. Columns:
- `property_name` - References properties.name
- `tenant_email` - References tenants.email
- `start_date` - YYYY-MM-DD format
- `end_date` - YYYY-MM-DD format
- `monthly_rent` - Monthly rent amount
- `security_deposit` - Security deposit
- `status` - 'active', 'expired', etc.

### rent_payments Sheet
Contains payment records. Columns:
- `property_name` - References properties.name
- `tenant_email` - References tenants.email
- `amount` - Payment amount
- `due_date` - YYYY-MM-DD format
- `paid_date` - YYYY-MM-DD format (optional)
- `status` - 'paid', 'pending', 'overdue'
- `payment_method` - 'check', 'cash', 'online'
- `notes` - Payment notes (optional)
- `created_by_username` - References users.username

## Data Rules

### Required Fields
- All ID fields and foreign keys must reference existing records
- Dates must be in YYYY-MM-DD format
- JSON arrays should be valid JSON format

### Optional Fields
- Fields marked as (optional) can be left blank
- Empty cells will be treated as NULL in the database

### Data Types
- Numbers: Use plain numbers (no currency symbols)
- Booleans: Use 'true'/'false' or '1'/'0'
- JSON: Use valid JSON array syntax

## Usage

1. **Edit the Excel file** with your test data
2. **Save the file** (keep the same name: `test_data.xlsx`)
3. **Run the seeding script**:
   ```bash
   python3 scripts/simple_db_seed.py
   ```

## Sample Data

The current file contains sample data for:
- 4 users (including admin)
- 3 properties
- 3 tenants
- Empty leases and payments sheets (ready for your data)

## Adding New Data

1. Open `test_data.xlsx` in Excel or Google Sheets
2. Add rows to the appropriate sheets
3. Ensure foreign key references are valid
4. Save and run the seeding script

## Notes

- Passwords are automatically hashed during seeding
- UUID primary keys are generated automatically
- Foreign key relationships are resolved automatically
- The script will show test credentials after seeding</content>
<parameter name="filePath">/Users/avinashmahala/Desktop/githubRepos/AssetManagementPlatform/test_data/README.md