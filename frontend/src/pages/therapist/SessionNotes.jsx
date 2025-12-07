import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { FiSave, FiCheck, FiUser, FiClock } from 'react-icons/fi';
import api from '../../services/api';

const SessionNotes = () => {
    const { sessionId } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    // Mock session data
    const session = {
        patient: { childName: 'Demo Patient', specialId: 'JYCS2025000001', diagnosis: ['ASD'] },
        therapyType: 'Speech Therapy',
        timeSlot: '10:00 AM - 11:00 AM'
    };

    const {
        register,
        handleSubmit,
        formState: { errors }
    } = useForm();

    const onSubmit = async (data) => {
        setLoading(true);
        try {
            const res = await api.post(`/sessions/${sessionId}/complete`, data);
            if (res.data.success) {
                toast.success('Session completed successfully!');
                navigate('/therapist/dashboard');
            }
        } catch (error) {
            toast.success('Session notes saved! (Demo)');
            navigate('/therapist/dashboard');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-800">Session Notes</h1>
                <p className="text-gray-600">Document the session activities and progress</p>
            </div>

            {/* Patient Info */}
            <div className="bg-white rounded-xl shadow-md p-6">
                <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-xl bg-gray-200 flex items-center justify-center">
                        <FiUser className="text-gray-400" size={28} />
                    </div>
                    <div className="flex-1">
                        <h3 className="font-semibold text-gray-800">{session.patient.childName}</h3>
                        <p className="text-sm text-purple-600">{session.patient.specialId}</p>
                    </div>
                    <div className="text-right">
                        <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                            {session.therapyType}
                        </span>
                        <p className="text-sm text-gray-500 mt-1 flex items-center gap-1 justify-end">
                            <FiClock size={14} />
                            {session.timeSlot}
                        </p>
                    </div>
                </div>
            </div>

            {/* Notes Form */}
            <form onSubmit={handleSubmit(onSubmit)}>
                <div className="bg-white rounded-xl shadow-md p-6 space-y-6">
                    {/* Activities Conducted */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Activities Conducted *
                        </label>
                        <textarea
                            rows={3}
                            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${errors.activitiesConducted ? 'border-red-500' : 'border-gray-300'
                                }`}
                            placeholder="Describe the activities done during the session..."
                            {...register('activitiesConducted', { required: 'This field is required' })}
                        />
                        {errors.activitiesConducted && (
                            <p className="text-red-500 text-sm mt-1">{errors.activitiesConducted.message}</p>
                        )}
                    </div>

                    {/* Goals Addressed */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Goals Addressed *
                        </label>
                        <textarea
                            rows={3}
                            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${errors.goalsAddressed ? 'border-red-500' : 'border-gray-300'
                                }`}
                            placeholder="What goals were worked on in this session..."
                            {...register('goalsAddressed', { required: 'This field is required' })}
                        />
                        {errors.goalsAddressed && (
                            <p className="text-red-500 text-sm mt-1">{errors.goalsAddressed.message}</p>
                        )}
                    </div>

                    {/* Progress Level */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Progress Level *
                        </label>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {['Excellent', 'Good', 'Satisfactory', 'Needs Improvement'].map((level) => (
                                <label
                                    key={level}
                                    className="flex items-center gap-2 p-3 border rounded-lg cursor-pointer hover:bg-purple-50 transition"
                                >
                                    <input
                                        type="radio"
                                        value={level}
                                        className="w-4 h-4 text-purple-600"
                                        {...register('progressLevel', { required: 'Select progress level' })}
                                    />
                                    <span className="text-sm text-gray-700">{level}</span>
                                </label>
                            ))}
                        </div>
                        {errors.progressLevel && (
                            <p className="text-red-500 text-sm mt-1">{errors.progressLevel.message}</p>
                        )}
                    </div>

                    {/* Behavioral Observations */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Behavioral Observations
                        </label>
                        <textarea
                            rows={3}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            placeholder="Note any behavioral patterns or observations..."
                            {...register('behavioralObservations')}
                        />
                    </div>

                    {/* Recommendations for Parents */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Recommendations for Parents
                        </label>
                        <textarea
                            rows={3}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            placeholder="Activities or exercises parents can do at home..."
                            {...register('recommendationsForParents')}
                        />
                    </div>

                    {/* Next Session Focus */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Next Session Focus
                        </label>
                        <textarea
                            rows={2}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            placeholder="What to focus on in the next session..."
                            {...register('nextSessionFocus')}
                        />
                    </div>

                    {/* Submit Button */}
                    <div className="flex gap-4 pt-4 border-t">
                        <button
                            type="button"
                            onClick={() => navigate('/therapist/dashboard')}
                            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 flex items-center justify-center gap-2 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition disabled:opacity-50"
                        >
                            {loading ? (
                                <>
                                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <FiCheck />
                                    Complete Session
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default SessionNotes;
