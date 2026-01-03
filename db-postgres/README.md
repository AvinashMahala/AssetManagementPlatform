# Database Management

This directory contains all database schemas, seed data, and management scripts for the Asset Management Platform.

## Structure

- **schema/**: Contains the raw SQL files that define the database structure. These are executed in order.
- **seeds/**: Contains scripts and data to populate the database.
  - `python/`: Python scripts for granular data cleaning and seeding.
  - `typescript/`: TypeScript scripts for specific seeding tasks.
  - `javascript/`: JavaScript seeding scripts.
  - `data/`: Raw data files (JSON, SQL).
- **scripts/**: Operational scripts for initializing and verifying the database.

## Common Operations

### Initialize Database
To reset and initialize the database with the latest schema:
```bash
# From backend directory
npm run init-db
```

### Seeding Data
To seed specific data types, use the scripts in `seeds/`:
```bash
# Example: Seed properties (ensure you have python dependencies installed)
python3 db-postgres/seeds/python/seed_property_data.py
```

### Verifying Database
To verify the database state:
```bash
python3 db-postgres/scripts/verify_database.py
```
