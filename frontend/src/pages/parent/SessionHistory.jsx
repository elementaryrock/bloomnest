import React, { useState, useEffect } from 'react';
import { FiCalendar, FiClock, FiFileText, FiChevronDown, FiChevronUp, FiDownload } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const SessionHistoryItem = ({ session, isExpanded, onToggle }) => {
    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('en-IN', {
            weekday: 'short',
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    };

    return (
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
            {/* Header - Always Visible */}
            <button
                onClick={onToggle}
                className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition"
            >
                <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${session.status === 'completed' ? 'bg-green-100' : 'bg-amber-100'
                        }`}>
                        <FiCalendar className={session.status === 'completed' ? 'text-green-600' : 'text-amber-600'} />
                    </div>
                    <div className="text-left">
                        <p className="font-semibold text-gray-800">{session.therapyType}</p>
                        <p className="text-sm text-gray-500">{formatDate(session.date)} • {session.timeSlot}</p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${session.status === 'completed' ? 'bg-green-100 text-green-700' :
                        session.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                            'bg-amber-100 text-amber-700'
                        }`}>
                        {session.status.charAt(0).toUpperCase() + session.status.slice(1)}
                    </span>
                    {isExpanded ? <FiChevronUp /> : <FiChevronDown />}
                </div>
            </button>

            {/* Expanded Content */}
            {isExpanded && session.notes && (
                <div className="px-4 pb-4 border-t bg-gray-50">
                    <div className="py-4 space-y-4">
                        {session.notes.activitiesConducted && (
                            <div>
                                <p className="text-xs font-medium text-gray-500 uppercase mb-1">Activities</p>
                                <p className="text-gray-700">{session.notes.activitiesConducted}</p>
                            </div>
                        )}

                        {session.notes.progressLevel && (
                            <div>
                                <p className="text-xs font-medium text-gray-500 uppercase mb-1">Progress</p>
                                <span className={`px-3 py-1 rounded-full text-sm font-medium ${session.notes.progressLevel === 'Excellent' ? 'bg-green-100 text-green-700' :
                                    session.notes.progressLevel === 'Good' ? 'bg-blue-100 text-blue-700' :
                                        session.notes.progressLevel === 'Satisfactory' ? 'bg-amber-100 text-amber-700' :
                                            'bg-red-100 text-red-700'
                                    }`}>
                                    {session.notes.progressLevel}
                                </span>
                            </div>
                        )}

                        {session.notes.recommendationsForParents && (
                            <div>
                                <p className="text-xs font-medium text-gray-500 uppercase mb-1">Recommendations</p>
                                <p className="text-gray-700">{session.notes.recommendationsForParents}</p>
                            </div>
                        )}

                        {session.notes.behavioralObservations && (
                            <div>
                                <p className="text-xs font-medium text-gray-500 uppercase mb-1">Observations</p>
                                <p className="text-gray-700">{session.notes.behavioralObservations}</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

const SessionHistory = () => {
    const { user } = useAuth();
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedId, setExpandedId] = useState(null);
    const [filter, setFilter] = useState('all'); // all, completed, cancelled

    useEffect(() => {
        fetchSessionHistory();
    }, []);

    const fetchSessionHistory = async () => {
        try {
            // Fetch bookings from my-bookings endpoint
            const res = await api.get('/bookings/my-bookings');
            if (res.data.success) {
                const bookings = res.data.data || [];
                // Transform bookings to session format with id for key
                const formattedSessions = bookings.map(b => ({
                    id: b.bookingId || b._id,
                    bookingId: b.bookingId,
                    therapyType: b.therapyType,
                    date: b.date,
                    timeSlot: b.timeSlot,
                    status: b.status,
                    notes: null // Will be populated when session notes are available
                }));
                setSessions(formattedSessions);
            }
        } catch (error) {
            console.log('No booking history found');
            setSessions([]);
        } finally {
            setLoading(false);
        }
    };

    const filteredSessions = sessions.filter(s => {
        if (filter === 'all') return true;
        return s.status === filter;
    });

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
                    <h1 className="text-2xl font-bold text-gray-800">Session History</h1>
                    <p className="text-gray-600">View past therapy sessions and progress notes</p>
                </div>

                {/* Filter Tabs */}
                <div className="flex gap-2 bg-gray-100 p-1 rounded-lg">
                    {['all', 'confirmed', 'completed', 'cancelled'].map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${filter === f
                                ? 'bg-white text-primary-600 shadow-sm'
                                : 'text-gray-600 hover:text-gray-800'
                                }`}
                        >
                            {f.charAt(0).toUpperCase() + f.slice(1)}
                        </button>
                    ))}
                </div>
            </div>

            {/* Sessions List */}
            {filteredSessions.length > 0 ? (
                <div className="space-y-4">
                    {filteredSessions.map((session) => (
                        <SessionHistoryItem
                            key={session.id}
                            session={session}
                            isExpanded={expandedId === session.id}
                            onToggle={() => setExpandedId(expandedId === session.id ? null : session.id)}
                        />
                    ))}
                </div>
            ) : (
                <div className="bg-white rounded-xl shadow-md p-8 text-center">
                    <FiClock className="mx-auto text-gray-400 mb-4" size={48} />
                    <p className="text-gray-500">No sessions found</p>
                </div>
            )}

            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-xl shadow-md p-6">
                    <p className="text-3xl font-bold text-primary-600">
                        {sessions.filter(s => s.status === 'confirmed').length}
                    </p>
                    <p className="text-sm text-gray-500">Upcoming Sessions</p>
                </div>
                <div className="bg-white rounded-xl shadow-md p-6">
                    <p className="text-3xl font-bold text-green-600">
                        {sessions.filter(s => s.status === 'completed').length}
                    </p>
                    <p className="text-sm text-gray-500">Completed Sessions</p>
                </div>
                <div className="bg-white rounded-xl shadow-md p-6">
                    <p className="text-3xl font-bold text-red-600">
                        {sessions.filter(s => s.status === 'cancelled').length}
                    </p>
                    <p className="text-sm text-gray-500">Cancelled Sessions</p>
                </div>
                <div className="bg-white rounded-xl shadow-md p-6">
                    <p className="text-3xl font-bold text-gray-600">
                        {sessions.length}
                    </p>
                    <p className="text-sm text-gray-500">Total Sessions</p>
                </div>
            </div>
        </div>
    );
};

export default SessionHistory;
