/**
 * Pure client-side scoring preview calculator
 * Mirrors backend/services/scoring/ScoringEngine.js
 */
export function calculateLiveScores(formData) {
  const scores = {};
  const isOffDay = formData.item2_universityAttendance === 'off_day';

  // Item 1: Early Morning (8 pts)
  scores.item1 = formData.item1_earlyMorning ? 8 : 0;

  // Item 2: University Attendance (10 pts or excluded)
  if (isOffDay) {
    scores.item2 = 0;
  } else {
    scores.item2 = formData.item2_universityAttendance === 'yes' ? 10 : 0;
  }

  // Item 3: Class Participation (8 pts or excluded)
  if (isOffDay) {
    scores.item3 = 0;
  } else {
    const attended = Number(formData.item3_classParticipation_attended || 0);
    const total = Number(formData.item3_classParticipation_total || 1);
    if (total >= 1 && attended >= 0) {
      const ratio = Math.min(1, Math.max(0, attended / total));
      scores.item3 = +(ratio * 8).toFixed(2);
    } else {
      scores.item3 = 0;
    }
  }

  // Item 4: Personal Discipline (8 pts)
  scores.item4 = formData.item4_personalDiscipline ? 8 : 0;

  // Item 5: Social Interactions (6 pts)
  const socialCount = Number(formData.item5_socialInteractions_count || 0);
  if (socialCount >= 3) scores.item5 = 6;
  else if (socialCount === 2) scores.item5 = 4;
  else if (socialCount === 1) scores.item5 = 2;
  else scores.item5 = 0;

  // Item 6: Daily Learning (10 pts)
  const learningText = (formData.item6_dailyLearning_text || '').trim();
  scores.item6 = learningText.length > 0 ? 10 : 0;

  // Item 7: Physical Activity (10 pts)
  if (formData.item7_physicalActivity_active) {
    const mins = Number(formData.item7_physicalActivity_minutes || 0);
    scores.item7 = mins >= 15 ? 10 : 5;
  } else {
    scores.item7 = 0;
  }

  // Item 8: Skill Development (10 pts)
  const skillMins = Number(formData.item8_skillDevelopment_minutes || 0);
  if (skillMins >= 60) scores.item8 = 10;
  else if (skillMins >= 30) scores.item8 = 6;
  else if (skillMins >= 15) scores.item8 = 3;
  else scores.item8 = 0;

  // Item 9: Class Work Recap (10 pts)
  scores.item9 = formData.item9_classWorkRecap ? 10 : 0;

  // Item 10: Social Media Control (6 pts)
  const smControl = formData.item10_socialMediaControl;
  if (smControl === 'controlled') scores.item10 = 6;
  else if (smControl === 'useful') scores.item10 = 3;
  else scores.item10 = 0;

  // Item 11: Self-Reflection (8 pts)
  const reflectText = (formData.item11_selfReflection_text || '').trim();
  scores.item11 = reflectText.length > 0 ? 8 : 0;

  // Item 12: Sleeping on Time (6 pts)
  scores.item12 = formData.item12_sleepingOnTime ? 6 : 0;

  // Denominator
  const maxAvailablePoints = isOffDay ? 82 : 100;
  const achievedPoints = Object.values(scores).reduce((sum, val) => sum + val, 0);
  const totalScore = +(Math.min(100, Math.max(0, (achievedPoints / maxAvailablePoints) * 100))).toFixed(2);

  return {
    scores,
    achievedPoints: +achievedPoints.toFixed(2),
    maxAvailablePoints,
    totalScore,
    isOffDay,
  };
}
