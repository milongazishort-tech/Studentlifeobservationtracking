require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const request = require('supertest');
const app = require('../server');
const { connectDB, disconnectDB } = require('../config/db');
const { User, Cycle, DailyScore, DailyActivity, WeeklySummary, MonthlyResult } = require('../models');
const { normalizeToMidnight } = require('../utils/date.utils');
const { runMissedDayBackfill } = require('../services/cron/missedDayBackfill.job');

describe('End-to-End (E2E) Full-System Integration & Security Hardening Test Suite', () => {
  let studentUser = null;
  let authToken = null;
  let activeCycleId = null;
  let cycleStartDate = null;
  const userEmail = `e2e.student.${Date.now()}@smuct.edu.bd`;

  beforeAll(async () => {
    await connectDB(2, 3000);
  }, 30000);

  afterAll(async () => {
    if (studentUser) {
      await MonthlyResult.deleteMany({ userId: studentUser._id });
      await WeeklySummary.deleteMany({ userId: studentUser._id });
      await DailyScore.deleteMany({ userId: studentUser._id });
      await DailyActivity.deleteMany({ userId: studentUser._id });
      await Cycle.deleteMany({ userId: studentUser._id });
      await User.deleteOne({ _id: studentUser._id });
    }
    await disconnectDB();
  }, 30000);

  // -------------------------------------------------------------
  // 1. REGISTRATION, XSS SANITIZATION & EMAIL VERIFICATION
  // -------------------------------------------------------------
  test('1. Should register new student and sanitize HTML/XSS in inputs', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({
        name: 'John <script>alert("xss")</script> Doe',
        email: userEmail,
        password: 'Password@123',
        university: 'SMUCT <b>University</b>',
        department: 'Computer Science & Engineering',
        targetWakeUpTime: '06:30',
        targetSleepTime: '23:00'
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);

    studentUser = await User.findOne({ email: userEmail });
    expect(studentUser).toBeDefined();
    // Verify XSS script was escaped
    expect(studentUser.name).not.toContain('<script>');
    expect(studentUser.emailVerified).toBe(false);
  });

  test('2. Should reject login before email verification with 403 EMAIL_NOT_VERIFIED', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: userEmail,
        password: 'Password@123'
      });

    expect(res.statusCode).toBe(403);
    expect(res.body.error.code).toBe('EMAIL_NOT_VERIFIED');
  });

  test('3. Should verify email with verification token', async () => {
    const res = await request(app)
      .post('/api/v1/auth/verify-email')
      .send({ token: studentUser.verificationToken });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);

    const reloaded = await User.findById(studentUser._id);
    expect(reloaded.emailVerified).toBe(true);
  });

  test('4. Should authenticate verified student and return 7-day JWT', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: userEmail,
        password: 'Password@123'
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.data.token).toBeDefined();
    authToken = res.body.data.token;
  });

  // -------------------------------------------------------------
  // 2. CYCLE LIFECYCLE MANAGEMENT
  // -------------------------------------------------------------
  test('5. Should initialize 30-day tracking cycle and reject duplicate active cycles', async () => {
    const today = new Date().toISOString().split('T')[0];

    const res = await request(app)
      .post('/api/v1/cycles')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        startDate: today,
        targetWakeUpTime: '06:30',
        targetSleepTime: '23:00'
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.data.cycleId).toBeDefined();
    expect(res.body.data.currentStreak).toBe(0);

    activeCycleId = res.body.data.cycleId;
    cycleStartDate = res.body.data.startDate;

    // Attempting to start a second cycle must return 409 Conflict
    const dupRes = await request(app)
      .post('/api/v1/cycles')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        startDate: today,
        targetWakeUpTime: '07:00',
        targetSleepTime: '23:30'
      });

    expect(dupRes.statusCode).toBe(409);
    expect(dupRes.body.error.code).toBe('ACTIVE_CYCLE_EXISTS');
  });

  // -------------------------------------------------------------
  // 3. DAILY CHECKLIST, SCORING & STREAK INTEGRITY
  // -------------------------------------------------------------
  test('6. Should record Day 1 checklist, calculate score, and increment streak to 1', async () => {
    const res = await request(app)
      .post('/api/v1/checklist')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        item1_earlyMorning: true, // 8
        item2_universityAttendance: 'yes', // 10
        item3_classParticipation_attended: 4,
        item3_classParticipation_total: 4, // 8
        item4_personalDiscipline: true, // 8
        item5_socialInteractions: 3, // 6
        item6_dailyLearning_text: 'Studied full system integration pipelines', // 10
        item7_physicalActivity: true,
        item7_physicalMinutes: 30, // 10
        item8_skillDevelopmentMinutes: 60, // 10
        item9_classWorkRecap: true, // 10
        item10_socialMediaControl: 'controlled', // 6
        item11_selfReflection_text: 'Productive day with high focus', // 8
        item12_sleepOnTime: true // 6 -> Total = 100
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.data.totalScore).toBe(100);
    expect(res.body.data.currentStreak).toBe(1);

    const cycle = await Cycle.findById(activeCycleId);
    expect(cycle.currentStreak).toBe(1);
  });

  test('7. Should update today checklist without causing duplicate streak increment', async () => {
    const res = await request(app)
      .put('/api/v1/checklist/today')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        item1_earlyMorning: false // dropped from 8 to 0 (-8 pts)
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.data.totalScore).toBe(92);
    // STREAK MUST REMAIN 1
    expect(res.body.data.currentStreak).toBe(1);

    const cycle = await Cycle.findById(activeCycleId);
    expect(cycle.currentStreak).toBe(1);
  });

  test('8. Should enforce off-day denominator of 82 when university attendance is off_day', async () => {
    // Simulate updating Day 1 to an off-day
    const res = await request(app)
      .put('/api/v1/checklist/today')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        item2_universityAttendance: 'off_day',
        item1_earlyMorning: true
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.data.maxAvailablePoints).toBe(82);
    expect(res.body.data.currentStreak).toBe(1);
  });

  // -------------------------------------------------------------
  // 4. MISSED-DAY CRON BACKFILL & STREAK RESILIENCE
  // -------------------------------------------------------------
  test('9. Should backfill 0% score and reset streak to 0 when student misses a calendar day', async () => {
    // Fast-forward cycle start date backward so that yesterday was Day 2 and had no entry
    const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);
    await Cycle.findByIdAndUpdate(activeCycleId, {
      startDate: twoDaysAgo,
      currentStreak: 5 // simulate streak of 5
    });

    const result = await runMissedDayBackfill();
    expect(Array.isArray(result)).toBe(true);

    const updatedCycle = await Cycle.findById(activeCycleId);
    expect(updatedCycle.currentStreak).toBe(0);
  });

  // -------------------------------------------------------------
  // 5. WEEKLY & 30-DAY MONTHLY AGGREGATIONS
  // -------------------------------------------------------------
  test('10. Should unlock Week 1 analytics once Day 7 is reached', async () => {
    await DailyScore.deleteMany({ userId: studentUser._id });
    await WeeklySummary.deleteMany({ userId: studentUser._id });

    // Seed 7 days of scores for this user and cycle
    const baseDate = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000);
    await Cycle.findByIdAndUpdate(activeCycleId, { startDate: baseDate });

    const bulkScores = [];
    for (let day = 1; day <= 7; day++) {
      const d = new Date(baseDate.getTime() + (day - 1) * 24 * 60 * 60 * 1000);
      bulkScores.push({
        userId: studentUser._id,
        cycleId: activeCycleId,
        dailyActivityId: new (require('mongoose').Types.ObjectId)(),
        dayNumber: day,
        date: normalizeToMidnight(d),
        totalScore: 75 + day,
        achievedPoints: 75 + day,
        maxAvailablePoints: 100,
        scores: {
          item1: 8, item2: 10, item3: 6, item4: 8, item5: 4, item6: 10,
          item7: 5, item8: 6, item9: 8, item10: 3, item11: 8, item12: 0
        }
      });
    }
    await DailyScore.insertMany(bulkScores);

    const res = await request(app)
      .get('/api/v1/weekly/1')
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.data.weeklyAverageScore).toBeGreaterThan(0);
    expect(res.body.data.daysTracked).toBe(7);
    expect(res.body.data.focusTip).toBeDefined();
    expect(res.body.data.deltaFromPreviousWeek).toBeNull(); // Baseline week
  });

  test('11. Should compile 30-day report and assign Life Stage (1 to 10) upon cycle completion', async () => {
    await DailyScore.deleteMany({ userId: studentUser._id });
    await MonthlyResult.deleteMany({ userId: studentUser._id });

    // Seed 30 days of scores for this user and cycle
    const bulk30 = [];
    const baseDate = new Date(Date.now() - 35 * 24 * 60 * 60 * 1000);
    await Cycle.findByIdAndUpdate(activeCycleId, {
      startDate: baseDate,
      status: 'completed'
    });

    for (let day = 1; day <= 30; day++) {
      const d = new Date(baseDate.getTime() + (day - 1) * 24 * 60 * 60 * 1000);
      bulk30.push({
        userId: studentUser._id,
        cycleId: activeCycleId,
        dailyActivityId: new (require('mongoose').Types.ObjectId)(),
        dayNumber: day,
        date: normalizeToMidnight(d),
        totalScore: 82.5,
        achievedPoints: 82.5,
        maxAvailablePoints: 100,
        scores: {
          item1: 8, item2: 10, item3: 8, item4: 8, item5: 6, item6: 10,
          item7: 10, item8: 6, item9: 10, item10: 6, item11: 8, item12: 6
        }
      });
    }
    await DailyScore.insertMany(bulk30);

    const res = await request(app)
      .get(`/api/v1/monthly/${activeCycleId}`)
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.data.lifeStage).toBeGreaterThanOrEqual(1);
    expect(res.body.data.lifeStage).toBeLessThanOrEqual(10);
    expect(res.body.data.lifeStageName).toBeDefined();
    expect(res.body.data.strengths.length).toBeLessThanOrEqual(3);
    expect(res.body.data.weaknesses.length).toBeLessThanOrEqual(3);
    expect(res.body.data.progressTrend.length).toBe(5);
    expect(res.body.data.lifeInsight).toBeDefined();
  });

  // -------------------------------------------------------------
  // 6. SECURITY HARDENING: RATE LIMITING & ROUTE PROTECTION
  // -------------------------------------------------------------
  test('12. Should reject unauthorized requests to protected endpoints with 401 UNAUTHORIZED', async () => {
    const res = await request(app).get('/api/v1/users/me');
    expect(res.statusCode).toBe(401);
    expect(res.body.error.code).toBe('UNAUTHORIZED');
  });

  test('13. Should trigger 429 RATE_LIMIT_EXCEEDED when auth rate limit is exceeded', async () => {
    const promises = [];
    for (let i = 0; i < 12; i++) {
      promises.push(
        request(app)
          .post('/api/v1/auth/login')
          .set('x-test-rate-limit', 'true')
          .send({ email: 'bad@student.com', password: 'WrongPassword@123' })
      );
    }

    const responses = await Promise.all(promises);
    const has429 = responses.some((r) => r.statusCode === 429);
    expect(has429).toBe(true);

    const rateLimited = responses.find((r) => r.statusCode === 429);
    expect(rateLimited.body.error.code).toBe('RATE_LIMIT_EXCEEDED');
  });
});
