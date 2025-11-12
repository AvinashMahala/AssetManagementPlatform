import { Pool } from 'pg';
import { User, UserInput } from '../models/User';
import { TABLES, COLUMNS, DEFAULTS } from '../constants/database';
import { PasswordUtils } from '../utils/password';
import { IUserRepository } from '../interfaces/repositories/IUserRepository';
import { createModuleLogger } from '../utils/logger.js';

const logger = createModuleLogger('UserRepository');

export class UserRepository implements IUserRepository {
  private pool: Pool;

  constructor(pool: Pool) {
    this.pool = pool;
  }

  // Basic CRUD operations
  async findAll(): Promise<User[]> {
    try {
      logger.debug('Executing findAll query for users');
      const result = await this.pool.query(
        `SELECT ${COLUMNS.USERS.ID}, ${COLUMNS.USERS.USERNAME}, ${COLUMNS.USERS.EMAIL},
                ${COLUMNS.USERS.PHONE}, ${COLUMNS.USERS.ROLE}, ${COLUMNS.USERS.IS_EMAIL_VERIFIED},
                ${COLUMNS.USERS.IS_PHONE_VERIFIED}, ${COLUMNS.USERS.EMAIL_VERIFICATION_TOKEN},
                ${COLUMNS.USERS.EMAIL_VERIFICATION_EXPIRES}, ${COLUMNS.USERS.PASSWORD_RESET_TOKEN},
                ${COLUMNS.USERS.PASSWORD_RESET_EXPIRES}, ${COLUMNS.USERS.GOOGLE_ID},
                ${COLUMNS.USERS.PROFILE_PICTURE}, ${COLUMNS.USERS.LAST_LOGIN},
                ${COLUMNS.USERS.CREATED_AT}, ${COLUMNS.USERS.UPDATED_AT}
         FROM ${TABLES.USERS}`
      );
      logger.info('Successfully fetched all users', { count: result.rows.length });
      return result.rows;
    } catch (error) {
      logger.error('Failed to fetch users', error);
      throw new Error(`Failed to fetch users: ${error.message || 'Database query failed'}`);
    }
  }

  async findById(id: string): Promise<User | null> {
    try {
      logger.debug('Executing findById query for user', { userId: id });
      const result = await this.pool.query(
        `SELECT ${COLUMNS.USERS.ID}, ${COLUMNS.USERS.USERNAME}, ${COLUMNS.USERS.EMAIL},
                ${COLUMNS.USERS.PHONE}, ${COLUMNS.USERS.ROLE}, ${COLUMNS.USERS.IS_EMAIL_VERIFIED},
                ${COLUMNS.USERS.IS_PHONE_VERIFIED}, ${COLUMNS.USERS.EMAIL_VERIFICATION_TOKEN},
                ${COLUMNS.USERS.EMAIL_VERIFICATION_EXPIRES}, ${COLUMNS.USERS.PASSWORD_RESET_TOKEN},
                ${COLUMNS.USERS.PASSWORD_RESET_EXPIRES}, ${COLUMNS.USERS.GOOGLE_ID},
                ${COLUMNS.USERS.PROFILE_PICTURE}, ${COLUMNS.USERS.LAST_LOGIN},
                ${COLUMNS.USERS.CREATED_AT}, ${COLUMNS.USERS.UPDATED_AT}
         FROM ${TABLES.USERS} WHERE ${COLUMNS.USERS.ID} = $1`,
        [id]
      );
      const user = result.rows[0] || null;
      logger.info('User lookup result', { userId: id, found: !!user });
      return user;
    } catch (error) {
      logger.error('Failed to fetch user by ID', error, { userId: id });
      throw new Error(`Failed to fetch user: ${error.message || 'Database query failed'}`);
    }
  }

