import { Pool } from 'pg';
import { readFileSync } from 'fs';
import { join } from 'path';

export const initializeFilesTables = async (pool: Pool) => {
  try {
    console.log('Initializing file storage tables from schema files...');

    // For testing: drop existing file tables
    console.log('Dropping existing file tables for clean initialization...');
    const fileTables = ['file_access_log', 'file_content', 'file_metadata'];

    for (const table of fileTables) {
      try {
        await pool.query(`DROP TABLE IF EXISTS ${table} CASCADE`);
        console.log(`Dropped table: ${table}`);
      } catch (error) {
        console.log(`Table ${table} does not exist or could not be dropped:`, error instanceof Error ? error.message : String(error));
      }
    }

    // List of file-related schema files in order
    const fileSchemaFiles = [
      '023_file_metadata.sql',
      '024_property_files.sql',
      '025_property_receipt_templates.sql'
    ];

    // Execute each file schema file
    for (const schemaFile of fileSchemaFiles) {
      const schemaPath = join(process.cwd(), 'scripts', 'schema', schemaFile);
      console.log(`Running schema: ${schemaFile}`);

      const sql = readFileSync(schemaPath, 'utf8');
      await pool.query(sql);

      console.log(`✅ ${schemaFile} completed`);
    }

    console.log('All file tables initialized successfully');
  } catch (error) {
    console.error('Error initializing files tables:', error);
    throw error;
  }
};