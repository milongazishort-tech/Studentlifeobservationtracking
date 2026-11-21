const mongoose = require('mongoose');
const {
  User,
  Cycle,
  DailyActivity,
  DailyScore,
  WeeklySummary,
  MonthlyResult,
  PushSubscription
} = require('../models');
const { NotFoundError } = require('../utils/errors');

/**
 * Retrieve sanitized student profile
 */
const getProfile = async (userId) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new NotFoundError('User profile not found.');
  }

  return {
    success: true,
    data: {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      university: user.university,
      department: user.department,
      targetWakeUpTime: user.targetWakeUpTime,
      targetSleepTime: user.targetSleepTime,
      reminderTime: user.reminderTime,
      reminderEnabled: user.reminderEnabled,
      emailVerified: user.emailVerified,
      createdAt: user.createdAt
    }
  };
};

/**
 * Update student profile and lifestyle targets
 */
const updateProfile = async (userId, updates) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new NotFoundError('User profile not found.');
  }

  const allowedFields = [
    'name',
    'university',
    'department',
    'targetWakeUpTime',
    'targetSleepTime',
    'reminderTime',
    'reminderEnabled'
  ];

  for (const field of allowedFields) {
    if (updates[field] !== undefined) {
      user[field] = updates[field];
    }
  }

  await user.save();

  return {
    success: true,
    data: {
      targetWakeUpTime: user.targetWakeUpTime,
      targetSleepTime: user.targetSleepTime,
      reminderTime: user.reminderTime,
      reminderEnabled: user.reminderEnabled
    },
    message: 'Profile targets updated successfully.'
  };
};

/**
 * Execute ACID transaction cascading deletion across all 7 collections
 * Follows Section 7.3 of database.md
 */
const deleteAccount = async (userId) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new NotFoundError('User account not found.');
  }

  const userObjId = new mongoose.Types.ObjectId(userId);
  let session = null;

  try {
    session = await mongoose.startSession();
    session.startTransaction();

    await DailyScore.deleteMany({ userId: userObjId }, { session });
    await DailyActivity.deleteMany({ userId: userObjId }, { session });
    await WeeklySummary.deleteMany({ userId: userObjId }, { session });
    await MonthlyResult.deleteMany({ userId: userObjId }, { session });
    await PushSubscription.deleteMany({ userId: userObjId }, { session });
    await Cycle.deleteMany({ userId: userObjId }, { session });
    await User.deleteOne({ _id: userObjId }, { session });

    await session.commitTransaction();
    return {
      success: true,
      message: 'Account and all associated tracking data have been permanently erased.'
    };
  } catch (error) {
    if (session && session.inTransaction()) {
      await session.abortTransaction();
    }
    // Fallback for standalone Mongo environments without replica set transactions
    if (error.message && error.message.includes('replica set')) {
      await DailyScore.deleteMany({ userId: userObjId });
      await DailyActivity.deleteMany({ userId: userObjId });
      await WeeklySummary.deleteMany({ userId: userObjId });
      await MonthlyResult.deleteMany({ userId: userObjId });
      await PushSubscription.deleteMany({ userId: userObjId });
      await Cycle.deleteMany({ userId: userObjId });
      await User.deleteOne({ _id: userObjId });
      return {
        success: true,
        message: 'Account and all associated tracking data have been permanently erased.'
      };
    }
    throw error;
  } finally {
    if (session) {
      session.endSession();
    }
  }
};

module.exports = {
  getProfile,
  updateProfile,
  deleteAccount
};
