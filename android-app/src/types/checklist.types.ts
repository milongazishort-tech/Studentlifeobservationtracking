/**
 * Daily Checklist and Scoring types matching api-spec.md Section 6.4 and databse-schema.md
 */

export type AttendanceStatus = 'yes' | 'no' | 'off_day';
export type SocialMediaControlLevel = 'controlled' | 'useful' | 'excessive';

export interface ChecklistPayload {
  isOffDay: boolean;
  item1_earlyMorning: boolean;
  item2_universityAttendance: AttendanceStatus;
  item3_classParticipation_attended: number;
  item3_classParticipation_total: number;
  item4_personalDiscipline: boolean;
  item5_socialInteractions: number;
  item6_dailyLearning: string;
  item7_physicalActivity: boolean;
  item7_physicalMinutes: number;
  item8_skillDevelopmentMinutes: number;
  item9_classWorkRecap: boolean;
  item10_socialMediaControl: SocialMediaControlLevel;
  item11_selfReflection: string;
  item12_sleepOnTime: boolean;
}

export interface ScoreBreakdown {
  item1: number;
  item2: number;
  item3: number;
  item4: number;
  item5: number;
  item6: number;
  item7: number;
  item8: number;
  item9: number;
  item10: number;
  item11: number;
  item12: number;
  [key: string]: number;
}

export interface ChecklistSubmissionResponse {
  dayNumber: number;
  date: string;
  totalScore: number;
  achievedPoints: number;
  maxAvailablePoints: number;
  currentStreak: number;
  scores: ScoreBreakdown;
}

export interface DailyActivityRecord extends ChecklistPayload {
  _id?: string;
  userId: string;
  cycleId: string;
  date: string;
  dayNumber: number;
  isMissedDay?: boolean;
  isGraceEntry?: boolean;
  submittedAt?: string;
}

export interface CalculatedScore {
  totalScore: number;          // 0.00 to 100.00%
  achievedPoints: number;      // sum of 12 items
  maxAvailablePoints: number;  // 100 or 82
  breakdown: ScoreBreakdown;
}
