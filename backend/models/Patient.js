const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema({
  specialId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  childName: {
    type: String,
    required: true
  },
  dateOfBirth: {
    type: Date,
    required: true
  },
  age: {
    type: Number,
    required: true
  },
  gender: {
    type: String,
    enum: ['Male', 'Female', 'Other'],
    required: true
  },
  photoUrl: {
    type: String
  },
  
  parentName: {
    type: String,
    required: true
  },
  parentPhone: {
    type: String,
    required: true,
    index: true
  },
  parentEmail: {
    type: String,
    required: true
  },
  alternatePhone: {
    type: String
  },
  relationship: {
    type: String,
    enum: ['Mother', 'Father', 'Guardian']
  },
  address: {
    type: String
  },
  
  diagnosis: [{
    type: String,
    enum: ['ASD', 'SLD', 'ID', 'CP']
  }],
  severity: {
    type: String,
    enum: ['Mild', 'Moderate', 'Severe']
  },
  presentingProblems: {
    type: String
  },
  referredBy: {
    type: String
  },
  medicalHistory: {
    type: String
  },
  
  registeredBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Staff'
  },
  registrationDate: {
    type: Date,
    default: Date.now
  },
  appRegistered: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date
  },
  isActive: {
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

// Update the updatedAt timestamp before saving
patientSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Patient', patientSchema);
