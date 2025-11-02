import { IUserRepository } from '../interfaces/repositories/IUserRepository.js';
import {
  User,
  UserInput,
  UserCredentials,
  UserRegistrationInput,
  GoogleUserProfile,
  EmailVerificationRequest,
  EmailVerificationConfirm,
  PhoneVerificationRequest,
  PhoneVerificationConfirm,
  AuthResponse,
  AuthTokens
} from '../models/User.js';
import { ValidationUtils } from '../utils/validation.js';
import { PasswordUtils } from '../utils/password.js';
import { ERROR_MESSAGES } from '../constants/validation.js';
import { IUserService } from '../interfaces/services/IUserService.js';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

export class UserService implements IUserService {
  private repository: IUserRepository;
  private jwtSecret: string;
  private jwtRefreshSecret: string;

  constructor(repository: IUserRepository) {
    this.repository = repository;
    this.jwtSecret = process.env.JWT_SECRET || 'your-secret-key';
    this.jwtRefreshSecret = process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key';
  }

  // Basic CRUD operations
  async getAllUsers(): Promise<User[]> {
    return await this.repository.findAll();
  }

  async getUserById(id: string): Promise<User | null> {
    const idValidation = ValidationUtils.validateId(id);
    if (!idValidation.isValid) {
      throw new Error(idValidation.message || ERROR_MESSAGES.USER.INVALID_ID);
    }
    return await this.repository.findById(id);
  }

  async getUserByEmail(email: string): Promise<User | null> {
    const emailValidation = ValidationUtils.validateEmail(email);
    if (!emailValidation.isValid) {
      throw new Error(emailValidation.message || 'Invalid email format');
    }
    return await this.repository.findByEmail(email);
  }

  async createUser(userData: UserInput): Promise<User> {
    // Validate input
    const usernameValidation = ValidationUtils.validateUsername(userData.username);
    if (!usernameValidation.isValid) {
      throw new Error(usernameValidation.message);
    }

    const emailValidation = ValidationUtils.validateEmail(userData.email);
    if (!emailValidation.isValid) {
      throw new Error(emailValidation.message);
    }

    const passwordValidation = PasswordUtils.validatePasswordStrength(userData.password);
    if (!passwordValidation.isValid) {
      throw new Error(passwordValidation.message);
    }

    if (userData.role) {
      const roleValidation = ValidationUtils.validateUserRole(userData.role);
      if (!roleValidation.isValid) {
        throw new Error(roleValidation.message);
      }
    }

    // Check uniqueness
    const existingUser = await this.repository.findByUsername(userData.username);
    if (existingUser) {
      throw new Error(ERROR_MESSAGES.USER.USERNAME_EXISTS);
    }

    const existingEmail = await this.repository.findByEmail(userData.email);
    if (existingEmail) {
      throw new Error(ERROR_MESSAGES.USER.EMAIL_EXISTS);
    }

    // Hash password
    const hashedPassword = await PasswordUtils.hashPassword(userData.password);

    const userWithHashedPassword = {
      ...userData,
      password: hashedPassword,
      isEmailVerified: false,
      isPhoneVerified: false,
    };

    return await this.repository.create(userWithHashedPassword);
  }

  async updateUser(id: string, userData: Partial<UserInput>): Promise<User | null> {
    const idValidation = ValidationUtils.validateId(id);
    if (!idValidation.isValid) {
      throw new Error(idValidation.message || ERROR_MESSAGES.USER.INVALID_ID);
    }

    const existingUser = await this.repository.findById(id);
    if (!existingUser) {
      return null;
    }

    // Validate updates
    if (userData.username && userData.username !== existingUser.username) {
      const usernameValidation = ValidationUtils.validateUsername(userData.username);
      if (!usernameValidation.isValid) {
        throw new Error(usernameValidation.message);
      }
      const userWithUsername = await this.repository.findByUsername(userData.username);
      if (userWithUsername) {
        throw new Error(ERROR_MESSAGES.USER.USERNAME_EXISTS);
      }
    }

    if (userData.email && userData.email !== existingUser.email) {
      const emailValidation = ValidationUtils.validateEmail(userData.email);
      if (!emailValidation.isValid) {
        throw new Error(emailValidation.message);
      }
      const userWithEmail = await this.repository.findByEmail(userData.email);
      if (userWithEmail) {
        throw new Error(ERROR_MESSAGES.USER.EMAIL_EXISTS);
      }
    }

    if (userData.password) {
      const passwordValidation = PasswordUtils.validatePasswordStrength(userData.password);
      if (!passwordValidation.isValid) {
        throw new Error(passwordValidation.message);
      }
      userData.password = await PasswordUtils.hashPassword(userData.password);
    }

    if (userData.role) {
      const roleValidation = ValidationUtils.validateUserRole(userData.role);
      if (!roleValidation.isValid) {
        throw new Error(roleValidation.message);
      }
    }

    return await this.repository.update(id, userData);
  }

