const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const authenticate = require('../middleware/auth');
const checkRole = require('../middleware/roleCheck');
const { body, param, query } = require('express-validator');

// Get available slots (authenticated users)
router.get(
  '/available-slots',
  authenticate,
  [
    query('date').notEmpty().isISO8601().withMessage('Valid date is required'),
    query('therapyType').isIn(['Psychology', 'OT', 'PT', 'Speech', 'EI']).withMessage('Valid therapy type is required')
  ],
  bookingController.getAvailableSlots
);

// Get monthly booking count (authenticated users)
router.get(
  '/monthly-count',
  authenticate,
  [
    query('specialId').notEmpty().withMessage('Special ID is required'),
    query('therapyType').isIn(['Psychology', 'OT', 'PT', 'Speech', 'EI']).withMessage('Valid therapy type is required'),
    query('date').notEmpty().isISO8601().withMessage('Valid date is required')
  ],
  bookingController.getMonthlyBookingCount
);

// Create booking (parents only)
router.post(
  '/',
  authenticate,
  checkRole('parent'),
  [
    body('specialId').notEmpty().withMessage('Special ID is required'),
    body('therapyType').isIn(['Psychology', 'OT', 'PT', 'Speech', 'EI']).withMessage('Valid therapy type is required'),
    body('date').notEmpty().isISO8601().withMessage('Valid date is required'),
    body('timeSlot').notEmpty().withMessage('Time slot is required')
  ],
  bookingController.createBooking
);

// Create booking by receptionist/admin
router.post(
  '/receptionist',
  authenticate,
  checkRole('receptionist', 'admin'),
  [
    body('specialId').notEmpty().withMessage('Special ID is required'),
    body('therapyType').isIn(['Psychology', 'OT', 'PT', 'Speech', 'EI']).withMessage('Valid therapy type is required'),
    body('date').notEmpty().isISO8601().withMessage('Valid date is required'),
    body('timeSlot').notEmpty().withMessage('Time slot is required')
  ],
  bookingController.createBookingByReceptionist
);

// Get current user's bookings (for parents)
router.get(
  '/my-bookings',
  authenticate,
  bookingController.getMyBookings
);

// Get patient bookings by specialId
router.get(
  '/patient/:specialId',
  authenticate,
  param('specialId').matches(/^MEC\d{10}$/).withMessage('Invalid Special ID format'),
  bookingController.getPatientBookings
);

// Cancel booking
router.put(
  '/:bookingId/cancel',
  authenticate,
  [
    param('bookingId').notEmpty().withMessage('Booking ID is required'),
    body('reason').optional().isString().withMessage('Reason must be a string')
  ],
  bookingController.cancelBooking
);

// Get bookings by date (admin/receptionist)
router.get(
  '/date/:date',
  authenticate,
  checkRole('admin', 'receptionist'),
  param('date').isISO8601().withMessage('Valid date is required'),
  bookingController.getBookingsByDate
);

// Get all bookings (admin/receptionist)
router.get(
  '/',
  authenticate,
  checkRole('admin', 'receptionist'),
  bookingController.getAllBookings
);

module.exports = router;
