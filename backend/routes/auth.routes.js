const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const validate = require('../middleware/validate.middleware');
const { authLimiter } = require('../middleware/rateLimiter.middleware');
const {
  registerValidation,
  loginValidation,
  forgotPasswordValidation,
  resetPasswordValidation
} = require('../validators/auth.validators');

// Auth Routes (with rate limiting applied)
router.post('/register', authLimiter, validate(registerValidation), authController.register);
router.get('/verify-email/:token', authLimiter, authController.verifyEmail);
router.post('/verify-email', authLimiter, authController.verifyEmail);
router.post('/login', authLimiter, validate(loginValidation), authController.login);
router.post('/forgot-password', authLimiter, validate(forgotPasswordValidation), authController.forgotPassword);
router.post('/reset-password/:token', authLimiter, validate(resetPasswordValidation), authController.resetPassword);
router.post('/reset-password', authLimiter, validate(resetPasswordValidation), authController.resetPassword);

module.exports = router;
