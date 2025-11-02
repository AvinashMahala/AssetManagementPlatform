import { Pool } from 'pg';
import { RecoveryCode } from '../models/User.js';

export class RecoveryCodeRepository {
  private pool: Pool;

  constructor(pool: Pool) {
    this.pool = pool;
  }

  async create(userId: number, codeHash: string): Promise<RecoveryCode> {
    const query = `
      INSERT INTO recovery_codes (user_id, code_hash)
      VALUES ($1, $2)
      RETURNING id, user_id, code_hash, is_used, created_at, used_at
    `;
    const result = await this.pool.query(query, [userId, codeHash]);
    return result.rows[0];
  }

  async createMultiple(userId: number, codeHashes: string[]): Promise<RecoveryCode[]> {
    const values = codeHashes.map((_, index) => `($1, $${index + 2})`).join(', ');
    const params = [userId, ...codeHashes];

    const query = `
      INSERT INTO recovery_codes (user_id, code_hash)
      VALUES ${values}
      RETURNING id, user_id, code_hash, is_used, created_at, used_at
    `;
    const result = await this.pool.query(query, params);
    return result.rows;
  }

  async findByUserId(userId: number): Promise<RecoveryCode[]> {
    const query = `
      SELECT id, user_id, code_hash, is_used, created_at, used_at
      FROM recovery_codes
      WHERE user_id = $1
      ORDER BY created_at
    `;
    const result = await this.pool.query(query, [userId]);
    return result.rows;
  }

  async findUnusedByUserId(userId: number): Promise<RecoveryCode[]> {
    const query = `
      SELECT id, user_id, code_hash, is_used, created_at, used_at
      FROM recovery_codes
      WHERE user_id = $1 AND is_used = false
      ORDER BY created_at
    `;
    const result = await this.pool.query(query, [userId]);
    return result.rows;
  }

  async findByCodeHash(codeHash: string): Promise<RecoveryCode | null> {
    const query = `
      SELECT id, user_id, code_hash, is_used, created_at, used_at
      FROM recovery_codes
      WHERE code_hash = $1
    `;
    const result = await this.pool.query(query, [codeHash]);
    return result.rows[0] || null;
  }

  async markAsUsed(id: number): Promise<boolean> {
    const query = `
      UPDATE recovery_codes
      SET is_used = true, used_at = CURRENT_TIMESTAMP
      WHERE id = $1 AND is_used = false
    `;
    const result = await this.pool.query(query, [id]);
    return (result.rowCount ?? 0) > 0;
  }

  async deleteByUserId(userId: number): Promise<boolean> {
    const query = 'DELETE FROM recovery_codes WHERE user_id = $1';
    const result = await this.pool.query(query, [userId]);
    return (result.rowCount ?? 0) > 0;
  }

  async regenerateForUser(userId: number, codeHashes: string[]): Promise<RecoveryCode[]> {
    // Delete existing codes
    await this.deleteByUserId(userId);

    // Create new codes
    return await this.createMultiple(userId, codeHashes);
  }
}