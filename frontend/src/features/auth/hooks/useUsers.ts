import { useState, useEffect, useCallback } from 'react';
import type { User, UserInput, UserLoginInput } from '@/features/auth/types/user';
import { useApi, useApiMutation } from '@/hooks/useApi';
import { userService } from '@/features/auth/services/userService';

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const checkAuthStatus = useCallback(async () => {
    try {
      if (userService.isAuthenticated()) {
        const response = await userService.getProfile();
        if (response.success) {
          setUser(response.data!);
          setIsAuthenticated(true);
        } else {
          // Token might be invalid
          userService.logout();
          setIsAuthenticated(false);
          setUser(null);
        }
      } else {
        setIsAuthenticated(false);
        setUser(null);
      }
    } catch (_error) {
      setIsAuthenticated(false);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Initialize auth state
    userService.initializeAuth();
    checkAuthStatus();
  }, [checkAuthStatus]);

  const login = useCallback(async (credentials: UserLoginInput) => {
    const response = await userService.login(credentials);
    if (response.success) {
      setUser(response.data!.user);
      setIsAuthenticated(true);
    }
    return response;
  }, []);

  const logout = useCallback(() => {
    userService.logout();
    setUser(null);
    setIsAuthenticated(false);
  }, []);

  return {
    user,
    isAuthenticated,
    loading,
    login,
    logout,
    checkAuthStatus,
  };
}

export function useUserProfile() {
  const query = useCallback(() => userService.getProfile(), []);
  return useApi<User>(query);
}

export function useUser(id: string | null | undefined) {
  const query = useCallback(() => {
    if (!id || !id.trim()) {
      return Promise.resolve({ success: true, data: undefined, error: undefined });
    }
    return userService.getUserById(id);
  }, [id]);
  return useApi<User>(query, [id]);
}

export function useRegister() {
  return useApiMutation<User, UserInput>((userData) => userService.register(userData));
}

export function useUsers() {
  const query = useCallback(() => userService.getAllUsers(), []);
  const apiResult = useApi<User[] | {users: User[]}>(query);

  // Support both API response shapes: either `User[]` or `{ users: User[] }`
  let usersData: User[] | null = null;
  if (Array.isArray(apiResult.data)) usersData = apiResult.data as User[];
  else usersData = (apiResult.data as any)?.users || null;

  return {
    ...apiResult,
    data: usersData,
  };
}