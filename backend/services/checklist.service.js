const mongoose = require('mongoose');
const { DailyActivity, DailyScore, Cycle } = require('../models');
const { calculateDailyScore } = require('./scoring/ScoringEngine');
const { normalizeToMidnight, calculateDayNumber } = require('../utils/date.utils');
const { NotFoundError, ConflictError, ValidationError } = require('../utils/errors');
const { sendMilestoneEmail } = require('./notification/EmailSender');

/**
 * Normalizes activity payload so both canonical model fields and alias fields are present.
 */
const normalizeActivityPayload = (payload = {}) => {
  const normalized = { ...payload };

  // item 5: social interactions
  if (normalized.item5_socialInteractions === undefined && normalized.item5_socialInteractions_count !== undefined) {
    normalized.item5_socialInteractions = normalized.item5_socialInteractions_count;
  }
  if (normalized.item5_socialInteractions_count === undefined && normalized.item5_socialInteractions !== undefined) {
    normalized.item5_socialInteractions_count = normalized.item5_socialInteractions;
  }

  // item 6: daily learning
  if (normalized.item6_dailyLearning === undefined && normalized.item6_dailyLearning_text !== undefined) {
    normalized.item6_dailyLearning = normalized.item6_dailyLearning_text;
  }
  if (normalized.item6_dailyLearning_text === undefined && normalized.item6_dailyLearning !== undefined) {
    normalized.item6_dailyLearning_text = normalized.item6_dailyLearning;
  }

  // item 7: physical activity active
  if (normalized.item7_physicalActivity === undefined && normalized.item7_physicalActivity_active !== undefined) {
    normalized.item7_physicalActivity = normalized.item7_physicalActivity_active;
  }
  if (normalized.item7_physicalActivity_active === undefined && normalized.item7_physicalActivity !== undefined) {
    normalized.item7_physicalActivity_active = normalized.item7_physicalActivity;
  }

  // item 7: physical minutes
  if (normalized.item7_physicalMinutes === undefined && normalized.item7_physicalActivity_minutes !== undefined) {
    normalized.item7_physicalMinutes = normalized.item7_physicalActivity_minutes;
  }
  if (normalized.item7_physicalActivity_minutes === undefined && normalized.item7_physicalMinutes !== undefined) {
    normalized.item7_physicalActivity_minutes = normalized.item7_physicalMinutes;
  }

  // item 8: skill development minutes
  if (normalized.item8_skillDevelopmentMinutes === undefined && normalized.item8_skillDevelopment_minutes !== undefined) {
    normalized.item8_skillDevelopmentMinutes = normalized.item8_skillDevelopment_minutes;
  }
  if (normalized.item8_skillDevelopment_minutes === undefined && normalized.item8_skillDevelopmentMinutes !== undefined) {
    normalized.item8_skillDevelopment_minutes = normalized.item8_skillDevelopmentMinutes;
  }

  // item 11: self reflection
  if (normalized.item11_selfReflection === undefined && normalized.item11_selfReflection_text !== undefined) {
    normalized.item11_selfReflection = normalized.item11_selfReflection_text;
  }
  if (normalized.item11_selfReflection_text === undefined && normalized.item11_selfReflection !== undefined) {
    normalized.item11_selfReflection_text = normalized.item11_selfReflection;
  }

  // item 12: sleep on time
  if (normalized.item12_sleepOnTime === undefined && normalized.item12_sleepingOnTime !== undefined) {
    normalized.item12_sleepOnTime = normalized.item12_sleepingOnTime;
  }
  if (normalized.item12_sleepingOnTime === undefined && normalized.item12_sleepOnTime !== undefined) {
    normalized.item12_sleepingOnTime = normalized.item12_sleepOnTime;
  }

  return normalized;
};

/**
 * Multi-document transaction executing synchronized writes across DailyActivity, DailyScore, and Cycle.
 * Follows database.md Section 7.1
 */
