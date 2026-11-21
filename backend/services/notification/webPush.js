const webpush = require('web-push');
const { PushSubscription } = require('../../models');

// Configure VAPID details
const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY;
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY;
const VAPID_SUBJECT = process.env.VAPID_SUBJECT || 'mailto:admin@studentlifetracker.com';

if (VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY) {
  try {
    webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
  } catch (err) {
    console.warn('[Web Push] Warning: Could not configure VAPID details:', err.message);
  }
}

/**
 * Dispatches a web push notification to a client browser subscription.
 * Automatically deletes stale / expired subscriptions on 404 or 410 status codes.
 *
 * @param {Object} subscription Mongoose PushSubscription document or object with { endpoint, keys }
 * @param {Object} payload { title, body, icon, url, data }
 */
const sendPushNotification = async (subscription, payload = {}) => {
  if (process.env.NODE_ENV === 'test') {
    return { success: true, mocked: true };
  }

  const pushPayload = JSON.stringify({
    title: payload.title || 'Student Life Tracker',
    body: payload.body || 'Time to complete your daily 12-item checklist!',
    icon: payload.icon || '/icon-192x192.png',
    url: payload.url || '/dashboard',
    timestamp: Date.now(),
    ...payload
  });

  try {
    const pushSub = {
      endpoint: subscription.endpoint,
      keys: {
        p256dh: subscription.keys.p256dh,
        auth: subscription.keys.auth
      }
    };

    await webpush.sendNotification(pushSub, pushPayload);
    return { success: true };
  } catch (error) {
    console.warn(`[Web Push] Dispatch failed for endpoint ${subscription.endpoint}:`, error.message);

    // If subscription is expired or unsubscribed, purge from database
    if (error.statusCode === 404 || error.statusCode === 410) {
      try {
        await PushSubscription.deleteOne({ endpoint: subscription.endpoint });
        console.log(`[Web Push] Cleaned up expired push subscription: ${subscription.endpoint}`);
      } catch (cleanupErr) {
        console.error('[Web Push] Failed to purge expired subscription:', cleanupErr.message);
      }
    }

    return { success: false, error: error.message };
  }
};

const getVapidPublicKey = () => {
  return process.env.VAPID_PUBLIC_KEY || '';
};

module.exports = {
  sendPushNotification,
  getVapidPublicKey
};
