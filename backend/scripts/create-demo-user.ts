import { Pool } from 'pg';
import * as bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';

dotenv.config({ path: '../../.env' });

async function createDemoUser() {
  const pool = new Pool({
    connectionString: process.env.MAIN_DATABASE_URL || 'postgresql://user:pass@localhost:5434/asset_platform_main',
  });

  try {
    console.log('🔐 Creating demo user...');
    
    // Check if user already exists
    const existingUser = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      ['demo@assetplatform.com']
    );

    if (existingUser.rows.length > 0) {
      console.log('ℹ️  Demo user already exists');
      await pool.end();
      return;
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash('demo123', 10);
    const userId = uuidv4();

    // Insert demo user
    await pool.query(
      `INSERT INTO users (id, username, email, password, role, is_email_verified, is_phone_verified, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())`,
      [userId, 'demo_user', 'demo@assetplatform.com', hashedPassword, 'user', true, false]
    );

    console.log('✅ Demo user created successfully!');
    console.log('📧 Email: demo@assetplatform.com');
    console.log('🔑 Password: demo123');

  } catch (error) {
    console.error('❌ Error creating demo user:', error);
  } finally {
    await pool.end();
  }
}

createDemoUser();
