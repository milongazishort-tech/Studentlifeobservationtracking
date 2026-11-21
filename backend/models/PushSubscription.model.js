const mongoose = require('mongoose');
const { Schema } = mongoose;

const pushSubscriptionSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID reference is required.'],
      index: true
    },
    endpoint: {
      type: String,
      required: [true, 'Browser push endpoint URL is required.'],
      trim: true
    },
    keys: {
      p256dh: {
        type: String,
        required: [true, 'P-256 public encryption key is required.']
      },
      auth: {
        type: String,
        required: [true, 'Auth secret authentication key is required.']
      }
    }
  },
  {
    timestamps: true,
    collection: 'pushSubscriptions'
  }
);

// Unique Compound Index: Avoid duplicate subscriptions for the same user and endpoint
pushSubscriptionSchema.index({ userId: 1, endpoint: 1 }, { unique: true });

module.exports = mongoose.model('PushSubscription', pushSubscriptionSchema);
