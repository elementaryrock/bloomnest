import React, { useState, useEffect } from 'react';
import { FiSearch, FiUser, FiCalendar, FiClock, FiX, FiPlus, FiTrash2, FiChevronRight, FiEdit } from 'react-icons/fi';
import { toast } from 'react-toastify';
import api from '../../services/api';

const BookingManagement = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [patients, setPatients] = useState([]);
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [patientBookings, setPatientBookings] = useState([]);
    const [loading, setLoading] = useState(false);
    const [bookingsLoading, setBookingsLoading] = useState(false);
    const [showScheduleModal, setShowScheduleModal] = useState(false);
    const [editingBooking, setEditingBooking] = useState(null);

    // Schedule form state
    const [scheduleForm, setScheduleForm] = useState({
        therapyType: '',
        date: '',
        timeSlot: '',
        therapistId: ''
    });
    const [availableSlots, setAvailableSlots] = useState([]);
    const [slotsLoading, setSlotsLoading] = useState(false);
    const [therapists, setTherapists] = useState([]);
    const [therapistsLoading, setTherapistsLoading] = useState(false);
    const [sessionLimits, setSessionLimits] = useState({});
    const [sessionLimitInfo, setSessionLimitInfo] = useState(null);

    const therapyTypes = [
        { value: 'Speech', label: 'Speech Therapy' },
        { value: 'OT', label: 'Occupational Therapy' },
        { value: 'PT', label: 'Physical Therapy' },
        { value: 'Psychology', label: 'Psychology' },
        { value: 'EI', label: 'Early Intervention' }
    ];

    // Search patients
    useEffect(() => {
        if (searchQuery.length >= 2) {
            const debounce = setTimeout(() => searchPatients(), 300);
            return () => clearTimeout(debounce);
        } else {
            setPatients([]);
        }
    }, [searchQuery]);

    const searchPatients = async () => {
        setLoading(true);
        try {
            const res = await api.get('/patients/search', { params: { query: searchQuery } });
            if (res.data.success) {
                setPatients(res.data.data || []);
            }
        } catch (error) {
            console.error('Search error:', error);
        } finally {
            setLoading(false);
        }
    };

    // Fetch patient bookings
    const fetchPatientBookings = async (specialId) => {
        setBookingsLoading(true);
        try {
            const res = await api.get(`/bookings/patient/${specialId}`);
            if (res.data.success) {
                // Sort: confirmed first, then completed, then cancelled
                const sortedBookings = (res.data.data || []).sort((a, b) => {
                    const statusOrder = { cancelled: 2, completed: 1, confirmed: 0 };
                    const orderA = statusOrder[a.status] !== undefined ? statusOrder[a.status] : 3;
                    const orderB = statusOrder[b.status] !== undefined ? statusOrder[b.status] : 3;
                    return orderA - orderB;
                });
                setPatientBookings(sortedBookings);
            }
        } catch (error) {
            console.error('Fetch bookings error:', error);
            setPatientBookings([]);
        } finally {
            setBookingsLoading(false);
        }
    };

    // Fetch session limits for all therapy types
    const fetchSessionLimits = async (specialId) => {
        const limits = {};
        const currentDate = new Date().toISOString().split('T')[0];

        for (const type of therapyTypes) {
            try {
                const res = await api.get('/bookings/monthly-count', {
                    params: {
                        specialId,
                        therapyType: type.value,
                        date: currentDate
                    }
                });
                if (res.data.success) {
                    limits[type.value] = res.data.data;
                }
            } catch (error) {
                limits[type.value] = { count: 0, limit: 2, remaining: 2 };
            }
        }
        setSessionLimits(limits);
    };

    // Select patient
    const handleSelectPatient = (patient) => {
        setSelectedPatient(patient);
        fetchPatientBookings(patient.specialId);
        fetchSessionLimits(patient.specialId);
    };

    // Fetch therapists when therapy type changes
    useEffect(() => {
        if (scheduleForm.therapyType) {
            fetchTherapists();
        } else {
            setTherapists([]);
        }
    }, [scheduleForm.therapyType]);

    const fetchTherapists = async () => {
        setTherapistsLoading(true);
        try {
            const res = await api.get('/therapists', {
                params: { specialization: scheduleForm.therapyType }
            });
            if (res.data.success) {
                setTherapists(res.data.data || []);
            }
        } catch (error) {
            console.error('Fetch therapists error:', error);
            setTherapists([]);
        } finally {
            setTherapistsLoading(false);
        }
    };

    // Fetch available slots when date and therapy type change
    useEffect(() => {
        if (scheduleForm.date && scheduleForm.therapyType) {
            fetchAvailableSlots();
        }
    }, [scheduleForm.date, scheduleForm.therapyType]);

    const fetchAvailableSlots = async () => {
        setSlotsLoading(true);
        try {
            const res = await api.get('/bookings/available-slots', {
                params: {
                    date: scheduleForm.date,
                    therapyType: scheduleForm.therapyType
                }
            });
            if (res.data.success) {
                setAvailableSlots(res.data.data.slots || []);
            }
        } catch (error) {
            console.error('Fetch slots error:', error);
            setAvailableSlots([]);
        } finally {
            setSlotsLoading(false);
        }
    };

    // Schedule booking
    const handleScheduleBooking = async () => {
        if (!scheduleForm.therapyType || !scheduleForm.date || !scheduleForm.timeSlot) {
            toast.error('Please fill all fields');
            return;
        }

        try {
            const res = await api.post('/bookings/receptionist', {
                specialId: selectedPatient.specialId,
                therapyType: scheduleForm.therapyType,
                date: scheduleForm.date,
                timeSlot: scheduleForm.timeSlot,
                therapistId: scheduleForm.therapistId || undefined
            });
            if (res.data.success) {
                toast.success('Session scheduled successfully!');
                setShowScheduleModal(false);
                setScheduleForm({ therapyType: '', date: '', timeSlot: '', therapistId: '' });
                fetchPatientBookings(selectedPatient.specialId);
                fetchSessionLimits(selectedPatient.specialId);
            }
        } catch (error) {
            toast.error(error.response?.data?.error?.message || 'Failed to schedule session');
        }
    };

    // Cancel booking
    const handleCancelBooking = async (bookingId) => {
        if (!window.confirm('Are you sure you want to cancel this session?')) return;

        try {
            const res = await api.put(`/bookings/${bookingId}/cancel`, {
                reason: 'Cancelled by receptionist'
            });
            if (res.data.success) {
                toast.success('Session cancelled');
                fetchPatientBookings(selectedPatient.specialId);
            }
        } catch (error) {
            toast.error(error.response?.data?.error?.message || 'Failed to cancel session');
        }
    };

    // Edit booking - open modal with existing data
    const handleEditBooking = (booking) => {
        const bookingDate = new Date(booking.date);
        setEditingBooking(booking);
        setScheduleForm({
            therapyType: booking.therapyType,
            date: bookingDate.toISOString().split('T')[0],
            timeSlot: '',
            therapistId: booking.therapistId || ''
        });
        setShowScheduleModal(true);
    };

    // Reschedule booking (cancel old, create new)
    const handleRescheduleBooking = async () => {
        if (!scheduleForm.therapyType || !scheduleForm.date || !scheduleForm.timeSlot) {
            toast.error('Please fill all fields');
            return;
        }

        try {
            // Cancel the old booking first
            await api.put(`/bookings/${editingBooking.bookingId || editingBooking._id}/cancel`, {
                reason: 'Rescheduled by receptionist'
            });

            // Create new booking
            const res = await api.post('/bookings/receptionist', {
                specialId: selectedPatient.specialId,
                therapyType: scheduleForm.therapyType,
                date: scheduleForm.date,
                timeSlot: scheduleForm.timeSlot,
                therapistId: scheduleForm.therapistId || undefined
            });

            if (res.data.success) {
                toast.success('Session rescheduled successfully!');
                setShowScheduleModal(false);
                setEditingBooking(null);
                setScheduleForm({ therapyType: '', date: '', timeSlot: '', therapistId: '' });
                fetchPatientBookings(selectedPatient.specialId);
            }
        } catch (error) {
            toast.error(error.response?.data?.error?.message || 'Failed to reschedule session');
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'confirmed': return 'bg-green-100 text-green-700';
            case 'completed': return 'bg-blue-100 text-blue-700';
            case 'cancelled': return 'bg-red-100 text-red-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    return (
        <div className="space-y-6 lg:space-y-8">
            {/* Header */}
            <div className="mb-4">
                <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Booking Management</h1>
                <p className="text-gray-500 mt-2 text-sm lg:text-base">Schedule and orchestrate therapy sessions with precision.</p>
            </div>

            <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
                {/* Patient Search Panel */}
                <div className="w-full lg:w-1/3 flex flex-col gap-6">
                    <div className="bg-white rounded-2xl shadow-[0_2px_10px_-4px_rgba(0,0,0,0.1)] border border-gray-100 p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-5 tracking-tight">Search Patient</h3>

                        {/* Search Box */}
                        <div className="relative mb-6">
                            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search by name or ID..."
                                className="w-full pl-11 pr-10 py-3 bg-gray-50 border-transparent focus:bg-white focus:border-green-500 rounded-xl focus:ring-4 focus:ring-green-500/10 transition-all text-sm outline-none placeholder:text-gray-400"
                            />
                            {searchQuery && (
                                <button
                                    onClick={() => setSearchQuery('')}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                    <FiX size={18} />
                                </button>
                            )}
                        </div>

                        {/* Patient List */}
                        <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                            {loading ? (
                                <div className="flex justify-center py-10">
                                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-600"></div>
                                </div>
                            ) : patients.length > 0 ? (
                                patients.map((patient) => (
                                    <button
                                        key={patient.specialId}
                                        onClick={() => handleSelectPatient(patient)}
                                        className={`w-full group flex items-center gap-4 p-4 rounded-xl text-left transition-all duration-200 ${selectedPatient?.specialId === patient.specialId
                                            ? 'bg-green-600 text-white shadow-md shadow-green-600/20 translate-x-1'
                                            : 'bg-white border border-gray-100 hover:border-green-200 hover:bg-green-50/50 hover:shadow-sm'
                                            }`}
                                    >
                                        <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${selectedPatient?.specialId === patient.specialId ? 'bg-white/20' : 'bg-gray-100 group-hover:bg-green-100'}`}>
                                            <FiUser className={selectedPatient?.specialId === patient.specialId ? 'text-white' : 'text-gray-500 group-hover:text-green-600'} size={20} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className={`font-semibold truncate ${selectedPatient?.specialId === patient.specialId ? 'text-white' : 'text-gray-900'}`}>{patient.childName}</p>
                                            <p className={`text-xs font-medium tracking-wide mt-0.5 truncate ${selectedPatient?.specialId === patient.specialId ? 'text-green-100' : 'text-gray-500'}`}>{patient.specialId}</p>
                                        </div>
                                        <FiChevronRight className={`flex-shrink-0 transition-transform ${selectedPatient?.specialId === patient.specialId ? 'text-white translate-x-1' : 'text-gray-300 group-hover:text-green-500'}`} />
                                    </button>
                                ))
                            ) : searchQuery.length >= 2 ? (
                                <div className="text-center py-10">
                                    <p className="text-gray-500 text-sm">No patients found</p>
                                </div>
                            ) : (
                                <div className="text-center py-10">
                                    <p className="text-gray-500 text-sm">Type at least 2 characters to search</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Patient Bookings Panel */}
                <div className="w-full lg:w-2/3">
                    <div className="bg-white rounded-2xl shadow-[0_2px_10px_-4px_rgba(0,0,0,0.1)] border border-gray-100 p-6 lg:p-8 min-h-[600px] flex flex-col">
                        {selectedPatient ? (
                            <>
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-gray-100">
                                    <div>
                                        <p className="text-sm font-medium text-green-600 tracking-wide uppercase mb-1">Patient Record</p>
                                        <h3 className="text-2xl font-bold text-gray-900">{selectedPatient.childName}</h3>
                                        <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
                                            <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-md bg-gray-100 font-medium font-mono text-xs text-gray-700">
                                                {selectedPatient.specialId}
                                            </span>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setShowScheduleModal(true)}
                                        className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-xl font-medium hover:bg-gray-800 transition-all shadow-sm hover:shadow-md active:scale-[0.98]"
                                    >
                                        <FiPlus size={18} />
                                        <span>Schedule Session</span>
                                    </button>
                                </div>

                                {/* Session Limits Display */}
                                {Object.keys(sessionLimits).length > 0 && (
                                    <div className="mb-8 p-5 bg-gradient-to-br from-green-50/50 to-emerald-50/50 border border-green-100/50 rounded-2xl">
                                        <div className="flex items-center justify-between mb-4">
                                            <h4 className="text-sm font-semibold text-green-900">Current Month Sessions</h4>
                                            <span className="text-xs font-medium px-2.5 py-1 bg-green-100 text-green-700 rounded-full">Max 2 per therapy</span>
                                        </div>
                                        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                                            {therapyTypes.map((type) => {
                                                const limit = sessionLimits[type.value] || { remaining: 2 };
                                                return (
                                                    <div
                                                        key={type.value}
                                                        className={`relative overflow-hidden flex flex-col justify-center items-center p-3 rounded-xl border transition-all ${limit.remaining === 0
                                                            ? 'bg-red-50/50 border-red-100'
                                                            : limit.remaining === 1
                                                                ? 'bg-yellow-50/50 border-yellow-100 shadow-sm'
                                                                : 'bg-white border-green-100 shadow-sm'
                                                            }`}
                                                    >
                                                        <span className={`text-2xl font-bold mb-1 ${limit.remaining === 0 ? 'text-red-600' : limit.remaining === 1 ? 'text-yellow-600' : 'text-green-600'}`}>
                                                            {limit.remaining}
                                                        </span>
                                                        <span className={`text-[10px] font-semibold tracking-wider uppercase text-center ${limit.remaining === 0 ? 'text-red-500' : limit.remaining === 1 ? 'text-yellow-600' : 'text-gray-500'}`}>
                                                            {type.value}
                                                        </span>
                                                        {limit.remaining === 0 && (
                                                            <div className="absolute top-0 right-0 w-8 h-8 bg-red-100 rotate-45 translate-x-4 -translate-y-4"></div>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}

                                {/* Bookings List */}
                                {bookingsLoading ? (
                                    <div className="flex flex-1 justify-center items-center py-12">
                                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-600"></div>
                                    </div>
                                ) : patientBookings.length > 0 ? (
                                    <div className="space-y-4 flex-1 overflow-y-auto pr-2 custom-scrollbar">
                                        {patientBookings.map((booking) => (
                                            <div
                                                key={booking.bookingId || booking._id}
                                                className="group flex flex-col sm:flex-row sm:items-center gap-4 p-5 bg-white border border-gray-100 rounded-2xl hover:border-green-200 hover:shadow-md hover:shadow-green-500/5 transition-all"
                                            >
                                                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 flex items-center justify-center flex-shrink-0">
                                                    <FiClock className="text-gray-500" size={20} />
                                                </div>

                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-3 mb-1.5">
                                                        <h4 className="font-semibold text-gray-900 text-lg">{booking.therapyType}</h4>
                                                        <span className={`px-2.5 py-1 rounded-md text-[11px] font-bold tracking-wider uppercase ${booking.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                                                            booking.status === 'completed' ? 'bg-blue-100 text-blue-700' :
                                                                'bg-red-100 text-red-700'
                                                            }`}>
                                                            {booking.status}
                                                        </span>
                                                    </div>
                                                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                                                        <div className="flex items-center gap-1.5 bg-gray-50 px-2.5 py-1 rounded-md border border-gray-100">
                                                            <FiCalendar size={14} className="text-gray-400" />
                                                            <span className="font-medium text-gray-700">{new Date(booking.date).toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                                        </div>
                                                        <div className="flex items-center gap-1.5 bg-gray-50 px-2.5 py-1 rounded-md border border-gray-100">
                                                            <FiClock size={14} className="text-gray-400" />
                                                            <span className="font-medium text-gray-700">{booking.timeSlot}</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                {booking.status === 'confirmed' && (
                                                    <div className="flex items-center gap-2 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity mt-2 sm:mt-0">
                                                        <button
                                                            onClick={() => handleEditBooking(booking)}
                                                            className="flex items-center justify-center w-10 h-10 bg-white border border-gray-200 text-gray-600 hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50 rounded-xl transition-colors"
                                                            title="Reschedule Session"
                                                        >
                                                            <FiEdit size={16} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleCancelBooking(booking.bookingId || booking._id)}
                                                            className="flex items-center justify-center w-10 h-10 bg-white border border-gray-200 text-gray-600 hover:text-red-600 hover:border-red-200 hover:bg-red-50 rounded-xl transition-colors"
                                                            title="Cancel Session"
                                                        >
                                                            <FiTrash2 size={16} />
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center flex-1 py-16 text-center border-2 border-dashed border-gray-100 rounded-2xl bg-gray-50/50">
                                        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm border border-gray-100">
                                            <FiCalendar className="text-gray-400" size={24} />
                                        </div>
                                        <h4 className="text-lg font-semibold text-gray-900 mb-1">No Active Sessions</h4>
                                        <p className="text-gray-500 mb-6 text-sm">This patient doesn't have any sessions scheduled yet.</p>
                                        <button
                                            onClick={() => setShowScheduleModal(true)}
                                            className="inline-flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm"
                                        >
                                            <FiPlus size={18} />
                                            Schedule First Session
                                        </button>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center px-6">
                                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6 border border-gray-100 shadow-sm">
                                    <FiCalendar className="text-gray-400" size={32} />
                                </div>
                                <h3 className="text-xl font-semibold text-gray-900 mb-2">No Patient Selected</h3>
                                <p className="text-gray-500 max-w-sm text-sm">Select a patient from the list or search for a specific patient to manage their therapy sessions.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Schedule Modal */}
            {showScheduleModal && selectedPatient && (
                <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg border border-gray-100 overflow-hidden transform transition-all">
                        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 bg-gray-50/50">
                            <div>
                                <h3 className="text-xl font-bold text-gray-900 tracking-tight">{editingBooking ? 'Reschedule Session' : 'Schedule New Session'}</h3>
                                <p className="text-sm text-gray-500 mt-1 font-medium">{selectedPatient.childName} <span className="text-gray-300 mx-2">|</span> {selectedPatient.specialId}</p>
                            </div>
                            <button
                                onClick={() => {
                                    setShowScheduleModal(false);
                                    setEditingBooking(null);
                                    setScheduleForm({ therapyType: '', date: '', timeSlot: '', therapistId: '' });
                                }}
                                className="w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-200 transition-colors"
                            >
                                <FiX size={20} />
                            </button>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Therapy Type */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Therapy Type <span className="text-red-500">*</span></label>
                                <select
                                    value={scheduleForm.therapyType}
                                    onChange={(e) => setScheduleForm({ ...scheduleForm, therapyType: e.target.value, timeSlot: '', therapistId: '' })}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all text-sm font-medium outline-none"
                                >
                                    <option value="">Select therapy type</option>
                                    {therapyTypes.map((type) => {
                                        const limit = sessionLimits[type.value] || { remaining: 2 };
                                        return (
                                            <option key={type.value} value={type.value} disabled={limit.remaining === 0}>
                                                {type.label} ({limit.remaining}/2 remaining)
                                            </option>
                                        );
                                    })}
                                </select>
                                {scheduleForm.therapyType && sessionLimits[scheduleForm.therapyType] && (
                                    <div className="mt-2 flex items-center gap-2">
                                        <div className={`w-2 h-2 rounded-full ${sessionLimits[scheduleForm.therapyType].remaining === 0 ? 'bg-red-500' : sessionLimits[scheduleForm.therapyType].remaining === 1 ? 'bg-yellow-500' : 'bg-green-500'}`}></div>
                                        <p className="text-xs font-medium text-gray-600">
                                            {sessionLimits[scheduleForm.therapyType].remaining} session(s) remaining this month
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Therapist */}
                            {scheduleForm.therapyType && (
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Therapist <span className="text-gray-400 font-normal">(Optional)</span></label>
                                    {therapistsLoading ? (
                                        <div className="flex justify-center py-3 bg-gray-50 border border-gray-100 rounded-xl">
                                            <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-green-600"></div>
                                        </div>
                                    ) : (
                                        <select
                                            value={scheduleForm.therapistId}
                                            onChange={(e) => setScheduleForm({ ...scheduleForm, therapistId: e.target.value })}
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all text-sm font-medium outline-none"
                                        >
                                            <option value="">Auto-assign available therapist</option>
                                            {therapists.map((therapist) => (
                                                <option key={therapist._id} value={therapist._id}>
                                                    {therapist.staffId?.name || therapist.name || 'Unknown'}
                                                </option>
                                            ))}
                                        </select>
                                    )}
                                </div>
                            )}

                            {/* Date */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Date <span className="text-red-500">*</span></label>
                                <div className="relative">
                                    <FiCalendar className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                    <input
                                        type="date"
                                        value={scheduleForm.date}
                                        onChange={(e) => setScheduleForm({ ...scheduleForm, date: e.target.value, timeSlot: '' })}
                                        min={new Date().toISOString().split('T')[0]}
                                        className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all text-sm font-medium outline-none"
                                    />
                                </div>
                            </div>

                            {/* Time Slot */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Available Time Slots <span className="text-red-500">*</span></label>
                                {slotsLoading ? (
                                    <div className="flex justify-center py-6 bg-gray-50 border border-gray-100 rounded-xl">
                                        <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-green-600"></div>
                                    </div>
                                ) : scheduleForm.date && scheduleForm.therapyType ? (
                                    availableSlots.length > 0 ? (
                                        <div className="grid grid-cols-3 gap-3">
                                            {availableSlots.map((slot) => (
                                                <button
                                                    key={slot.time}
                                                    type="button"
                                                    disabled={!slot.available}
                                                    onClick={() => setScheduleForm({ ...scheduleForm, timeSlot: slot.time })}
                                                    className={`py-3 px-2 rounded-xl text-sm font-medium transition-all ${!slot.available
                                                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed opacity-60 border border-transparent'
                                                        : scheduleForm.timeSlot === slot.time
                                                            ? 'bg-gray-900 text-white shadow-md border border-gray-900 scale-[0.98]'
                                                            : 'bg-white border border-gray-200 text-gray-700 hover:border-gray-400 hover:shadow-sm'
                                                        }`}
                                                >
                                                    {slot.time}
                                                </button>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center p-6 bg-gray-50 border border-gray-100 rounded-xl border-dashed">
                                            <FiClock className="text-gray-300 mb-2" size={24} />
                                            <p className="text-center text-sm text-gray-500">No slots available for this date</p>
                                        </div>
                                    )
                                ) : (
                                    <div className="p-4 bg-gray-50 border border-gray-100 rounded-xl">
                                        <p className="text-center text-sm text-gray-500">Select therapy type and date to view slots</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="flex gap-3 px-6 py-5 border-t border-gray-100 bg-gray-50/50">
                            <button
                                onClick={() => {
                                    setShowScheduleModal(false);
                                    setEditingBooking(null);
                                    setScheduleForm({ therapyType: '', date: '', timeSlot: '', therapistId: '' });
                                }}
                                className="flex-1 py-3 bg-white border border-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={editingBooking ? handleRescheduleBooking : handleScheduleBooking}
                                disabled={!scheduleForm.therapyType || !scheduleForm.date || !scheduleForm.timeSlot}
                                className="flex-1 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-all shadow-sm shadow-green-600/20 disabled:opacity-50 disabled:shadow-none disabled:cursor-not-allowed"
                            >
                                {editingBooking ? 'Confirm Reschedule' : 'Confirm Booking'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BookingManagement;
