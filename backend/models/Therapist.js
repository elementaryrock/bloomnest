const mongoose = require('mongoose');

const therapistSchema = new mongoose.Schema({
  therapistId: {
    type: String,
    required: true,
    unique: true
  },
  staffId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Staff',
    required: true
  },
  specialization: {
    type: String,
    enum: ['Psychology', 'OT', 'PT', 'Speech', 'EI'],
    required: true
  },
  qualification: {
    type: String,
    required: true
  },
  workingDays: [{
    type: String,
    enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
  }],
  sessionsPerDay: {
    type: Number,
    default: 6
  },
  isAvailable: {
    type: Boolean,
    default: true
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

therapistSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Therapist', therapistSchema);
