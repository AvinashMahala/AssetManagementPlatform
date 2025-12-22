import { Pool } from 'pg';
import { readFileSync } from 'fs';
import { join } from 'path';

export const initializeTables = async (pool: Pool) => {
  try {
    console.log('Initializing database tables from schema files...');

    // For testing: drop all tables in reverse dependency order
    console.log('Dropping existing tables for clean initialization...');
    const dropTables = [
      'file_access_log',
      'file_content',
      'file_metadata',
      'property_receipt_templates',
      'property_files',
      'receipts',
      'rent_transaction_meter_readings',
      'meter_readings',
      'meters',
      'rent_transactions',
      'rent_payments',
      'leases',
      'unit_tenants',
      'tenant_documents',
      'units',
      'template_preview_cache',
      'property_template_customizations',
      'properties',
      'receipt_templates',
      'tenants',
      'recovery_codes',
      'security_questions',
      'password_reset_methods',
      'phone_verification_codes',
      'users',
      'organizations'
    ];

    for (const table of dropTables) {
      try {
        await pool.query(`DROP TABLE IF EXISTS ${table} CASCADE`);
        console.log(`Dropped table: ${table}`);
      } catch (error) {
        console.log(`Table ${table} does not exist or could not be dropped:`, error instanceof Error ? error.message : String(error));
      }
    }

    // List of schema files in order
    const schemaFiles = [
      '000_organizations.sql',
      '001_users.sql',
      '002_phone_verification_codes.sql',
      '003_password_reset_methods.sql',
      '004_security_questions.sql',
      '005_recovery_codes.sql',
      '006_tenants.sql',
      '007_receipt_templates.sql',
      '008_properties.sql',
      '009_property_template_customizations.sql',
      '010_template_preview_cache.sql',
      '011_units.sql',
      '012_tenant_documents.sql',
      '013_unit_tenants.sql',
      '014_leases.sql',
      '015_rent_payments.sql',
      '016_rent_transactions.sql',
      '017_receipts.sql',
      '018_meters.sql',
      '019_meter_readings.sql',
      '020_rent_transaction_meter_readings.sql',
      '021_unit_utilities.sql',
      '022_expenses.sql',
      '023_file_metadata.sql',
      '024_property_files.sql',
      '025_property_receipt_templates.sql'
    ];

    // Execute each schema file
    for (const schemaFile of schemaFiles) {
      const schemaPath = join(process.cwd(), '..', 'scripts', 'schema', schemaFile);
      console.log(`Running schema: ${schemaFile}`);

      const sql = readFileSync(schemaPath, 'utf8');
      await pool.query(sql);

      console.log(`✅ ${schemaFile} completed`);
    }

    console.log('All main tables initialized successfully');
  } catch (error) {
    console.error('Error initializing main tables:', error);
    throw error;
  }
}