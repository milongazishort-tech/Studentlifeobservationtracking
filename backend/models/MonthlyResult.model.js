const mongoose = require('mongoose');
const { Schema } = mongoose;

const monthlyResultSchema = new Schema(
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
    cycleNumber: {
      type: Number,
      required: [true, 'Cycle number is required.'],
      min: [1, 'Cycle number must be at least 1.']
    },
    lifeScore: {
      type: Number,
      required: [true, 'Final 30-day life score is required.'],
      min: [0, 'Life score cannot be less than 0.'],
      max: [100, 'Life score cannot exceed 100.']
    },
    habitConsistency: {
      type: Number,
      required: [true, 'Habit consistency percentage is required.'],
      min: [0, 'Consistency cannot be less than 0.'],
      max: [100, 'Consistency cannot exceed 100.']
    },
    daysTracked: {
      type: Number,
      required: [true, 'Days tracked count is required.'],
      min: [0, 'Days tracked cannot be negative.'],
      max: [30, 'Days tracked cannot exceed 30.']
    },
    totalDays: {
      type: Number,
      default: 30
    },
    lifeStage: {
      type: Number,
      required: [true, 'Classified life stage ID (1-10) is required.'],
      min: [1, 'Life stage must be between 1 and 10.'],
      max: [10, 'Life stage must be between 1 and 10.']
    },
    lifeStageName: {
      type: String,
      required: [true, 'Life stage official title is required.']
    },
    lifeStageDescription: {
      type: String,
      required: [true, 'Life stage description is required.']
    },
    strengths: [
      {
        item: { type: Number, required: true },
        areaName: { type: String, required: true },
        completionRate: { type: Number, required: true }
      }
    ],
    weaknesses: [
      {
        item: { type: Number, required: true },
        areaName: { type: String, required: true },
        completionRate: { type: Number, required: true }
      }
    ],
    areaCompletionRates: {
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
    progressTrend: [
      {
        weekNumber: { type: Number, required: true },
        averageScore: { type: Number, required: true },
        daysTracked: { type: Number, required: true }
      }
    ],
    lifeInsight: {
      type: String,
      required: [true, 'Personalized life insight reflection is required.']
    },
    improvementSuggestions: [
      {
        type: String,
        trim: true
      }
    ],
    hasEnoughData: {
      type: Boolean,
      default: true
    },
    isGenerated: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true,
    collection: 'monthlyResults'
  }
);

// Unique Compound Index: Ensures strictly one finalized monthly report per user per cycle
monthlyResultSchema.index({ userId: 1, cycleId: 1 }, { unique: true });

module.exports = mongoose.model('MonthlyResult', monthlyResultSchema);
