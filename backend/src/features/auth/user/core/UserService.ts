import { IUserRepository } from './IUserRepository';
import { User, CreateUserParams, UpdateUserParams } from './user.types';
import { ValidationUtils } from '@/shared/utils/validation';
import { ERROR_MESSAGES } from '@/shared/constants/validation';
import { PasswordUtils } from '@/shared/utils/password';
import { IUserService } from '@/interfaces/services/IUserService';
import { UserCredentials, UserRegistrationInput, GoogleUserProfile, AuthResponse } from '@/models/User';

export class UserService implements IUserService {
  constructor(private readonly repository: IUserRepository) {}

  async getAllUsers(): Promise<User[]> {
    return this.repository.findAll();
  }

  async getUserById(id: string): Promise<User | null> {
    return this.repository.findById(id);
  }

  async getUserByEmail(email: string): Promise<User | null> {
    return this.repository.findByEmail(email);
  }

  async createUser(data: CreateUserParams): Promise<User> {
    // Validate username
    const usernameValidation = ValidationUtils.validateUsername(data.username);
    if (!usernameValidation.isValid) {
      throw new Error(usernameValidation.message);
    }

    // Validate email
    const emailValidation = ValidationUtils.validateEmail(data.email);
    if (!emailValidation.isValid) {
      throw new Error(emailValidation.message);
    }

    // Check if user exists
    const existingUser = await this.repository.findByEmail(data.email);
    if (existingUser) {
      throw new Error(ERROR_MESSAGES.USER.EMAIL_EXISTS);
    }

    const existingUsername = await this.repository.findByUsername(data.username);
    if (existingUsername) {
      throw new Error(ERROR_MESSAGES.USER.USERNAME_EXISTS);
    }

    // Hash password if provided
    if (data.password) {
      const passwordValidation = PasswordUtils.validatePasswordStrength(data.password);
      if (!passwordValidation.isValid) {
        throw new Error(passwordValidation.message);
      }
      data.password = await PasswordUtils.hashPassword(data.password);
    }

    return this.repository.add(data);
  }

  async updateUser(id: string, data: UpdateUserParams): Promise<User | null> {
    // Hash password if provided
    if (data.password) {
      const passwordValidation = PasswordUtils.validatePasswordStrength(data.password);
      if (!passwordValidation.isValid) {
        throw new Error(passwordValidation.message);
      }
      data.password = await PasswordUtils.hashPassword(data.password);
    }

    return this.repository.updateById(id, data);
  }

  async deleteUser(id: string): Promise<boolean> {
    return this.repository.delete(id);
  }

  // Stubs for legacy IUserService
  async authenticateUser(credentials: UserCredentials): Promise<User | null> { throw new Error('Method not implemented. Use AuthService.'); }
  async registerUser(userData: UserRegistrationInput): Promise<User> { throw new Error('Method not implemented. Use AuthService.'); }
  async loginUser(credentials: UserCredentials): Promise<AuthResponse | null> { throw new Error('Method not implemented. Use AuthService.'); }
  async logoutUser(userId: string): Promise<boolean> { throw new Error('Method not implemented. Use AuthService.'); }
  async requestEmailVerification(userId: string): Promise<string> { throw new Error('Method not implemented. Use AuthService.'); }
  async verifyEmail(token: string): Promise<boolean> { throw new Error('Method not implemented. Use AuthService.'); }
  async resendEmailVerification(email: string): Promise<boolean> { throw new Error('Method not implemented. Use AuthService.'); }
  async requestPhoneVerification(userId: string, phone: string): Promise<string> { throw new Error('Method not implemented. Use AuthService.'); }
  async verifyPhone(userId: string, code: string): Promise<boolean> { throw new Error('Method not implemented. Use AuthService.'); }
  async findOrCreateGoogleUser(profile: GoogleUserProfile): Promise<User> { throw new Error('Method not implemented. Use AuthService.'); }
  async linkGoogleAccount(userId: string, googleId: string): Promise<boolean> { throw new Error('Method not implemented. Use AuthService.'); }
  async generateAuthTokens(user: User): Promise<AuthResponse> { throw new Error('Method not implemented. Use AuthService.'); }
  async refreshAuthTokens(refreshToken: string): Promise<AuthResponse | null> { throw new Error('Method not implemented. Use AuthService.'); }
  async validateRefreshToken(token: string): Promise<User | null> { throw new Error('Method not implemented. Use AuthService.'); }
  async getUserProfile(userId: string): Promise<User | null> { return this.getUserById(userId); }
  async updateUserProfile(userId: string, profileData: Partial<User>): Promise<User | null> { return this.updateUser(userId, profileData); }
  async updateLastLogin(userId: string): Promise<boolean> { return true; }
}
