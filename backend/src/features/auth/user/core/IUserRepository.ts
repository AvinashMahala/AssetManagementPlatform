
import { IBaseRepository } from '@/shared/infrastructure/database/IBaseRepository';
import { User, CreateUserParams, UpdateUserParams } from './user.types';

export interface IUserRepository extends IBaseRepository<User, CreateUserParams, UpdateUserParams> {
  findByEmail(email: string): Promise<User | null>;
  findByUsername(username: string): Promise<User | null>;
  findByGoogleId(googleId: string): Promise<User | null>;
  findByEmailVerificationToken(token: string): Promise<User | null>;
  findByPasswordResetToken(token: string): Promise<User | null>;
  
  // Verification
  updateEmailVerificationToken(userId: string, token: string, expiresAt: Date): Promise<boolean>;
  verifyEmail(userId: string): Promise<boolean>;
  storePhoneVerificationCode(userId: string, phone: string, code: string, expiresAt: Date): Promise<boolean>;
  verifyPhoneCode(userId: string, code: string): Promise<boolean>;
  verifyPhone(userId: string): Promise<boolean>;

  // OAuth
  linkGoogleAccount(userId: string, googleId: string, picture?: string): Promise<boolean>;

  // Misc
  updateLastLogin(userId: string): Promise<boolean>;
}
