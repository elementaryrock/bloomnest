const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient', // Note: 'Patient' acts as the parent object containing parentName
    required: true
  },
  content: {
    type: String,
    required: true,
    trim: true,
    maxlength: 1000
  },
  // In a multi-room setup this would be: room: { type: String, required: true }, but here we have just one global room
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Optimize for fetching latest messages
messageSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Message', messageSchema);
