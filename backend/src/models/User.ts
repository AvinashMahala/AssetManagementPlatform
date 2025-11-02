export interface User {
  id: number;
  username: string;
  name?: string; // Full display name (for Google OAuth users)
  email: string;
  password?: string; // Only included when needed for authentication
  phone?: string;
  role: 'admin' | 'user';
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  emailVerificationToken?: string;
  emailVerificationExpires?: Date;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  googleId?: string;
  profilePicture?: string;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserInput {
  username: string;
  email: string;
  password: string;
  phone?: string;
  role?: 'admin' | 'user';
}

export interface UserCredentials {
  email: string;
  password: string;
}

export interface UserRegistrationInput {
  username: string;
  email: string;
  password: string;
  phone?: string;
  registrationMethod: 'email' | 'phone' | 'google';
}

export interface GoogleUserProfile {
  id: string;
  email: string;
  name: string;
  picture?: string;
  verified_email: boolean;
}

export interface EmailVerificationRequest {
  email: string;
}

export interface EmailVerificationConfirm {
  token: string;
}

export interface PhoneVerificationRequest {
  phone: string;
}

export interface PhoneVerificationConfirm {
  phone: string;
  code: string;
}

export interface PasswordResetMethod {
  id: number;
  userId: number;
  methodType: 'security_questions' | 'recovery_codes' | 'admin_assist';
  isEnabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface SecurityQuestion {
  id: number;
  userId: number;
  question: string;
  answerHash: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface RecoveryCode {
  id: number;
  userId: number;
  codeHash: string;
  isUsed: boolean;
  createdAt: Date;
  usedAt?: Date;
}

export interface SecurityQuestionSetup {
  question: string;
  answer: string;
}

export interface PasswordResetViaSecurityQuestions {
  userId: number;
  answers: { questionId: number; answer: string }[];
  newPassword: string;
}

export interface PasswordResetViaRecoveryCode {
  userId: number;
  recoveryCode: string;
  newPassword: string;
}

export interface AdminPasswordReset {
  userId: number;
  tempPassword: string;
  reason?: string;
}

export interface PasswordResetOptions {
  availableMethods: PasswordResetMethod[];
  securityQuestions?: SecurityQuestion[];
  recoveryCodesCount?: number;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface AuthResponse {
  user: User;
  tokens: AuthTokens;
}