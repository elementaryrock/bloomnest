import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ReceptionistLayout from './ReceptionistLayout';
import ReceptionistDashboardHome from './ReceptionistDashboardHome';
import PatientRegistration from './PatientRegistration';
import PatientSearch from './PatientSearch';

const ReceptionistDashboard = () => {
    return (
        <ReceptionistLayout>
            <Routes>
                <Route path="dashboard" element={<ReceptionistDashboardHome />} />
                <Route path="register" element={<PatientRegistration />} />
                <Route path="search" element={<PatientSearch />} />
                <Route path="patients" element={<PatientSearch />} />
                <Route path="/" element={<Navigate to="dashboard" replace />} />
            </Routes>
        </ReceptionistLayout>
    );
};

export default ReceptionistDashboard;
