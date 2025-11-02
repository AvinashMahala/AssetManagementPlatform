import { Pool } from 'pg';
import { SecurityQuestion } from '../models/User.js';

export class SecurityQuestionRepository {
  private pool: Pool;

  constructor(pool: Pool) {
    this.pool = pool;
  }

  async create(userId: string, question: string, answerHash: string): Promise<SecurityQuestion> {
    const query = `
      INSERT INTO security_questions (user_id, question, answer_hash)
      VALUES ($1, $2, $3)
      RETURNING id, user_id, question, answer_hash, created_at, updated_at
    `;
    const result = await this.pool.query(query, [userId, question, answerHash]);
    return result.rows[0];
  }

  async findByUserId(userId: string): Promise<SecurityQuestion[]> {
    const query = `
      SELECT id, user_id, question, answer_hash, created_at, updated_at
      FROM security_questions
      WHERE user_id = $1
      ORDER BY created_at
    `;
    const result = await this.pool.query(query, [userId]);
    return result.rows;
  }

  async findByIdAndUserId(id: number, userId: number): Promise<SecurityQuestion | null> {
    const query = `
      SELECT id, user_id, question, answer_hash, created_at, updated_at
      FROM security_questions
      WHERE id = $1 AND user_id = $2
    `;
    const result = await this.pool.query(query, [id, userId]);
    return result.rows[0] || null;
  }

  async updateAnswer(id: number, userId: number, answerHash: string): Promise<boolean> {
    const query = `
      UPDATE security_questions
      SET answer_hash = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2 AND user_id = $3
    `;
    const result = await this.pool.query(query, [answerHash, id, userId]);
    return (result.rowCount ?? 0) > 0;
  }

  async delete(id: number, userId: number): Promise<boolean> {
    const query = 'DELETE FROM security_questions WHERE id = $1 AND user_id = $2';
    const result = await this.pool.query(query, [id, userId]);
    return (result.rowCount ?? 0) > 0;
  }

  async deleteByUserId(userId: string): Promise<boolean> {
    const query = 'DELETE FROM security_questions WHERE user_id = $1';
    const result = await this.pool.query(query, [userId]);
    return (result.rowCount ?? 0) > 0;
  }
}