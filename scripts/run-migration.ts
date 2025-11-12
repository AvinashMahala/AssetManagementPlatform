#!/usr/bin/env tsx

import { Pool } from 'pg';
import { readFileSync } from 'fs';
import { join } from 'path';

// Database configuration for main database
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'asset_platform_main',
  user: process.env.DB_USER || 'user',
  password: process.env.DB_PASSWORD || 'pass',
});

async function runMigration(migrationPath: string) {
  try {
    console.log(`Running migration: ${migrationPath}`);

    const sql = readFileSync(migrationPath, 'utf8');

    // Execute the entire migration as one query to handle complex statements
    console.log(`Executing migration...`);
    await pool.query(sql);

    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Run the migration
const migrationPath = join(process.cwd(), 'backend/migrations/013_add_tenant_cascade_delete.sql');
runMigration(migrationPath);