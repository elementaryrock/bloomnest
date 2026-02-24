import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import TherapistLayout from './TherapistLayout';
import TherapistDashboardHome from './TherapistDashboardHome';
import TherapistSchedule from './TherapistSchedule';
import TherapistSessions from './TherapistSessions';
import TherapistAssessments from './TherapistAssessments';
import SessionNotes from './SessionNotes';
import TherapistSkillSprout from './TherapistSkillSprout';

const TherapistDashboard = () => {
    return (
        <TherapistLayout>
            <Routes>
                <Route path="dashboard" element={<TherapistDashboardHome />} />
                <Route path="schedule" element={<TherapistSchedule />} />
                <Route path="sessions" element={<TherapistSessions />} />
                <Route path="assessments" element={<TherapistAssessments />} />
                <Route path="session/:sessionId/notes" element={<SessionNotes />} />
                <Route path="skill-sprout" element={<TherapistSkillSprout />} />
                <Route path="/" element={<Navigate to="dashboard" replace />} />
                <Route path="*" element={<Navigate to="dashboard" replace />} />
            </Routes>
        </TherapistLayout>
    );
};

export default TherapistDashboard;
