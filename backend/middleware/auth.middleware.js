const jwt = require('jsonwebtoken');
const { UnauthorizedError } = require('../utils/errors');

/**
 * Authentication Middleware
 * Extracts and verifies Bearer JWT token from Authorization header.
 * Attaches decoded { userId, email } to req.user.
 */
const authenticate = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedError('Authentication token is missing or malformed.', 'UNAUTHORIZED');
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      throw new UnauthorizedError('Authentication token is missing.', 'UNAUTHORIZED');
    }

    const secret = process.env.JWT_SECRET || 'dev_jwt_secret_key_studentlife_tracker_2026_cse3210';
    const decoded = jwt.verify(token, secret);

    req.user = {
      userId: decoded.userId || decoded.id,
      email: decoded.email
    };

    next();
  } catch (error) {
    // Passes directly to global errorHandler (handling JsonWebTokenError & TokenExpiredError)
    next(error);
  }
};

module.exports = authenticate;
