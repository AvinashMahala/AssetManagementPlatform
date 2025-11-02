# Test Data Instructions

This folder contains the Excel file used for database seeding. The `test_data.xlsx` file provides sample data for testing the Asset Management Platform with the new **Property → Units → Tenants** architecture.

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

### properties Sheet (Buildings)
Contains building/property information. **Note:** Properties are containers for units and don't have individual pricing. Columns:
- `name` - Property/building name
- `description` - Building description
- `property_type` - 'apartment', 'villa', 'office', etc.
- `status` - 'active', 'inactive', etc.
- `address_*` - Complete address fields
- `total_area` - Total building area in sq ft
- `total_floors` - Number of floors in building
- `year_built` - Construction year
- `parking_spaces` - Total parking spaces
- `owner_username` - References users.username
- `building_amenities` - JSON array of shared amenities
- `building_photos` - JSON array of building exterior photos

### units Sheet (Rentable Units)
Contains individual rentable units within properties. **This is where pricing lives.** Columns:
- `property_name` - References properties.name
- `unit_number` - Unit identifier (e.g., "101", "Villa-A")
- `unit_name` - Full unit name (auto-generated as "Property - Unit X")
- `description` - Unit description
- `unit_type` - 'apartment', 'villa', 'room', 'office', etc.
- `status` - 'available', 'occupied', 'maintenance'
- `floor` - Floor number (0 for ground floor)
- `area` - Unit area in sq ft
- `bedrooms` - Number of bedrooms
- `bathrooms` - Number of bathrooms
- `balconies` - Number of balconies
- `furnished` - 'true'/'false'
- `monthly_rent` - Monthly rent amount
- `security_deposit` - Security deposit
- `maintenance_charges` - Monthly maintenance
- `unit_amenities` - JSON array of unit-specific amenities
- `unit_photos` - JSON array of unit interior photos
- `max_occupants` - Maximum number of occupants (for shared housing)

### tenants Sheet
Contains tenant profiles. **Note:** Tenants are linked to units via unit_tenants table. Columns:
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
- `permanent_address_*` - Permanent address fields
- `emergency_contact_*` - Emergency contact details
- `status` - 'active', 'inactive', etc.

### unit_tenants Sheet (Tenant-Unit Assignments)
Links tenants to specific units. Supports shared housing (multiple tenants per unit). Columns:
- `property_name` - References properties.name
- `unit_number` - References units.unit_number
- `tenant_email` - References tenants.email
- `is_primary_tenant` - 'true'/'false' (main lease holder)
- `move_in_date` - YYYY-MM-DD format
- `move_out_date` - YYYY-MM-DD format (optional)
- `monthly_rent_share` - Tenant's share of rent
- `security_deposit_share` - Tenant's share of deposit
- `status` - 'active', 'moved_out', etc.

### leases Sheet (Property-Unit-Tenant Agreements)
Contains lease agreements linking properties, units, and primary tenants. Columns:
- `property_name` - References properties.name
- `unit_number` - References units.unit_number
- `primary_tenant_email` - References tenants.email (main lease holder)
- `start_date` - YYYY-MM-DD format
- `end_date` - YYYY-MM-DD format
- `monthly_rent` - Total monthly rent
- `security_deposit` - Total security deposit
- `status` - 'active', 'expired', 'terminated'
- `lease_terms` - Additional terms and conditions
- `signed_at` - YYYY-MM-DD format
- `created_by_username` - References users.username

### rent_payments Sheet
Contains payment records. Can track payments by specific tenants in shared housing. Columns:
- `property_name` - References properties.name
- `unit_number` - References units.unit_number
- `primary_tenant_email` - References leases.primary_tenant_email
- `tenant_email` - References tenants.email (who made the payment)
- `amount` - Payment amount
- `due_date` - YYYY-MM-DD format
- `paid_date` - YYYY-MM-DD format (optional)
- `status` - 'paid', 'pending', 'overdue', 'partial'
- `payment_method` - 'online', 'check', 'cash', etc.
- `notes` - Payment notes (optional)
- `created_by_username` - References users.username

## Data Relationships

### Property → Units
- One property can have multiple units
- Units inherit building address but have individual attributes
- Properties don't have pricing (units do)

### Units → Tenants (via unit_tenants)
- One unit can have multiple tenants (shared housing)
- Each tenant-unit relationship has move-in/out dates
- Rent/deposit can be shared among tenants

### Leases → Payments
- Leases link property + unit + primary tenant
- Payments can be made by any tenant assigned to the unit
- Supports tracking individual tenant payments in shared housing

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
- 3 properties (buildings)
- 6 units across the properties
- 3 tenants
- 2 unit-tenant assignments
- 2 active leases
- 2 payment records

## Adding New Data

1. **Add properties first** (buildings)
2. **Add units** for each property
3. **Add tenants** (profiles only)
4. **Assign tenants to units** via unit_tenants sheet
5. **Create leases** for occupied units
6. **Add payment records** as needed

## Notes

- Unit names are auto-generated as "Property Name - Unit Number"
- Foreign key relationships are resolved automatically during seeding
- Passwords are automatically hashed during seeding
- JSON arrays should use valid JSON syntax
- Dates must be in YYYY-MM-DD format
- The script will show test credentials after seeding</content>
<parameter name="filePath">/Users/avinashmahala/Desktop/githubRepos/AssetManagementPlatform/test_data/README.md