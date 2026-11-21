require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const mongoose = require('mongoose');
const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../server');
const { connectDB, disconnectDB } = require('../config/db');
const { User, Cycle, DailyScore, DailyActivity, WeeklySummary, MonthlyResult } = require('../models');
const { classifyLifeStage } = require('../services/classification/LifeStageClassifier');
const { generateLifeInsight, getFocusTip } = require('../services/classification/InsightRuleEngine');
const { normalizeToMidnight } = require('../utils/date.utils');

describe('Weekly & Monthly Aggregation and Reporting Subsystem', () => {
  // 1. LIFE STAGE CLASSIFIER UNIT TESTS
  describe('LifeStageClassifier Unit Tests (10 Boundary Ranges)', () => {
    test('should classify Stage 1 (0.00 - 19.99%)', () => {
      const res = classifyLifeStage(15.5);
      expect(res.stage).toBe(1);
      expect(res.name).toBe('Critical / Highly Unbalanced');
    });

    test('should classify Stage 2 (20.00 - 29.99%)', () => {
      const res = classifyLifeStage(25.0);
      expect(res.stage).toBe(2);
      expect(res.name).toBe('Struggling / Low Discipline');
    });

    test('should classify Stage 3 (30.00 - 39.99%)', () => {
      const res = classifyLifeStage(38.0);
      expect(res.stage).toBe(3);
      expect(res.name).toBe('Inconsistent Routine');
    });

    test('should classify Stage 4 (40.00 - 49.99%)', () => {
      const res = classifyLifeStage(45.2);
      expect(res.stage).toBe(4);
      expect(res.name).toBe('Emerging Awareness');
    });

    test('should classify Stage 5 (50.00 - 59.99%)', () => {
      const res = classifyLifeStage(55.0);
      expect(res.stage).toBe(5);
      expect(res.name).toBe('Moderate Balance');
    });

    test('should classify Stage 6 (60.00 - 69.99%)', () => {
      const res = classifyLifeStage(68.5);
      expect(res.stage).toBe(6);
      expect(res.name).toBe('Steady Progress');
    });

    test('should classify Stage 7 (70.00 - 79.99%)', () => {
      const res = classifyLifeStage(76.0);
      expect(res.stage).toBe(7);
      expect(res.name).toBe('Disciplined Student');
    });

    test('should classify Stage 8 (80.00 - 89.99%)', () => {
      const res = classifyLifeStage(86.4);
      expect(res.stage).toBe(8);
      expect(res.name).toBe('High Achiever');
    });

    test('should classify Stage 9 (90.00 - 94.99%)', () => {
      const res = classifyLifeStage(92.0);
      expect(res.stage).toBe(9);
      expect(res.name).toBe('Exemplary Lifestyle');
    });

    test('should classify Stage 10 (95.00 - 100.00%)', () => {
      const res = classifyLifeStage(99.0);
      expect(res.stage).toBe(10);
      expect(res.name).toBe('Exceptional Self-Development');
    });
  });

  // 2. INSIGHT RULE ENGINE UNIT TESTS
  describe('InsightRuleEngine Unit Tests', () => {
    test('should flag hasEnoughData: false and attach caveat when consistency < 50%', () => {
      const res = generateLifeInsight({
        lifeScore: 70.0,
        habitConsistency: 40.0, // < 50%
        strengths: [{ item: 2, areaName: 'University Attendance', completionRate: 0.9 }],
        weaknesses: [{ item: 7, areaName: 'Physical Activity', completionRate: 0.3 }]
      });

      expect(res.hasEnoughData).toBe(false);
      expect(res.lifeInsight).toContain('limited tracking data');
      expect(res.improvementSuggestions.length).toBeGreaterThanOrEqual(2);
    });

    test('should flag hasEnoughData: true when consistency >= 50%', () => {
      const res = generateLifeInsight({
        lifeScore: 85.0,
        habitConsistency: 80.0,
        strengths: [{ item: 2, areaName: 'University Attendance', completionRate: 0.95 }],
        weaknesses: [{ item: 12, areaName: 'Sleeping on Time', completionRate: 0.6 }]
      });

      expect(res.hasEnoughData).toBe(true);
      expect(res.lifeInsight).not.toContain('limited tracking data');
    });

    test('getFocusTip should return relevant action advice for lowest area', () => {
      const tip = getFocusTip('item7');
      expect(tip).toContain('physical exercise');
    });
  });

  // 3. INTEGRATION TESTS FOR WEEKLY & MONTHLY ENDPOINTS
  describe('Aggregation Endpoints Integration Tests', () => {
    let testUser = null;
    let authToken = null;
    let cycleId = null;
    let startDate = null;

    beforeAll(async () => {
      await connectDB(2, 3000);

      const email = `aggregate.test.${Date.now()}@smuct.edu.bd`;
      testUser = new User({
        name: 'Aggregate Tester',
        email,
        passwordHash: 'dummyhash',
        university: 'SMUCT',
        department: 'CSE',
        emailVerified: true
      });
      await testUser.save();

      const secret = process.env.JWT_SECRET || 'dev_jwt_secret_key_studentlife_tracker_2026_cse3210';
      authToken = jwt.sign(
        { userId: testUser._id.toString(), email: testUser.email },
        secret,
        { expiresIn: '1d' }
      );
    }, 20000);

    beforeEach(async () => {
      if (testUser) {
        await MonthlyResult.deleteMany({ userId: testUser._id });
        await WeeklySummary.deleteMany({ userId: testUser._id });
        await DailyScore.deleteMany({ userId: testUser._id });
        await DailyActivity.deleteMany({ userId: testUser._id });
        await Cycle.deleteMany({ userId: testUser._id });
      }
    });

    afterAll(async () => {
      if (testUser) {
        await MonthlyResult.deleteMany({ userId: testUser._id });
        await WeeklySummary.deleteMany({ userId: testUser._id });
        await DailyScore.deleteMany({ userId: testUser._id });
        await DailyActivity.deleteMany({ userId: testUser._id });
        await Cycle.deleteMany({ userId: testUser._id });
        await User.deleteOne({ _id: testUser._id });
      }
      await disconnectDB();
    }, 20000);

    test('GET /api/v1/weekly/:weekNumber should reject prematurely unlocked week with 400 WEEK_NOT_UNLOCKED', async () => {
      // Cycle starts today (Day 1)
      startDate = normalizeToMidnight(new Date());
      const cycle = new Cycle({
        userId: testUser._id,
        cycleNumber: 1,
        startDate,
        endDate: new Date(startDate.getTime() + 29 * 24 * 60 * 60 * 1000),
        status: 'active',
        currentStreak: 1,
        targetWakeUpTime: '06:30',
        targetSleepTime: '23:00'
      });
      await cycle.save();

      // Attempt to access Week 1 before Day 7
      const res = await request(app)
        .get('/api/v1/weekly/1')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('WEEK_NOT_UNLOCKED');
    });

    test('GET /api/v1/weekly/1 should calculate and cache Week 1 summary when week is concluded', async () => {
      // Cycle started 8 days ago, so Day 7 is concluded
      startDate = normalizeToMidnight(new Date(Date.now() - 8 * 24 * 60 * 60 * 1000));
      const cycle = new Cycle({
        userId: testUser._id,
        cycleNumber: 1,
        startDate,
        endDate: new Date(startDate.getTime() + 29 * 24 * 60 * 60 * 1000),
        status: 'active',
        currentStreak: 7,
        targetWakeUpTime: '06:30',
        targetSleepTime: '23:00'
      });
      await cycle.save();

      // Seed 7 days of daily scores (Days 1–7)
      const week1Scores = [];
      for (let day = 1; day <= 7; day++) {
        const date = new Date(startDate.getTime() + (day - 1) * 24 * 60 * 60 * 1000);
        week1Scores.push({
          userId: testUser._id,
          cycleId: cycle._id,
          dailyActivityId: new mongoose.Types.ObjectId(),
          date,
          dayNumber: day,
          totalScore: 80.0,
          maxAvailablePoints: 100,
          achievedPoints: 80.0,
          scores: {
            item1: 8, item2: 10, item3: 8, item4: 8, item5: 6, item6: 10,
            item7: 0, item8: 10, item9: 10, item10: 6, item11: 4, item12: 0
          }
        });
      }
      await DailyScore.insertMany(week1Scores);

      const res = await request(app)
        .get('/api/v1/weekly/1')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.weekNumber).toBe(1);
      expect(res.body.data.weeklyAverageScore).toBe(80.0);
      expect(res.body.data.daysTracked).toBe(7);
      expect(res.body.data.deltaFromPreviousWeek).toBeNull(); // Week 1 baseline
      expect(res.body.data.focusTip).toBeDefined();

      // Verify cached in MongoDB
      const cached = await WeeklySummary.findOne({ userId: testUser._id, weekNumber: 1 });
      expect(cached).toBeDefined();
      expect(cached.isGenerated).toBe(true);
    });

    test('GET /api/v1/monthly/:cycleId should reject uncompleted cycle with 400 CYCLE_NOT_COMPLETED', async () => {
      startDate = normalizeToMidnight(new Date());
      const cycle = new Cycle({
        userId: testUser._id,
        cycleNumber: 1,
        startDate,
        endDate: new Date(startDate.getTime() + 29 * 24 * 60 * 60 * 1000),
        status: 'active',
        currentStreak: 5,
        targetWakeUpTime: '06:30',
        targetSleepTime: '23:00'
      });
      await cycle.save();

      const res = await request(app)
        .get(`/api/v1/monthly/${cycle._id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('CYCLE_NOT_COMPLETED');
    });

    test('GET /api/v1/monthly/:cycleId should compile 30-day report with Life Stage classification', async () => {
      // Create a completed cycle
      startDate = normalizeToMidnight(new Date(Date.now() - 31 * 24 * 60 * 60 * 1000));
      const cycle = new Cycle({
        userId: testUser._id,
        cycleNumber: 1,
        startDate,
        endDate: new Date(startDate.getTime() + 29 * 24 * 60 * 60 * 1000),
        status: 'completed',
        currentStreak: 30,
        targetWakeUpTime: '06:30',
        targetSleepTime: '23:00'
      });
      await cycle.save();

      // Seed all 30 days of daily scores in a single batch
      const bulkScores = [];
      for (let day = 1; day <= 30; day++) {
        const date = new Date(startDate.getTime() + (day - 1) * 24 * 60 * 60 * 1000);
        bulkScores.push({
          userId: testUser._id,
          cycleId: cycle._id,
          dailyActivityId: new mongoose.Types.ObjectId(),
          date,
          dayNumber: day,
          totalScore: 85.0,
          maxAvailablePoints: 100,
          achievedPoints: 85.0,
          scores: {
            item1: 8, item2: 10, item3: 8, item4: 8, item5: 6, item6: 10,
            item7: 5, item8: 10, item9: 10, item10: 6, item11: 4, item12: 0
          }
        });
      }
      await DailyScore.insertMany(bulkScores);

      const res = await request(app)
        .get(`/api/v1/monthly/${cycle._id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.lifeScore).toBe(85.0);
      expect(res.body.data.lifeStage).toBe(8);
      expect(res.body.data.lifeStageName).toBe('High Achiever');
      expect(res.body.data.strengths.length).toBe(3);
      expect(res.body.data.weaknesses.length).toBe(3);
      expect(res.body.data.progressTrend.length).toBe(5); // 5 weeks
      expect(res.body.data.hasEnoughData).toBe(true);
      expect(res.body.data.improvementSuggestions.length).toBeGreaterThanOrEqual(2);

      // Verify cached in MonthlyResult
      const cachedReport = await MonthlyResult.findOne({ userId: testUser._id, cycleId: cycle._id });
      expect(cachedReport).toBeDefined();
      expect(cachedReport.isGenerated).toBe(true);
    }, 20000);
  });
});
