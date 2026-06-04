const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  token: {
    type: String,
    required: true,
    unique: true
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
  loginTime: {
    type: Date,
    default: Date.now
  },
  lastActivity: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  },
  expiresAt: {
    type: Date,
    required: true,
    index: true
  }
});

// Index for automatic cleanup of expired sessions
sessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Update last activity
sessionSchema.methods.updateActivity = function() {
  this.lastActivity = new Date();
  return this.save();
};

// Terminate session
sessionSchema.methods.terminate = function() {
  this.isActive = false;
  return this.save();
};

module.exports = mongoose.model('Session', sessionSchema);
