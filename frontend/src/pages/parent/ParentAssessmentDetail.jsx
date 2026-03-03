import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    FiArrowLeft, FiUser, FiCalendar, FiClipboard, FiActivity,
    FiMessageSquare, FiFileText, FiCheckCircle, FiPrinter
} from 'react-icons/fi';
import { toast } from 'react-toastify';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const SectionCard = ({ icon: Icon, title, color = 'blue', children }) => (
    <div className="bg-white rounded-xl shadow-soft border border-slate-200 overflow-hidden">
        <div className={`flex items-center gap-3 px-6 py-4 border-b border-slate-100 bg-${color}-50/40`}>
            <div className={`w-8 h-8 rounded-lg bg-${color}-100 text-${color}-600 flex items-center justify-center`}>
                <Icon size={16} />
            </div>
            <h3 className="font-bold text-slate-800">{title}</h3>
        </div>
        <div className="p-6 space-y-4">
            {children}
        </div>
    </div>
);

const Field = ({ label, value }) => (
    <div>
        <label className="block text-sm font-semibold text-slate-600 mb-1.5">{label}</label>
        <div className="w-full px-4 py-2.5 border border-slate-200 rounded-lg bg-slate-50 text-slate-700 text-sm">
            {value || 'No information provided'}
        </div>
    </div>
);