  async findByUsername(username: string): Promise<User | null> {
    try {
      const result = await this.pool.query(
        `SELECT ${COLUMNS.USERS.ID}, ${COLUMNS.USERS.USERNAME}, ${COLUMNS.USERS.EMAIL},
                ${COLUMNS.USERS.PHONE}, ${COLUMNS.USERS.ROLE}, ${COLUMNS.USERS.IS_EMAIL_VERIFIED},
                ${COLUMNS.USERS.IS_PHONE_VERIFIED}, ${COLUMNS.USERS.EMAIL_VERIFICATION_TOKEN},
                ${COLUMNS.USERS.EMAIL_VERIFICATION_EXPIRES}, ${COLUMNS.USERS.PASSWORD_RESET_TOKEN},
                ${COLUMNS.USERS.PASSWORD_RESET_EXPIRES}, ${COLUMNS.USERS.GOOGLE_ID},
                ${COLUMNS.USERS.PROFILE_PICTURE}, ${COLUMNS.USERS.LAST_LOGIN},
                ${COLUMNS.USERS.CREATED_AT}, ${COLUMNS.USERS.UPDATED_AT}
         FROM ${TABLES.USERS} WHERE ${COLUMNS.USERS.USERNAME} = $1`,
        [username]
      );
      return result.rows[0] || null;
    } catch (error) {
      throw new Error(`Failed to fetch user by username: ${(error as Error).message || 'Database query failed'}`);
    }
  }

  async findByEmail(email: string): Promise<User | null> {
    try {
      const result = await this.pool.query(
        `SELECT ${COLUMNS.USERS.ID}, ${COLUMNS.USERS.USERNAME}, ${COLUMNS.USERS.EMAIL},
                ${COLUMNS.USERS.PASSWORD}, ${COLUMNS.USERS.PHONE}, ${COLUMNS.USERS.ROLE},
                ${COLUMNS.USERS.IS_EMAIL_VERIFIED}, ${COLUMNS.USERS.IS_PHONE_VERIFIED},
                ${COLUMNS.USERS.EMAIL_VERIFICATION_TOKEN}, ${COLUMNS.USERS.EMAIL_VERIFICATION_EXPIRES},
                ${COLUMNS.USERS.PASSWORD_RESET_TOKEN}, ${COLUMNS.USERS.PASSWORD_RESET_EXPIRES},
                ${COLUMNS.USERS.GOOGLE_ID}, ${COLUMNS.USERS.PROFILE_PICTURE},
                ${COLUMNS.USERS.LAST_LOGIN}, ${COLUMNS.USERS.CREATED_AT}, ${COLUMNS.USERS.UPDATED_AT}
         FROM ${TABLES.USERS} WHERE ${COLUMNS.USERS.EMAIL} = $1`,
        [email]
      );
      return result.rows[0] || null;
    } catch (error) {
      console.error('❌ Error in findByEmail:', error);
      throw new Error(`Failed to fetch user by email: ${(error as Error).message || 'Database query failed'}`);
    }
  }

  async findByPhone(phone: string): Promise<User | null> {
    try {
      const result = await this.pool.query(
        `SELECT ${COLUMNS.USERS.ID}, ${COLUMNS.USERS.USERNAME}, ${COLUMNS.USERS.EMAIL},
                ${COLUMNS.USERS.PHONE}, ${COLUMNS.USERS.ROLE}, ${COLUMNS.USERS.IS_EMAIL_VERIFIED},
                ${COLUMNS.USERS.IS_PHONE_VERIFIED}, ${COLUMNS.USERS.EMAIL_VERIFICATION_TOKEN},
                ${COLUMNS.USERS.EMAIL_VERIFICATION_EXPIRES}, ${COLUMNS.USERS.PASSWORD_RESET_TOKEN},
                ${COLUMNS.USERS.PASSWORD_RESET_EXPIRES}, ${COLUMNS.USERS.GOOGLE_ID},
                ${COLUMNS.USERS.PROFILE_PICTURE}, ${COLUMNS.USERS.LAST_LOGIN},
                ${COLUMNS.USERS.CREATED_AT}, ${COLUMNS.USERS.UPDATED_AT}
         FROM ${TABLES.USERS} WHERE ${COLUMNS.USERS.PHONE} = $1`,
        [phone]
      );
      return result.rows[0] || null;
    } catch (error) {
      throw new Error(`Failed to fetch user by phone: ${(error as Error).message || 'Database query failed'}`);
    }
  }

