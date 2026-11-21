'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/axios';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore session from localStorage on initial load
  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        const storedToken = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');

        if (storedToken) {
          setToken(storedToken);
          if (storedUser) {
            setUser(JSON.parse(storedUser));
          }
        }
      }
    } catch (err) {
      console.error('[AuthContext] Error restoring session:', err);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Login handler
  const login = useCallback(async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      const { token: receivedToken, user: receivedUser } = response.data.data;

      localStorage.setItem('token', receivedToken);
      localStorage.setItem('user', JSON.stringify(receivedUser));

      setToken(receivedToken);
      setUser(receivedUser);

      return { success: true, data: response.data.data };
    } catch (error) {
      const errorMessage =
        error.response?.data?.error?.message ||
        error.response?.data?.message ||
        'Login failed. Please check your credentials.';
      const errorCode = error.response?.data?.error?.code || 'LOGIN_FAILED';
      return { success: false, error: errorMessage, code: errorCode };
    }
  }, []);

  // Register handler
  const register = useCallback(async (userData) => {
    try {
      const response = await api.post('/auth/register', userData);
      return { success: true, data: response.data.data, message: response.data.message };
    } catch (error) {
      const errorMessage =
        error.response?.data?.error?.message ||
        error.response?.data?.message ||
        'Registration failed. Please review your information.';
      const errorCode = error.response?.data?.error?.code || 'REGISTRATION_FAILED';
      return { success: false, error: errorMessage, code: errorCode };
    }
  }, []);

  // Email verification handler
  const verifyEmail = useCallback(async (verificationToken) => {
    try {
      const response = await api.post('/auth/verify-email', { token: verificationToken });
      return { success: true, message: response.data.message };
    } catch (error) {
      const errorMessage =
        error.response?.data?.error?.message || 'Email verification failed.';
      return { success: false, error: errorMessage };
    }
  }, []);

  // Forgot password handler
  const forgotPassword = useCallback(async (email) => {
    try {
      const response = await api.post('/auth/forgot-password', { email });
      return { success: true, message: response.data.message };
    } catch (error) {
      const errorMessage =
        error.response?.data?.error?.message || 'Failed to request password reset.';
      return { success: false, error: errorMessage };
    }
  }, []);

  // Reset password handler
  const resetPassword = useCallback(async (resetToken, newPassword) => {
    try {
      const response = await api.post('/auth/reset-password', {
        token: resetToken,
        newPassword,
      });
      return { success: true, message: response.data.message };
    } catch (error) {
      const errorMessage =
        error.response?.data?.error?.message || 'Failed to reset password.';
      return { success: false, error: errorMessage };
    }
  }, []);

  // Profile update handler
  const updateProfile = useCallback(async (profileData) => {
    try {
      const response = await api.put('/users/me', profileData);
      const updatedUser = response.data.data;
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      return { success: true, data: updatedUser };
    } catch (error) {
      const errorMessage =
        error.response?.data?.error?.message || 'Failed to update profile.';
      return { success: false, error: errorMessage };
    }
  }, []);

  // Fetch / Refresh current user profile
  const refreshUser = useCallback(async () => {
    try {
      const response = await api.get('/users/me');
      const freshUser = response.data.data;
      setUser(freshUser);
      localStorage.setItem('user', JSON.stringify(freshUser));
      return { success: true, data: freshUser };
    } catch (error) {
      console.warn('[AuthContext] Failed to refresh user profile:', error);
      return { success: false };
    }
  }, []);

  // Logout handler
  const logout = useCallback(() => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
    setToken(null);
    setUser(null);
    router.push('/login');
  }, [router]);

  const value = {
    user,
    token,
    isAuthenticated: Boolean(token),
    isLoading,
    login,
    register,
    verifyEmail,
    forgotPassword,
    resetPassword,
    updateProfile,
    refreshUser,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
