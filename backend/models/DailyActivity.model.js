const mongoose = require('mongoose');
const { Schema } = mongoose;

const dailyActivitySchema = new Schema(
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
    date: {
      type: Date,
      required: [true, 'Activity calendar date is required.']
    },
    dayNumber: {
      type: Number,
      required: [true, 'Cycle day number (1-30) is required.'],
      min: [1, 'Day number cannot be less than 1.'],
      max: [30, 'Day number cannot exceed 30.']
    },
    isOffDay: {
      type: Boolean,
      default: false
    },
    isMissedDay: {
      type: Boolean,
      default: false
    },
    isGraceEntry: {
      type: Boolean,
      default: false
    },

    // 12 Life Area Habit Responses
    item1_earlyMorning: {
      type: Boolean,
      default: false
    },
    item2_universityAttendance: {
      type: String,
      enum: {
        values: ['yes', 'no', 'off_day'],
        message: '{VALUE} is not a valid attendance status.'
      },
      default: 'no'
    },
    item3_classParticipation_attended: {
      type: Number,
      default: 0,
      min: [0, 'Attended classes cannot be negative.']
    },
    item3_classParticipation_total: {
      type: Number,
      default: 0,
      min: [0, 'Total scheduled classes cannot be negative.']
    },
    item4_personalDiscipline: {
      type: Boolean,
      default: false
    },
    item5_socialInteractions: {
      type: Number,
      default: 0,
      min: [0, 'Social interaction count cannot be negative.'],
      max: [50, 'Social interactions cannot exceed 50 per day.']
    },
    item5_socialInteractions_count: {
      type: Number,
      default: 0
    },
    item6_dailyLearning: {
      type: String,
      trim: true,
      maxlength: [500, 'Daily learning summary cannot exceed 500 characters.'],
      default: ''
    },
    item6_dailyLearning_text: {
      type: String,
      trim: true,
      default: ''
    },
    item7_physicalActivity: {
      type: Boolean,
      default: false
    },
    item7_physicalActivity_active: {
      type: Boolean,
      default: false
    },
    item7_physicalMinutes: {
      type: Number,
      default: 0,
      min: [0, 'Physical activity duration cannot be negative.'],
      max: [1440, 'Physical activity duration cannot exceed 1440 minutes.']
    },
    item7_physicalActivity_minutes: {
      type: Number,
      default: 0
    },
    item8_skillDevelopmentMinutes: {
      type: Number,
      default: 0,
      min: [0, 'Skill development duration cannot be negative.'],
      max: [1440, 'Skill development duration cannot exceed 1440 minutes.']
    },
    item8_skillDevelopment_minutes: {
      type: Number,
      default: 0
    },
    item9_classWorkRecap: {
      type: Boolean,
      default: false
    },
    item10_socialMediaControl: {
      type: String,
      enum: {
        values: ['controlled', 'useful', 'excessive'],
        message: '{VALUE} is not a valid social media control level.'
      },
      default: 'controlled'
    },
    item11_selfReflection: {
      type: String,
      trim: true,
      maxlength: [500, 'Self-reflection cannot exceed 500 characters.'],
      default: ''
    },
    item11_selfReflection_text: {
      type: String,
      trim: true,
      default: ''
    },
    item12_sleepOnTime: {
      type: Boolean,
      default: false
    },
    item12_sleepingOnTime: {
      type: Boolean,
      default: false
    },

    submittedAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true,
    collection: 'dailyActivities'
  }
);

// Unique Compound Index: Prevent duplicate checklist submissions for the same user on the same calendar date
dailyActivitySchema.index({ userId: 1, date: 1 }, { unique: true });

// Compound Index: Efficient range queries within a specific cycle and day window
dailyActivitySchema.index({ userId: 1, cycleId: 1, dayNumber: 1 });

module.exports = mongoose.model('DailyActivity', dailyActivitySchema);
