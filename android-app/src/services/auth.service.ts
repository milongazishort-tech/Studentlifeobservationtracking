import apiClient from './api';
import { User, LoginPayload, RegisterPayload, AuthSuccessData } from '@/types/user.types';
import { ApiSuccessResponse } from '@/types/api.types';

export const AuthService = {
  /**
   * Log in user and receive JWT + profile
   * POST /api/v1/auth/login
   */
  async login(payload: LoginPayload): Promise<AuthSuccessData> {
    const response = await apiClient.post<ApiSuccessResponse<AuthSuccessData>>('/auth/login', payload);
    return response.data.data;
  },

  /**
   * Register a new student
   * POST /api/v1/auth/register
   */
  async register(payload: RegisterPayload): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.post<ApiSuccessResponse<null>>('/auth/register', payload);
    return {
      success: true,
      message: response.data.message || 'Registration successful. Please verify your email before logging in.',
    };
  },

  /**
   * Dispatch password reset email
   * POST /api/v1/auth/forgot-password
   */
  async forgotPassword(email: string): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.post<ApiSuccessResponse<null>>('/auth/forgot-password', { email });
    return {
      success: true,
      message: response.data.message || 'If the account exists, a password reset link has been dispatched.',
    };
  },

  /**
   * Fetch current authenticated profile
   * GET /api/v1/users/me
   */
  async getProfile(): Promise<User> {
    const response = await apiClient.get<ApiSuccessResponse<User>>('/users/me');
    return response.data.data;
  },
};

export default AuthService;