const ParentAssessmentDetail = () => {
    const { assessmentId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [assessment, setAssessment] = useState(null);
    const [patient, setPatient] = useState(null);

    useEffect(() => {
        fetchAssessment();
    }, [assessmentId]);

    const fetchAssessment = async () => {
        setLoading(true);
        try {
            const res = await api.get(`/assessments/${assessmentId}`);
            if (res.data.success) {
                const { assessment: a, patient: p } = res.data.data;
                setAssessment(a);
                setPatient(p);
            }
        } catch (error) {
            toast.error('Failed to load assessment');
            navigate('/parent/assessments');
        } finally {
            setLoading(false);
        }
    };

    const handlePrint = () => {
        window.print();
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    const assessmentData = assessment?.assessmentData || {};

    return (
        <div className="space-y-6 pb-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/parent/assessments')}
                        className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg transition"
                    >
                        <FiArrowLeft size={20} />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">
                            Assessment Report
                        </h1>
                        <p className="text-sm text-slate-500 mt-0.5">
                            Assessment ID: {assessment?.assessmentId} &bull; {assessment?.assessmentDate ? new Date(assessment.assessmentDate).toLocaleDateString() : ''}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${assessment?.parentAccepted ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                        {assessment?.parentAccepted ? 'Acknowledged' : 'Pending Acknowledgment'}
                    </span>
                    <button
                        onClick={handlePrint}
                        className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-lg font-medium text-slate-700 hover:bg-slate-50 transition"
                    >
                        <FiPrinter size={16} />
                        Print
                    </button>
                </div>
            </div>

            {/* Patient Info Banner */}
            {patient && (
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-5 flex flex-wrap gap-6 items-center">
                    <div className="w-12 h-12 bg-blue-200 rounded-xl flex items-center justify-center text-blue-700 font-bold text-lg">
                        {patient.childName?.charAt(0) || 'P'}
                    </div>
                    <div>
                        <p className="text-xs font-bold text-blue-500 uppercase tracking-wider">Patient Name</p>
                        <p className="font-bold text-slate-900">{patient.childName}</p>
                    </div>
                    <div>
                        <p className="text-xs font-bold text-blue-500 uppercase tracking-wider">Patient ID</p>
                        <p className="font-semibold text-slate-800">{patient.specialId}</p>
                    </div>
                    {patient.dateOfBirth && (
                        <div>
                            <p className="text-xs font-bold text-blue-500 uppercase tracking-wider">Date of Birth</p>
                            <p className="font-semibold text-slate-800">{new Date(patient.dateOfBirth).toLocaleDateString()}</p>
                        </div>
                    )}
                    <div>
                        <p className="text-xs font-bold text-blue-500 uppercase tracking-wider">Therapist</p>
                        <p className="font-semibold text-slate-800">{assessment?.therapistId?.name || 'N/A'}</p>
                    </div>
                    {patient.diagnosis?.length > 0 && (
                        <div>
                            <p className="text-xs font-bold text-blue-500 uppercase tracking-wider">Diagnosis</p>
                            <p className="font-semibold text-slate-800">{patient.diagnosis.join(', ')}</p>
                        </div>
                    )}
                </div>
            )}

            {/* Assessment Content */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Column */}
                <div className="space-y-6">
                    <SectionCard icon={FiClipboard} title="Presenting Problems">
                        <Field
                            label="Presenting Problems"
                            value={assessmentData.presentingProblems}
                        />
                    </SectionCard>

                    <SectionCard icon={FiCalendar} title="Developmental History">
                        <Field
                            label="Prenatal History"
                            value={assessmentData.developmentalHistory?.prenatal}
                        />
                        <Field
                            label="Perinatal History"
                            value={assessmentData.developmentalHistory?.perinatal}
                        />
                        <Field
                            label="Postnatal History"
                            value={assessmentData.developmentalHistory?.postnatal}
                        />
                    </SectionCard>

                    <SectionCard icon={FiActivity} title="Motor Skills" color="green">
                        <Field
                            label="Gross Motor Skills"
                            value={assessmentData.motorSkills?.grossMotor}
                        />
                        <Field
                            label="Fine Motor Skills"
                            value={assessmentData.motorSkills?.fineMotor}
                        />
                    </SectionCard>
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                    <SectionCard icon={FiMessageSquare} title="Language Skills" color="blue">
                        <Field
                            label="Receptive Language"
                            value={assessmentData.languageSkills?.receptive}
                        />
                        <Field
                            label="Expressive Language"
                            value={assessmentData.languageSkills?.expressive}
                        />
                    </SectionCard>

                    <SectionCard icon={FiUser} title="Social & Behavioral" color="amber">
                        <Field
                            label="Social/Adaptive Skills"
                            value={assessmentData.socialAdaptiveSkills}
                        />
                        <Field
                            label="Behavioral Observations"
                            value={assessmentData.behavioralObservations}
                        />
                    </SectionCard>

                    <SectionCard icon={FiFileText} title="Clinical Summary" color="green">
                        <Field
                            label="Test Administration"
                            value={assessmentData.testAdministration}
                        />
                        <Field
                            label="Diagnosis / Clinical Impression"
                            value={assessmentData.diagnosisImpression}
                        />
                        <Field
                            label="Recommendations"
                            value={assessmentData.recommendations}
                        />
                        {assessmentData.followUpDate && (
                            <div>
                                <label className="block text-sm font-semibold text-slate-600 mb-1.5">Follow-up Date</label>
                                <div className="w-full px-4 py-2.5 border border-slate-200 rounded-lg bg-slate-50 text-slate-700 text-sm">
                                    {new Date(assessmentData.followUpDate).toLocaleDateString()}
                                </div>
                            </div>
                        )}
                    </SectionCard>
                </div>
            </div>

            {/* Acknowledgment Section */}
            {!assessment?.parentAccepted && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div>
                            <h3 className="font-bold text-amber-900 flex items-center gap-2">
                                <FiCheckCircle className="text-amber-600" />
                                Action Required
                            </h3>
                            <p className="text-sm text-amber-700 mt-1">
                                Please acknowledge that you have reviewed this assessment report.
                            </p>
                        </div>
                        <button
                            onClick={() => {
                                if (window.confirm('I acknowledge that I have reviewed this assessment report.')) {
                                    api.post(`/assessments/${assessmentId}/accept`).then(() => {
                                        toast.success('Assessment acknowledged successfully');
                                        fetchAssessment();
                                    }).catch(() => {
                                        toast.error('Failed to acknowledge assessment');
                                    });
                                }
                            }}
                            className="flex items-center gap-2 px-6 py-2.5 bg-slate-900 text-white rounded-lg font-bold text-sm hover:bg-slate-800 transition"
                        >
                            <FiCheckCircle size={16} />
                            Acknowledge Report
                        </button>
                    </div>
                </div>
            )}

            {assessment?.parentAccepted && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-6">
                    <div className="flex items-center gap-3">
                        <FiCheckCircle className="text-emerald-600" size={24} />
                        <div>
                            <h3 className="font-bold text-emerald-900">Acknowledged</h3>
                            <p className="text-sm text-emerald-700">
                                This assessment was acknowledged on {assessment.parentAcceptedAt ? new Date(assessment.parentAcceptedAt).toLocaleDateString() : 'N/A'}
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ParentAssessmentDetail;
