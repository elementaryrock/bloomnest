import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { FiPhone, FiHash, FiArrowRight, FiLoader } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import OTPVerification from './OTPVerification';

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
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-blue-100 p-4">
            <div className="w-full max-w-md">
                {/* Logo/Header */}
                <div className="text-center mb-8">
                    <div className="w-20 h-20 bg-primary-600 rounded-full mx-auto mb-4 flex items-center justify-center">
                        <span className="text-white text-2xl font-bold">MEC</span>
                    </div>
                    <h1 className="text-2xl font-bold text-gray-800">Welcome Back</h1>
                    <p className="text-gray-600 mt-2">Sign in to access your child's therapy portal</p>
                </div>

                {/* Login Card */}
                <div className="bg-white rounded-2xl shadow-xl p-8">
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        {/* Special ID Input */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Special ID
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <FiHash className="text-gray-400" />
                                </div>
                                <input
                                    type="text"
                                    placeholder="e.g., JYCS2025000001"
                                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition ${errors.specialId ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                    {...register('specialId', {
                                        required: 'Special ID is required',
                                        pattern: {
                                            value: /^JYCS\d{10}$/,
                                            message: 'Invalid Special ID format (e.g., JYCS2025000001)'
                                        }
                                    })}
                                />
                            </div>
                            {errors.specialId && (
                                <p className="mt-1 text-sm text-red-600">{errors.specialId.message}</p>
                            )}
                        </div>

                        {/* Phone Number Input */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Registered Phone Number
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <FiPhone className="text-gray-400" />
                                </div>
                                <input
                                    type="tel"
                                    placeholder="10-digit phone number"
                                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition ${errors.phoneNumber ? 'border-red-500' : 'border-gray-300'
                                        }`}
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
                                <p className="mt-1 text-sm text-red-600">{errors.phoneNumber.message}</p>
                            )}
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-primary-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
                    <div className="mt-6 text-center">
                        <p className="text-gray-600">
                            Staff member?{' '}
                            <Link to="/staff/login" className="text-primary-600 font-medium hover:text-primary-700">
                                Login here
                            </Link>
                        </p>
                    </div>
                </div>

                {/* Footer */}
                <p className="text-center mt-6 text-sm text-gray-500">
                    Therapy Unit Booking System • Marian Engineering College
                </p>
            </div>
        </div>
    );
};

export default ParentLogin;
