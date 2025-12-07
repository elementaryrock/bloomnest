const crypto = require('crypto');

// In-memory OTP store (use Redis in production)
const otpStore = new Map();

// OTP Configuration
const OTP_LENGTH = 6;
const OTP_EXPIRY_MINUTES = 5;
const MAX_ATTEMPTS = 3;

/**
 * Generate a random OTP
 * @returns {string} 6-digit OTP
 */
const generateOTP = () => {
    return crypto.randomInt(100000, 999999).toString();
};

/**
 * Store OTP for a phone number
 * @param {string} phone - Phone number
 * @param {string} specialId - Patient special ID
 * @returns {string} Generated OTP
 */
const createOTP = (phone, specialId) => {
    const otp = generateOTP();
    const expiresAt = Date.now() + (OTP_EXPIRY_MINUTES * 60 * 1000);

    const key = `${specialId}_${phone}`;
    otpStore.set(key, {
        otp,
        expiresAt,
        attempts: 0,
        createdAt: Date.now()
    });

    // Clean up expired OTPs periodically
    cleanupExpiredOTPs();

    console.log(`[DEV] OTP for ${phone}: ${otp}`); // Remove in production

    return otp;
};

/**
 * Verify OTP
 * @param {string} phone - Phone number
 * @param {string} specialId - Patient special ID
 * @param {string} inputOTP - User-provided OTP
 * @returns {Object} Verification result
 */
const verifyOTP = (phone, specialId, inputOTP) => {
    const key = `${specialId}_${phone}`;
    const stored = otpStore.get(key);

    if (!stored) {
        return { valid: false, error: 'OTP not found. Please request a new one.' };
    }

    // Check expiry
    if (Date.now() > stored.expiresAt) {
        otpStore.delete(key);
        return { valid: false, error: 'OTP has expired. Please request a new one.' };
    }

    // Check attempts
    if (stored.attempts >= MAX_ATTEMPTS) {
        otpStore.delete(key);
        return { valid: false, error: 'Maximum attempts exceeded. Please request a new OTP.' };
    }

    // Verify OTP
    if (stored.otp !== inputOTP) {
        stored.attempts += 1;
        otpStore.set(key, stored);
        return {
            valid: false,
            error: `Invalid OTP. ${MAX_ATTEMPTS - stored.attempts} attempts remaining.`
        };
    }

    // OTP is valid - delete it
    otpStore.delete(key);
    return { valid: true };
};

/**
 * Send OTP via SMS (using Twilio)
 * @param {string} phone - Phone number
 * @param {string} otp - OTP to send
 * @returns {Promise<Object>} Send result
 */
const sendOTPviaSMS = async (phone, otp) => {
    // Check if Twilio credentials are configured
    if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN) {
        console.log('[DEV] Twilio not configured. OTP:', otp);
        return { success: true, method: 'console' };
    }

    try {
        const twilio = require('twilio')(
            process.env.TWILIO_ACCOUNT_SID,
            process.env.TWILIO_AUTH_TOKEN
        );

        const formattedPhone = phone.startsWith('+') ? phone : `+91${phone}`;

        await twilio.messages.create({
            body: `Your Therapy Unit login OTP is: ${otp}. Valid for 5 minutes. Do not share.`,
            from: process.env.TWILIO_PHONE_NUMBER,
            to: formattedPhone
        });

        return { success: true, method: 'sms' };
    } catch (error) {
        console.error('SMS send error:', error);
        // Return success anyway for dev, log the OTP
        console.log('[DEV] SMS failed. OTP:', otp);
        return { success: true, method: 'console' };
    }
};

/**
 * Clean up expired OTPs
 */
const cleanupExpiredOTPs = () => {
    const now = Date.now();
    for (const [key, value] of otpStore.entries()) {
        if (now > value.expiresAt) {
            otpStore.delete(key);
        }
    }
};

/**
 * Check if OTP was recently sent (rate limiting)
 * @param {string} phone - Phone number
 * @param {string} specialId - Patient special ID
 * @returns {Object} Rate limit check result
 */
const checkRateLimit = (phone, specialId) => {
    const key = `${specialId}_${phone}`;
    const stored = otpStore.get(key);

    if (stored) {
        const timeSinceCreation = Date.now() - stored.createdAt;
        const cooldownMs = 30000; // 30 seconds

        if (timeSinceCreation < cooldownMs) {
            const waitSeconds = Math.ceil((cooldownMs - timeSinceCreation) / 1000);
            return {
                allowed: false,
                waitSeconds,
                error: `Please wait ${waitSeconds} seconds before requesting a new OTP.`
            };
        }
    }

    return { allowed: true };
};

module.exports = {
    createOTP,
    verifyOTP,
    sendOTPviaSMS,
    checkRateLimit,
    generateOTP
};
