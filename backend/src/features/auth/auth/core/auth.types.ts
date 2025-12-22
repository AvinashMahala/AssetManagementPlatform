
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

export interface PasswordResetMethod {
  id: string; // UUID
  userId: string; // UUID
  methodType: 'security_questions' | 'recovery_codes' | 'admin_assist';
  isEnabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface SecurityQuestion {
  id: string; // UUID
  userId: string; // UUID
  question: string;
  answerHash: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface RecoveryCode {
  id: string; // UUID
  userId: string; // UUID
  codeHash: string;
  used: boolean;
  createdAt: Date;
  usedAt?: Date;
}

export interface SecurityQuestionSetup {
  question: string;
  answer: string;
}

export interface PasswordResetViaSecurityQuestions {
  userId: string; // UUID
  answers: { questionId: string; answer: string }[]; // UUID
  newPassword: string;
}

export interface PasswordResetViaRecoveryCode {
  userId: string; // UUID
  recoveryCode: string;
  newPassword: string;
}

export interface AdminPasswordReset {
  userId: string; // UUID
  tempPassword: string;
  reason?: string;
}

export interface PasswordResetOptions {
  availableMethods: PasswordResetMethod[];
  securityQuestions?: SecurityQuestion[];
  recoveryCodesCount?: number;
}
