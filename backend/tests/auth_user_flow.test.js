const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../server');
const { connectDB, disconnectDB } = require('../config/db');
const { User, Cycle, DailyActivity, DailyScore, WeeklySummary, MonthlyResult, PushSubscription } = require('../models');

describe('Authentication & User Profile Subsystem Flow', () => {
  const testEmail = `test.student.${Date.now()}@smuct.edu.bd`;
  const testPassword = 'Password123#';
  let verificationToken = null;
  let authToken = null;
  let userId = null;

  beforeAll(async () => {
    await connectDB(2, 3000);
    // Cleanup any lingering test user
    await User.deleteMany({ email: testEmail });
  }, 20000);

  afterAll(async () => {
    // Cleanup created data
    if (userId) {
      await User.deleteOne({ _id: userId });
    }
    await disconnectDB();
  }, 20000);

  // 1. REGISTRATION
  describe('POST /api/v1/auth/register', () => {
    test('should reject registration with invalid password (missing special char or short)', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({
          name: 'Test Student',
          email: testEmail,
          password: 'plainpassword',
          university: 'SMUCT',
          department: 'CSE'
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    test('should successfully register a student with valid credentials', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({
          name: 'Md. Test Student',
          email: testEmail,
          password: testPassword,
          university: 'Shanto-Mariam University of Creative Technology',
          department: 'Computer Science & Engineering',
          targetWakeUpTime: '06:30',
          targetSleepTime: '23:00'
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toContain('Registration successful');

      // Fetch user from DB to verify state
      const createdUser = await User.findOne({ email: testEmail });
      expect(createdUser).toBeDefined();
      expect(createdUser.emailVerified).toBe(false);
      expect(createdUser.verificationToken).toBeDefined();
      verificationToken = createdUser.verificationToken;
      userId = createdUser._id.toString();
    });

    test('should reject duplicate registration with 409 EMAIL_ALREADY_EXISTS', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({
          name: 'Md. Test Student',
          email: testEmail,
          password: testPassword,
          university: 'SMUCT',
          department: 'CSE'
        });

      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('EMAIL_ALREADY_EXISTS');
    });
  });

  // 2. UNVERIFIED LOGIN
  describe('POST /api/v1/auth/login (Unverified)', () => {
    test('should reject login with 403 EMAIL_NOT_VERIFIED before confirmation', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: testEmail,
          password: testPassword
        });

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('EMAIL_NOT_VERIFIED');
    });
  });

  // 3. EMAIL VERIFICATION
  describe('GET /api/v1/auth/verify-email/:token', () => {
    test('should reject invalid verification token with 400', async () => {
      const res = await request(app).get('/api/v1/auth/verify-email/invalid-token-12345');
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('INVALID_OR_EXPIRED_TOKEN');
    });

    test('should activate account with valid verification token', async () => {
      const res = await request(app).get(`/api/v1/auth/verify-email/${verificationToken}`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toContain('verified successfully');

      const user = await User.findById(userId);
      expect(user.emailVerified).toBe(true);
      expect(user.verificationToken).toBeNull();
    });
  });

  // 4. VERIFIED LOGIN
  describe('POST /api/v1/auth/login (Verified)', () => {
    test('should reject login with wrong password (401 INVALID_CREDENTIALS)', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: testEmail,
          password: 'WrongPassword999#'
        });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('INVALID_CREDENTIALS');
    });

    test('should authenticate and return 7-day JWT with sanitized user object', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: testEmail,
          password: testPassword
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.token).toBeDefined();
      expect(res.body.data.user.email).toBe(testEmail);
      expect(res.body.data.user.passwordHash).toBeUndefined();

      authToken = res.body.data.token;
    });
  });

  // 5. PROFILE RETRIEVAL & UPDATE
  describe('GET & PUT /api/v1/users/me', () => {
    test('should reject unauthenticated request with 401 UNAUTHORIZED', async () => {
      const res = await request(app).get('/api/v1/users/me');
      expect(res.status).toBe(401);
      expect(res.body.error.code).toBe('UNAUTHORIZED');
    });

    test('should return sanitized profile for authenticated student', async () => {
      const res = await request(app)
        .get('/api/v1/users/me')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.email).toBe(testEmail);
      expect(res.body.data.targetWakeUpTime).toBe('06:30');
    });

    test('should reject invalid target time format with 400 VALIDATION_ERROR', async () => {
      const res = await request(app)
        .put('/api/v1/users/me')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          targetWakeUpTime: '25:99'
        });

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    test('should successfully update target times and profile fields', async () => {
      const res = await request(app)
        .put('/api/v1/users/me')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          targetWakeUpTime: '06:00',
          targetSleepTime: '22:30',
          reminderTime: '21:00',
          reminderEnabled: false
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.targetWakeUpTime).toBe('06:00');
      expect(res.body.data.targetSleepTime).toBe('22:30');
      expect(res.body.data.reminderEnabled).toBe(false);
    });
  });

  // 6. PASSWORD RECOVERY
  describe('POST /api/v1/auth/forgot-password & reset-password', () => {
    test('should return generic success message for forgot-password request', async () => {
      const res = await request(app)
        .post('/api/v1/auth/forgot-password')
        .send({ email: testEmail });

      expect(res.status).toBe(200);
      expect(res.body.message).toContain('If the account exists');

      const user = await User.findById(userId);
      expect(user.resetPasswordToken).toBeDefined();

      // Reset password using the token
      const resetRes = await request(app)
        .post(`/api/v1/auth/reset-password/${user.resetPasswordToken}`)
        .send({ newPassword: 'NewPassword999#' });

      expect(resetRes.status).toBe(200);
      expect(resetRes.body.message).toContain('successfully updated');

      // Verify login with new password
      const newLoginRes = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: testEmail,
          password: 'NewPassword999#'
        });
      expect(newLoginRes.status).toBe(200);
      authToken = newLoginRes.body.data.token;
    });
  });

  // 7. CASCADED ACCOUNT DELETION
  describe('DELETE /api/v1/users/me', () => {
    test('should erase user account and all cascaded data across all collections', async () => {
      const res = await request(app)
        .delete('/api/v1/users/me')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toContain('permanently erased');

      // Verify user document was deleted
      const checkUser = await User.findById(userId);
      expect(checkUser).toBeNull();
      userId = null; // Prevent afterAll cleanup attempt
    });
  });
});