  async findByGoogleId(googleId: string): Promise<User | null> {
    try {
      const result = await this.pool.query(
        `SELECT ${COLUMNS.USERS.ID}, ${COLUMNS.USERS.USERNAME}, ${COLUMNS.USERS.EMAIL},
                ${COLUMNS.USERS.PHONE}, ${COLUMNS.USERS.ROLE}, ${COLUMNS.USERS.IS_EMAIL_VERIFIED},
                ${COLUMNS.USERS.IS_PHONE_VERIFIED}, ${COLUMNS.USERS.EMAIL_VERIFICATION_TOKEN},
                ${COLUMNS.USERS.EMAIL_VERIFICATION_EXPIRES}, ${COLUMNS.USERS.PASSWORD_RESET_TOKEN},
                ${COLUMNS.USERS.PASSWORD_RESET_EXPIRES}, ${COLUMNS.USERS.GOOGLE_ID},
                ${COLUMNS.USERS.PROFILE_PICTURE}, ${COLUMNS.USERS.LAST_LOGIN},
                ${COLUMNS.USERS.CREATED_AT}, ${COLUMNS.USERS.UPDATED_AT}
         FROM ${TABLES.USERS} WHERE ${COLUMNS.USERS.GOOGLE_ID} = $1`,
        [googleId]
      );
      return result.rows[0] || null;
    } catch (error) {
      throw new Error(`Failed to fetch user by Google ID: ${(error as Error).message || 'Database query failed'}`);
    }
  }

  async findByEmailVerificationToken(token: string): Promise<User | null> {
    try {
      const result = await this.pool.query(
        `SELECT ${COLUMNS.USERS.ID}, ${COLUMNS.USERS.USERNAME}, ${COLUMNS.USERS.EMAIL},
                ${COLUMNS.USERS.PHONE}, ${COLUMNS.USERS.ROLE}, ${COLUMNS.USERS.IS_EMAIL_VERIFIED},
                ${COLUMNS.USERS.IS_PHONE_VERIFIED}, ${COLUMNS.USERS.EMAIL_VERIFICATION_TOKEN},
                ${COLUMNS.USERS.EMAIL_VERIFICATION_EXPIRES}, ${COLUMNS.USERS.PASSWORD_RESET_TOKEN},
                ${COLUMNS.USERS.PASSWORD_RESET_EXPIRES}, ${COLUMNS.USERS.GOOGLE_ID},
                ${COLUMNS.USERS.PROFILE_PICTURE}, ${COLUMNS.USERS.LAST_LOGIN},
                ${COLUMNS.USERS.CREATED_AT}, ${COLUMNS.USERS.UPDATED_AT}
         FROM ${TABLES.USERS} WHERE ${COLUMNS.USERS.EMAIL_VERIFICATION_TOKEN} = $1`,
        [token]
      );
      return result.rows[0] || null;
    } catch (error) {
      throw new Error(`Failed to fetch user by email verification token: ${(error as Error).message || 'Database query failed'}`);
    }
  }

  async findByPasswordResetToken(token: string): Promise<User | null> {
    try {
      const result = await this.pool.query(
        `SELECT ${COLUMNS.USERS.ID}, ${COLUMNS.USERS.USERNAME}, ${COLUMNS.USERS.EMAIL},
                ${COLUMNS.USERS.PHONE}, ${COLUMNS.USERS.ROLE}, ${COLUMNS.USERS.IS_EMAIL_VERIFIED},
                ${COLUMNS.USERS.IS_PHONE_VERIFIED}, ${COLUMNS.USERS.EMAIL_VERIFICATION_TOKEN},
                ${COLUMNS.USERS.EMAIL_VERIFICATION_EXPIRES}, ${COLUMNS.USERS.PASSWORD_RESET_TOKEN},
                ${COLUMNS.USERS.PASSWORD_RESET_EXPIRES}, ${COLUMNS.USERS.GOOGLE_ID},
                ${COLUMNS.USERS.PROFILE_PICTURE}, ${COLUMNS.USERS.LAST_LOGIN},
                ${COLUMNS.USERS.CREATED_AT}, ${COLUMNS.USERS.UPDATED_AT}
         FROM ${TABLES.USERS} WHERE ${COLUMNS.USERS.PASSWORD_RESET_TOKEN} = $1`,
        [token]
      );
      return result.rows[0] || null;
    } catch (error) {
      throw new Error(`Failed to fetch user by password reset token: ${(error as Error).message || 'Database query failed'}`);
    }
  }

