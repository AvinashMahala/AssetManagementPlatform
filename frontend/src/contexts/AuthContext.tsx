import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { useNotifications } from './NotificationContext';
import type {
  User,
  UserRegistrationInput,
  UserCredentials,
  GoogleUserProfile,
  UpdateProfileRequest,
  PasswordResetOptions,
  SecurityQuestionSetup,
  PasswordResetViaSecurityQuestions,
  PasswordResetViaRecoveryCode,
  AdminPasswordReset
} from '@/features/auth/types/auth';
import { authService } from '@/features/auth/services/authService';
import { ApiException } from '../utils/ApiException';
import { apiClient } from '@/lib/apiClient';

/* eslint-disable react-refresh/only-export-components */

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (credentials: UserCredentials) => Promise<{ success: boolean; error?: string }>;
  register: (userData: UserRegistrationInput) => Promise<boolean>;
  logout: () => Promise<void>;
  checkAuth: (silent?: boolean) => Promise<void>;
  verifyEmail: (token: string) => Promise<boolean>;
  resendVerification: (email: string) => Promise<boolean>;
  requestPhoneVerification: (phone: string) => Promise<boolean>;
  verifyPhone: (code: string) => Promise<boolean>;
  getPasswordResetOptions: () => Promise<PasswordResetOptions>;
  enableResetMethod: (methodType: string) => Promise<boolean>;
  disableResetMethod: (methodType: string) => Promise<boolean>;
  setupSecurityQuestions: (questions: SecurityQuestionSetup) => Promise<boolean>;
  generateRecoveryCodes: (count?: number) => Promise<string[]>;
  resetPasswordViaSecurityQuestions: (data: PasswordResetViaSecurityQuestions) => Promise<boolean>;
  resetPasswordViaRecoveryCode: (data: PasswordResetViaRecoveryCode) => Promise<boolean>;
  adminResetPassword: (data: AdminPasswordReset) => Promise<string>;
  googleAuth: (profile: GoogleUserProfile) => Promise<boolean>;
  refreshToken: () => Promise<boolean>;
  updateProfile: (profileData: UpdateProfileRequest) => Promise<boolean>;
  linkGoogle: (googleId: string) => Promise<boolean>;
  devModeLogin: () => void;
}

const defaultAuthContext: AuthContextType = {
  user: null,
  isAuthenticated: false,
  loading: true,
  login: async () => ({ success: false, error: 'AuthProvider not initialized' }),
  register: async () => false,
  logout: async () => {},
  checkAuth: async () => {},
  verifyEmail: async () => false,
  resendVerification: async () => false,
  requestPhoneVerification: async () => false,
  verifyPhone: async () => false,
  getPasswordResetOptions: async () => ({ availableMethods: [], enabledMethods: [], hasSecurityQuestions: false, recoveryCodesCount: 0 }),
  enableResetMethod: async () => false,
  disableResetMethod: async () => false,
  setupSecurityQuestions: async () => false,
  generateRecoveryCodes: async () => [],
  resetPasswordViaSecurityQuestions: async () => false,
  resetPasswordViaRecoveryCode: async () => false,
  adminResetPassword: async () => '',
  googleAuth: async () => false,
  refreshToken: async () => false,
  updateProfile: async () => false,
  linkGoogle: async () => false,
  devModeLogin: () => {},
};

