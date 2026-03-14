import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiUsers, FiUserPlus, FiCalendar, FiClock, FiArrowRight, FiSearch } from 'react-icons/fi';
import api from '../../services/api';

const StatCard = ({ icon: Icon, label, value, color, onClick }) => {
    const colorClasses = {
        green: 'bg-green-50/50 text-green-600 border-green-100',
        blue: 'bg-blue-50/50 text-blue-600 border-blue-100',
        purple: 'bg-purple-50/50 text-purple-600 border-purple-100',
        amber: 'bg-amber-50/50 text-amber-600 border-amber-100'
    };

    const iconBgClasses = {
        green: 'bg-green-100/50 text-green-600',
        blue: 'bg-blue-100/50 text-blue-600',
        purple: 'bg-purple-100/50 text-purple-600',
        amber: 'bg-amber-100/50 text-amber-600'
    };

    return (
        <div
            onClick={onClick}
            className={`bg-white rounded-2xl border ${colorClasses[color]} shadow-sm p-6 relative overflow-hidden group ${onClick ? 'cursor-pointer hover:shadow-md hover:border-opacity-100 transition-all duration-300 translate-y-0 hover:-translate-y-1' : ''}`}
        >
            <div className={`w-14 h-14 rounded-2xl ${iconBgClasses[color]} flex items-center justify-center mb-5 transition-transform group-hover:scale-110 duration-300`}>
                <Icon size={24} />
            </div>
            <div className="relative z-10">
                <p className="text-3xl font-bold tracking-tight text-gray-900 mb-1">{value}</p>
                <p className="text-sm font-medium text-gray-500">{label}</p>
            </div>
            {/* Decorative background element */}
            <div className={`absolute -bottom-6 -right-6 w-24 h-24 rounded-full opacity-10 blur-2xl ${iconBgClasses[color]}`}></div>
        </div>
    );
};

