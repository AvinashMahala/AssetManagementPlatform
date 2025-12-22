import { config } from 'dotenv';
import { Pool } from 'pg';

// Load environment variables
config({ path: '../.env' });

// Database configuration
const mainDbUrl = process.env.MAIN_DATABASE_URL || 'postgresql://user:pass@localhost:5434/asset_platform_main';
const pool = new Pool({
  connectionString: mainDbUrl,
});

async function seedOrganizations() {
  try {
    console.log('Seeding organizations...');

    const client = await pool.connect();
    try {
      // Check if organization already exists
      const res = await client.query('SELECT * FROM organizations WHERE slug = $1', ['default']);
      if (res.rows.length > 0) {
        console.log('Default organization already exists.');
        return;
      }

      // Insert default organization
      await client.query(`
        INSERT INTO organizations (name, slug, db_name)
        VALUES ($1, $2, $3)
      `, ['Default Organization', 'default', 'asset_platform_main']);

      console.log('Default organization seeded successfully!');
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error seeding organizations:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

seedOrganizations();
