import apiClient from './api';
import {
  DailyScoreRecord,
  WeeklyReportData,
  WeeklyReportResult,
  MonthlyReportData,
  MonthlyReportResult,
} from '@/types/score.types';
import { ApiSuccessResponse } from '@/types/api.types';

export const ScoreService = {
  /**
   * Fetch today's calculated score breakdown
   * GET /api/v1/scores/today
   */
  async getTodayScore(): Promise<DailyScoreRecord | null> {
    try {
      const response = await apiClient.get<ApiSuccessResponse<DailyScoreRecord>>('/scores/today');
      return response.data.data;
    } catch (err: any) {
      if (err.code === 'NOT_FOUND' || err.code === 'NO_ENTRY_TODAY') {
        return null;
      }
      throw err;
    }
  },

  /**
   * Fetch score breakdown for a specific date (YYYY-MM-DD or 'today')
   * GET /api/v1/scores/:date
   */
  async getScoreByDate(dateStr: string): Promise<DailyScoreRecord | null> {
    try {
      const endpoint = dateStr === 'today' ? '/scores/today' : `/scores/${dateStr}`;
      const response = await apiClient.get<ApiSuccessResponse<DailyScoreRecord>>(endpoint);
      return response.data.data;
    } catch (err: any) {
      if (err.code === 'NOT_FOUND' || err.code === 'NO_ENTRY_TODAY') {
        return null;
      }
      throw err;
    }
  },

  /**
   * Fetch all recorded scores for an active cycle (used for 30-day timeline chart)
   * GET /api/v1/scores/cycle/:cycleId
   */
  async getCycleScores(cycleId: string): Promise<DailyScoreRecord[]> {
    try {
      const response = await apiClient.get<ApiSuccessResponse<DailyScoreRecord[]>>(
        `/scores/cycle/${cycleId}`
      );
      return response.data.data;
    } catch (err: any) {
      console.warn('[ScoreService] getCycleScores error:', err);
      return [];
    }
  },

  /**
   * Fetch Weekly Report for a specific week (1 to 5)
   * GET /api/v1/weekly/:weekNumber
   */
  async getWeeklySummary(weekNumber: number): Promise<WeeklyReportResult> {
    try {
      const response = await apiClient.get<ApiSuccessResponse<WeeklyReportData>>(
        `/weekly/${weekNumber}`
      );
      return {
        isLocked: false,
        data: response.data.data,
      };
    } catch (err: any) {
      if (err.code === 'WEEK_NOT_UNLOCKED' || err.message?.includes('not unlocked')) {
        return {
          isLocked: true,
          lockMessage: err.message || `Week ${weekNumber} has not concluded yet.`,
        };
      }
      throw err;
    }
  },

  /**
   * Fetch Monthly 30-Day Life Stage & Insights Report
   * GET /api/v1/monthly/:cycleId
   * Traps CYCLE_NOT_COMPLETED if day < 30
   */
  async getMonthlyReport(cycleId: string): Promise<MonthlyReportResult> {
    try {
      const response = await apiClient.get<ApiSuccessResponse<MonthlyReportData>>(
        `/monthly/${cycleId}`
      );
      return {
        isCompleted: true,
        data: response.data.data,
      };
    } catch (err: any) {
      if (err.code === 'CYCLE_NOT_COMPLETED' || err.message?.includes('not completed')) {
        return {
          isCompleted: false,
          message: err.message || 'The 30-day cycle has not completed yet.',
        };
      }
      throw err;
    }
  },
};

export default ScoreService;
