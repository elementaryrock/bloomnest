import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { FiUser, FiPhone, FiMail, FiMapPin, FiCalendar, FiActivity, FiEdit, FiSave, FiArrowLeft, FiX } from 'react-icons/fi';
import api from '../../services/api';

const PatientDetails = () => {
    const { specialId } = useParams();
    const navigate = useNavigate();
    const [patient, setPatient] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [photoUrl, setPhotoUrl] = useState(null);

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors }
    } = useForm();

    useEffect(() => {
        fetchPatient();
    }, [specialId]);

    const fetchPatient = async () => {
        try {
            const res = await api.get(`/patients/${specialId}`);
            if (res.data.success) {
                setPatient(res.data.data);
                setPhotoUrl(res.data.data.photoUrl);
                reset(res.data.data);
            }
        } catch (error) {
            toast.error('Failed to load patient details');
            navigate('/receptionist/search');
        } finally {
            setLoading(false);
        }
    };

    const handlePhotoChange = async (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                toast.error('File size exceeds 5MB limit');
                return;
            }

            const formData = new FormData();
            formData.append('file', file);

            setUploading(true);
            try {
                const res = await api.post('/upload', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });

                if (res.data.success) {
                    setPhotoUrl(res.data.data.url);
                    toast.success('Photo uploaded successfully');
                }
            } catch (error) {
                console.error('Photo upload error:', error);
                toast.error(error.response?.data?.error?.message || 'Failed to upload photo');
            } finally {
                setUploading(false);
            }
        }
    };

    const onSubmit = async (data) => {
        setSaving(true);
        try {
            const res = await api.put(`/patients/${specialId}`, {
                parentName: data.parentName,
                parentPhone: data.parentPhone,
                parentEmail: data.parentEmail,
                alternatePhone: data.alternatePhone,
                relationship: data.relationship,
                address: data.address,
                severity: data.severity,
                presentingProblems: data.presentingProblems,
                medicalHistory: data.medicalHistory,
                photoUrl: photoUrl
            });
            if (res.data.success) {
                toast.success('Patient updated successfully');
                setEditMode(false);
                fetchPatient();
            }
        } catch (error) {
            toast.error(error.response?.data?.error?.message || 'Failed to update patient');
        } finally {
            setSaving(false);
        }
    };

    const cancelEdit = () => {
        reset(patient);
        setPhotoUrl(patient.photoUrl);
        setEditMode(false);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-600"></div>
            </div>
        );
    }

    if (!patient) {
        return (
            <div className="text-center py-12">
                <FiUser className="mx-auto mb-4 text-gray-400" size={48} />
                <p className="text-gray-500">Patient not found</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/receptionist/search')}
                        className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                    >
                        <FiArrowLeft size={20} />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Patient Details</h1>
                        <p className="text-green-600 font-medium">{specialId}</p>
                    </div>
                </div>
                {!editMode ? (
                    <button
                        onClick={() => setEditMode(true)}
                        className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition"
                    >
                        <FiEdit />
                        Edit Details
                    </button>
                ) : (
                    <div className="flex gap-3">
                        <button
                            onClick={cancelEdit}
                            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg font-medium hover:bg-gray-50"
                        >
                            <FiX />
                            Cancel
                        </button>
                        <button
                            onClick={handleSubmit(onSubmit)}
                            disabled={saving}
                            className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:opacity-50"
                        >
                            {saving ? (
                                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-white"></div>
                            ) : (
                                <FiSave />
                            )}
                            Save Changes
                        </button>
                    </div>
                )}
            </div>

            <form onSubmit={handleSubmit(onSubmit)}>
                {/* Child Information */}
                <div className="bg-white rounded-xl shadow-md p-6 mb-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                        <FiUser className="text-green-600" />
                        Child Information
                    </h3>
                    <div className="flex flex-col md:flex-row gap-8 mb-8">
                        {/* Photo Section */}
                        <div className="flex-shrink-0">
                            <div className="w-32 h-32 rounded-2xl bg-gray-100 overflow-hidden relative shadow-inner border border-gray-100">
                                {photoUrl ? (
                                    <img src={photoUrl} alt={patient.childName} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                                        <FiUser size={48} />
                                    </div>
                                )}
                                {uploading && (
                                    <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-white"></div>
                                    </div>
                                )}
                            </div>
                            {editMode && (
                                <div className="mt-3">
                                    <label className="block">
                                        <span className="text-xs font-bold text-green-600 bg-green-50 px-3 py-1.5 rounded-lg cursor-pointer hover:bg-green-100 transition inline-block text-center w-full">
                                            Change Photo
                                        </span>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={handlePhotoChange}
                                        />
                                    </label>
                                </div>
                            )}
                        </div>

                        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <div>
                                <label className="block text-sm text-gray-500 mb-1">Child Name</label>
                                {editMode ? (
                                    <input
                                        type="text"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                                        {...register('childName', { required: 'Name is required' })}
                                    />
                                ) : (
                                    <p className="font-medium text-gray-800">{patient.childName}</p>
                                )}
                            </div>
                            <div>
                                <label className="block text-sm text-gray-500 mb-1">Date of Birth</label>
                                {editMode ? (
                                    <input
                                        type="date"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                                        {...register('dateOfBirth', { required: 'DOB is required' })}
                                    />
                                ) : (
                                    <p className="font-medium text-gray-800">
                                        {new Date(patient.dateOfBirth).toLocaleDateString('en-IN')}
                                    </p>
                                )}
                            </div>
                            <div>
                                <label className="block text-sm text-gray-500 mb-1">Age</label>
                                <p className="font-medium text-gray-800">{patient.age} years</p>
                            </div>
                            <div>
                                <label className="block text-sm text-gray-500 mb-1">Gender</label>
                                {editMode ? (
                                    <select
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                                        {...register('gender')}
                                    >
                                        <option value="Male">Male</option>
                                        <option value="Female">Female</option>
                                        <option value="Other">Other</option>
                                    </select>
                                ) : (
                                    <p className="font-medium text-gray-800">{patient.gender}</p>
                                )}
                            </div>
                            <div>
                                <label className="block text-sm text-gray-500 mb-1">Diagnosis</label>
                                <div className="flex flex-wrap gap-2">
                                    {patient.diagnosis?.map((d) => (
                                        <span key={d} className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-sm">
                                            {d}
                                        </span>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm text-gray-500 mb-1">Registration Date</label>
                                <p className="font-medium text-gray-800">
                                    {new Date(patient.registrationDate).toLocaleDateString('en-IN')}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Parent/Guardian Information */}
                <div className="bg-white rounded-xl shadow-md p-6 mb-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                        <FiPhone className="text-green-600" />
                        Parent/Guardian Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Parent Name</label>
                            {editMode ? (
                                <input
                                    type="text"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                                    {...register('parentName', { required: 'Parent name is required' })}
                                />
                            ) : (
                                <p className="font-medium text-gray-800">{patient.parentName}</p>
                            )}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Relationship</label>
                            {editMode ? (
                                <select
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                                    {...register('relationship')}
                                >
                                    <option value="">Select</option>
                                    <option value="Mother">Mother</option>
                                    <option value="Father">Father</option>
                                    <option value="Guardian">Guardian</option>
                                </select>
                            ) : (
                                <p className="font-medium text-gray-800">{patient.relationship || '-'}</p>
                            )}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                            {editMode ? (
                                <input
                                    type="tel"
                                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 ${errors.parentPhone ? 'border-red-500' : 'border-gray-300'}`}
                                    {...register('parentPhone', {
                                        required: 'Phone is required',
                                        pattern: { value: /^\d{10}$/, message: 'Enter valid 10-digit number' }
                                    })}
                                />
                            ) : (
                                <p className="font-medium text-gray-800">{patient.parentPhone}</p>
                            )}
                            {errors.parentPhone && <p className="text-red-500 text-sm mt-1">{errors.parentPhone.message}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                            {editMode ? (
                                <input
                                    type="email"
                                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 ${errors.parentEmail ? 'border-red-500' : 'border-gray-300'}`}
                                    {...register('parentEmail', {
                                        required: 'Email is required',
                                        pattern: { value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i, message: 'Invalid email' }
                                    })}
                                />
                            ) : (
                                <p className="font-medium text-gray-800">{patient.parentEmail}</p>
                            )}
                            {errors.parentEmail && <p className="text-red-500 text-sm mt-1">{errors.parentEmail.message}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Alternate Phone</label>
                            {editMode ? (
                                <input
                                    type="tel"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                                    {...register('alternatePhone')}
                                />
                            ) : (
                                <p className="font-medium text-gray-800">{patient.alternatePhone || '-'}</p>
                            )}
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                            {editMode ? (
                                <textarea
                                    rows={2}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                                    {...register('address')}
                                ></textarea>
                            ) : (
                                <p className="font-medium text-gray-800">{patient.address || '-'}</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Medical Information */}
                <div className="bg-white rounded-xl shadow-md p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                        <FiActivity className="text-green-600" />
                        Medical Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Severity</label>
                            {editMode ? (
                                <select
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                                    {...register('severity')}
                                >
                                    <option value="">Select</option>
                                    <option value="Mild">Mild</option>
                                    <option value="Moderate">Moderate</option>
                                    <option value="Severe">Severe</option>
                                </select>
                            ) : (
                                <p className="font-medium text-gray-800">{patient.severity || '-'}</p>
                            )}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Referred By</label>
                            <p className="font-medium text-gray-800">{patient.referredBy || '-'}</p>
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Presenting Problems</label>
                            {editMode ? (
                                <textarea
                                    rows={3}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                                    {...register('presentingProblems')}
                                ></textarea>
                            ) : (
                                <p className="font-medium text-gray-800">{patient.presentingProblems || '-'}</p>
                            )}
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Medical History</label>
                            {editMode ? (
                                <textarea
                                    rows={3}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                                    {...register('medicalHistory')}
                                ></textarea>
                            ) : (
                                <p className="font-medium text-gray-800">{patient.medicalHistory || '-'}</p>
                            )}
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default PatientDetails;
