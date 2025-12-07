import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Protected Route wrapper component
 * Redirects to login if user is not authenticated
 * @param {React.ReactNode} children - Child components to render
 * @param {string|string[]} allowedRoles - Roles allowed to access this route
 */
const ProtectedRoute = ({ children, allowedRoles = [] }) => {
    const { isAuthenticated, loading, hasRole } = useAuth();
    const location = useLocation();

    // Show loading state while checking auth
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    // Redirect to login if not authenticated
    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // Check role permissions if specified
    if (allowedRoles.length > 0 && !hasRole(allowedRoles)) {
        // Redirect to appropriate dashboard based on user role
        return <Navigate to="/unauthorized" replace />;
    }

    return children;
};

export default ProtectedRoute;