const saveDailyChecklistTransaction = async (userId, payload, options) => {
  const normPayload = normalizeActivityPayload(payload);
  const { isUpdate, normalizedDate, dayNumber, cycleId, isGraceEntry } = options;
  const isOffDay =
    normPayload.isOffDay === true || normPayload.item2_universityAttendance === 'off_day';

  // 1. Calculate Score breakdown
  const scoreResult = calculateDailyScore({ ...normPayload, isOffDay });

  let session = null;
  const userObjId = new mongoose.Types.ObjectId(userId);
  const cycleObjId = new mongoose.Types.ObjectId(cycleId);

  try {
    session = await mongoose.startSession();
    session.startTransaction();

    let activity;
    let score;

    if (isUpdate) {
      // 2a. UPDATE Mode: Edit existing entry (same-day or grace-day edit)
      activity = await DailyActivity.findOneAndUpdate(
        { userId: userObjId, date: normalizedDate },
        {
          $set: {
            ...normPayload,
            isOffDay,
            isGraceEntry: isGraceEntry || false,
            submittedAt: new Date()
          }
        },
        { session, new: true }
      );

      score = await DailyScore.findOneAndUpdate(
        { userId: userObjId, date: normalizedDate },
        {
          $set: {
            totalScore: scoreResult.totalScore,
            achievedPoints: scoreResult.achievedPoints,
            maxAvailablePoints: scoreResult.maxAvailablePoints,
            scores: scoreResult.scores
          }
        },
        { session, new: true }
      );
      // NOTE: Streak is NOT incremented during edits
    } else {
      // 2b. INSERT Mode: First submission for this calendar date
      [activity] = await DailyActivity.create(
        [
          {
            userId: userObjId,
            cycleId: cycleObjId,
            date: normalizedDate,
            dayNumber,
            isOffDay,
            isGraceEntry: isGraceEntry || false,
            ...normPayload,
            submittedAt: new Date()
          }
        ],
        { session }
      );

      [score] = await DailyScore.create(
        [
          {
            userId: userObjId,
            cycleId: cycleObjId,
            dailyActivityId: activity._id,
            date: normalizedDate,
            dayNumber,
            totalScore: scoreResult.totalScore,
            achievedPoints: scoreResult.achievedPoints,
            maxAvailablePoints: scoreResult.maxAvailablePoints,
            scores: scoreResult.scores
          }
        ],
        { session }
      );

      // Increment streak ONLY on brand-new date submission
      await Cycle.updateOne(
        { _id: cycleObjId, userId: userObjId },
        { $inc: { currentStreak: 1 } },
        { session }
      );
    }

    // Auto-complete cycle if Day 30 is reached
    if (dayNumber === 30) {
      await Cycle.updateOne(
        { _id: cycleObjId },
        { $set: { status: 'completed' } },
        { session }
      );
    }

    await session.commitTransaction();

    const updatedCycle = await Cycle.findById(cycleObjId);
    const streak = updatedCycle ? updatedCycle.currentStreak : 0;

    // Milestone Email Alerts (7, 14, 21, 30 days)
    if (!isUpdate && [7, 14, 21, 30].includes(streak)) {
      const userDoc = await User.findById(userObjId);
      if (userDoc) {
        sendMilestoneEmail(userDoc, streak).catch((err) =>
          console.warn('[Milestone Email] Dispatch error:', err.message)
        );
      }
    }

    return {
      activity,
      score,
      currentStreak: streak
    };
  } catch (error) {
    if (session && session.inTransaction()) {
      await session.abortTransaction();
    }
    // Fallback for non-replica set environments
    if (error.message && error.message.includes('replica set')) {
      let activity;
      let score;
      if (isUpdate) {
        activity = await DailyActivity.findOneAndUpdate(
          { userId: userObjId, date: normalizedDate },
          {
            $set: {
              ...normPayload,
              isOffDay,
              isGraceEntry: isGraceEntry || false,
              submittedAt: new Date()
            }
          },
          { new: true }
        );
        score = await DailyScore.findOneAndUpdate(
          { userId: userObjId, date: normalizedDate },
          {
            $set: {
              totalScore: scoreResult.totalScore,
              achievedPoints: scoreResult.achievedPoints,
              maxAvailablePoints: scoreResult.maxAvailablePoints,
              scores: scoreResult.scores
            }
          },
          { new: true }
        );
      } else {
        activity = await DailyActivity.create({
          userId: userObjId,
          cycleId: cycleObjId,
          date: normalizedDate,
          dayNumber,
          isOffDay,
          isGraceEntry: isGraceEntry || false,
          ...normPayload,
          submittedAt: new Date()
        });
        score = await DailyScore.create({
          userId: userObjId,
          cycleId: cycleObjId,
          dailyActivityId: activity._id,
          date: normalizedDate,
          dayNumber,
          totalScore: scoreResult.totalScore,
          achievedPoints: scoreResult.achievedPoints,
          maxAvailablePoints: scoreResult.maxAvailablePoints,
          scores: scoreResult.scores
        });
        await Cycle.updateOne(
          { _id: cycleObjId, userId: userObjId },
          { $inc: { currentStreak: 1 } }
        );
      }
      if (dayNumber === 30) {
        await Cycle.updateOne({ _id: cycleObjId }, { $set: { status: 'completed' } });
      }
      const updatedCycle = await Cycle.findById(cycleObjId);
      return {
        activity,
        score,
        currentStreak: updatedCycle ? updatedCycle.currentStreak : 0
      };
    }
    throw error;
  } finally {
    if (session) session.endSession();
  }
};

