const authService = require('../services/authService');
const { validationResult } = require('express-validator');

class AuthController {
  // Send OTP to parent
  async sendOTP(req, res) {
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

      const { specialId, phoneNumber } = req.body;

      const result = await authService.sendOTP(specialId, phoneNumber);

      res.status(200).json(result);
    } catch (error) {
      console.error('Send OTP error:', error);
      res.status(400).json({
        success: false,
        error: {
          code: 'OTP_SEND_FAILED',
          message: error.message
        }
      });
    }
  }

  // Verify OTP
  async verifyOTP(req, res) {
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

      const { specialId, otp } = req.body;

      const result = await authService.verifyOTP(specialId, otp);

      res.status(200).json(result);
    } catch (error) {
      console.error('Verify OTP error:', error);
      res.status(401).json({
        success: false,
        error: {
          code: 'OTP_VERIFICATION_FAILED',
          message: error.message
        }
      });
    }
  }

  // Staff login
  async staffLogin(req, res) {
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

      const { email, password } = req.body;

      const result = await authService.staffLogin(email, password);

      res.status(200).json(result);
    } catch (error) {
      console.error('Staff login error:', error);
      res.status(401).json({
        success: false,
        error: {
          code: 'LOGIN_FAILED',
          message: error.message
        }
      });
    }
  }

  // Validate token (for frontend to check if token is still valid)
  async validateToken(req, res) {
    try {
      // If we reach here, the authenticate middleware has already validated the token
      res.status(200).json({
        success: true,
        user: req.user
      });
    } catch (error) {
      console.error('Token validation error:', error);
      res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_TOKEN',
          message: 'Invalid or expired token'
        }
      });
    }
  }

  // Logout (client-side token removal, but we can log it)
  async logout(req, res) {
    try {
      // In a JWT system, logout is primarily client-side
      // But we can log the action for audit purposes
      console.log(`User ${req.user.userId} logged out`);

      res.status(200).json({
        success: true,
        message: 'Logged out successfully'
      });
    } catch (error) {
      console.error('Logout error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'LOGOUT_FAILED',
          message: 'Logout failed'
        }
      });
    }
  }
}

module.exports = new AuthController();
