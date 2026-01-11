import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    CheckCircle2,
    CalendarDays,
    ClipboardList,
    Plus,
    ChevronRight,
    Brain,
    Hand,
    Activity,
    MessageCircle,
    Sparkles,
    TrendingUp,
    Clock,
    CalendarCheck
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

// Therapy type configurations with specific icons and colors
const therapyConfig = {
    'Psychology': {
        icon: Brain,
        color: 'from-violet-500 to-purple-600',
        bgColor: 'bg-violet-50',
        textColor: 'text-violet-600',
        borderColor: 'border-violet-100'
    },
    'OT': {
        icon: Hand,
        color: 'from-amber-500 to-orange-600',
        bgColor: 'bg-amber-50',
        textColor: 'text-amber-600',
        borderColor: 'border-amber-100'
    },
    'PT': {
        icon: Activity,
        color: 'from-emerald-500 to-green-600',
        bgColor: 'bg-emerald-50',
        textColor: 'text-emerald-600',
        borderColor: 'border-emerald-100'
    },
    'Speech': {
        icon: MessageCircle,
        color: 'from-sky-500 to-blue-600',
        bgColor: 'bg-sky-50',
        textColor: 'text-sky-600',
        borderColor: 'border-sky-100'
    },
    'EI': {
        icon: Sparkles,
        color: 'from-rose-500 to-pink-600',
        bgColor: 'bg-rose-50',
        textColor: 'text-rose-600',
        borderColor: 'border-rose-100'
    }
};

const getTherapyConfig = (type) => {
    return therapyConfig[type] || therapyConfig['Psychology'];
};

