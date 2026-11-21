import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import * as SplashScreen from 'expo-splash-screen';
import { User, LoginPayload, RegisterPayload } from '@/types/user.types';
import { AuthService } from '@/services/auth.service';
import { Storage } from '@/utils/storage';
import { setUnauthorizedHandler } from '@/services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (payload: LoginPayload) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<string>;
  logout: () => Promise<void>;
  reloadProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const logout = useCallback(async () => {
    try {
      await Storage.clearAuth();
    } finally {
      setToken(null);
      setUser(null);
    }
  }, []);

  // Sync unauthorized 401 callback with logout
  useEffect(() => {
    setUnauthorizedHandler(() => {
      setToken(null);
      setUser(null);
    });
  }, []);

  // Load persisted session on app startup
  useEffect(() => {
    async function loadPersistedAuth() {
      try {
        const [savedToken, savedUser] = await Promise.all([
          Storage.getToken(),
          Storage.getUser(),
        ]);

        if (savedToken) {
          setToken(savedToken);
          if (savedUser) {
            setUser(savedUser);
          }
          // Optionally verify profile in background
          try {
            const freshUser = await AuthService.getProfile();
            setUser(freshUser);
            await Storage.saveUser(freshUser);
          } catch (profileErr) {
            console.warn('[AuthProvider] Profile refresh error:', profileErr);
          }
        }
      } catch (err) {
        console.warn('[AuthProvider] Auth restoration failed:', err);
      } finally {
        setIsLoading(false);
        try {
          await SplashScreen.hideAsync();
        } catch {
          // ignore if splash screen was already hidden
        }
      }
    }

    loadPersistedAuth();
  }, []);

  const login = async (payload: LoginPayload) => {
    const data = await AuthService.login(payload);
    await Storage.saveToken(data.token);
    await Storage.saveUser(data.user);
    setToken(data.token);
    setUser(data.user);
  };

  const register = async (payload: RegisterPayload): Promise<string> => {
    const res = await AuthService.register(payload);
    return res.message;
  };

  const reloadProfile = async () => {
    if (!token) return;
    try {
      const freshUser = await AuthService.getProfile();
      setUser(freshUser);
      await Storage.saveUser(freshUser);
    } catch (err) {
      console.warn('[AuthProvider] reloadProfile failed:', err);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated: !!token && !!user,
        login,
        register,
        logout,
        reloadProfile,
      }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
