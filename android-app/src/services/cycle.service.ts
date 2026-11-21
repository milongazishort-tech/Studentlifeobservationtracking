import apiClient from './api';
import { ActiveCycle, StartCyclePayload, CycleHistoryItem } from '@/types/cycle.types';
import { ApiSuccessResponse } from '@/types/api.types';

export const CycleService = {
  /**
   * Fetch currently active 30-day cycle
   * GET /api/v1/cycles/active
   * Returns null if 404 NO_ACTIVE_CYCLE
   */
  async getActiveCycle(): Promise<ActiveCycle | null> {
    try {
      const response = await apiClient.get<ApiSuccessResponse<ActiveCycle>>('/cycles/active');
      return response.data.data;
    } catch (err: any) {
      if (err.code === 'NO_ACTIVE_CYCLE') {
        return null;
      }
      throw err;
    }
  },

  /**
   * Initialize a new 30-day tracking cycle
   * POST /api/v1/cycles
   */
  async startCycle(payload: StartCyclePayload): Promise<ActiveCycle> {
    const response = await apiClient.post<ApiSuccessResponse<ActiveCycle>>('/cycles', payload);
    return response.data.data;
  },

  /**
   * Abandon an ongoing cycle
   * PATCH /api/v1/cycles/:id/abandon
   */
  async abandonCycle(id: string): Promise<void> {
    await apiClient.patch<ApiSuccessResponse<null>>(`/cycles/${id}/abandon`);
  },

  /**
   * Retrieve cycle history for current student
   * GET /api/v1/cycles
   */
  async getCycleHistory(): Promise<CycleHistoryItem[]> {
    const response = await apiClient.get<ApiSuccessResponse<CycleHistoryItem[]>>('/cycles');
    return response.data.data;
  },
};

export default CycleService;
