import React, { useState, useEffect } from 'react';
import { FiUsers, FiCalendar, FiActivity, FiTrendingUp, FiUserPlus, FiCheck, FiClock } from 'react-icons/fi';
import api from '../../services/api';

const StatCard = ({ icon: Icon, label, value, color, trend }) => {
    const colorClasses = {
        red: 'bg-red-100 text-red-600',
        green: 'bg-green-100 text-green-600',
        blue: 'bg-blue-100 text-blue-600',
        purple: 'bg-purple-100 text-purple-600',
        amber: 'bg-amber-100 text-amber-600'
    };

    return (
        <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-start justify-between">
                <div className={`w-12 h-12 rounded-lg ${colorClasses[color]} flex items-center justify-center`}>
                    <Icon size={24} />
                </div>
                {trend && (
                    <span className={`flex items-center gap-1 text-sm font-medium ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        <FiTrendingUp className={trend < 0 ? 'rotate-180' : ''} />
                        {Math.abs(trend)}%
                    </span>
                )}
            </div>
            <p className="text-2xl font-bold text-gray-800 mt-4">{value}</p>
            <p className="text-sm text-gray-500">{label}</p>
        </div>
    );
};

const AdminDashboardHome = () => {
    const [stats, setStats] = useState({
        totalPatients: 0,
        totalStaff: 0,
        todayBookings: 0,
        monthlyBookings: 0,
        completedSessions: 0,
        pendingSessions: 0
    });
    const [recentActivity, setRecentActivity] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const res = await api.get('/admin/stats');
            if (res.data.success) {
                setStats(res.data.data);
            }
        } catch (error) {
            console.log('Using mock data');
            setStats({
                totalPatients: 156,
                totalStaff: 12,
                todayBookings: 24,
                monthlyBookings: 342,
                completedSessions: 289,
                pendingSessions: 53
            });
            setRecentActivity([
                { type: 'registration', message: 'New patient registered: Rahul Kumar', time: '10 min ago' },
                { type: 'booking', message: 'Booking confirmed for Priya Sharma', time: '25 min ago' },
                { type: 'session', message: 'Session completed by Dr. Anil Kumar', time: '1 hr ago' },
                { type: 'staff', message: 'New therapist added: Sarah Johnson', time: '2 hrs ago' },
            ]);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-800">Admin Dashboard</h1>
                <p className="text-gray-600">System overview and management</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <StatCard icon={FiUsers} label="Total Patients" value={stats.totalPatients} color="blue" trend={12} />
                <StatCard icon={FiUserPlus} label="Staff Members" value={stats.totalStaff} color="purple" />
                <StatCard icon={FiCalendar} label="Today's Bookings" value={stats.todayBookings} color="green" trend={8} />
                <StatCard icon={FiActivity} label="Monthly Bookings" value={stats.monthlyBookings} color="amber" trend={15} />
                <StatCard icon={FiCheck} label="Completed Sessions" value={stats.completedSessions} color="green" />
                <StatCard icon={FiClock} label="Pending Sessions" value={stats.pendingSessions} color="red" />
            </div>

            {/* Charts Placeholder & Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Booking Trends Chart */}
                <div className="bg-white rounded-xl shadow-md p-6">
                    <h3 className="font-semibold text-gray-800 mb-4">Booking Trends</h3>
                    <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                        <div className="text-center text-gray-500">
                            <FiTrendingUp size={48} className="mx-auto mb-2" />
                            <p>Chart visualization</p>
                            <p className="text-sm">Integration with chart library</p>
                        </div>
                    </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-white rounded-xl shadow-md p-6">
                    <h3 className="font-semibold text-gray-800 mb-4">Recent Activity</h3>
                    <div className="space-y-4">
                        {recentActivity.map((activity, index) => (
                            <div key={index} className="flex items-start gap-3 pb-3 border-b last:border-0">
                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${activity.type === 'registration' ? 'bg-blue-100 text-blue-600' :
                                        activity.type === 'booking' ? 'bg-green-100 text-green-600' :
                                            activity.type === 'session' ? 'bg-purple-100 text-purple-600' :
                                                'bg-amber-100 text-amber-600'
                                    }`}>
                                    {activity.type === 'registration' ? <FiUserPlus /> :
                                        activity.type === 'booking' ? <FiCalendar /> :
                                            activity.type === 'session' ? <FiCheck /> : <FiUsers />}
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm text-gray-800">{activity.message}</p>
                                    <p className="text-xs text-gray-500">{activity.time}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white">
                    <h4 className="font-semibold mb-2">Therapy Types</h4>
                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between"><span>Speech Therapy</span><span>42%</span></div>
                        <div className="flex justify-between"><span>Occupational Therapy</span><span>28%</span></div>
                        <div className="flex justify-between"><span>Physical Therapy</span><span>18%</span></div>
                        <div className="flex justify-between"><span>Psychology</span><span>12%</span></div>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white">
                    <h4 className="font-semibold mb-2">Diagnosis Distribution</h4>
                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between"><span>ASD</span><span>45%</span></div>
                        <div className="flex justify-between"><span>SLD</span><span>25%</span></div>
                        <div className="flex justify-between"><span>ID</span><span>18%</span></div>
                        <div className="flex justify-between"><span>CP</span><span>12%</span></div>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white">
                    <h4 className="font-semibold mb-2">Staff Overview</h4>
                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between"><span>Therapists</span><span>8</span></div>
                        <div className="flex justify-between"><span>Receptionists</span><span>3</span></div>
                        <div className="flex justify-between"><span>Admins</span><span>1</span></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboardHome;
