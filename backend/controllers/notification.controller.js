const { PushSubscription } = require('../models');
const { getVapidPublicKey } = require('../services/notification/webPush');

const subscribe = async (req, res, next) => {
  try {
    const { endpoint, keys } = req.body;
    const userId = req.user.userId;

    // Upsert subscription for user and endpoint
    await PushSubscription.findOneAndUpdate(
      { userId, endpoint },
      { $set: { userId, endpoint, keys } },
      { upsert: true, new: true }
    );

    return res.status(201).json({
      success: true,
      message: 'Web push subscription registered successfully.'
    });
  } catch (error) {
    next(error);
  }
};

const unsubscribe = async (req, res, next) => {
  try {
    const { endpoint } = req.body;
    const userId = req.user.userId;

    await PushSubscription.deleteOne({ userId, endpoint });

    return res.status(200).json({
      success: true,
      message: 'Push subscription removed.'
    });
  } catch (error) {
    next(error);
  }
};

const getPublicKey = (req, res) => {
  return res.status(200).json({
    success: true,
    data: {
      publicKey: getVapidPublicKey()
    }
  });
};

module.exports = {
  subscribe,
  unsubscribe,
  getPublicKey
};
