# Database Setup Pipeline

This project includes a complete database setup pipeline that handles everything from Excel data creation to database seeding and verification in a single command.

## Single Entry Point

Run the complete setup pipeline with one command:

```bash
python3 setup_database.py
```

This will:
1. **Create Excel seed data** - Generate `scripts/seed_data/seed_data.xlsx` with sample data
2. **Seed the database** - Populate all tables with proper relationships and UUIDs
3. **Verify integrity** - Check schemas, data counts, and foreign key relationships

**Interactive Mode:** The pipeline asks for confirmation before each step, allowing you to skip steps or stop at any point. Type `y` or `yes` to continue, anything else to skip.

## What Gets Created

The pipeline creates a complete dataset:

- **4 Users** (1 admin, 3 property owners)
- **15 Tenants** (realistic Odisha-based tenant data)
- **3 Properties** (Saheed Nagar, Jaydev Vihar, Patia Green)
- **12 Units** (distributed across properties)
- **12 Leases** (active tenant-property relationships)
- **12 Unit-Tenants** (junction table relationships)
- **38 Rent Payments** (payment history)
- **0 Meters/Readings** (not seeded by default)

## Test Credentials

After setup, you can login with:

- **Admin**: `admin@assetplatform.com` / `admin123`
- **User**: `ramesh_patel@example.com` / `owner123`

## Individual Scripts

If you need to run individual steps:

```bash
# Create Excel file only
python3 scripts/smart_seed_excel.py

# Seed database only (requires Excel file)
python3 scripts/smart_flexible_seed.py

# Verify database only
python3 scripts/verify_database.py
```

## Database Configuration

The scripts automatically detect database configuration from:
1. `MAIN_DATABASE_URL` environment variable (Docker/production)
2. Individual env vars: `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`
3. Defaults to Docker setup: `localhost:5432/asset_platform_main` with `user/pass`

## Data Integrity

The verification step ensures:
- ✅ All tables exist with correct schemas
- ✅ Proper foreign key relationships
- ✅ No orphaned records
- ✅ Data quality checks (valid dates, positive amounts, etc.)
- ✅ Expected record counts match

## Safe Operation

The pipeline includes safety checks:
- Confirms before proceeding with database reset
- Validates all prerequisites exist
- Provides clear error messages if anything fails
- Shows progress and timing information

## Session tokens (refresh token sessions)

This project supports server-side per-session refresh tokens stored in the `session_tokens` table. If you are setting up a new database or restoring one, ensure you run the SQL migration file:

```bash
psql <your-connection-string> -f db-postgres/schema/027_session_tokens.sql
```

## RBAC / Permissions

The project includes RBAC tables for permissions and categories. If you're creating a fresh database or restoring, apply the RBAC schema file:

```bash
psql <your-connection-string> -f db-postgres/schema/030_permissions.sql
```

Notes:
- The SQL uses `gen_random_uuid()` by default (PG `pgcrypto`); if your Postgres instance uses `uuid-ossp`, you can replace it with `uuid_generate_v4()` or generate UUIDs in the application layer.
- If you previously relied on the legacy per-user refresh token (stored on the `users` table), both approaches are supported during migration. See `DEPLOYMENT.md` for operational guidance on rotating refresh tokens and the `Auth:RefreshTokenPepper` setting.


### New RBAC & Roles migrations

New (idempotent) SQL migration files have been added to support RBAC role and assignment tables. Apply these when creating or updating a database instance:

```bash
psql <your-connection-string> -f db-postgres/schema/032_roles.sql
psql <your-connection-string> -f db-postgres/schema/033_user_roles.sql
psql <your-connection-string> -f db-postgres/schema/034_alter_users_add_refresh_token.sql
```

Run these after the other schema files to ensure the RBAC seeding code in `Program` runs without errors.
