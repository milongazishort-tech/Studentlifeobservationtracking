/**
 * Pure scoring calculation rules for all 12 individual items
 * Specifications strictly follow PRD.md Section 3.3
 */

// Item 1: Early Morning — Woke up at or before target wake-up time
const scoreItem1 = (earlyMorning) => {
  return earlyMorning === true ? 8 : 0;
};

// Item 2: University Attendance — Yes (10), No (0), Off Day (0, excluded from max)
const scoreItem2 = (attendance, isOffDay) => {
  if (isOffDay || attendance === 'off_day') return 0;
  return attendance === 'yes' ? 10 : 0;
};

// Item 3: Class Participation — Fraction (attended / total) * 8 pts, clamped 0 to 8
const scoreItem3 = (attended = 0, total = 0, isOffDay = false) => {
  if (isOffDay) return 0;
  if (!total || total <= 0) return 0;
  const ratio = Math.max(0, Math.min(1, attended / total));
  return parseFloat((ratio * 8).toFixed(2));
};

// Item 4: Personal Discipline — Morning routine / spiritual practice completed
const scoreItem4 = (discipline) => {
  return discipline === true ? 8 : 0;
};

// Item 5: Social Interactions — Count: >=3 (6 pts), 2 (4 pts), 1 (2 pts), 0 (0 pts)
const scoreItem5 = (count = 0) => {
  const c = parseInt(count || 0, 10);
  if (c >= 3) return 6;
  if (c === 2) return 4;
  if (c === 1) return 2;
  return 0;
};

// Item 6: Daily Learning — Non-empty reflection summary: 10 pts, empty: 0 pts
const scoreItem6 = (learningText = '') => {
  return (learningText && learningText.trim().length > 0) ? 10 : 0;
};

// Item 7: Physical Activity — Yes & mins >= 15 (10 pts), Yes & mins < 15 (5 pts), No (0 pts)
const scoreItem7 = (activity = false, minutes = 0) => {
  if (!activity) return 0;
  const m = parseInt(minutes || 0, 10);
  return m >= 15 ? 10 : 5;
};

// Item 8: Skill / Earning Work — mins >= 60 (10), 30-59 (6), 15-29 (3), < 15 (0)
const scoreItem8 = (minutes = 0) => {
  const m = parseInt(minutes || 0, 10);
  if (m >= 60) return 10;
  if (m >= 30) return 6;
  if (m >= 15) return 3;
  return 0;
};

// Item 9: Class Work Recap — Reviewed notes/materials: 10 pts, No: 0 pts
const scoreItem9 = (recap) => {
  return recap === true ? 10 : 0;
};

// Item 10: Social Media Control — controlled (6), useful (3), excessive (0)
const scoreItem10 = (control = 'controlled') => {
  if (control === 'controlled') return 6;
  if (control === 'useful') return 3;
  return 0;
};

// Item 11: Self-Reflection — Meaningful journal entry recorded: 8 pts, empty: 0 pts
const scoreItem11 = (reflectionText = '') => {
  return (reflectionText && reflectionText.trim().length > 0) ? 8 : 0;
};

// Item 12: Sleeping on Time — Slept at or before target bedtime: 6 pts, No: 0 pts
const scoreItem12 = (sleepOnTime) => {
  return sleepOnTime === true ? 6 : 0;
};

module.exports = {
  scoreItem1,
  scoreItem2,
  scoreItem3,
  scoreItem4,
  scoreItem5,
  scoreItem6,
  scoreItem7,
  scoreItem8,
  scoreItem9,
  scoreItem10,
  scoreItem11,
  scoreItem12
};
