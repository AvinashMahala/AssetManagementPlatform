
export interface User {
  id: string;
  username: string;
  name?: string;
  email: string;
  password?: string;
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

export interface CreateUserParams {
  username: string;
  email: string;
  password?: string;
  phone?: string;
  role?: 'admin' | 'user';
  name?: string;
  googleId?: string;
  profilePicture?: string;
  isEmailVerified?: boolean;
  isPhoneVerified?: boolean;
}

export interface UpdateUserParams {
  username?: string;
  email?: string;
  password?: string;
  phone?: string;
  role?: 'admin' | 'user';
  name?: string;
  profilePicture?: string;
  isEmailVerified?: boolean;
  isPhoneVerified?: boolean;
  emailVerificationToken?: string;
  emailVerificationExpires?: Date;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  lastLogin?: Date;
  updatedAt?: Date;
}

export interface UserFilters {
  role?: 'admin' | 'user';
  email?: string;
  username?: string;
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
  rememberMe?: boolean;
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
  id: string;
  userId: string;
  methodType: 'security_questions' | 'recovery_codes' | 'admin_assist';
  isEnabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface SecurityQuestion {
  id: string;
  userId: string;
  question: string;
  answerHash: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface RecoveryCode {
  id: string;
  userId: string;
  codeHash: string;
  used: boolean;
  createdAt: Date;
  usedAt?: Date;
}

export interface PhoneVerificationCode {
  id: string;
  userId: string;
  phone: string;
  code: string;
  expiresAt: Date;
  verified: boolean;
  createdAt: Date;
}

export interface SecurityQuestionSetup {
  question: string;
  answer: string;
}

export interface PasswordResetViaSecurityQuestions {
  userId: string;
  answers: { questionId: string; answer: string }[];
  newPassword: string;
}

export interface PasswordResetViaRecoveryCode {
  userId: string;
  recoveryCode: string;
  newPassword: string;
}

export interface AdminPasswordReset {
  userId: string;
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
