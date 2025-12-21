import { Pool, QueryResult } from 'pg';
import { logger } from '@/shared/utils/logger';

export interface QueryOptions {
  select?: string[];
  where?: Record<string, any>;
  orderBy?: Record<string, 'ASC' | 'DESC'>;
  limit?: number;
  offset?: number;
  relations?: string[]; // e.g., ['tenant', 'property']
}

export abstract class BaseRepository<T, CreateDTO = Partial<T>, UpdateDTO = Partial<T>> {
  constructor(
    protected readonly pool: Pool,
    protected readonly tableName: string,
    protected readonly primaryKey: string = 'id'
  ) {}

  /**
   * Define relationships for automatic joins.
   * Example:
   * {
   *   tenant: { table: 'tenants', localKey: 'tenant_id', foreignKey: 'id', columns: ['first_name', 'last_name'] }
   * }
   */
  protected relations: Record<string, { 
    table: string; 
    localKey: string; 
    foreignKey: string; 
    columns?: string[];
    alias?: string;
  }> = {};

  /**
   * Find all records with options for filtering, selecting, and relations.
   */
  async findAll(options: QueryOptions = {}): Promise<T[]> {
    const { query, values } = this.buildSelectQuery(options);
    try {
      const start = Date.now();
      const result = await this.pool.query(query, values);
      const duration = Date.now() - start;
      if (duration > 1000) {
        logger.warn(`Slow query in ${this.tableName}.findAll: ${duration}ms`, { query, values });
      }
      return result.rows.map(row => this.mapToDomain(row));
    } catch (error) {
      logger.error(`Error in ${this.tableName}.findAll`, { error, query, values });
      throw error;
    }
  }

  /**
   * Find a single record by ID.
   */
  async findById(id: string, relations: string[] = []): Promise<T | null> {
    const { query, values } = this.buildSelectQuery({
      where: { [this.primaryKey]: id },
      relations,
      limit: 1
    });
    
    const result = await this.pool.query(query, values);
    return result.rows[0] ? this.mapToDomain(result.rows[0]) : null;
  }

  /**
   * Find a single record by criteria.
   */
  async findOne(where: Record<string, any>, relations: string[] = []): Promise<T | null> {
    const { query, values } = this.buildSelectQuery({
      where,
      relations,
      limit: 1
    });
    
    const result = await this.pool.query(query, values);
    return result.rows[0] ? this.mapToDomain(result.rows[0]) : null;
  }

  /**
   * Create a new record.
   * Automatically handles columns based on the input object.
   */
  async add(data: CreateDTO): Promise<T> {
    const keys = Object.keys(data as any);
    const values = Object.values(data as any);
    
    const columns = keys.map(k => this.toSnakeCase(k)).join(', ');
    const placeholders = values.map((_, i) => `$${i + 1}`).join(', ');
    
    const query = `
      INSERT INTO ${this.tableName} (${columns}) 
      VALUES (${placeholders}) 
      RETURNING *
    `;
    
    const result = await this.pool.query(query, values);
    return this.mapToDomain(result.rows[0]);
  }

  /**
   * Update a record by ID.
   */
  async updateById(id: string, data: UpdateDTO): Promise<T | null> {
    const keys = Object.keys(data as any);
    const values = Object.values(data as any);
    
    if (keys.length === 0) return this.findById(id);

    const setClause = keys
      .map((k, i) => `${this.toSnakeCase(k)} = $${i + 2}`)
      .join(', ');

    const query = `
      UPDATE ${this.tableName} 
      SET ${setClause}, updated_at = NOW()
      WHERE ${this.primaryKey} = $1
      RETURNING *
    `;

    const result = await this.pool.query(query, [id, ...values]);
    return result.rows[0] ? this.mapToDomain(result.rows[0]) : null;
  }

  /**
   * Delete a record by ID.
   */
  async delete(id: string): Promise<boolean> {
    const query = `DELETE FROM ${this.tableName} WHERE ${this.primaryKey} = $1`;
    const result = await this.pool.query(query, [id]);
    return (result.rowCount || 0) > 0;
  }

  // --- Helpers ---

  protected buildSelectQuery(options: QueryOptions): { query: string; values: any[] } {
    const { select, where, orderBy, limit, offset, relations } = options;
    const values: any[] = [];
    let valueIndex = 1;

    // 1. SELECT Clause
    let selectClause = `${this.tableName}.*`;
    if (select) {
      selectClause = select.map(c => `${this.tableName}.${this.toSnakeCase(c)}`).join(', ');
    }

    // 2. JOIN Clause (Dynamic Relations)
    let joinClause = '';
    if (relations) {
      relations.forEach(relName => {
        const rel = this.relations[relName];
        if (rel) {
          const alias = rel.alias || rel.table;
          joinClause += ` LEFT JOIN ${rel.table} ${alias} ON ${this.tableName}.${rel.localKey} = ${alias}.${rel.foreignKey}`;
          
          // Add related columns to selection
          if (rel.columns) {
            const relCols = rel.columns.map(c => `${alias}.${c} as "${relName}.${c}"`).join(', ');
            selectClause += `, ${relCols}`;
          } else {
             // If no specific columns, maybe select all? (Careful with collisions)
             // For now, let's assume specific columns are best for performance
          }
        }
      });
    }

    // 3. WHERE Clause
    let whereClause = '';
    if (where && Object.keys(where).length > 0) {
      const conditions = Object.keys(where).map(key => {
        values.push(where[key]);
        return `${this.tableName}.${this.toSnakeCase(key)} = $${valueIndex++}`;
      });
      whereClause = `WHERE ${conditions.join(' AND ')}`;
    }

    // 4. ORDER BY
    let orderByClause = '';
    if (orderBy) {
      const orders = Object.keys(orderBy).map(key => {
        return `${this.tableName}.${this.toSnakeCase(key)} ${orderBy[key]}`;
      });
      orderByClause = `ORDER BY ${orders.join(', ')}`;
    }

    // 5. LIMIT / OFFSET
    let limitClause = '';
    if (limit) {
      values.push(limit);
      limitClause = `LIMIT $${valueIndex++}`;
    }
    
    let offsetClause = '';
    if (offset) {
      values.push(offset);
      offsetClause = `OFFSET $${valueIndex++}`;
    }

    const query = `
      SELECT ${selectClause} 
      FROM ${this.tableName}
      ${joinClause}
      ${whereClause}
      ${orderByClause}
      ${limitClause}
      ${offsetClause}
    `;

    return { query, values };
  }

  protected toSnakeCase(str: string): string {
    return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
  }

  protected mapToDomain(row: any): T {
    const result: any = {};
    for (const key in row) {
      // Handle nested relation columns (e.g., "tenant.first_name")
      if (key.includes('.')) {
        const [relName, colName] = key.split('.');
        if (!result[relName]) result[relName] = {};
        result[relName][this.toCamelCase(colName)] = row[key];
      } else {
        result[this.toCamelCase(key)] = row[key];
      }
    }
    return result as T;
  }

  protected toCamelCase(str: string): string {
    return str.replace(/_([a-z])/g, (g) => g[1].toUpperCase());
  }
}
