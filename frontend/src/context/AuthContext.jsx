import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    // Initialize auth state from localStorage
    useEffect(() => {
        const token = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');

        if (token && storedUser) {
            try {
                setUser(JSON.parse(storedUser));
                setIsAuthenticated(true);
            } catch (e) {
                // Invalid stored user data
                localStorage.removeItem('token');
                localStorage.removeItem('user');
            }
        }
        setLoading(false);
    }, []);

    // Login for parents (OTP-based)
    const loginWithOTP = async (specialId, otp) => {
        try {
            const response = await api.post('/auth/parent/verify-otp', { specialId, otp });
            console.log('[DEBUG] Verify OTP response:', response.data);

            if (response.data.success) {
                // Token and user are at response.data level
                const { token, user: userData } = response.data;
                localStorage.setItem('token', token);
                localStorage.setItem('user', JSON.stringify(userData));
                setUser(userData);
                setIsAuthenticated(true);
                return { success: true };
            }
            return { success: false, error: response.data.error?.message };
        } catch (error) {
            console.error('[DEBUG] Verify OTP error:', error);
            return {
                success: false,
                error: error.response?.data?.error?.message || 'Login failed'
            };
        }
    };

    // Login for staff (email/password)
    const loginStaff = async (email, password) => {
        try {
            const response = await api.post('/auth/staff/login', { email, password });
            console.log('[DEBUG] Login response:', response.data);

            if (response.data.success) {
                // Token and user are at response.data level, not response.data.data
                const { token, user: userData } = response.data;
                localStorage.setItem('token', token);
                localStorage.setItem('user', JSON.stringify(userData));
                setUser(userData);
                setIsAuthenticated(true);
                return { success: true, role: userData.role };
            }
            return { success: false, error: response.data.error?.message };
        } catch (error) {
            console.error('[DEBUG] Login error:', error);
            return {
                success: false,
                error: error.response?.data?.error?.message || 'Login failed'
            };
        }
    };

    // Request OTP
    const requestOTP = async (specialId, phoneNumber) => {
        try {
            const response = await api.post('/auth/parent/send-otp', { specialId, phoneNumber });
            return {
                success: response.data.success,
                error: response.data.error?.message
            };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.error?.message || 'Failed to send OTP'
            };
        }
    };

    // Logout
    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        setIsAuthenticated(false);
    };

    // Check if user has specific role
    const hasRole = (role) => {
        if (!user) return false;
        if (Array.isArray(role)) {
            return role.includes(user.role);
        }
        return user.role === role;
    };

    const value = {
        user,
        loading,
        isAuthenticated,
        loginWithOTP,
        loginStaff,
        requestOTP,
        logout,
        hasRole
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;
