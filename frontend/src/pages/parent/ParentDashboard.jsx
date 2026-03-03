import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import ParentDashboardHome from './ParentDashboardHome';
import BookingPage from './BookingPage';
import SessionHistory from './SessionHistory';
import NeuralNarrative from './NeuralNarrative';
import SkillSprout from './SkillSprout';
import TherapyRipple from './TherapyRipple';
import ParentLayout from './ParentLayout';
import ParentProfile from './ParentProfile';

const ParentDashboard = () => {
    const { user } = useAuth();

    return (
        <ParentLayout>
            <Routes>
                <Route path="dashboard" element={<ParentDashboardHome />} />
                <Route path="book" element={<BookingPage />} />
                <Route path="history" element={<SessionHistory />} />
                <Route path="neural-narrative" element={<NeuralNarrative />} />
                <Route path="skill-sprout" element={<SkillSprout />} />
                <Route path="therapy-ripple" element={<TherapyRipple />} />
                <Route path="profile" element={<ParentProfile />} />
                <Route path="/" element={<Navigate to="dashboard" replace />} />
            </Routes>
        </ParentLayout>
    );
};

export default ParentDashboard;

