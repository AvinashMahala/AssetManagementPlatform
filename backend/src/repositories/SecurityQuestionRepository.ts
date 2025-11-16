import { Pool } from 'pg';
import { SecurityQuestion } from '../models/User.js';

export class SecurityQuestionRepository {
  private pool: Pool;

  constructor(pool: Pool) {
    this.pool = pool;
  }

  async create(userId: string, question: string, answerHash: string): Promise<SecurityQuestion> {
    try {
      const query = `
        INSERT INTO security_questions (user_id, question, answer_hash)
        VALUES ($1, $2, $3)
        RETURNING id, user_id, question, answer_hash, created_at, updated_at
      `;
      const result = await this.pool.query(query, [userId, question, answerHash]);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Failed to create security question: ${(error as Error).message || 'Database insert failed'}`);
    }
  }

  async findByUserId(userId: string): Promise<SecurityQuestion[]> {
    try {
      const query = `
        SELECT id, user_id, question, answer_hash, created_at, updated_at
        FROM security_questions
        WHERE user_id = $1
        ORDER BY created_at
      `;
      const result = await this.pool.query(query, [userId]);
      return result.rows;
    } catch (error) {
      throw new Error(`Failed to find security questions by user ID: ${(error as Error).message || 'Database query failed'}`);
    }
  }

  async findByIdAndUserId(id: number, userId: number): Promise<SecurityQuestion | null> {
    try {
      const query = `
        SELECT id, user_id, question, answer_hash, created_at, updated_at
        FROM security_questions
        WHERE id = $1 AND user_id = $2
      `;
      const result = await this.pool.query(query, [id, userId]);
      return result.rows[0] || null;
    } catch (error) {
      throw new Error(`Failed to find security question by ID and user ID: ${(error as Error).message || 'Database query failed'}`);
    }
  }

  async updateAnswer(id: number, userId: number, answerHash: string): Promise<boolean> {
    try {
      const query = `
        UPDATE security_questions
        SET answer_hash = $1, updated_at = CURRENT_TIMESTAMP
        WHERE id = $2 AND user_id = $3
      `;
      const result = await this.pool.query(query, [answerHash, id, userId]);
      return (result.rowCount ?? 0) > 0;
    } catch (error) {
      throw new Error(`Failed to update security question answer: ${(error as Error).message || 'Database update failed'}`);
    }
  }

  async delete(id: number, userId: number): Promise<boolean> {
    try {
      const query = 'DELETE FROM security_questions WHERE id = $1 AND user_id = $2';
      const result = await this.pool.query(query, [id, userId]);
      return (result.rowCount ?? 0) > 0;
    } catch (error) {
      throw new Error(`Failed to delete security question: ${(error as Error).message || 'Database delete failed'}`);
    }
  }

  async deleteByUserId(userId: string): Promise<boolean> {
    try {
      const query = 'DELETE FROM security_questions WHERE user_id = $1';
      const result = await this.pool.query(query, [userId]);
      return (result.rowCount ?? 0) > 0;
    } catch (error) {
      throw new Error(`Failed to delete security questions by user ID: ${(error as Error).message || 'Database delete failed'}`);
    }
  }
}