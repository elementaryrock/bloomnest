const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authenticate = require('../middleware/auth');
const { otpLimiter, loginLimiter } = require('../middleware/rateLimiter');
const { body } = require('express-validator');

// Parent authentication routes
router.post(
  '/parent/send-otp',
  otpLimiter,
  [
    body('specialId')
      .notEmpty()
      .withMessage('Special ID is required')
      .matches(/^MEC\d{10}$/)
      .withMessage('Invalid Special ID format (should be MEC followed by 10 digits)'),
    body('phoneNumber')
      .notEmpty()
      .withMessage('Phone number is required')
      .matches(/^\d{10}$/)
      .withMessage('Phone number must be 10 digits')
  ],
  authController.sendOTP
);

router.post(
  '/parent/verify-otp',
  loginLimiter,
  [
    body('specialId')
      .notEmpty()
      .withMessage('Special ID is required'),
    body('otp')
      .notEmpty()
      .withMessage('OTP is required')
      .isLength({ min: 6, max: 6 })
      .withMessage('OTP must be 6 digits')
  ],
  authController.verifyOTP
);

// Staff authentication routes
router.post(
  '/staff/login',
  loginLimiter,
  [
    body('email')
      .notEmpty()
      .withMessage('Email is required')
      .isEmail()
      .withMessage('Invalid email format'),
    body('password')
      .notEmpty()
      .withMessage('Password is required')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters')
  ],
  authController.staffLogin
);

// Protected routes
router.get('/validate', authenticate, authController.validateToken);
router.post('/logout', authenticate, authController.logout);

module.exports = router;
