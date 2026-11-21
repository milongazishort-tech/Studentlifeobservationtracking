import apiClient from './api';
import { User, UpdateProfilePayload } from '@/types/user.types';
import { ApiSuccessResponse } from '@/types/api.types';

export const UserService = {
  /**
   * Fetch current authenticated student profile
   * GET /api/v1/users/me
   */
  async getProfile(): Promise<User> {
    const response = await apiClient.get<ApiSuccessResponse<User>>('/users/me');
    return response.data.data;
  },

  /**
   * Update student profile & lifestyle target times
   * PUT /api/v1/users/me
   */
  async updateProfile(payload: UpdateProfilePayload): Promise<User> {
    const response = await apiClient.put<ApiSuccessResponse<User>>('/users/me', payload);
    return response.data.data;
  },

  /**
   * Permanently delete student account and cascade-delete all tracking data
   * DELETE /api/v1/users/me
   */
  async deleteAccount(): Promise<void> {
    await apiClient.delete<ApiSuccessResponse<null>>('/users/me');
  },
};

export default UserService;