/**
 * Submit today's checklist (POST /checklist)
 */
const submitTodayChecklist = async (userId, payload, timezoneOffset = 0) => {
  const cycle = await Cycle.findOne({ userId, status: 'active' });
  if (!cycle) {
    throw new NotFoundError(
      'No active tracking cycle found. You must start a cycle before submitting a checklist.',
      'NO_ACTIVE_CYCLE'
    );
  }

  const todayNormalized = normalizeToMidnight(new Date(), timezoneOffset);
  const dayNumber = calculateDayNumber(cycle.startDate, todayNormalized, timezoneOffset);

  // Check if today was already submitted
  const existingEntry = await DailyActivity.findOne({ userId, date: todayNormalized });
  if (existingEntry) {
    throw new ConflictError(
      'Checklist for this date has already been submitted. Use PUT /today to update.',
      'ALREADY_SUBMITTED_TODAY',
      'date'
    );
  }

  const result = await saveDailyChecklistTransaction(userId, payload, {
    isUpdate: false,
    normalizedDate: todayNormalized,
    dayNumber: Math.max(1, Math.min(30, dayNumber)),
    cycleId: cycle._id,
    isGraceEntry: false
  });

  return {
    success: true,
    data: {
      dayNumber: result.score.dayNumber,
      date: result.score.date.toISOString(),
      totalScore: result.score.totalScore,
      achievedPoints: result.score.achievedPoints,
      maxAvailablePoints: result.score.maxAvailablePoints,
      currentStreak: result.currentStreak,
      scores: result.score.scores
    },
    message: "Today's checklist recorded and scored successfully."
  };
};

/**
 * Edit today's checklist (PUT /today)
 */
const updateTodayChecklist = async (userId, payload, timezoneOffset = 0) => {
  const cycle = await Cycle.findOne({ userId, status: 'active' });
  if (!cycle) {
    throw new NotFoundError('No active tracking cycle found.', 'NO_ACTIVE_CYCLE');
  }

  const todayNormalized = normalizeToMidnight(new Date(), timezoneOffset);
  const dayNumber = calculateDayNumber(cycle.startDate, todayNormalized, timezoneOffset);

  const existingEntry = await DailyActivity.findOne({ userId, date: todayNormalized });
  if (!existingEntry) {
    throw new NotFoundError(
      "No checklist entry found for today. Use POST /checklist to submit today's entry.",
      'NO_ENTRY_TODAY'
    );
  }

  // Merge existing saved activity values with the incoming updates
  const mergedPayload = {
    ...existingEntry.toObject(),
    ...payload
  };

  const result = await saveDailyChecklistTransaction(userId, mergedPayload, {
    isUpdate: true,
    normalizedDate: todayNormalized,
    dayNumber: existingEntry.dayNumber || Math.max(1, dayNumber),
    cycleId: cycle._id,
    isGraceEntry: false
  });

  return {
    success: true,
    data: {
      dayNumber: result.score.dayNumber,
      date: result.score.date.toISOString(),
      totalScore: result.score.totalScore,
      achievedPoints: result.score.achievedPoints,
      maxAvailablePoints: result.score.maxAvailablePoints,
      currentStreak: result.currentStreak,
      scores: result.score.scores
    },
    message: "Today's entry successfully updated."
  };
};

/**
 * Edit or backfill yesterday's checklist via 24-hr grace window (PUT /yesterday)
 */
