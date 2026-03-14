import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    FiSearch, FiUser, FiPhone, FiEdit, FiTrash2, FiChevronRight, FiX,
    FiCalendar, FiMail, FiMapPin
} from 'react-icons/fi';
import { toast } from 'react-toastify';
import api from '../../services/api';

const PatientSearch = () => {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [searchOpen, setSearchOpen] = useState(false);
    const searchRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setSearchOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        if (searchQuery.length >= 2) {
            const debounce = setTimeout(() => {
                searchPatients();
                setSearchOpen(true);
            }, 300);
            return () => clearTimeout(debounce);
        } else {
            setPatients([]);
            setSearchOpen(false);
        }
    }, [searchQuery]);

    const searchPatients = async () => {
        setLoading(true);
        try {
            const res = await api.get('/patients/search', {
                params: { query: searchQuery }
            });
            if (res.data.success) {
                setPatients(res.data.data || []);
            }
        } catch (error) {
            console.error('Search error:', error);
            toast.error('Failed to search patients');
            setPatients([]);
        } finally {
            setLoading(false);
        }
    };

    const handleSelectPatient = (patient) => {
        setSelectedPatient(patient);
        setSearchOpen(false);
    };

    const handleDeactivate = async (specialId) => {
        if (!window.confirm('Are you sure you want to deactivate this patient?')) return;

        try {
            await api.delete(`/patients/${specialId}`);
            toast.success('Patient deactivated');
            setPatients(patients.filter(p => p.specialId !== specialId));
            setSelectedPatient(null);
        } catch (error) {
            toast.error('Failed to deactivate patient');
        }
    };

    return (
        <div className="space-y-6 pb-12">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight-premium mb-2">
                    Search Patients
                </h1>
                <p className="text-slate-600">
                    Search by Special ID, child name, parent name, or phone number
                </p>
            </div>

            {/* Search Box */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-soft p-6">
                <div className="relative" ref={searchRef}>
                    <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} strokeWidth={2.5} />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onFocus={() => searchQuery.length >= 2 && setSearchOpen(true)}
                        placeholder="Search by name or patient ID..."
                        className="w-full pl-12 pr-12 py-4 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-50/50 focus:border-blue-200 outline-none text-slate-700 text-base font-medium transition-premium bg-slate-50 hover:bg-slate-100"
                    />
                    {searchQuery && (
                        <button
                            onClick={() => { setSearchQuery(''); setPatients([]); setSelectedPatient(null); }}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                        >
                            <FiX size={20} />
                        </button>
                    )}

                    {/* Search Results Dropdown */}
                    {searchOpen && (
                        <div className="absolute top-full mt-2 w-full bg-white rounded-2xl shadow-hover border border-slate-100 z-50 overflow-hidden animate-fadeIn max-h-80 overflow-y-auto">
                            {loading ? (
                                <div className="p-8 text-center">
                                    <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                                    <p className="text-sm text-slate-500 mt-2">Searching...</p>
                                </div>
                            ) : patients.length > 0 ? (
                                <div className="py-2">
                                    {patients.map((patient) => (
                                        <button
                                            key={patient.specialId}
                                            onClick={() => handleSelectPatient(patient)}
                                            className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-colors text-left ${selectedPatient?.specialId === patient.specialId ? 'bg-blue-50' : ''}`}
                                        >
                                            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center flex-shrink-0">
                                                <FiUser className="text-slate-500" size={18} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-bold text-slate-900 text-sm">{patient.childName}</p>
                                                <p className="text-xs text-slate-500 truncate">{patient.parentName}</p>
                                            </div>
                                            <div className="text-right flex-shrink-0">
                                                <p className="text-xs font-bold text-blue-600">{patient.specialId}</p>
                                            </div>
                                            <FiChevronRight className="text-slate-400" size={16} />
                                        </button>
                                    ))}
                                </div>
                            ) : searchQuery.length >= 2 ? (
                                <div className="p-8 text-center">
                                    <FiSearch className="mx-auto text-slate-300 mb-2" size={32} />
                                    <p className="text-sm text-slate-500">No patients found</p>
                                </div>
                            ) : null}
                        </div>
                    )}
                </div>
            </div>

            {/* Patient Details */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-soft overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                    <h3 className="font-bold text-slate-800">Patient Details</h3>
                </div>

                {selectedPatient ? (
                    <div className="p-6">
                        <div className="flex items-center gap-4 pb-6 border-b border-slate-100">
                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-soft">
                                <FiUser className="text-white" size={28} />
                            </div>
                            <div>
                                <h4 className="text-xl font-extrabold text-slate-900">{selectedPatient.childName}</h4>
                                <p className="text-sm font-bold text-blue-600">{selectedPatient.specialId}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-6 py-6">
                            <div className="flex items-start gap-3">
                                <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center flex-shrink-0">
                                    <FiCalendar className="text-slate-500" size={18} />
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Age</p>
                                    <p className="font-bold text-slate-800">{selectedPatient.age} years</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center flex-shrink-0">
                                    <FiUser className="text-slate-500" size={18} />
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Diagnosis</p>
                                    <p className="font-bold text-slate-800">{selectedPatient.diagnosis?.join(', ') || 'None'}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center flex-shrink-0">
                                    <FiUser className="text-slate-500" size={18} />
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Parent Name</p>
                                    <p className="font-bold text-slate-800">{selectedPatient.parentName}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center flex-shrink-0">
                                    <FiPhone className="text-slate-500" size={18} />
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Phone</p>
                                    <p className="font-bold text-slate-800">{selectedPatient.parentPhone}</p>
                                </div>
                            </div>
                            {selectedPatient.parentEmail && (
                                <div className="flex items-start gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center flex-shrink-0">
                                        <FiMail className="text-slate-500" size={18} />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Email</p>
                                        <p className="font-bold text-slate-800 text-sm">{selectedPatient.parentEmail}</p>
                                    </div>
                                </div>
                            )}
                            {selectedPatient.address && (
                                <div className="flex items-start gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center flex-shrink-0">
                                        <FiMapPin className="text-slate-500" size={18} />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Address</p>
                                        <p className="font-bold text-slate-800 text-sm">{selectedPatient.address}</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="flex gap-3 pt-4 border-t border-slate-100">
                            <button
                                onClick={() => navigate(`/receptionist/patient/${selectedPatient.specialId}/edit`)}
                                className="flex-1 flex items-center justify-center gap-2 py-3 bg-slate-900 text-white rounded-xl font-bold text-sm hover:bg-slate-800 transition-premium"
                            >
                                <FiEdit size={18} />
                                Edit Patient
                            </button>
                            <button
                                onClick={() => handleDeactivate(selectedPatient.specialId)}
                                className="flex items-center justify-center gap-2 py-3 px-6 border border-red-200 text-red-600 rounded-xl font-bold text-sm hover:bg-red-50 transition-premium"
                            >
                                <FiTrash2 size={18} />
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="p-12 text-center">
                        <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
                            <FiUser className="text-slate-400" size={32} />
                        </div>
                        <p className="text-slate-500 font-medium">Search and select a patient to view details</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PatientSearch;
