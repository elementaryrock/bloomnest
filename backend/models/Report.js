const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  reportId: {
    type: String,
    required: true,
    unique: true
  },
  reportType: {
    type: String,
    enum: ['patient_list', 'session_summary', 'therapist_utilization', 'monthly_statistics'],
    required: true
  },
  reportData: {
    type: mongoose.Schema.Types.Mixed
  },
  fileUrl: {
    type: String
  },
  format: {
    type: String,
    enum: ['pdf', 'excel'],
    required: true
  },
  generatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Staff',
    required: true
  },
  generatedAt: {
    type: Date,
    default: Date.now
  },
  
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Report', reportSchema);
