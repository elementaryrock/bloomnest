const { Patient } = require('../models');
const specialIdService = require('../services/specialIdService');
const { validationResult } = require('express-validator');

class PatientController {
  // Register new patient
  async registerPatient(req, res) {
    try {
      // Validate request
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid input data',
            details: errors.array()
          }
        });
      }

      const {
        childName,
        dateOfBirth,
        gender,
        parentName,
        parentPhone,
        parentEmail,
        alternatePhone,
        relationship,
        address,
        diagnosis,
        severity,
        presentingProblems,
        referredBy,
        medicalHistory,
        photoUrl
      } = req.body;

      // Check for duplicate phone or email
      const existingPatient = await Patient.findOne({
        $or: [
          { parentPhone },
          { parentEmail }
        ]
      });

      if (existingPatient) {
        return res.status(409).json({
          success: false,
          error: {
            code: 'DUPLICATE_PATIENT',
            message: 'A patient with this phone number or email already exists'
          }
        });
      }

      // Generate Special ID
      const specialId = await specialIdService.generateSpecialId();

      // Calculate age from date of birth
      const dob = new Date(dateOfBirth);
      const today = new Date();
      let age = today.getFullYear() - dob.getFullYear();
      const monthDiff = today.getMonth() - dob.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
        age--;
      }

      // Create patient record
      const patient = await Patient.create({
        specialId,
        childName,
        dateOfBirth: dob,
        age,
        gender,
        photoUrl,
        parentName,
        parentPhone,
        parentEmail,
        alternatePhone,
        relationship,
        address,
        diagnosis,
        severity,
        presentingProblems,
        referredBy,
        medicalHistory,
        registeredBy: req.user.userId,
        registrationDate: new Date(),
        appRegistered: true,
        isActive: true
      });

      res.status(201).json({
        success: true,
        message: 'Patient registered successfully',
        data: {
          specialId: patient.specialId,
          childName: patient.childName,
          parentName: patient.parentName,
          registrationDate: patient.registrationDate
        }
      });
    } catch (error) {
      console.error('Patient registration error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'REGISTRATION_FAILED',
          message: error.message
        }
      });
    }
  }

  // Get patient by Special ID
  async getPatient(req, res) {
    try {
      const { specialId } = req.params;

      const patient = await Patient.findOne({ specialId, isActive: true })
        .select('-__v')
        .populate('registeredBy', 'name email');

      if (!patient) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'PATIENT_NOT_FOUND',
            message: 'Patient not found'
          }
        });
      }

      res.status(200).json({
        success: true,
        data: patient
      });
    } catch (error) {
      console.error('Get patient error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'FETCH_FAILED',
          message: error.message
        }
      });
    }
  }

  // Search patients
  async searchPatients(req, res) {
    try {
      const { query } = req.query;

      if (!query) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'MISSING_QUERY',
            message: 'Search query is required'
          }
        });
      }

      // Search by Special ID, child name, parent name, or phone
      const patients = await Patient.find({
        isActive: true,
        $or: [
          { specialId: new RegExp(query, 'i') },
          { childName: new RegExp(query, 'i') },
          { parentName: new RegExp(query, 'i') },
          { parentPhone: new RegExp(query, 'i') }
        ]
      })
        .select('specialId childName parentName parentPhone photoUrl diagnosis age')
        .limit(20);

      res.status(200).json({
        success: true,
        data: patients,
        count: patients.length
      });
    } catch (error) {
      console.error('Search patients error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'SEARCH_FAILED',
          message: error.message
        }
      });
    }
  }

  // Update patient information
  async updatePatient(req, res) {
    try {
      const { specialId } = req.params;
      const errors = validationResult(req);
      
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid input data',
            details: errors.array()
          }
        });
      }

      const patient = await Patient.findOne({ specialId, isActive: true });

      if (!patient) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'PATIENT_NOT_FOUND',
            message: 'Patient not found'
          }
        });
      }

      // Update allowed fields
      const allowedUpdates = [
        'childName', 'dateOfBirth', 'gender', 'photoUrl',
        'parentName', 'parentPhone', 'parentEmail', 'alternatePhone',
        'relationship', 'address', 'diagnosis', 'severity',
        'presentingProblems', 'medicalHistory'
      ];

      allowedUpdates.forEach(field => {
        if (req.body[field] !== undefined) {
          patient[field] = req.body[field];
        }
      });

      // Recalculate age if date of birth changed
      if (req.body.dateOfBirth) {
        const dob = new Date(req.body.dateOfBirth);
        const today = new Date();
        let age = today.getFullYear() - dob.getFullYear();
        const monthDiff = today.getMonth() - dob.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
          age--;
        }
        patient.age = age;
      }

      await patient.save();

      res.status(200).json({
        success: true,
        message: 'Patient updated successfully',
        data: patient
      });
    } catch (error) {
      console.error('Update patient error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'UPDATE_FAILED',
          message: error.message
        }
      });
    }
  }

  // Deactivate patient
  async deactivatePatient(req, res) {
    try {
      const { specialId } = req.params;

      const patient = await Patient.findOne({ specialId });

      if (!patient) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'PATIENT_NOT_FOUND',
            message: 'Patient not found'
          }
        });
      }

      patient.isActive = false;
      await patient.save();

      res.status(200).json({
        success: true,
        message: 'Patient deactivated successfully'
      });
    } catch (error) {
      console.error('Deactivate patient error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'DEACTIVATION_FAILED',
          message: error.message
        }
      });
    }
  }

  // Get all patients (for admin/receptionist)
  async getAllPatients(req, res) {
    try {
      const { page = 1, limit = 20, active = 'true' } = req.query;

      const query = { isActive: active === 'true' };

      const patients = await Patient.find(query)
        .select('specialId childName parentName parentPhone photoUrl diagnosis age registrationDate')
        .sort({ registrationDate: -1 })
        .limit(parseInt(limit))
        .skip((parseInt(page) - 1) * parseInt(limit));

      const total = await Patient.countDocuments(query);

      res.status(200).json({
        success: true,
        data: patients,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      });
    } catch (error) {
      console.error('Get all patients error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'FETCH_FAILED',
          message: error.message
        }
      });
    }
  }
}

module.exports = new PatientController();
