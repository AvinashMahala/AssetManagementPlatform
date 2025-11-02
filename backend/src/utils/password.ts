import bcrypt from 'bcrypt';
import { DEFAULTS } from '../constants/database';

export class PasswordUtils {
  /**
   * Hash a plain text password
   */
  static async hashPassword(password: string): Promise<string> {
    return await bcrypt.hash(password, DEFAULTS.PASSWORD_SALT_ROUNDS);
  }

  /**
   * Verify a plain text password against a hashed password
   */
  static async verifyPassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }

  /**
   * Check if password meets minimum requirements
   */
  static validatePasswordStrength(password: string): { isValid: boolean; message?: string } {
    if (password.length < 6) {
      return { isValid: false, message: 'Password must be at least 6 characters long' };
    }
    if (password.length > 128) {
      return { isValid: false, message: 'Password must be less than 128 characters' };
    }
    return { isValid: true };
  }
}