
import { IUserRepository } from './IUserRepository';
import { User, CreateUserParams, UpdateUserParams } from './user.types';
import { ValidationUtils } from '@/shared/utils/validation';
import { ERROR_MESSAGES } from '@/shared/constants/validation';
import { PasswordUtils } from '@/shared/utils/password';

export class UserService {
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
}
