const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  bookingId: {
    type: String,
    required: true,
    unique: true
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
  therapyType: {
    type: String,
    enum: ['Psychology', 'OT', 'PT', 'Speech', 'EI'],
    required: true
  },
  date: {
    type: Date,
    required: true,
    index: true
  },
  timeSlot: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['confirmed', 'completed', 'cancelled', 'no-show'],
    default: 'confirmed'
  },
  bookedAt: {
    type: Date,
    default: Date.now
  },
  cancelledAt: {
    type: Date
  },
  cancellationReason: {
    type: String
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

// Compound index for preventing double booking by therapist (sparse for when therapistId is null)
bookingSchema.index({ therapistId: 1, date: 1, timeSlot: 1 }, { unique: true, sparse: true });

// Compound index for preventing double booking by patient
bookingSchema.index({ specialId: 1, date: 1, timeSlot: 1 }, { unique: true });

// Compound index for preventing double booking of same therapy slot
bookingSchema.index({ therapyType: 1, date: 1, timeSlot: 1 }, { unique: true });

bookingSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Booking', bookingSchema);
