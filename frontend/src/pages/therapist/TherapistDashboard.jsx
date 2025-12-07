import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import TherapistLayout from './TherapistLayout';
import TherapistDashboardHome from './TherapistDashboardHome';
import SessionNotes from './SessionNotes';

const TherapistDashboard = () => {
    return (
        <TherapistLayout>
            <Routes>
                <Route path="dashboard" element={<TherapistDashboardHome />} />
                <Route path="schedule" element={<TherapistDashboardHome />} />
                <Route path="session/:sessionId/notes" element={<SessionNotes />} />
                <Route path="sessions" element={<TherapistDashboardHome />} />
                <Route path="/" element={<Navigate to="dashboard" replace />} />
            </Routes>
        </TherapistLayout>
    );
};

export default TherapistDashboard;
