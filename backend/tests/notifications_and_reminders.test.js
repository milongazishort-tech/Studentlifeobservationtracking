require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../server');
const { connectDB, disconnectDB } = require('../config/db');
const { User, Cycle, DailyActivity, PushSubscription } = require('../models');
const { sendMilestoneEmail, MILESTONES } = require('../services/notification/EmailSender');
const { dispatchDailyReminders } = require('../services/cron/reminderDispatcher.job');
const { normalizeToMidnight } = require('../utils/date.utils');

describe('Web Push (VAPID) & Notification Engine Subsystem', () => {
  let testUser = null;
  let authToken = null;

  beforeAll(async () => {
    await connectDB(2, 3000);

    const email = `notify.test.${Date.now()}@smuct.edu.bd`;
    testUser = new User({
      name: 'Notification Tester',
      email,
      passwordHash: 'dummyhash123',
      university: 'SMUCT',
      department: 'CSE',
      emailVerified: true,
      reminderEnabled: true,
      reminderTime: '21:00'
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
      await PushSubscription.deleteMany({ userId: testUser._id });
      await DailyActivity.deleteMany({ userId: testUser._id });
      await Cycle.deleteMany({ userId: testUser._id });
    }
  });

  afterAll(async () => {
    if (testUser) {
      await PushSubscription.deleteMany({ userId: testUser._id });
      await DailyActivity.deleteMany({ userId: testUser._id });
      await Cycle.deleteMany({ userId: testUser._id });
      await User.deleteOne({ _id: testUser._id });
    }
    await disconnectDB();
  }, 20000);

  // 1. VAPID & SUBSCRIPTION API TESTS
  describe('Web Push Subscription Endpoints', () => {
    const mockEndpoint = 'https://fcm.googleapis.com/fcm/send/testEndpointToken_12345';
    const mockKeys = {
      p256dh: 'BNcRdreALRF8FsEteGUn3N_JqcQSwPP3YoPrqUTNqnyStYwcFA29eKnstpkunf47n4YgHpt1',
      auth: 'tBHItSI1Wj5ixk3eA2uvBw'
    };

    test('GET /api/v1/notifications/vapid-public-key should return valid public key', async () => {
      const res = await request(app).get('/api/v1/notifications/vapid-public-key');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.publicKey).toBeDefined();
    });

    test('POST /api/v1/notifications/subscribe should register a new browser push endpoint', async () => {
      const res = await request(app)
        .post('/api/v1/notifications/subscribe')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          endpoint: mockEndpoint,
          keys: mockKeys
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toContain('registered successfully');

      const savedSub = await PushSubscription.findOne({
        userId: testUser._id,
        endpoint: mockEndpoint
      });
      expect(savedSub).toBeDefined();
      expect(savedSub.keys.auth).toBe(mockKeys.auth);
    });

    test('DELETE /api/v1/notifications/unsubscribe should delete registered push subscription', async () => {
      // First register
      await PushSubscription.create({
        userId: testUser._id,
        endpoint: mockEndpoint,
        keys: mockKeys
      });

      const res = await request(app)
        .delete('/api/v1/notifications/unsubscribe')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ endpoint: mockEndpoint });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      const checkSub = await PushSubscription.findOne({
        userId: testUser._id,
        endpoint: mockEndpoint
      });
      expect(checkSub).toBeNull();
    });
  });

  // 2. REMINDER DISPATCHER & AUTO-CANCELLATION TESTS
  describe('Automated Daily Reminder Dispatcher', () => {
    const mockEndpoint = 'https://fcm.googleapis.com/fcm/send/test_reminder_endpoint';

    test('dispatchDailyReminders should send push when checklist is NOT submitted at reminderTime', async () => {
      // Setup active cycle
      const cycle = new Cycle({
        userId: testUser._id,
        cycleNumber: 1,
        startDate: normalizeToMidnight(new Date()),
        endDate: new Date(Date.now() + 29 * 24 * 60 * 60 * 1000),
        status: 'active',
        currentStreak: 2,
        targetWakeUpTime: '06:30',
        targetSleepTime: '23:00'
      });
      await cycle.save();

      // Register push endpoint
      await PushSubscription.create({
        userId: testUser._id,
        endpoint: mockEndpoint,
        keys: { p256dh: 'dummyKey', auth: 'dummyAuth' }
      });

      // Simulate clock at 21:00
      const clock2100 = new Date();
      clock2100.setHours(21, 0, 0, 0);

      const dispatched = await dispatchDailyReminders(clock2100);
      const userDispatch = dispatched.find((d) => d.userId === testUser._id.toString());
      expect(userDispatch).toBeDefined();
      expect(userDispatch.subscriptionCount).toBe(1);
    });

    test('dispatchDailyReminders should AUTO-CANCEL and skip when today checklist is already submitted', async () => {
      const cycle = new Cycle({
        userId: testUser._id,
        cycleNumber: 1,
        startDate: normalizeToMidnight(new Date()),
        endDate: new Date(Date.now() + 29 * 24 * 60 * 60 * 1000),
        status: 'active',
        currentStreak: 2,
        targetWakeUpTime: '06:30',
        targetSleepTime: '23:00'
      });
      await cycle.save();

      await PushSubscription.create({
        userId: testUser._id,
        endpoint: mockEndpoint,
        keys: { p256dh: 'dummyKey', auth: 'dummyAuth' }
      });

      const clock2100 = new Date();
      clock2100.setHours(21, 0, 0, 0);

      // Record today's checklist
      await DailyActivity.create({
        userId: testUser._id,
        cycleId: cycle._id,
        date: normalizeToMidnight(clock2100),
        dayNumber: 1,
        isOffDay: false
      });

      // Run reminder dispatch at 21:00
      const dispatched = await dispatchDailyReminders(clock2100);
      const userDispatch = dispatched.find((d) => d.userId === testUser._id.toString());

      // Notification is suppressed because entry was already submitted!
      expect(userDispatch).toBeUndefined();
    });
  });

  // 3. MILESTONE EMAIL ALERTS TESTS
  describe('Milestone Email Alerts (7, 14, 21, 30 Days)', () => {
    test('sendMilestoneEmail should handle 7, 14, 21, and 30 day milestones', async () => {
      for (const streak of [7, 14, 21, 30]) {
        expect(MILESTONES[streak]).toBeDefined();
        const res = await sendMilestoneEmail(testUser, streak);
        expect(res).toBeDefined();
        expect(res.streak).toBe(streak);
      }
    });

    test('sendMilestoneEmail should ignore non-milestone streaks (e.g. 5, 8, 15)', async () => {
      for (const streak of [1, 5, 8, 15, 29]) {
        const res = await sendMilestoneEmail(testUser, streak);
        expect(res).toBeNull();
      }
    });
  });
});
