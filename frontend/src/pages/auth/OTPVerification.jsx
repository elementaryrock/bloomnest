import React, { useState, useRef, useEffect } from 'react';
import { FiArrowLeft, FiLoader, FiRefreshCw } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import MosaicLoginLayout from '../../components/MosaicLoginLayout';

const OTPVerification = ({ specialId, phoneNumber, onSuccess, onBack }) => {
    const { loginWithOTP, requestOTP } = useAuth();
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [loading, setLoading] = useState(false);
    const [resendTimer, setResendTimer] = useState(30);
    const [canResend, setCanResend] = useState(false);
    const [attempts, setAttempts] = useState(0);
    const inputRefs = useRef([]);

    // Countdown timer for resend
    useEffect(() => {
        if (resendTimer > 0) {
            const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
            return () => clearTimeout(timer);
        } else {
            setCanResend(true);
        }
    }, [resendTimer]);

    // Focus first input on mount
    useEffect(() => {
        inputRefs.current[0]?.focus();
    }, []);

    const handleChange = (index, value) => {
        // Only allow numbers
        if (!/^\d*$/.test(value)) return;

        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        // Auto-focus next input
        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }

        // Auto-submit when all digits entered
        if (newOtp.every(digit => digit !== '') && newOtp.join('').length === 6) {
            handleVerify(newOtp.join(''));
        }
    };

    const handleKeyDown = (index, e) => {
        // Handle backspace
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handlePaste = (e) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
        const newOtp = [...otp];
        pastedData.split('').forEach((digit, index) => {
            if (index < 6) newOtp[index] = digit;
        });
        setOtp(newOtp);

        if (newOtp.every(digit => digit !== '')) {
            handleVerify(newOtp.join(''));
        }
    };

    const handleVerify = async (otpCode) => {
        if (loading) return;

        setLoading(true);
        try {
            const result = await loginWithOTP(specialId, otpCode);
            if (result.success) {
                onSuccess();
            } else {
                setAttempts(prev => prev + 1);
                toast.error(result.error || 'Invalid OTP. Please try again.');
                setOtp(['', '', '', '', '', '']);
                inputRefs.current[0]?.focus();

                if (attempts >= 2) {
                    toast.warning('Maximum attempts reached. Please request a new OTP.');
                }
            }
        } catch (error) {
            toast.error('Verification failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        if (!canResend) return;

        try {
            const result = await requestOTP(specialId, phoneNumber);
            if (result.success) {
                toast.success('OTP resent successfully');
                setResendTimer(30);
                setCanResend(false);
                setAttempts(0);
                setOtp(['', '', '', '', '', '']);
                inputRefs.current[0]?.focus();
            } else {
                toast.error(result.error || 'Failed to resend OTP');
            }
        } catch (error) {
            toast.error('Failed to resend OTP');
        }
    };

    // Mask phone number for display
    const maskedPhone = phoneNumber
        ? `******${phoneNumber.slice(-4)}`
        : '';

    return (
        <MosaicLoginLayout
            tagline="Secure OTP"
            taglineHighlight="Verification"
            taglineDescription="One-time password verification ensures secure access to your therapy portal."
        >
            {/* Right panel logo icon */}
            <div className="w-12 h-12 rounded-xl overflow-hidden shadow-soft ring-4 ring-amber-50 mx-auto mb-6">
                <img src="/logos/BloomNest-glass.png" alt="Bloomnest Logo" className="w-full h-full object-cover" />
            </div>

            <h1>Verify OTP</h1>
            <p className="login-subtitle">
                Enter the 6-digit code sent to {maskedPhone}
            </p>

            <div style={{ maxWidth: '380px', margin: '0 auto', width: '100%' }}>
                {/* Back Button */}
                <button
                    onClick={onBack}
                    className="flex items-center text-gray-500 hover:text-blue-600 mb-6 transition-colors font-medium text-sm"
                >
                    <FiArrowLeft className="mr-2" />
                    Back to login
                </button>

                {/* OTP Inputs */}
                <div className="flex justify-center gap-3 mb-6">
                    {otp.map((digit, index) => (
                        <input
                            key={index}
                            ref={el => inputRefs.current[index] = el}
                            type="text"
                            inputMode="numeric"
                            maxLength={1}
                            value={digit}
                            onChange={e => handleChange(index, e.target.value)}
                            onKeyDown={e => handleKeyDown(index, e)}
                            onPaste={handlePaste}
                            className={`otp-input ${digit ? 'filled' : ''} ${loading ? 'opacity-50' : ''}`}
                            disabled={loading}
                        />
                    ))}
                </div>

                {/* Loading indicator */}
                {loading && (
                    <div className="flex items-center justify-center text-blue-600 mb-4">
                        <FiLoader className="animate-spin mr-2" />
                        Verifying...
                    </div>
                )}

                {/* Attempts indicator */}
                {attempts > 0 && (
                    <p className="text-center text-sm text-amber-600 mb-4">
                        {3 - attempts} attempt(s) remaining
                    </p>
                )}

                {/* Resend OTP */}
                <div className="text-center">
                    {canResend ? (
                        <button
                            onClick={handleResend}
                            className="flex items-center justify-center mx-auto text-blue-600 hover:text-blue-700 font-medium transition-colors"
                        >
                            <FiRefreshCw className="mr-2" />
                            Resend OTP
                        </button>
                    ) : (
                        <p className="text-gray-500">
                            Resend OTP in <span className="font-semibold text-blue-600">{resendTimer}s</span>
                        </p>
                    )}
                </div>

                {/* Instructions */}
                <div className="info-box mt-6">
                    <p className="text-sm text-blue-800">
                        <strong>Didn't receive the code?</strong><br />
                        Make sure your phone number is correct and check your SMS inbox.
                        If you still don't receive it, try resending after the timer expires.
                    </p>
                </div>
            </div>
        </MosaicLoginLayout>
    );
};

export default OTPVerification;
