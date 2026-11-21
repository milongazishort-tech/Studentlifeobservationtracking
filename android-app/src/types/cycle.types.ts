/**
 * Cycle lifecycle interfaces matching api-spec.md Section 6.3 and databse-schema.md
 */

export type CycleStatus = 'active' | 'completed' | 'abandoned';

export interface Cycle {
  cycleId: string;
  cycleNumber: number;
  startDate: string;
  endDate: string;
  status: CycleStatus;
  currentStreak: number;
  targetWakeUpTime: string;
  targetSleepTime: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ActiveCycle {
  cycleId: string;
  cycleNumber: number;
  dayNumber: number;
  startDate: string;
  endDate: string;
  status: 'active';
  currentStreak: number;
  hasSubmittedToday: boolean;
  targetWakeUpTime?: string;
  targetSleepTime?: string;
}

export interface StartCyclePayload {
  startDate?: string;
  targetWakeUpTime: string;
  targetSleepTime: string;
}

export interface CycleHistoryItem {
  cycleId: string;
  cycleNumber: number;
  startDate: string;
  endDate: string;
  status: CycleStatus;
  currentStreak: number;
}
