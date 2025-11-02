import { VALIDATION, ERROR_MESSAGES } from '../constants/validation';

export class ValidationUtils {
  /**
   * Validate email format
   */
  static isValidEmail(email: string): boolean {
    return VALIDATION.USER.EMAIL.PATTERN.test(email);
  }

  /**
   * Validate string length
   */
  static isValidLength(value: string, min: number, max: number): boolean {
    return value.length >= min && value.length <= max;
  }

  /**
   * Validate positive number
   */
  static isPositiveNumber(value: number): boolean {
    return typeof value === 'number' && value >= 0 && !isNaN(value);
  }

  /**
   * Validate user role
   */
  static isValidUserRole(role: string): boolean {
    return VALIDATION.USER.ROLE.ALLOWED_VALUES.includes(role as any);
  }

  /**
   * Validate asset name
   */
  static validateAssetName(name: string): { isValid: boolean; message?: string } {
    if (!name || name.trim().length === 0) {
      return { isValid: false, message: ERROR_MESSAGES.ASSET.NAME_REQUIRED };
    }
    if (name.length > VALIDATION.ASSET.NAME.MAX_LENGTH) {
      return { isValid: false, message: ERROR_MESSAGES.ASSET.NAME_TOO_LONG };
    }
    return { isValid: true };
  }

  /**
   * Validate asset value
   */
  static validateAssetValue(value?: number): { isValid: boolean; message?: string } {
    if (value !== undefined && !this.isPositiveNumber(value)) {
      return { isValid: false, message: ERROR_MESSAGES.ASSET.VALUE_NEGATIVE };
    }
    return { isValid: true };
  }

  /**
   * Validate username
   */
  static validateUsername(username: string): { isValid: boolean; message?: string } {
    if (!username || username.trim().length === 0) {
      return { isValid: false, message: ERROR_MESSAGES.USER.USERNAME_REQUIRED };
    }
    if (username.length < VALIDATION.USER.USERNAME.MIN_LENGTH) {
      return { isValid: false, message: ERROR_MESSAGES.USER.USERNAME_TOO_SHORT };
    }
    if (username.length > VALIDATION.USER.USERNAME.MAX_LENGTH) {
      return { isValid: false, message: ERROR_MESSAGES.USER.USERNAME_TOO_LONG };
    }
    return { isValid: true };
  }

  /**
   * Validate email
   */
  static validateEmail(email: string): { isValid: boolean; message?: string } {
    if (!email || email.trim().length === 0) {
      return { isValid: false, message: ERROR_MESSAGES.USER.EMAIL_REQUIRED };
    }
    if (email.length > VALIDATION.USER.EMAIL.MAX_LENGTH) {
      return { isValid: false, message: ERROR_MESSAGES.USER.EMAIL_TOO_LONG };
    }
    if (!this.isValidEmail(email)) {
      return { isValid: false, message: ERROR_MESSAGES.USER.EMAIL_INVALID };
    }
    return { isValid: true };
  }

  /**
   * Validate user role
   */
  static validateUserRole(role?: string): { isValid: boolean; message?: string } {
    if (role && !this.isValidUserRole(role)) {
      return { isValid: false, message: ERROR_MESSAGES.USER.ROLE_INVALID };
    }
    return { isValid: true };
  }

  /**
   * Validate phone number
   */
  static validatePhone(phone: string): { isValid: boolean; message?: string } {
    if (!phone || phone.trim().length === 0) {
      return { isValid: false, message: ERROR_MESSAGES.USER.PHONE_REQUIRED };
    }
    if (!VALIDATION.USER.PHONE.PATTERN.test(phone)) {
      return { isValid: false, message: ERROR_MESSAGES.USER.PHONE_INVALID };
    }
    return { isValid: true };
  }

  /**
   * Validate ID (must be positive integer)
   */
  static validateId(id: any): { isValid: boolean; message?: string } {
    const numId = typeof id === 'string' ? parseInt(id, 10) : id;
    if (!Number.isInteger(numId) || numId <= 0) {
      return { isValid: false, message: 'Invalid ID. Must be a positive integer.' };
    }
    return { isValid: true };
  }
}