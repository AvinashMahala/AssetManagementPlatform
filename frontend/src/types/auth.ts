export interface User {
  id: number;
  username: string;
  name?: string; // Full display name (for Google OAuth users)
  email: string;
  phone?: string;
  role: 'admin' | 'user';
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  profilePicture?: string;
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
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

export interface UserRegistrationInput {
  username: string;
  name?: string; // Full display name (for Google OAuth users)
  email: string;
  password: string;
  phone?: string;
  registrationMethod: 'email' | 'phone' | 'google';
  googleId?: string; // For Google OAuth registration
}

export interface UserCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
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

export interface PasswordResetOptions {
  availableMethods: string[];
  enabledMethods: string[];
  hasSecurityQuestions: boolean;
  recoveryCodesCount: number;
}

export interface SecurityQuestionSetup {
  questions: {
    question: string;
    answer: string;
  }[];
}

export interface PasswordResetViaSecurityQuestions {
  email: string;
  answers: {
    question: string;
    answer: string;
  }[];
  newPassword: string;
}

export interface PasswordResetViaRecoveryCode {
  email: string;
  recoveryCode: string;
  newPassword: string;
}

export interface AdminPasswordReset {
  userId: number;
  sendEmail?: boolean;
}

export interface GoogleUserProfile {
  id: string;
  email: string;
  name: string;
  picture?: string;
  verified_email: boolean;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface UpdateProfileRequest {
  username?: string;
  email?: string;
  phone?: string;
}

export interface LinkGoogleRequest {
  googleId: string;
}
