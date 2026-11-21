/**
 * Rule-Based Insight and Suggestion Generation Engine
 * Matches PRD.md Section 3.6 and database.md Section 6.2
 */

const AREA_NAMES = {
  item1: 'Early Morning',
  item2: 'University Attendance',
  item3: 'Class Participation',
  item4: 'Personal Discipline',
  item5: 'Social Interaction',
  item6: 'Daily Learning',
  item7: 'Physical Activity',
  item8: 'Skill Development',
  item9: 'Class Work Recap',
  item10: 'Social Media Control',
  item11: 'Self-Reflection',
  item12: 'Sleeping on Time'
};

const AREA_FOCUS_TIPS = {
  item1: 'Try setting your alarm 15 minutes earlier and placing your phone across the room.',
  item2: 'Make attending all scheduled lectures your top priority next week.',
  item3: 'Engage actively during classes by asking at least one question or taking structured notes.',
  item4: 'Establish an uninterrupted 15-minute morning routine to center your focus before classes.',
  item5: 'Reach out to study partners or classmates for collaborative study sessions.',
  item6: 'Dedicate 10 minutes before bed to write down at least one key takeaway you learned today.',
  item7: 'Consider scheduling at least 15 minutes of physical exercise or brisk walking daily for physical balance.',
  item8: 'Block out dedicated distraction-free time each afternoon for personal skill growth or coding practice.',
  item9: 'Review your lecture slides and organize coursework notes immediately after your last class.',
  item10: 'Use screen time limits or focus mode to reduce non-essential social media browsing during study hours.',
  item11: 'Spend 5 minutes every evening writing a quick self-reflection entry about your daily accomplishments.',
  item12: 'Power down digital screens 30 minutes before your scheduled bedtime to ensure restorative sleep.'
};

const AREA_SUGGESTIONS = {
  item1: 'Aim for a consistent wake-up routine even on weekends to anchor your circadian rhythm.',
  item2: 'Prepare clothes and study materials the night before to eliminate morning delays for class.',
  item3: 'Sit near the front of the classroom to maximize attention and participation during lectures.',
  item4: 'Anchor your personal routine to an existing habit (e.g. stretching right after brushing teeth).',
  item5: 'Schedule regular group discussions or study meetups with your departmental peers.',
  item6: 'Keep a small digital or physical notepad to jot down interesting concepts throughout the day.',
  item7: 'Schedule 20 minutes of daily physical exercise before afternoon study sessions.',
  item8: 'Commit to one structured tutorial, project feature, or skill milestone every day.',
  item9: 'Implement a 15-minute daily recap session to synthesize notes before exams pile up.',
  item10: 'Place your phone away from your desk while studying and away from your bed at night.',
  item11: 'Use guided prompts to reflect on what worked well and what can be improved tomorrow.',
  item12: 'Set a firm digital curfew 30 minutes before your target sleep time.'
};

/**
 * Generates personalized reflection insight and 2-3 actionable improvement suggestions.
 * @param {Object} params { lifeScore, habitConsistency, strengths, weaknesses, areaRates }
 * @returns {Object} { lifeInsight, improvementSuggestions, hasEnoughData }
 */
const generateLifeInsight = ({
  lifeScore = 0,
  habitConsistency = 100,
  strengths = [],
  weaknesses = []
}) => {
  const hasEnoughData = habitConsistency >= 50.0;

  const topStrength = strengths[0]?.areaName || 'Academic Habits';
  const secondStrength = strengths[1]?.areaName || 'Personal Routine';
  const primaryWeakness = weaknesses[0]?.areaName || 'Physical Activity';
  const secondaryWeakness = weaknesses[1]?.areaName || 'Sleep Routine';

  let insightParagraph = '';

  if (lifeScore >= 80.0) {
    insightParagraph = `Over the past 30 days, your consistency in ${topStrength} and ${secondStrength} was exceptional. You demonstrated remarkable student discipline and steady academic dedication. Focus on fine-tuning ${primaryWeakness} and ${secondaryWeakness} to achieve complete lifestyle harmony in your next cycle.`;
  } else if (lifeScore >= 60.0) {
    insightParagraph = `You showed commendable progress this cycle, excelling particularly in ${topStrength}. However, fluctuations in ${primaryWeakness} and ${secondaryWeakness} impacted your overall consistency. Aligning your daily routine with firmer boundaries will elevate your performance to the next level.`;
  } else {
    insightParagraph = `This tracking cycle highlighted significant opportunities for routine stabilization. While you showed promising effort in ${topStrength}, irregular patterns in ${primaryWeakness} and ${secondaryWeakness} created lifestyle friction. Building steady micro-habits will create the foundation for lasting turnaround.`;
  }

  if (!hasEnoughData) {
    insightParagraph +=
      ' (Note: This insight is generated from limited tracking data due to habit consistency below 50%. Completing daily entries regularly will significantly sharpen personalized recommendations.)';
  }

  // Generate 2-3 actionable suggestions targeting the lowest areas
  const suggestions = [];
  for (const weak of weaknesses.slice(0, 3)) {
    const key = `item${weak.item}`;
    if (AREA_SUGGESTIONS[key]) {
      suggestions.push(AREA_SUGGESTIONS[key]);
    }
  }

  // Fallbacks if suggestions are fewer than 2
  if (suggestions.length < 2) {
    suggestions.push('Maintain high attendance and daily study recap into your next tracking cycle.');
    suggestions.push('Set your phone on do-not-disturb mode 30 minutes before your target bedtime.');
  }

  return {
    lifeInsight: insightParagraph,
    improvementSuggestions: suggestions.slice(0, 3),
    hasEnoughData
  };
};

/**
 * Returns focus tip targeting the lowest scoring area
 * @param {string} lowestAreaKey e.g. 'item7'
 * @returns {string} Actionable tip
 */
const getFocusTip = (lowestAreaKey = 'item7') => {
  return (
    AREA_FOCUS_TIPS[lowestAreaKey] ||
    'Review your lowest performing habits and choose one specific area to improve this week.'
  );
};

module.exports = {
  AREA_NAMES,
  AREA_FOCUS_TIPS,
  AREA_SUGGESTIONS,
  generateLifeInsight,
  getFocusTip
};
