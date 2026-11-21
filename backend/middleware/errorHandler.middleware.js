const { AppError } = require('../utils/errors');

/**
 * Centralized Global Error Handler Middleware
 * Adheres to Section 4.4 of api-spec.md
 */
const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let code = err.code || 'INTERNAL_SERVER_ERROR';
  let message = err.message || 'An unexpected error occurred. Please try again later.';
  let field = err.field || null;

  // 1. Mongoose Validation Errors
  if (err.name === 'ValidationError' && err.errors) {
    statusCode = 400;
    code = 'VALIDATION_ERROR';
    const firstKey = Object.keys(err.errors)[0];
    if (firstKey) {
      message = err.errors[firstKey].message;
      field = firstKey;
    }
  }

  // 2. Mongoose CastError (Invalid ObjectId)
  if (err.name === 'CastError') {
    statusCode = 400;
    code = 'INVALID_ID';
    message = `Invalid format for resource identifier: ${err.value}`;
    field = err.path || null;
  }

  // 3. MongoDB Duplicate Key (E11000)
  if (err.code === 11000) {
    statusCode = 409;
    const keyValue = err.keyValue || {};
    const keys = Object.keys(keyValue);
    const fieldName = keys[0] || 'unknown';

    if (fieldName === 'email' || err.message?.includes('email_1')) {
      code = 'EMAIL_ALREADY_EXISTS';
      message = 'An account with this email address already exists.';
      field = 'email';
    } else if (
      (fieldName === 'userId' && keyValue.date !== undefined) ||
      err.message?.includes('userId_1_date_1')
    ) {
      code = 'ALREADY_SUBMITTED_TODAY';
      message = 'Checklist for this date has already been submitted. Use PUT /today to update.';
      field = 'date';
    } else if (
      (fieldName === 'userId' && keyValue.status === 'active') ||
      err.message?.includes('userId_1_status_1')
    ) {
      code = 'ACTIVE_CYCLE_EXISTS';
      message = 'An active cycle is already ongoing for this user.';
      field = 'status';
    } else if (
      (fieldName === 'userId' && keyValue.cycleId && keyValue.weekNumber !== undefined) ||
      err.message?.includes('userId_1_cycleId_1_weekNumber_1')
    ) {
      code = 'DUPLICATE_WEEKLY_SUMMARY';
      message = 'A weekly summary for this cycle and week number already exists.';
      field = 'weekNumber';
    } else if (
      (fieldName === 'userId' && keyValue.cycleId) ||
      err.message?.includes('userId_1_cycleId_1')
    ) {
      code = 'DUPLICATE_MONTHLY_RESULT';
      message = 'A monthly report for this cycle already exists.';
      field = 'cycleId';
    } else if (
      (fieldName === 'userId' && keyValue.endpoint) ||
      err.message?.includes('userId_1_endpoint_1')
    ) {
      code = 'DUPLICATE_SUBSCRIPTION';
      message = 'This push notification endpoint is already registered.';
      field = 'endpoint';
    } else {
      code = 'DUPLICATE_ENTRY';
      message = `Duplicate value recorded for unique constraint on: ${fieldName}`;
      field = fieldName;
    }
  }

  // 4. JWT Authentication Errors
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    code = 'UNAUTHORIZED';
    message = 'Invalid authentication token provided.';
  } else if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    code = 'TOKEN_EXPIRED';
    message = 'Your session has expired. Please log in again.';
  }

  // Log server-side critical errors
  if (statusCode === 500) {
    console.error(`[CRITICAL ERROR] ${req.method} ${req.originalUrl || req.url}:`, err);
  }

  // Final structured response matching api-spec.md Section 4.1
  const responsePayload = {
    success: false,
    error: {
      code,
      message,
      ...(field ? { field } : {}),
      timestamp: new Date().toISOString(),
      path: req.originalUrl || req.url
    }
  };

  // Include stack trace only in non-production environments for 500 errors
  if (process.env.NODE_ENV === 'development' && statusCode === 500) {
    responsePayload.error.stack = err.stack;
  }

  return res.status(statusCode).json(responsePayload);
};

module.exports = errorHandler;
