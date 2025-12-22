import { Pool } from 'pg';
import { PasswordResetMethod, SecurityQuestion, RecoveryCode } from '@/models/User.js';

export class PasswordResetMethodRepository {
  private pool: Pool;

  constructor(pool: Pool) {
    this.pool = pool;
  }

  async create(userId: string, methodType: string): Promise<PasswordResetMethod> {
    try {
      const query = `
        INSERT INTO password_reset_methods (user_id, method_type)
        VALUES ($1, $2)
        RETURNING id, user_id, method_type, is_enabled, created_at, updated_at
      `;
      const result = await this.pool.query(query, [userId, methodType]);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Failed to create password reset method: ${(error as Error).message || 'Database insert failed'}`);
    }
  }

  async findByUserId(userId: string): Promise<PasswordResetMethod[]> {
    try {
      const query = `
        SELECT id, user_id, method_type, is_enabled, created_at, updated_at
        FROM password_reset_methods
        WHERE user_id = $1
        ORDER BY created_at
      `;
      const result = await this.pool.query(query, [userId]);
      return result.rows;
    } catch (error) {
      throw new Error(`Failed to find password reset methods by user ID: ${(error as Error).message || 'Database query failed'}`);
    }
  }

  async enableMethod(userId: string, methodType: string): Promise<boolean> {
    try {
      const query = `
        UPDATE password_reset_methods
        SET is_enabled = true, updated_at = CURRENT_TIMESTAMP
        WHERE user_id = $1 AND method_type = $2
      `;
      const result = await this.pool.query(query, [userId, methodType]);
      return (result.rowCount ?? 0) > 0;
    } catch (error) {
      throw new Error(`Failed to enable password reset method: ${(error as Error).message || 'Database update failed'}`);
    }
  }

  async disableMethod(userId: string, methodType: string): Promise<boolean> {
    try {
      const query = `
        UPDATE password_reset_methods
        SET is_enabled = false, updated_at = CURRENT_TIMESTAMP
        WHERE user_id = $1 AND method_type = $2
      `;
      const result = await this.pool.query(query, [userId, methodType]);
      return (result.rowCount ?? 0) > 0;
    } catch (error) {
      throw new Error(`Failed to disable password reset method: ${(error as Error).message || 'Database update failed'}`);
    }
  }

  async deleteByUserId(userId: string): Promise<boolean> {
    try {
      const query = 'DELETE FROM password_reset_methods WHERE user_id = $1';
      const result = await this.pool.query(query, [userId]);
      return (result.rowCount ?? 0) > 0;
    } catch (error) {
      throw new Error(`Failed to delete password reset methods by user ID: ${(error as Error).message || 'Database delete failed'}`);
    }
  }
}