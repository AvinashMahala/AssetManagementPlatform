import { apiClient } from './apiClient';

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

class AuthService {
  // User registration
  async register(userData: UserRegistrationInput): Promise<{ user: User; message: string }> {
    const response = await apiClient.post<{ user: User; message: string }>('/api/auth/register', userData);
    if (!response.success || !response.data) {
      throw new Error(response.error?.message || 'Registration failed');
    }
    return response.data;
  }

  // User login
  async login(credentials: UserCredentials): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/api/auth/login', credentials);
    if (!response.success || !response.data) {
      throw new Error(response.error?.message || 'Login failed');
    }
    return response.data;
  }

  // Email verification
  async verifyEmail(token: string): Promise<{ message: string }> {
    const response = await apiClient.post<{ message: string }>('/api/auth/verify-email', { token });
    if (!response.success || !response.data) {
      throw new Error(response.error?.message || 'Email verification failed');
    }
    return response.data;
  }

  async resendVerification(email: string): Promise<{ message: string }> {
    const response = await apiClient.post<{ message: string }>('/api/auth/resend-verification', { email });
    if (!response.success || !response.data) {
      throw new Error(response.error?.message || 'Resend verification failed');
    }
    return response.data;
  }

  // Phone verification
  async requestPhoneVerification(phone: string): Promise<{ message: string; code?: string }> {
    const response = await apiClient.post<{ message: string; code?: string }>('/api/auth/request-phone-verification', { phone });
    if (!response.success || !response.data) {
      throw new Error(response.error?.message || 'Phone verification request failed');
    }
    return response.data;
  }

  async verifyPhone(phone: string, code: string): Promise<{ message: string }> {
    const response = await apiClient.post<{ message: string }>('/api/auth/verify-phone', { phone, code });
    if (!response.success || !response.data) {
      throw new Error(response.error?.message || 'Phone verification failed');
    }
    return response.data;
  }

  // Password reset methods
  async getPasswordResetOptions(): Promise<PasswordResetOptions> {
    const response = await apiClient.get<PasswordResetOptions>('/api/auth/password-reset-options');
    if (!response.success || !response.data) {
      throw new Error(response.error?.message || 'Get password reset options failed');
    }
    return response.data;
  }

  async enableResetMethod(methodType: string): Promise<{ message: string }> {
    const response = await apiClient.post<{ message: string }>('/api/auth/password-reset-methods/enable', { methodType });
    if (!response.success || !response.data) {
      throw new Error(response.error?.message || 'Enable reset method failed');
    }
    return response.data;
  }

  async disableResetMethod(methodType: string): Promise<{ message: string }> {
    const response = await apiClient.post<{ message: string }>('/api/auth/password-reset-methods/disable', { methodType });
    if (!response.success || !response.data) {
      throw new Error(response.error?.message || 'Disable reset method failed');
    }
    return response.data;
  }

  async setupSecurityQuestions(questions: SecurityQuestionSetup): Promise<{ questions: { question: string }[]; message: string }> {
    const response = await apiClient.post<{ questions: { question: string }[]; message: string }>('/api/auth/security-questions', questions);
    if (!response.success || !response.data) {
      throw new Error(response.error?.message || 'Setup security questions failed');
    }
    return response.data;
  }

  async generateRecoveryCodes(count?: number): Promise<{ codes: string[]; message: string }> {
    const response = await apiClient.post<{ codes: string[]; message: string }>('/api/auth/recovery-codes/generate', { count: count || 10 });
    if (!response.success || !response.data) {
      throw new Error(response.error?.message || 'Generate recovery codes failed');
    }
    return response.data;
  }

  async resetPasswordViaSecurityQuestions(data: PasswordResetViaSecurityQuestions): Promise<{ message: string }> {
    const response = await apiClient.post<{ message: string }>('/api/auth/reset-password/security-questions', data);
    if (!response.success || !response.data) {
      throw new Error(response.error?.message || 'Password reset via security questions failed');
    }
    return response.data;
  }

  async resetPasswordViaRecoveryCode(data: PasswordResetViaRecoveryCode): Promise<{ message: string }> {
    const response = await apiClient.post<{ message: string }>('/api/auth/reset-password/recovery-code', data);
    if (!response.success || !response.data) {
      throw new Error(response.error?.message || 'Password reset via recovery code failed');
    }
    return response.data;
  }

  async adminResetPassword(data: AdminPasswordReset): Promise<{ tempPassword: string; message: string }> {
    const response = await apiClient.post<{ tempPassword: string; message: string }>('/api/auth/admin/reset-password', data);
    if (!response.success || !response.data) {
      throw new Error(response.error?.message || 'Admin password reset failed');
    }
    return response.data;
  }

  // Google OAuth
  async googleAuth(profile: GoogleUserProfile): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/api/auth/google-auth', profile);
    if (!response.success || !response.data) {
      throw new Error(response.error?.message || 'Google authentication failed');
    }
    return response.data;
  }

  // Token refresh
  async refreshToken(refreshToken: string): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/api/auth/refresh-token', { refreshToken });
    if (!response.success || !response.data) {
      throw new Error(response.error?.message || 'Token refresh failed');
    }
    return response.data;
  }

  // Profile management
  async getProfile(): Promise<User> {
    const response = await apiClient.get<User>('/api/auth/profile');
    if (!response.success || !response.data) {
      throw new Error(response.error?.message || 'Get profile failed');
    }
    return response.data;
  }

  async updateProfile(profileData: UpdateProfileRequest): Promise<User> {
    const response = await apiClient.put<User>('/api/auth/profile', profileData);
    if (!response.success || !response.data) {
      throw new Error(response.error?.message || 'Update profile failed');
    }
    return response.data;
  }

  // Logout
  async logout(): Promise<{ message: string }> {
    const response = await apiClient.post<{ message: string }>('/api/auth/logout');
    if (!response.success || !response.data) {
      throw new Error(response.error?.message || 'Logout failed');
    }
    return response.data;
  }

  // Link Google account
  async linkGoogle(googleId: string): Promise<{ message: string }> {
    const response = await apiClient.post<{ message: string }>('/api/auth/link-google', { googleId });
    if (!response.success || !response.data) {
      throw new Error(response.error?.message || 'Link Google account failed');
    }
    return response.data;
  }

  // Admin functions
  async getAllUsers(): Promise<{ users: User[] }> {
    const response = await apiClient.get<{ users: User[] }>('/api/auth');
    if (!response.success || !response.data) {
      throw new Error(response.error?.message || 'Get all users failed');
    }
    return response.data;
  }

  async getUserById(id: number): Promise<User> {
    const response = await apiClient.get<User>(`/api/auth/${id}`);
    if (!response.success || !response.data) {
      throw new Error(response.error?.message || 'Get user failed');
    }
    return response.data;
  }

  async updateUser(id: number, userData: Partial<User>): Promise<User> {
    const response = await apiClient.put<User>(`/api/auth/${id}`, userData);
    if (!response.success || !response.data) {
      throw new Error(response.error?.message || 'Update user failed');
    }
    return response.data;
  }

  async deleteUser(id: number): Promise<{ message: string }> {
    const response = await apiClient.delete<{ message: string }>(`/api/auth/${id}`);
    if (!response.success || !response.data) {
      throw new Error(response.error?.message || 'Delete user failed');
    }
    return response.data;
  }
}

export const authService = new AuthService();