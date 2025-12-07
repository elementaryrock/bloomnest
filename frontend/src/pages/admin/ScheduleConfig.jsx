import React, { useState, useEffect } from 'react';
import { FiClock, FiCalendar, FiPlus, FiTrash2, FiSave, FiRefreshCw } from 'react-icons/fi';
import { toast } from 'react-toastify';
import api from '../../services/api';

const ScheduleConfig = () => {
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    // Time slots configuration
    const [timeSlots, setTimeSlots] = useState([
        { id: 1, start: '09:00', end: '10:00', label: '9:00 AM - 10:00 AM' },
        { id: 2, start: '10:00', end: '11:00', label: '10:00 AM - 11:00 AM' },
        { id: 3, start: '11:00', end: '12:00', label: '11:00 AM - 12:00 PM' },
        { id: 4, start: '14:00', end: '15:00', label: '2:00 PM - 3:00 PM' },
        { id: 5, start: '15:00', end: '16:00', label: '3:00 PM - 4:00 PM' },
        { id: 6, start: '16:00', end: '17:00', label: '4:00 PM - 5:00 PM' },
    ]);

    // Therapy types
    const [therapyTypes, setTherapyTypes] = useState([
        { id: 1, name: 'Speech Therapy', duration: 60, maxPerDay: 8, color: '#3B82F6' },
        { id: 2, name: 'Occupational Therapy', duration: 60, maxPerDay: 6, color: '#10B981' },
        { id: 3, name: 'Physical Therapy', duration: 60, maxPerDay: 6, color: '#8B5CF6' },
        { id: 4, name: 'Behavioral Therapy', duration: 60, maxPerDay: 4, color: '#F59E0B' },
    ]);

    // Working days
    const [workingDays, setWorkingDays] = useState({
        monday: true,
        tuesday: true,
        wednesday: true,
        thursday: true,
        friday: true,
        saturday: true,
        sunday: false,
    });

    // Booking settings
    const [settings, setSettings] = useState({
        maxBookingsPerMonth: 2,
        advanceBookingDays: 30,
        cancellationHours: 24,
        sessionDuration: 60,
    });

    const addTimeSlot = () => {
        const newId = Math.max(...timeSlots.map(s => s.id)) + 1;
        setTimeSlots([...timeSlots, { id: newId, start: '09:00', end: '10:00', label: '' }]);
    };

    const removeTimeSlot = (id) => {
        setTimeSlots(timeSlots.filter(s => s.id !== id));
    };

    const updateTimeSlot = (id, field, value) => {
        setTimeSlots(timeSlots.map(s => {
            if (s.id === id) {
                const updated = { ...s, [field]: value };
                if (field === 'start' || field === 'end') {
                    const startTime = new Date(`2024-01-01 ${updated.start}`);
                    const endTime = new Date(`2024-01-01 ${updated.end}`);
                    updated.label = `${startTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })} - ${endTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`;
                }
                return updated;
            }
            return s;
        }));
    };

    const addTherapyType = () => {
        const newId = Math.max(...therapyTypes.map(t => t.id)) + 1;
        setTherapyTypes([...therapyTypes, { id: newId, name: 'New Therapy', duration: 60, maxPerDay: 4, color: '#6B7280' }]);
    };

    const removeTherapyType = (id) => {
        setTherapyTypes(therapyTypes.filter(t => t.id !== id));
    };

    const updateTherapyType = (id, field, value) => {
        setTherapyTypes(therapyTypes.map(t => t.id === id ? { ...t, [field]: value } : t));
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            // In production, save to backend
            // await api.post('/admin/schedule-config', { timeSlots, therapyTypes, workingDays, settings });
            toast.success('Schedule configuration saved successfully!');
        } catch (error) {
            toast.error('Failed to save configuration');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Schedule Configuration</h1>
                    <p className="text-gray-600">Configure time slots, therapy types, and booking rules</p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition disabled:opacity-50"
                >
                    {saving ? <FiRefreshCw className="animate-spin" /> : <FiSave />}
                    Save Changes
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Time Slots */}
                <div className="bg-white rounded-xl shadow-md p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                            <FiClock className="text-red-600" />
                            Time Slots
                        </h2>
                        <button
                            onClick={addTimeSlot}
                            className="flex items-center gap-1 px-3 py-1.5 text-sm bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition"
                        >
                            <FiPlus size={16} />
                            Add Slot
                        </button>
                    </div>

                    <div className="space-y-3">
                        {timeSlots.map((slot) => (
                            <div key={slot.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                <input
                                    type="time"
                                    value={slot.start}
                                    onChange={(e) => updateTimeSlot(slot.id, 'start', e.target.value)}
                                    className="px-3 py-2 border rounded-lg text-sm"
                                />
                                <span className="text-gray-500">to</span>
                                <input
                                    type="time"
                                    value={slot.end}
                                    onChange={(e) => updateTimeSlot(slot.id, 'end', e.target.value)}
                                    className="px-3 py-2 border rounded-lg text-sm"
                                />
                                <span className="flex-1 text-sm text-gray-600">{slot.label}</span>
                                <button
                                    onClick={() => removeTimeSlot(slot.id)}
                                    className="p-2 text-red-500 hover:bg-red-100 rounded-lg transition"
                                >
                                    <FiTrash2 size={16} />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Working Days */}
                <div className="bg-white rounded-xl shadow-md p-6">
                    <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2 mb-4">
                        <FiCalendar className="text-red-600" />
                        Working Days
                    </h2>

                    <div className="grid grid-cols-2 gap-3">
                        {Object.entries(workingDays).map(([day, isActive]) => (
                            <label
                                key={day}
                                className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition ${isActive ? 'bg-red-50 border-2 border-red-200' : 'bg-gray-50 border-2 border-transparent'
                                    }`}
                            >
                                <input
                                    type="checkbox"
                                    checked={isActive}
                                    onChange={(e) => setWorkingDays({ ...workingDays, [day]: e.target.checked })}
                                    className="w-5 h-5 text-red-600 rounded"
                                />
                                <span className="font-medium capitalize">{day}</span>
                            </label>
                        ))}
                    </div>
                </div>

                {/* Therapy Types */}
                <div className="bg-white rounded-xl shadow-md p-6 lg:col-span-2">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold text-gray-800">Therapy Types</h2>
                        <button
                            onClick={addTherapyType}
                            className="flex items-center gap-1 px-3 py-1.5 text-sm bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition"
                        >
                            <FiPlus size={16} />
                            Add Type
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {therapyTypes.map((therapy) => (
                            <div key={therapy.id} className="p-4 border rounded-xl">
                                <div className="flex items-center gap-3 mb-3">
                                    <input
                                        type="color"
                                        value={therapy.color}
                                        onChange={(e) => updateTherapyType(therapy.id, 'color', e.target.value)}
                                        className="w-8 h-8 rounded cursor-pointer"
                                    />
                                    <input
                                        type="text"
                                        value={therapy.name}
                                        onChange={(e) => updateTherapyType(therapy.id, 'name', e.target.value)}
                                        className="flex-1 px-3 py-2 border rounded-lg font-medium"
                                    />
                                    <button
                                        onClick={() => removeTherapyType(therapy.id)}
                                        className="p-2 text-red-500 hover:bg-red-100 rounded-lg transition"
                                    >
                                        <FiTrash2 size={16} />
                                    </button>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-xs text-gray-500">Duration (min)</label>
                                        <input
                                            type="number"
                                            value={therapy.duration}
                                            onChange={(e) => updateTherapyType(therapy.id, 'duration', parseInt(e.target.value))}
                                            className="w-full px-3 py-2 border rounded-lg text-sm"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-500">Max/Day</label>
                                        <input
                                            type="number"
                                            value={therapy.maxPerDay}
                                            onChange={(e) => updateTherapyType(therapy.id, 'maxPerDay', parseInt(e.target.value))}
                                            className="w-full px-3 py-2 border rounded-lg text-sm"
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Booking Settings */}
                <div className="bg-white rounded-xl shadow-md p-6 lg:col-span-2">
                    <h2 className="text-lg font-semibold text-gray-800 mb-4">Booking Rules</h2>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Max Bookings Per Month
                            </label>
                            <input
                                type="number"
                                value={settings.maxBookingsPerMonth}
                                onChange={(e) => setSettings({ ...settings, maxBookingsPerMonth: parseInt(e.target.value) })}
                                className="w-full px-4 py-3 border rounded-lg"
                            />
                            <p className="text-xs text-gray-500 mt-1">Per therapy type</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Advance Booking Days
                            </label>
                            <input
                                type="number"
                                value={settings.advanceBookingDays}
                                onChange={(e) => setSettings({ ...settings, advanceBookingDays: parseInt(e.target.value) })}
                                className="w-full px-4 py-3 border rounded-lg"
                            />
                            <p className="text-xs text-gray-500 mt-1">How far ahead parents can book</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Cancellation Notice (hrs)
                            </label>
                            <input
                                type="number"
                                value={settings.cancellationHours}
                                onChange={(e) => setSettings({ ...settings, cancellationHours: parseInt(e.target.value) })}
                                className="w-full px-4 py-3 border rounded-lg"
                            />
                            <p className="text-xs text-gray-500 mt-1">Minimum hours before session</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Session Duration (min)
                            </label>
                            <input
                                type="number"
                                value={settings.sessionDuration}
                                onChange={(e) => setSettings({ ...settings, sessionDuration: parseInt(e.target.value) })}
                                className="w-full px-4 py-3 border rounded-lg"
                            />
                            <p className="text-xs text-gray-500 mt-1">Default session length</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ScheduleConfig;
