#!/usr/bin/env tsx

import { Pool } from 'pg';
import { initializeDatabase } from '../backend/src/config/database/init/index.ts';

// Database configuration
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'asset_platform_main',
  user: process.env.DB_USER || 'user',
  password: process.env.DB_PASSWORD || 'pass',
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