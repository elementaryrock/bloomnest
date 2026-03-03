import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiFileText, FiCalendar, FiCheckCircle, FiChevronRight, FiClock, FiAlertCircle } from 'react-icons/fi';
import { toast } from 'react-toastify';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const ParentAssessments = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [assessments, setAssessments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [acceptingId, setAcceptingId] = useState(null);

    useEffect(() => {
        fetchAssessments();
    }, [user?.specialId]);

    const fetchAssessments = async () => {
        if (!user?.specialId) return;

        try {
            setLoading(true);
            const res = await api.get(`/assessments/patient/${user.specialId}`);
            if (res.data.success) {
                // Filter out drafts - parents should only see completed assessments
                const completedAssessments = (res.data.data.assessments || []).filter(
                    a => a.status === 'completed'
                );
                setAssessments(completedAssessments);
            }
        } catch (error) {
            console.error('Fetch assessments error:', error);
            toast.error('Failed to load assessments');
        } finally {
            setLoading(false);
        }
    };

    const handleAccept = async (assessmentId) => {
        if (!window.confirm('I acknowledge that I have reviewed this assessment report.')) {
            return;
        }

        setAcceptingId(assessmentId);
        try {
            const res = await api.post(`/assessments/${assessmentId}/accept`);
            if (res.data.success) {
                toast.success('Assessment successfully acknowledged');
                // Update local state to reflect acceptance
                setAssessments(assessments.map(a =>
                    a.assessmentId === assessmentId
                        ? { ...a, parentAccepted: true, parentAcceptedAt: new Date().toISOString() }
                        : a
                ));
            }
        } catch (error) {
            toast.error(error.response?.data?.error?.message || 'Failed to accept assessment');
        } finally {
            setAcceptingId(null);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center p-12">
                <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6 pb-12">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight-premium mb-2">
                    Clinical Assessments
                </h1>
                <p className="text-slate-600">
                    Review and acknowledge diagnostic reports and evaluations for {user?.childName || 'your child'}.
                </p>
            </div>

            {/* Assessment List */}
            {assessments.length === 0 ? (
                <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center flex flex-col items-center">
                    <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mb-4">
                        <FiFileText size={28} />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 mb-1">No Assessments Yet</h3>
                    <p className="text-slate-500 max-w-sm">
                        There are currently no completed assessment reports available for review. They will appear here once finalized by the therapist.
                    </p>
                </div>
            ) : (
                <div className="space-y-4">
                    {assessments.map(assessment => (
                        <div key={assessment._id} className="bg-white rounded-xl border border-slate-200 shadow-soft p-6 flex flex-col md:flex-row md:items-center gap-6 group hover:border-slate-300 transition-premium">

                            {/* Icon & Status */}
                            <div className="flex gap-4 items-center md:w-1/4 flex-shrink-0">
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${assessment.parentAccepted
                                        ? 'bg-emerald-50 text-emerald-600'
                                        : 'bg-amber-50 text-amber-600'
                                    }`}>
                                    {assessment.parentAccepted ? <FiCheckCircle size={24} /> : <FiClock size={24} />}
                                </div>
                                <div>
                                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                                        Assessment ID
                                    </p>
                                    <p className="font-bold text-slate-900">{assessment.assessmentId}</p>
                                </div>
                            </div>

                            {/* Details */}
                            <div className="flex-1">
                                <p className="font-semibold text-slate-800 mb-1">
                                    {assessment.therapistId?.specialization?.join(', ') || 'Specialist'} Evaluation
                                </p>
                                <div className="flex items-center gap-4 text-sm text-slate-500">
                                    <span className="flex items-center gap-1.5">
                                        <FiCalendar size={14} />
                                        {new Date(assessment.assessmentDate).toLocaleDateString()}
                                    </span>
                                    {assessment.parentAccepted && assessment.parentAcceptedAt && (
                                        <span className="flex items-center gap-1.5 text-emerald-600 font-medium">
                                            <FiCheckCircle size={14} />
                                            Accepted on {new Date(assessment.parentAcceptedAt).toLocaleDateString()}
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex flex-col sm:flex-row items-center gap-3 md:justify-end">
                                {!assessment.parentAccepted && (
                                    <button
                                        onClick={() => handleAccept(assessment.assessmentId)}
                                        disabled={acceptingId === assessment.assessmentId}
                                        className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 bg-slate-900 text-white rounded-lg font-bold text-sm tracking-wide hover:bg-slate-800 transition-premium disabled:opacity-70"
                                    >
                                        {acceptingId === assessment.assessmentId ? (
                                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        ) : (
                                            'Accept Report'
                                        )}
                                    </button>
                                )}

                                <button
                                    onClick={() => navigate(`/parent/assessment/${assessment.assessmentId}`)}
                                    className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-50 text-blue-700 rounded-lg font-bold text-sm hover:bg-blue-100 transition-premium"
                                >
                                    View Details
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ParentAssessments;
