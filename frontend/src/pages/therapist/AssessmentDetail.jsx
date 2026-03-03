import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    FiArrowLeft, FiSave, FiCheckCircle, FiUser, FiCalendar,
    FiClipboard, FiActivity, FiMessageSquare, FiFileText
} from 'react-icons/fi';
import { toast } from 'react-toastify';
import api from '../../services/api';

const SectionCard = ({ icon: Icon, title, color = 'purple', children }) => (
    <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
        <div className={`flex items-center gap-3 px-6 py-4 border-b border-gray-100 bg-${color}-50/40`}>
            <div className={`w-8 h-8 rounded-lg bg-${color}-100 text-${color}-600 flex items-center justify-center`}>
                <Icon size={16} />
            </div>
            <h3 className="font-bold text-gray-800">{title}</h3>
        </div>
        <div className="p-6 space-y-4">
            {children}
        </div>
    </div>
);

const Field = ({ label, name, value, onChange, rows = 3, disabled = false, placeholder = '' }) => (
    <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1.5">{label}</label>
        <textarea
            name={name}
            value={value || ''}
            onChange={onChange}
            rows={rows}
            disabled={disabled}
            placeholder={disabled ? '' : (placeholder || `Enter ${label.toLowerCase()}...`)}
            className={`w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition resize-none text-sm ${disabled ? 'bg-gray-50 text-gray-600 cursor-default' : 'bg-white'}`}
        />
    </div>
);