// Child Info Card Component
const ChildInfoCard = ({ patient }) => {
    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col md:flex-row gap-6">
            {/* Photo */}
            <div className="flex-shrink-0">
                <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-primary-100 to-primary-200 overflow-hidden ring-4 ring-primary-50">
                    {patient?.photoUrl ? (
                        <img
                            src={patient.photoUrl}
                            alt={patient.childName}
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-primary-600 text-3xl font-bold">
                            {patient?.childName?.charAt(0) || 'C'}
                        </div>
                    )}
                </div>
            </div>

            {/* Info */}
            <div className="flex-1">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
                    <h2 className="text-xl font-bold text-gray-900">{patient?.childName || 'Child Name'}</h2>
                    <span className="inline-flex items-center px-3 py-1.5 bg-primary-50 text-primary-700 rounded-full text-sm font-semibold border border-primary-100">
                        {patient?.specialId || 'MEC2025000000'}
                    </span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-gray-50 rounded-xl p-3">
                        <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">Age</p>
                        <p className="font-bold text-gray-900 mt-0.5">{patient?.age || '-'} years</p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-3">
                        <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">Gender</p>
                        <p className="font-bold text-gray-900 mt-0.5">{patient?.gender || '-'}</p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-3">
                        <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">Diagnosis</p>
                        <p className="font-bold text-gray-900 mt-0.5">
                            {patient?.diagnosis?.join(', ') || '-'}
                        </p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-3">
                        <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">Severity</p>
                        <p className="font-bold text-gray-900 mt-0.5">{patient?.severity || '-'}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Enhanced Statistics Card Component
const StatCard = ({ icon: Icon, label, value, color = 'primary', trend }) => {
    const colorConfig = {
        primary: {
            bg: 'bg-gradient-to-br from-blue-500 to-blue-600',
            iconBg: 'bg-blue-100',
            iconColor: 'text-blue-600'
        },
        green: {
            bg: 'bg-gradient-to-br from-emerald-500 to-emerald-600',
            iconBg: 'bg-emerald-100',
            iconColor: 'text-emerald-600'
        },
        purple: {
            bg: 'bg-gradient-to-br from-violet-500 to-purple-600',
            iconBg: 'bg-violet-100',
            iconColor: 'text-violet-600'
        }
    };

    const config = colorConfig[color];

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 ${config.iconBg} rounded-xl flex items-center justify-center`}>
                    <Icon className={config.iconColor} size={24} strokeWidth={2} />
                </div>
                {trend && (
                    <div className="flex items-center gap-1 text-emerald-600 text-xs font-medium bg-emerald-50 px-2 py-1 rounded-full">
                        <TrendingUp size={12} />
                        {trend}
                    </div>
                )}
            </div>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            <p className="text-sm text-gray-500 mt-0.5">{label}</p>
        </div>
    );
};

// Enhanced Appointment Card
const AppointmentCard = ({ appointment }) => {
    const config = getTherapyConfig(appointment.therapyType);
    const IconComponent = config.icon;

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('en-IN', {
            weekday: 'short',
            day: 'numeric',
            month: 'short'
        });
    };

    return (
        <div className={`flex items-center gap-4 p-4 bg-white rounded-xl border ${config.borderColor} hover:shadow-md transition-all group cursor-pointer`}>
            <div className={`w-12 h-12 ${config.bgColor} rounded-xl flex items-center justify-center flex-shrink-0`}>
                <IconComponent className={config.textColor} size={22} strokeWidth={2} />
            </div>
            <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900">{appointment.therapyType}</p>
                <div className="flex items-center gap-2 text-sm text-gray-500 mt-0.5">
                    <CalendarDays size={14} />
                    <span>{formatDate(appointment.date)}</span>
                    <span className="text-gray-300">•</span>
                    <Clock size={14} />
                    <span>{appointment.timeSlot}</span>
                </div>
            </div>
            <ChevronRight className="text-gray-300 group-hover:text-gray-500 group-hover:translate-x-1 transition-all" size={20} />
        </div>
    );
};

// Quick Action Card
const QuickActionCard = ({ onClick, icon: Icon, title, description, color }) => {
    const colorConfig = {
        blue: { bg: 'bg-blue-50', iconColor: 'text-blue-600', hoverBg: 'hover:bg-blue-100' },
        green: { bg: 'bg-emerald-50', iconColor: 'text-emerald-600', hoverBg: 'hover:bg-emerald-100' },
        purple: { bg: 'bg-violet-50', iconColor: 'text-violet-600', hoverBg: 'hover:bg-violet-100' }
    };
    const config = colorConfig[color];

    return (
        <button
            onClick={onClick}
            className={`flex items-center gap-4 p-5 bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md ${config.hoverBg} transition-all group text-left w-full`}
        >
            <div className={`w-14 h-14 ${config.bg} rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}>
                <Icon className={config.iconColor} size={26} strokeWidth={2} />
            </div>
            <div>
                <p className="font-semibold text-gray-900">{title}</p>
                <p className="text-sm text-gray-500 mt-0.5">{description}</p>
            </div>
            <ChevronRight className="text-gray-300 ml-auto group-hover:text-gray-500 group-hover:translate-x-1 transition-all" size={20} />
        </button>
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
                <div className="flex flex-col items-center gap-3">
                    <div className="animate-spin rounded-full h-10 w-10 border-2 border-primary-600 border-t-transparent"></div>
                    <p className="text-gray-500 text-sm">Loading dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-6xl">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Welcome back!</h1>
                    <p className="text-gray-500 mt-1">Here's an overview of your child's therapy progress</p>
                </div>
                <button
                    onClick={() => navigate('/parent/book')}
                    className="inline-flex items-center gap-2 bg-gradient-to-r from-primary-600 to-primary-700 text-white px-6 py-3 rounded-xl font-semibold hover:from-primary-700 hover:to-primary-800 transition-all shadow-sm hover:shadow-md"
                >
                    <Plus size={20} strokeWidth={2.5} />
                    Book New Session
                </button>
            </div>

            {/* Child Info Card */}
            <ChildInfoCard patient={patient} />

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <StatCard
                    icon={CheckCircle2}
                    label="Completed Sessions"
                    value={stats.completedSessions}
                    color="green"
                />
                <StatCard
                    icon={CalendarCheck}
                    label="Upcoming Sessions"
                    value={stats.upcomingSessions}
                    color="primary"
                />
                <StatCard
                    icon={ClipboardList}
                    label="Last Assessment"
                    value={formatLastAssessment(stats.lastAssessment)}
                    color="purple"
                />
            </div>

            {/* Upcoming Appointments */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-5">
                    <h3 className="text-lg font-bold text-gray-900">Upcoming Appointments</h3>
                    <button
                        onClick={() => navigate('/parent/history')}
                        className="text-primary-600 text-sm font-semibold hover:text-primary-700 flex items-center gap-1 group"
                    >
                        View All
                        <ChevronRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
                    </button>
                </div>

                {upcomingAppointments.length > 0 ? (
                    <div className="space-y-3">
                        {upcomingAppointments.slice(0, 4).map((appointment) => (
                            <AppointmentCard key={appointment.bookingId || appointment._id} appointment={appointment} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-10 bg-gray-50 rounded-xl">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <CalendarDays className="text-gray-400" size={28} />
                        </div>
                        <p className="text-gray-500 font-medium">No upcoming appointments</p>
                        <button
                            onClick={() => navigate('/parent/book')}
                            className="text-primary-600 font-semibold mt-2 hover:text-primary-700 inline-flex items-center gap-1"
                        >
                            Book a session now
                            <ChevronRight size={16} />
                        </button>
                    </div>
                )}
            </div>

            {/* Quick Actions */}
            <div>
                <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <QuickActionCard
                        onClick={() => navigate('/parent/book')}
                        icon={CalendarDays}
                        title="Book Session"
                        description="Schedule new therapy"
                        color="blue"
                    />
                    <QuickActionCard
                        onClick={() => navigate('/parent/history')}
                        icon={Clock}
                        title="View History"
                        description="Past sessions & notes"
                        color="green"
                    />
                    <QuickActionCard
                        onClick={() => navigate('/parent/assessments')}
                        icon={ClipboardList}
                        title="Assessments"
                        description="View progress reports"
                        color="purple"
                    />
                </div>
            </div>
        </div>
    );
};

export default ParentDashboardHome;
