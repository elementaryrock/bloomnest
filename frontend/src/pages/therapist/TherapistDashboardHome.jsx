import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiCalendar, FiClock, FiFileText, FiPlay, FiCheck, FiUser } from 'react-icons/fi';
import { toast } from 'react-toastify';
import api from '../../services/api';

const StatCard = ({ icon: Icon, label, value, color }) => {
    const colorClasses = {
        purple: 'bg-purple-100 text-purple-600',
        green: 'bg-green-100 text-green-600',
        amber: 'bg-amber-100 text-amber-600',
        blue: 'bg-blue-100 text-blue-600'
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

const SessionCard = ({ session, onStartSession }) => {
    const isCompleted = session.status === 'completed';
    const isInProgress = session.status === 'in-progress';

    return (
        <div className={`bg-white rounded-xl shadow-md p-6 ${isCompleted ? 'opacity-75' : ''}`}>
            <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-xl bg-gray-200 flex-shrink-0 overflow-hidden">
                    {session.patient?.photoUrl ? (
                        <img src={session.patient.photoUrl} alt="" className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center">
                            <FiUser className="text-gray-400" size={24} />
                        </div>
                    )}
                </div>

                <div className="flex-1">
                    <div className="flex items-start justify-between">
                        <div>
                            <h4 className="font-semibold text-gray-800">{session.patient?.childName || 'Patient'}</h4>
                            <p className="text-sm text-purple-600">{session.patient?.specialId}</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${isCompleted ? 'bg-green-100 text-green-600' :
                                isInProgress ? 'bg-amber-100 text-amber-600' :
                                    'bg-blue-100 text-blue-600'
                            }`}>
                            {isCompleted ? 'Completed' : isInProgress ? 'In Progress' : 'Upcoming'}
                        </span>
                    </div>

                    <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                            <FiClock size={14} />
                            {session.timeSlot}
                        </span>
                        <span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded text-xs">
                            {session.therapyType}
                        </span>
                    </div>

                    <p className="text-sm text-gray-500 mt-2">
                        Diagnosis: {session.patient?.diagnosis?.join(', ')}
                    </p>
                </div>
            </div>

            {!isCompleted && (
                <div className="flex gap-3 mt-4 pt-4 border-t">
                    <button
                        onClick={() => onStartSession(session)}
                        className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg font-medium transition ${isInProgress
                                ? 'bg-amber-500 text-white hover:bg-amber-600'
                                : 'bg-purple-600 text-white hover:bg-purple-700'
                            }`}
                    >
                        {isInProgress ? <FiFileText /> : <FiPlay />}
                        {isInProgress ? 'Complete Session' : 'Start Session'}
                    </button>
                </div>
            )}
        </div>
    );
};

const TherapistDashboardHome = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        totalToday: 0,
        completed: 0,
        pending: 0
    });
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const res = await api.get('/sessions/today');
            if (res.data.success) {
                setSessions(res.data.data || []);
                const completed = res.data.data?.filter(s => s.status === 'completed').length || 0;
                setStats({
                    totalToday: res.data.data?.length || 0,
                    completed,
                    pending: (res.data.data?.length || 0) - completed
                });
            }
        } catch (error) {
            console.log('Using mock data');
            const mockSessions = [
                {
                    id: 1,
                    patient: { childName: 'Rahul Kumar', specialId: 'JYCS2025000001', diagnosis: ['ASD'] },
                    therapyType: 'Speech Therapy',
                    timeSlot: '9:00 AM - 10:00 AM',
                    status: 'completed'
                },
                {
                    id: 2,
                    patient: { childName: 'Priya Sharma', specialId: 'JYCS2025000002', diagnosis: ['SLD'] },
                    therapyType: 'Occupational Therapy',
                    timeSlot: '10:00 AM - 11:00 AM',
                    status: 'in-progress'
                },
                {
                    id: 3,
                    patient: { childName: 'Arjun Nair', specialId: 'JYCS2025000003', diagnosis: ['CP'] },
                    therapyType: 'Physical Therapy',
                    timeSlot: '11:00 AM - 12:00 PM',
                    status: 'pending'
                },
                {
                    id: 4,
                    patient: { childName: 'Maya Pillai', specialId: 'JYCS2025000004', diagnosis: ['ASD', 'ID'] },
                    therapyType: 'Psychology',
                    timeSlot: '2:00 PM - 3:00 PM',
                    status: 'pending'
                },
            ];
            setSessions(mockSessions);
            setStats({
                totalToday: 4,
                completed: 1,
                pending: 3
            });
        } finally {
            setLoading(false);
        }
    };

    const handleStartSession = (session) => {
        if (session.status === 'in-progress') {
            navigate(`/therapist/session/${session.id}/notes`);
        } else {
            toast.success('Session started!');
            setSessions(sessions.map(s =>
                s.id === session.id ? { ...s, status: 'in-progress' } : s
            ));
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-800">Good Morning!</h1>
                <p className="text-gray-600">Here's your schedule for today</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <StatCard icon={FiCalendar} label="Total Sessions Today" value={stats.totalToday} color="purple" />
                <StatCard icon={FiCheck} label="Completed" value={stats.completed} color="green" />
                <StatCard icon={FiClock} label="Pending" value={stats.pending} color="amber" />
            </div>

            {/* Today's Sessions */}
            <div>
                <h2 className="text-lg font-semibold text-gray-800 mb-4">Today's Schedule</h2>
                {sessions.length > 0 ? (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {sessions.map((session) => (
                            <SessionCard
                                key={session.id}
                                session={session}
                                onStartSession={handleStartSession}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="bg-white rounded-xl shadow-md p-8 text-center">
                        <FiCalendar className="mx-auto text-gray-400 mb-4" size={48} />
                        <p className="text-gray-500">No sessions scheduled for today</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TherapistDashboardHome;
