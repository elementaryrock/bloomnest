const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  recipientId: {
    type: String,
    required: true,
    index: true
  },
  recipientType: {
    type: String,
    enum: ['parent', 'therapist', 'admin'],
    required: true
  },
  type: {
    type: String,
    enum: ['booking_confirmed', 'session_reminder', 'session_completed', 'assessment_completed', 'booking_cancelled'],
    required: true
  },
  message: {
    type: String,
    required: true
  },
  channel: {
    type: String,
    enum: ['email', 'sms', 'in-app'],
    required: true
  },
  isRead: {
    type: Boolean,
    default: false
  },
  sentAt: {
    type: Date
  },
  
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Notification', notificationSchema);