const RecentPatientRow = ({ patient, onClick }) => (
    <div
        onClick={onClick}
        className="group flex flex-col sm:flex-row sm:items-center gap-4 p-4 bg-white border border-gray-100 rounded-2xl hover:border-green-200 hover:shadow-md hover:shadow-green-500/5 transition-all cursor-pointer"
    >
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 flex items-center justify-center flex-shrink-0 overflow-hidden shadow-sm">
            {patient.photoUrl ? (
                <img src={patient.photoUrl} alt="" className="w-full h-full object-cover" />
            ) : (
                <span className="text-gray-500 font-bold text-lg">{patient.childName?.charAt(0)}</span>
            )}
        </div>
        <div className="flex-1 min-w-0">
            <p className="font-semibold text-gray-900 text-base truncate">{patient.childName}</p>
            <p className="text-xs font-medium text-gray-500 mt-0.5 tracking-wide">{patient.specialId}</p>
        </div>
        <div className="text-left sm:text-right hidden sm:block">
            <p className="text-sm font-medium text-gray-700 truncate max-w-[150px]">{patient.diagnosis?.join(', ')}</p>
            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mt-1">
                {new Date(patient.registrationDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
            </p>
        </div>
        <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-green-50 transition-colors">
            <FiArrowRight className="text-gray-400 group-hover:text-green-600 transition-colors transform group-hover:translate-x-0.5" />
        </div>
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
            // Fetch recent patients
            const patientsRes = await api.get('/patients?limit=5');
            if (patientsRes.data.success) {
                setRecentPatients(patientsRes.data.data || []);
                setStats(prev => ({
                    ...prev,
                    totalPatients: patientsRes.data.pagination?.total || patientsRes.data.data?.length || 0
                }));
            }

            // Fetch bookings for today's appointments
            const today = new Date().toISOString().split('T')[0];
            try {
                const bookingsRes = await api.get(`/bookings/date/${today}`);
                if (bookingsRes.data.success) {
                    const todayBookings = bookingsRes.data.data || [];
                    const pendingCheckIns = todayBookings.filter(b => b.status === 'confirmed').length;
                    setStats(prev => ({
                        ...prev,
                        todayAppointments: todayBookings.length,
                        pendingCheckIns
                    }));
                }
            } catch (err) {
                // Bookings endpoint may require different role
                console.log('Could not fetch bookings stats');
            }

            // Count today's registrations
            const patientsToday = recentPatients.filter(p => {
                const regDate = new Date(p.registrationDate).toISOString().split('T')[0];
                return regDate === today;
            });
            setStats(prev => ({
                ...prev,
                todayRegistrations: patientsToday.length
            }));

        } catch (error) {
            console.error('Failed to fetch dashboard data:', error);
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
        <div className="space-y-8 lg:space-y-10 max-w-7xl mx-auto pb-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-gray-100">
                <div className="space-y-2">
                    <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 tracking-tight">Reception Dashboard</h1>
                    <p className="text-base text-gray-500">Manage patient registrations, check-ins, and daily operations overview.</p>
                </div>
                <button
                    onClick={() => navigate('/receptionist/register')}
                    className="flex items-center justify-center gap-2 bg-gray-900 text-white px-7 py-3.5 rounded-xl font-semibold hover:bg-gray-800 transition-all shadow-sm hover:shadow-md active:scale-[0.98]"
                >
                    <FiUserPlus size={18} />
                    <span>Register New Patient</span>
                </button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
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

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                {/* Recent Patients */}
                <div className="xl:col-span-2">
                    <div className="bg-white rounded-3xl shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] border border-gray-100 overflow-hidden">
                        <div className="p-6 lg:p-8 flex items-center justify-between border-b border-gray-50">
                            <div>
                                <h3 className="text-xl font-bold text-gray-900 tracking-tight">Recent Registrations</h3>
                                <p className="text-sm text-gray-500 mt-1">The most recently added patients to the system</p>
                            </div>
                            <button
                                onClick={() => navigate('/receptionist/patients')}
                                className="px-4 py-2 bg-green-50 text-green-700 rounded-lg text-sm font-semibold hover:bg-green-100 transition-colors flex items-center gap-1.5"
                            >
                                View All
                                <FiArrowRight size={14} />
                            </button>
                        </div>

                        <div className="p-6 lg:p-8 pt-6">
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
                                <div className="text-center py-12 px-4 rounded-2xl bg-gray-50/50 border-2 border-dashed border-gray-100">
                                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm border border-gray-100">
                                        <FiUsers className="text-gray-400" size={24} />
                                    </div>
                                    <h4 className="text-lg font-semibold text-gray-900 mb-1">No patients registered</h4>
                                    <p className="text-gray-500 text-sm max-w-sm mx-auto">There are no recent patients in the system yet. Once added, they will appear here.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="xl:col-span-1 space-y-6">
                    <h3 className="text-xl font-bold text-gray-900 tracking-tight mb-2">Quick Actions</h3>

                    <button
                        onClick={() => navigate('/receptionist/register')}
                        className="w-full flex items-center gap-5 p-6 bg-white rounded-2xl border border-gray-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.1)] hover:border-green-300 hover:shadow-lg hover:shadow-green-500/10 transition-all duration-300 group text-left"
                    >
                        <div className="w-16 h-16 bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300 border border-green-100/50">
                            <FiUserPlus className="text-green-600" size={26} />
                        </div>
                        <div>
                            <p className="font-bold text-gray-900 text-lg mb-1 group-hover:text-green-700 transition-colors">Register Patient</p>
                            <p className="text-sm font-medium text-gray-500 leading-relaxed">Add a new patient profile and assign ID</p>
                        </div>
                    </button>

                    <button
                        onClick={() => navigate('/receptionist/search')}
                        className="w-full flex items-center gap-5 p-6 bg-white rounded-2xl border border-gray-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.1)] hover:border-blue-300 hover:shadow-lg hover:shadow-blue-500/10 transition-all duration-300 group text-left"
                    >
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300 border border-blue-100/50">
                            <FiSearch className="text-blue-600" size={26} />
                        </div>
                        <div>
                            <p className="font-bold text-gray-900 text-lg mb-1 group-hover:text-blue-700 transition-colors">Search & Manage</p>
                            <p className="text-sm font-medium text-gray-500 leading-relaxed">Find patients, view details & update info</p>
                        </div>
                    </button>

                    <button
                        onClick={() => navigate('/receptionist/bookings')}
                        className="w-full flex items-center gap-5 p-6 bg-white rounded-2xl border border-gray-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.1)] hover:border-purple-300 hover:shadow-lg hover:shadow-purple-500/10 transition-all duration-300 group text-left"
                    >
                        <div className="w-16 h-16 bg-gradient-to-br from-purple-50 to-fuchsia-50 rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300 border border-purple-100/50">
                            <FiCalendar className="text-purple-600" size={26} />
                        </div>
                        <div>
                            <p className="font-bold text-gray-900 text-lg mb-1 group-hover:text-purple-700 transition-colors">Bookings</p>
                            <p className="text-sm font-medium text-gray-500 leading-relaxed">Schedule and orchestrate sessions</p>
                        </div>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ReceptionistDashboardHome;
