const express = require('express');
const router = express.Router();
const assessmentController = require('../controllers/assessmentController');
const authenticate = require('../middleware/auth');
const checkRole = require('../middleware/roleCheck');
const { body, param } = require('express-validator');

// Create new assessment (therapist only)
router.post(
  '/',
  authenticate,
  checkRole('therapist'),
  [
    body('specialId').notEmpty().matches(/^MEC\d{10}$/).withMessage('Valid Special ID is required'),
    body('assessmentDate').notEmpty().isISO8601().withMessage('Valid assessment date is required')
  ],
  assessmentController.createAssessment
);

// Update assessment (save draft or update) (therapist only)
router.put(
  '/:assessmentId',
  authenticate,
  checkRole('therapist'),
  [
    param('assessmentId').notEmpty().withMessage('Assessment ID is required'),
    body('assessmentData').optional().isObject().withMessage('Assessment data must be an object'),
    body('status').optional().isIn(['draft', 'completed']).withMessage('Status must be draft or completed')
  ],
  assessmentController.updateAssessment
);

// Get assessment by ID
router.get(
  '/:assessmentId',
  authenticate,
  param('assessmentId').notEmpty().withMessage('Assessment ID is required'),
  assessmentController.getAssessment
);

// Get patient assessments
router.get(
  '/patient/:specialId',
  authenticate,
  param('specialId').matches(/^MEC\d{10}$/).withMessage('Invalid Special ID format'),
  assessmentController.getPatientAssessments
);

// Complete assessment (therapist only)
router.post(
  '/:assessmentId/complete',
  authenticate,
  checkRole('therapist'),
  [
    param('assessmentId').notEmpty().withMessage('Assessment ID is required'),
    body('assessmentData').notEmpty().isObject().withMessage('Complete assessment data is required')
  ],
  assessmentController.completeAssessment
);

// Accept assessment (parent only)
router.post(
  '/:assessmentId/accept',
  authenticate,
  checkRole('parent'),
  [
    param('assessmentId').notEmpty().withMessage('Assessment ID is required')
  ],
  assessmentController.acceptAssessment
);

// Get all assessments (admin/receptionist)
router.get(
  '/',
  authenticate,
  checkRole('admin', 'receptionist', 'therapist'),
  assessmentController.getAllAssessments
);

module.exports = router;
