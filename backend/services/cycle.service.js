const { Cycle, User, DailyActivity } = require('../models');
const { NotFoundError, ConflictError, ValidationError } = require('../utils/errors');
const { normalizeToMidnight, calculateDayNumber } = require('../utils/date.utils');

/**
 * Start a new 30-day tracking cycle
 */
const startCycle = async (userId, payload = {}, timezoneOffset = 0) => {
  const { startDate, targetWakeUpTime, targetSleepTime } = payload;

  // 1. Enforce single active cycle constraint
  const existingActive = await Cycle.findOne({ userId, status: 'active' });
  if (existingActive) {
    throw new ConflictError(
      'An active cycle is already ongoing. You must complete or abandon it before starting a new cycle.',
      'ACTIVE_CYCLE_EXISTS',
      'status'
    );
  }

  // 2. Fetch user profile for default lifestyle parameters if omitted
  const user = await User.findById(userId);
  if (!user) {
    throw new NotFoundError('User profile not found.');
  }

  const frozenWakeUp = targetWakeUpTime || user.targetWakeUpTime || '06:30';
  const frozenSleep = targetSleepTime || user.targetSleepTime || '23:00';

  // 3. Compute normalized boundary dates
  const normalizedStart = normalizeToMidnight(startDate || new Date(), timezoneOffset);
  const normalizedEnd = new Date(normalizedStart.getTime() + 29 * 24 * 60 * 60 * 1000);

  // 4. Determine ordinal cycle number
  const cycleCount = await Cycle.countDocuments({ userId });
  const cycleNumber = cycleCount + 1;

  // 5. Persist new Cycle document
  const newCycle = new Cycle({
    userId,
    cycleNumber,
    startDate: normalizedStart,
    endDate: normalizedEnd,
    status: 'active',
    currentStreak: 0,
    targetWakeUpTime: frozenWakeUp,
    targetSleepTime: frozenSleep
  });

  await newCycle.save();

  return {
    success: true,
    data: {
      cycleId: newCycle._id.toString(),
      cycleNumber: newCycle.cycleNumber,
      startDate: newCycle.startDate.toISOString(),
      endDate: newCycle.endDate.toISOString(),
      status: newCycle.status,
      currentStreak: newCycle.currentStreak,
      targetWakeUpTime: newCycle.targetWakeUpTime,
      targetSleepTime: newCycle.targetSleepTime
    }
  };
};

/**
 * Retrieve status of currently active cycle
 */
const getActiveCycle = async (userId, timezoneOffset = 0) => {
  const cycle = await Cycle.findOne({ userId, status: 'active' });
  if (!cycle) {
    throw new NotFoundError('No active tracking cycle found.', 'NO_ACTIVE_CYCLE');
  }

  const todayNormalized = normalizeToMidnight(new Date(), timezoneOffset);
  const dayNumber = calculateDayNumber(cycle.startDate, todayNormalized, timezoneOffset);

  // Transition to completed if 30-day window has expired
  if (dayNumber > 30) {
    cycle.status = 'completed';
    await cycle.save();
    throw new NotFoundError('The active tracking cycle has concluded.', 'NO_ACTIVE_CYCLE');
  }

  // Check if today's activity entry is already recorded
  const todayEntry = await DailyActivity.findOne({
    userId,
    cycleId: cycle._id,
    date: todayNormalized
  });

  return {
    success: true,
    data: {
      cycleId: cycle._id.toString(),
      cycleNumber: cycle.cycleNumber,
      dayNumber: Math.max(1, dayNumber),
      startDate: cycle.startDate.toISOString(),
      endDate: cycle.endDate.toISOString(),
      status: cycle.status,
      currentStreak: cycle.currentStreak,
      hasSubmittedToday: !!todayEntry
    }
  };
};

/**
 * Retrieve student's cycle history
 */
const getCycleHistory = async (userId) => {
  const cycles = await Cycle.find({ userId }).sort({ cycleNumber: -1 });

  return {
    success: true,
    data: cycles.map((c) => ({
      cycleId: c._id.toString(),
      cycleNumber: c.cycleNumber,
      startDate: c.startDate.toISOString(),
      endDate: c.endDate.toISOString(),
      status: c.status,
      currentStreak: c.currentStreak
    }))
  };
};

/**
 * Abandon currently active cycle
 */
const abandonCycle = async (userId, cycleId) => {
  const cycle = await Cycle.findOne({ _id: cycleId, userId });
  if (!cycle) {
    throw new NotFoundError('Cycle record not found.');
  }

  if (cycle.status === 'abandoned') {
    return {
      success: true,
      message: 'Cycle is already marked as abandoned.'
    };
  }

  cycle.status = 'abandoned';
  await cycle.save();

  return {
    success: true,
    message: 'Cycle marked as abandoned. You may now start a fresh cycle.'
  };
};

module.exports = {
  startCycle,
  getActiveCycle,
  getCycleHistory,
  abandonCycle
};
