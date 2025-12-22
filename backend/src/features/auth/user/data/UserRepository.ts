
import { Pool } from 'pg';
import { BaseRepository } from '@/shared/infrastructure/database/BaseRepository';
import { IUserRepository } from '../core/IUserRepository';
import { User, CreateUserParams, UpdateUserParams } from '../core/user.types';
import { TABLES } from '@/shared/constants/database';

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
}
