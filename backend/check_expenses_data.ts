
import { Pool } from 'pg';
import dotenv from 'dotenv';
import path from 'path';

// Load env vars
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const pool = new Pool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

async function checkExpenses() {
  try {
    const res = await pool.query('SELECT id, affected_unit_ids, pg_typeof(affected_unit_ids) as type FROM expenses LIMIT 5');
    console.log('Expenses data:', JSON.stringify(res.rows, null, 2));
    
    // Check if any affected_unit_ids is not an array
    const nonArrays = res.rows.filter(row => row.affected_unit_ids && !Array.isArray(row.affected_unit_ids));
    if (nonArrays.length > 0) {
      console.log('Found non-array affected_unit_ids:', nonArrays);
    } else {
      console.log('All non-null affected_unit_ids are arrays.');
    }

  } catch (err) {
    console.error('Error querying expenses:', err);
  } finally {
    await pool.end();
  }
}

checkExpenses();
