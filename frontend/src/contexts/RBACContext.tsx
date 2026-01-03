import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { useAuthContext } from './AuthContext';
import { authService } from '@/features/auth/services/authService';

interface RBACContextType {
  roles: string[];
  permissions: Set<string>;
  loading: boolean;
  refresh: () => Promise<void>;
  can: (permission: string) => boolean;
}

const defaultValue: RBACContextType = {
  roles: [],
  permissions: new Set<string>(),
  loading: true,
  refresh: async () => {},
  can: () => false,
};

const RBACContext = createContext<RBACContextType>(defaultValue);

export const useRBACContext = () => useContext(RBACContext);
export const useCan = (permission: string) => {
  const ctx = useRBACContext();
  return ctx.permissions.has(permission);
};

interface RBACProviderProps {
  children: ReactNode;
}

export const RBACProvider: React.FC<RBACProviderProps> = ({ children }) => {
  const { isAuthenticated } = useAuthContext();
  const [roles, setRoles] = useState<string[]>([]);
  const [permissions, setPermissions] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState<boolean>(true);

  const refresh = async () => {
    setLoading(true);
    try {
      const session = await authService.getSession();
      setRoles(session.roles || []);
      setPermissions(new Set(session.permissions || []));
    } catch (err) {
      setRoles([]);
      setPermissions(new Set());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      // fetch session when user becomes authenticated
      refresh();
    } else {
      setRoles([]);
      setPermissions(new Set());
      setLoading(false);
    }
  }, [isAuthenticated]);

  const value: RBACContextType = {
    roles,
    permissions,
    loading,
    refresh,
    can: (perm: string) => permissions.has(perm),
  };

  return <RBACContext.Provider value={value}>{children}</RBACContext.Provider>;
};