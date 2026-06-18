import React, { createContext, useContext, useState, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { api, setAuthToken, type User } from '../api';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  login: (token: string, user: User) => void;
  establishSession: () => Promise<User | null>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const queryClient = useQueryClient();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const parseMeResponse = (res: any): { user: User | null; token: string | null } => ({
    user: res?.data?.user ?? res?.user ?? null,
    token: res?.data?.token ?? res?.token ?? null,
  });

  const establishSession = useCallback(async (): Promise<User | null> => {
    try {
      const res = await api.get<any>('/auth/me');
      const { user: u, token: tk } = parseMeResponse(res);
      if (tk) setAuthToken(tk);
      if (u) {
        setUser(u);
        return u;
      }
      setUser(null);
      return null;
    } catch {
      setAuthToken(null);
      setUser(null);
      return null;
    }
  }, []);

  // Hydrate session on mount (cookie or stored token)
  React.useEffect(() => {
    const initSession = async () => {
      try {
        await establishSession();
      } finally {
        setIsLoading(false);
      }
    };
    initSession();
  }, [establishSession]);

  const login = useCallback((token: string, userData: User) => {
    setAuthToken(token);
    setUser(userData);
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      // ignore errors on logout
    }
    setAuthToken(null);
    setUser(null);
    queryClient.clear();
  }, [queryClient]);

  const refreshUser = useCallback(async () => {
    await establishSession();
  }, [establishSession]);

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      isAdmin: user?.role === 'SUPER_ADMIN',
      isLoading,
      login,
      establishSession,
      logout,
      refreshUser,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
