import { Pool } from 'pg';

/**
 * Manages database connections for multiple organizations.
 * Maintains a pool of connection pools, one for each organization.
 */
export class OrganizationConnectionManager {
  private static instance: OrganizationConnectionManager;
  private orgPools: Map<string, Pool> = new Map();
  private masterPool: Pool;

  private constructor() {
    // Initialize master pool (used for 'default' connection and looking up orgs)
    this.masterPool = new Pool({
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT || '5432'),
      database: process.env.DB_NAME, // Master/Default DB
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
    });
  }

  static getInstance(): OrganizationConnectionManager {
    if (!OrganizationConnectionManager.instance) {
      OrganizationConnectionManager.instance = new OrganizationConnectionManager();
    }
    return OrganizationConnectionManager.instance;
  }

  /**
   * Get the Master/Default DB connection.
   * Used for:
   * 1. Looking up organization configurations.
   * 2. Development mode (when no Org ID is provided).
   */
  getDefaultPool(): Pool {
    return this.masterPool;
  }

  /**
   * Get a connection pool for a specific organization.
   * If it doesn't exist, it creates one (lazy loading).
   */
  async getConnection(orgId: string): Promise<Pool> {
    // 🟢 DEV MODE FALLBACK: If orgId is 'default', return the master pool
    if (orgId === 'default') {
      return this.masterPool;
    }

    if (this.orgPools.has(orgId)) {
      return this.orgPools.get(orgId)!;
    }

    // 1. Fetch Org DB config from Master DB
    // In a real app, you'd query the 'organizations' table in the master DB
    // const orgConfig = await this.masterPool.query('SELECT db_name, db_host... FROM organizations WHERE id = $1', [orgId]);
    
    // For this phase, we'll assume a naming convention: org_{id}_db
    const dbName = `org_${orgId}_db`; 

    console.log(`[ConnectionManager] Initializing pool for organization: ${orgId} (DB: ${dbName})`);

    const newPool = new Pool({
      host: process.env.DB_HOST, // Usually same host, different DB
      port: parseInt(process.env.DB_PORT || '5432'),
      database: dbName,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      max: 10, // Smaller pool size per org to save connections
      idleTimeoutMillis: 30000,
    });

    // Handle pool errors
    newPool.on('error', (err) => {
      console.error(`[ConnectionManager] Unexpected error on idle client for org ${orgId}`, err);
    });

    this.orgPools.set(orgId, newPool);
    return newPool;
  }

  /**
   * Close all pools (graceful shutdown)
   */
  async closeAll(): Promise<void> {
    await this.masterPool.end();
    for (const [orgId, pool] of this.orgPools) {
      await pool.end();
    }
    this.orgPools.clear();
  }
}
