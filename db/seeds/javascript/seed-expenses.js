#!/usr/bin/env node

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '../.env' });

async function seedExpenses() {
  const pool = new Pool({
    connectionString: process.env.MAIN_DATABASE_URL,
  });

  try {
    console.log('🌱 Seeding expenses...');

    // Read the SQL file
    const sqlFile = path.join(__dirname, 'seed_data', 'expenses.sql');
    const sql = fs.readFileSync(sqlFile, 'utf8');

    // Execute the SQL
    await pool.query(sql);

    console.log('✅ Expenses seeded successfully!');

    // Verify the seeding
    const result = await pool.query('SELECT COUNT(*) as count FROM expenses');
    console.log(`📊 Total expenses in database: ${result.rows[0].count}`);

  } catch (error) {
    console.error('❌ Error seeding expenses:', error);
  } finally {
    await pool.end();
  }
}

seedExpenses();