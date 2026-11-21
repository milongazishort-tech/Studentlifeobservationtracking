const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../models');
const {
  ValidationError,
  UnauthorizedError,
  ForbiddenError,
  ConflictError
} = require('../utils/errors');
const { sendVerificationEmail, sendPasswordResetEmail } = require('../utils/email');

/**
 * Register a new student account
 */
const register = async (userData) => {
  const {
    name,
    email,
    password,
    university,
    department,
    targetWakeUpTime,
    targetSleepTime,
    reminderTime
  } = userData;

  // 1. Check for existing user
  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) {
    throw new ConflictError('An account with this email address already exists.', 'EMAIL_ALREADY_EXISTS', 'email');
  }

  // 2. Hash password with bcrypt (12 rounds)
  const salt = await bcrypt.genSalt(12);
  const passwordHash = await bcrypt.hash(password, salt);

  // 3. Generate verification token (24-hour expiration)
  const verificationToken = crypto.randomBytes(32).toString('hex');
  const verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

  // 4. Create and persist new user
  const user = new User({
    name,
    email: email.toLowerCase(),
    passwordHash,
    university,
    department,
    targetWakeUpTime: targetWakeUpTime || '06:30',
    targetSleepTime: targetSleepTime || '23:00',
    reminderTime: reminderTime || '21:00',
    reminderEnabled: true,
    emailVerified: process.env.NODE_ENV === 'development' ? true : false,
    verificationToken,
    verificationTokenExpires
  });

  await user.save();

  // 5. Send verification email via Nodemailer
  await sendVerificationEmail(user.email, verificationToken, user.name);

  return {
    success: true,
    message: 'Registration successful. Please verify your email before logging in.'
  };
};

/**
 * Confirm student email address using verification token
 */
const verifyEmail = async (token) => {
  if (!token) {
    throw new ValidationError('Verification token is required.', 'token', 'INVALID_OR_EXPIRED_TOKEN');
  }

  const user = await User.findOne({
    verificationToken: token,
    verificationTokenExpires: { $gt: new Date() }
  });

  if (!user) {
    throw new ValidationError(
      'Invalid or expired verification token. Please request a new verification link.',
      'token',
      'INVALID_OR_EXPIRED_TOKEN'
    );
  }

  user.emailVerified = true;
  user.verificationToken = null;
  user.verificationTokenExpires = null;
  await user.save();

  return {
    success: true,
    message: 'Email address verified successfully. You may now log in.'
  };
};

/**
 * Authenticate student credentials & issue 7-day JWT
 */
const login = async (email, password) => {
  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) {
    throw new UnauthorizedError('Invalid email or password credentials.', 'INVALID_CREDENTIALS');
  }

  const isMatch = await bcrypt.compare(password, user.passwordHash);
  if (!isMatch) {
    throw new UnauthorizedError('Invalid email or password credentials.', 'INVALID_CREDENTIALS');
  }

  if (!user.emailVerified) {
    if (process.env.NODE_ENV === 'development') {
      user.emailVerified = true;
      user.verificationToken = null;
      user.verificationTokenExpires = null;
      await user.save();
    } else {
      throw new ForbiddenError(
        'Your email address has not been verified. Please check your inbox for activation instructions.',
        'EMAIL_NOT_VERIFIED'
      );
    }
  }

  // Issue 7-day JWT
  const secret = process.env.JWT_SECRET || 'dev_jwt_secret_key_studentlife_tracker_2026_cse3210';
  const token = jwt.sign(
    { userId: user._id.toString(), email: user.email },
    secret,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );

  return {
    success: true,
    data: {
      token,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        university: user.university,
        department: user.department,
        targetWakeUpTime: user.targetWakeUpTime,
        targetSleepTime: user.targetSleepTime
      }
    }
  };
};

/**
 * Request password recovery email
 */
const forgotPassword = async (email) => {
  const user = await User.findOne({ email: email.toLowerCase() });

  if (user) {
    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    await user.save();

    await sendPasswordResetEmail(user.email, resetToken, user.name);
  }

  // Always return identical message to prevent user enumeration
  return {
    success: true,
    message: 'If the account exists, a password reset link has been dispatched.'
  };
};

/**
 * Reset password using crypto token
 */
const resetPassword = async (token, newPassword) => {
  if (!token) {
    throw new ValidationError('Reset token is required.', 'token', 'INVALID_OR_EXPIRED_TOKEN');
  }

  const user = await User.findOne({
    resetPasswordToken: token,
    resetPasswordExpires: { $gt: new Date() }
  });

  if (!user) {
    throw new ValidationError(
      'Invalid or expired password reset token. Please request a new link.',
      'token',
      'INVALID_OR_EXPIRED_TOKEN'
    );
  }

  const salt = await bcrypt.genSalt(12);
  user.passwordHash = await bcrypt.hash(newPassword, salt);
  user.resetPasswordToken = null;
  user.resetPasswordExpires = null;
  await user.save();

  return {
    success: true,
    message: 'Password has been successfully updated. Please log in.'
  };
};

module.exports = {
  register,
  verifyEmail,
  login,
  forgotPassword,
  resetPassword
};
