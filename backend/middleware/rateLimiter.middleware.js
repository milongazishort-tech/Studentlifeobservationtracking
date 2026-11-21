const rateLimit = require('express-rate-limit');

/**
 * Strict Rate Limiter for Authentication endpoints
 * 10 requests per 15 minutes window
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => process.env.NODE_ENV === 'test' && req.headers['x-test-rate-limit'] !== 'true',
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      error: {
        code: 'RATE_LIMIT_EXCEEDED',
        message: 'Too many authentication attempts. Please try again after 15 minutes.',
        timestamp: new Date().toISOString(),
        path: req.originalUrl || req.url
      }
    });
  }
});

/**
 * Standard Rate Limiter for General API endpoints
 * 100 requests per 15 minutes window
 */
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => process.env.NODE_ENV === 'test' && req.headers['x-test-rate-limit'] !== 'true',
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      error: {
        code: 'RATE_LIMIT_EXCEEDED',
        message: 'API rate limit exceeded. Please slow down your requests.',
        timestamp: new Date().toISOString(),
        path: req.originalUrl || req.url
      }
    });
  }
});

module.exports = { authLimiter, apiLimiter };
