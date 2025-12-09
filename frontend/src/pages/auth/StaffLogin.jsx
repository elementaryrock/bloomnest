import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { FiMail, FiLock, FiArrowRight, FiLoader, FiEye, FiEyeOff } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';

const StaffLogin = () => {
    const navigate = useNavigate();
    const { loginStaff } = useAuth();
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors }
    } = useForm();

    const onSubmit = async (data) => {
        setLoading(true);
        try {
            const result = await loginStaff(data.email, data.password);
            if (result.success) {
                toast.success('Login successful!');
                // Navigate based on role
                switch (result.role) {
                    case 'receptionist':
                        navigate('/receptionist/dashboard');
                        break;
                    case 'therapist':
                        navigate('/therapist/dashboard');
                        break;
                    case 'admin':
                        navigate('/admin/dashboard');
                        break;
                    default:
                        navigate('/');
                }
            } else {
                toast.error(result.error || 'Login failed');
            }
        } catch (error) {
            toast.error('Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-gradient-bg min-h-screen flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* Logo/Header */}
                <div className="text-center mb-8 animate-fadeIn">
                    <div className="logo-circle">
                        <span className="text-white text-2xl font-bold">MEC</span>
                    </div>
                    <h1 className="text-2xl font-bold text-gray-800 mt-4">Staff Login</h1>
                    <p className="text-gray-600 mt-2">Sign in to access the management portal</p>
                </div>

                {/* Login Card */}
                <div className="login-card p-8 animate-fadeIn animate-delay-1">
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                        {/* Email Input */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Email Address
                            </label>
                            <div className="input-group relative">
                                <FiMail className="input-icon text-lg" />
                                <input
                                    type="email"
                                    placeholder="staff@example.com"
                                    className={`login-input ${errors.email ? 'error' : ''}`}
                                    {...register('email', {
                                        required: 'Email is required',
                                        pattern: {
                                            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                            message: 'Invalid email address'
                                        }
                                    })}
                                />
                            </div>
                            {errors.email && (
                                <p className="mt-1.5 text-sm text-red-600">{errors.email.message}</p>
                            )}
                        </div>

                        {/* Password Input */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Password
                            </label>
                            <div className="input-group relative">
                                <FiLock className="input-icon text-lg" />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="Enter your password"
                                    className={`login-input pr-12 ${errors.password ? 'error' : ''}`}
                                    {...register('password', {
                                        required: 'Password is required',
                                        minLength: {
                                            value: 6,
                                            message: 'Password must be at least 6 characters'
                                        }
                                    })}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                    {showPassword ? <FiEyeOff className="text-lg" /> : <FiEye className="text-lg" />}
                                </button>
                            </div>
                            {errors.password && (
                                <p className="mt-1.5 text-sm text-red-600">{errors.password.message}</p>
                            )}
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="login-btn-primary mt-6"
                        >
                            {loading ? (
                                <>
                                    <FiLoader className="animate-spin" />
                                    Signing in...
                                </>
                            ) : (
                                <>
                                    Sign In
                                    <FiArrowRight />
                                </>
                            )}
                        </button>
                    </form>

                    {/* Parent Login Link */}
                    <div className="mt-6 text-center">
                        <p className="text-gray-600">
                            Parent?{' '}
                            <Link to="/login" className="login-link">
                                Login with OTP
                            </Link>
                        </p>
                    </div>
                </div>

                {/* Role Info */}
                <div className="info-box mt-6 animate-fadeIn animate-delay-2">
                    <p className="text-sm text-blue-800">
                        <strong>Staff roles:</strong><br />
                        • Receptionists: Patient registration & management<br />
                        • Therapists: Session management & assessments<br />
                        • Admins: System overview & configuration
                    </p>
                </div>

                {/* Footer */}
                <p className="text-center mt-6 text-sm text-gray-500 animate-fadeIn animate-delay-3">
                    Therapy Unit Booking System • Marian Engineering College
                </p>
            </div>
        </div>
    );
};

export default StaffLogin;
