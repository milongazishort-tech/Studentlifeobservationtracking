import apiClient from './api';
import {
  ChecklistPayload,
  ChecklistSubmissionResponse,
  DailyActivityRecord,
} from '@/types/checklist.types';
import { ApiSuccessResponse } from '@/types/api.types';

export const ChecklistService = {
  /**
   * Fetch today's saved checklist entry
   * GET /api/v1/checklist/today
   * Returns null if 404 NO_ENTRY_TODAY
   */
  async getTodayEntry(): Promise<DailyActivityRecord | null> {
    try {
      const response = await apiClient.get<ApiSuccessResponse<DailyActivityRecord>>('/checklist/today');
      return response.data.data;
    } catch (err: any) {
      if (err.code === 'NO_ENTRY_TODAY') {
        return null;
      }
      throw err;
    }
  },

  /**
   * Submit first-time checklist for today
   * POST /api/v1/checklist
   */
  async submitTodayChecklist(payload: ChecklistPayload): Promise<ChecklistSubmissionResponse> {
    const response = await apiClient.post<ApiSuccessResponse<ChecklistSubmissionResponse>>(
      '/checklist',
      payload
    );
    return response.data.data;
  },

  /**
   * Update/Edit today's already submitted checklist
   * PUT /api/v1/checklist/today
   */
  async updateTodayChecklist(payload: ChecklistPayload): Promise<ChecklistSubmissionResponse> {
    const response = await apiClient.put<ApiSuccessResponse<ChecklistSubmissionResponse>>(
      '/checklist/today',
      payload
    );
    return response.data.data;
  },

  /**
   * Submit or edit yesterday's checklist (Grace Window)
   * PUT /api/v1/checklist/yesterday
   */
  async submitYesterdayGrace(payload: ChecklistPayload): Promise<ChecklistSubmissionResponse> {
    const response = await apiClient.put<ApiSuccessResponse<ChecklistSubmissionResponse>>(
      '/checklist/yesterday',
      payload
    );
    return response.data.data;
  },

  /**
   * Fetch checklist entry by ISO date (YYYY-MM-DD)
   * GET /api/v1/checklist/:date
   */
  async getEntryByDate(dateStr: string): Promise<DailyActivityRecord | null> {
    try {
      const response = await apiClient.get<ApiSuccessResponse<DailyActivityRecord>>(
        `/checklist/${dateStr}`
      );
      return response.data.data;
    } catch (err: any) {
      if (err.code === 'NOT_FOUND' || err.code === 'NO_ENTRY_TODAY') {
        return null;
      }
      throw err;
    }
  },
};

export default ChecklistService;
