const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../server');
const { connectDB, disconnectDB } = require('../config/db');
const { User, Cycle, DailyActivity, DailyScore } = require('../models');
const { calculateDailyScore } = require('../services/scoring/ScoringEngine');

describe('Core 12-Item Checklist & Scoring Engine Subsystem', () => {
  // 1. PURE SCORING ENGINE UNIT TESTS
  describe('Pure Scoring Engine Unit Tests', () => {
    test('Standard Day: full points across all 12 items yields exactly 100%', () => {
      const perfectDay = {
        isOffDay: false,
        item1_earlyMorning: true, // 8
        item2_universityAttendance: 'yes', // 10
        item3_classParticipation_attended: 4,
        item3_classParticipation_total: 4, // 8
        item4_personalDiscipline: true, // 8
        item5_socialInteractions: 3, // 6
        item6_dailyLearning: 'Mastered aggregation pipelines.', // 10
        item7_physicalActivity: true,
        item7_physicalMinutes: 30, // 10
        item8_skillDevelopmentMinutes: 60, // 10
        item9_classWorkRecap: true, // 10
        item10_socialMediaControl: 'controlled', // 6
        item11_selfReflection: 'Great consistent habit tracking.', // 8
        item12_sleepOnTime: true // 6
      };

      const result = calculateDailyScore(perfectDay);
      expect(result.maxAvailablePoints).toBe(100);
      expect(result.achievedPoints).toBe(100);
      expect(result.totalScore).toBe(100.0);
      expect(result.scores.item1).toBe(8);
      expect(result.scores.item2).toBe(10);
      expect(result.scores.item3).toBe(8);
      expect(result.scores.item7).toBe(10);
      expect(result.scores.item8).toBe(10);
    });

    test('Off-Day: omits Items 2 & 3, sets max to 82, and calculates 100% when other 10 items are full', () => {
      const offDayFull = {
        isOffDay: true,
        item1_earlyMorning: true, // 8
        item2_universityAttendance: 'off_day', // 0
        item3_classParticipation_attended: 0,
        item3_classParticipation_total: 0, // 0
        item4_personalDiscipline: true, // 8
        item5_socialInteractions: 5, // 6
        item6_dailyLearning: 'Read system architecture documentation.', // 10
        item7_physicalActivity: true,
        item7_physicalMinutes: 20, // 10
        item8_skillDevelopmentMinutes: 75, // 10
        item9_classWorkRecap: true, // 10
        item10_socialMediaControl: 'controlled', // 6
        item11_selfReflection: 'Weekend rest and self-care routine.', // 8
        item12_sleepOnTime: true // 6
      };

      const result = calculateDailyScore(offDayFull);
      expect(result.maxAvailablePoints).toBe(82);
      expect(result.achievedPoints).toBe(82);
      expect(result.totalScore).toBe(100.0);
      expect(result.scores.item2).toBe(0);
      expect(result.scores.item3).toBe(0);
    });

    test('Partial item scoring thresholds calculate with mathematical accuracy', () => {
      const partialDay = {
        isOffDay: false,
        item1_earlyMorning: false, // 0
        item2_universityAttendance: 'no', // 0
        item3_classParticipation_attended: 2,
        item3_classParticipation_total: 4, // 50% of 8 = 4
        item4_personalDiscipline: false, // 0
        item5_socialInteractions: 2, // 4
        item6_dailyLearning: '', // 0
        item7_physicalActivity: true,
        item7_physicalMinutes: 10, // < 15 mins = 5
        item8_skillDevelopmentMinutes: 45, // 30-59 mins = 6
        item9_classWorkRecap: false, // 0
        item10_socialMediaControl: 'useful', // 3
        item11_selfReflection: '', // 0
        item12_sleepOnTime: false // 0
      };

      // Sum: 0 + 0 + 4 + 0 + 4 + 0 + 5 + 6 + 0 + 3 + 0 + 0 = 22
      const result = calculateDailyScore(partialDay);
      expect(result.maxAvailablePoints).toBe(100);
      expect(result.achievedPoints).toBe(22);
      expect(result.totalScore).toBe(22.0);
    });
  });

  // 2. CHECKLIST & SCORES INTEGRATION TESTS
  describe('Checklist & Scoring Integration Endpoints', () => {
    let testUser = null;
    let authToken = null;
    let cycleId = null;

    beforeAll(async () => {
      await connectDB(2, 3000);

      const email = `checklist.test.${Date.now()}@smuct.edu.bd`;
      testUser = new User({
        name: 'Checklist Tester',
        email,
        passwordHash: 'dummyhash123',
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

      // Start an active cycle for this user with startDate = yesterday so today is Day 2
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const startRes = await request(app)
        .post('/api/v1/cycles')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          startDate: yesterday.toISOString(),
          targetWakeUpTime: '06:30',
          targetSleepTime: '23:00'
        });

      cycleId = startRes.body.data.cycleId;
    }, 20000);

    afterAll(async () => {
      if (testUser) {
        await DailyScore.deleteMany({ userId: testUser._id });
        await DailyActivity.deleteMany({ userId: testUser._id });
        await Cycle.deleteMany({ userId: testUser._id });
        await User.deleteOne({ _id: testUser._id });
      }
      await disconnectDB();
    }, 20000);

    test('POST /api/v1/checklist should reject invalid participation (attended > total) with 400', async () => {
      const res = await request(app)
        .post('/api/v1/checklist')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          item3_classParticipation_attended: 5,
          item3_classParticipation_total: 3
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    test('POST /api/v1/checklist should successfully record today entry and increment streak to 1', async () => {
      const res = await request(app)
        .post('/api/v1/checklist')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          isOffDay: false,
          item1_earlyMorning: true,
          item2_universityAttendance: 'yes',
          item3_classParticipation_attended: 3,
          item3_classParticipation_total: 3,
          item4_personalDiscipline: true,
          item5_socialInteractions: 3,
          item6_dailyLearning: 'Completed checklist and scoring engines.',
          item7_physicalActivity: true,
          item7_physicalMinutes: 25,
          item8_skillDevelopmentMinutes: 65,
          item9_classWorkRecap: true,
          item10_socialMediaControl: 'controlled',
          item11_selfReflection: 'High momentum and consistent routine.',
          item12_sleepOnTime: true
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.totalScore).toBe(100.0);
      expect(res.body.data.currentStreak).toBe(1);

      const cycle = await Cycle.findById(cycleId);
      expect(cycle.currentStreak).toBe(1);
    });

    test('POST /api/v1/checklist should reject duplicate submission on same date with 409 ALREADY_SUBMITTED_TODAY', async () => {
      const res = await request(app)
        .post('/api/v1/checklist')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          item1_earlyMorning: false
        });

      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('ALREADY_SUBMITTED_TODAY');
    });

    test('GET /api/v1/checklist/today should return today submitted responses', async () => {
      const res = await request(app)
        .get('/api/v1/checklist/today')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.item1_earlyMorning).toBe(true);
      expect(res.body.data.item2_universityAttendance).toBe('yes');
    });

    test('GET /api/v1/scores/today should return today score breakdown', async () => {
      const res = await request(app)
        .get('/api/v1/scores/today')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.totalScore).toBe(100.0);
      expect(res.body.data.scores.item1).toBe(8);
      expect(res.body.data.scores.item2).toBe(10);
    });

    test('PUT /api/v1/checklist/today should update entry, recalculate score, and NOT duplicate streak', async () => {
      const res = await request(app)
        .put('/api/v1/checklist/today')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          item1_earlyMorning: false, // -8 pts
          item2_universityAttendance: 'yes',
          item3_classParticipation_attended: 3,
          item3_classParticipation_total: 3
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.totalScore).toBe(92.0); // 100 - 8 = 92
      expect(res.body.data.currentStreak).toBe(1); // Streak remains 1

      const cycle = await Cycle.findById(cycleId);
      expect(cycle.currentStreak).toBe(1);
    });

    test('PUT /api/v1/checklist/yesterday should backfill yesterday entry via grace window and increment streak', async () => {
      const res = await request(app)
        .put('/api/v1/checklist/yesterday')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          isOffDay: true,
          item1_earlyMorning: true,
          item2_universityAttendance: 'off_day',
          item4_personalDiscipline: true,
          item5_socialInteractions: 3,
          item6_dailyLearning: 'Grace window tested.',
          item7_physicalActivity: true,
          item7_physicalMinutes: 20,
          item8_skillDevelopmentMinutes: 60,
          item9_classWorkRecap: true,
          item10_socialMediaControl: 'controlled',
          item11_selfReflection: 'Self reflection note.',
          item12_sleepOnTime: true
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.maxAvailablePoints).toBe(82);
      expect(res.body.data.totalScore).toBe(100.0);
      expect(res.body.data.currentStreak).toBe(2); // Streak incremented for brand new yesterday entry
    });

    test('GET /api/v1/scores/cycle/:cycleId should retrieve all recorded scores for the cycle', async () => {
      const res = await request(app)
        .get(`/api/v1/scores/cycle/${cycleId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBe(2); // Yesterday (Day 1) and Today (Day 2)
    });
  });
});
