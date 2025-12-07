import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiFileText, FiCalendar, FiClock, FiUser, FiSearch, FiEye } from 'react-icons/fi';
import { toast } from 'react-toastify';
import api from '../../services/api';

const TherapistSessions = () => {
    const navigate = useNavigate();
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all'); // all, completed, pending
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchSessions();
    }, []);

    const fetchSessions = async () => {
        setLoading(true);
        try {
            const res = await api.get('/sessions', { params: { limit: 50 } });
            if (res.data.success) {
                setSessions(res.data.data || []);
            }
        } catch (error) {
            console.error('Fetch sessions error:', error);
            // Try to fetch from bookings instead
            try {
                const bookingsRes = await api.get('/bookings');
                if (bookingsRes.data.success) {
                    setSessions(bookingsRes.data.data || []);
                }
            } catch (err) {
                setSessions([]);
            }
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'completed': return 'bg-green-100 text-green-700';
            case 'in-progress': return 'bg-amber-100 text-amber-700';
            case 'confirmed': return 'bg-blue-100 text-blue-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    const filteredSessions = sessions.filter(session => {
        const matchesFilter = filter === 'all' ||
            (filter === 'completed' && (session.completedAt || session.status === 'completed')) ||
            (filter === 'pending' && !session.completedAt && session.status !== 'completed');

        const matchesSearch = !searchQuery ||
            session.specialId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            session.bookingId?.therapyType?.toLowerCase().includes(searchQuery.toLowerCase());

        return matchesFilter && matchesSearch;
    });

    const formatDate = (dateStr) => {
        if (!dateStr) return 'N/A';
        return new Date(dateStr).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-800">Session Notes</h1>
                <p className="text-gray-600">View and manage therapy session records</p>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl shadow-md p-4">
                <div className="flex flex-col md:flex-row gap-4">
                    {/* Search */}
                    <div className="flex-1 relative">
                        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search by patient ID or therapy type..."
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                        />
                    </div>

                    {/* Filter Buttons */}
                    <div className="flex gap-2">
                        {['all', 'pending', 'completed'].map((f) => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                className={`px-4 py-2 rounded-lg font-medium capitalize transition ${filter === f
                                        ? 'bg-purple-600 text-white'
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                            >
                                {f}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Sessions List */}
            {loading ? (
                <div className="flex justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-purple-600"></div>
                </div>
            ) : filteredSessions.length > 0 ? (
                <div className="bg-white rounded-xl shadow-md overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Patient</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Therapy</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {filteredSessions.map((session, index) => (
                                <tr key={session.sessionId || session._id || index} className="hover:bg-gray-50">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                                                <FiUser className="text-gray-400" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-800">{session.specialId}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-sm">
                                            {session.bookingId?.therapyType || session.therapyType || 'N/A'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-gray-600">
                                        {formatDate(session.sessionDate || session.bookingId?.date)}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(session.completedAt ? 'completed' : session.status || 'pending')
                                            }`}>
                                            {session.completedAt ? 'Completed' : session.status || 'Pending'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <button
                                            onClick={() => navigate(`/therapist/session/${session.sessionId}/notes`)}
                                            className="flex items-center gap-1 text-purple-600 hover:text-purple-800"
                                        >
                                            <FiEye size={16} />
                                            View
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="bg-white rounded-xl shadow-md p-12 text-center">
                    <FiFileText className="mx-auto text-gray-400 mb-4" size={48} />
                    <p className="text-gray-500">No session records found</p>
                </div>
            )}
        </div>
    );
};

export default TherapistSessions;
