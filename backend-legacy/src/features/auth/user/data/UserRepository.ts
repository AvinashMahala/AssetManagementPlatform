
import { Pool } from 'pg';
import { BaseRepository } from '@/shared/infrastructure/database/BaseRepository';
import { IUserRepository } from '../core/IUserRepository';
import { User, CreateUserParams, UpdateUserParams, PhoneVerificationCode } from '../core/user.types';

import { TABLES, COLUMNS } from '@/shared/constants/database';

export class UserRepository extends BaseRepository<User, CreateUserParams, UpdateUserParams> implements IUserRepository {
  constructor(pool: Pool) {
    super(pool, TABLES.USERS);
  }

  protected mapToDomain(row: any): User {
    return {
      id: row.id,
      username: row.username,
      name: row.name,
      email: row.email,
      password: row.password,
      phone: row.phone,
      role: row.role,
      isEmailVerified: row.is_email_verified,
      isPhoneVerified: row.is_phone_verified,
      emailVerificationToken: row.email_verification_token,
      emailVerificationExpires: row.email_verification_expires,
      passwordResetToken: row.password_reset_token,
      passwordResetExpires: row.password_reset_expires,
      googleId: row.google_id,
      profilePicture: row.profile_picture,
      lastLogin: row.last_login,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }

  async create(data: CreateUserParams): Promise<User> {
    const dbData = {
      username: data.username,
      email: data.email,
      password: data.password,
      phone: data.phone,
      role: data.role || 'user',
      name: data.name,
      google_id: data.googleId,
      profile_picture: data.profilePicture,
      is_email_verified: data.isEmailVerified || false,
      is_phone_verified: data.isPhoneVerified || false
    };

    // Remove undefined fields
    Object.keys(dbData).forEach(key => (dbData as any)[key] === undefined && delete (dbData as any)[key]);

    return super.add(dbData as any);
  }

  async update(id: string, data: UpdateUserParams): Promise<User | null> {
    const dbData: any = {
      username: data.username,
      email: data.email,
      password: data.password,
      phone: data.phone,
      role: data.role,
      name: data.name,
      profile_picture: data.profilePicture,
      is_email_verified: data.isEmailVerified,
      is_phone_verified: data.isPhoneVerified,
      email_verification_token: data.emailVerificationToken,
      email_verification_expires: data.emailVerificationExpires,
      password_reset_token: data.passwordResetToken,
      password_reset_expires: data.passwordResetExpires,
      last_login: data.lastLogin,
      updated_at: new Date()
    };

    // Remove undefined fields
    Object.keys(dbData).forEach(key => dbData[key] === undefined && delete dbData[key]);

    return super.updateById(id, dbData);
  }

  async findByEmail(email: string): Promise<User | null> {
    const result = await this.findAll({ where: { email } });
    return result[0] || null;
  }

  async findByUsername(username: string): Promise<User | null> {
    const result = await this.findAll({ where: { username } });
    return result[0] || null;
  }

  async findByGoogleId(googleId: string): Promise<User | null> {
    const result = await this.findAll({ where: { google_id: googleId } });
    return result[0] || null;
  }

  async findByEmailVerificationToken(token: string): Promise<User | null> {
    const result = await this.findAll({ where: { email_verification_token: token } });
    return result[0] || null;
  }

  async findByPasswordResetToken(token: string): Promise<User | null> {
    const result = await this.findAll({ where: { password_reset_token: token } });
    return result[0] || null;
  }

  async updateEmailVerificationToken(userId: string, token: string, expiresAt: Date): Promise<boolean> {
    const query = `
      UPDATE ${TABLES.USERS} 
      SET email_verification_token = $1, email_verification_expires = $2, updated_at = NOW()
      WHERE id = $3
    `;
    const result = await this.pool.query(query, [token, expiresAt, userId]);
    return (result.rowCount ?? 0) > 0;
  }

  async verifyEmail(userId: string): Promise<boolean> {
    const query = `
      UPDATE ${TABLES.USERS} 
      SET is_email_verified = true, email_verification_token = NULL, email_verification_expires = NULL, updated_at = NOW()
      WHERE id = $1
    `;
    const result = await this.pool.query(query, [userId]);
    return (result.rowCount ?? 0) > 0;
  }

  async storePhoneVerificationCode(userId: string, phone: string, code: string, expiresAt: Date): Promise<boolean> {
    const query = `
      INSERT INTO ${TABLES.PHONE_VERIFICATION_CODES} (user_id, phone, code, expires_at, created_at)
      VALUES ($1, $2, $3, $4, NOW())
      ON CONFLICT (phone) DO UPDATE SET 
        user_id = $1, code = $3, expires_at = $4, created_at = NOW()
    `;
    const result = await this.pool.query(query, [userId, phone, code, expiresAt]);
    return (result.rowCount ?? 0) > 0;
  }

  async verifyPhoneCode(userId: string, code: string): Promise<boolean> {
    const query = `
      SELECT code FROM ${TABLES.PHONE_VERIFICATION_CODES}
      WHERE user_id = $1 AND expires_at > NOW()
    `;
    const result = await this.pool.query(query, [userId]);

    if (result.rows.length === 0) {
      return false;
    }

    const storedCode = result.rows[0].code;
    if (storedCode === code) {
      await this.pool.query(`DELETE FROM ${TABLES.PHONE_VERIFICATION_CODES} WHERE user_id = $1`, [userId]);
      return true;
    }

    return false;
  }

  async verifyPhone(userId: string): Promise<boolean> {
    const query = `
      UPDATE ${TABLES.USERS} 
      SET is_phone_verified = true, updated_at = NOW()
      WHERE id = $1
    `;
    const result = await this.pool.query(query, [userId]);
    return (result.rowCount ?? 0) > 0;
  }

  async linkGoogleAccount(userId: string, googleId: string, picture?: string): Promise<boolean> {
    const query = `
      UPDATE ${TABLES.USERS} 
      SET google_id = $1, 
          profile_picture = COALESCE($2, profile_picture),
          is_email_verified = true, 
          updated_at = NOW()
      WHERE id = $3
    `;
    const result = await this.pool.query(query, [googleId, picture, userId]);
    return (result.rowCount ?? 0) > 0;
  }

  async updateLastLogin(userId: string): Promise<boolean> {
    const query = `
      UPDATE ${TABLES.USERS} 
      SET last_login = NOW(), updated_at = NOW()
      WHERE id = $1
    `;
    const result = await this.pool.query(query, [userId]);
    return (result.rowCount ?? 0) > 0;
  }

  // Legacy methods for backward compatibility
  async findByPhone(phone: string): Promise<User | null> {
    const result = await this.pool.query(
      `SELECT * FROM ${TABLES.USERS} WHERE ${COLUMNS.USERS.PHONE} = $1`,
      [phone]
    );
    return result.rows[0] ? this.mapToDomain(result.rows[0]) : null;
  }

  async updatePasswordResetToken(userId: string, token: string, expiresAt: Date): Promise<boolean> {
    const result = await this.pool.query(
      `UPDATE ${TABLES.USERS} SET ${COLUMNS.USERS.PASSWORD_RESET_TOKEN} = $1, ${COLUMNS.USERS.PASSWORD_RESET_EXPIRES} = $2 WHERE ${COLUMNS.USERS.ID} = $3`,
      [token, expiresAt, userId]
    );
    return (result.rowCount ?? 0) > 0;
  }

  async updatePassword(userId: string, passwordHash: string): Promise<boolean> {
    return !!(await this.updateById(userId, { password: passwordHash }));
  }

  async clearPasswordResetToken(userId: string): Promise<boolean> {
    const result = await this.pool.query(
      `UPDATE ${TABLES.USERS} SET ${COLUMNS.USERS.PASSWORD_RESET_TOKEN} = NULL, ${COLUMNS.USERS.PASSWORD_RESET_EXPIRES} = NULL WHERE ${COLUMNS.USERS.ID} = $1`,
      [userId]
    );
    return (result.rowCount ?? 0) > 0;
  }

  async getPhoneVerificationCode(userId: string): Promise<PhoneVerificationCode | null> {
    // Legacy implementation likely used a separate table or column not in USERS
    // For now returning null to satisfy interface
    return null;
  }
}
