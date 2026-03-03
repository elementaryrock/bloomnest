import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { FiPhone, FiHash, FiArrowRight, FiLoader } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import OTPVerification from './OTPVerification';
import MosaicLoginLayout from '../../components/MosaicLoginLayout';

const ParentLogin = () => {
    const navigate = useNavigate();
    const { requestOTP } = useAuth();
    const [showOTP, setShowOTP] = useState(false);
    const [credentials, setCredentials] = useState({ specialId: '', phoneNumber: '' });
    const [loading, setLoading] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors }
    } = useForm();

    const onSubmit = async (data) => {
        setLoading(true);
        try {
            const result = await requestOTP(data.specialId, data.phoneNumber);
            if (result.success) {
                setCredentials({ specialId: data.specialId, phoneNumber: data.phoneNumber });
                setShowOTP(true);
                toast.success('OTP sent to your registered phone number');
            } else {
                toast.error(result.error || 'Failed to send OTP');
            }
        } catch (error) {
            toast.error('Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleOTPSuccess = () => {
        toast.success('Login successful!');
        navigate('/parent/dashboard');
    };

    const handleBackToLogin = () => {
        setShowOTP(false);
        setCredentials({ specialId: '', phoneNumber: '' });
    };

    if (showOTP) {
        return (
            <OTPVerification
                specialId={credentials.specialId}
                phoneNumber={credentials.phoneNumber}
                onSuccess={handleOTPSuccess}
                onBack={handleBackToLogin}
            />
        );
    }

    return (
        <MosaicLoginLayout
            tagline="Therapy Unit"
            taglineHighlight="Booking System"
            taglineDescription="Bloomnest — streamlined therapy session management for parents, therapists, and staff."
        >
            {/* Right panel logo icon */}
            <div className="w-12 h-12 rounded-xl overflow-hidden shadow-soft ring-4 ring-amber-50 mx-auto mb-6">
                <img src="/logos/BloomNest-glass.png" alt="Bloomnest Logo" className="w-full h-full object-cover" />
            </div>

            <h1>Welcome Back!</h1>
            <p className="login-subtitle">Login to Your Account</p>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" style={{ maxWidth: '380px', margin: '0 auto', width: '100%' }}>
                {/* Special ID Input */}
                <div>
                    <div className="input-group relative">
                        <FiHash className="input-icon text-lg" />
                        <input
                            type="text"
                            placeholder="e.g., MEC2025000001"
                            className={`login-input ${errors.specialId ? 'error' : ''}`}
                            {...register('specialId', {
                                required: 'Special ID is required',
                                pattern: {
                                    value: /^MEC\d{10}$/,
                                    message: 'Invalid Special ID format (e.g., MEC2025000001)'
                                }
                            })}
                        />
                    </div>
                    {errors.specialId && (
                        <p className="mt-1.5 text-sm text-red-600">{errors.specialId.message}</p>
                    )}
                </div>

                {/* Phone Number Input */}
                <div>
                    <div className="input-group relative">
                        <FiPhone className="input-icon text-lg" />
                        <input
                            type="tel"
                            placeholder="10-digit phone number"
                            className={`login-input ${errors.phoneNumber ? 'error' : ''}`}
                            {...register('phoneNumber', {
                                required: 'Phone number is required',
                                pattern: {
                                    value: /^\d{10}$/,
                                    message: 'Please enter a valid 10-digit phone number'
                                }
                            })}
                        />
                    </div>
                    {errors.phoneNumber && (
                        <p className="mt-1.5 text-sm text-red-600">{errors.phoneNumber.message}</p>
                    )}
                </div>

                {/* Submit Button */}
                <button
                    type="submit"
                    disabled={loading}
                    className="login-btn-primary mt-4"
                >
                    {loading ? (
                        <>
                            <FiLoader className="animate-spin" />
                            Sending OTP...
                        </>
                    ) : (
                        <>
                            Get OTP
                            <FiArrowRight />
                        </>
                    )}
                </button>
            </form>

            {/* Staff Login Link */}
            <div className="mt-5 text-center">
                <p className="text-gray-600 text-sm">
                    Staff member?{' '}
                    <Link to="/staff/login" className="login-link">
                        Login here
                    </Link>
                </p>
            </div>
        </MosaicLoginLayout>
    );
};

export default ParentLogin;
