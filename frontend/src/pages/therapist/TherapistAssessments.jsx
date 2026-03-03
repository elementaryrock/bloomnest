import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiClipboard, FiPlus, FiSearch, FiFileText, FiCalendar, FiUser, FiX, FiCheck } from 'react-icons/fi';
import { toast } from 'react-toastify';
import api from '../../services/api';

const TherapistAssessments = () => {
    const navigate = useNavigate();
    const [assessments, setAssessments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchLoading, setSearchLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [saving, setSaving] = useState(false);

    const [formData, setFormData] = useState({
        specialId: '',
        assessmentDate: new Date().toISOString().split('T')[0]
    });

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            fetchAssessments(searchQuery);
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [searchQuery]);

    const fetchAssessments = async (query = '') => {
        if (query) setSearchLoading(true);
        else setLoading(true);

        try {
            const res = await api.get(`/assessments${query ? `?query=${encodeURIComponent(query)}` : ''}`);
            if (res.data.success) {
                setAssessments(res.data.data);
            }
        } catch (error) {
            console.error('Fetch assessments error:', error);
            toast.error('Failed to load assessments');
        } finally {
            setLoading(false);
            setSearchLoading(false);
        }
    };

    const handleCreateAssessment = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const res = await api.post('/assessments', {
                specialId: formData.specialId,
                assessmentDate: new Date(formData.assessmentDate).toISOString()
            });

            if (res.data.success) {
                toast.success('Assessment created successfully');
                setIsModalOpen(false);
                setFormData({
                    specialId: '',
                    assessmentDate: new Date().toISOString().split('T')[0]
                });
                fetchAssessments();
            }
        } catch (error) {
            toast.error(error.response?.data?.error?.message || 'Failed to create assessment');
        } finally {
            setSaving(false);
        }
    };

    const getStatusBadge = (status) => {
        if (status === 'completed') {
            return <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">Completed</span>;
        }
        return <span className="px-3 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700">Draft</span>;
    };

    const highlightText = (text, query) => {
        if (!query || !text) return text;
        const parts = text.toString().split(new RegExp(`(${query})`, 'gi'));
        return parts.map((part, i) =>
            part.toLowerCase() === query.toLowerCase()
                ? <span key={i} className="bg-yellow-200 text-gray-900 px-0.5 rounded">{part}</span>
                : part
        );
    };

    return (
        <div className="space-y-6 relative">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Assessments</h1>
                    <p className="text-gray-600">Manage patient assessments and evaluations</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex justify-center items-center gap-2 px-6 py-2.5 bg-purple-600 text-white rounded-xl font-medium hover:bg-purple-700 transition shadow-sm"
                >
                    <FiPlus />
                    New Assessment
                </button>
            </div>

            {/* Stats Cards / Types */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100 flex items-center justify-between">
                    <div>
                        <p className="text-sm font-semibold text-gray-500 uppercase">Total Assessments</p>
                        <p className="text-3xl font-bold text-gray-800 mt-1">{assessments.length}</p>
                    </div>
                    <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center">
                        <FiClipboard className="text-blue-600" size={24} />
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100 flex items-center justify-between">
                    <div>
                        <p className="text-sm font-semibold text-gray-500 uppercase">Completed</p>
                        <p className="text-3xl font-bold text-gray-800 mt-1">
                            {assessments.filter(a => a.status === 'completed').length}
                        </p>
                    </div>
                    <div className="w-12 h-12 rounded-lg bg-green-50 flex items-center justify-center">
                        <FiCheck className="text-green-600" size={24} />
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100 flex items-center justify-between">
                    <div>
                        <p className="text-sm font-semibold text-gray-500 uppercase">Drafts</p>
                        <p className="text-3xl font-bold text-gray-800 mt-1">
                            {assessments.filter(a => a.status === 'draft').length}
                        </p>
                    </div>
                    <div className="w-12 h-12 rounded-lg bg-amber-50 flex items-center justify-center">
                        <FiFileText className="text-amber-600" size={24} />
                    </div>
                </div>
            </div>

            {/* List Section */}
            <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
                <div className="p-4 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
                    <div className="relative max-w-md flex-1">
                        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search by Patient ID or Child Name"
                            className="w-full pl-10 pr-10 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition"
                        />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery('')}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                                <FiX />
                            </button>
                        )}
                    </div>
                    {searchLoading && (
                        <div className="ml-4 animate-spin rounded-full h-5 w-5 border-b-2 border-purple-600"></div>
                    )}
                </div>

                <div className="overflow-x-auto">
                    {loading ? (
                        <div className="flex justify-center items-center h-48">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                        </div>
                    ) : assessments.length > 0 ? (
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider border-b border-gray-200">
                                    <th className="p-4 font-semibold">Assessment ID</th>
                                    <th className="p-4 font-semibold">Child Name</th>
                                    <th className="p-4 font-semibold">Patient ID</th>
                                    <th className="p-4 font-semibold">Date</th>
                                    <th className="p-4 font-semibold">Status</th>
                                    <th className="p-4 font-semibold text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {assessments.map(assessment => (
                                    <tr key={assessment._id} className="hover:bg-gray-50 transition">
                                        <td className="p-4 font-medium text-purple-600">
                                            {highlightText(assessment.assessmentId, searchQuery)}
                                        </td>
                                        <td className="p-4 text-gray-800 font-bold">
                                            {highlightText(assessment.childName || 'N/A', searchQuery)}
                                        </td>
                                        <td className="p-4 text-gray-600 font-medium">
                                            {highlightText(assessment.specialId, searchQuery)}
                                        </td>
                                        <td className="p-4 text-gray-600">
                                            {new Date(assessment.assessmentDate).toLocaleDateString()}
                                        </td>
                                        <td className="p-4">
                                            {getStatusBadge(assessment.status)}
                                        </td>
                                        <td className="p-4 text-right">
                                            <button
                                                onClick={() => navigate(`/therapist/assessment/${assessment.assessmentId}`)}
                                                className="text-sm font-semibold text-purple-600 hover:text-purple-800 hover:underline"
                                            >
                                                {assessment.status === 'draft' ? 'Continue Draft' : 'View Details'}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <div className="text-center py-16 px-4">
                            <FiFileText className="mx-auto text-gray-300 mb-4" size={48} />
                            <h3 className="text-lg font-bold text-gray-800">No assessments found</h3>
                            <p className="text-gray-500 mt-1">Create a new assessment to get started or adjust your search.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal for Creating New Assessment */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-fadeIn">
                        <div className="flex items-center justify-between p-6 border-b border-gray-100">
                            <h2 className="text-xl font-bold text-gray-800">New Assessment</h2>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="text-gray-400 hover:text-gray-600 transition"
                            >
                                <FiX size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleCreateAssessment} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Patient Special ID</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g. MEC2025000001"
                                    value={formData.specialId}
                                    onChange={(e) => setFormData({ ...formData, specialId: e.target.value.toUpperCase() })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none uppercase"
                                />
                                <p className="text-xs text-gray-500 mt-1">The unique 13-character identifier for the patient.</p>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Assessment Date</label>
                                <input
                                    type="date"
                                    required
                                    value={formData.assessmentDate}
                                    onChange={(e) => setFormData({ ...formData, assessmentDate: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
                                />
                            </div>

                            <div className="pt-4 flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center"
                                >
                                    {saving ? (
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    ) : (
                                        'Create Draft'
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TherapistAssessments;
