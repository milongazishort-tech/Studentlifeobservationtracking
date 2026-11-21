/**
 * Base Application Error class extending native Error.
 */
class AppError extends Error {
  constructor(message, statusCode = 500, code = 'INTERNAL_SERVER_ERROR', field = null) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.code = code;
    this.field = field;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * 400 Bad Request — Schema validation or rule failure.
 */
class ValidationError extends AppError {
  constructor(message = 'Validation failed.', field = null, code = 'VALIDATION_ERROR') {
    super(message, 400, code, field);
  }
}

/**
 * 401 Unauthorized — Missing, invalid, or expired credentials.
 */
class UnauthorizedError extends AppError {
  constructor(message = 'Authentication required. Invalid or missing token.', code = 'UNAUTHORIZED') {
    super(message, 401, code);
  }
}

/**
 * 403 Forbidden — Insufficient privileges, policy restriction, or unverified email.
 */
class ForbiddenError extends AppError {
  constructor(message = 'Forbidden. You do not have permission to access this resource.', code = 'FORBIDDEN_RESOURCE') {
    super(message, 403, code);
  }
}

/**
 * 404 Not Found — Resource does not exist in the database.
 */
class NotFoundError extends AppError {
  constructor(message = 'Requested resource not found.', code = 'NOT_FOUND') {
    super(message, 404, code);
  }
}

/**
 * 409 Conflict — Resource or state conflict (e.g. duplicate email, duplicate checklist, active cycle).
 */
class ConflictError extends AppError {
  constructor(message = 'A conflicting resource or active state already exists.', code = 'CONFLICT', field = null) {
    super(message, 409, code, field);
  }
}

module.exports = {
  AppError,
  ValidationError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ConflictError
};
