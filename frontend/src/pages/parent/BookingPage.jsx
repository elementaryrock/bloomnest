import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FiCheck, FiChevronLeft, FiChevronRight, FiUser, FiCalendar } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { getPhotoUrl } from '../../utils/photoUtils';

// Patient Card Component (Left Panel)
const PatientCard = ({ patient }) => {
    return (
        <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Patient Details</h3>

            <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 rounded-xl bg-gray-200 overflow-hidden flex-shrink-0">
                    {patient?.photoUrl ? (
                        <img src={getPhotoUrl(patient.photoUrl)} alt={patient.childName} className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400 text-2xl font-bold">
                            {patient?.childName?.charAt(0) || 'C'}
                        </div>
                    )}
                </div>
                <div>
                    <h4 className="font-semibold text-gray-800">{patient?.childName || 'Child Name'}</h4>
                    <p className="text-sm text-primary-600">{patient?.specialId || 'MEC2025000000'}</p>
                </div>
            </div>

            <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                    <span className="text-gray-500">Age</span>
                    <span className="font-medium text-gray-800">{patient?.age || '-'} years</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-gray-500">Gender</span>
                    <span className="font-medium text-gray-800">{patient?.gender || '-'}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-gray-500">Diagnosis</span>
                    <span className="font-medium text-gray-800">{patient?.diagnosis?.join(', ') || '-'}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-gray-500">Severity</span>
                    <span className="font-medium text-gray-800">{patient?.severity || '-'}</span>
                </div>
            </div>
        </div>
    );
};

