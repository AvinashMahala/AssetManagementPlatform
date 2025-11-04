import { Pool } from 'pg';
import { initializeTables } from './tables.js';

export const initializeDatabase = (pool: Pool) => {
  console.log('Initializing database tables...');
  initializeTables(pool);
};