  async create(data: any): Promise<User> {
    try {
      // Check if password needs hashing (not already hashed)
      const password = data.password && !data.password.startsWith('$2b$') 
        ? await PasswordUtils.hashPassword(data.password)
        : data.password;
      
      const result = await this.pool.query(
        `INSERT INTO ${TABLES.USERS} (
          ${COLUMNS.USERS.USERNAME}, ${COLUMNS.USERS.EMAIL}, ${COLUMNS.USERS.PASSWORD},
          ${COLUMNS.USERS.PHONE}, ${COLUMNS.USERS.ROLE}, ${COLUMNS.USERS.IS_EMAIL_VERIFIED},
          ${COLUMNS.USERS.IS_PHONE_VERIFIED}, ${COLUMNS.USERS.GOOGLE_ID},
          ${COLUMNS.USERS.PROFILE_PICTURE}, name
        )
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
         RETURNING ${COLUMNS.USERS.ID}, ${COLUMNS.USERS.USERNAME}, ${COLUMNS.USERS.EMAIL},
                   ${COLUMNS.USERS.PHONE}, ${COLUMNS.USERS.ROLE}, ${COLUMNS.USERS.IS_EMAIL_VERIFIED},
                   ${COLUMNS.USERS.IS_PHONE_VERIFIED}, ${COLUMNS.USERS.GOOGLE_ID},
                   ${COLUMNS.USERS.PROFILE_PICTURE}, name, ${COLUMNS.USERS.CREATED_AT}, ${COLUMNS.USERS.UPDATED_AT}`,
        [
          data.username,
          data.email,
          password,
          data.phone || null,
          data.role || DEFAULTS.USER_ROLE,
          data.isEmailVerified || false,
          data.isPhoneVerified || false,
          data.googleId || null,
          data.profilePicture || null,
          data.name || null
        ]
      );
      return result.rows[0];
    } catch (error) {
      throw new Error(`Failed to create user: ${(error as Error).message || 'Database insert failed'}`);
    }
  }

  async update(id: string, data: Partial<UserInput>): Promise<User | null> {
    try {
      const updates: string[] = [];
      const values: any[] = [];

      if (data.username) {
        updates.push(`${COLUMNS.USERS.USERNAME} = $${updates.length + 1}`);
        values.push(data.username);
      }
      if (data.email) {
        updates.push(`${COLUMNS.USERS.EMAIL} = $${updates.length + 1}`);
        values.push(data.email);
      }
      if (data.password) {
        const hashedPassword = await PasswordUtils.hashPassword(data.password);
        updates.push(`${COLUMNS.USERS.PASSWORD} = $${updates.length + 1}`);
        values.push(hashedPassword);
      }
      if (data.phone !== undefined) {
        updates.push(`${COLUMNS.USERS.PHONE} = $${updates.length + 1}`);
        values.push(data.phone);
      }
      if (data.role) {
        updates.push(`${COLUMNS.USERS.ROLE} = $${updates.length + 1}`);
        values.push(data.role);
      }

      if (updates.length === 0) return null;

      const query = `UPDATE ${TABLES.USERS} SET ${updates.join(', ')}, ${COLUMNS.USERS.UPDATED_AT} = NOW()
                     WHERE ${COLUMNS.USERS.ID} = $${updates.length + 1}
                     RETURNING ${COLUMNS.USERS.ID}, ${COLUMNS.USERS.USERNAME}, ${COLUMNS.USERS.EMAIL},
                               ${COLUMNS.USERS.PHONE}, ${COLUMNS.USERS.ROLE}, ${COLUMNS.USERS.IS_EMAIL_VERIFIED},
                               ${COLUMNS.USERS.IS_PHONE_VERIFIED}, ${COLUMNS.USERS.CREATED_AT}, ${COLUMNS.USERS.UPDATED_AT}`;
      values.push(id);

      const result = await this.pool.query(query, values);
      return result.rows[0] || null;
    } catch (error) {
      throw new Error(`Failed to update user: ${(error as Error).message || 'Database update failed'}`);
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      const result = await this.pool.query(
        `DELETE FROM ${TABLES.USERS} WHERE ${COLUMNS.USERS.ID} = $1`,
        [id]
      );
      return (result.rowCount ?? 0) > 0;
    } catch (error) {
      throw new Error(`Failed to delete user: ${(error as Error).message || 'Database delete failed'}`);
    }
  }

