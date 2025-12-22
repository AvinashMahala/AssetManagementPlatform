
import { IUserRepository } from '@/features/auth/user/core/IUserRepository';
import { UserService } from '@/features/auth/user/core/UserService';
import { LoginParams, RegisterParams, AuthResponse, RefreshTokenParams, VerifyEmailParams, RequestPasswordResetParams, ResetPasswordParams } from './auth.types';
import { PasswordUtils } from '@/shared/utils/password';
import { ValidationUtils } from '@/shared/utils/validation';
import { ERROR_MESSAGES } from '@/shared/constants/validation';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

export class AuthService {
  private jwtSecret: string;
  private jwtRefreshSecret: string;
  private accessTokenExpiry: string;
  private refreshTokenExpiry: string;

  constructor(
    private readonly userService: UserService,
    private readonly userRepository: IUserRepository
  ) {
    this.jwtSecret = process.env.JWT_SECRET || 'your-secret-key';
    this.jwtRefreshSecret = process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key';
    this.accessTokenExpiry = process.env.JWT_ACCESS_TOKEN_EXPIRY || '15m';
    this.refreshTokenExpiry = process.env.JWT_REFRESH_TOKEN_EXPIRY || '7d';
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
}
