const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
  sessionId: {
    type: String,
    required: true,
    unique: true
  },
  bookingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    required: true
  },
  specialId: {
    type: String,
    required: true,
    index: true
  },
  therapistId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Therapist',
    required: false  // Optional - for simple mode without therapist assignment
  },

  sessionDate: {
    type: Date,
    required: true
  },
  startTime: {
    type: Date
  },
  endTime: {
    type: Date
  },

  activitiesConducted: {
    type: String
  },
  goalsAddressed: {
    type: String
  },
  progressLevel: {
    type: String,
    enum: ['Excellent', 'Good', 'Satisfactory', 'Needs Improvement']
  },
  behavioralObservations: {
    type: String
  },
  recommendationsForParents: {
    type: String
  },
  nextSessionFocus: {
    type: String
  },

  completedAt: {
    type: Date
  },

  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

sessionSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Session', sessionSchema);