const AuthContext = createContext<AuthContextType>(defaultAuthContext);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const { showError } = useNotifications();

  useEffect(() => {
    // Initialize token and user data from sessionStorage on app start
    const storedToken = sessionStorage.getItem('token');
    const storedUser = sessionStorage.getItem('user');
    
    if (storedToken) {
      apiClient.setAuthToken(storedToken);
      if (storedUser) {
        try {
          const userData = JSON.parse(storedUser);
          setUser(userData);
          setIsAuthenticated(true);
          setLoading(false);
          // Verify token in background without blocking UI
          checkAuth(true).catch(console.error);
          return;
        } catch (e) {
          console.warn('Invalid stored user data, falling back to auth check');
        }
      }
    }
    
    // Check if we should bypass auth in development
    const disableAuth = import.meta.env.VITE_DISABLE_AUTH === 'true';
    if (disableAuth) {
      // Automatically authenticate with dev user
      const devUser: User = {
        id: 1,
        username: 'dev_user',
        email: 'dev@example.com',
        name: 'Development User',
        role: 'admin',
        isEmailVerified: true,
        isPhoneVerified: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setUser(devUser);
      setIsAuthenticated(true);
      apiClient.setAuthToken('dev-mode-token');
      sessionStorage.setItem('user', JSON.stringify(devUser));
      setLoading(false);
    } else {
      checkAuth();
    }
  }, []);

  const checkAuth = async (silent: boolean = false) => {
    try {
      if (apiClient.isAuthenticated()) {
        const userData = await authService.getProfile();
        setUser(userData);
        setIsAuthenticated(true);
        // Update stored user data
        sessionStorage.setItem('user', JSON.stringify(userData));
      } else {
        setIsAuthenticated(false);
        setUser(null);
        sessionStorage.removeItem('user');
      }
    } catch (error) {
      // Only logout on authentication errors (401, 403), not on network/server errors
      if (error instanceof ApiException && error.isAuthError()) {
        // Try to refresh the token before logging out
        const refreshSuccess = await refreshToken();
        if (refreshSuccess) {
          try {
            // Try getProfile again with the refreshed token
            const userData = await authService.getProfile();
            setUser(userData);
            setIsAuthenticated(true);
            // Update stored user data
            sessionStorage.setItem('user', JSON.stringify(userData));
          } catch (retryError) {
            // If retry also fails, logout
            setIsAuthenticated(false);
            setUser(null);
            apiClient.setAuthToken(null);
            sessionStorage.removeItem('user');
          }
        } else {
          // Refresh failed, logout
          setIsAuthenticated(false);
          setUser(null);
          apiClient.setAuthToken(null);
          sessionStorage.removeItem('user');
        }
      } else {
        // For network/server errors, keep user logged in but show error (unless silent)
        console.warn('Auth check failed (keeping user logged in):', error);
        if (!silent) {
          // Only show error popup if not in silent mode
          showError('Connection Issue', 'Unable to verify authentication status. You may experience issues with some features.');
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials: UserCredentials): Promise<{ success: boolean; error?: string }> => {
    setLoading(true);
    try {
      const authResponse = await authService.login(credentials);

      // Defensive checks in case backend returns an unexpected shape
      if (!authResponse || !authResponse.tokens || !authResponse.tokens.accessToken) {
        const message = 'Authentication tokens missing from response';
        showError('Login Failed', message);
        return { success: false, error: message };
      }

      apiClient.setAuthToken(authResponse.tokens.accessToken);
      // Store refresh token
      sessionStorage.setItem('refreshToken', authResponse.tokens.refreshToken);

      // If backend returned user directly, use it; otherwise fetch profile
      if (authResponse.user) {
        setUser(authResponse.user);
        sessionStorage.setItem('user', JSON.stringify(authResponse.user));
      } else {
        try {
          const userData = await authService.getProfile();
          setUser(userData);
          sessionStorage.setItem('user', JSON.stringify(userData));
        } catch (err) {
          // Non-fatal: token is valid but profile fetch failed
          console.warn('Login succeeded but profile fetch failed', err);
        }
      }

      setIsAuthenticated(true);
      return { success: true };
    } catch (error: any) {
      const errorMessage = error?.message || 'Login failed';
      showError('Login Failed', errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData: UserRegistrationInput): Promise<boolean> => {
    try {
      await authService.register(userData);
      // Registration successful, but user needs to verify email/phone
      return true;
    } catch (_error) {
      return false;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await authService.logout();
    } catch (_error) {
      // Continue with logout even if API call fails
    } finally {
      setUser(null);
      setIsAuthenticated(false);
      apiClient.setAuthToken(null);
      sessionStorage.removeItem('refreshToken');
      sessionStorage.removeItem('user');
    }
  };

  const verifyEmail = async (token: string): Promise<boolean> => {
    try {
      await authService.verifyEmail(token);
      // Refresh user data after verification
      await checkAuth();
      return true;
    } catch (_error) {
      return false;
    }
  };

  const resendVerification = async (email: string): Promise<boolean> => {
    try {
      await authService.resendVerification(email);
      return true;
    } catch (_error) {
      return false;
    }
  };

  const requestPhoneVerification = async (phone: string): Promise<boolean> => {
    try {
      await authService.requestPhoneVerification(phone);
      return true;
    } catch (_error) {
      return false;
    }
  };

  const verifyPhone = async (code: string): Promise<boolean> => {
    try {
      await authService.verifyPhone(code);
      // Refresh user data after verification
      await checkAuth();
      return true;
    } catch (_error) {
      return false;
    }
  };

  const getPasswordResetOptions = async (): Promise<PasswordResetOptions> => {
    return await authService.getPasswordResetOptions();
  };

  const enableResetMethod = async (methodType: string): Promise<boolean> => {
    try {
      await authService.enableResetMethod(methodType);
      return true;
    } catch (_error) {
      return false;
    }
  };

  const disableResetMethod = async (methodType: string): Promise<boolean> => {
    try {
      await authService.disableResetMethod(methodType);
      return true;
    } catch (_error) {
      return false;
    }
  };

  const setupSecurityQuestions = async (questions: SecurityQuestionSetup): Promise<boolean> => {
    try {
      await authService.setupSecurityQuestions(questions);
      return true;
    } catch (_error) {
      return false;
    }
  };

  const generateRecoveryCodes = async (count?: number): Promise<string[]> => {
    const response = await authService.generateRecoveryCodes(count);
    return response.codes;
  };

  const resetPasswordViaSecurityQuestions = async (data: PasswordResetViaSecurityQuestions): Promise<boolean> => {
    try {
      await authService.resetPasswordViaSecurityQuestions(data);
      return true;
    } catch (_error) {
      return false;
    }
  };

  const resetPasswordViaRecoveryCode = async (data: PasswordResetViaRecoveryCode): Promise<boolean> => {
    try {
      await authService.resetPasswordViaRecoveryCode(data);
      return true;
    } catch (_error) {
      return false;
    }
  };

  const adminResetPassword = async (data: AdminPasswordReset): Promise<string> => {
    const response = await authService.adminResetPassword(data);
    return response.tempPassword;
  };

  const googleAuth = async (profile: GoogleUserProfile): Promise<boolean> => {
    try {
      const authResponse = await authService.googleAuth(profile);
      if (!authResponse || !authResponse.tokens || !authResponse.tokens.accessToken) {
        console.error('[AuthContext.googleAuth] Tokens missing in response', authResponse);
        return false;
      }
      setUser(authResponse.user);
      setIsAuthenticated(true);
      apiClient.setAuthToken(authResponse.tokens.accessToken);
      sessionStorage.setItem('refreshToken', authResponse.tokens.refreshToken);
      sessionStorage.setItem('user', JSON.stringify(authResponse.user));
      return true;
    } catch (error) {
      console.error('[AuthContext.googleAuth] Error:', error);
      return false;
    }
  };

  const refreshToken = async (): Promise<boolean> => {
    try {
      const refreshTokenValue = sessionStorage.getItem('refreshToken');
      if (!refreshTokenValue) {
        return false;
      }

      const authResponse = await authService.refreshToken(refreshTokenValue);
      if (!authResponse || !authResponse.tokens || !authResponse.tokens.accessToken) {
        // Invalid/empty response from refresh endpoint
        return false;
      }
      apiClient.setAuthToken(authResponse.tokens.accessToken);
      sessionStorage.setItem('refreshToken', authResponse.tokens.refreshToken);
      return true;
    } catch (_error) {
      // Token refresh failed, return false (don't logout here, let caller handle it)
      return false;
    }
  };

  const updateProfile = async (profileData: UpdateProfileRequest): Promise<boolean> => {
    try {
      const updatedUser = await authService.updateProfile(profileData);
      setUser(updatedUser);
      // Update stored user data
      sessionStorage.setItem('user', JSON.stringify(updatedUser));
      return true;
    } catch (_error) {
      return false;
    }
  };

  const linkGoogle = async (googleId: string): Promise<boolean> => {
    try {
      await authService.linkGoogle(googleId);
      // Refresh user data after linking
      await checkAuth();
      return true;
    } catch (_error) {
      return false;
    }
  };

  const devModeLogin = (): void => {
    // Only allow in development mode
    if (import.meta.env.DEV) {
      const mockUser: User = {
        id: 1,
        username: 'dev_user',
        email: 'dev@example.com',
        name: 'Development User',
        role: 'admin',
        isEmailVerified: true,
        isPhoneVerified: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      setUser(mockUser);
      setIsAuthenticated(true);
      // Set a mock token for API calls
      apiClient.setAuthToken('dev-mode-token');
      // Store mock user data
      sessionStorage.setItem('user', JSON.stringify(mockUser));
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated,
    loading,
    login,
    register,
    logout,
    checkAuth,
    verifyEmail,
    resendVerification,
    requestPhoneVerification,
    verifyPhone,
    getPasswordResetOptions,
    enableResetMethod,
    disableResetMethod,
    setupSecurityQuestions,
    generateRecoveryCodes,
    resetPasswordViaSecurityQuestions,
    resetPasswordViaRecoveryCode,
    adminResetPassword,
    googleAuth,
    refreshToken,
    updateProfile,
    linkGoogle,
    devModeLogin,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
};