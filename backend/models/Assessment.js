const mongoose = require('mongoose');

const assessmentSchema = new mongoose.Schema({
  assessmentId: {
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
    required: true
  },
  assessmentDate: {
    type: Date,
    required: true
  },
  
  assessmentData: {
    presentingProblems: {
      type: String
    },
    developmentalHistory: {
      prenatal: {
        type: String
      },
      perinatal: {
        type: String
      },
      postnatal: {
        type: String
      }
    },
    motorSkills: {
      grossMotor: {
        type: String
      },
      fineMotor: {
        type: String
      }
    },
    languageSkills: {
      receptive: {
        type: String
      },
      expressive: {
        type: String
      }
    },
    socialAdaptiveSkills: {
      type: String
    },
    behavioralObservations: {
      type: String
    },
    testAdministration: {
      type: String
    },
    diagnosisImpression: {
      type: String
    },
    recommendations: {
      type: String
    },
    followUpDate: {
      type: Date
    }
  },
  
  status: {
    type: String,
    enum: ['draft', 'completed'],
    default: 'draft'
  },
  pdfUrl: {
    type: String
  },
  
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  completedAt: {
    type: Date
  }
});

assessmentSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Assessment', assessmentSchema);
