import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiSearch, FiUser, FiPhone, FiEdit, FiTrash2, FiChevronRight, FiX } from 'react-icons/fi';
import { toast } from 'react-toastify';
import api from '../../services/api';

const PatientSearch = () => {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedPatient, setSelectedPatient] = useState(null);

    useEffect(() => {
        if (searchQuery.length >= 2) {
            const debounce = setTimeout(() => {
                searchPatients();
            }, 300);
            return () => clearTimeout(debounce);
        } else {
            setPatients([]);
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
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-800">Search Patients</h1>
                <p className="text-gray-600">Search by Special ID, child name, parent name, or phone number</p>
            </div>

            {/* Search Box */}
            <div className="bg-white rounded-xl shadow-md p-6">
                <div className="relative">
                    <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search patients..."
                        className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-lg"
                    />
                    {searchQuery && (
                        <button
                            onClick={() => setSearchQuery('')}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                            <FiX size={20} />
                        </button>
                    )}
                </div>
            </div>

            {/* Results */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Patient List */}
                <div className="bg-white rounded-xl shadow-md p-6">
                    <h3 className="font-semibold text-gray-800 mb-4">
                        {loading ? 'Searching...' : `${patients.length} Results`}
                    </h3>

                    {loading ? (
                        <div className="flex justify-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-600"></div>
                        </div>
                    ) : patients.length > 0 ? (
                        <div className="space-y-3">
                            {patients.map((patient) => (
                                <button
                                    key={patient.specialId}
                                    onClick={() => setSelectedPatient(patient)}
                                    className={`w-full flex items-center gap-4 p-4 rounded-lg transition text-left ${selectedPatient?.specialId === patient.specialId
                                        ? 'bg-green-100 border-2 border-green-500'
                                        : 'bg-gray-50 hover:bg-gray-100'
                                        }`}
                                >
                                    <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                                        <FiUser className="text-gray-500" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-medium text-gray-800">{patient.childName}</p>
                                        <p className="text-sm text-green-600">{patient.specialId}</p>
                                    </div>
                                    <FiChevronRight className="text-gray-400" />
                                </button>
                            ))}
                        </div>
                    ) : searchQuery.length >= 2 ? (
                        <div className="text-center py-8 text-gray-500">
                            <FiSearch className="mx-auto mb-2" size={32} />
                            <p>No patients found</p>
                        </div>
                    ) : (
                        <div className="text-center py-8 text-gray-500">
                            <FiSearch className="mx-auto mb-2" size={32} />
                            <p>Type at least 2 characters to search</p>
                        </div>
                    )}
                </div>

                {/* Patient Details */}
                <div className="bg-white rounded-xl shadow-md p-6">
                    <h3 className="font-semibold text-gray-800 mb-4">Patient Details</h3>

                    {selectedPatient ? (
                        <div className="space-y-4">
                            <div className="flex items-center gap-4 pb-4 border-b">
                                <div className="w-16 h-16 rounded-xl bg-gray-200 flex items-center justify-center">
                                    <FiUser className="text-gray-500" size={28} />
                                </div>
                                <div>
                                    <h4 className="text-xl font-bold text-gray-800">{selectedPatient.childName}</h4>
                                    <p className="text-green-600 font-medium">{selectedPatient.specialId}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-xs text-gray-500 uppercase">Age</p>
                                    <p className="font-medium text-gray-800">{selectedPatient.age} years</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 uppercase">Diagnosis</p>
                                    <p className="font-medium text-gray-800">{selectedPatient.diagnosis?.join(', ')}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 uppercase">Parent Name</p>
                                    <p className="font-medium text-gray-800">{selectedPatient.parentName}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 uppercase">Phone</p>
                                    <p className="font-medium text-gray-800">{selectedPatient.parentPhone}</p>
                                </div>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    onClick={() => navigate(`/receptionist/patient/${selectedPatient.specialId}/edit`)}
                                    className="flex-1 flex items-center justify-center gap-2 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition"
                                >
                                    <FiEdit />
                                    Edit Patient
                                </button>
                                <button
                                    onClick={() => handleDeactivate(selectedPatient.specialId)}
                                    className="flex items-center justify-center gap-2 py-3 px-6 border border-red-500 text-red-500 rounded-lg font-medium hover:bg-red-50 transition"
                                >
                                    <FiTrash2 />
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-12 text-gray-500">
                            <FiUser className="mx-auto mb-2" size={32} />
                            <p>Select a patient to view details</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PatientSearch;
