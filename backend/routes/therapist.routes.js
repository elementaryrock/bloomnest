const express = require('express');
const router = express.Router();
const therapistController = require('../controllers/therapistController');
const authenticate = require('../middleware/auth');
const checkRole = require('../middleware/roleCheck');
const { body, param, query } = require('express-validator');

// Get therapist's daily schedule (therapist only)
router.get(
  '/schedule',
  authenticate,
  checkRole('therapist'),
  therapistController.getDailySchedule
);

// Get therapist schedule by ID (admin/receptionist)
router.get(
  '/:therapistId/schedule',
  authenticate,
  checkRole('admin', 'receptionist'),
  [
    param('therapistId').notEmpty().withMessage('Therapist ID is required'),
    query('date').optional().isISO8601().withMessage('Valid date format required')
  ],
  therapistController.getTherapistScheduleById
);

// Get available therapists by specialization (for booking - any authenticated user)
router.get(
  '/available',
  authenticate,
  [
    query('specialization').optional().isIn(['Psychology', 'OT', 'PT', 'Speech', 'EI']).withMessage('Valid specialization required')
  ],
  therapistController.getAvailableTherapists
);

// Get all therapists (admin/receptionist)
router.get(
  '/',
  authenticate,
  checkRole('admin', 'receptionist'),
  therapistController.getAllTherapists
);

// Add new therapist (admin only)
router.post(
  '/',
  authenticate,
  checkRole('admin'),
  [
    body('name').notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('phone').matches(/^\d{10}$/).withMessage('Valid 10-digit phone number is required'),
    body('specialization').isIn(['Psychology', 'OT', 'PT', 'Speech', 'EI']).withMessage('Valid specialization is required'),
    body('qualification').notEmpty().withMessage('Qualification is required'),
    body('workingDays').isArray({ min: 1 }).withMessage('At least one working day is required'),
    body('sessionsPerDay').isInt({ min: 1, max: 10 }).withMessage('Sessions per day must be between 1 and 10')
  ],
  therapistController.addTherapist
);

// Update therapist (admin only)
router.put(
  '/:therapistId',
  authenticate,
  checkRole('admin'),
  [
    param('therapistId').notEmpty().withMessage('Therapist ID is required'),
    body('workingDays').optional().isArray().withMessage('Working days must be an array'),
    body('sessionsPerDay').optional().isInt({ min: 1, max: 10 }).withMessage('Sessions per day must be between 1 and 10')
  ],
  therapistController.updateTherapist
);

// Toggle therapist availability (admin only)
router.patch(
  '/:therapistId/availability',
  authenticate,
  checkRole('admin'),
  [
    param('therapistId').notEmpty().withMessage('Therapist ID is required'),
    body('isAvailable').isBoolean().withMessage('isAvailable must be a boolean')
  ],
  therapistController.toggleAvailability
);

module.exports = router;
