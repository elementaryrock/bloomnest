const express = require('express');
const router = express.Router();
const sessionController = require('../controllers/sessionController');
const authenticate = require('../middleware/auth');
const checkRole = require('../middleware/roleCheck');
const { body, param } = require('express-validator');

// Get today's sessions for therapist
router.get(
  '/today',
  authenticate,
  checkRole('therapist', 'admin'),
  sessionController.getTodaySessions
);

// Start session (therapist only)
router.post(
  '/:sessionId/start',
  authenticate,
  checkRole('therapist'),
  param('sessionId').notEmpty().withMessage('Session ID is required'),
  sessionController.startSession
);

// Complete session with notes (therapist only)
router.post(
  '/:sessionId/complete',
  authenticate,
  checkRole('therapist'),
  [
    param('sessionId').notEmpty().withMessage('Session ID is required'),
    body('activitiesConducted').notEmpty().withMessage('Activities conducted is required'),
    body('goalsAddressed').notEmpty().withMessage('Goals addressed is required'),
    body('progressLevel').isIn(['Excellent', 'Good', 'Satisfactory', 'Needs Improvement']).withMessage('Valid progress level is required'),
    body('behavioralObservations').notEmpty().withMessage('Behavioral observations is required'),
    body('recommendationsForParents').notEmpty().withMessage('Recommendations for parents is required'),
    body('nextSessionFocus').optional().isString().withMessage('Next session focus must be a string')
  ],
  sessionController.completeSession
);

// Get session by ID
router.get(
  '/:sessionId',
  authenticate,
  param('sessionId').notEmpty().withMessage('Session ID is required'),
  sessionController.getSession
);

// Get patient session history
router.get(
  '/patient/:specialId/history',
  authenticate,
  param('specialId').matches(/^MEC\d{10}$/).withMessage('Invalid Special ID format'),
  sessionController.getPatientSessionHistory
);

// Get all sessions (admin/receptionist)
router.get(
  '/',
  authenticate,
  checkRole('admin', 'receptionist'),
  sessionController.getAllSessions
);

module.exports = router;
