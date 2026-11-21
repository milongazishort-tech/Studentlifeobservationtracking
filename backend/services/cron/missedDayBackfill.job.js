const cron = require('node-cron');
const mongoose = require('mongoose');
const { Cycle, DailyActivity, DailyScore } = require('../../models');
const { normalizeToMidnight, calculateDayNumber } = require('../../utils/date.utils');

/**
 * Multi-document ACID transaction: Creates a 0% missed activity record,
 * 0% score record, and resets cycle streak to 0.
 * Follows database.md Section 7.2
 */
const midnightMissedDayBackfillTransaction = async (userId, cycleId, missedDate, dayNumber) => {
  const userObjId = new mongoose.Types.ObjectId(userId);
  const cycleObjId = new mongoose.Types.ObjectId(cycleId);
  const normalizedDate = normalizeToMidnight(missedDate);

  let session = null;
  try {
    session = await mongoose.startSession();
    session.startTransaction();

    // 1. Create a dummy missed activity record
    const [activity] = await DailyActivity.create(
      [
        {
          userId: userObjId,
          cycleId: cycleObjId,
          date: normalizedDate,
          dayNumber,
          isOffDay: false,
          isMissedDay: true,
          isGraceEntry: false,
          submittedAt: new Date()
        }
      ],
      { session }
    );

    // 2. Create 0% score record
    await DailyScore.create(
      [
        {
          userId: userObjId,
          cycleId: cycleObjId,
          dailyActivityId: activity._id,
          date: normalizedDate,
          dayNumber,
          totalScore: 0.0,
          maxAvailablePoints: 100,
          achievedPoints: 0.0,
          scores: {
            item1: 0, item2: 0, item3: 0, item4: 0, item5: 0, item6: 0,
            item7: 0, item8: 0, item9: 0, item10: 0, item11: 0, item12: 0
          }
        }
      ],
      { session }
    );

    // 3. Reset consecutive streak to 0 in cycles collection
    await Cycle.updateOne(
      { _id: cycleObjId, userId: userObjId },
      { $set: { currentStreak: 0 } },
      { session }
    );

    // Auto-complete if Day 30 was missed
    if (dayNumber === 30) {
      await Cycle.updateOne(
        { _id: cycleObjId },
        { $set: { status: 'completed' } },
        { session }
      );
    }

    await session.commitTransaction();
    return { success: true, backfilledDate: normalizedDate, dayNumber };
  } catch (error) {
    if (session && session.inTransaction()) {
      await session.abortTransaction();
    }
    // Fallback for non-replica set environments
    if (error.message && error.message.includes('replica set')) {
      const activity = await DailyActivity.create({
        userId: userObjId,
        cycleId: cycleObjId,
        date: normalizedDate,
        dayNumber,
        isOffDay: false,
        isMissedDay: true,
        isGraceEntry: false,
        submittedAt: new Date()
      });

      await DailyScore.create({
        userId: userObjId,
        cycleId: cycleObjId,
        dailyActivityId: activity._id,
        date: normalizedDate,
        dayNumber,
        totalScore: 0.0,
        maxAvailablePoints: 100,
        achievedPoints: 0.0,
        scores: {
          item1: 0, item2: 0, item3: 0, item4: 0, item5: 0, item6: 0,
          item7: 0, item8: 0, item9: 0, item10: 0, item11: 0, item12: 0
        }
      });

      await Cycle.updateOne(
        { _id: cycleObjId, userId: userObjId },
        { $set: { currentStreak: 0 } }
      );

      if (dayNumber === 30) {
        await Cycle.updateOne({ _id: cycleObjId }, { $set: { status: 'completed' } });
      }

      return { success: true, backfilledDate: normalizedDate, dayNumber };
    }
    throw error;
  } finally {
    if (session) session.endSession();
  }
};

/**
 * Sweeps all active cycles and backfills missed days past the grace cutoff.
 * @param {Date} [referenceDate] Optional reference date (defaults to now)
 */
const runMissedDayBackfill = async (referenceDate = new Date()) => {
  const activeCycles = await Cycle.find({ status: 'active' });
  const todayMidnight = normalizeToMidnight(referenceDate);
  const backfillResults = [];

  for (const cycle of activeCycles) {
    try {
      // The day being evaluated as missed is yesterday (past the immediate logging window)
      const missedDate = new Date(todayMidnight.getTime() - 24 * 60 * 60 * 1000);
      const dayNumber = calculateDayNumber(cycle.startDate, missedDate);

      // Only evaluate days that fall within the cycle boundary (Day 1 to 30)
      if (dayNumber >= 1 && dayNumber <= 30) {
        const existingRecord = await DailyActivity.findOne({
          userId: cycle.userId,
          cycleId: cycle._id,
          date: missedDate
        });

        if (!existingRecord) {
          console.log(
            `[Backfill Job] Backfilling missed Day ${dayNumber} (${missedDate.toISOString().slice(0, 10)}) for user ${cycle.userId}`
          );
          const result = await midnightMissedDayBackfillTransaction(
            cycle.userId,
            cycle._id,
            missedDate,
            dayNumber
          );
          backfillResults.push(result);
        }
      }
    } catch (err) {
      console.error(`[Backfill Job] Error processing cycle ${cycle._id}:`, err.message);
    }
  }

  return backfillResults;
};

/**
 * Initializes the automated midnight cron job running daily at 00:00:00
 */
const initMissedDayCron = () => {
  // Runs at midnight every night: '0 0 * * *'
  const task = cron.schedule('0 0 * * *', async () => {
    console.log('[Cron Job] Executing midnight missed-day backfill and streak check...');
    try {
      const results = await runMissedDayBackfill();
      console.log(`[Cron Job] Missed-day backfill completed. ${results.length} records backfilled.`);
    } catch (error) {
      console.error('[Cron Job] Missed-day backfill failed:', error.message);
    }
  });

  return task;
};

module.exports = {
  midnightMissedDayBackfillTransaction,
  runMissedDayBackfill,
  initMissedDayCron
};
