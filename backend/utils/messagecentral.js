/**
 * MessageCentral SMS OTP Service
 * Documentation: https://www.messagecentral.com
 * 
 * Setup:
 * 1. Sign up at https://www.messagecentral.com
 * 2. Get your Customer ID from dashboard
 * 3. Add credentials to .env file
 */

const axios = require('axios');

const BASE_URL = 'https://cpaas.messagecentral.com';

/**
 * Get authentication token from MessageCentral
 */
const getAuthToken = async () => {
    try {
        const customerId = process.env.MESSAGECENTRAL_CUSTOMER_ID;
        const email = process.env.MESSAGECENTRAL_EMAIL;
        const password = process.env.MESSAGECENTRAL_PASSWORD;

        if (!customerId || !email) {
            console.log('[MessageCentral] Credentials not configured, using console logging');
            return null;
        }

        // Base64 encode the password
        const encodedPassword = Buffer.from(password).toString('base64');

        const response = await axios.get(`${BASE_URL}/auth/v1/authentication/token`, {
            params: {
                customerId,
                email,
                password: encodedPassword,
                scope: 'NEW'
            }
        });

        if (response.data && response.data.token) {
            return response.data.token;
        }

        throw new Error('Failed to get auth token');
    } catch (error) {
        console.error('[MessageCentral] Auth error:', error.message);
        return null;
    }
};

/**
 * Send OTP via MessageCentral
 * @param {string} phoneNumber - Phone number (10 digits)
 * @param {string} otp - 6-digit OTP
 * @returns {Promise<Object>} Result
 */
const sendOTP = async (phoneNumber, otp) => {
    try {
        const token = await getAuthToken();

        if (!token) {
            // Fallback to console logging in development
            console.log(`[DEV] OTP for ${phoneNumber}: ${otp}`);
            return { success: true, method: 'console' };
        }

        const customerId = process.env.MESSAGECENTRAL_CUSTOMER_ID;

        // Format phone number (add country code if not present)
        const formattedPhone = phoneNumber.startsWith('91') ? phoneNumber : `91${phoneNumber}`;

        const response = await axios.post(
            `${BASE_URL}/verification/v2/verification/send`,
            null,
            {
                params: {
                    countryCode: '91',
                    customerId,
                    flowType: 'SMS',
                    mobileNumber: formattedPhone.slice(-10), // Last 10 digits
                    otpLength: 6
                },
                headers: {
                    'authToken': token
                }
            }
        );

        if (response.data && response.data.data) {
            console.log('[MessageCentral] OTP sent successfully');
            return {
                success: true,
                method: 'sms',
                verificationId: response.data.data.verificationId
            };
        }

        throw new Error('Failed to send OTP');
    } catch (error) {
        console.error('[MessageCentral] Send OTP error:', error.response?.data || error.message);
        // Fallback to console
        console.log(`[FALLBACK] OTP for ${phoneNumber}: ${otp}`);
        return { success: true, method: 'console' };
    }
};

/**
 * Verify OTP via MessageCentral
 * @param {string} verificationId - ID from sendOTP response
 * @param {string} otp - User entered OTP
 * @returns {Promise<Object>} Validation result
 */
const verifyOTPWithMessageCentral = async (verificationId, otp) => {
    try {
        const token = await getAuthToken();

        if (!token || !verificationId) {
            // Not using MessageCentral, use local verification
            return { useLocal: true };
        }

        const customerId = process.env.MESSAGECENTRAL_CUSTOMER_ID;

        const response = await axios.get(
            `${BASE_URL}/verification/v2/verification/validateOtp`,
            {
                params: {
                    customerId,
                    verificationId,
                    code: otp
                },
                headers: {
                    'authToken': token
                }
            }
        );

        const status = response.data?.data?.verificationStatus;

        return {
            success: status === 'VERIFICATION_COMPLETED',
            status
        };
    } catch (error) {
        console.error('[MessageCentral] Verify error:', error.response?.data || error.message);
        return { useLocal: true };
    }
};

/**
 * Send SMS message (not OTP, general message)
 * @param {string} phoneNumber - Phone number
 * @param {string} message - Message text
 */
const sendSMS = async (phoneNumber, message) => {
    try {
        const token = await getAuthToken();

        if (!token) {
            console.log(`[DEV] SMS to ${phoneNumber}: ${message}`);
            return { success: true, method: 'console' };
        }

        const customerId = process.env.MESSAGECENTRAL_CUSTOMER_ID;
        const senderId = process.env.MESSAGECENTRAL_SENDER_ID || 'VERIFY';

        const response = await axios.post(
            `${BASE_URL}/sms/v1/message/send`,
            {
                countryCode: '91',
                customerId,
                senderId,
                mobiles: phoneNumber.startsWith('91') ? phoneNumber : `91${phoneNumber}`,
                message,
                type: 'TXN'
            },
            {
                headers: {
                    'authToken': token,
                    'Content-Type': 'application/json'
                }
            }
        );

        return { success: true, method: 'sms', data: response.data };
    } catch (error) {
        console.error('[MessageCentral] SMS error:', error.response?.data || error.message);
        console.log(`[FALLBACK] SMS to ${phoneNumber}: ${message}`);
        return { success: true, method: 'console' };
    }
};

module.exports = {
    sendOTP,
    verifyOTPWithMessageCentral,
    sendSMS,
    getAuthToken
};
