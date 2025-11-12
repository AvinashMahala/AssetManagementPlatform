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
import jwt, { SignOptions } from 'jsonwebtoken';
import * as crypto from 'crypto';
import { createModuleLogger } from '../utils/logger.js';

const logger = createModuleLogger('UserService');

export class UserService implements IUserService {
  private repository: IUserRepository;
  private jwtSecret: string;
  private jwtRefreshSecret: string;
  private accessTokenExpiry: string;
  private refreshTokenExpiry: string;
  private accessTokenExpiryRemember: string;
  private refreshTokenExpiryRemember: string;

  constructor(repository: IUserRepository) {
    this.repository = repository;
    this.jwtSecret = process.env.JWT_SECRET || 'your-secret-key';
    this.jwtRefreshSecret = process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key';
    
    // Token expiration times (in JWT format: '15m', '1h', '7d', etc.)
    this.accessTokenExpiry = process.env.JWT_ACCESS_TOKEN_EXPIRY || '15m';
    this.refreshTokenExpiry = process.env.JWT_REFRESH_TOKEN_EXPIRY || '7d';
    this.accessTokenExpiryRemember = process.env.JWT_ACCESS_TOKEN_EXPIRY_REMEMBER || '1h';
    this.refreshTokenExpiryRemember = process.env.JWT_REFRESH_TOKEN_EXPIRY_REMEMBER || '30d';
  }

  // Basic CRUD operations
  async getAllUsers(): Promise<User[]> {
    try {
      logger.debug('Fetching all users');
      const users = await this.repository.findAll();
      logger.info('Successfully fetched all users', { count: users.length });
      return users;
    } catch (error) {
      logger.error('Failed to fetch all users', error);
      throw error;
    }
  }

  async getUserById(id: string): Promise<User | null> {
    try {
      const idValidation = ValidationUtils.validateUUID(id);
      if (!idValidation.isValid) {
        logger.warn('Invalid user ID provided', { userId: id, validationError: idValidation.message });
        throw new Error(idValidation.message || ERROR_MESSAGES.USER.INVALID_ID);
      }

      logger.debug('Fetching user by ID', { userId: id });
      const user = await this.repository.findById(id);
      if (user) {
        logger.info('Successfully fetched user', { userId: id, email: user.email });
      } else {
        logger.warn('User not found', { userId: id });
      }
      return user;
    } catch (error) {
      logger.error('Failed to fetch user by ID', error, { userId: id });
      throw error;
    }
  }

  async getUserByEmail(email: string): Promise<User | null> {
    const emailValidation = ValidationUtils.validateEmail(email);
    if (!emailValidation.isValid) {
      throw new Error(emailValidation.message || 'Invalid email format');
    }
    return await this.repository.findByEmail(email);
  }

