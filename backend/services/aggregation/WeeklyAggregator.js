const mongoose = require('mongoose');
const { Cycle, DailyScore, WeeklySummary } = require('../../models');
const { normalizeToMidnight, calculateDayNumber } = require('../../utils/date.utils');
const { NotFoundError, ValidationError } = require('../../utils/errors');
const { getFocusTip, AREA_NAMES } = require('../classification/InsightRuleEngine');

const WEEK_CONFIGS = {
  1: { startDay: 1, endDay: 7, daysInWeek: 7 },
  2: { startDay: 8, endDay: 14, daysInWeek: 7 },
  3: { startDay: 15, endDay: 21, daysInWeek: 7 },
  4: { startDay: 22, endDay: 28, daysInWeek: 7 },
  5: { startDay: 29, endDay: 30, daysInWeek: 2 }
};

/**
 * Aggregates and caches weekly summary metrics and focus tips.
 * Adheres to database.md Section 6.1 and api-spec.md Section 6.6
 */
const getWeeklySummary = async (userId, weekNumberParam, timezoneOffset = 0) => {
  const weekNumber = parseInt(weekNumberParam, 10);
  if (!WEEK_CONFIGS[weekNumber]) {
    throw new ValidationError('Invalid week number. Must be between 1 and 5.', 'weekNumber');
  }

  const { startDay, endDay, daysInWeek } = WEEK_CONFIGS[weekNumber];

  // 1. Locate relevant cycle (prefer active, fallback to latest completed)
  let cycle = await Cycle.findOne({ userId, status: 'active' });
  if (!cycle) {
    cycle = await Cycle.findOne({ userId }).sort({ cycleNumber: -1 });
  }

  if (!cycle) {
    throw new NotFoundError('No tracking cycle found.', 'NO_ACTIVE_CYCLE');
  }

  // 2. Validate unlock condition
  const todayNormalized = normalizeToMidnight(new Date(), timezoneOffset);
  const currentDay = calculateDayNumber(cycle.startDate, todayNormalized, timezoneOffset);

  if (currentDay < endDay && cycle.status !== 'completed') {
    throw new ValidationError(
      `Week ${weekNumber} analytics have not unlocked yet. Complete Day ${endDay} to unlock this report.`,
      'weekNumber',
      'WEEK_NOT_UNLOCKED'
    );
  }

  // 3. Return cached summary if already generated
  const cached = await WeeklySummary.findOne({
    userId,
    cycleId: cycle._id,
    weekNumber,
    isGenerated: true
  });

  if (cached) {
    return {
      success: true,
      data: {
        weekNumber: cached.weekNumber,
        startDay: cached.startDay,
        endDay: cached.endDay,
        weeklyAverageScore: cached.weeklyAverageScore,
        daysTracked: cached.daysTracked,
        daysInWeek: cached.daysInWeek,
        bestDay: cached.bestDay,
        lowestDay: cached.lowestDay,
        streakAtEndOfWeek: cached.streakAtEndOfWeek,
        areaBreakdown: cached.areaBreakdown,
        deltaFromPreviousWeek: cached.deltaFromPreviousWeek,
        focusTip: cached.focusTip
      }
    };
  }

  // 4. Fetch daily scores for this week window
  const weekScores = await DailyScore.find({
    userId,
    cycleId: cycle._id,
    dayNumber: { $gte: startDay, $lte: endDay }
  }).sort({ dayNumber: 1 });

  const daysTracked = weekScores.filter((s) => s.totalScore > 0).length;
  const scoreSum = weekScores.reduce((sum, s) => sum + s.totalScore, 0);
  const weeklyAverageScore =
    weekScores.length > 0 ? parseFloat((scoreSum / weekScores.length).toFixed(2)) : 0.0;

  // Best & Lowest Day
  let bestDay = { date: null, score: 0 };
  let lowestDay = { date: null, score: 100 };

  if (weekScores.length > 0) {
    const sorted = [...weekScores].sort((a, b) => b.totalScore - a.totalScore);
    bestDay = {
      date: sorted[0].date.toISOString(),
      score: sorted[0].totalScore
    };
    lowestDay = {
      date: sorted[sorted.length - 1].date.toISOString(),
      score: sorted[sorted.length - 1].totalScore
    };
  }

  // Area Breakdown calculation (average completion ratio 0.00 to 1.00 per item)
  const areaBreakdown = {};
  const maxItemPoints = {
    item1: 8, item2: 10, item3: 8, item4: 8, item5: 6, item6: 10,
    item7: 10, item8: 10, item9: 10, item10: 6, item11: 8, item12: 6
  };

  for (let i = 1; i <= 12; i++) {
    const key = `item${i}`;
    const maxPts = maxItemPoints[key];
    const totalItemPts = weekScores.reduce((sum, s) => sum + (s.scores?.[key] || 0), 0);
    const avgRatio =
      weekScores.length > 0 ? totalItemPts / (weekScores.length * maxPts) : 0;
    areaBreakdown[key] = parseFloat(Math.min(1.0, Math.max(0.0, avgRatio)).toFixed(2));
  }

  // Identify lowest performing area for targeted focus tip
  let lowestAreaKey = 'item7';
  let lowestRatio = 1.1;
  for (const [key, ratio] of Object.entries(areaBreakdown)) {
    if (ratio < lowestRatio) {
      lowestRatio = ratio;
      lowestAreaKey = key;
    }
  }
  const focusTip = getFocusTip(lowestAreaKey);

  // 5. Compute deltaFromPreviousWeek
  let deltaFromPreviousWeek = null;
  if (weekNumber > 1) {
    const prevWeekNumber = weekNumber - 1;
    const prevSummary = await WeeklySummary.findOne({
      userId,
      cycleId: cycle._id,
      weekNumber: prevWeekNumber
    });

    if (prevSummary) {
      deltaFromPreviousWeek = parseFloat(
        (weeklyAverageScore - prevSummary.weeklyAverageScore).toFixed(2)
      );
    } else {
      // Direct computation fallback for prior week
      const prevConfig = WEEK_CONFIGS[prevWeekNumber];
      const prevScores = await DailyScore.find({
        userId,
        cycleId: cycle._id,
        dayNumber: { $gte: prevConfig.startDay, $lte: prevConfig.endDay }
      });
      if (prevScores.length > 0) {
        const prevAvg =
          prevScores.reduce((sum, s) => sum + s.totalScore, 0) / prevScores.length;
        deltaFromPreviousWeek = parseFloat((weeklyAverageScore - prevAvg).toFixed(2));
      }
    }
  }

  // Calculate calendar boundaries
  const weekStartDate = new Date(
    cycle.startDate.getTime() + (startDay - 1) * 24 * 60 * 60 * 1000
  );
  const weekEndDate = new Date(
    cycle.startDate.getTime() + (endDay - 1) * 24 * 60 * 60 * 1000
  );

  // 6. Cache in weeklySummaries collection
  const summaryDoc = await WeeklySummary.findOneAndUpdate(
    { userId, cycleId: cycle._id, weekNumber },
    {
      $set: {
        startDay,
        endDay,
        startDate: weekStartDate,
        endDate: weekEndDate,
        weeklyAverageScore,
        daysTracked,
        daysInWeek,
        bestDay: bestDay.date ? { date: new Date(bestDay.date), score: bestDay.score } : undefined,
        lowestDay: lowestDay.date ? { date: new Date(lowestDay.date), score: lowestDay.score } : undefined,
        streakAtEndOfWeek: cycle.currentStreak,
        areaBreakdown,
        deltaFromPreviousWeek,
        focusTip,
        isGenerated: true
      }
    },
    { upsert: true, new: true }
  );

  return {
    success: true,
    data: {
      weekNumber: summaryDoc.weekNumber,
      startDay: summaryDoc.startDay,
      endDay: summaryDoc.endDay,
      weeklyAverageScore: summaryDoc.weeklyAverageScore,
      daysTracked: summaryDoc.daysTracked,
      daysInWeek: summaryDoc.daysInWeek,
      bestDay,
      lowestDay,
      streakAtEndOfWeek: summaryDoc.streakAtEndOfWeek,
      areaBreakdown: summaryDoc.areaBreakdown,
      deltaFromPreviousWeek: summaryDoc.deltaFromPreviousWeek,
      focusTip: summaryDoc.focusTip
    }
  };
};

module.exports = {
  getWeeklySummary
};
