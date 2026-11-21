import { ScoreBreakdown } from './checklist.types';

export interface DailyScoreRecord {
  _id?: string;
  userId?: string;
  cycleId?: string;
  dailyActivityId?: string;
  date: string;
  dayNumber: number;
  totalScore: number;             // 0.00 to 100.00%
  achievedPoints: number;
  maxAvailablePoints: number;     // 100 or 82
  scores: ScoreBreakdown;
  createdAt?: string;
}

export interface DayScoreHistoryItem {
  date: string;
  dayNumber: number;
  totalScore: number;
}

export interface WeeklyBestLowestDay {
  date: string;
  score: number;
}

export interface WeeklyReportData {
  weekNumber: number;
  startDay: number;
  endDay: number;
  weeklyAverageScore: number;
  daysTracked: number;
  daysInWeek: number;
  bestDay?: WeeklyBestLowestDay | null;
  lowestDay?: WeeklyBestLowestDay | null;
  streakAtEndOfWeek: number;
  areaBreakdown: Record<string, number>; // completion rate 0.00 to 1.00
  deltaFromPreviousWeek: number | null;
  focusTip: string;
}

export interface WeeklyReportResult {
  isLocked: boolean;
  lockMessage?: string;
  data?: WeeklyReportData;
}

export interface AreaRankItem {
  item: number;
  areaName: string;
  completionRate: number; // 0.00 to 1.00
}

export interface MonthlyReportData {
  cycleNumber: number;
  lifeScore: number;
  habitConsistency: number; // percentage
  daysTracked: number;
  totalDays: number;
  lifeStage: number; // 1 to 10
  lifeStageName: string;
  lifeStageDescription: string;
  strengths: AreaRankItem[]; // Top 3
  weaknesses: AreaRankItem[]; // Bottom 3
  areaCompletionRates: Record<string, number>;
  progressTrend: Array<{ weekNumber: number; averageScore: number; daysTracked: number }>;
  lifeInsight: string;
  improvementSuggestions: string[];
  hasEnoughData: boolean;
}

export interface MonthlyReportResult {
  isCompleted: boolean;
  message?: string;
  data?: MonthlyReportData;
}
