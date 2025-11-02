import { Pool } from 'pg';
import { PasswordResetMethod, SecurityQuestion, RecoveryCode } from '../models/User.js';

export class PasswordResetMethodRepository {
  private pool: Pool;

  constructor(pool: Pool) {
    this.pool = pool;
  }

  async create(userId: string, methodType: string): Promise<PasswordResetMethod> {
    const query = `
      INSERT INTO password_reset_methods (user_id, method_type)
      VALUES ($1, $2)
      RETURNING id, user_id, method_type, is_enabled, created_at, updated_at
    `;
    const result = await this.pool.query(query, [userId, methodType]);
    return result.rows[0];
  }

  async findByUserId(userId: string): Promise<PasswordResetMethod[]> {
    const query = `
      SELECT id, user_id, method_type, is_enabled, created_at, updated_at
      FROM password_reset_methods
      WHERE user_id = $1
      ORDER BY created_at
    `;
    const result = await this.pool.query(query, [userId]);
    return result.rows;
  }

  async enableMethod(userId: string, methodType: string): Promise<boolean> {
    const query = `
      UPDATE password_reset_methods
      SET is_enabled = true, updated_at = CURRENT_TIMESTAMP
      WHERE user_id = $1 AND method_type = $2
    `;
    const result = await this.pool.query(query, [userId, methodType]);
    return (result.rowCount ?? 0) > 0;
  }

  async disableMethod(userId: string, methodType: string): Promise<boolean> {
    const query = `
      UPDATE password_reset_methods
      SET is_enabled = false, updated_at = CURRENT_TIMESTAMP
      WHERE user_id = $1 AND method_type = $2
    `;
    const result = await this.pool.query(query, [userId, methodType]);
    return (result.rowCount ?? 0) > 0;
  }

  async deleteByUserId(userId: string): Promise<boolean> {
    const query = 'DELETE FROM password_reset_methods WHERE user_id = $1';
    const result = await this.pool.query(query, [userId]);
    return (result.rowCount ?? 0) > 0;
  }
}