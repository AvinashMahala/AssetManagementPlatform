import { Pool } from 'pg';
import { SecurityQuestion } from '../core/auth.types';
import { TABLES } from '@/shared/constants/database';

export class SecurityQuestionRepository {
  private pool: Pool;

  constructor(pool: Pool) {
    this.pool = pool;
  }

  async create(userId: string, question: string, answerHash: string): Promise<SecurityQuestion> {
    try {
      const query = `
        INSERT INTO ${TABLES.SECURITY_QUESTIONS} (user_id, question, answer_hash)
        VALUES ($1, $2, $3)
        RETURNING id, user_id, question, answer_hash, created_at, updated_at
      `;
      const result = await this.pool.query(query, [userId, question, answerHash]);
      return this.mapToDomain(result.rows[0]);
    } catch (error) {
      throw new Error(`Failed to create security question: ${(error as Error).message || 'Database insert failed'}`);
    }
  }

  async findByUserId(userId: string): Promise<SecurityQuestion[]> {
    try {
      const query = `
        SELECT id, user_id, question, answer_hash, created_at, updated_at
        FROM ${TABLES.SECURITY_QUESTIONS}
        WHERE user_id = $1
        ORDER BY created_at
      `;
      const result = await this.pool.query(query, [userId]);
      return result.rows.map(row => this.mapToDomain(row));
    } catch (error) {
      throw new Error(`Failed to find security questions by user ID: ${(error as Error).message || 'Database query failed'}`);
    }
  }

  async findByIdAndUserId(id: string, userId: string): Promise<SecurityQuestion | null> {
    try {
      const query = `
        SELECT id, user_id, question, answer_hash, created_at, updated_at
        FROM ${TABLES.SECURITY_QUESTIONS}
        WHERE id = $1 AND user_id = $2
      `;
      const result = await this.pool.query(query, [id, userId]);
      return result.rows[0] ? this.mapToDomain(result.rows[0]) : null;
    } catch (error) {
      throw new Error(`Failed to find security question by ID and user ID: ${(error as Error).message || 'Database query failed'}`);
    }
  }

  async updateAnswer(id: string, userId: string, answerHash: string): Promise<boolean> {
    try {
      const query = `
        UPDATE ${TABLES.SECURITY_QUESTIONS}
        SET answer_hash = $1, updated_at = CURRENT_TIMESTAMP
        WHERE id = $2 AND user_id = $3
      `;
      const result = await this.pool.query(query, [answerHash, id, userId]);
      return (result.rowCount ?? 0) > 0;
    } catch (error) {
      throw new Error(`Failed to update security question answer: ${(error as Error).message || 'Database update failed'}`);
    }
  }

  async delete(id: string, userId: string): Promise<boolean> {
    try {
      const query = `DELETE FROM ${TABLES.SECURITY_QUESTIONS} WHERE id = $1 AND user_id = $2`;
      const result = await this.pool.query(query, [id, userId]);
      return (result.rowCount ?? 0) > 0;
    } catch (error) {
      throw new Error(`Failed to delete security question: ${(error as Error).message || 'Database delete failed'}`);
    }
  }

  async deleteByUserId(userId: string): Promise<boolean> {
    try {
      const query = `DELETE FROM ${TABLES.SECURITY_QUESTIONS} WHERE user_id = $1`;
      const result = await this.pool.query(query, [userId]);
      return (result.rowCount ?? 0) > 0;
    } catch (error) {
      throw new Error(`Failed to delete security questions by user ID: ${(error as Error).message || 'Database delete failed'}`);
    }
  }

  private mapToDomain(row: any): SecurityQuestion {
    return {
      id: row.id,
      userId: row.user_id,
      question: row.question,
      answerHash: row.answer_hash,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }
}