// Week View Date Selector
const DateSelector = ({ selectedDate, onDateSelect, onWeekChange }) => {
    const [weekStart, setWeekStart] = useState(() => {
        const today = new Date();
        const day = today.getDay();
        const diff = today.getDate() - day + (day === 0 ? -6 : 1); // Adjust for Sunday
        return new Date(today.setDate(diff));
    });

    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

    const getWeekDates = () => {
        const dates = [];
        for (let i = 0; i < 7; i++) {
            const date = new Date(weekStart);
            date.setDate(weekStart.getDate() + i);
            dates.push(date);
        }
        return dates;
    };

    const weekDates = getWeekDates();

    const isPastDate = (date) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return date < today;
    };

    const isBeyond30Days = (date) => {
        const today = new Date();
        const maxDate = new Date(today);
        maxDate.setDate(today.getDate() + 30);
        return date > maxDate;
    };

    const isSelected = (date) => {
        if (!selectedDate) return false;
        return date.toDateString() === selectedDate.toDateString();
    };

    const handlePrevWeek = () => {
        const newStart = new Date(weekStart);
        newStart.setDate(weekStart.getDate() - 7);
        setWeekStart(newStart);
    };

    const handleNextWeek = () => {
        const newStart = new Date(weekStart);
        newStart.setDate(weekStart.getDate() + 7);
        setWeekStart(newStart);
    };

    const formatMonth = () => {
        const months = weekDates.map(d => d.toLocaleString('en-US', { month: 'short' }));
        const uniqueMonths = [...new Set(months)];
        return uniqueMonths.join(' - ');
    };

    return (
        <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
                <button
                    onClick={handlePrevWeek}
                    className="p-2 hover:bg-gray-100 rounded-lg transition"
                >
                    <FiChevronLeft size={20} />
                </button>
                <h3 className="font-semibold text-gray-800">{formatMonth()} {weekStart.getFullYear()}</h3>
                <button
                    onClick={handleNextWeek}
                    className="p-2 hover:bg-gray-100 rounded-lg transition"
                >
                    <FiChevronRight size={20} />
                </button>
            </div>

            <div className="grid grid-cols-7 gap-2">
                {weekDates.map((date, index) => {
                    const disabled = isPastDate(date) || isBeyond30Days(date);
                    const selected = isSelected(date);
                    const isToday = date.toDateString() === new Date().toDateString();

                    return (
                        <button
                            key={index}
                            disabled={disabled}
                            onClick={() => onDateSelect(date)}
                            className={`p-3 rounded-lg text-center transition flex flex-col items-center ${disabled
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                : selected
                                    ? 'bg-primary-600 text-white'
                                    : isToday
                                        ? 'bg-primary-50 text-primary-600 hover:bg-primary-100'
                                        : 'hover:bg-gray-100 text-gray-700'
                                }`}
                        >
                            <span className="text-xs font-medium">{days[index]}</span>
                            <span className="text-lg font-bold">{date.getDate()}</span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

// Therapy Type Selector
const TherapyTypeSelector = ({ selectedType, onTypeSelect, bookingCounts }) => {
    const therapyTypes = [
        { id: 'Psychology', label: 'Psychology', icon: '🧠' },
        { id: 'OT', label: 'Occupational Therapy', icon: '🤲' },
        { id: 'PT', label: 'Physical Therapy', icon: '🏃' },
        { id: 'Speech', label: 'Speech Therapy', icon: '🗣️' },
        { id: 'EI', label: 'Early Intervention', icon: '👶' },
    ];

    const getBookingCount = (type) => {
        return bookingCounts?.[type] || 0;
    };

    return (
        <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="font-semibold text-gray-800 mb-4">Select Therapy Type</h3>
            <div className="space-y-2">
                {therapyTypes.map((type) => {
                    const count = getBookingCount(type.id);
                    const limitReached = count >= 2;
                    const selected = selectedType === type.id;

                    return (
                        <button
                            key={type.id}
                            disabled={limitReached}
                            onClick={() => onTypeSelect(type.id)}
                            className={`w-full p-4 rounded-lg flex items-center justify-between transition ${limitReached
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                : selected
                                    ? 'bg-primary-100 border-2 border-primary-600 text-primary-700'
                                    : 'bg-gray-50 hover:bg-gray-100 text-gray-700 border-2 border-transparent'
                                }`}
                        >
                            <div className="flex items-center gap-3">
                                <span className="text-2xl">{type.icon}</span>
                                <span className="font-medium">{type.label}</span>
                            </div>
                            <div className="text-right">
                                <span className={`text-xs px-2 py-1 rounded-full ${limitReached
                                    ? 'bg-red-100 text-red-600'
                                    : 'bg-gray-200 text-gray-600'
                                    }`}>
                                    {count}/2 booked
                                </span>
                            </div>
                        </button>
                    );
                })}
            </div>
            <p className="text-xs text-gray-500 mt-3">
                Session Limit: Maximum 2 sessions per therapy type per month
            </p>
        </div>
    );
};

// Therapist Selector Component
const TherapistSelector = ({ therapists, selectedTherapist, onTherapistSelect, loading }) => {
    if (loading) {
        return (
            <div className="bg-white rounded-xl shadow-md p-6">
                <h3 className="font-semibold text-gray-800 mb-4">Select Therapist</h3>
                <div className="flex justify-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-primary-600"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="font-semibold text-gray-800 mb-4">Select Therapist</h3>
            <div className="space-y-2">
                {/* Therapist List */}
                {therapists.map((therapist) => (
                    <button
                        key={therapist._id}
                        onClick={() => onTherapistSelect(therapist._id)}
                        className={`w-full p-4 rounded-lg flex items-center gap-3 transition ${selectedTherapist === therapist._id
                            ? 'bg-primary-100 border-2 border-primary-600 text-primary-700'
                            : 'bg-gray-50 hover:bg-gray-100 text-gray-700 border-2 border-transparent'
                            }`}
                    >
                        <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                            <span className="text-primary-600 font-bold">
                                {therapist.name?.charAt(0) || 'T'}
                            </span>
                        </div>
                        <div className="text-left">
                            <p className="font-medium">{therapist.name}</p>
                            <p className="text-xs text-gray-500">{(Array.isArray(therapist.specialization) ? therapist.specialization.join(', ') : therapist.specialization) || 'Therapist'}</p>
                        </div>
                    </button>
                ))}

                {therapists.length === 0 && (
                    <p className="text-sm text-gray-500 text-center py-2">
                        No therapists available for this therapy type.
                    </p>
                )}
            </div>
        </div>
    );
};

// Time Slot Selector
const TimeSlotSelector = ({ slots, selectedSlot, onSlotSelect, loading }) => {
    const defaultSlots = [
        { timeSlot: '9:00 AM - 10:00 AM', isAvailable: true },
        { timeSlot: '10:00 AM - 11:00 AM', isAvailable: true },
        { timeSlot: '11:00 AM - 12:00 PM', isAvailable: true },
        { timeSlot: '12:00 PM - 1:00 PM', isAvailable: true },
        { timeSlot: '2:00 PM - 3:00 PM', isAvailable: true },
        { timeSlot: '3:00 PM - 4:00 PM', isAvailable: true },
        { timeSlot: '4:00 PM - 5:00 PM', isAvailable: true },
    ];

    const displaySlots = slots.length > 0 ? slots : defaultSlots;

    if (loading) {
        return (
            <div className="bg-white rounded-xl shadow-md p-6">
                <h3 className="font-semibold text-gray-800 mb-4">Select Time Slot</h3>
                <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-600"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="font-semibold text-gray-800 mb-4">Select Time Slot</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {displaySlots.map((slot, index) => {
                    const isSelected = selectedSlot === slot.timeSlot;
                    const isBooked = !slot.isAvailable;

                    return (
                        <button
                            key={index}
                            disabled={isBooked}
                            onClick={() => onSlotSelect(slot.timeSlot)}
                            className={`p-4 rounded-lg text-center transition ${isBooked
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                : isSelected
                                    ? 'bg-primary-600 text-white'
                                    : 'bg-gray-50 hover:bg-primary-50 text-gray-700 border border-gray-200'
                                }`}
                        >
                            <span className="font-medium">{slot.timeSlot}</span>
                            {isBooked && <span className="block text-xs mt-1">Booked</span>}
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

// Booked Therapies Preview
const BookedTherapiesPreview = ({ bookings, pendingBooking }) => {
    return (
        <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="font-semibold text-gray-800 mb-4">Your Booked Therapies</h3>

            {pendingBooking && (
                <div className="mb-4 p-4 bg-primary-50 border-2 border-dashed border-primary-300 rounded-lg">
                    <p className="text-xs text-primary-600 font-medium mb-1">NEW BOOKING</p>
                    <p className="font-semibold text-gray-800">{pendingBooking.therapyType}</p>
                    <p className="text-sm text-gray-600">
                        {new Date(pendingBooking.date).toLocaleDateString('en-IN', {
                            weekday: 'short',
                            day: 'numeric',
                            month: 'short'
                        })} • {pendingBooking.timeSlot}
                    </p>
                </div>
            )}

            {bookings.length > 0 ? (
                <div className="space-y-3">
                    {bookings.map((booking, index) => (
                        <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                                <FiCheck className="text-green-600" />
                            </div>
                            <div>
                                <p className="font-medium text-gray-800">{booking.therapyType}</p>
                                <p className="text-sm text-gray-500">
                                    {new Date(booking.date).toLocaleDateString('en-IN', {
                                        weekday: 'short',
                                        day: 'numeric',
                                        month: 'short'
                                    })} • {booking.timeSlot}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            ) : !pendingBooking && (
                <p className="text-gray-500 text-center py-4">No bookings yet</p>
            )}
        </div>
    );
};

// Main Booking Page
const BookingPage = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [patient, setPatient] = useState(null);
    const [selectedDate, setSelectedDate] = useState(null);
    const [selectedTherapy, setSelectedTherapy] = useState(null);
    const [selectedTherapist, setSelectedTherapist] = useState(null);
    const [selectedSlot, setSelectedSlot] = useState(null);
    const [availableSlots, setAvailableSlots] = useState([]);
    const [therapists, setTherapists] = useState([]);
    const [bookingCounts, setBookingCounts] = useState({});
    const [existingBookings, setExistingBookings] = useState([]);
    const [loading, setLoading] = useState(false);
    const [slotsLoading, setSlotsLoading] = useState(false);
    const [therapistsLoading, setTherapistsLoading] = useState(false);

    useEffect(() => {
        fetchPatientData();
        fetchExistingBookings();
    }, []);

    useEffect(() => {
        if (selectedTherapy) {
            fetchTherapists();
        }
    }, [selectedTherapy]);

    useEffect(() => {
        if (selectedDate && selectedTherapy && selectedTherapist) {
            fetchAvailableSlots();
        } else {
            setAvailableSlots([]);
        }
    }, [selectedDate, selectedTherapy, selectedTherapist]);

    const fetchPatientData = async () => {
        try {
            const res = await api.get(`/patients/${user?.specialId}`);
            if (res.data.success) {
                setPatient(res.data.data);
            }
        } catch (error) {
            // Use mock data
            setPatient({
                childName: user?.childName || 'Demo Child',
                specialId: user?.specialId || 'MEC2025000001',
                age: 8,
                gender: 'Male',
                diagnosis: ['ASD'],
                severity: 'Moderate'
            });
        }
    };

    const fetchExistingBookings = async () => {
        try {
            const res = await api.get('/bookings/my-bookings');
            if (res.data.success) {
                setExistingBookings(res.data.data || []);
                // Calculate booking counts per therapy type
                const counts = {};
                (res.data.data || []).forEach(b => {
                    counts[b.therapyType] = (counts[b.therapyType] || 0) + 1;
                });
                setBookingCounts(counts);
            }
        } catch (error) {
            console.log('Using mock booking data');
        }
    };

    const fetchTherapists = async () => {
        setTherapistsLoading(true);
        try {
            const res = await api.get('/therapists/available', {
                params: { specialization: selectedTherapy }
            });
            if (res.data.success) {
                setTherapists(res.data.data || []);
            } else {
                setTherapists([]);
            }
        } catch (error) {
            console.log('No therapists configured');
            setTherapists([]);
        } finally {
            setTherapistsLoading(false);
        }
    };

    const fetchAvailableSlots = async () => {
        setSlotsLoading(true);
        try {
            const res = await api.get('/bookings/available-slots', {
                params: {
                    date: selectedDate.toISOString(),
                    therapyType: selectedTherapy,
                    therapistId: selectedTherapist || undefined
                }
            });
            if (res.data.success) {
                const data = res.data.data;
                const slotsArray = data?.slots ? data.slots : (Array.isArray(data) ? data : []);
                setAvailableSlots(slotsArray);
            }
        } catch (error) {
            console.log('Using default slots');
            setAvailableSlots([]);
        } finally {
            setSlotsLoading(false);
        }
    };

    const handleConfirmBooking = async () => {
        if (!selectedDate || !selectedTherapy || !selectedSlot) {
            toast.error('Please select date, therapy type, and time slot');
            return;
        }

        setLoading(true);
        try {
            const res = await api.post('/bookings', {
                specialId: user?.specialId,
                therapyType: selectedTherapy,
                therapistId: selectedTherapist || undefined,
                date: selectedDate.toISOString(),
                timeSlot: selectedSlot
            });

            if (res.data.success) {
                toast.success('Booking confirmed successfully!');
                // Refresh bookings data
                await fetchExistingBookings();
                // Reset form
                setSelectedSlot(null);
                setSelectedTherapist(null);
                // Optionally navigate or stay on page
                // navigate('/parent/dashboard');
            } else {
                toast.error(res.data.error?.message || 'Booking failed');
            }
        } catch (error) {
            toast.error(error.response?.data?.error?.message || 'Booking failed');
        } finally {
            setLoading(false);
        }
    };

    const pendingBooking = selectedDate && selectedTherapy && selectedSlot
        ? { date: selectedDate, therapyType: selectedTherapy, timeSlot: selectedSlot }
        : null;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-800">Book a Session</h1>
                <p className="text-gray-600">Select date, therapy type, and time slot to book</p>
            </div>

            {/* Two Panel Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Panel */}
                <div className="space-y-6">
                    <PatientCard patient={patient} />
                    <BookedTherapiesPreview bookings={existingBookings} pendingBooking={pendingBooking} />

                    {/* Confirm Button */}
                    <button
                        onClick={handleConfirmBooking}
                        disabled={!pendingBooking || loading}
                        className={`w-full py-4 rounded-xl font-semibold text-lg transition flex items-center justify-center gap-2 ${pendingBooking && !loading
                            ? 'bg-primary-600 text-white hover:bg-primary-700'
                            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                            }`}
                    >
                        {loading ? (
                            <>
                                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                                Confirming...
                            </>
                        ) : (
                            <>
                                <FiCalendar />
                                CONFIRM BOOKING
                            </>
                        )}
                    </button>
                </div>

                {/* Right Panel */}
                <div className="lg:col-span-2 space-y-6">
                    <DateSelector
                        selectedDate={selectedDate}
                        onDateSelect={(date) => {
                            setSelectedDate(date);
                            setSelectedSlot(null); // Reset slot when date changes
                        }}
                    />

                    <TherapyTypeSelector
                        selectedType={selectedTherapy}
                        onTypeSelect={(type) => {
                            setSelectedTherapy(type);
                            setSelectedTherapist(null); // Reset therapist when therapy changes
                            setSelectedSlot(null); // Reset slot when therapy changes
                        }}
                        bookingCounts={bookingCounts}
                    />

                    {selectedTherapy && (
                        <TherapistSelector
                            therapists={therapists}
                            selectedTherapist={selectedTherapist}
                            onTherapistSelect={(therapist) => {
                                setSelectedTherapist(therapist);
                                setSelectedSlot(null); // Reset slot when therapist changes
                            }}
                            loading={therapistsLoading}
                        />
                    )}

                    {selectedDate && selectedTherapy && selectedTherapist && (
                        <TimeSlotSelector
                            slots={availableSlots}
                            selectedSlot={selectedSlot}
                            onSlotSelect={setSelectedSlot}
                            loading={slotsLoading}
                        />
                    )}
                </div>
            </div>
        </div>
    );
};

export default BookingPage;




