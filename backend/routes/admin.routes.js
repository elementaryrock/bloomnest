const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const authenticate = require('../middleware/auth');
const checkRole = require('../middleware/roleCheck');

// Get system statistics (admin only)
router.get(
  '/stats',
  authenticate,
  checkRole('admin'),
  adminController.getSystemStats
);

// Get therapist utilization (admin only)
router.get(
  '/utilization',
  authenticate,
  checkRole('admin'),
  adminController.getTherapistUtilization
);

// Get booking trends (admin only)
router.get(
  '/trends',
  authenticate,
  checkRole('admin'),
  adminController.getBookingTrends
);

// Get therapy type distribution (admin only)
router.get(
  '/distribution',
  authenticate,
  checkRole('admin'),
  adminController.getTherapyTypeDistribution
);

// Get recent activities (admin only)
router.get(
  '/activities',
  authenticate,
  checkRole('admin'),
  adminController.getRecentActivities
);

module.exports = router;
