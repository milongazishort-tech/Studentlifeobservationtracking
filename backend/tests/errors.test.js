const {
  AppError,
  ValidationError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ConflictError
} = require('../utils/errors');

describe('Custom Error Classes Hierarchy', () => {
  test('AppError should set default status 500 and code INTERNAL_SERVER_ERROR', () => {
    const error = new AppError('Server exploded');
    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(AppError);
    expect(error.statusCode).toBe(500);
    expect(error.code).toBe('INTERNAL_SERVER_ERROR');
    expect(error.field).toBeNull();
    expect(error.isOperational).toBe(true);
  });

  test('ValidationError should instantiate with status 400 and code VALIDATION_ERROR', () => {
    const error = new ValidationError('Invalid email format', 'email');
    expect(error.statusCode).toBe(400);
    expect(error.code).toBe('VALIDATION_ERROR');
    expect(error.field).toBe('email');
    expect(error.message).toBe('Invalid email format');
  });

  test('UnauthorizedError should instantiate with status 401 and code UNAUTHORIZED', () => {
    const error = new UnauthorizedError();
    expect(error.statusCode).toBe(401);
    expect(error.code).toBe('UNAUTHORIZED');
  });

  test('ForbiddenError should instantiate with status 403 and code FORBIDDEN_RESOURCE', () => {
    const error = new ForbiddenError();
    expect(error.statusCode).toBe(403);
    expect(error.code).toBe('FORBIDDEN_RESOURCE');
  });

  test('NotFoundError should instantiate with status 404 and code NOT_FOUND', () => {
    const error = new NotFoundError('Cycle not found');
    expect(error.statusCode).toBe(404);
    expect(error.code).toBe('NOT_FOUND');
    expect(error.message).toBe('Cycle not found');
  });

  test('ConflictError should instantiate with status 409 and code CONFLICT', () => {
    const error = new ConflictError('User already exists', 'EMAIL_ALREADY_EXISTS', 'email');
    expect(error.statusCode).toBe(409);
    expect(error.code).toBe('EMAIL_ALREADY_EXISTS');
    expect(error.field).toBe('email');
  });
});