const updateYesterdayChecklist = async (userId, payload, timezoneOffset = 0) => {
  const cycle = await Cycle.findOne({ userId, status: 'active' });
  if (!cycle) {
    throw new NotFoundError('No active tracking cycle found.', 'NO_ACTIVE_CYCLE');
  }

  const todayNormalized = normalizeToMidnight(new Date(), timezoneOffset);
  const yesterdayNormalized = new Date(todayNormalized.getTime() - 24 * 60 * 60 * 1000);
  const yesterdayDayNumber = calculateDayNumber(cycle.startDate, yesterdayNormalized, timezoneOffset);

  if (yesterdayDayNumber < 1) {
    throw new ValidationError(
      'Cannot submit grace entry for dates prior to the cycle start date.',
      'date',
      'GRACE_WINDOW_EXPIRED'
    );
  }

  const existingEntry = await DailyActivity.findOne({ userId, date: yesterdayNormalized });
  const isUpdate = !!existingEntry;

  const mergedPayload = existingEntry
    ? { ...existingEntry.toObject(), ...payload }
    : payload;

  const result = await saveDailyChecklistTransaction(userId, mergedPayload, {
    isUpdate,
    normalizedDate: yesterdayNormalized,
    dayNumber: yesterdayDayNumber,
    cycleId: cycle._id,
    isGraceEntry: true
  });

  return {
    success: true,
    data: {
      dayNumber: result.score.dayNumber,
      date: result.score.date.toISOString(),
      totalScore: result.score.totalScore,
      achievedPoints: result.score.achievedPoints,
      maxAvailablePoints: result.score.maxAvailablePoints,
      currentStreak: result.currentStreak,
      scores: result.score.scores
    },
    message: "Yesterday's entry successfully recorded within grace window."
  };
};

/**
 * Fetch raw activity entry for today
 */
const getTodayActivity = async (userId, timezoneOffset = 0) => {
  const todayNormalized = normalizeToMidnight(new Date(), timezoneOffset);
  const activity = await DailyActivity.findOne({ userId, date: todayNormalized });
  if (!activity) {
    throw new NotFoundError('No checklist entry found for today.', 'NO_ENTRY_TODAY');
  }

  return {
    success: true,
    data: activity
  };
};

/**
 * Fetch raw activity entry by date
 */
const getActivityByDate = async (userId, dateString, timezoneOffset = 0) => {
  const normalized = normalizeToMidnight(dateString, timezoneOffset);
  const activity = await DailyActivity.findOne({ userId, date: normalized });
  if (!activity) {
    throw new NotFoundError(`No checklist entry found for date: ${dateString}`, 'NOT_FOUND');
  }

  return {
    success: true,
    data: activity
  };
};

/**
 * Fetch score calculation for today
 */
const getTodayScore = async (userId, timezoneOffset = 0) => {
  const todayNormalized = normalizeToMidnight(new Date(), timezoneOffset);
  const score = await DailyScore.findOne({ userId, date: todayNormalized });
  if (!score) {
    throw new NotFoundError('No score recorded for today.', 'NO_ENTRY_TODAY');
  }

  return {
    success: true,
    data: {
      date: score.date.toISOString(),
      dayNumber: score.dayNumber,
      totalScore: score.totalScore,
      achievedPoints: score.achievedPoints,
      maxAvailablePoints: score.maxAvailablePoints,
      scores: score.scores
    }
  };
};

/**
 * Fetch score calculation by date
 */
const getScoreByDate = async (userId, dateString, timezoneOffset = 0) => {
  const normalized = normalizeToMidnight(dateString, timezoneOffset);
  const score = await DailyScore.findOne({ userId, date: normalized });
  if (!score) {
    throw new NotFoundError(`No score recorded for date: ${dateString}`, 'NOT_FOUND');
  }

  return {
    success: true,
    data: {
      date: score.date.toISOString(),
      dayNumber: score.dayNumber,
      totalScore: score.totalScore,
      achievedPoints: score.achievedPoints,
      maxAvailablePoints: score.maxAvailablePoints,
      scores: score.scores
    }
  };
};

/**
 * Fetch all scores for a cycle
 */
const getCycleScores = async (userId, cycleId) => {
  const scores = await DailyScore.find({ userId, cycleId }).sort({ dayNumber: 1 });
  return {
    success: true,
    data: scores.map((s) => ({
      dayNumber: s.dayNumber,
      date: s.date.toISOString(),
      totalScore: s.totalScore,
      achievedPoints: s.achievedPoints,
      maxAvailablePoints: s.maxAvailablePoints,
      scores: s.scores
    }))
  };
};

module.exports = {
  saveDailyChecklistTransaction,
  submitTodayChecklist,
  updateTodayChecklist,
  updateYesterdayChecklist,
  getTodayActivity,
  getActivityByDate,
  getTodayScore,
  getScoreByDate,
  getCycleScores
};
