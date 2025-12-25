import { Pool } from 'pg';
import { PasswordResetMethod } from '../core/auth.types';
import { TABLES } from '@/shared/constants/database';

export class PasswordResetMethodRepository {
  private pool: Pool;

  constructor(pool: Pool) {
    this.pool = pool;
  }

  async create(userId: string, methodType: string): Promise<PasswordResetMethod> {
    try {
      const query = `
        INSERT INTO ${TABLES.PASSWORD_RESET_METHODS} (user_id, method_type)
        VALUES ($1, $2)
        RETURNING id, user_id as "userId", method_type as "methodType", is_enabled as "isEnabled", created_at as "createdAt", updated_at as "updatedAt"
      `;
      // Note: The legacy code returned snake_case but the interface expects camelCase. 
      // I'm adding aliases to match the interface.
      // Wait, the legacy code returned result.rows[0] directly. 
      // If the interface expects camelCase, the legacy code might have been relying on the driver or manual mapping elsewhere?
      // Let's check the legacy code again.
      // Legacy: RETURNING id, user_id, method_type...
      // Interface: userId, methodType...
      // If the legacy code worked, maybe the interface was matching the DB columns?
      // No, the interface in User.ts has camelCase.
      // Let's look at User.ts again.
      // export interface PasswordResetMethod { userId: string; ... }
      // The legacy repository returned snake_case.
      // This implies there was a mismatch or I missed a mapping step in the legacy service.
      // Let's check PasswordResetService.ts again.
      // It calls `this.passwordResetMethodRepo.findByUserId(userId)`.
      // And returns it.
      // If the frontend expects camelCase, this would be broken unless pg driver is configured to transform case, or I missed something.
      // However, to be safe and correct, I should map it.
      
      const result = await this.pool.query(query, [userId, methodType]);
      return this.mapToDomain(result.rows[0]);
    } catch (error) {
      throw new Error(`Failed to create password reset method: ${(error as Error).message || 'Database insert failed'}`);
    }
  }

  async findByUserId(userId: string): Promise<PasswordResetMethod[]> {
    try {
      const query = `
        SELECT id, user_id, method_type, is_enabled, created_at, updated_at
        FROM ${TABLES.PASSWORD_RESET_METHODS}
        WHERE user_id = $1
        ORDER BY created_at
      `;
      const result = await this.pool.query(query, [userId]);
      return result.rows.map(row => this.mapToDomain(row));
    } catch (error) {
      throw new Error(`Failed to find password reset methods by user ID: ${(error as Error).message || 'Database query failed'}`);
    }
  }

  async enableMethod(userId: string, methodType: string): Promise<boolean> {
    try {
      const query = `
        UPDATE ${TABLES.PASSWORD_RESET_METHODS}
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
        UPDATE ${TABLES.PASSWORD_RESET_METHODS}
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
      const query = `DELETE FROM ${TABLES.PASSWORD_RESET_METHODS} WHERE user_id = $1`;
      const result = await this.pool.query(query, [userId]);
      return (result.rowCount ?? 0) > 0;
    } catch (error) {
      throw new Error(`Failed to delete password reset methods by user ID: ${(error as Error).message || 'Database delete failed'}`);
    }
  }

  private mapToDomain(row: any): PasswordResetMethod {
    return {
      id: row.id,
      userId: row.user_id,
      methodType: row.method_type,
      isEnabled: row.is_enabled,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }
}
