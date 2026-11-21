const nodemailer = require('nodemailer');

// Initialize transporter using environment variables
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    secure: process.env.SMTP_PORT === '465',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });
};

/**
 * Dispatch verification email to newly registered student
 */
const sendVerificationEmail = async (email, token, name) => {
  const verifyUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify-email?token=${token}`;
  const from = process.env.EMAIL_FROM || '"Student Life Tracker" <noreply@studentlifetracker.com>';

  const mailOptions = {
    from,
    to: email,
    subject: 'Verify Your Student Life Tracker Account',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #2563eb;">Welcome to Student Life Tracker, ${name}!</h2>
        <p>Thank you for registering. Please confirm your email address by clicking the link below:</p>
        <p style="margin: 30px 0;">
          <a href="${verifyUrl}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
            Verify Email Address
          </a>
        </p>
        <p style="color: #64748b; font-size: 14px;">Or copy and paste this link in your browser: <br/>${verifyUrl}</p>
        <p style="color: #64748b; font-size: 14px;">This verification link will expire in 24 hours.</p>
      </div>
    `
  };

  try {
    if (process.env.NODE_ENV === 'test') {
      return { messageId: 'test-email-sent' };
    }
    const transporter = createTransporter();
    return await transporter.sendMail(mailOptions);
  } catch (error) {
    console.warn(`[Nodemailer] Warning: Could not send verification email to ${email}: ${error.message}`);
    // Non-fatal in dev/test setups
    return null;
  }
};

/**
 * Dispatch password reset email
 */
const sendPasswordResetEmail = async (email, token, name) => {
  const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${token}`;
  const from = process.env.EMAIL_FROM || '"Student Life Tracker" <noreply@studentlifetracker.com>';

  const mailOptions = {
    from,
    to: email,
    subject: 'Password Recovery — Student Life Tracker',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #2563eb;">Password Reset Request</h2>
        <p>Hello ${name},</p>
        <p>We received a request to reset your Student Life Tracker password. Click the link below to set a new password:</p>
        <p style="margin: 30px 0;">
          <a href="${resetUrl}" style="background-color: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
            Reset Password
          </a>
        </p>
        <p style="color: #64748b; font-size: 14px;">Or copy and paste this link in your browser: <br/>${resetUrl}</p>
        <p style="color: #64748b; font-size: 14px;">This link will expire in 1 hour. If you did not request this, please ignore this email.</p>
      </div>
    `
  };

  try {
    if (process.env.NODE_ENV === 'test') {
      return { messageId: 'test-email-sent' };
    }
    const transporter = createTransporter();
    return await transporter.sendMail(mailOptions);
  } catch (error) {
    console.warn(`[Nodemailer] Warning: Could not send password reset email to ${email}: ${error.message}`);
    return null;
  }
};

module.exports = {
  sendVerificationEmail,
  sendPasswordResetEmail
};