  async deleteUser(id: string): Promise<boolean> {
    const idValidation = ValidationUtils.validateId(id);
    if (!idValidation.isValid) {
      throw new Error(idValidation.message || ERROR_MESSAGES.USER.INVALID_ID);
    }
    return await this.repository.delete(id);
  }

  // Authentication methods
  async authenticateUser(credentials: UserCredentials): Promise<User | null> {
    if (!credentials.email || !credentials.password) {
      throw new Error('Email and password are required');
    }

    const user = await this.repository.findByEmail(credentials.email);
    if (!user) {
      return null;
    }

    const isValidPassword = await PasswordUtils.verifyPassword(credentials.password, user.password || '');
    if (!isValidPassword) {
      return null;
    }

    return user;
  }

  async registerUser(userData: UserRegistrationInput): Promise<User> {
    // Validate input based on registration method
    const usernameValidation = ValidationUtils.validateUsername(userData.username);
    if (!usernameValidation.isValid) {
      throw new Error(usernameValidation.message);
    }

    const emailValidation = ValidationUtils.validateEmail(userData.email);
    if (!emailValidation.isValid) {
      throw new Error(emailValidation.message);
    }

    const passwordValidation = PasswordUtils.validatePasswordStrength(userData.password);
    if (!passwordValidation.isValid) {
      throw new Error(passwordValidation.message);
    }

    if (userData.phone) {
      const phoneValidation = ValidationUtils.validatePhone(userData.phone);
      if (!phoneValidation.isValid) {
        throw new Error(phoneValidation.message);
      }
    }

    // Check uniqueness
    const existingUser = await this.repository.findByUsername(userData.username);
    if (existingUser) {
      throw new Error(ERROR_MESSAGES.USER.USERNAME_EXISTS);
    }

    const existingEmail = await this.repository.findByEmail(userData.email);
    if (existingEmail) {
      throw new Error(ERROR_MESSAGES.USER.EMAIL_EXISTS);
    }

    // Hash password
    const hashedPassword = await PasswordUtils.hashPassword(userData.password);

    const userWithHashedPassword = {
      ...userData,
      password: hashedPassword,
      isEmailVerified: userData.registrationMethod === 'google', // Google accounts are pre-verified
      isPhoneVerified: false,
    };

    const user = await this.repository.create(userWithHashedPassword);

    // Generate email verification token for non-Google registrations
    if (userData.registrationMethod !== 'google') {
      await this.requestEmailVerification(user.id);
    }

    return user;
  }

  async loginUser(credentials: UserCredentials): Promise<AuthResponse | null> {
    const user = await this.authenticateUser(credentials);
    if (!user) {
      return null;
    }

    // Update last login
    await this.updateLastLogin(user.id);

    // Generate tokens
    return await this.generateAuthTokens(user);
  }

  async logoutUser(userId: string): Promise<boolean> {
    // In a real implementation, you might want to blacklist the token
    // For now, we'll just return success
    return true;
  }

  // Email verification methods
  async requestEmailVerification(userId: string): Promise<string> {
    const user = await this.repository.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    if (user.isEmailVerified) {
      throw new Error('Email already verified');
    }

    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    await this.repository.updateEmailVerificationToken(userId, token, expiresAt);

    // Email functionality is disabled - log for development
    console.log('Email verification requested for user:', user.email, '- email functionality disabled');
    // const emailSent = await emailService.sendEmailVerificationEmail(user.email, token);
    // if (!emailSent) {
    //   console.error('Failed to send email verification email');
    // }

    return token;
  }

