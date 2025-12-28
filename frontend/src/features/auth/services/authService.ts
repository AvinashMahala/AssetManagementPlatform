import { apiClient } from '@/lib/apiClient';
import { ApiException } from '@/utils/ApiException';
import type {
  User,
  AuthResponse,
  UserRegistrationInput,
  UserCredentials,
  PasswordResetOptions,
  SecurityQuestionSetup,
  PasswordResetViaSecurityQuestions,
  PasswordResetViaRecoveryCode,
  AdminPasswordReset,
  GoogleUserProfile,
  UpdateProfileRequest
} from '@/features/auth/types/auth';

class AuthService {
  // User registration
  async register(userData: UserRegistrationInput): Promise<{ user: User; message: string }> {
    const response = await apiClient.post<{ user: User; message: string }>('/api/v1/auth/register', userData);
    if (!response.success || !response.data) {
      throw new ApiException(response.error || { code: 'UNKNOWN_ERROR', message: 'Registration failed' });
    }
    return response.data;
  }

  // User login
  async login(credentials: UserCredentials): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/api/v1/auth/login', credentials);
    if (!response.success || !response.data) {
      throw new ApiException(response.error || { code: 'UNKNOWN_ERROR', message: 'Login failed' });
    }
    // Ensure backend returned tokens
    if (!response.data.tokens || !response.data.tokens.accessToken) {
      throw new ApiException({ code: 'INVALID_RESPONSE', message: 'Authentication response is missing tokens' });
    }
    return response.data;
  }

  // Email verification
  async verifyEmail(token: string): Promise<{ message: string }> {
    const response = await apiClient.post<{ message: string }>('/api/v1/auth/verify-email', { token });
    if (!response.success || !response.data) {
      throw new ApiException(response.error || { code: 'UNKNOWN_ERROR', message: 'Email verification failed' });
    }
    return response.data;
  }

  async resendVerification(email: string): Promise<{ message: string }> {
    const response = await apiClient.post<{ message: string }>('/api/v1/auth/resend-verification', { email });
    if (!response.success || !response.data) {
      throw new ApiException(response.error || { code: 'UNKNOWN_ERROR', message: 'Resend verification failed' });
    }
    return response.data;
  }

  // Phone verification
  async requestPhoneVerification(phone: string): Promise<{ message: string; code?: string }> {
    const response = await apiClient.post<{ message: string; code?: string }>('/api/v1/auth/request-phone-verification', { phone });
    if (!response.success || !response.data) {
      throw new ApiException(response.error || { code: 'UNKNOWN_ERROR', message: 'Phone verification request failed' });
    }
    return response.data;
  }

  async verifyPhone(code: string): Promise<{ message: string }> {
    const response = await apiClient.post<{ message: string }>('/api/v1/auth/verify-phone', { code });
    if (!response.success || !response.data) {
      throw new ApiException(response.error || { code: 'UNKNOWN_ERROR', message: 'Phone verification failed' });
    }
    return response.data;
  }

  // Password reset methods
  async getPasswordResetOptions(): Promise<PasswordResetOptions> {
    const response = await apiClient.get<PasswordResetOptions>('/api/v1/auth/password-reset-options');
    if (!response.success || !response.data) {
      throw new ApiException(response.error || { code: 'UNKNOWN_ERROR', message: 'Get password reset options failed' });
    }
    return response.data;
  }

  async enableResetMethod(methodType: string): Promise<{ message: string }> {
    const response = await apiClient.post<{ message: string }>('/api/v1/auth/password-reset-methods/enable', { methodType });
    if (!response.success || !response.data) {
      throw new ApiException(response.error || { code: 'UNKNOWN_ERROR', message: 'Enable reset method failed' });
    }
    return response.data;
  }

  async disableResetMethod(methodType: string): Promise<{ message: string }> {
    const response = await apiClient.post<{ message: string }>('/api/v1/auth/password-reset-methods/disable', { methodType });
    if (!response.success || !response.data) {
      throw new ApiException(response.error || { code: 'UNKNOWN_ERROR', message: 'Disable reset method failed' });
    }
    return response.data;
  }

  async setupSecurityQuestions(questions: SecurityQuestionSetup): Promise<{ questions: { question: string }[]; message: string }> {
    const response = await apiClient.post<{ questions: { question: string }[]; message: string }>('/api/v1/auth/security-questions', questions);
    if (!response.success || !response.data) {
      throw new ApiException(response.error || { code: 'UNKNOWN_ERROR', message: 'Setup security questions failed' });
    }
    return response.data;
  }

  async generateRecoveryCodes(count?: number): Promise<{ codes: string[]; message: string }> {
    const response = await apiClient.post<{ codes: string[]; message: string }>('/api/v1/auth/recovery-codes/generate', { count: count || 10 });
    if (!response.success || !response.data) {
      throw new ApiException(response.error || { code: 'UNKNOWN_ERROR', message: 'Generate recovery codes failed' });
    }
    return response.data;
  }

  async resetPasswordViaSecurityQuestions(data: PasswordResetViaSecurityQuestions): Promise<{ message: string }> {
    const response = await apiClient.post<{ message: string }>('/api/v1/auth/reset-password/security-questions', data);
    if (!response.success || !response.data) {
      throw new ApiException(response.error || { code: 'UNKNOWN_ERROR', message: 'Password reset via security questions failed' });
    }
    return response.data;
  }

  async resetPasswordViaRecoveryCode(data: PasswordResetViaRecoveryCode): Promise<{ message: string }> {
    const response = await apiClient.post<{ message: string }>('/api/v1/auth/reset-password/recovery-code', data);
    if (!response.success || !response.data) {
      throw new ApiException(response.error || { code: 'UNKNOWN_ERROR', message: 'Password reset via recovery code failed' });
    }
    return response.data;
  }

  async adminResetPassword(data: AdminPasswordReset): Promise<{ tempPassword: string; message: string }> {
    const response = await apiClient.post<{ tempPassword: string; message: string }>('/api/v1/auth/admin/reset-password', data);
    if (!response.success || !response.data) {
      throw new ApiException(response.error || { code: 'UNKNOWN_ERROR', message: 'Admin password reset failed' });
    }
    return response.data;
  }

    // Google OAuth
  async googleAuth(profile: GoogleUserProfile): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/api/v1/auth/google-auth', profile);
    if (!response.success || !response.data) {
      console.error('[authService.googleAuth] Failed:', response.error);
      throw new ApiException(response.error || { code: 'UNKNOWN_ERROR', message: 'Google authentication failed' });
    }
    // Ensure backend returned tokens
    if (!response.data.tokens || !response.data.tokens.accessToken) {
      console.error('[authService.googleAuth] Missing tokens in response', response.data);
      throw new ApiException({ code: 'INVALID_RESPONSE', message: 'Google authentication response is missing tokens' });
    }
    return response.data;
  }

  // Token refresh
  async refreshToken(refreshToken: string): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/api/v1/auth/refresh-token', { refreshToken });
    if (!response.success || !response.data) {
      throw new ApiException(response.error || { code: 'UNKNOWN_ERROR', message: 'Token refresh failed' });
    }
    if (!response.data.tokens || !response.data.tokens.accessToken) {
      throw new ApiException({ code: 'INVALID_RESPONSE', message: 'Refresh token response is missing tokens' });
    }
    return response.data;
  }

  async updateProfile(profileData: UpdateProfileRequest): Promise<User> {
    const response = await apiClient.put<User>('/api/v1/auth/profile', profileData);
    if (!response.success || !response.data) {
      throw new ApiException(response.error || { code: 'UNKNOWN_ERROR', message: 'Update profile failed' });
    }
    return response.data;
  }

  // Logout
  async logout(): Promise<{ message: string }> {
    const response = await apiClient.post<{ message: string }>('/api/v1/auth/logout');
    if (!response.success || !response.data) {
      throw new ApiException(response.error || { code: 'UNKNOWN_ERROR', message: 'Logout failed' });
    }
    return response.data;
  }

  // Link Google account
  async linkGoogle(googleId: string): Promise<{ message: string }> {
    const response = await apiClient.post<{ message: string }>('/api/v1/auth/link-google', { googleId });
    if (!response.success || !response.data) {
      throw new ApiException(response.error || { code: 'UNKNOWN_ERROR', message: 'Link Google account failed' });
    }
    return response.data;
  }

  // Profile management
  async getProfile(): Promise<User> {
    const response = await apiClient.get<User>('/api/v1/auth/profile');
    if (!response.success || !response.data) {
      throw new ApiException(response.error || { code: 'UNKNOWN_ERROR', message: 'Get profile failed' });
    }
    return response.data;
  }
  async getAllUsers(): Promise<{ users: User[] }> {
    const response = await apiClient.get<{ users: User[] }>('/api/v1/auth');
    if (!response.success || !response.data) {
      throw new ApiException(response.error || { code: 'UNKNOWN_ERROR', message: 'Get all users failed' });
    }
    return response.data;
  }

  async getUserById(id: number): Promise<User> {
    const response = await apiClient.get<User>(`/api/auth/${id}`);
    if (!response.success || !response.data) {
      throw new ApiException(response.error || { code: 'UNKNOWN_ERROR', message: 'Get user failed' });
    }
    return response.data;
  }

  async updateUser(id: number, userData: Partial<User>): Promise<User> {
    const response = await apiClient.put<User>(`/api/auth/${id}`, userData);
    if (!response.success || !response.data) {
      throw new ApiException(response.error || { code: 'UNKNOWN_ERROR', message: 'Update user failed' });
    }
    return response.data;
  }

  async deleteUser(id: number): Promise<{ message: string }> {
    const response = await apiClient.delete<{ message: string }>(`/api/auth/${id}`);
    if (!response.success || !response.data) {
      throw new ApiException(response.error || { code: 'UNKNOWN_ERROR', message: 'Delete user failed' });
    }
    return response.data;
  }
}

export const authService = new AuthService();
