const mongoose = require('mongoose');

const directMessageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true,
    index: true
  },
  receiver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true,
    index: true
  },
  content: {
    type: String,
    required: true,
    trim: true,
    maxlength: 1000
  },
  read: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for fetching conversations between two users
directMessageSchema.index({ sender: 1, receiver: 1, createdAt: -1 });
// Index for fetching unread messages for a user
directMessageSchema.index({ receiver: 1, read: 1 });

module.exports = mongoose.model('DirectMessage', directMessageSchema);
