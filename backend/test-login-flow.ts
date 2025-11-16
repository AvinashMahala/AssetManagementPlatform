import { Pool } from 'pg';
import bcrypt from 'bcrypt';

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'asset_platform_main',
  user: 'user',
  password: 'pass'
});

async function testLogin() {
  try {
    console.log('\n🔍 Testing login flow...\n');
    
    const email = 'john.doe@example.com';
    const password = 'user123';
    
    // Step 1: Find user by email
    console.log('Step 1: Finding user by email:', email);
    const result = await pool.query(
      'SELECT id, username, email, password, role FROM users WHERE email = $1',
      [email]
    );
    
    if (result.rows.length === 0) {
      console.log('❌ User not found');
      return;
    }
    
    const user = result.rows[0];
    console.log('✅ User found:');
    console.log('  - ID:', user.id);
    console.log('  - Username:', user.username);
    console.log('  - Email:', user.email);
    console.log('  - Role:', user.role);
    console.log('  - Password hash:', user.password?.substring(0, 20) + '...');
    
    // Step 2: Verify password
    console.log('\nStep 2: Verifying password');
    console.log('  - Plain password:', password);
    
    if (!user.password) {
      console.log('❌ No password hash in database');
      return;
    }
    
    const isValid = await bcrypt.compare(password, user.password);
    console.log('  - Verification result:', isValid ? '✅ VALID' : '❌ INVALID');
    
    if (isValid) {
      console.log('\n🎉 Login would succeed!');
    } else {
      console.log('\n❌ Login would fail due to invalid password');
    }
    
  } catch (error) {
    console.error('💥 Error:', error);
  } finally {
    await pool.end();
  }
}

testLogin();
