const mongoose = require('mongoose');
const { Schema } = mongoose;

const cycleSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID reference is required.'],
      index: true
    },
    cycleNumber: {
      type: Number,
      required: [true, 'Cycle number is required.'],
      default: 1,
      min: [1, 'Cycle number must be at least 1.']
    },
    startDate: {
      type: Date,
      required: [true, 'Start date is required.']
    },
    endDate: {
      type: Date,
      required: [true, 'End date is required.']
    },
    status: {
      type: String,
      enum: {
        values: ['active', 'completed', 'abandoned'],
        message: '{VALUE} is not a valid cycle status.'
      },
      default: 'active'
    },
    currentStreak: {
      type: Number,
      default: 0,
      min: [0, 'Current streak cannot be negative.']
    },
    targetWakeUpTime: {
      type: String,
      required: [true, 'Snapshot target wake-up time is required.'],
      match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Target wake-up time must follow HH:mm format.']
    },
    targetSleepTime: {
      type: String,
      required: [true, 'Snapshot target sleep time is required.'],
      match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Target sleep time must follow HH:mm format.']
    }
  },
  {
    timestamps: true,
    collection: 'cycles'
  }
);

// Partial Unique Index: A user can only have at most ONE 'active' cycle at any time
cycleSchema.index(
  { userId: 1, status: 1 },
  {
    unique: true,
    partialFilterExpression: { status: 'active' }
  }
);

// Compound index for querying multi-cycle history in order
cycleSchema.index({ userId: 1, cycleNumber: 1 });

module.exports = mongoose.model('Cycle', cycleSchema);
