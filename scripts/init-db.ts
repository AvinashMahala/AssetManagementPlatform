#!/usr/bin/env tsx

import { config } from 'dotenv';
import { Pool } from 'pg';
import { initializeDatabase } from '../backend/src/shared/config/database/init/index.ts';

// Load environment variables
config({ path: '../.env' });

// Database configuration
const mainDbUrl = process.env.MAIN_DATABASE_URL || 'postgresql://user:pass@localhost:5434/asset_platform_main';
const pool = new Pool({
  connectionString: mainDbUrl,
});

async function initDatabase() {
  try {
    console.log('Initializing database...');

    // Create tables and seed data
    await initializeDatabase(pool);

    console.log('Database initialization completed successfully!');
  } catch (error) {
    console.error('Database initialization failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

initDatabase();