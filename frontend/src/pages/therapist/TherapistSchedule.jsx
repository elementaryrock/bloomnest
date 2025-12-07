import React, { useState, useEffect } from 'react';
import { FiCalendar, FiClock, FiUser, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { toast } from 'react-toastify';
import api from '../../services/api';

const TherapistSchedule = () => {
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedDate, setSelectedDate] = useState(new Date());

    useEffect(() => {
        fetchSchedule();
    }, [selectedDate]);

    const fetchSchedule = async () => {
        setLoading(true);
        try {
            const dateStr = selectedDate.toISOString().split('T')[0];
            const res = await api.get('/sessions/today', { params: { date: dateStr } });
            if (res.data.success) {
                setSessions(res.data.data || []);
            }
        } catch (error) {
            console.error('Fetch schedule error:', error);
            setSessions([]);
        } finally {
            setLoading(false);
        }
    };

    const changeDate = (days) => {
        const newDate = new Date(selectedDate);
        newDate.setDate(newDate.getDate() + days);
        setSelectedDate(newDate);
    };

    const formatDate = (date) => {
        return date.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'completed': return 'bg-green-100 text-green-700';
            case 'in-progress': return 'bg-amber-100 text-amber-700';
            default: return 'bg-blue-100 text-blue-700';
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-800">My Schedule</h1>
                <p className="text-gray-600">View and manage your therapy sessions</p>
            </div>

            {/* Date Navigation */}
            <div className="bg-white rounded-xl shadow-md p-4">
                <div className="flex items-center justify-between">
                    <button
                        onClick={() => changeDate(-1)}
                        className="p-2 hover:bg-gray-100 rounded-lg transition"
                    >
                        <FiChevronLeft size={24} />
                    </button>
                    <div className="text-center">
                        <p className="text-lg font-semibold text-gray-800">{formatDate(selectedDate)}</p>
                        <button
                            onClick={() => setSelectedDate(new Date())}
                            className="text-sm text-purple-600 hover:underline"
                        >
                            Today
                        </button>
                    </div>
                    <button
                        onClick={() => changeDate(1)}
                        className="p-2 hover:bg-gray-100 rounded-lg transition"
                    >
                        <FiChevronRight size={24} />
                    </button>
                </div>
            </div>

            {/* Schedule */}
            {loading ? (
                <div className="flex justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-purple-600"></div>
                </div>
            ) : sessions.length > 0 ? (
                <div className="space-y-4">
                    {sessions.map((session, index) => (
                        <div key={session.id || index} className="bg-white rounded-xl shadow-md p-6">
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 rounded-xl bg-gray-200 flex items-center justify-center">
                                    <FiUser className="text-gray-400" size={24} />
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-semibold text-gray-800">
                                        {session.patient?.childName || 'Patient'}
                                    </h3>
                                    <p className="text-sm text-purple-600">{session.patient?.specialId}</p>
                                    <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                                        <span className="flex items-center gap-1">
                                            <FiClock size={14} />
                                            {session.timeSlot}
                                        </span>
                                        <span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded text-xs">
                                            {session.therapyType}
                                        </span>
                                    </div>
                                </div>
                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(session.status)}`}>
                                    {session.status}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="bg-white rounded-xl shadow-md p-12 text-center">
                    <FiCalendar className="mx-auto text-gray-400 mb-4" size={48} />
                    <p className="text-gray-500">No sessions scheduled for this date</p>
                </div>
            )}
        </div>
    );
};

export default TherapistSchedule;
