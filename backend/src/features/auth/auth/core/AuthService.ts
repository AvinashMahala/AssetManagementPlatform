
import { IUserRepository } from '@/features/auth/user/core/IUserRepository';
import { UserService } from '@/features/auth/user/core/UserService';
import { LoginParams, RegisterParams, AuthResponse, RefreshTokenParams, VerifyEmailParams, RequestPasswordResetParams, ResetPasswordParams } from './auth.types';
import { PasswordUtils } from '@/shared/utils/password';
import { ValidationUtils } from '@/shared/utils/validation';
import { ERROR_MESSAGES } from '@/shared/constants/validation';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { config } from '@/shared/config/env';

export class AuthService {
  private jwtSecret: string;
  private jwtRefreshSecret: string;
  private accessTokenExpiry: string;
  private refreshTokenExpiry: string;

  constructor(
    private readonly userService: UserService,
    private readonly userRepository: IUserRepository
  ) {
    this.jwtSecret = config.auth.jwtSecret;
    this.jwtRefreshSecret = config.auth.jwtRefreshSecret;
    this.accessTokenExpiry = config.auth.accessTokenExpiry;
    this.refreshTokenExpiry = config.auth.refreshTokenExpiry;
  }

  async register(data: RegisterParams): Promise<AuthResponse> {
    // Create user (UserService handles validation and hashing)
    const user = await this.userService.createUser({
      username: data.username,
      email: data.email,
      password: data.password,
      phone: data.phone,
      role: 'user'
    });

    // Generate tokens
    const tokens = this.generateTokens(user.id, user.role);

    return {
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      },
      tokens
    };
  }

  async login(data: LoginParams): Promise<AuthResponse> {
    const user = await this.userRepository.findByEmail(data.email);
    if (!user || !user.password) {
      throw new Error('Invalid email or password');
    }

    const isValid = await PasswordUtils.verifyPassword(data.password, user.password);
    if (!isValid) {
      throw new Error('Invalid email or password');
    }

    // Update last login
    await this.userRepository.updateById(user.id, { lastLogin: new Date() });

    const tokens = this.generateTokens(user.id, user.role);

    return {
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      },
      tokens
    };
  }

  async refreshToken(data: RefreshTokenParams): Promise<{ accessToken: string }> {
    try {
      const decoded = jwt.verify(data.refreshToken, this.jwtRefreshSecret) as any;
      const user = await this.userRepository.findById(decoded.userId);
      
      if (!user) {
        throw new Error('User not found');
      }

      const accessToken = jwt.sign(
        { userId: user.id, role: user.role },
        this.jwtSecret,
        { expiresIn: this.accessTokenExpiry } as jwt.SignOptions
      );

      return { accessToken };
    } catch (err) {
      throw new Error('Invalid refresh token');
    }
  }

  private generateTokens(userId: string, role: string) {
    const accessToken = jwt.sign(
      { userId, role },
      this.jwtSecret,
      { expiresIn: this.accessTokenExpiry } as jwt.SignOptions
    );

    const refreshToken = jwt.sign(
      { userId },
      this.jwtRefreshSecret,
      { expiresIn: this.refreshTokenExpiry } as jwt.SignOptions
    );

    return { accessToken, refreshToken };
  }

  // Email Verification
  async requestEmailVerification(userId: string): Promise<string> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    if (user.isEmailVerified) {
      throw new Error('Email already verified');
    }

    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    await this.userRepository.updateEmailVerificationToken(userId, token, expiresAt);

    // Email functionality is disabled - log for development
    console.log('Email verification requested for user:', user.email, '- email functionality disabled');
    
    return token;
  }

  async verifyEmail(token: string): Promise<boolean> {
    const user = await this.userRepository.findByEmailVerificationToken(token);
    if (!user || !user.emailVerificationExpires || user.emailVerificationExpires < new Date()) {
      return false;
    }

    await this.userRepository.verifyEmail(user.id);
    return true;
  }

  async resendEmailVerification(email: string): Promise<boolean> {
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new Error('User not found');
    }

    if (user.isEmailVerified) {
      throw new Error('Email already verified');
    }

    await this.requestEmailVerification(user.id);
    return true;
  }

  // Phone Verification
  async requestPhoneVerification(userId: string, phone: string): Promise<string> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const phoneValidation = ValidationUtils.validatePhone(phone);
    if (!phoneValidation.isValid) {
      throw new Error(phoneValidation.message);
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await this.userRepository.storePhoneVerificationCode(userId, phone, code, expiresAt);

    return code;
  }

  async verifyPhone(userId: string, code: string): Promise<boolean> {
    const isValid = await this.userRepository.verifyPhoneCode(userId, code);
    if (isValid) {
      await this.userRepository.verifyPhone(userId);
    }
    return isValid;
  }

  // Google OAuth
  async findOrCreateGoogleUser(profile: { id: string; email: string; name: string; picture?: string; verified_email: boolean }): Promise<AuthResponse> {
    let user = await this.userRepository.findByGoogleId(profile.id);

    if (!user) {
      user = await this.userRepository.findByEmail(profile.email);
      if (user) {
        await this.userRepository.linkGoogleAccount(user.id, profile.id, profile.picture);
        user = await this.userRepository.findById(user.id);
      } else {
        const username = profile.name.replace(/\s+/g, '').toLowerCase() + Math.floor(Math.random() * 1000);
        user = await this.userService.createUser({
          username,
          name: profile.name,
          email: profile.email,
          password: crypto.randomBytes(32).toString('hex'),
          googleId: profile.id,
          profilePicture: profile.picture,
          isEmailVerified: profile.verified_email,
          isPhoneVerified: false,
          role: 'user'
        });
      }
    }

    if (!user) throw new Error('Failed to create or find user');

    const tokens = this.generateTokens(user.id, user.role);
    return {
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      },
      tokens
    };
  }
}
