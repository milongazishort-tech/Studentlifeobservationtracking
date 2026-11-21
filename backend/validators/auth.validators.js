const { body, param } = require('express-validator');

// Regex for HH:mm 24-hour time format
const TIME_REGEX = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;

/**
 * Validation rules for user registration
 */
const registerValidation = [
  body('name')
    .trim()
    .notEmpty().withMessage('Student name is required.')
    .isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters.')
    .escape(),
  body('email')
    .trim()
    .notEmpty().withMessage('Email address is required.')
    .isEmail().withMessage('Please provide a valid email address.')
    .normalizeEmail(),
  body('password')
    .notEmpty().withMessage('Password is required.')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters long.')
    .matches(/^(?=.*[a-zA-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).*$/)
    .withMessage('Password must contain at least one letter, one number, and one special character.'),
  body('university')
    .trim()
    .notEmpty().withMessage('University name is required.')
    .isLength({ max: 150 }).withMessage('University name cannot exceed 150 characters.')
    .escape(),
  body('department')
    .trim()
    .notEmpty().withMessage('Department name is required.')
    .isLength({ max: 100 }).withMessage('Department name cannot exceed 100 characters.')
    .escape(),
  body('targetWakeUpTime')
    .optional()
    .matches(TIME_REGEX).withMessage('Target wake-up time must follow HH:mm format (00:00 - 23:59).'),
  body('targetSleepTime')
    .optional()
    .matches(TIME_REGEX).withMessage('Target sleep time must follow HH:mm format (00:00 - 23:59).'),
  body('reminderTime')
    .optional()
    .matches(TIME_REGEX).withMessage('Reminder time must follow HH:mm format (00:00 - 23:59).')
];

/**
 * Validation rules for user login
 */
const loginValidation = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email address is required.')
    .isEmail().withMessage('Please provide a valid email address.')
    .normalizeEmail(),
  body('password')
    .notEmpty().withMessage('Password is required.')
];

/**
 * Validation rules for forgot password
 */
const forgotPasswordValidation = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email address is required.')
    .isEmail().withMessage('Please provide a valid email address.')
    .normalizeEmail()
];

/**
 * Validation rules for reset password
 */
const resetPasswordValidation = [
  param('token')
    .notEmpty().withMessage('Reset token is required.'),
  body('newPassword')
    .notEmpty().withMessage('New password is required.')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters long.')
    .matches(/^(?=.*[a-zA-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).*$/)
    .withMessage('Password must contain at least one letter, one number, and one special character.')
];

/**
 * Validation rules for profile updates
 */
const updateProfileValidation = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters.')
    .escape(),
  body('university')
    .optional()
    .trim()
    .isLength({ max: 150 }).withMessage('University name cannot exceed 150 characters.')
    .escape(),
  body('department')
    .optional()
    .trim()
    .isLength({ max: 100 }).withMessage('Department name cannot exceed 100 characters.')
    .escape(),
  body('targetWakeUpTime')
    .optional()
    .matches(TIME_REGEX).withMessage('Target wake-up time must follow HH:mm format (00:00 - 23:59).'),
  body('targetSleepTime')
    .optional()
    .matches(TIME_REGEX).withMessage('Target sleep time must follow HH:mm format (00:00 - 23:59).'),
  body('reminderTime')
    .optional()
    .matches(TIME_REGEX).withMessage('Reminder time must follow HH:mm format (00:00 - 23:59).'),
  body('reminderEnabled')
    .optional()
    .isBoolean().withMessage('reminderEnabled must be a boolean value.')
];

module.exports = {
  registerValidation,
  loginValidation,
  forgotPasswordValidation,
  resetPasswordValidation,
  updateProfileValidation
};
