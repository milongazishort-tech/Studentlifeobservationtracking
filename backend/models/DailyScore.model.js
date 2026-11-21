const mongoose = require('mongoose');
const { Schema } = mongoose;

const dailyScoreSchema = new Schema(
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
    dailyActivityId: {
      type: Schema.Types.ObjectId,
      ref: 'DailyActivity',
      required: [true, 'DailyActivity ID reference is required.']
    },
    date: {
      type: Date,
      required: [true, 'Score date is required.']
    },
    dayNumber: {
      type: Number,
      required: [true, 'Day number (1-30) is required.'],
      min: [1, 'Day number must be at least 1.'],
      max: [30, 'Day number cannot exceed 30.']
    },
    totalScore: {
      type: Number,
      required: [true, 'Normalized total daily score is required.'],
      min: [0, 'Total score cannot be less than 0.'],
      max: [100, 'Total score cannot exceed 100.']
    },
    maxAvailablePoints: {
      type: Number,
      required: [true, 'Max available points is required.'],
      enum: {
        values: [100, 82],
        message: 'Max available points must be 100 (normal day) or 82 (off-day).'
      },
      default: 100
    },
    achievedPoints: {
      type: Number,
      required: [true, 'Total achieved points is required.'],
      min: [0, 'Achieved points cannot be less than 0.'],
      max: [100, 'Achieved points cannot exceed 100.']
    },
    scores: {
      item1: { type: Number, default: 0, min: 0, max: 8 },
      item2: { type: Number, default: 0, min: 0, max: 10 },
      item3: { type: Number, default: 0, min: 0, max: 8 },
      item4: { type: Number, default: 0, min: 0, max: 8 },
      item5: { type: Number, default: 0, min: 0, max: 6 },
      item6: { type: Number, default: 0, min: 0, max: 10 },
      item7: { type: Number, default: 0, min: 0, max: 10 },
      item8: { type: Number, default: 0, min: 0, max: 10 },
      item9: { type: Number, default: 0, min: 0, max: 10 },
      item10: { type: Number, default: 0, min: 0, max: 6 },
      item11: { type: Number, default: 0, min: 0, max: 8 },
      item12: { type: Number, default: 0, min: 0, max: 6 }
    }
  },
  {
    timestamps: true,
    collection: 'dailyScores'
  }
);

// Unique Compound Index: Ensures one calculated score per user per calendar date
dailyScoreSchema.index({ userId: 1, date: 1 }, { unique: true });

// Compound Index: Accelerates range queries during weekly aggregation
dailyScoreSchema.index({ cycleId: 1, dayNumber: 1 });

module.exports = mongoose.model('DailyScore', dailyScoreSchema);
