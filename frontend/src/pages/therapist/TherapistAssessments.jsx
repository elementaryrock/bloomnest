import React, { useState } from 'react';
import { FiClipboard, FiPlus, FiSearch, FiFileText, FiCalendar } from 'react-icons/fi';
import { toast } from 'react-toastify';

const TherapistAssessments = () => {
    const [assessments, setAssessments] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');

    // Placeholder data - to be replaced with API integration
    const sampleAssessments = [
        {
            id: 1,
            patientName: 'Sample Patient',
            patientId: 'MEC2025000001',
            type: 'Initial Assessment',
            date: '2025-12-01',
            status: 'completed'
        }
    ];

    const getStatusColor = (status) => {
        switch (status) {
            case 'completed': return 'bg-green-100 text-green-700';
            case 'in-progress': return 'bg-amber-100 text-amber-700';
            default: return 'bg-blue-100 text-blue-700';
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Assessments</h1>
                    <p className="text-gray-600">Manage patient assessments and evaluations</p>
                </div>
                <button
                    onClick={() => toast.info('Assessment creation coming soon!')}
                    className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition"
                >
                    <FiPlus />
                    New Assessment
                </button>
            </div>

            {/* Search */}
            <div className="bg-white rounded-xl shadow-md p-4">
                <div className="relative">
                    <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search assessments by patient name or ID..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    />
                </div>
            </div>

            {/* Assessment Types */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition cursor-pointer">
                    <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center mb-4">
                        <FiClipboard className="text-purple-600" size={24} />
                    </div>
                    <h3 className="font-semibold text-gray-800">Initial Assessment</h3>
                    <p className="text-sm text-gray-500 mt-1">First-time patient evaluation</p>
                </div>

                <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition cursor-pointer">
                    <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center mb-4">
                        <FiFileText className="text-green-600" size={24} />
                    </div>
                    <h3 className="font-semibold text-gray-800">Progress Report</h3>
                    <p className="text-sm text-gray-500 mt-1">Periodic progress evaluation</p>
                </div>

                <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition cursor-pointer">
                    <div className="w-12 h-12 rounded-lg bg-amber-100 flex items-center justify-center mb-4">
                        <FiCalendar className="text-amber-600" size={24} />
                    </div>
                    <h3 className="font-semibold text-gray-800">Re-evaluation</h3>
                    <p className="text-sm text-gray-500 mt-1">Annual re-assessment</p>
                </div>
            </div>

            {/* Assessments List */}
            <div className="bg-white rounded-xl shadow-md p-8 text-center">
                <FiClipboard className="mx-auto text-gray-400 mb-4" size={48} />
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Assessment Module</h3>
                <p className="text-gray-500 mb-4">
                    This feature is under development. You will be able to create and manage
                    patient assessments, progress reports, and evaluations here.
                </p>
                <div className="flex justify-center gap-4">
                    <button
                        onClick={() => toast.info('Coming soon!')}
                        className="px-4 py-2 bg-purple-100 text-purple-700 rounded-lg font-medium hover:bg-purple-200 transition"
                    >
                        View Sample Assessment
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TherapistAssessments;
