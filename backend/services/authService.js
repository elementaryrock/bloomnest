const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { Patient, Staff, OTP } = require('../models');
const { sendOTP: sendSMSOTP } = require('../utils/messagecentral');

class AuthService {
  // Generate 6-digit OTP
  generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  // Send OTP to parent
  async sendOTP(specialId, phoneNumber) {
    // Validate patient exists and is active
    const patient = await Patient.findOne({
      specialId,
      parentPhone: phoneNumber,
      isActive: true
    });
    if (!patient) {
      throw new Error('Invalid Special ID or phone number');
    }

    // Check rate limiting (max 5 OTPs per hour)
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const recentOTPs = await OTP.countDocuments({
      specialId,
      createdAt: { $gte: oneHourAgo }
    });

    if (recentOTPs >= 5) {
      throw new Error('Rate limit exceeded. Please try again after an hour.');
    }

    // Generate OTP
    const otp = this.generateOTP();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    // Store OTP
    const otpRecord = await OTP.create({
      specialId,
      phoneNumber,
      otp,
      expiresAt,
      attempts: 0,
      verified: false
    });

    // Send OTP via MessageCentral (falls back to console if not configured)
    const smsResult = await sendSMSOTP(phoneNumber, otp);
    console.log(`[OTP] Sent via ${smsResult.method} for ${specialId}: ${otp}`);

    return {
      success: true,
      message: smsResult.method === 'sms' ? 'OTP sent to your phone' : 'OTP sent (check console in dev mode)',
      expiresAt
    };
  }

  // Verify OTP
  async verifyOTP(specialId, otpInput) {
    // Find valid OTP
    const otpRecord = await OTP.findOne({
      specialId,
      otp: otpInput,
      verified: false,
      expiresAt: { $gt: new Date() }
    });

    if (!otpRecord) {
      // Increment attempts for the most recent unverified OTP
      const latestOTP = await OTP.findOne({
        specialId,
        verified: false
      }).sort({ createdAt: -1 });

      if (latestOTP) {
        latestOTP.attempts += 1;
        await latestOTP.save();

        if (latestOTP.attempts >= 3) {
          throw new Error('Maximum attempts exceeded. Please request a new OTP.');
        }
      }

      throw new Error('Invalid or expired OTP');
    }

    // Mark OTP as verified
    otpRecord.verified = true;
    await otpRecord.save();

    // Get patient details
    const patient = await Patient.findOne({ specialId });

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: patient._id,
        specialId: patient.specialId,
        role: 'parent'
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    // Update last login
    patient.lastLogin = new Date();
    await patient.save();

    return {
      success: true,
      token,
      user: {
        specialId: patient.specialId,
        childName: patient.childName,
        parentName: patient.parentName,
        role: 'parent'
      }
    };
  }

  // Staff login with password
  async staffLogin(email, password) {
    console.log('[DEBUG] Login attempt for:', email);

    // Find staff by email
    const staff = await Staff.findOne({ email, isActive: true });
    console.log('[DEBUG] Staff found:', staff ? 'Yes' : 'No');

    if (!staff) {
      throw new Error('Invalid email or password');
    }

    console.log('[DEBUG] Stored hash:', staff.password);
    console.log('[DEBUG] Input password:', password);

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, staff.password);
    console.log('[DEBUG] Password valid:', isPasswordValid);

    if (!isPasswordValid) {
      throw new Error('Invalid email or password');
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: staff._id,
        staffId: staff.staffId,
        role: staff.role
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    return {
      success: true,
      token,
      user: {
        staffId: staff.staffId,
        name: staff.name,
        email: staff.email,
        role: staff.role
      }
    };
  }

  // Validate JWT token
  validateToken(token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      return {
        valid: true,
        userId: decoded.userId,
        role: decoded.role,
        specialId: decoded.specialId,
        staffId: decoded.staffId
      };
    } catch (error) {
      return {
        valid: false,
        error: error.message
      };
    }
  }

  // Hash password for staff registration
  async hashPassword(password) {
    const saltRounds = 10;
    return await bcrypt.hash(password, saltRounds);
  }
}

module.exports = new AuthService();