  async createUser(userData: UserInput): Promise<User> {
    try {
      logger.debug('Creating new user', { email: userData.email, username: userData.username });

      // Validate input
      const usernameValidation = ValidationUtils.validateUsername(userData.username);
      if (!usernameValidation.isValid) {
        logger.warn('Invalid username during user creation', { username: userData.username, error: usernameValidation.message });
        throw new Error(usernameValidation.message);
      }

      const emailValidation = ValidationUtils.validateEmail(userData.email);
      if (!emailValidation.isValid) {
        logger.warn('Invalid email during user creation', { email: userData.email, error: emailValidation.message });
        throw new Error(emailValidation.message);
      }

      const passwordValidation = PasswordUtils.validatePasswordStrength(userData.password);
      if (!passwordValidation.isValid) {
        logger.warn('Weak password during user creation', { error: passwordValidation.message });
        throw new Error(passwordValidation.message);
      }

      if (userData.role) {
        const roleValidation = ValidationUtils.validateUserRole(userData.role);
        if (!roleValidation.isValid) {
          logger.warn('Invalid role during user creation', { role: userData.role, error: roleValidation.message });
          throw new Error(roleValidation.message);
        }
      }

      // Check uniqueness
      const existingUser = await this.repository.findByUsername(userData.username);
      if (existingUser) {
        logger.warn('Username already exists during user creation', { username: userData.username });
        throw new Error(ERROR_MESSAGES.USER.USERNAME_EXISTS);
      }

      const existingEmail = await this.repository.findByEmail(userData.email);
      if (existingEmail) {
        logger.warn('Email already exists during user creation', { email: userData.email });
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

      const user = await this.repository.create(userWithHashedPassword);
      logger.info('Successfully created user', { userId: user.id, email: user.email, username: user.username });
      return user;
    } catch (error) {
      logger.error('Failed to create user', error, { email: userData.email, username: userData.username });
      throw error;
    }
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

    console.log('🔍 Authenticating user:', credentials.email);
    const user = await this.repository.findByEmail(credentials.email);
    if (!user) {
      console.log('❌ User not found:', credentials.email);
      return null;
    }

    console.log('✅ User found:', user.id, user.email);
    
    const isValidPassword = await PasswordUtils.verifyPassword(credentials.password, user.password || '');
    console.log('🔓 Password valid:', isValidPassword);
    
    if (!isValidPassword) {
      return null;
    }

    console.log('🔍 User object keys:', Object.keys(user));
    console.log('🔍 User id type:', typeof user.id);
    console.log('🔍 User email type:', typeof user.email);
    console.log('🔍 User createdAt type:', typeof user.createdAt);

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
    try {
      logger.debug('Login attempt', { email: credentials.email, rememberMe: credentials.rememberMe });

      const user = await this.authenticateUser(credentials);
      if (!user) {
        logger.warn('Login failed - invalid credentials', { email: credentials.email });
        return null;
      }

      logger.debug('User authenticated, updating last login', { userId: user.id });

      // Update last login
      try {
        await this.updateLastLogin(user.id);
      } catch (error) {
        logger.warn('Failed to update last login (non-critical)', { userId: user.id, error: (error as Error).message });
        // Don't fail the login if this fails
      }

      // Generate tokens
      const authResponse = await this.generateAuthTokens(user, credentials.rememberMe);
      logger.info('Login successful', { userId: user.id, email: credentials.email });
      return authResponse;
    } catch (error) {
      logger.error('Login failed with error', error, { email: credentials.email });
      throw error;
    }
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
  async generateAuthTokens(user: User, rememberMe: boolean = false): Promise<AuthResponse> {
    console.log('🎟️ generateAuthTokens called for user:', user.id, user.email, 'rememberMe:', rememberMe);
    console.log('🔍 User object has required fields:', {
      hasId: !!user.id,
      hasEmail: !!user.email,
      hasUsername: !!user.username,
      hasRole: !!user.role
    });
    
    try {
      // Set token expiration based on rememberMe preference
      const accessTokenExpiry = rememberMe ? this.accessTokenExpiryRemember : this.accessTokenExpiry;
      const refreshTokenExpiry = rememberMe ? this.refreshTokenExpiryRemember : this.refreshTokenExpiry;
      
      console.log('⏰ Token expirations - Access:', accessTokenExpiry, 'Refresh:', refreshTokenExpiry);
      
      const accessToken = jwt.sign(
        { userId: user.id, email: user.email, role: user.role },
        this.jwtSecret,
        { expiresIn: accessTokenExpiry } as SignOptions
      );

      const refreshToken = jwt.sign(
        { userId: user.id },
        this.jwtRefreshSecret,
        { expiresIn: refreshTokenExpiry } as SignOptions
      );

      // Calculate expiresIn in seconds from the JWT expiry string
      const expiresIn = this.parseJwtExpiryToSeconds(accessTokenExpiry);

      // Return minimal user info
      const safeUser = {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      };

      console.log('✅ Tokens generated, returning auth response');
      return {
        user: safeUser as User,
        tokens: {
          accessToken,
          refreshToken,
          expiresIn,
        },
      };
    } catch (error) {
      console.error('❌ Error generating tokens:', error);
      throw error;
    }
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

  // Helper method to parse JWT expiry string to seconds
  private parseJwtExpiryToSeconds(expiry: string): number {
    const match = expiry.match(/^(\d+)([smhd])$/);
    if (!match) {
      throw new Error(`Invalid JWT expiry format: ${expiry}`);
    }

    const value = parseInt(match[1], 10);
    const unit = match[2];

    switch (unit) {
      case 's': return value; // seconds
      case 'm': return value * 60; // minutes
      case 'h': return value * 60 * 60; // hours
      case 'd': return value * 24 * 60 * 60; // days
      default: throw new Error(`Unknown time unit: ${unit}`);
    }
  }
}