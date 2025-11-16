import { Pool } from 'pg';
import { initializeTables } from './tables.js';
import { initializeFilesTables } from './filesTables.js';

export const initializeDatabase = async (mainPool: Pool, filesPool?: Pool) => {
  console.log('Initializing main database tables...');
  await initializeTables(mainPool);

  if (filesPool) {
    console.log('Initializing files database tables...');
    await initializeFilesTables(filesPool);
  }
};