  async verifyEmail(token: string): Promise<boolean> {
    const user = await this.repository.findByEmailVerificationToken(token);
    if (!user || !user.emailVerificationExpires || user.emailVerificationExpires < new Date()) {
      return false;
    }

    await this.repository.verifyEmail(user.id);
    return true;
  }

  async resendEmailVerification(email: string): Promise<boolean> {
    const user = await this.repository.findByEmail(email);
    if (!user) {
      throw new Error('User not found');
    }

    if (user.isEmailVerified) {
      throw new Error('Email already verified');
    }

    const token = await this.requestEmailVerification(user.id);
    return true;
  }

  // Phone verification methods
  async requestPhoneVerification(phone: string): Promise<string> {
    const phoneValidation = ValidationUtils.validatePhone(phone);
    if (!phoneValidation.isValid) {
      throw new Error(phoneValidation.message);
    }

    // Generate 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await this.repository.storePhoneVerificationCode(phone, code, expiresAt);

    return code; // In production, this would be sent via SMS
  }

  async verifyPhone(phone: string, code: string): Promise<boolean> {
    const isValid = await this.repository.verifyPhoneCode(phone, code);
    if (isValid) {
      // Update user phone verification status
      const user = await this.repository.findByPhone(phone);
      if (user) {
        await this.repository.verifyPhone(user.id);
      }
    }
    return isValid;
  }

  // Google OAuth methods
  async findOrCreateGoogleUser(profile: GoogleUserProfile): Promise<User> {
    // Check if user already exists with this Google ID
    let user = await this.repository.findByGoogleId(profile.id);

    if (user) {
      return user;
    }

    // Check if user exists with this email
    user = await this.repository.findByEmail(profile.email);

    if (user) {
      // Link Google account to existing user
      await this.repository.linkGoogleAccount(user.id, profile.id, profile.picture);
      return await this.repository.findById(user.id) || user;
    }

    // Create new user
    const username = profile.name.replace(/\s+/g, '').toLowerCase() + Math.floor(Math.random() * 1000);
    const userData = {
      username,
      name: profile.name, // Store the full display name
      email: profile.email,
      password: crypto.randomBytes(32).toString('hex'), // Random password for Google users
      googleId: profile.id,
      profilePicture: profile.picture,
      isEmailVerified: profile.verified_email,
      isPhoneVerified: false,
    };

    return await this.repository.create(userData);
  }

  async linkGoogleAccount(userId: string, googleId: string): Promise<boolean> {
    return await this.repository.linkGoogleAccount(userId, googleId);
  }

  // Token management
  async generateAuthTokens(user: User): Promise<AuthResponse> {
    const accessToken = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      this.jwtSecret,
      { expiresIn: '15m' }
    );

    const refreshToken = jwt.sign(
      { userId: user.id },
      this.jwtRefreshSecret,
      { expiresIn: '7d' }
    );

    return {
      user,
      tokens: {
        accessToken,
        refreshToken,
        expiresIn: 15 * 60, // 15 minutes in seconds
      },
    };
  }

  async refreshAuthTokens(refreshToken: string): Promise<AuthResponse | null> {
    try {
      const decoded = jwt.verify(refreshToken, this.jwtRefreshSecret) as { userId: string };
      const user = await this.repository.findById(decoded.userId);

      if (!user) {
        return null;
      }

      return await this.generateAuthTokens(user);
    } catch (error) {
      return null;
    }
  }

  async validateRefreshToken(token: string): Promise<User | null> {
    try {
      const decoded = jwt.verify(token, this.jwtRefreshSecret) as { userId: string };
      return await this.repository.findById(decoded.userId);
    } catch (error) {
      return null;
    }
  }

  // Profile methods
  async getUserProfile(userId: string): Promise<User | null> {
    return await this.repository.findById(userId);
  }

  async updateUserProfile(userId: string, profileData: Partial<User>): Promise<User | null> {
    return await this.repository.update(userId, profileData);
  }

  async updateLastLogin(userId: string): Promise<boolean> {
    return await this.repository.updateLastLogin(userId);
  }
}