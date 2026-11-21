const {
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
} = require('./ItemScorers');

/**
 * Computes scores across all 12 items and normalizes to final daily score percentage.
 *
 * @param {Object} activityData Raw student inputs for the day
 * @returns {Object} { totalScore, achievedPoints, maxAvailablePoints, scores }
 */
const calculateDailyScore = (activityData = {}) => {
  const isOffDay =
    activityData.isOffDay === true || activityData.item2_universityAttendance === 'off_day';

  const maxAvailablePoints = isOffDay ? 82 : 100;

  const item1 = scoreItem1(activityData.item1_earlyMorning);
  const item2 = scoreItem2(activityData.item2_universityAttendance, isOffDay);
  const item3 = scoreItem3(
    activityData.item3_classParticipation_attended,
    activityData.item3_classParticipation_total,
    isOffDay
  );
  const item4 = scoreItem4(activityData.item4_personalDiscipline);
  const item5 = scoreItem5(activityData.item5_socialInteractions ?? activityData.item5_socialInteractions_count);
  const item6 = scoreItem6(activityData.item6_dailyLearning ?? activityData.item6_dailyLearning_text);
  const item7 = scoreItem7(
    activityData.item7_physicalActivity ?? activityData.item7_physicalActivity_active,
    activityData.item7_physicalMinutes ?? activityData.item7_physicalActivity_minutes
  );
  const item8 = scoreItem8(activityData.item8_skillDevelopmentMinutes ?? activityData.item8_skillDevelopment_minutes);
  const item9 = scoreItem9(activityData.item9_classWorkRecap);
  const item10 = scoreItem10(activityData.item10_socialMediaControl);
  const item11 = scoreItem11(activityData.item11_selfReflection ?? activityData.item11_selfReflection_text);
  const item12 = scoreItem12(activityData.item12_sleepOnTime ?? activityData.item12_sleepingOnTime);

  const scores = {
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
    item12
  };

  // Sum achieved points
  const achievedPoints = Object.values(scores).reduce((sum, val) => sum + val, 0);
  const roundedAchieved = parseFloat(achievedPoints.toFixed(2));

  // Guard against divide-by-zero
  let percentage = 0;
  if (maxAvailablePoints > 0) {
    percentage = (roundedAchieved / maxAvailablePoints) * 100;
  }

  // Clamp strictly between 0.00 and 100.00
  const totalScore = parseFloat(Math.min(100, Math.max(0, percentage)).toFixed(2));

  return {
    totalScore,
    achievedPoints: roundedAchieved,
    maxAvailablePoints,
    scores
  };
};

module.exports = {
  calculateDailyScore
};