  // Authentication-specific update methods
  async updateEmailVerificationToken(userId: string, token: string, expiresAt: Date): Promise<boolean> {
    try {
      const result = await this.pool.query(
        `UPDATE ${TABLES.USERS} SET ${COLUMNS.USERS.EMAIL_VERIFICATION_TOKEN} = $1,
                ${COLUMNS.USERS.EMAIL_VERIFICATION_EXPIRES} = $2, ${COLUMNS.USERS.UPDATED_AT} = NOW()
         WHERE ${COLUMNS.USERS.ID} = $3`,
        [token, expiresAt, userId]
      );
      return (result.rowCount ?? 0) > 0;
    } catch (error) {
      throw new Error(`Failed to update email verification token: ${(error as Error).message || 'Database update failed'}`);
    }
  }

  async updatePasswordResetToken(userId: string, token: string, expiresAt: Date): Promise<boolean> {
    try {
      const result = await this.pool.query(
        `UPDATE ${TABLES.USERS} SET ${COLUMNS.USERS.PASSWORD_RESET_TOKEN} = $1,
                ${COLUMNS.USERS.PASSWORD_RESET_EXPIRES} = $2, ${COLUMNS.USERS.UPDATED_AT} = NOW()
         WHERE ${COLUMNS.USERS.ID} = $3`,
        [token, expiresAt, userId]
      );
      return (result.rowCount ?? 0) > 0;
    } catch (error) {
      throw new Error(`Failed to update password reset token: ${(error as Error).message || 'Database update failed'}`);
    }
  }

  async updatePassword(userId: string, hashedPassword: string): Promise<boolean> {
    try {
      const result = await this.pool.query(
        `UPDATE ${TABLES.USERS} SET ${COLUMNS.USERS.PASSWORD} = $1, ${COLUMNS.USERS.UPDATED_AT} = NOW()
         WHERE ${COLUMNS.USERS.ID} = $2`,
        [hashedPassword, userId]
      );
      return (result.rowCount ?? 0) > 0;
    } catch (error) {
      throw new Error(`Failed to update password: ${(error as Error).message || 'Database update failed'}`);
    }
  }

  async updateLastLogin(userId: string): Promise<boolean> {
    try {
      const result = await this.pool.query(
        `UPDATE ${TABLES.USERS} SET ${COLUMNS.USERS.LAST_LOGIN} = NOW(), ${COLUMNS.USERS.UPDATED_AT} = NOW()
         WHERE ${COLUMNS.USERS.ID} = $1`,
        [userId]
      );
      return (result.rowCount ?? 0) > 0;
    } catch (error) {
      throw new Error(`Failed to update last login: ${(error as Error).message || 'Database update failed'}`);
    }
  }

  async clearPasswordResetToken(userId: string): Promise<boolean> {
    try {
      const result = await this.pool.query(
        `UPDATE ${TABLES.USERS} SET ${COLUMNS.USERS.PASSWORD_RESET_TOKEN} = NULL,
                ${COLUMNS.USERS.PASSWORD_RESET_EXPIRES} = NULL, ${COLUMNS.USERS.UPDATED_AT} = NOW()
         WHERE ${COLUMNS.USERS.ID} = $1`,
        [userId]
      );
      return (result.rowCount ?? 0) > 0;
    } catch (error) {
      throw new Error(`Failed to clear password reset token: ${(error as Error).message || 'Database update failed'}`);
    }
  }

