import { Pool } from 'pg';
import { config } from '@/shared/config/env';

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
      host: config.db.host,
      port: config.db.port,
      database: config.db.name, // Master/Default DB
      user: config.db.user,
      password: config.db.password,
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
    try {
      const result = await this.masterPool.query(
        'SELECT db_name FROM organizations WHERE slug = $1 OR id::text = $1',
        [orgId]
      );

      if (result.rows.length === 0) {
        throw new Error(`Organization '${orgId}' not found.`);
      }

      const dbName = result.rows[0].db_name;

      console.log(`[ConnectionManager] Initializing pool for organization: ${orgId} (DB: ${dbName})`);

      const newPool = new Pool({
        host: config.db.host, // Usually same host, different DB
        port: config.db.port,
        database: dbName,
        user: config.db.user,
        password: config.db.password,
        max: 10, // Smaller pool size per org to save connections
        idleTimeoutMillis: 30000,
      });

      // Handle pool errors
      newPool.on('error', (err) => {
        console.error(`[ConnectionManager] Unexpected error on idle client for org ${orgId}`, err);
      });

      this.orgPools.set(orgId, newPool);
      return newPool;
    } catch (error) {
      console.error(`[ConnectionManager] Failed to connect to organization ${orgId}:`, error);
      throw error;
    }
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
