import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AdminLayout from './AdminLayout';
import AdminDashboardHome from './AdminDashboardHome';
import StaffManagement from './StaffManagement';
import ScheduleConfig from './ScheduleConfig';

const AdminDashboard = () => {
    return (
        <AdminLayout>
            <Routes>
                <Route path="dashboard" element={<AdminDashboardHome />} />
                <Route path="staff" element={<StaffManagement />} />
                <Route path="schedule" element={<ScheduleConfig />} />
                <Route path="reports" element={<AdminDashboardHome />} />
                <Route path="settings" element={<AdminDashboardHome />} />
                <Route path="/" element={<Navigate to="dashboard" replace />} />
            </Routes>
        </AdminLayout>
    );
};

export default AdminDashboard;

