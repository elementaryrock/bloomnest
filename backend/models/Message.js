const mongoose = require('mongoose');

const VALID_ROOMS = ['general', 'speech', 'ot', 'pt', 'psychology', 'ei'];

const messageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true
  },
  content: {
    type: String,
    required: true,
    trim: true,
    maxlength: 1000
  },
  room: {
    type: String,
    enum: VALID_ROOMS,
    default: 'general',
    index: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Optimize for fetching latest messages per room
messageSchema.index({ room: 1, createdAt: -1 });

module.exports = mongoose.model('Message', messageSchema);
