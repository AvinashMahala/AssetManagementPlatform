import type { User, UserInput, UserLoginInput, AuthUser } from '../types/user';
import type { ApiResponse } from '../types/api';
import { apiClient } from './apiClient';
import { API_ENDPOINTS } from '../constants/api';

class UserService {
  async register(userData: UserInput): Promise<ApiResponse<User>> {
    return apiClient.post<User>(API_ENDPOINTS.AUTH.REGISTER, userData);
  }

  async login(credentials: UserLoginInput): Promise<ApiResponse<AuthUser>> {
    const response = await apiClient.post<AuthUser>(API_ENDPOINTS.AUTH.LOGIN, credentials);

    // Store token if login successful
    if (response.success && response.data?.token) {
      apiClient.setAuthToken(response.data.token);
    }

    return response;
  }

  async getProfile(): Promise<ApiResponse<User>> {
    return apiClient.get<User>(API_ENDPOINTS.AUTH.PROFILE);
  }

  async getAllUsers(): Promise<ApiResponse<{users: User[]}>> {
    return apiClient.get<{users: User[]}>(API_ENDPOINTS.USERS);
  }

  async getUserById(id: string): Promise<ApiResponse<User>> {
    return apiClient.get<User>(API_ENDPOINTS.USER_BY_ID(id));
  }

  async logout(): Promise<void> {
    apiClient.setAuthToken(null);
  }

  // Utility methods
  isAuthenticated(): boolean {
    return apiClient.isAuthenticated();
  }

  getStoredToken(): string | null {
    return localStorage.getItem('token');
  }

  // Initialize auth state on app load
  initializeAuth(): void {
    const token = this.getStoredToken();
    if (token) {
      apiClient.setAuthToken(token);
    }
  }
}

// Export singleton instance
export const userService = new UserService();
export default userService;