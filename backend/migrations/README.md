# Database Migrations - DEPRECATED

⚠️ **This folder is deprecated and kept for reference only.**

## New Approach

All database schema and seed data are now managed through the `/scripts` directory:

- **Schema**: `/scripts/schema/*.sql` - Complete table definitions with all columns and constraints
- **Seed Data**: `/scripts/seed_data/*.sql` - Initial data seeding scripts

## Why the Change?

The previous migration-based approach created complexity with:
- Incremental schema changes spread across multiple files
- Difficulty tracking the current state of the database
- Confusion between base schema and migrations

The new approach provides:
- **Single Source of Truth**: Each table has one complete schema file
- **Easier Onboarding**: New developers can see the full table structure immediately
- **Cleaner Setup**: Run all schema files in order for a fresh database
- **Better Documentation**: Each schema file is self-contained with comments

## Migration History (For Reference Only)

These migration files have been consolidated into the schema files:

1. `001_add_missing_user_columns.sql` → Merged into `scripts/schema/001_users.sql`
2. `002_add_rent_transactions_table.sql` → Merged into `scripts/schema/016_rent_transactions.sql`
3. `003_add_receipts_table.sql` → Merged into `scripts/schema/017_receipts.sql`
4. `004_add_receipt_templates.sql` → Merged into `scripts/schema/007_receipt_templates.sql` + seed data
5. `005_add_rent_transaction_meter_readings.sql` → Merged into `scripts/schema/020_rent_transaction_meter_readings.sql`
6. `005_make_permanent_address_nullable.sql` → Merged into `scripts/schema/006_tenants.sql`
7. `006_fix_tenants_schema_consistency.sql` → Merged into `scripts/schema/006_tenants.sql`

## Database Setup

To set up a fresh database, use the initialization script:

```bash
# From the project root
npm run db:init

# Or manually:
ts-node scripts/init-db.ts
```

This will:
1. Create all tables from schema files (in order)
2. Apply seed data
3. Verify the database structure

## For Existing Databases

If you have an existing database that was created with these migrations, **DO NOT** run the schema files directly as they may conflict. Instead:

1. Back up your database
2. Review the changes in each schema file
3. Apply only the differences manually, or
4. Consider a fresh database setup for development

## Questions?

See `/scripts/README.md` for more details on the new database management approach.