  async verifyEmail(userId: string): Promise<boolean> {
    try {
      const result = await this.pool.query(
        `UPDATE ${TABLES.USERS} SET ${COLUMNS.USERS.IS_EMAIL_VERIFIED} = true,
                ${COLUMNS.USERS.EMAIL_VERIFICATION_TOKEN} = NULL,
                ${COLUMNS.USERS.EMAIL_VERIFICATION_EXPIRES} = NULL, ${COLUMNS.USERS.UPDATED_AT} = NOW()
         WHERE ${COLUMNS.USERS.ID} = $1`,
        [userId]
      );
      return (result.rowCount ?? 0) > 0;
    } catch (error) {
      throw new Error(`Failed to verify email: ${(error as Error).message || 'Database update failed'}`);
    }
  }

  async verifyPhone(userId: string): Promise<boolean> {
    try {
      const result = await this.pool.query(
        `UPDATE ${TABLES.USERS} SET ${COLUMNS.USERS.IS_PHONE_VERIFIED} = true, ${COLUMNS.USERS.UPDATED_AT} = NOW()
         WHERE ${COLUMNS.USERS.ID} = $1`,
        [userId]
      );
      return (result.rowCount ?? 0) > 0;
    } catch (error) {
      throw new Error(`Failed to verify phone: ${(error as Error).message || 'Database update failed'}`);
    }
  }

  async linkGoogleAccount(userId: string, googleId: string, profilePicture?: string): Promise<boolean> {
    try {
      const result = await this.pool.query(
        `UPDATE ${TABLES.USERS} SET ${COLUMNS.USERS.GOOGLE_ID} = $1,
                ${COLUMNS.USERS.PROFILE_PICTURE} = COALESCE($2, ${COLUMNS.USERS.PROFILE_PICTURE}),
                ${COLUMNS.USERS.IS_EMAIL_VERIFIED} = true, ${COLUMNS.USERS.UPDATED_AT} = NOW()
         WHERE ${COLUMNS.USERS.ID} = $3`,
        [googleId, profilePicture, userId]
      );
      return (result.rowCount ?? 0) > 0;
    } catch (error) {
      throw new Error(`Failed to link Google account: ${(error as Error).message || 'Database update failed'}`);
    }
  }

  // Phone verification operations
  async storePhoneVerificationCode(phone: string, code: string, expiresAt: Date): Promise<boolean> {
    try {
      // For now, we'll store this in a simple in-memory store or database table
      // In production, you'd want a dedicated table for phone verification codes
      // For simplicity, we'll use a temporary approach
      const result = await this.pool.query(
        `INSERT INTO phone_verification_codes (phone, code, expires_at, created_at)
         VALUES ($1, $2, $3, NOW())
         ON CONFLICT (phone) DO UPDATE SET code = $2, expires_at = $3, created_at = NOW()`,
        [phone, code, expiresAt]
      );
      return (result.rowCount ?? 0) > 0;
    } catch (error) {
      throw new Error(`Failed to store phone verification code: ${(error as Error).message || 'Database insert failed'}`);
    }
  }

  async verifyPhoneCode(phone: string, code: string): Promise<boolean> {
    try {
      const result = await this.pool.query(
        `SELECT code, expires_at FROM phone_verification_codes
         WHERE phone = $1 AND expires_at > NOW()`,
        [phone]
      );

      if (result.rows.length === 0) {
        return false;
      }

      const storedCode = result.rows[0].code;
      if (storedCode === code) {
        // Delete the used code
        await this.pool.query(`DELETE FROM phone_verification_codes WHERE phone = $1`, [phone]);
        return true;
      }

      return false;
    } catch (error) {
      throw new Error(`Failed to verify phone code: ${(error as Error).message || 'Database query failed'}`);
    }
  }
}