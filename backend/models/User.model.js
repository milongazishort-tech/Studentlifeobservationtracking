const mongoose = require('mongoose');
const { Schema } = mongoose;

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Student name is required.'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters long.'],
      maxlength: [100, 'Name cannot exceed 100 characters.']
    },
    email: {
      type: String,
      required: [true, 'Email address is required.'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address.']
    },
    passwordHash: {
      type: String,
      required: [true, 'Password hash is required.']
    },
    university: {
      type: String,
      required: [true, 'University name is required.'],
      trim: true,
      maxlength: [150, 'University name cannot exceed 150 characters.']
    },
    department: {
      type: String,
      required: [true, 'Department name is required.'],
      trim: true,
      maxlength: [100, 'Department cannot exceed 100 characters.']
    },
    targetWakeUpTime: {
      type: String,
      default: '06:30',
      match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Target wake-up time must follow HH:mm format.']
    },
    targetSleepTime: {
      type: String,
      default: '23:00',
      match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Target sleep time must follow HH:mm format.']
    },
    reminderTime: {
      type: String,
      default: '21:00',
      match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Reminder time must follow HH:mm format.']
    },
    reminderEnabled: {
      type: Boolean,
      default: true
    },
    emailVerified: {
      type: Boolean,
      default: false
    },
    verificationToken: {
      type: String,
      default: null
    },
    verificationTokenExpires: {
      type: Date,
      default: null
    },
    resetPasswordToken: {
      type: String,
      default: null
    },
    resetPasswordExpires: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true,
    collection: 'users'
  }
);

// Indexes
// Note: email is already unique: true above, which creates index { email: 1 }

module.exports = mongoose.model('User', userSchema);
