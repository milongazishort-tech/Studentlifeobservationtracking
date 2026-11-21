const errorHandler = require('../middleware/errorHandler.middleware');

describe('Global Error Handler Middleware', () => {
  let req;
  let res;
  let next;

  beforeEach(() => {
    req = { originalUrl: '/api/v1/test', method: 'POST' };
    res = {
      statusCode: null,
      jsonData: null,
      status(code) {
        this.statusCode = code;
        return this;
      },
      json(data) {
        this.jsonData = data;
        return this;
      }
    };
    next = jest.fn();
  });

  test('should format MongoDB E11000 duplicate email error as 409 EMAIL_ALREADY_EXISTS', () => {
    const err = {
      code: 11000,
      keyValue: { email: 'test@example.com' },
      message: 'E11000 duplicate key error collection: users index: email_1 dup key'
    };

    errorHandler(err, req, res, next);

    expect(res.statusCode).toBe(409);
    expect(res.jsonData.success).toBe(false);
    expect(res.jsonData.error.code).toBe('EMAIL_ALREADY_EXISTS');
    expect(res.jsonData.error.field).toBe('email');
    expect(res.jsonData.error.path).toBe('/api/v1/test');
    expect(res.jsonData.error.timestamp).toBeDefined();
  });

  test('should format MongoDB E11000 duplicate daily activity error as 409 ALREADY_SUBMITTED_TODAY', () => {
    const err = {
      code: 11000,
      keyValue: { userId: 'user123', date: new Date() },
      message: 'E11000 duplicate key error collection: dailyActivities index: userId_1_date_1 dup key'
    };

    errorHandler(err, req, res, next);

    expect(res.statusCode).toBe(409);
    expect(res.jsonData.success).toBe(false);
    expect(res.jsonData.error.code).toBe('ALREADY_SUBMITTED_TODAY');
    expect(res.jsonData.error.field).toBe('date');
  });

  test('should format MongoDB E11000 active cycle partial index error as 409 ACTIVE_CYCLE_EXISTS', () => {
    const err = {
      code: 11000,
      keyValue: { userId: 'user123', status: 'active' },
      message: 'E11000 duplicate key error collection: cycles index: userId_1_status_1 dup key'
    };

    errorHandler(err, req, res, next);

    expect(res.statusCode).toBe(409);
    expect(res.jsonData.success).toBe(false);
    expect(res.jsonData.error.code).toBe('ACTIVE_CYCLE_EXISTS');
    expect(res.jsonData.error.field).toBe('status');
  });

  test('should format Mongoose ValidationError as 400 VALIDATION_ERROR with field', () => {
    const err = {
      name: 'ValidationError',
      errors: {
        targetWakeUpTime: {
          message: 'Target wake-up time must follow HH:mm format.'
        }
      }
    };

    errorHandler(err, req, res, next);

    expect(res.statusCode).toBe(400);
    expect(res.jsonData.success).toBe(false);
    expect(res.jsonData.error.code).toBe('VALIDATION_ERROR');
    expect(res.jsonData.error.field).toBe('targetWakeUpTime');
    expect(res.jsonData.error.message).toBe('Target wake-up time must follow HH:mm format.');
  });

  test('should format JsonWebTokenError as 401 UNAUTHORIZED', () => {
    const err = { name: 'JsonWebTokenError' };

    errorHandler(err, req, res, next);

    expect(res.statusCode).toBe(401);
    expect(res.jsonData.error.code).toBe('UNAUTHORIZED');
  });

  test('should format TokenExpiredError as 401 TOKEN_EXPIRED', () => {
    const err = { name: 'TokenExpiredError' };

    errorHandler(err, req, res, next);

    expect(res.statusCode).toBe(401);
    expect(res.jsonData.error.code).toBe('TOKEN_EXPIRED');
  });
});
