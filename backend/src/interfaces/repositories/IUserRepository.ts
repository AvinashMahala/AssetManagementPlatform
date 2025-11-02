import { User, UserInput } from '../../models/User';

export interface IUserRepository {
  // Basic CRUD operations
  findAll(): Promise<User[]>;
  findById(id: number): Promise<User | null>;
  findByUsername(username: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  create(data: UserInput): Promise<User>;
  update(id: number, data: Partial<UserInput>): Promise<User | null>;
  delete(id: number): Promise<boolean>;

  // Authentication operations
  findByPhone(phone: string): Promise<User | null>;
  findByGoogleId(googleId: string): Promise<User | null>;
  findByEmailVerificationToken(token: string): Promise<User | null>;
  findByPasswordResetToken(token: string): Promise<User | null>;

  // Update operations
  updateEmailVerificationToken(userId: number, token: string, expiresAt: Date): Promise<boolean>;
  updatePasswordResetToken(userId: number, token: string, expiresAt: Date): Promise<boolean>;
  updatePassword(userId: number, hashedPassword: string): Promise<boolean>;
  updateLastLogin(userId: number): Promise<boolean>;
  clearPasswordResetToken(userId: number): Promise<boolean>;
  verifyEmail(userId: number): Promise<boolean>;
  verifyPhone(userId: number): Promise<boolean>;
  linkGoogleAccount(userId: number, googleId: string, profilePicture?: string): Promise<boolean>;

  // Phone verification operations
  storePhoneVerificationCode(phone: string, code: string, expiresAt: Date): Promise<boolean>;
  verifyPhoneCode(phone: string, code: string): Promise<boolean>;
}