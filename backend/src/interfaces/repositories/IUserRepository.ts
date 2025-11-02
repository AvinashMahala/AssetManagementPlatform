import { User, UserInput } from '../../models/User';

export interface IUserRepository {
  // Basic CRUD operations
  findAll(): Promise<User[]>;
  findById(id: string): Promise<User | null>;
  findByUsername(username: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  create(data: UserInput): Promise<User>;
  update(id: string, data: Partial<UserInput>): Promise<User | null>;
  delete(id: string): Promise<boolean>;

  // Authentication operations
  findByPhone(phone: string): Promise<User | null>;
  findByGoogleId(googleId: string): Promise<User | null>;
  findByEmailVerificationToken(token: string): Promise<User | null>;
  findByPasswordResetToken(token: string): Promise<User | null>;

  // Update operations
  updateEmailVerificationToken(userId: string, token: string, expiresAt: Date): Promise<boolean>;
  updatePasswordResetToken(userId: string, token: string, expiresAt: Date): Promise<boolean>;
  updatePassword(userId: string, hashedPassword: string): Promise<boolean>;
  updateLastLogin(userId: string): Promise<boolean>;
  clearPasswordResetToken(userId: string): Promise<boolean>;
  verifyEmail(userId: string): Promise<boolean>;
  verifyPhone(userId: string): Promise<boolean>;
  linkGoogleAccount(userId: string, googleId: string, profilePicture?: string): Promise<boolean>;

  // Phone verification operations
  storePhoneVerificationCode(phone: string, code: string, expiresAt: Date): Promise<boolean>;
  verifyPhoneCode(phone: string, code: string): Promise<boolean>;
}