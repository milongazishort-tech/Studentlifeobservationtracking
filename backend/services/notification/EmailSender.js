const nodemailer = require('nodemailer');

const MILESTONES = {
  7: {
    emoji: '🔥',
    title: '7-Day Consistency Streak!',
    message: 'Congratulations! You have completed 7 consecutive days of disciplined habit tracking. Keep this powerful momentum going!'
  },
  14: {
    emoji: '🚀',
    title: '14-Day Streak — Halfway Through!',
    message: 'Phenomenal progress! You have completed 14 continuous days and reached the halfway mark of your 30-day tracking cycle.'
  },
  21: {
    emoji: '⚡',
    title: '21-Day Habit Formation Milestone!',
    message: 'Science shows that 21 days is the foundation of lasting habit formation. Your consistency across academic and lifestyle habits is remarkable!'
  },
  30: {
    emoji: '🏆',
    title: '30-Day Cycle Complete — Life Stage Unlocked!',
    message: 'Incredible dedication! You have crossed Day 30 and completed your full 30-day tracking cycle. Your official Life Stage classification and comprehensive monthly insights are now unlocked!'
  }
};

/**
 * Dispatches a milestone celebratory email to student upon reaching 7, 14, 21, or 30 days streak.
 * @param {Object} user User document
 * @param {number} streak Current consecutive streak count
 */
const sendMilestoneEmail = async (user, streak) => {
  const milestone = MILESTONES[streak];
  if (!milestone) return null;

  if (process.env.NODE_ENV === 'test') {
    return { success: true, mocked: true, streak };
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    secure: process.env.SMTP_PORT === '465',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });

  const dashboardUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard`;
  const from = process.env.EMAIL_FROM || '"Student Life Tracker" <noreply@studentlifetracker.com>';

  const mailOptions = {
    from,
    to: user.email,
    subject: `${milestone.emoji} ${milestone.title} — Student Life Tracker`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 25px; border: 1px solid #e2e8f0; border-radius: 8px;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h1 style="font-size: 40px; margin: 0;">${milestone.emoji}</h1>
          <h2 style="color: #1e293b; margin: 10px 0;">${milestone.title}</h2>
        </div>
        <p style="color: #334155; font-size: 16px; line-height: 1.6;">Hello <strong>${user.name}</strong>,</p>
        <p style="color: #334155; font-size: 16px; line-height: 1.6;">${milestone.message}</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${dashboardUrl}" style="background-color: #2563eb; color: white; padding: 12px 28px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px;">
            View Your Dashboard & Trends
          </a>
        </div>
        <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 25px 0;" />
        <p style="color: #94a3b8; font-size: 13px; text-align: center;">
          Keep recording your 12 life areas daily before midnight. Student Life Tracker · CSE 3210
        </p>
      </div>
    `
  };

  try {
    return await transporter.sendMail(mailOptions);
  } catch (err) {
    console.warn(`[Milestone Email] Warning: Could not dispatch milestone email to ${user.email}: ${err.message}`);
    return null;
  }
};

module.exports = {
  MILESTONES,
  sendMilestoneEmail
};
