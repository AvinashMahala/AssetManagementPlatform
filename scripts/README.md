# Database Management Scripts

This directory contains scripts for managing the Asset Management Platform database.

## Scripts Overview

### 1. `clean_property_data.py`
**Purpose**: Clears all property-related data while preserving core system data.

**What it clears**:
- Properties
- Units
- Meters and meter readings
- Tenants
- Leases
- Rent payments and transactions
- Receipts
- Expenses
- Related junction tables

**What it preserves**:
- Users
- Receipt templates
- Password reset methods
- Security questions
- Phone verification codes
- Recovery codes

**Usage**:
```bash
python3 scripts/clean_property_data.py
```

**Safety**: Asks for confirmation before proceeding. This action cannot be undone.

### 2. `seed_property_data.py`
**Purpose**: Seeds property-related data back to the database after cleanup.

**What it seeds**:
- Tenants
- Properties
- Units
- Leases (and creates unit_tenant relationships)
- Meters
- Expenses

**Data source**: `scripts/seed_data_templates.json`

**Usage**:
```bash
python3 scripts/seed_property_data.py
```

**Dependencies**: Requires foreign key relationships, so seed in correct order.

### 3. `clean_unit_data.py`
**Purpose**: Clears all unit-related data while preserving core system data.

**What it clears**:
- Units
- Unit-tenant relationships
- Leases associated with units
- Rent payments for those leases
- Meter readings for units

**What it preserves**:
- Users
- Properties
- Tenants
- Receipt templates
- Other system data

**Usage**:
```bash
python3 scripts/clean_unit_data.py
```

**Safety**: Asks for confirmation before proceeding. This action cannot be undone.

### 5. `clean_meter_data.py`
**Purpose**: Clears all meter-related data while preserving core system data.

**What it clears**:
- Meters
- Meter readings

**What it preserves**:
- Users
- Properties
- Units
- Tenants
- Other system data

**Usage**:
```bash
python3 scripts/clean_meter_data.py
```

**Safety**: Asks for confirmation before proceeding. This action cannot be undone.

### 6. `seed_meter_data.py`
**Purpose**: Seeds meter-related data back to the database after cleanup.

**What it seeds**:
- Meters for existing units (electricity, water, gas)
- Historical meter readings for the past 6-12 months
- Realistic pricing configurations

**Usage**:
```bash
python3 scripts/seed_meter_data.py
```

**Dependencies**: Requires existing properties and units in the database.

## Workflow

### To reset property data:
1. **Backup** your current data if needed
2. Run cleanup: `python3 scripts/clean_property_data.py`
3. Run seeding: `python3 scripts/seed_property_data.py`

### To reset unit data:
1. **Backup** your current data if needed
2. Run cleanup: `python3 scripts/clean_unit_data.py`
3. Run seeding: `python3 scripts/seed_unit_data.py`

### To reset meter data:
1. **Backup** your current data if needed
2. Run cleanup: `python3 scripts/clean_meter_data.py`
3. Run seeding: `python3 scripts/seed_meter_data.py`

### Prerequisites
- Python 3.x
- Required packages: `psycopg2`, `python-dotenv`
- Database connection configured via environment variables or `.env` file
- `seed_data_templates.json` file present

## Environment Variables

The scripts read database configuration from:
- `MAIN_DATABASE_URL` (preferred)
- Or individual variables: `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`

## Safety Features

- **Confirmation prompts**: Both scripts ask for user confirmation
- **Data verification**: Cleanup script verifies what was cleared and preserved
- **Error handling**: Comprehensive error handling with colored output
- **Transaction safety**: Uses proper database transactions

## Output

Both scripts provide:
- Colored terminal output for better readability
- Progress indicators
- Summary of operations performed
- Error reporting with specific details

## Related Scripts

- `seed_to_db.py`: Full database seeding from Excel (more comprehensive)
- `smart_seed_excel.py`: Generate Excel from JSON templates
- `verify_database.py`: Database verification and testing</content>
<parameter name="filePath">/Users/avinashmahala/Desktop/githubRepos/AssetManagementPlatform/scripts/README.md