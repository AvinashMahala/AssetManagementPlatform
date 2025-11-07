# Smart Database Seeding System

A flexible, Excel-based database seeding system that generates UUIDs dynamically and resolves foreign key relationships automatically.

## 🚀 Quick Start

### 1. Generate Sample Excel Data
```bash
python3 scripts/smart_seed_excel.py
```
Creates `scripts/seed_data/seed_data.xlsx` with realistic Odisha, India test data.

### 2. Seed Database
```bash
python3 scripts/smart_flexible_seed.py
```
Automatically reads from `.env` file and seeds all data.

### 3. Test Credentials
- **Admin:** `admin` / `admin123`
- **Owners:** `ramesh_patel`, `sunita_das`, `prakash_nayak` / `owner123`

## 📊 Sample Data Overview

**Properties (3):**
- Saheed Nagar Colony (8 units: 1RK-3BHK, ₹4K-18K/month)
- Jaydev Vihar Apartments (2 units: 2BHK-3BHK, ₹11K-16K/month)
- Patia Residency (2 units: 1BHK-2BHK, ₹8K-12K/month)

**Tenants (15):** IT professionals, teachers, business analysts from Bhubaneswar
**Payments (40):** Jan-Oct 2024, mix of paid/unpaid
**Meters (12) + Readings (41):** Electricity consumption tracking

## 🔧 Database Configuration

### Automatic .env Loading
The system automatically reads database credentials from your `.env` file.

**Supported Formats:**
```properties
# Option 1: DATABASE_URL (Recommended)
DATABASE_URL=postgresql://user:pass@localhost:5432/assetdb

# Option 2: Individual variables
DB_HOST=localhost
DB_PORT=5432
DB_NAME=assetdb
DB_USER=user
DB_PASSWORD=pass
```

**Priority:** `DATABASE_URL` → Individual variables → Defaults

### Dependencies
```bash
pip install pandas openpyxl psycopg2-binary bcrypt python-dotenv
```

## 📋 Excel Structure

### No UUIDs Required!
Excel uses **business keys** instead of UUIDs for easy editing.

| Sheet | Key Columns | Business Keys |
|-------|-------------|---------------|
| **users** | `key`, `username`, `email` | `key` (e.g., "admin", "ramesh_patel") |
| **tenants** | `key`, `email`, `phone` | `key` (e.g., "rajesh_kumar") |
| **properties** | `key`, `name`, `owner_key` | `key`, `owner_key` → users.key |
| **units** | `key`, `property_key`, `unit_number` | `key`, `property_key` → properties.key |
| **leases** | `unit_key`, `tenant_key` | `unit_key` → units.key, `tenant_key` → tenants.key |
| **rent_payments** | `lease_ref`, `amount` | `lease_ref` = unit_key\|tenant_key |
| **meters** | `meter_number`, `unit_key` | `meter_number`, `unit_key` → units.key |
| **meter_readings** | `meter_number`, `reading_value` | `meter_number` → meters.meter_number |

### Integer Handling
All numeric columns (rent, area, bedrooms, etc.) are stored as clean integers without decimals.

## 🎯 Key Features

### ✅ Smart UUID Generation
- Excel contains human-readable keys only
- Script generates UUIDs dynamically using `uuid.uuid4()`
- Maintains mapping dictionaries for FK resolution

### ✅ Automatic FK Resolution
```python
# Example: Property owner resolution
owner_id = user_uuids[row['owner_key']]  # "ramesh_patel" → generated UUID

# Example: Lease resolution
unit_id = unit_uuids[row['unit_key']]    # "sn_101" → generated UUID
tenant_id = tenant_uuids[row['tenant_key']]  # "rajesh_kumar" → generated UUID
```

### ✅ Clean Integer Formatting
- Rent amounts: `12000` (not `12000.0`)
- Areas: `1050` (not `1050.0`)
- Bedrooms: `2` (not `2.0`)

### ✅ Production-Ready
- Bcrypt password hashing
- Proper NULL handling
- Colored terminal output
- Error handling and rollback

## 🔄 Workflow

