import { Pool } from 'pg';
import { RecoveryCode } from '../core/auth.types';
import { TABLES } from '@/shared/constants/database';

export class RecoveryCodeRepository {
  private pool: Pool;

  constructor(pool: Pool) {
    this.pool = pool;
  }

  async create(userId: string, codeHash: string): Promise<RecoveryCode> {
    try {
      const query = `
        INSERT INTO ${TABLES.RECOVERY_CODES} (user_id, code_hash)
        VALUES ($1, $2)
        RETURNING id, user_id, code_hash, used, created_at, used_at
      `;
      const result = await this.pool.query(query, [userId, codeHash]);
      return this.mapToDomain(result.rows[0]);
    } catch (error) {
      throw new Error(`Failed to create recovery code: ${(error as Error).message || 'Database insert failed'}`);
    }
  }

  async createMultiple(userId: string, codeHashes: string[]): Promise<RecoveryCode[]> {
    try {
      const values = codeHashes.map((_, index) => `($1, $${index + 2})`).join(', ');
      const params = [userId, ...codeHashes];

      const query = `
        INSERT INTO ${TABLES.RECOVERY_CODES} (user_id, code_hash)
        VALUES ${values}
        RETURNING id, user_id, code_hash, used, created_at, used_at
      `;
      const result = await this.pool.query(query, params);
      return result.rows.map(row => this.mapToDomain(row));
    } catch (error) {
      throw new Error(`Failed to create multiple recovery codes: ${(error as Error).message || 'Database insert failed'}`);
    }
  }

  async findByUserId(userId: string): Promise<RecoveryCode[]> {
    try {
      const query = `
        SELECT id, user_id, code_hash, used, created_at, used_at
        FROM ${TABLES.RECOVERY_CODES}
        WHERE user_id = $1
        ORDER BY created_at
      `;
      const result = await this.pool.query(query, [userId]);
      return result.rows.map(row => this.mapToDomain(row));
    } catch (error) {
      throw new Error(`Failed to find recovery codes by user ID: ${(error as Error).message || 'Database query failed'}`);
    }
  }

  async findUnusedByUserId(userId: string): Promise<RecoveryCode[]> {
    try {
      const query = `
        SELECT id, user_id, code_hash, used, created_at, used_at
        FROM ${TABLES.RECOVERY_CODES}
        WHERE user_id = $1 AND used = false
        ORDER BY created_at
      `;
      const result = await this.pool.query(query, [userId]);
      return result.rows.map(row => this.mapToDomain(row));
    } catch (error) {
      throw new Error(`Failed to find unused recovery codes by user ID: ${(error as Error).message || 'Database query failed'}`);
    }
  }

  async findByCodeHash(codeHash: string): Promise<RecoveryCode | null> {
    try {
      const query = `
        SELECT id, user_id, code_hash, used, created_at, used_at
        FROM ${TABLES.RECOVERY_CODES}
        WHERE code_hash = $1
      `;
      const result = await this.pool.query(query, [codeHash]);
      return result.rows[0] ? this.mapToDomain(result.rows[0]) : null;
    } catch (error) {
      throw new Error(`Failed to find recovery code by code hash: ${(error as Error).message || 'Database query failed'}`);
    }
  }

  async markAsUsed(id: string): Promise<boolean> {
    try {
      const query = `
        UPDATE ${TABLES.RECOVERY_CODES}
        SET used = true, used_at = CURRENT_TIMESTAMP
        WHERE id = $1 AND used = false
      `;
      const result = await this.pool.query(query, [id]);
      return (result.rowCount ?? 0) > 0;
    } catch (error) {
      throw new Error(`Failed to mark recovery code as used: ${(error as Error).message || 'Database update failed'}`);
    }
  }

  async deleteByUserId(userId: string): Promise<boolean> {
    try {
      const query = `DELETE FROM ${TABLES.RECOVERY_CODES} WHERE user_id = $1`;
      const result = await this.pool.query(query, [userId]);
      return (result.rowCount ?? 0) > 0;
    } catch (error) {
      throw new Error(`Failed to delete recovery codes by user ID: ${(error as Error).message || 'Database delete failed'}`);
    }
  }

  private mapToDomain(row: any): RecoveryCode {
    return {
      id: row.id,
      userId: row.user_id,
      codeHash: row.code_hash,
      used: row.used,
      createdAt: row.created_at,
      usedAt: row.used_at
    };
  }
}
