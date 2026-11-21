const { Cycle, DailyScore, MonthlyResult } = require('../../models');
const { NotFoundError, ValidationError } = require('../../utils/errors');
const { classifyLifeStage } = require('../classification/LifeStageClassifier');
const { generateLifeInsight, AREA_NAMES } = require('../classification/InsightRuleEngine');

const WEEK_BOUNDARIES = [
  { weekNumber: 1, startDay: 1, endDay: 7 },
  { weekNumber: 2, startDay: 8, endDay: 14 },
  { weekNumber: 3, startDay: 15, endDay: 21 },
  { weekNumber: 4, startDay: 22, endDay: 28 },
  { weekNumber: 5, startDay: 29, endDay: 30 }
];

const MAX_ITEM_POINTS = {
  item1: 8, item2: 10, item3: 8, item4: 8, item5: 6, item6: 10,
  item7: 10, item8: 10, item9: 10, item10: 6, item11: 8, item12: 6
};

/**
 * Aggregates and caches 30-day final monthly report with Life Stage classification.
 * Follows PRD.md Section 3.6 and api-spec.md Section 6.7
 */
const getMonthlyReport = async (userId, cycleId) => {
  const cycle = await Cycle.findOne({ _id: cycleId, userId });
  if (!cycle) {
    throw new NotFoundError('Tracking cycle record not found.');
  }

  // 1. Check if cached report is already finalized
  const cached = await MonthlyResult.findOne({
    userId,
    cycleId: cycle._id,
    isGenerated: true
  });

  if (cached) {
    return {
      success: true,
      data: {
        cycleNumber: cached.cycleNumber,
        lifeScore: cached.lifeScore,
        habitConsistency: cached.habitConsistency,
        daysTracked: cached.daysTracked,
        totalDays: cached.totalDays,
        lifeStage: cached.lifeStage,
        lifeStageName: cached.lifeStageName,
        lifeStageDescription: cached.lifeStageDescription,
        strengths: cached.strengths,
        weaknesses: cached.weaknesses,
        areaCompletionRates: cached.areaCompletionRates,
        progressTrend: cached.progressTrend,
        lifeInsight: cached.lifeInsight,
        improvementSuggestions: cached.improvementSuggestions,
        hasEnoughData: cached.hasEnoughData
      }
    };
  }

  // 2. Fetch all scores for this cycle
  const scores = await DailyScore.find({ userId, cycleId: cycle._id }).sort({ dayNumber: 1 });

  // 3. Unlock guard: Cycle must be completed or have Day 30 scored
  const hasDay30 = scores.some((s) => s.dayNumber === 30);
  if (cycle.status !== 'completed' && !hasDay30) {
    throw new ValidationError(
      'The 30-day monthly Life Stage report is unlocked only after completing Day 30.',
      'cycleId',
      'CYCLE_NOT_COMPLETED'
    );
  }

  // 4. Compute overall metrics
  const totalDays = 30;
  const daysTracked = scores.filter((s) => s.totalScore > 0).length;
  const habitConsistency = parseFloat(((daysTracked / totalDays) * 100).toFixed(2));
  const scoreSum = scores.reduce((sum, s) => sum + s.totalScore, 0);
  const lifeScore = parseFloat((scoreSum / totalDays).toFixed(2));

  // 5. Area completion rates (ratios 0.00 to 1.00 for radar charts)
  const areaCompletionRates = {};
  const areaPerformanceList = [];

  for (let i = 1; i <= 12; i++) {
    const key = `item${i}`;
    const maxPts = MAX_ITEM_POINTS[key];
    const totalPts = scores.reduce((sum, s) => sum + (s.scores?.[key] || 0), 0);
    // Evaluated against total days (30)
    const rate = parseFloat(Math.min(1.0, Math.max(0.0, totalPts / (totalDays * maxPts))).toFixed(2));
    areaCompletionRates[key] = rate;
    areaPerformanceList.push({
      item: i,
      areaName: AREA_NAMES[key] || `Item ${i}`,
      completionRate: rate
    });
  }

  // 6. Strengths (Top 3) & Weaknesses (Bottom 3)
  const sortedAreas = [...areaPerformanceList].sort(
    (a, b) => b.completionRate - a.completionRate
  );
  const strengths = sortedAreas.slice(0, 3);
  const weaknesses = sortedAreas.slice(-3).reverse();

  // 7. Progress Trend (5-week progression)
  const progressTrend = [];
  for (const w of WEEK_BOUNDARIES) {
    const weekScores = scores.filter(
      (s) => s.dayNumber >= w.startDay && s.dayNumber <= w.endDay
    );
    const count = weekScores.length;
    const trackedCount = weekScores.filter((s) => s.totalScore > 0).length;
    const avg =
      count > 0
        ? parseFloat((weekScores.reduce((sum, s) => sum + s.totalScore, 0) / count).toFixed(1))
        : 0.0;

    progressTrend.push({
      weekNumber: w.weekNumber,
      averageScore: avg,
      daysTracked: trackedCount
    });
  }

  // 8. Life Stage Classification & Insight Engine
  const { stage, name: stageName, description: stageDescription } = classifyLifeStage(lifeScore);
  const { lifeInsight, improvementSuggestions, hasEnoughData } = generateLifeInsight({
    lifeScore,
    habitConsistency,
    strengths,
    weaknesses
  });

  // 9. Cache in monthlyResults collection
  const reportDoc = await MonthlyResult.findOneAndUpdate(
    { userId, cycleId: cycle._id },
    {
      $set: {
        cycleNumber: cycle.cycleNumber,
        lifeScore,
        habitConsistency,
        daysTracked,
        totalDays,
        lifeStage: stage,
        lifeStageName: stageName,
        lifeStageDescription: stageDescription,
        strengths,
        weaknesses,
        areaCompletionRates,
        progressTrend,
        lifeInsight,
        improvementSuggestions,
        hasEnoughData,
        isGenerated: true
      }
    },
    { upsert: true, new: true }
  );

  return {
    success: true,
    data: {
      cycleNumber: reportDoc.cycleNumber,
      lifeScore: reportDoc.lifeScore,
      habitConsistency: reportDoc.habitConsistency,
      daysTracked: reportDoc.daysTracked,
      totalDays: reportDoc.totalDays,
      lifeStage: reportDoc.lifeStage,
      lifeStageName: reportDoc.lifeStageName,
      lifeStageDescription: reportDoc.lifeStageDescription,
      strengths: reportDoc.strengths,
      weaknesses: reportDoc.weaknesses,
      areaCompletionRates: reportDoc.areaCompletionRates,
      progressTrend: reportDoc.progressTrend,
      lifeInsight: reportDoc.lifeInsight,
      improvementSuggestions: reportDoc.improvementSuggestions,
      hasEnoughData: reportDoc.hasEnoughData
    }
  };
};

module.exports = {
  getMonthlyReport
};
