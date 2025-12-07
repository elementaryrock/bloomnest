import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiUsers, FiUserPlus, FiCalendar, FiClock, FiArrowRight } from 'react-icons/fi';
import api from '../../services/api';

const StatCard = ({ icon: Icon, label, value, color, onClick }) => {
    const colorClasses = {
        green: 'bg-green-100 text-green-600',
        blue: 'bg-blue-100 text-blue-600',
        purple: 'bg-purple-100 text-purple-600',
        amber: 'bg-amber-100 text-amber-600'
    };

    return (
        <div
            onClick={onClick}
            className={`bg-white rounded-xl shadow-md p-6 ${onClick ? 'cursor-pointer hover:shadow-lg transition' : ''}`}
        >
            <div className={`w-12 h-12 rounded-lg ${colorClasses[color]} flex items-center justify-center mb-4`}>
                <Icon size={24} />
            </div>
            <p className="text-2xl font-bold text-gray-800">{value}</p>
            <p className="text-sm text-gray-500">{label}</p>
        </div>
    );
};

const RecentPatientRow = ({ patient, onClick }) => (
    <div
        onClick={onClick}
        className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition cursor-pointer"
    >
        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
            {patient.photoUrl ? (
                <img src={patient.photoUrl} alt="" className="w-full h-full rounded-full object-cover" />
            ) : (
                <span className="text-gray-500 font-medium">{patient.childName?.charAt(0)}</span>
            )}
        </div>
        <div className="flex-1">
            <p className="font-medium text-gray-800">{patient.childName}</p>
            <p className="text-sm text-gray-500">{patient.specialId}</p>
        </div>
        <div className="text-right">
            <p className="text-sm text-gray-600">{patient.diagnosis?.join(', ')}</p>
            <p className="text-xs text-gray-400">
                {new Date(patient.registrationDate).toLocaleDateString('en-IN')}
            </p>
        </div>
        <FiArrowRight className="text-gray-400" />
    </div>
);

const ReceptionistDashboardHome = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        totalPatients: 0,
        todayRegistrations: 0,
        todayAppointments: 0,
        pendingCheckIns: 0
    });
    const [recentPatients, setRecentPatients] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            // Fetch patients
            const patientsRes = await api.get('/patients?limit=5');
            if (patientsRes.data.success) {
                setRecentPatients(patientsRes.data.data || []);
                setStats(prev => ({
                    ...prev,
                    totalPatients: patientsRes.data.pagination?.total || 0
                }));
            }

            // Fetch today's stats
            const statsRes = await api.get('/admin/stats');
            if (statsRes.data.success) {
                setStats(prev => ({
                    ...prev,
                    todayAppointments: statsRes.data.data?.todayBookings || 0
                }));
            }
        } catch (error) {
            console.log('Using mock data');
            setStats({
                totalPatients: 156,
                todayRegistrations: 3,
                todayAppointments: 12,
                pendingCheckIns: 4
            });
            setRecentPatients([
                { childName: 'Rahul Kumar', specialId: 'JYCS2025000001', diagnosis: ['ASD'], registrationDate: new Date() },
                { childName: 'Priya Sharma', specialId: 'JYCS2025000002', diagnosis: ['SLD'], registrationDate: new Date() },
                { childName: 'Arjun Nair', specialId: 'JYCS2025000003', diagnosis: ['CP'], registrationDate: new Date() },
            ]);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Reception Dashboard</h1>
                    <p className="text-gray-600">Manage patient registrations and check-ins</p>
                </div>
                <button
                    onClick={() => navigate('/receptionist/register')}
                    className="flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 transition"
                >
                    <FiUserPlus />
                    Register New Patient
                </button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    icon={FiUsers}
                    label="Total Patients"
                    value={stats.totalPatients}
                    color="green"
                    onClick={() => navigate('/receptionist/patients')}
                />
                <StatCard
                    icon={FiUserPlus}
                    label="Today's Registrations"
                    value={stats.todayRegistrations}
                    color="blue"
                />
                <StatCard
                    icon={FiCalendar}
                    label="Today's Appointments"
                    value={stats.todayAppointments}
                    color="purple"
                />
                <StatCard
                    icon={FiClock}
                    label="Pending Check-ins"
                    value={stats.pendingCheckIns}
                    color="amber"
                />
            </div>

            {/* Recent Patients */}
            <div className="bg-white rounded-xl shadow-md p-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-800">Recent Registrations</h3>
                    <button
                        onClick={() => navigate('/receptionist/patients')}
                        className="text-green-600 text-sm font-medium hover:text-green-700"
                    >
                        View All
                    </button>
                </div>

                {recentPatients.length > 0 ? (
                    <div className="space-y-3">
                        {recentPatients.map((patient, index) => (
                            <RecentPatientRow
                                key={index}
                                patient={patient}
                                onClick={() => navigate(`/receptionist/patient/${patient.specialId}`)}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-8 text-gray-500">
                        <FiUsers className="mx-auto mb-2" size={32} />
                        <p>No patients registered yet</p>
                    </div>
                )}
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                    onClick={() => navigate('/receptionist/register')}
                    className="flex items-center gap-4 p-6 bg-white rounded-xl shadow-md hover:shadow-lg transition"
                >
                    <div className="w-14 h-14 bg-green-100 rounded-lg flex items-center justify-center">
                        <FiUserPlus className="text-green-600" size={28} />
                    </div>
                    <div className="text-left">
                        <p className="font-semibold text-gray-800">Register New Patient</p>
                        <p className="text-sm text-gray-500">Add a new patient to the system</p>
                    </div>
                </button>

                <button
                    onClick={() => navigate('/receptionist/search')}
                    className="flex items-center gap-4 p-6 bg-white rounded-xl shadow-md hover:shadow-lg transition"
                >
                    <div className="w-14 h-14 bg-blue-100 rounded-lg flex items-center justify-center">
                        <FiSearch className="text-blue-600" size={28} />
                    </div>
                    <div className="text-left">
                        <p className="font-semibold text-gray-800">Search Patients</p>
                        <p className="text-sm text-gray-500">Find and manage existing patients</p>
                    </div>
                </button>
            </div>
        </div>
    );
};

export default ReceptionistDashboardHome;
