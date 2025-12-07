import React, { useState, useEffect } from 'react';
import { FiSearch, FiUser, FiCalendar, FiClock, FiX, FiPlus, FiTrash2, FiChevronRight } from 'react-icons/fi';
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

    // Schedule form state
    const [scheduleForm, setScheduleForm] = useState({
        therapyType: '',
        date: '',
        timeSlot: ''
    });
    const [availableSlots, setAvailableSlots] = useState([]);
    const [slotsLoading, setSlotsLoading] = useState(false);

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
                setPatientBookings(res.data.data || []);
            }
        } catch (error) {
            console.error('Fetch bookings error:', error);
            setPatientBookings([]);
        } finally {
            setBookingsLoading(false);
        }
    };

    // Select patient
    const handleSelectPatient = (patient) => {
        setSelectedPatient(patient);
        fetchPatientBookings(patient.specialId);
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
                timeSlot: scheduleForm.timeSlot
            });
            if (res.data.success) {
                toast.success('Session scheduled successfully!');
                setShowScheduleModal(false);
                setScheduleForm({ therapyType: '', date: '', timeSlot: '' });
                fetchPatientBookings(selectedPatient.specialId);
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

    const getStatusColor = (status) => {
        switch (status) {
            case 'confirmed': return 'bg-green-100 text-green-700';
            case 'completed': return 'bg-blue-100 text-blue-700';
            case 'cancelled': return 'bg-red-100 text-red-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-800">Booking Management</h1>
                <p className="text-gray-600">Schedule and manage therapy sessions for patients</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Patient Search Panel */}
                <div className="bg-white rounded-xl shadow-md p-6">
                    <h3 className="font-semibold text-gray-800 mb-4">Search Patient</h3>

                    {/* Search Box */}
                    <div className="relative mb-4">
                        <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search by name or Special ID..."
                            className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                        />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery('')}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                                <FiX size={18} />
                            </button>
                        )}
                    </div>

                    {/* Patient List */}
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                        {loading ? (
                            <div className="flex justify-center py-8">
                                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-green-600"></div>
                            </div>
                        ) : patients.length > 0 ? (
                            patients.map((patient) => (
                                <button
                                    key={patient.specialId}
                                    onClick={() => handleSelectPatient(patient)}
                                    className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition ${selectedPatient?.specialId === patient.specialId
                                            ? 'bg-green-100 border-2 border-green-500'
                                            : 'bg-gray-50 hover:bg-gray-100'
                                        }`}
                                >
                                    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                                        <FiUser className="text-gray-500" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-medium text-gray-800">{patient.childName}</p>
                                        <p className="text-sm text-green-600">{patient.specialId}</p>
                                    </div>
                                    <FiChevronRight className="text-gray-400" />
                                </button>
                            ))
                        ) : searchQuery.length >= 2 ? (
                            <p className="text-center text-gray-500 py-8">No patients found</p>
                        ) : (
                            <p className="text-center text-gray-500 py-8">Type at least 2 characters to search</p>
                        )}
                    </div>
                </div>

                {/* Patient Bookings Panel */}
                <div className="bg-white rounded-xl shadow-md p-6">
                    {selectedPatient ? (
                        <>
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <h3 className="font-semibold text-gray-800">{selectedPatient.childName}</h3>
                                    <p className="text-sm text-green-600">{selectedPatient.specialId}</p>
                                </div>
                                <button
                                    onClick={() => setShowScheduleModal(true)}
                                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition"
                                >
                                    <FiPlus />
                                    Schedule Session
                                </button>
                            </div>

                            {/* Bookings List */}
                            {bookingsLoading ? (
                                <div className="flex justify-center py-8">
                                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-green-600"></div>
                                </div>
                            ) : patientBookings.length > 0 ? (
                                <div className="space-y-3 max-h-96 overflow-y-auto">
                                    {patientBookings.map((booking) => (
                                        <div
                                            key={booking.bookingId || booking._id}
                                            className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg"
                                        >
                                            <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center">
                                                <FiCalendar className="text-purple-600" />
                                            </div>
                                            <div className="flex-1">
                                                <p className="font-medium text-gray-800">{booking.therapyType}</p>
                                                <div className="flex items-center gap-2 text-sm text-gray-500">
                                                    <FiCalendar size={14} />
                                                    {new Date(booking.date).toLocaleDateString('en-IN')}
                                                    <FiClock size={14} className="ml-2" />
                                                    {booking.timeSlot}
                                                </div>
                                            </div>
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                                                {booking.status}
                                            </span>
                                            {booking.status === 'confirmed' && (
                                                <button
                                                    onClick={() => handleCancelBooking(booking.bookingId || booking._id)}
                                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                                                    title="Cancel Session"
                                                >
                                                    <FiTrash2 />
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12 text-gray-500">
                                    <FiCalendar className="mx-auto mb-2" size={32} />
                                    <p>No bookings found</p>
                                    <button
                                        onClick={() => setShowScheduleModal(true)}
                                        className="mt-4 text-green-600 font-medium hover:underline"
                                    >
                                        Schedule first session
                                    </button>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="text-center py-12 text-gray-500">
                            <FiUser className="mx-auto mb-2" size={32} />
                            <p>Select a patient to view bookings</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Schedule Modal */}
            {showScheduleModal && selectedPatient && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
                        <div className="flex items-center justify-between p-6 border-b">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-800">Schedule Session</h3>
                                <p className="text-sm text-gray-500">{selectedPatient.childName} - {selectedPatient.specialId}</p>
                            </div>
                            <button
                                onClick={() => setShowScheduleModal(false)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <FiX size={24} />
                            </button>
                        </div>

                        <div className="p-6 space-y-4">
                            {/* Therapy Type */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Therapy Type *</label>
                                <select
                                    value={scheduleForm.therapyType}
                                    onChange={(e) => setScheduleForm({ ...scheduleForm, therapyType: e.target.value, timeSlot: '' })}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                                >
                                    <option value="">Select therapy type</option>
                                    {therapyTypes.map((type) => (
                                        <option key={type.value} value={type.value}>{type.label}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Date */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Date *</label>
                                <input
                                    type="date"
                                    value={scheduleForm.date}
                                    onChange={(e) => setScheduleForm({ ...scheduleForm, date: e.target.value, timeSlot: '' })}
                                    min={new Date().toISOString().split('T')[0]}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                                />
                            </div>

                            {/* Time Slot */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Time Slot *</label>
                                {slotsLoading ? (
                                    <div className="flex justify-center py-4">
                                        <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-green-600"></div>
                                    </div>
                                ) : scheduleForm.date && scheduleForm.therapyType ? (
                                    availableSlots.length > 0 ? (
                                        <div className="grid grid-cols-3 gap-2">
                                            {availableSlots.map((slot) => (
                                                <button
                                                    key={slot.time}
                                                    type="button"
                                                    disabled={!slot.available}
                                                    onClick={() => setScheduleForm({ ...scheduleForm, timeSlot: slot.time })}
                                                    className={`py-2 px-3 rounded-lg text-sm font-medium transition ${!slot.available
                                                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                                            : scheduleForm.timeSlot === slot.time
                                                                ? 'bg-green-600 text-white'
                                                                : 'bg-gray-100 hover:bg-green-100 text-gray-700'
                                                        }`}
                                                >
                                                    {slot.time}
                                                </button>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-center text-gray-500 py-4">No slots available for this date</p>
                                    )
                                ) : (
                                    <p className="text-center text-gray-500 py-4">Select therapy type and date first</p>
                                )}
                            </div>
                        </div>

                        <div className="flex gap-3 p-6 border-t">
                            <button
                                onClick={() => setShowScheduleModal(false)}
                                className="flex-1 py-3 border border-gray-300 rounded-lg font-medium hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleScheduleBooking}
                                disabled={!scheduleForm.therapyType || !scheduleForm.date || !scheduleForm.timeSlot}
                                className="flex-1 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Schedule Session
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BookingManagement;