const AssessmentDetail = () => {
    const { assessmentId } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [completing, setCompleting] = useState(false);
    const [assessment, setAssessment] = useState(null);
    const [patient, setPatient] = useState(null);

    const [formData, setFormData] = useState({
        presentingProblems: '',
        developmentalHistory: { prenatal: '', perinatal: '', postnatal: '' },
        motorSkills: { grossMotor: '', fineMotor: '' },
        languageSkills: { receptive: '', expressive: '' },
        socialAdaptiveSkills: '',
        behavioralObservations: '',
        testAdministration: '',
        diagnosisImpression: '',
        recommendations: '',
        followUpDate: ''
    });

    const isDraft = assessment?.status === 'draft';

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

                const d = a.assessmentData || {};
                setFormData({
                    presentingProblems: d.presentingProblems || '',
                    developmentalHistory: {
                        prenatal: d.developmentalHistory?.prenatal || '',
                        perinatal: d.developmentalHistory?.perinatal || '',
                        postnatal: d.developmentalHistory?.postnatal || ''
                    },
                    motorSkills: {
                        grossMotor: d.motorSkills?.grossMotor || '',
                        fineMotor: d.motorSkills?.fineMotor || ''
                    },
                    languageSkills: {
                        receptive: d.languageSkills?.receptive || '',
                        expressive: d.languageSkills?.expressive || ''
                    },
                    socialAdaptiveSkills: d.socialAdaptiveSkills || '',
                    behavioralObservations: d.behavioralObservations || '',
                    testAdministration: d.testAdministration || '',
                    diagnosisImpression: d.diagnosisImpression || '',
                    recommendations: d.recommendations || '',
                    followUpDate: d.followUpDate ? new Date(d.followUpDate).toISOString().split('T')[0] : ''
                });
            }
        } catch (error) {
            toast.error('Failed to load assessment');
            navigate('/therapist/assessments');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleNestedChange = (section, field, value) => {
        setFormData(prev => ({
            ...prev,
            [section]: { ...prev[section], [field]: value }
        }));
    };

    const handleSaveDraft = async () => {
        setSaving(true);
        try {
            const payload = { ...formData };
            if (payload.followUpDate) {
                payload.followUpDate = new Date(payload.followUpDate).toISOString();
            } else {
                delete payload.followUpDate;
            }

            const res = await api.put(`/assessments/${assessmentId}`, {
                assessmentData: payload
            });
            if (res.data.success) {
                toast.success('Draft saved successfully');
            }
        } catch (error) {
            toast.error(error.response?.data?.error?.message || 'Failed to save draft');
        } finally {
            setSaving(false);
        }
    };

    const handleCompleteAssessment = async () => {
        if (!window.confirm('Are you sure you want to complete this assessment? This action cannot be undone.')) return;

        setCompleting(true);
        try {
            const payload = { ...formData };
            if (payload.followUpDate) {
                payload.followUpDate = new Date(payload.followUpDate).toISOString();
            } else {
                delete payload.followUpDate;
            }

            const res = await api.post(`/assessments/${assessmentId}/complete`, {
                assessmentData: payload
            });
            if (res.data.success) {
                toast.success(res.data.message || 'Assessment completed!');
                fetchAssessment();
            }
        } catch (error) {
            toast.error(error.response?.data?.error?.message || 'Failed to complete assessment');
        } finally {
            setCompleting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6 pb-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/therapist/assessments')}
                        className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition"
                    >
                        <FiArrowLeft size={20} />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">
                            Assessment {assessment?.assessmentId || ''}
                        </h1>
                        <p className="text-sm text-gray-500 mt-0.5">
                            Patient: {patient?.childName || assessment?.specialId} &bull; {assessment?.assessmentDate ? new Date(assessment.assessmentDate).toLocaleDateString() : ''}
                        </p>
                    </div>
                </div>

                {/* Status badge + actions */}
                <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${isDraft ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'}`}>
                        {assessment?.status || 'draft'}
                    </span>
                    {isDraft && (
                        <>
                            <button
                                onClick={handleSaveDraft}
                                disabled={saving}
                                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition disabled:opacity-60"
                            >
                                {saving ? <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" /> : <FiSave size={16} />}
                                Save Draft
                            </button>
                            <button
                                onClick={handleCompleteAssessment}
                                disabled={completing}
                                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition disabled:opacity-60"
                            >
                                {completing ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <FiCheckCircle size={16} />}
                                Complete Assessment
                            </button>
                        </>
                    )}
                </div>
            </div>

            {/* Patient Info Banner */}
            {patient && (
                <div className="bg-purple-50 border border-purple-100 rounded-xl p-5 flex flex-wrap gap-6 items-center">
                    <div className="w-12 h-12 bg-purple-200 rounded-xl flex items-center justify-center text-purple-700 font-bold text-lg">
                        {patient.childName?.charAt(0) || 'P'}
                    </div>
                    <div>
                        <p className="text-xs font-bold text-purple-500 uppercase tracking-wider">Patient</p>
                        <p className="font-bold text-gray-900">{patient.childName}</p>
                    </div>
                    <div>
                        <p className="text-xs font-bold text-purple-500 uppercase tracking-wider">ID</p>
                        <p className="font-semibold text-gray-800">{patient.specialId}</p>
                    </div>
                    {patient.dateOfBirth && (
                        <div>
                            <p className="text-xs font-bold text-purple-500 uppercase tracking-wider">DOB</p>
                            <p className="font-semibold text-gray-800">{new Date(patient.dateOfBirth).toLocaleDateString()}</p>
                        </div>
                    )}
                    {patient.diagnosis?.length > 0 && (
                        <div>
                            <p className="text-xs font-bold text-purple-500 uppercase tracking-wider">Diagnosis</p>
                            <p className="font-semibold text-gray-800">{patient.diagnosis.join(', ')}</p>
                        </div>
                    )}
                </div>
            )}

            {/* Form Sections */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Column */}
                <div className="space-y-6">
                    <SectionCard icon={FiClipboard} title="Presenting Problems">
                        <Field
                            label="Presenting Problems"
                            name="presentingProblems"
                            value={formData.presentingProblems}
                            onChange={handleChange}
                            disabled={!isDraft}
                            rows={4}
                            placeholder="Describe the patient's presenting problems and concerns..."
                        />
                    </SectionCard>

                    <SectionCard icon={FiCalendar} title="Developmental History">
                        <Field
                            label="Prenatal History"
                            name="prenatal"
                            value={formData.developmentalHistory.prenatal}
                            onChange={(e) => handleNestedChange('developmentalHistory', 'prenatal', e.target.value)}
                            disabled={!isDraft}
                            placeholder="Pregnancy complications, maternal health..."
                        />
                        <Field
                            label="Perinatal History"
                            name="perinatal"
                            value={formData.developmentalHistory.perinatal}
                            onChange={(e) => handleNestedChange('developmentalHistory', 'perinatal', e.target.value)}
                            disabled={!isDraft}
                            placeholder="Birth details, any complications..."
                        />
                        <Field
                            label="Postnatal History"
                            name="postnatal"
                            value={formData.developmentalHistory.postnatal}
                            onChange={(e) => handleNestedChange('developmentalHistory', 'postnatal', e.target.value)}
                            disabled={!isDraft}
                            placeholder="Early childhood milestones, feeding..."
                        />
                    </SectionCard>

                    <SectionCard icon={FiActivity} title="Motor Skills" color="green">
                        <Field
                            label="Gross Motor Skills"
                            name="grossMotor"
                            value={formData.motorSkills.grossMotor}
                            onChange={(e) => handleNestedChange('motorSkills', 'grossMotor', e.target.value)}
                            disabled={!isDraft}
                            placeholder="Walking, running, jumping, balance..."
                        />
                        <Field
                            label="Fine Motor Skills"
                            name="fineMotor"
                            value={formData.motorSkills.fineMotor}
                            onChange={(e) => handleNestedChange('motorSkills', 'fineMotor', e.target.value)}
                            disabled={!isDraft}
                            placeholder="Grasping, writing, drawing, manipulation..."
                        />
                    </SectionCard>
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                    <SectionCard icon={FiMessageSquare} title="Language Skills" color="blue">
                        <Field
                            label="Receptive Language"
                            name="receptive"
                            value={formData.languageSkills.receptive}
                            onChange={(e) => handleNestedChange('languageSkills', 'receptive', e.target.value)}
                            disabled={!isDraft}
                            placeholder="Comprehension, following instructions..."
                        />
                        <Field
                            label="Expressive Language"
                            name="expressive"
                            value={formData.languageSkills.expressive}
                            onChange={(e) => handleNestedChange('languageSkills', 'expressive', e.target.value)}
                            disabled={!isDraft}
                            placeholder="Speaking, vocabulary, sentence formation..."
                        />
                    </SectionCard>

                    <SectionCard icon={FiUser} title="Social & Behavioral" color="amber">
                        <Field
                            label="Social/Adaptive Skills"
                            name="socialAdaptiveSkills"
                            value={formData.socialAdaptiveSkills}
                            onChange={handleChange}
                            disabled={!isDraft}
                            placeholder="Peer interaction, self-care, play skills..."
                        />
                        <Field
                            label="Behavioral Observations"
                            name="behavioralObservations"
                            value={formData.behavioralObservations}
                            onChange={handleChange}
                            disabled={!isDraft}
                            placeholder="Attention, cooperation, emotional regulation..."
                        />
                    </SectionCard>

                    <SectionCard icon={FiFileText} title="Clinical Summary" color="green">
                        <Field
                            label="Test Administration"
                            name="testAdministration"
                            value={formData.testAdministration}
                            onChange={handleChange}
                            disabled={!isDraft}
                            placeholder="Tests administered, scores, and observations..."
                        />
                        <Field
                            label="Diagnosis / Clinical Impression"
                            name="diagnosisImpression"
                            value={formData.diagnosisImpression}
                            onChange={handleChange}
                            disabled={!isDraft}
                            rows={4}
                            placeholder="Diagnostic impressions based on evaluation..."
                        />
                        <Field
                            label="Recommendations"
                            name="recommendations"
                            value={formData.recommendations}
                            onChange={handleChange}
                            disabled={!isDraft}
                            rows={4}
                            placeholder="Recommended therapy plans, frequency, goals..."
                        />
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Follow-up Date</label>
                            <input
                                type="date"
                                name="followUpDate"
                                value={formData.followUpDate}
                                onChange={handleChange}
                                disabled={!isDraft}
                                className={`w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition text-sm ${!isDraft ? 'bg-gray-50 text-gray-600 cursor-default' : 'bg-white'}`}
                            />
                        </div>
                    </SectionCard>
                </div>
            </div>

            {/* Bottom Actions for Draft */}
            {isDraft && (
                <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                    <button
                        onClick={handleSaveDraft}
                        disabled={saving}
                        className="flex items-center gap-2 px-6 py-2.5 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition disabled:opacity-60"
                    >
                        {saving ? <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" /> : <FiSave size={16} />}
                        Save Draft
                    </button>
                    <button
                        onClick={handleCompleteAssessment}
                        disabled={completing}
                        className="flex items-center gap-2 px-6 py-2.5 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition disabled:opacity-60"
                    >
                        {completing ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <FiCheckCircle size={16} />}
                        Complete Assessment
                    </button>
                </div>
            )}
        </div>
    );
};

export default AssessmentDetail;
