# Simple Database Seeding

A single Python script for end-to-end database seeding from Excel.

## Quick Start

```bash
# Install dependencies
pip3 install pandas openpyxl bcrypt psycopg2-binary

# Run the seeding script
python3 scripts/simple_db_seed.py
```

That's it! The script handles everything automatically.

## What It Does

1. **Auto-detects Database**: Docker containers or direct PostgreSQL connections
2. **Safety First**: Checks for existing data and asks for confirmation before deletion
3. **Fresh Schema**: Drops all tables and recreates with UUID primary keys
4. **Excel Import**: Reads test data from `test_data/test_data.xlsx`
5. **Smart Seeding**: Handles foreign key relationships and type conversion
6. **Test Credentials**: Shows login credentials after seeding

## Requirements

- Python 3.6+
- PostgreSQL database (Docker or direct)
- Excel file: `test_data/test_data.xlsx`
- Dependencies: `pandas`, `openpyxl`, `bcrypt`, `psycopg2-binary`

## Excel Format

The Excel file should contain these sheets:
- `users` - User accounts (passwords auto-hashed)
- `properties` - Property listings with amenities/photos
- `tenants` - Tenant profiles with contact info
- `leases` - Lease agreements
- `rent_payments` - Payment records

## Environment Variables

Override defaults if needed:
- `DB_HOST` (default: localhost)
- `DB_PORT` (default: 5432)
- `DB_NAME` (default: assetdb)
- `DB_USER` (default: user)
- `DB_PASSWORD` (default: pass)

## Usage Examples

```bash
# Standard usage (auto-detects Docker)
python3 scripts/simple_db_seed.py

# Custom database
export DB_NAME=myapp_db
export DB_USER=myuser
python3 scripts/simple_db_seed.py
```

## Safety Features

- **Confirmation Prompt**: Asks before deleting existing data
- **Transaction Safety**: Proper database transactions with rollback
- **Error Handling**: Clear error messages and graceful failure
- **Foreign Key Resolution**: Automatically links related records

## Troubleshooting

**"Excel file not found"**
- Ensure `test_data/test_data.xlsx` exists in project root

**"Database connection failed"**
- Check PostgreSQL is running via Docker Compose
- Verify environment variables match your setup

**"Import error"**
- Install dependencies: `pip3 install pandas openpyxl bcrypt psycopg2-binary`

**"Permission denied"**
- Make script executable: `chmod +x scripts/simple_db_seed.py`