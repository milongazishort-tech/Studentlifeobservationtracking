const cron = require('node-cron');
const { User, Cycle, DailyActivity, PushSubscription } = require('../../models');
const { normalizeToMidnight } = require('../../utils/date.utils');
const { sendPushNotification } = require('../notification/webPush');

/**
 * Checks for users scheduled for a reminder at referenceDate,
 * verifies whether today's checklist has already been submitted (auto-cancellation),
 * and dispatches Web Push notifications to all active subscriptions.
 *
 * @param {Date} [referenceDate] Defaults to current date/time
 */
const dispatchDailyReminders = async (referenceDate = new Date()) => {
  // Format current reference time to HH:mm (24-hour)
  const hours = String(referenceDate.getHours()).padStart(2, '0');
  const minutes = String(referenceDate.getMinutes()).padStart(2, '0');
  const currentTimeString = `${hours}:${minutes}`;

  // 1. Find users whose configured reminder time matches current clock and has reminders enabled
  const matchingUsers = await User.find({
    reminderEnabled: true,
    reminderTime: currentTimeString
  });

  const dispatched = [];

  for (const user of matchingUsers) {
    try {
      // 2. Check if user has an active cycle
      const activeCycle = await Cycle.findOne({ userId: user._id, status: 'active' });
      if (!activeCycle) continue;

      // 3. Auto-cancellation check: Skip if user has already submitted today's checklist
      const todayNormalized = normalizeToMidnight(referenceDate);
      const existingEntry = await DailyActivity.findOne({
        userId: user._id,
        cycleId: activeCycle._id,
        date: todayNormalized
      });

      if (existingEntry) {
        // Today's entry is already submitted — suppress notification
        continue;
      }

      // 4. Retrieve push subscriptions for this user
      const subscriptions = await PushSubscription.find({ userId: user._id });
      if (!subscriptions || subscriptions.length === 0) continue;

      // 5. Dispatch web push notification
      const pushPayload = {
        title: 'Check-in Reminder 📝',
        body: `Hey ${user.name.split(' ')[0]}, don't break your streak! Record today's 12 life areas before midnight.`,
        url: '/checklist'
      };

      for (const sub of subscriptions) {
        await sendPushNotification(sub, pushPayload);
      }

      dispatched.push({
        userId: user._id.toString(),
        subscriptionCount: subscriptions.length
      });
    } catch (err) {
      console.warn(`[Reminder Dispatcher] Failed for user ${user._id}:`, err.message);
    }
  }

  return dispatched;
};

/**
 * Starts automated reminder cron scheduler running every minute ('* * * * *')
 */
const initReminderCron = () => {
  const task = cron.schedule('* * * * *', async () => {
    try {
      await dispatchDailyReminders();
    } catch (err) {
      console.error('[Reminder Dispatcher] Scheduler run error:', err.message);
    }
  });

  return task;
};

module.exports = {
  dispatchDailyReminders,
  initReminderCron
};
