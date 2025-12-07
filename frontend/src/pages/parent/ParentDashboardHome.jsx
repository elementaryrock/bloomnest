import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiCalendar, FiClock, FiFileText, FiPlus, FiChevronRight } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

// Child Info Card Component
const ChildInfoCard = ({ patient }) => {
    return (
        <div className="bg-white rounded-xl shadow-md p-6 flex flex-col md:flex-row gap-6">
            {/* Photo */}
            <div className="flex-shrink-0">
                <div className="w-24 h-24 rounded-xl bg-gray-200 overflow-hidden">
                    {patient?.photoUrl ? (
                        <img
                            src={patient.photoUrl}
                            alt={patient.childName}
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400 text-3xl font-bold">
                            {patient?.childName?.charAt(0) || 'C'}
                        </div>
                    )}
                </div>
            </div>

            {/* Info */}
            <div className="flex-1">
                <div className="flex items-start justify-between mb-2">
                    <h2 className="text-xl font-bold text-gray-800">{patient?.childName || 'Child Name'}</h2>
                    <span className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm font-medium">
                        {patient?.specialId || 'JYCS2025000000'}
                    </span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                    <div>
                        <p className="text-xs text-gray-500 uppercase">Age</p>
                        <p className="font-semibold text-gray-800">{patient?.age || '-'} years</p>
                    </div>
                    <div>
                        <p className="text-xs text-gray-500 uppercase">Gender</p>
                        <p className="font-semibold text-gray-800">{patient?.gender || '-'}</p>
                    </div>
                    <div>
                        <p className="text-xs text-gray-500 uppercase">Diagnosis</p>
                        <p className="font-semibold text-gray-800">
                            {patient?.diagnosis?.join(', ') || '-'}
                        </p>
                    </div>
                    <div>
                        <p className="text-xs text-gray-500 uppercase">Severity</p>
                        <p className="font-semibold text-gray-800">{patient?.severity || '-'}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Statistics Card Component
const StatCard = ({ icon: Icon, label, value, color = 'primary' }) => {
    const colorClasses = {
        primary: 'bg-primary-100 text-primary-600',
        green: 'bg-green-100 text-green-600',
        purple: 'bg-purple-100 text-purple-600',
        amber: 'bg-amber-100 text-amber-600'
    };

    return (
        <div className="bg-white rounded-xl shadow-md p-6">
            <div className={`w-12 h-12 rounded-lg ${colorClasses[color]} flex items-center justify-center mb-4`}>
                <Icon size={24} />
            </div>
            <p className="text-2xl font-bold text-gray-800">{value}</p>
            <p className="text-sm text-gray-500">{label}</p>
        </div>
    );
};

// Upcoming Appointment Card
const AppointmentCard = ({ appointment }) => {
    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('en-IN', {
            weekday: 'short',
            day: 'numeric',
            month: 'short'
        });
    };

    return (
        <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
            <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                <FiCalendar className="text-primary-600" />
            </div>
            <div className="flex-1">
                <p className="font-medium text-gray-800">{appointment.therapyType}</p>
                <p className="text-sm text-gray-500">
                    {formatDate(appointment.date)} • {appointment.timeSlot}
                </p>
            </div>
            <FiChevronRight className="text-gray-400" />
        </div>
    );
};

const ParentDashboardHome = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [patient, setPatient] = useState(null);
    const [stats, setStats] = useState({
        completedSessions: 0,
        upcomingSessions: 0,
        lastAssessment: null
    });
    const [upcomingAppointments, setUpcomingAppointments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            // Fetch patient info
            if (user?.specialId) {
                try {
                    const patientRes = await api.get(`/patients/${user.specialId}`);
                    if (patientRes.data.success) {
                        setPatient(patientRes.data.data);
                    }
                } catch (e) {
                    // Use user data as fallback
                    setPatient({
                        childName: user?.childName || 'Demo Child',
                        specialId: user?.specialId,
                        age: 5,
                        gender: 'Male',
                        diagnosis: ['ASD'],
                        severity: 'Mild'
                    });
                }
            }

            // Fetch all bookings using my-bookings endpoint
            try {
                const bookingsRes = await api.get('/bookings/my-bookings');
                if (bookingsRes.data.success) {
                    const allBookings = bookingsRes.data.data || [];

                    // Filter for upcoming appointments (date >= today and status = confirmed)
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);

                    const upcoming = allBookings.filter(b => {
                        const bookingDate = new Date(b.date);
                        return bookingDate >= today && b.status === 'confirmed';
                    }).sort((a, b) => new Date(a.date) - new Date(b.date));

                    // Filter for completed sessions
                    const completed = allBookings.filter(b => b.status === 'completed');

                    setUpcomingAppointments(upcoming);
                    setStats(prev => ({
                        ...prev,
                        upcomingSessions: upcoming.length,
                        completedSessions: completed.length
                    }));
                }
            } catch (e) {
                console.log('No bookings found');
            }
        } catch (error) {
            console.error('Failed to fetch dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatLastAssessment = (date) => {
        if (!date) return 'No assessment yet';
        return new Date(date).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Welcome back!</h1>
                    <p className="text-gray-600">Here's an overview of your child's therapy progress</p>
                </div>
                <button
                    onClick={() => navigate('/parent/book')}
                    className="flex items-center gap-2 bg-primary-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-primary-700 transition"
                >
                    <FiPlus />
                    Book New Session
                </button>
            </div>

            {/* Child Info Card */}
            <ChildInfoCard patient={patient} />

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <StatCard
                    icon={FiClock}
                    label="Completed Sessions"
                    value={stats.completedSessions}
                    color="green"
                />
                <StatCard
                    icon={FiCalendar}
                    label="Upcoming Sessions"
                    value={stats.upcomingSessions}
                    color="primary"
                />
                <StatCard
                    icon={FiFileText}
                    label="Last Assessment"
                    value={formatLastAssessment(stats.lastAssessment)}
                    color="purple"
                />
            </div>

            {/* Upcoming Appointments */}
            <div className="bg-white rounded-xl shadow-md p-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-800">Upcoming Appointments</h3>
                    <button
                        onClick={() => navigate('/parent/history')}
                        className="text-primary-600 text-sm font-medium hover:text-primary-700"
                    >
                        View All
                    </button>
                </div>

                {upcomingAppointments.length > 0 ? (
                    <div className="space-y-3">
                        {upcomingAppointments.map((appointment) => (
                            <AppointmentCard key={appointment.bookingId || appointment._id} appointment={appointment} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-8 text-gray-500">
                        <FiCalendar className="mx-auto mb-2" size={32} />
                        <p>No upcoming appointments</p>
                        <button
                            onClick={() => navigate('/parent/book')}
                            className="text-primary-600 font-medium mt-2 hover:text-primary-700"
                        >
                            Book a session now
                        </button>
                    </div>
                )}
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button
                    onClick={() => navigate('/parent/book')}
                    className="flex items-center gap-4 p-4 bg-white rounded-xl shadow-md hover:shadow-lg transition"
                >
                    <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                        <FiCalendar className="text-primary-600" size={24} />
                    </div>
                    <div className="text-left">
                        <p className="font-medium text-gray-800">Book Session</p>
                        <p className="text-sm text-gray-500">Schedule new therapy</p>
                    </div>
                </button>

                <button
                    onClick={() => navigate('/parent/history')}
                    className="flex items-center gap-4 p-4 bg-white rounded-xl shadow-md hover:shadow-lg transition"
                >
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                        <FiClock className="text-green-600" size={24} />
                    </div>
                    <div className="text-left">
                        <p className="font-medium text-gray-800">View History</p>
                        <p className="text-sm text-gray-500">Past sessions & notes</p>
                    </div>
                </button>

                <button
                    onClick={() => navigate('/parent/assessments')}
                    className="flex items-center gap-4 p-4 bg-white rounded-xl shadow-md hover:shadow-lg transition"
                >
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                        <FiFileText className="text-purple-600" size={24} />
                    </div>
                    <div className="text-left">
                        <p className="font-medium text-gray-800">Assessments</p>
                        <p className="text-sm text-gray-500">View progress reports</p>
                    </div>
                </button>
            </div>
        </div>
    );
};

export default ParentDashboardHome;
