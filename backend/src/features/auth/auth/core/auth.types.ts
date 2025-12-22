
import { User } from '@/features/auth/user/core/user.types';

export interface AuthResponse {
  user: Partial<User>;
  tokens: {
    accessToken: string;
    refreshToken: string;
  };
}

export interface LoginParams {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterParams {
  username: string;
  email: string;
  password: string;
  phone?: string;
  registrationMethod: 'email' | 'phone' | 'google';
}

export interface RefreshTokenParams {
  refreshToken: string;
}

export interface VerifyEmailParams {
  token: string;
}

export interface RequestPasswordResetParams {
  email: string;
}

export interface ResetPasswordParams {
  token: string;
  newPassword: string;
}
