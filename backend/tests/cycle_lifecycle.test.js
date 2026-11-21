const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../server');
const { connectDB, disconnectDB } = require('../config/db');
const { User, Cycle } = require('../models');
const { normalizeToMidnight, calculateDayNumber } = require('../utils/date.utils');

describe('Cycle Lifecycle & Day Calculation Subsystem', () => {
  let testUser = null;
  let authToken = null;
  let cycleId = null;

  beforeAll(async () => {
    await connectDB(2, 3000);

    // Create a verified test user
    const email = `cycle.test.${Date.now()}@smuct.edu.bd`;
    testUser = new User({
      name: 'Cycle Tester',
      email,
      passwordHash: 'dummyhashedpassword',
      university: 'SMUCT',
      department: 'CSE',
      emailVerified: true,
      targetWakeUpTime: '06:30',
      targetSleepTime: '23:00'
    });
    await testUser.save();

    const secret = process.env.JWT_SECRET || 'dev_jwt_secret_key_studentlife_tracker_2026_cse3210';
    authToken = jwt.sign(
      { userId: testUser._id.toString(), email: testUser.email },
      secret,
      { expiresIn: '1d' }
    );
  }, 20000);

  afterAll(async () => {
    if (testUser) {
      await Cycle.deleteMany({ userId: testUser._id });
      await User.deleteOne({ _id: testUser._id });
    }
    await disconnectDB();
  }, 20000);

  // 1. DATE UTILITY UNIT TESTS
  describe('Date Utilities Unit Tests', () => {
    test('normalizeToMidnight should reset hours to 00:00:00.000 UTC', () => {
      const d = new Date('2026-11-15T15:30:45.500Z');
      const normalized = normalizeToMidnight(d);
      expect(normalized.getUTCHours()).toBe(0);
      expect(normalized.getUTCMinutes()).toBe(0);
      expect(normalized.getUTCSeconds()).toBe(0);
      expect(normalized.getUTCMilliseconds()).toBe(0);
      expect(normalized.getUTCDate()).toBe(15);
    });

    test('calculateDayNumber should accurately compute cycle days', () => {
      const start = new Date('2026-11-01T00:00:00.000Z');

      // Day 1
      const day1 = new Date('2026-11-01T12:00:00.000Z');
      expect(calculateDayNumber(start, day1)).toBe(1);

      // Day 14
      const day14 = new Date('2026-11-14T20:00:00.000Z');
      expect(calculateDayNumber(start, day14)).toBe(14);

      // Day 30
      const day30 = new Date('2026-11-30T09:00:00.000Z');
      expect(calculateDayNumber(start, day30)).toBe(30);

      // Past Day 30 (Day 31)
      const day31 = new Date('2026-12-01T00:00:00.000Z');
      expect(calculateDayNumber(start, day31)).toBe(31);
    });
  });

  // 2. CYCLE LIFECYCLE API TESTS
  describe('Cycle Lifecycle Endpoints', () => {
    test('GET /api/v1/cycles/active should return 404 NO_ACTIVE_CYCLE when user has no cycle', async () => {
      const res = await request(app)
        .get('/api/v1/cycles/active')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('NO_ACTIVE_CYCLE');
    });

    test('POST /api/v1/cycles should reject future start date with 400 VALIDATION_ERROR', async () => {
      const futureDate = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString();
      const res = await request(app)
        .post('/api/v1/cycles')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ startDate: futureDate });

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    test('POST /api/v1/cycles should successfully start a new 30-day tracking cycle', async () => {
      const res = await request(app)
        .post('/api/v1/cycles')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          targetWakeUpTime: '06:00',
          targetSleepTime: '22:30'
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.cycleId).toBeDefined();
      expect(res.body.data.cycleNumber).toBe(1);
      expect(res.body.data.status).toBe('active');
      expect(res.body.data.currentStreak).toBe(0);
      expect(res.body.data.targetWakeUpTime).toBe('06:00');
      expect(res.body.data.targetSleepTime).toBe('22:30');

      cycleId = res.body.data.cycleId;

      // Verify that endDate is exactly startDate + 29 days
      const startDate = new Date(res.body.data.startDate);
      const endDate = new Date(res.body.data.endDate);
      const diffDays = Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
      expect(diffDays).toBe(29);
    });

    test('POST /api/v1/cycles should reject starting a second active cycle with 409 ACTIVE_CYCLE_EXISTS', async () => {
      const res = await request(app)
        .post('/api/v1/cycles')
        .set('Authorization', `Bearer ${authToken}`)
        .send({});

      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('ACTIVE_CYCLE_EXISTS');
    });

    test('GET /api/v1/cycles/active should return current cycle status and dayNumber', async () => {
      const res = await request(app)
        .get('/api/v1/cycles/active')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.cycleId).toBe(cycleId);
      expect(res.body.data.dayNumber).toBe(1);
      expect(res.body.data.status).toBe('active');
      expect(res.body.data.hasSubmittedToday).toBe(false);
    });

    test('GET /api/v1/cycles should return cycle history list', async () => {
      const res = await request(app)
        .get('/api/v1/cycles')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBe(1);
      expect(res.body.data[0].cycleId).toBe(cycleId);
    });

    test('PATCH /api/v1/cycles/:id/abandon should mark active cycle as abandoned', async () => {
      const res = await request(app)
        .patch(`/api/v1/cycles/${cycleId}/abandon`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toContain('abandoned');

      const abandonedDoc = await Cycle.findById(cycleId);
      expect(abandonedDoc.status).toBe('abandoned');
    });

    test('GET /api/v1/cycles/active should now return 404 NO_ACTIVE_CYCLE after abandonment', async () => {
      const res = await request(app)
        .get('/api/v1/cycles/active')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(404);
      expect(res.body.error.code).toBe('NO_ACTIVE_CYCLE');
    });

    test('POST /api/v1/cycles should allow starting a new cycle after abandonment with cycleNumber = 2', async () => {
      const res = await request(app)
        .post('/api/v1/cycles')
        .set('Authorization', `Bearer ${authToken}`)
        .send({});

      expect(res.status).toBe(201);
      expect(res.body.data.cycleNumber).toBe(2);
      expect(res.body.data.status).toBe('active');
    });
  });
});
