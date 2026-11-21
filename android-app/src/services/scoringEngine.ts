import { ChecklistPayload, CalculatedScore, ScoreBreakdown } from '@/types/checklist.types';

/**
 * Deterministic Scoring Engine matching PRD.md Section 3.3 & arcthitecture.md Section 8.1
 */
export function calculateDailyScore(activity: Partial<ChecklistPayload>): CalculatedScore {
  const isOff = activity.isOffDay || activity.item2_universityAttendance === 'off_day';

  // Item 1: Early Morning (8 pts)
  const item1 = activity.item1_earlyMorning ? 8 : 0;

  // Item 2: University Attendance (10 pts, 0 on off-day)
  let item2 = 0;
  if (!isOff) {
    item2 = activity.item2_universityAttendance === 'yes' ? 10 : 0;
  }

  // Item 3: Class Participation (8 pts, 0 on off-day)
  let item3 = 0;
  if (!isOff) {
    const attended = activity.item3_classParticipation_attended || 0;
    const total = activity.item3_classParticipation_total || 0;
    if (total >= 1) {
      const clampedAtt = Math.min(Math.max(0, attended), total);
      item3 = Math.round(((clampedAtt / total) * 8) * 100) / 100;
    }
  }

  // Item 4: Personal Discipline (8 pts)
  const item4 = activity.item4_personalDiscipline ? 8 : 0;

  // Item 5: Social Interaction (6 pts)
  // >= 3: 6 pts, 2: 4 pts, 1: 2 pts, 0: 0 pts
  const count = Math.max(0, activity.item5_socialInteractions || 0);
  const item5 = count >= 3 ? 6 : count === 2 ? 4 : count === 1 ? 2 : 0;

  // Item 6: Daily Learning Note (10 pts)
  const item6 = (activity.item6_dailyLearning && activity.item6_dailyLearning.trim().length > 0) ? 10 : 0;

  // Item 7: Physical Activity (10 pts)
  // Active and >= 15 mins = 10 pts, Active < 15 mins = 5 pts, No = 0 pts
  let item7 = 0;
  if (activity.item7_physicalActivity) {
    item7 = (activity.item7_physicalMinutes || 0) >= 15 ? 10 : 5;
  }

  // Item 8: Skill / Earning Work (10 pts)
  // >= 60 mins = 10 pts, 30-59 mins = 6 pts, 15-29 mins = 3 pts, < 15 mins = 0 pts
  const skillMins = Math.max(0, activity.item8_skillDevelopmentMinutes || 0);
  const item8 = skillMins >= 60 ? 10 : skillMins >= 30 ? 6 : skillMins >= 15 ? 3 : 0;

  // Item 9: Class Work Recap (10 pts)
  const item9 = activity.item9_classWorkRecap ? 10 : 0;

  // Item 10: Social Media Control (6 pts)
  // controlled = 6, useful = 3, excessive = 0
  const socialMap: Record<string, number> = { controlled: 6, useful: 3, excessive: 0 };
  const item10 = socialMap[activity.item10_socialMediaControl || 'controlled'] ?? 0;

  // Item 11: Self-Reflection Journal (8 pts)
  const item11 = (activity.item11_selfReflection && activity.item11_selfReflection.trim().length > 0) ? 8 : 0;

  // Item 12: Sleeping on Time (6 pts)
  const item12 = activity.item12_sleepOnTime ? 6 : 0;

  const breakdown: ScoreBreakdown = {
    item1,
    item2,
    item3,
    item4,
    item5,
    item6,
    item7,
    item8,
    item9,
    item10,
    item11,
    item12,
  };

  const achievedPoints = Math.round(
    (item1 + item2 + item3 + item4 + item5 + item6 + item7 + item8 + item9 + item10 + item11 + item12) * 100
  ) / 100;

  const maxAvailablePoints = isOff ? 82 : 100;

  const totalScore = Math.min(
    100,
    Math.max(0, Math.round(((achievedPoints / maxAvailablePoints) * 100) * 100) / 100)
  );

  return {
    totalScore,
    achievedPoints,
    maxAvailablePoints,
    breakdown,
  };
}

export default calculateDailyScore;
