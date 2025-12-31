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
  login: (credentials: UserCredentials) => Promise<{ success: boolean; error?: string; fieldErrors?: Record<string, string[]> }>;
  register: (userData: UserRegistrationInput) => Promise<{ success: boolean; error?: string; fieldErrors?: Record<string, string[]> }>; 
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
  resetPasswordViaSecurityQuestions: (data: PasswordResetViaSecurityQuestions) => Promise<{ success: boolean; error?: string; fieldErrors?: Record<string, string[]> }>;
  resetPasswordViaRecoveryCode: (data: PasswordResetViaRecoveryCode) => Promise<{ success: boolean; error?: string; fieldErrors?: Record<string, string[]> }>;
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
  register: async () => ({ success: false, error: 'AuthProvider not initialized' as string }),
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
  resetPasswordViaSecurityQuestions: async () => ({ success: false, error: 'AuthProvider not initialized' }),
  resetPasswordViaRecoveryCode: async () => ({ success: false, error: 'AuthProvider not initialized' }),
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
    // On app start: prefer using an existing access token from sessionStorage to avoid unnecessary refreshes.
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
      return;
    }

    // If an access token exists in sessionStorage and is not expired, reuse it
    const storedToken = sessionStorage.getItem('accessToken');
    const storedExp = sessionStorage.getItem('accessTokenExp');
    if (storedToken && storedExp) {
      const expMs = parseInt(storedExp, 10);
      if (!Number.isNaN(expMs) && Date.now() < expMs - 30000) { // keep a 30s buffer
        apiClient.setAuthToken(storedToken);
        // Verify token by fetching profile in background
        (async () => {
          try {
            const userData = await authService.getProfile();
            setUser(userData);
            setIsAuthenticated(true);
            sessionStorage.setItem('user', JSON.stringify(userData));
          } catch (err) {
            // If token isn't valid, fall back to silent refresh
            console.warn('Stored token invalid, attempting silent refresh', err);
            try {
              const refreshSuccess = await refreshToken();
              if (refreshSuccess) {
                await checkAuth(true);
                return;
              }
            } catch (e) {
              console.warn('Silent refresh failed', e);
            }
            await checkAuth();
          } finally {
            setLoading(false);
          }
        })();
        return;
      }
    }

    // No valid stored token -> try silent refresh via cookie (or request token from other tab)
    (async () => {
      try {
        // First, actively ask other tabs to provide an existing access token so we can avoid triggering a refresh.
        // This reduces duplicate refreshes and therefore extra JTI entries when opening new tabs.
        const provided = await requestTokenFromOtherTab(1000);
        if (provided) {
          // Token received from another tab — apply and verify profile
          apiClient.setAuthToken(provided.token);
          sessionStorage.setItem('accessToken', provided.token);
          if (provided.accessTokenExp) sessionStorage.setItem('accessTokenExp', String(provided.accessTokenExp));
          try {
            const userData = await authService.getProfile();
            setUser(userData);
            setIsAuthenticated(true);
            sessionStorage.setItem('user', JSON.stringify(userData));
            setLoading(false);
            return;
          } catch (_err) {
            // If profile fetch fails, fall through to attempt refresh
          }
        }

        // If no token was provided by other tabs, wait briefly to see if another tab refreshes and broadcasts the new token.
        const notified = await waitForRefreshNotification(1000); // wait up to 1s for other tab to refresh
        if (notified) {
          const storedToken = sessionStorage.getItem('accessToken');
          if (storedToken) {
            apiClient.setAuthToken(storedToken);
            try {
              const userData = await authService.getProfile();
              setUser(userData);
              setIsAuthenticated(true);
              sessionStorage.setItem('user', JSON.stringify(userData));
              setLoading(false);
              return;
            } catch (_err) {
              // If profile fetch fails, fall through to attempt refresh
            }
          }
        }

        const refreshSuccess = await refreshToken();
        if (refreshSuccess) {
          await checkAuth(true);
          return;
        }
      } catch (err) {
        console.warn('Silent refresh failed', err);
      }
      await checkAuth();
    })();
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

  const login = async (credentials: UserCredentials): Promise<{ success: boolean; error?: string; fieldErrors?: Record<string, string[]> }> => {
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
      // Persist access token and expiry so reloads don't immediately trigger refresh
      try {
        const expMs = getJwtExpiryMs(authResponse.tokens.accessToken);
        if (expMs) {
          sessionStorage.setItem('accessToken', authResponse.tokens.accessToken);
          sessionStorage.setItem('accessTokenExp', String(expMs));
          try {
            const sid = getJwtClaim(authResponse.tokens.accessToken, 'sid');
            if (sid) sessionStorage.setItem('sessionId', sid);
          } catch (_e) { }
        }
      } catch (_e) {
        // ignore parsing errors
      }
      // Refresh token is set in an HttpOnly cookie by the backend; do not store it in JS storage.

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
      let fieldErrors: Record<string, string[]> | undefined = undefined;
      if (error instanceof ApiException) {
        const fe = error.getFieldErrors?.();
        if (fe) fieldErrors = fe;
      }
      showError('Login Failed', errorMessage);
      return { success: false, error: errorMessage, fieldErrors };
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData: UserRegistrationInput): Promise<{ success: boolean; error?: string; fieldErrors?: Record<string, string[]> }> => {
    try {
      await authService.register(userData);
      // Registration successful, but user needs to verify email/phone
      return { success: true };
    } catch (error: any) {
      let errorMessage = 'Registration failed. Please try again.';
      let fieldErrors: Record<string, string[]> | undefined = undefined;
      if (error instanceof ApiException) {
        if (error.message) errorMessage = error.message;
        const fe = error.getFieldErrors?.();
        if (fe) fieldErrors = fe;
      } else if (error?.message) {
        errorMessage = error.message;
      }
      return { success: false, error: errorMessage, fieldErrors };
    }
  }; 

  // Clear local auth state without calling server
  const clearLocalAuth = (): void => {
    setUser(null);
    setIsAuthenticated(false);
    apiClient.setAuthToken(null);
    sessionStorage.removeItem('user');
    sessionStorage.removeItem('accessToken');
    sessionStorage.removeItem('accessTokenExp');
    sessionStorage.removeItem('sessionId');
  };

  const logout = async (): Promise<void> => {
    try {
      await authService.logout();
      // Notify other tabs
      try { if (typeof BroadcastChannel !== 'undefined') new BroadcastChannel('auth-refresh').postMessage({ type: 'logged-out' }); } catch (_e) {}
    } catch (_error) {
      // Continue with logout even if API call fails
    } finally {
      clearLocalAuth();
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

  const resetPasswordViaSecurityQuestions = async (data: PasswordResetViaSecurityQuestions): Promise<{ success: boolean; error?: string; fieldErrors?: Record<string, string[]> }> => {
    try {
      await authService.resetPasswordViaSecurityQuestions(data);
      return { success: true };
    } catch (error: any) {
      let errorMessage = 'Password reset failed';
      let fieldErrors: Record<string, string[]> | undefined = undefined;
      if (error instanceof ApiException) {
        if (error.message) errorMessage = error.message;
        const fe = error.getFieldErrors?.();
        if (fe) fieldErrors = fe;
      } else if (error?.message) {
        errorMessage = error.message;
      }
      return { success: false, error: errorMessage, fieldErrors };
    }
  };

  const resetPasswordViaRecoveryCode = async (data: PasswordResetViaRecoveryCode): Promise<{ success: boolean; error?: string; fieldErrors?: Record<string, string[]> }> => {
    try {
      await authService.resetPasswordViaRecoveryCode(data);
      return { success: true };
    } catch (error: any) {
      let errorMessage = 'Password reset failed';
      let fieldErrors: Record<string, string[]> | undefined = undefined;
      if (error instanceof ApiException) {
        if (error.message) errorMessage = error.message;
        const fe = error.getFieldErrors?.();
        if (fe) fieldErrors = fe;
      } else if (error?.message) {
        errorMessage = error.message;
      }
      return { success: false, error: errorMessage, fieldErrors };
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
      // Persist access token and expiry so reloads don't immediately refresh
      try {
        const expMs = getJwtExpiryMs(authResponse.tokens.accessToken);
        if (expMs) {
          sessionStorage.setItem('accessToken', authResponse.tokens.accessToken);
          sessionStorage.setItem('accessTokenExp', String(expMs));
          try { const sid = getJwtClaim(authResponse.tokens.accessToken, 'sid'); if (sid) sessionStorage.setItem('sessionId', sid); } catch (_e) { }
        }
      } catch (_e) {
        // ignore
      }
      sessionStorage.setItem('user', JSON.stringify(authResponse.user));
      // Notify other tabs
      if (bc) bc.postMessage({ type: 'refreshed' });
      return true;
    } catch (error) {
      console.error('[AuthContext.googleAuth] Error:', error);
      return false;
    }
  };

  // Cross-tab refresh lock + notification
  const REFRESH_LOCK_KEY = 'auth:refresh_lock';
  const LOCK_TIMEOUT_MS = 10000; // consider lock stale after 10s
  const ACQUIRE_TIMEOUT_MS = 4000; // wait up to 4s to acquire lock
  const POLL_INTERVAL_MS = 200;
  const tabId = React.useMemo(() => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2,8)}`, []);
  // BroadcastChannel used across the app for auth events. We also listen for session-specific events.
  const bc = React.useMemo(() => (typeof BroadcastChannel !== 'undefined' ? new BroadcastChannel('auth-refresh') : null), []);

  React.useEffect(() => {
    if (!bc) return undefined;
    const onMsg = (ev: MessageEvent) => {
      const data = ev?.data as any;
      if (!data || !data.type) return;
      if (data.type === 'refreshed') {
        // Another tab refreshed: read stored access token and apply
        const storedToken = sessionStorage.getItem('accessToken');
        const storedExp = sessionStorage.getItem('accessTokenExp');
        if (storedToken && storedExp) {
          apiClient.setAuthToken(storedToken);
          setIsAuthenticated(true);
          // Try to refresh user profile non-blocking
          authService.getProfile().then(u => {
            setUser(u);
            sessionStorage.setItem('user', JSON.stringify(u));
          }).catch(() => {
            // If profile fails, we'll let the app's normal checks handle it
          });
        }
        return;
      }

      if (data.type === 'session-revoked') {
        try {
          const currentSession = sessionStorage.getItem('sessionId');
          if (currentSession && currentSession === String(data.sessionId)) {
            // Our active session was revoked elsewhere — clear local auth immediately
            clearLocalAuth();
          }
        } catch (_e) {
          // ignore
        }
        return;
      }

      if (data.type === 'logged-out' || data.type === 'logout-all') {
        // Another tab logged out or logged out all sessions — clear local state without calling server
        clearLocalAuth();
        return;
      }

      if (data.type === 'request-token') {
        // Another tab is asking for an access token. Respond only if we have a valid token and are authenticated.
        try {
          if (!data.requester || data.requester === tabId) return; // ignore self
          const token = apiClient.getAuthToken() || sessionStorage.getItem('accessToken');
          if (!token) return;
          const expMs = sessionStorage.getItem('accessTokenExp') ? Number(sessionStorage.getItem('accessTokenExp')) : getJwtExpiryMs(token);
          // Only share if token has at least 30s remaining to avoid sending nearly-expired tokens
          if (!expMs || (expMs - Date.now() < 30000)) return;
          // Target the response to the requesting tab
          bc.postMessage({ type: 'provide-token', token, accessTokenExp: expMs, requester: data.requester });
        } catch (_e) {
          // ignore
        }
        return;
      }

      if (data.type === 'provide-token') {
        // A token has been provided in response to our request; only act when it's targeted to this tab
        try {
          if (!data.requester || data.requester !== tabId) return;
          const token = data.token as string | undefined;
          const exp = data.accessTokenExp ? Number(data.accessTokenExp) : undefined;
          if (!token) return;

          // Apply token and fetch profile non-blocking
          apiClient.setAuthToken(token);
          if (exp) sessionStorage.setItem('accessTokenExp', String(exp));
          sessionStorage.setItem('accessToken', token);
          authService.getProfile().then(u => {
            setUser(u);
            setIsAuthenticated(true);
            sessionStorage.setItem('user', JSON.stringify(u));
          }).catch(() => { /* ignore */ });
        } catch (_e) {
          // ignore
        }
        return;
      }
    };
    bc.addEventListener('message', onMsg as any);
    return () => bc.removeEventListener('message', onMsg as any);
  }, [bc]);

  const acquireRefreshLock = async (timeout = ACQUIRE_TIMEOUT_MS): Promise<boolean> => {
    const start = Date.now();
    while (Date.now() - start < timeout) {
      const raw = localStorage.getItem(REFRESH_LOCK_KEY);
      if (!raw) {
        localStorage.setItem(REFRESH_LOCK_KEY, JSON.stringify({ tabId, ts: Date.now() }));
        // confirm we own it
        const check = localStorage.getItem(REFRESH_LOCK_KEY);
        if (check) {
          const obj = JSON.parse(check);
          if (obj.tabId === tabId) return true;
        }
      } else {
        try {
          const obj = JSON.parse(raw);
          if (Date.now() - (obj.ts || 0) > LOCK_TIMEOUT_MS) {
            // stale - steal
            localStorage.setItem(REFRESH_LOCK_KEY, JSON.stringify({ tabId, ts: Date.now() }));
            const check = localStorage.getItem(REFRESH_LOCK_KEY);
            if (check) {
              const obj2 = JSON.parse(check);
              if (obj2.tabId === tabId) return true;
            }
          }
        } catch (_e) {
          // corrupt value - overwrite
          localStorage.setItem(REFRESH_LOCK_KEY, JSON.stringify({ tabId, ts: Date.now() }));
          const check = localStorage.getItem(REFRESH_LOCK_KEY);
          if (check) {
            const obj2 = JSON.parse(check);
            if (obj2.tabId === tabId) return true;
          }
        }
      }
      await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS));
    }
    return false;
  };

  const releaseRefreshLock = (): void => {
    const raw = localStorage.getItem(REFRESH_LOCK_KEY);
    if (!raw) return;
    try {
      const obj = JSON.parse(raw);
      if (obj.tabId === tabId) {
        localStorage.removeItem(REFRESH_LOCK_KEY);
        if (bc) bc.postMessage({ type: 'refreshed' });
      }
    } catch (_e) {
      localStorage.removeItem(REFRESH_LOCK_KEY);
      if (bc) bc.postMessage({ type: 'refreshed' });
    }
  };

  // Wait for another tab's refresh notification up to timeout
  const waitForRefreshNotification = async (timeout = 5000): Promise<boolean> => {
    if (!bc) return false;
    return new Promise((resolve) => {
      let done = false;
      const timer = setTimeout(() => {
        if (!done) {
          done = true;
          resolve(false);
        }
      }, timeout);
      const onMsg = (ev: MessageEvent) => {
        if (ev?.data?.type === 'refreshed') {
          if (!done) {
            done = true;
            clearTimeout(timer);
            resolve(true);
          }
        }
      };
      bc.addEventListener('message', onMsg as any);
      // Cleanup handler after promise resolves
      (async () => {
        const res = await Promise.resolve();
        if (res) { /* noop to satisfy lint */ }
      })();
    });
  };

  // Request an existing access token from other tabs. Returns { token, accessTokenExp } or null if none provided within timeout
  const requestTokenFromOtherTab = async (timeout = 1000): Promise<{ token: string; accessTokenExp?: number } | null> => {
    if (!bc) return null;
    return new Promise((resolve) => {
      let done = false;
      const timer = setTimeout(() => {
        if (!done) {
          done = true;
          resolve(null);
        }
      }, timeout);

      const onMsg = (ev: MessageEvent) => {
        const data = ev?.data as any;
        if (!data || data.type !== 'provide-token') return;
        // Only accept tokens targeted to this tab
        if (data.requester !== tabId) return;
        if (!done) {
          done = true;
          clearTimeout(timer);
          try {
            const token = data.token as string;
            const exp = data.accessTokenExp ? Number(data.accessTokenExp) : undefined;
            resolve({ token, accessTokenExp: exp });
          } catch (_e) {
            resolve(null);
          }
        }
      };

      bc.addEventListener('message', onMsg as any);
      // Broadcast request to other tabs
      bc.postMessage({ type: 'request-token', requester: tabId });

      // Cleanup is handled by timer resolution/path above
    });
  };

  const saveAccessToken = (token: string) => {
    apiClient.setAuthToken(token);
    const exp = getJwtExpiryMs(token);
    if (exp) {
      sessionStorage.setItem('accessToken', token);
      sessionStorage.setItem('accessTokenExp', String(exp));
      try {
        const sid = getJwtClaim(token, 'sid');
        if (sid) sessionStorage.setItem('sessionId', sid);
      } catch (_e) { }
    }
  };

  const refreshToken = async (): Promise<boolean> => {
    try {
      // Acquire cross-tab lock so only one tab attempts refresh
      const locked = await acquireRefreshLock();
      if (locked) {
        try {
          const authResponse = await authService.refreshToken();
          if (!authResponse || !authResponse.tokens || !authResponse.tokens.accessToken) {
            releaseRefreshLock();
            return false;
          }
          saveAccessToken(authResponse.tokens.accessToken);
          // Notify other tabs
          if (bc) bc.postMessage({ type: 'refreshed' });
          return true;
        } finally {
          releaseRefreshLock();
        }
      } else {
        // Another tab is likely refreshing; wait for notification
        const notified = await waitForRefreshNotification();
        if (notified) {
          // Assume token refreshed by other tab; attempt to read new access token from storage
          const storedToken = sessionStorage.getItem('accessToken');
          if (storedToken) {
            apiClient.setAuthToken(storedToken);
            try {
              const userData = await authService.getProfile();
              setUser(userData);
              setIsAuthenticated(true);
              sessionStorage.setItem('user', JSON.stringify(userData));
              return true;
            } catch (_err) {
              return false;
            }
          }
          return false;
        }
        // No notification - fallback to trying to refresh ourselves once
        const locked2 = await acquireRefreshLock();
        if (!locked2) return false;
        try {
          const authResponse = await authService.refreshToken();
          if (!authResponse || !authResponse.tokens || !authResponse.tokens.accessToken) {
            return false;
          }
          saveAccessToken(authResponse.tokens.accessToken);
          if (bc) bc.postMessage({ type: 'refreshed' });
          return true;
        } finally {
          releaseRefreshLock();
        }
      }
    } catch (_error) {
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
      sessionStorage.setItem('accessToken', 'dev-mode-token');
      sessionStorage.setItem('accessTokenExp', String(Date.now() + 60 * 60 * 1000));
      // Store mock user data
      sessionStorage.setItem('user', JSON.stringify(mockUser));
    }
  };

  // Utility: decode JWT expiry (exp in seconds) -> milliseconds since epoch
  const getJwtExpiryMs = (token: string): number | null => {
    try {
      const parts = token.split('.');
      if (parts.length < 2) return null;
      const payload = parts[1];
      // base64 url -> base64
      const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
      const pad = base64.length % 4;
      const padded = base64 + (pad ? '='.repeat(4 - pad) : '');
      const json = JSON.parse(atob(padded));
      if (!json.exp) return null;
      return json.exp * 1000;
    } catch {
      return null;
    }
  };

  // Read an arbitrary claim from a JWT payload (no validation, just base64 decode)
  const getJwtClaim = (token: string, claimName: string): string | null => {
    try {
      const parts = token.split('.');
      if (parts.length < 2) return null;
      const payload = parts[1];
      const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
      const pad = base64.length % 4;
      const padded = base64 + (pad ? '='.repeat(4 - pad) : '');
      const json = JSON.parse(atob(padded));
      const val = json[claimName];
      if (val == null) return null;
      return String(val);
    } catch {
      return null;
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