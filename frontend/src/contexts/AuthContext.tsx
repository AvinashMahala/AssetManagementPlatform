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
} from '../services/authService';
import { authService } from '../services/authService';
import { apiClient } from '../services/apiClient';

/* eslint-disable react-refresh/only-export-components */

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (credentials: UserCredentials) => Promise<{ success: boolean; error?: string }>;
  register: (userData: UserRegistrationInput) => Promise<boolean>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
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
    // Initialize token from localStorage on app start
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      apiClient.setAuthToken(storedToken);
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
      setLoading(false);
    } else {
      checkAuth();
    }
  }, []);

  const checkAuth = async () => {
    try {
      if (apiClient.isAuthenticated()) {
        const userData = await authService.getProfile();
        setUser(userData);
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
        setUser(null);
      }
    } catch (_error) {
      setIsAuthenticated(false);
      setUser(null);
      apiClient.setAuthToken(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials: UserCredentials): Promise<{ success: boolean; error?: string }> => {
    setLoading(true);
    try {
      const authResponse = await authService.login(credentials);
      setUser(authResponse.user);
      setIsAuthenticated(true);
      apiClient.setAuthToken(authResponse.tokens.accessToken);
      // Store refresh token in localStorage or secure storage
      localStorage.setItem('refreshToken', authResponse.tokens.refreshToken);
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
      localStorage.removeItem('refreshToken');
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
      console.log('[AuthContext.googleAuth] Starting Google auth with profile:', profile);
      const authResponse = await authService.googleAuth(profile);
      console.log('[AuthContext.googleAuth] Auth response received:', authResponse);
      setUser(authResponse.user);
      setIsAuthenticated(true);
      apiClient.setAuthToken(authResponse.tokens.accessToken);
      localStorage.setItem('refreshToken', authResponse.tokens.refreshToken);
      console.log('[AuthContext.googleAuth] Success! User:', authResponse.user);
      return true;
    } catch (error) {
      console.error('[AuthContext.googleAuth] Error:', error);
      return false;
    }
  };

  const refreshToken = async (): Promise<boolean> => {
    try {
      const refreshTokenValue = localStorage.getItem('refreshToken');
      if (!refreshTokenValue) {
        return false;
      }

      const authResponse = await authService.refreshToken(refreshTokenValue);
      apiClient.setAuthToken(authResponse.tokens.accessToken);
      localStorage.setItem('refreshToken', authResponse.tokens.refreshToken);
      return true;
    } catch (_error) {
      // Token refresh failed, logout user
      await logout();
      return false;
    }
  };

  const updateProfile = async (profileData: UpdateProfileRequest): Promise<boolean> => {
    try {
      const updatedUser = await authService.updateProfile(profileData);
      setUser(updatedUser);
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