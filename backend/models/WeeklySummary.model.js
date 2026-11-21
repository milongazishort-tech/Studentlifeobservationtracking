const mongoose = require('mongoose');
const { Schema } = mongoose;

const weeklySummarySchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID reference is required.'],
      index: true
    },
    cycleId: {
      type: Schema.Types.ObjectId,
      ref: 'Cycle',
      required: [true, 'Cycle ID reference is required.'],
      index: true
    },
    weekNumber: {
      type: Number,
      required: [true, 'Week number is required.'],
      min: [1, 'Week number must be between 1 and 5.'],
      max: [5, 'Week number must be between 1 and 5.']
    },
    startDay: {
      type: Number,
      required: [true, 'Start day number is required.'],
      enum: {
        values: [1, 8, 15, 22, 29],
        message: '{VALUE} is not a valid week start day (must be 1, 8, 15, 22, or 29).'
      }
    },
    endDay: {
      type: Number,
      required: [true, 'End day number is required.'],
      enum: {
        values: [7, 14, 21, 28, 30],
        message: '{VALUE} is not a valid week end day (must be 7, 14, 21, 28, or 30).'
      }
    },
    startDate: {
      type: Date,
      required: [true, 'Week calendar start date is required.']
    },
    endDate: {
      type: Date,
      required: [true, 'Week calendar end date is required.']
    },
    weeklyAverageScore: {
      type: Number,
      required: [true, 'Weekly average score is required.'],
      min: [0, 'Weekly average score cannot be negative.'],
      max: [100, 'Weekly average score cannot exceed 100.']
    },
    daysTracked: {
      type: Number,
      required: [true, 'Tracked days count is required.'],
      min: [0, 'Days tracked cannot be negative.'],
      max: [7, 'Days tracked cannot exceed 7 in any week.']
    },
    daysInWeek: {
      type: Number,
      required: [true, 'Days in week count is required.'],
      enum: {
        values: [7, 2],
        message: 'Days in week must be 7 (Weeks 1-4) or 2 (Final Stretch).'
      },
      default: 7
    },
    bestDay: {
      date: { type: Date },
      score: { type: Number, min: 0, max: 100 }
    },
    lowestDay: {
      date: { type: Date },
      score: { type: Number, min: 0, max: 100 }
    },
    streakAtEndOfWeek: {
      type: Number,
      default: 0,
      min: [0, 'Streak count cannot be negative.']
    },
    areaBreakdown: {
      item1: { type: Number, default: 0 },
      item2: { type: Number, default: 0 },
      item3: { type: Number, default: 0 },
      item4: { type: Number, default: 0 },
      item5: { type: Number, default: 0 },
      item6: { type: Number, default: 0 },
      item7: { type: Number, default: 0 },
      item8: { type: Number, default: 0 },
      item9: { type: Number, default: 0 },
      item10: { type: Number, default: 0 },
      item11: { type: Number, default: 0 },
      item12: { type: Number, default: 0 }
    },
    deltaFromPreviousWeek: {
      type: Number,
      default: null
    },
    focusTip: {
      type: String,
      trim: true,
      default: ''
    },
    isGenerated: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true,
    collection: 'weeklySummaries'
  }
);

// Unique Compound Index: Exactly one summary record per user per cycle per weekNumber
weeklySummarySchema.index({ userId: 1, cycleId: 1, weekNumber: 1 }, { unique: true });

module.exports = mongoose.model('WeeklySummary', weeklySummarySchema);
