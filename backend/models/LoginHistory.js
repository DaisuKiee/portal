const mongoose = require('mongoose');

const loginHistorySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  action: {
    type: String,
    enum: ['login', 'logout', 'failed_login', '2fa_failed', 'session_terminated'],
    required: true
  },
  success: {
    type: Boolean,
    required: true
  },
  deviceInfo: {
    type: {
      type: String,
      enum: ['mobile', 'desktop', 'tablet', 'unknown'],
      default: 'unknown'
    },
    os: {
      type: String,
      default: 'unknown'
    },
    browser: {
      type: String,
      default: 'unknown'
    },
    appVersion: {
      type: String,
      default: 'unknown'
    }
  },
  location: {
    ip: {
      type: String,
      default: 'unknown'
    },
    country: {
      type: String,
      default: 'unknown'
    },
    city: {
      type: String,
      default: 'unknown'
    }
  },
  failureReason: {
    type: String
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  }
});

// Index for efficient queries
loginHistorySchema.index({ userId: 1, timestamp: -1 });

module.exports = mongoose.model('LoginHistory', loginHistorySchema);
