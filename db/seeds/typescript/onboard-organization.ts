import { config } from 'dotenv';
import { Pool } from 'pg';
import { initializeTables } from '../backend/src/shared/config/database/init/tables.js';
import { v4 as uuidv4 } from 'uuid';
import { resolve } from 'path';

// Load environment variables
const envPath = resolve(process.cwd(), '../.env');
config({ path: envPath });

const masterDbConfig = process.env.MAIN_DATABASE_URL
  ? { connectionString: process.env.MAIN_DATABASE_URL }
  : {
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME, // Master DB
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
};

const masterPool = new Pool(masterDbConfig);

async function onboardOrganization(name: string, slug: string) {
  console.log(`🚀 Onboarding Organization: ${name} (${slug})`);

  try {
    // 1. Check if exists
    const existing = await masterPool.query('SELECT * FROM organizations WHERE slug = $1', [slug]);
    if (existing.rows.length > 0) {
      console.error(`❌ Organization with slug '${slug}' already exists.`);
      process.exit(1);
    }

    // 2. Create Database
    const dbName = `asset_platform_org_${slug.replace(/-/g, '_')}`;
    console.log(`Creating database: ${dbName}...`);
    
    // To create DB, we cannot be connected to it. We are connected to master DB.
    // CREATE DATABASE cannot run in transaction block.
    try {
        await masterPool.query(`CREATE DATABASE "${dbName}"`);
        console.log(`✅ Database ${dbName} created.`);
    } catch (e: any) {
        if (e.code === '42P04') { // duplicate_database
            console.log(`⚠️  Database ${dbName} already exists. Proceeding...`);
        } else {
            throw e;
        }
    }

    // 3. Initialize Schema in New DB
    console.log(`Initializing schema in ${dbName}...`);
    const orgPool = new Pool({
      ...masterDbConfig,
      database: dbName,
    });

    try {
      await initializeTables(orgPool);
      console.log(`✅ Schema initialized.`);
    } finally {
      await orgPool.end();
    }

    // 4. Register in Master DB
    console.log(`Registering in Master DB...`);
    const orgId = uuidv4();
    await masterPool.query(`
      INSERT INTO organizations (id, name, slug, db_name)
      VALUES ($1, $2, $3, $4)
    `, [orgId, name, slug, dbName]);

    console.log(`✅ Organization registered with ID: ${orgId}`);
    console.log(`🎉 Onboarding Complete!`);

  } catch (error) {
    console.error('❌ Onboarding failed:', error);
    process.exit(1);
  } finally {
    await masterPool.end();
  }
}

// Get args
const args = process.argv.slice(2);
if (args.length < 2) {
  console.log('Usage: npx tsx scripts/onboard-organization.ts <name> <slug>');
  process.exit(1);
}

const [name, slug] = args;
onboardOrganization(name, slug);
