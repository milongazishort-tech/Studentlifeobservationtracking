require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const { connectDB, disconnectDB } = require('../config/db');
const { User, Cycle, DailyActivity, DailyScore } = require('../models');
const { normalizeToMidnight } = require('../utils/date.utils');
const {
  midnightMissedDayBackfillTransaction,
  runMissedDayBackfill
} = require('../services/cron/missedDayBackfill.job');

describe('Midnight Missed-Day Backfill Automation & Streak Reset Subsystem', () => {
  let testUser = null;
  let testCycle = null;

  beforeAll(async () => {
    await connectDB(2, 3000);

    const email = `backfill.test.${Date.now()}@smuct.edu.bd`;
    testUser = new User({
      name: 'Backfill Tester',
      email,
      passwordHash: 'dummyhash123',
      university: 'SMUCT',
      department: 'CSE',
      emailVerified: true
    });
    await testUser.save();
  }, 20000);

  beforeEach(async () => {
    if (testUser) {
      await DailyScore.deleteMany({ userId: testUser._id });
      await DailyActivity.deleteMany({ userId: testUser._id });
      await Cycle.deleteMany({ userId: testUser._id });
    }
  });

  afterAll(async () => {
    if (testUser) {
      await DailyScore.deleteMany({ userId: testUser._id });
      await DailyActivity.deleteMany({ userId: testUser._id });
      await Cycle.deleteMany({ userId: testUser._id });
      await User.deleteOne({ _id: testUser._id });
    }
    await disconnectDB();
  }, 20000);

  test('midnightMissedDayBackfillTransaction should insert 0% records and reset streak to 0', async () => {
    // 1. Setup a cycle with an ongoing streak of 7
    const startDate = normalizeToMidnight(new Date(Date.now() - 10 * 24 * 60 * 60 * 1000));
    const endDate = new Date(startDate.getTime() + 29 * 24 * 60 * 60 * 1000);

    testCycle = new Cycle({
      userId: testUser._id,
      cycleNumber: 1,
      startDate,
      endDate,
      status: 'active',
      currentStreak: 7,
      targetWakeUpTime: '06:30',
      targetSleepTime: '23:00'
    });
    await testCycle.save();

    const missedDate = normalizeToMidnight(new Date(Date.now() - 24 * 60 * 60 * 1000));
    const missedDayNumber = 10;

    // 2. Execute transaction
    const result = await midnightMissedDayBackfillTransaction(
      testUser._id,
      testCycle._id,
      missedDate,
      missedDayNumber
    );

    expect(result.success).toBe(true);
    expect(result.dayNumber).toBe(missedDayNumber);

    // 3. Verify DailyActivity record
    const activity = await DailyActivity.findOne({
      userId: testUser._id,
      cycleId: testCycle._id,
      date: missedDate
    });
    expect(activity).toBeDefined();
    expect(activity.isMissedDay).toBe(true);
    expect(activity.isOffDay).toBe(false);
    expect(activity.dayNumber).toBe(missedDayNumber);

    // 4. Verify DailyScore record
    const score = await DailyScore.findOne({
      userId: testUser._id,
      cycleId: testCycle._id,
      date: missedDate
    });
    expect(score).toBeDefined();
    expect(score.totalScore).toBe(0.0);
    expect(score.achievedPoints).toBe(0.0);
    expect(score.maxAvailablePoints).toBe(100);
    expect(score.scores.item1).toBe(0);
    expect(score.scores.item6).toBe(0);
    expect(score.scores.item12).toBe(0);

    // 5. Verify Cycle streak was reset to 0
    const updatedCycle = await Cycle.findById(testCycle._id);
    expect(updatedCycle.currentStreak).toBe(0);

    // Clean up cycle for next test
    await Cycle.deleteOne({ _id: testCycle._id });
  });

  test('runMissedDayBackfill should scan active cycles and backfill unrecorded past days', async () => {
    // Setup: Cycle started 3 days ago.
    // Day 1: Recorded
    // Day 2 (yesterday): NOT recorded
    // Day 3: Today
    const today = normalizeToMidnight(new Date());
    const startDate = new Date(today.getTime() - 2 * 24 * 60 * 60 * 1000); // 2 days ago = Day 1
    const day2Date = new Date(today.getTime() - 1 * 24 * 60 * 60 * 1000); // yesterday = Day 2

    const cycle = new Cycle({
      userId: testUser._id,
      cycleNumber: 2,
      startDate,
      endDate: new Date(startDate.getTime() + 29 * 24 * 60 * 60 * 1000),
      status: 'active',
      currentStreak: 1, // Streak was 1 after Day 1
      targetWakeUpTime: '06:30',
      targetSleepTime: '23:00'
    });
    await cycle.save();

    // Day 1 recorded
    await DailyActivity.create({
      userId: testUser._id,
      cycleId: cycle._id,
      date: startDate,
      dayNumber: 1,
      isOffDay: false,
      isMissedDay: false
    });

    // Run backfill for today
    const backfilled = await runMissedDayBackfill(today);

    // Day 2 should have been backfilled
    const userBackfills = backfilled.filter((b) => b.dayNumber === 2);
    expect(userBackfills.length).toBe(1);

    // Verify Day 2 activity is recorded as missed
    const day2Activity = await DailyActivity.findOne({
      userId: testUser._id,
      cycleId: cycle._id,
      date: day2Date
    });
    expect(day2Activity).toBeDefined();
    expect(day2Activity.isMissedDay).toBe(true);

    // Verify streak reset to 0
    const refreshedCycle = await Cycle.findById(cycle._id);
    expect(refreshedCycle.currentStreak).toBe(0);

    // Run again to ensure idempotency (no duplicate backfills)
    const secondRun = await runMissedDayBackfill(today);
    const secondBackfills = secondRun.filter((b) => b.dayNumber === 2);
    expect(secondBackfills.length).toBe(0);
  });
});