### Adding New Data
1. **Edit Excel:** Open `scripts/seed_data/seed_data.xlsx`
2. **Add rows:** Use business keys (no UUIDs needed)
3. **Save:** Excel handles the data
4. **Re-seed:** `python3 scripts/smart_flexible_seed.py`
5. **Done:** UUIDs auto-generated, FKs auto-resolved

### Example: Add New Tenant
```excel
# tenants sheet - Add row:
key: new_tenant
first_name: John
last_name: Doe
email: john.doe@example.com
phone: +919876543210
monthly_income: 50000
...
```

```bash
# Re-seed database
python3 scripts/smart_flexible_seed.py
# ✅ New tenant inserted with auto-generated UUID
```

## 🧪 Testing

### Run Test Script
```bash
./scripts/test_smart_seeding.sh
```
Validates Excel structure, database connection, and schema.

### Manual Verification
```sql
-- Check seeded data
SELECT COUNT(*) FROM users;      -- Expected: 4
SELECT COUNT(*) FROM tenants;    -- Expected: 15
SELECT COUNT(*) FROM properties; -- Expected: 3
SELECT COUNT(*) FROM units;      -- Expected: 12
```

## 🛠️ Troubleshooting

### "Cannot connect to database"
1. Check `.env` file exists: `ls -la .env`
2. Verify DATABASE_URL format: `postgresql://user:pass@host:port/db`
3. Test connection: `psql "$DATABASE_URL"`

### "Module 'dotenv' not found"
```bash
pip install python-dotenv
```

### "Table does not exist"
Run schema creation:
```bash
cd scripts/schema
for f in *.sql; do psql "$DATABASE_URL" -f "$f"; done
```

### "Permission denied"
Grant permissions:
```sql
GRANT ALL PRIVILEGES ON DATABASE assetdb TO user;
```

## 📁 File Structure

```
scripts/
├── smart_seed_excel.py          # Generate Excel with sample data
├── smart_flexible_seed.py       # Seed database from Excel
├── test_smart_seeding.sh        # Validation script
├── README.md                    # This file
├── schema/                      # Database schema files
│   ├── 001_users.sql
│   ├── 002_tenants.sql
│   └── ... (19 files total)
└── seed_data/
    └── seed_data.xlsx           # Generated seed data (editable)
```

## 🔒 Security Notes

- **Never commit** `seed_data.xlsx` with real passwords
- **Never commit** `.env` file to version control
- Passwords in Excel are **plain text** (for development only)
- Script hashes passwords with bcrypt before database insertion

## 🎉 Benefits

### For Developers
- ✅ **No UUID management** - Script handles it
- ✅ **Clean architecture** - Excel = data, Python = logic
- ✅ **Easy maintenance** - Add tables by updating dictionaries
- ✅ **Production-ready** - Proper error handling and logging

### For Non-Developers
- ✅ **Excel-friendly** - Use familiar spreadsheet software
- ✅ **No technical knowledge** - Edit data like any spreadsheet
- ✅ **Self-documenting** - Clear column names and relationships
- ✅ **Error-proof** - Can't create invalid UUIDs manually

### For QA/Testing
- ✅ **Realistic data** - Odisha-specific addresses and names
- ✅ **Complete scenarios** - Active leases, payment histories
- ✅ **Analytics-ready** - 40+ payments for reporting tests
- ✅ **Repeatable** - Fresh data anytime with one command

## 📞 Support

### Common Issues
- **Decimals in numbers:** Fixed - all integers are clean
- **FK constraint errors:** Script resolves all relationships automatically
- **UUID conflicts:** Script generates unique UUIDs each time

### Getting Help
1. Check this README
2. Run test script: `./scripts/test_smart_seeding.sh`
3. Verify Excel structure matches documented format
4. Check database connection with psql

---

**Ready to seed your database?** 🚀

```bash
# Generate sample data
python3 scripts/smart_seed_excel.py

# Seed database
python3 scripts/smart_flexible_seed.py

# Login and explore!
```
</content>
<parameter name="filePath">/Users/avinashmahala/Desktop/githubRepos/AssetManagementPlatform/scripts/README.md