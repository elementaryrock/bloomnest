import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Auth Pages
import { ParentLogin, StaffLogin } from './pages/auth';

// Parent Pages
import { ParentDashboard } from './pages/parent';

// Receptionist Pages
import { ReceptionistDashboard } from './pages/receptionist';

// Therapist Pages
import { TherapistDashboard } from './pages/therapist';

// Admin Pages
import { AdminDashboard } from './pages/admin';

const Unauthorized = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="text-center">
      <h1 className="text-4xl font-bold text-red-600 mb-4">Unauthorized</h1>
      <p className="text-gray-600">You don't have permission to access this page.</p>
    </div>
  </div>
);

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<ParentLogin />} />
            <Route path="/staff/login" element={<StaffLogin />} />
            <Route path="/unauthorized" element={<Unauthorized />} />

            {/* Parent Routes */}
            <Route
              path="/parent/*"
              element={
                <ProtectedRoute allowedRoles={['parent']}>
                  <ParentDashboard />
                </ProtectedRoute>
              }
            />

            {/* Receptionist Routes */}
            <Route
              path="/receptionist/*"
              element={
                <ProtectedRoute allowedRoles={['receptionist', 'admin']}>
                  <ReceptionistDashboard />
                </ProtectedRoute>
              }
            />

            {/* Therapist Routes */}
            <Route
              path="/therapist/*"
              element={
                <ProtectedRoute allowedRoles={['therapist', 'admin']}>
                  <TherapistDashboard />
                </ProtectedRoute>
              }
            />

            {/* Admin Routes */}
            <Route
              path="/admin/*"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />

            {/* Default redirect */}
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>

          <ToastContainer
            position="top-right"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="light"
          />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
