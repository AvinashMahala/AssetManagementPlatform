#!/usr/bin/env tsx

import { Pool } from 'pg';
import { readFileSync } from 'fs';
import { join } from 'path';

// Database configuration for files database
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME_FILES || 'asset_platform_files',
  user: process.env.DB_USER || 'user',
  password: process.env.DB_PASSWORD || 'pass',
});

async function runMigration(migrationPath: string) {
  try {
    console.log(`Running migration: ${migrationPath}`);

    const sql = readFileSync(migrationPath, 'utf8');

    // Split by semicolon and execute each statement
    const statements = sql.split(';').filter(stmt => stmt.trim().length > 0);

    for (const statement of statements) {
      if (statement.trim()) {
        console.log(`Executing: ${statement.trim().substring(0, 50)}...`);
        await pool.query(statement);
      }
    }

    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Run the migration
const migrationPath = join(process.cwd(), 'backend/migrations/008_allow_null_entity_fields.sql');
runMigration(migrationPath);