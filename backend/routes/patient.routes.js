const express = require('express');
const router = express.Router();
const patientController = require('../controllers/patientController');
const authenticate = require('../middleware/auth');
const checkRole = require('../middleware/roleCheck');
const { body, param, query } = require('express-validator');

// Special ID pattern: MEC + YEAR(4 digits) + 6-digit sequence (e.g., MEC2025000001)
const SPECIAL_ID_PATTERN = /^MEC\d{10}$/;

// Get all patients (receptionist/admin only) - must be before /:specialId
router.get(
  '/',
  authenticate,
  checkRole('receptionist', 'admin'),
  patientController.getAllPatients
);

// Search patients (receptionist/admin only) - must be before /:specialId
router.get(
  '/search',
  authenticate,
  checkRole('receptionist', 'admin'),
  patientController.searchPatients
);

// Register new patient (receptionist/admin only)
router.post(
  '/register',
  authenticate,
  checkRole('receptionist', 'admin'),
  [
    body('childName').notEmpty().withMessage('Child name is required'),
    body('dateOfBirth').notEmpty().isISO8601().withMessage('Valid date of birth is required'),
    body('gender').isIn(['Male', 'Female', 'Other']).withMessage('Valid gender is required'),
    body('parentName').notEmpty().withMessage('Parent name is required'),
    body('parentPhone').matches(/^\d{10}$/).withMessage('Valid 10-digit phone number is required'),
    body('parentEmail').isEmail().withMessage('Valid email is required'),
    body('diagnosis').isArray({ min: 1 }).withMessage('At least one diagnosis is required'),
    body('diagnosis.*').isIn(['ASD', 'SLD', 'ID', 'CP']).withMessage('Invalid diagnosis type')
  ],
  patientController.registerPatient
);

// Get patient by Special ID
router.get(
  '/:specialId',
  authenticate,
  param('specialId').matches(SPECIAL_ID_PATTERN).withMessage('Invalid Special ID format (expected: MEC + 10 digits)'),
  patientController.getPatient
);

// Update patient information (receptionist/admin only)
router.put(
  '/:specialId',
  authenticate,
  checkRole('receptionist', 'admin'),
  [
    param('specialId').matches(SPECIAL_ID_PATTERN).withMessage('Invalid Special ID format (expected: MEC + 10 digits)'),
    body('parentPhone').optional().matches(/^\d{10}$/).withMessage('Valid 10-digit phone number is required'),
    body('parentEmail').optional().isEmail().withMessage('Valid email is required'),
    body('diagnosis').optional().isArray().withMessage('Diagnosis must be an array'),
    body('diagnosis.*').optional().isIn(['ASD', 'SLD', 'ID', 'CP']).withMessage('Invalid diagnosis type')
  ],
  patientController.updatePatient
);

// Deactivate patient (admin only)
router.delete(
  '/:specialId',
  authenticate,
  checkRole('admin'),
  param('specialId').matches(SPECIAL_ID_PATTERN).withMessage('Invalid Special ID format (expected: MEC + 10 digits)'),
  patientController.deactivatePatient
);

module.exports = router;
