import React, { useState, useEffect } from 'react';
import { FiPlus, FiEdit, FiTrash2, FiUser, FiMail, FiPhone, FiX, FiCheck } from 'react-icons/fi';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import api from '../../services/api';

const StaffManagement = () => {
    const [staff, setStaff] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [selectedStaff, setSelectedStaff] = useState(null);

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors }
    } = useForm();

    useEffect(() => {
        fetchStaff();
    }, []);

    const fetchStaff = async () => {
        try {
            const res = await api.get('/admin/staff');
            if (res.data.success) {
                setStaff(res.data.data || []);
            }
        } catch (error) {
            console.error('Failed to fetch staff:', error);
            toast.error('Failed to load staff data');
            setStaff([]);
        } finally {
            setLoading(false);
        }
    };

    const handleAddStaff = () => {
        setSelectedStaff(null);
        reset({ password: 'password123' }); // Default password for new staff
        setShowModal(true);
    };

    const handleEditStaff = (member) => {
        setSelectedStaff(member);
        reset(member);
        setShowModal(true);
    };

    const onSubmit = async (data) => {
        try {
            if (selectedStaff) {
                const res = await api.put(`/admin/staff/${selectedStaff.id}`, data);
                if (res.data.success) {
                    toast.success('Staff updated successfully');
                }
            } else {
                const res = await api.post('/admin/staff', data);
                if (res.data.success) {
                    toast.success('Staff added successfully');
                }
            }
            setShowModal(false);
            fetchStaff();
        } catch (error) {
            toast.error(error.response?.data?.error?.message || 'Operation failed');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to permanently delete this staff member? This action cannot be undone.')) return;

        try {
            const res = await api.delete(`/admin/staff/${id}`);
            if (res.data.success) {
                toast.success(res.data.message);
                fetchStaff();
            }
        } catch (error) {
            toast.error(error.response?.data?.error?.message || 'Failed to delete staff');
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Staff Management</h1>
                    <p className="text-gray-600">Manage therapists and receptionists</p>
                </div>
                <button
                    onClick={handleAddStaff}
                    className="flex items-center gap-2 bg-red-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-red-700 transition"
                >
                    <FiPlus />
                    Add Staff
                </button>
            </div>

            {/* Staff Table */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {staff.map((member) => (
                                <tr key={member.id} className={!member.isActive ? 'bg-gray-50 opacity-75' : ''}>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                                                <FiUser className="text-gray-500" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-800">{member.name}</p>
                                                {member.specialization && member.specialization.length > 0 && (
                                                    <p className="text-sm text-gray-500">
                                                        {Array.isArray(member.specialization)
                                                            ? member.specialization.join(', ')
                                                            : member.specialization}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${member.role === 'therapist' ? 'bg-purple-100 text-purple-700' :
                                            member.role === 'receptionist' ? 'bg-green-100 text-green-700' :
                                                'bg-red-100 text-red-700'
                                            }`}>
                                            {member.role.charAt(0).toUpperCase() + member.role.slice(1)}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm">
                                            <p className="flex items-center gap-1 text-gray-600">
                                                <FiMail size={14} /> {member.email}
                                            </p>
                                            <p className="flex items-center gap-1 text-gray-500">
                                                <FiPhone size={14} /> {member.phone}
                                            </p>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${member.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                                            }`}>
                                            {member.isActive ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleEditStaff(member)}
                                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                                            >
                                                <FiEdit />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(member.id)}
                                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                                            >
                                                <FiTrash2 />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
                        <div className="flex items-center justify-between p-6 border-b">
                            <h3 className="text-lg font-semibold text-gray-800">
                                {selectedStaff ? 'Edit Staff' : 'Add Staff'}
                            </h3>
                            <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                                <FiX size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                                <input
                                    type="text"
                                    className={`w-full px-4 py-2 border rounded-lg ${errors.name ? 'border-red-500' : 'border-gray-300'}`}
                                    {...register('name', { required: 'Name is required' })}
                                />
                                {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                                <input
                                    type="email"
                                    className={`w-full px-4 py-2 border rounded-lg ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
                                    {...register('email', { required: 'Email is required' })}
                                />
                            </div>

                            {!selectedStaff && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Password *</label>
                                    <input
                                        type="password"
                                        className={`w-full px-4 py-2 border rounded-lg ${errors.password ? 'border-red-500' : 'border-gray-300'}`}
                                        placeholder="Default: password123"
                                        {...register('password', { required: !selectedStaff ? 'Password is required' : false })}
                                    />
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
                                <input
                                    type="tel"
                                    className={`w-full px-4 py-2 border rounded-lg ${errors.phone ? 'border-red-500' : 'border-gray-300'}`}
                                    {...register('phone', { required: 'Phone is required' })}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Role *</label>
                                <select
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                                    {...register('role', { required: 'Role is required' })}
                                >
                                    <option value="">Select role</option>
                                    <option value="therapist">Therapist</option>
                                    <option value="receptionist">Receptionist</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Specializations (for therapists)</label>
                                <div className="space-y-2">
                                    {[
                                        { value: 'Speech', label: 'Speech Therapy' },
                                        { value: 'OT', label: 'Occupational Therapy' },
                                        { value: 'PT', label: 'Physical Therapy' },
                                        { value: 'Psychology', label: 'Psychology' },
                                        { value: 'EI', label: 'Early Intervention' }
                                    ].map((type) => (
                                        <label key={type.value} className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                value={type.value}
                                                className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                                                {...register('specialization')}
                                            />
                                            <span className="text-sm text-gray-700">{type.label}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 py-2 border border-gray-300 rounded-lg font-medium hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700"
                                >
                                    {selectedStaff ? 'Update' : 'Add Staff'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StaffManagement;
