import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getPhotoUrl } from '../../utils/photoUtils';
import {
    ArrowLeft,
    User,
    Phone,
    Mail,
    MapPin,
    Calendar,
    Activity,
    ShieldAlert,
    FileText,
    Brain,
    Clock,
    Camera,
    Loader2
} from 'lucide-react';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const ParentProfile = () => {
    const { user, updateUser } = useAuth();
    const navigate = useNavigate();
    const [patient, setPatient] = useState(null);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef(null);

    useEffect(() => {
        const fetchProfile = async () => {
            if (user?.specialId) {
                try {
                    const res = await api.get(`/patients/${user.specialId}`);
                    if (res.data.success) {
                        setPatient(res.data.data);
                    }
                } catch (e) {
                    // Fallback to basic user info if fetch fails
                    setPatient({
                        childName: user?.childName || 'Child',
                        specialId: user?.specialId,
                        parentName: user?.name || 'Guardian'
                    });
                }
            }
            setLoading(false);
        };
        fetchProfile();
    }, [user]);

    const handlePhotoClick = () => {
        if (!uploading) {
            fileInputRef.current?.click();
        }
    };

    const handlePhotoChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Validate file size (5MB limit)
        if (file.size > 5 * 1024 * 1024) {
            toast.error('File size exceeds 5MB limit');
            return;
        }

        // Validate file type
        if (!file.type.startsWith('image/')) {
            toast.error('Only image files are allowed');
            return;
        }

        setUploading(true);
        try {
            // Step 1: Upload to Cloudinary
            const formData = new FormData();
            formData.append('file', file);

            const uploadRes = await api.post('/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
                timeout: 30000
            });

            if (!uploadRes.data.success) {
                throw new Error('Upload failed');
            }

            const newPhotoUrl = uploadRes.data.data.url;

            // Step 2: Update patient record with new photo URL
            const updateRes = await api.patch(`/patients/${user.specialId}/photo`, {
                photoUrl: newPhotoUrl
            });

            if (updateRes.data.success) {
                setPatient(prev => ({ ...prev, photoUrl: newPhotoUrl }));
                toast.success('Photo updated successfully!');
            }
        } catch (error) {
            console.error('Photo update error:', error);
            toast.error(error.response?.data?.error?.message || 'Failed to update photo');
        } finally {
            setUploading(false);
            // Reset file input so same file can be selected again
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[60vh]">
                <div className="relative w-12 h-12">
                    <div className="absolute inset-0 border-4 border-slate-100 rounded-full"></div>
                    <div className="absolute inset-0 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
                </div>
            </div>
        );
    }

    if (!patient) {
        return (
            <div className="text-center py-12">
                <User className="mx-auto mb-4 text-slate-300" size={48} />
                <p className="text-slate-500 font-medium">Profile information not available.</p>
                <button
                    onClick={() => navigate('/parent/dashboard')}
                    className="mt-4 text-blue-600 font-bold hover:underline"
                >
                    Return to Dashboard
                </button>
            </div>
        );
    }

    const InfoCard = ({ icon: Icon, title, children }) => (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-soft">
            <h3 className="text-lg font-extrabold text-slate-900 tracking-tight-premium mb-6 flex items-center gap-3 border-b border-slate-100 pb-4">
                <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                    <Icon size={20} strokeWidth={2.5} />
                </div>
                {title}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8">
                {children}
            </div>
        </div>
    );

    const InfoField = ({ label, value, colSpan = false, isArray = false }) => (
        <div className={colSpan ? "md:col-span-2" : ""}>
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">{label}</label>
            {isArray && Array.isArray(value) ? (
                <div className="flex flex-wrap gap-2 mt-1">
                    {value.length > 0 ? value.map((v, i) => (
                        <span key={i} className="px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-md text-xs font-bold ring-1 ring-indigo-100/50">
                            {v}
                        </span>
                    )) : <span className="text-slate-400 text-sm font-medium italic">None recorded</span>}
                </div>
            ) : (
                <div className="text-sm font-semibold text-slate-900 bg-slate-50 py-2.5 px-3.5 rounded-lg border border-slate-100/60 leading-relaxed min-h-[42px] content-center">
                    {value || <span className="text-slate-400 italic">Not provided</span>}
                </div>
            )}
        </div>
    );

    return (
        <div className="space-y-8 pb-10 max-w-5xl mx-auto">
            {/* Header Module */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/parent/dashboard')}
                        className="w-10 h-10 rounded-full bg-white border border-slate-200 shadow-sm flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-premium"
                    >
                        <ArrowLeft size={20} strokeWidth={2.5} />
                    </button>
                    <div>
                        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight-premium">
                            Full Profile
                        </h1>
                        <p className="text-sm font-semibold text-slate-500 mt-1">Reviewing medical & contact records</p>
                    </div>
                </div>
            </div>

            {/* Hidden file input */}
            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handlePhotoChange}
            />

            {/* Profile Header Card */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-8 shadow-hover text-white flex flex-col md:flex-row items-center gap-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-6 opacity-10 pointer-events-none">
                    <User size={160} />
                </div>

                <div className="flex-shrink-0 relative z-10 group">
                    <div
                        className="w-28 h-28 rounded-2xl bg-white/10 backdrop-blur-sm border-4 border-white/20 flex items-center justify-center text-white text-4xl font-extrabold shadow-inner overflow-hidden cursor-pointer relative"
                        onClick={handlePhotoClick}
                    >
                        {patient?.photoUrl ? (
                            <img src={getPhotoUrl(patient.photoUrl)} alt={patient.childName} className="w-full h-full object-cover" />
                        ) : (
                            patient?.childName?.charAt(0) || 'C'
                        )}

                        {/* Photo edit overlay */}
                        <div className={`absolute inset-0 flex items-center justify-center transition-all duration-200 ${uploading ? 'bg-black/50' : 'bg-black/0 group-hover:bg-black/40'}`}>
                            {uploading ? (
                                <Loader2 size={28} className="text-white animate-spin" />
                            ) : (
                                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col items-center gap-1">
                                    <Camera size={22} className="text-white" />
                                    <span className="text-[10px] font-bold text-white uppercase tracking-wider">Edit</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex-1 text-center md:text-left z-10">
                    <div className="inline-flex items-center gap-2 bg-white/20 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-3">
                        <ShieldAlert size={14} /> Official Record
                    </div>
                    <h2 className="text-3xl font-extrabold tracking-tight-premium text-balance mb-2">
                        {patient?.childName || 'Child Identity'}
                    </h2>
                    <p className="text-blue-100 font-semibold mb-6">Patient ID: <span className="text-white bg-white/10 px-2 py-0.5 rounded font-mono ml-1">{patient?.specialId || 'MEC-XXXXXX'}</span></p>

                    <div className="flex flex-wrap justify-center md:justify-start gap-3">
                        <div className="bg-black/20 backdrop-blur-sm px-4 py-2 rounded-xl border border-white/10">
                            <p className="text-[10px] font-bold text-blue-200 uppercase tracking-wider">Age</p>
                            <p className="font-bold">{patient?.age ? `${patient.age} years` : '-'}</p>
                        </div>
                        <div className="bg-black/20 backdrop-blur-sm px-4 py-2 rounded-xl border border-white/10">
                            <p className="text-[10px] font-bold text-blue-200 uppercase tracking-wider">Gender</p>
                            <p className="font-bold">{patient?.gender || '-'}</p>
                        </div>
                        <div className="bg-black/20 backdrop-blur-sm px-4 py-2 rounded-xl border border-white/10">
                            <p className="text-[10px] font-bold text-blue-200 uppercase tracking-wider">Severity Index</p>
                            <p className="font-bold flex items-center gap-1">
                                {patient?.severity === 'Severe' && <Activity size={14} className="text-rose-300" />}
                                {patient?.severity || 'Pending'}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Profile Details Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-8">
                    {/* Guardian Information */}
                    <InfoCard icon={User} title="Guardian Information">
                        <InfoField label="Primary Contact Name" value={patient.parentName} colSpan />
                        <InfoField label="Relationship" value={patient.relationship} />
                        <InfoField label="Phone Number" value={patient.parentPhone} />
                        <InfoField label="Email Address" value={patient.parentEmail} colSpan />
                        <InfoField label="Alternate Phone" value={patient.alternatePhone} />
                    </InfoCard>

                    {/* Address Information */}
                    <InfoCard icon={MapPin} title="Address Details">
                        <InfoField label="Residential Address" value={patient.address} colSpan />
                    </InfoCard>
                </div>

                <div className="space-y-8">
                    {/* Medical Diagnostic Info */}
                    <InfoCard icon={Brain} title="Clinical & Diagnostic">
                        <InfoField label="Date of Birth" value={patient.dateOfBirth ? new Date(patient.dateOfBirth).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : null} />
                        <InfoField label="Registration Date" value={patient.registrationDate ? new Date(patient.registrationDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : null} />
                        <InfoField label="Primary Validated Diagnoses" value={patient.diagnosis} colSpan isArray />
                        <InfoField label="Referred By" value={patient.referredBy} colSpan />
                    </InfoCard>

                    {/* Additional Medical History */}
                    <InfoCard icon={FileText} title="Medical History & Notes">
                        <InfoField label="Presenting Problems" value={patient.presentingProblems} colSpan />
                        <InfoField label="Prior Medical History" value={patient.medicalHistory} colSpan />
                    </InfoCard>
                </div>
            </div>

            <div className="text-center pt-4">
                <p className="text-xs font-semibold text-slate-400">
                    If any of this information appears incorrect, please contact the receptionist desk for amendments.
                </p>
            </div>
        </div>
    );
};

export default ParentProfile;


