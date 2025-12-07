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
            console.log('Using mock data');
            setStaff([
                { id: 1, name: 'Dr. Anil Kumar', email: 'anil@example.com', phone: '9876543210', role: 'therapist', specialization: 'Speech Therapy', isActive: true },
                { id: 2, name: 'Dr. Priya Menon', email: 'priya@example.com', phone: '9876543211', role: 'therapist', specialization: 'Occupational Therapy', isActive: true },
                { id: 3, name: 'Sarah Johnson', email: 'sarah@example.com', phone: '9876543212', role: 'receptionist', specialization: null, isActive: true },
                { id: 4, name: 'Rahul Nair', email: 'rahul@example.com', phone: '9876543213', role: 'receptionist', specialization: null, isActive: false },
            ]);
        } finally {
            setLoading(false);
        }
    };

    const handleAddStaff = () => {
        setSelectedStaff(null);
        reset({});
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
                await api.put(`/admin/staff/${selectedStaff.id}`, data);
                toast.success('Staff updated successfully');
            } else {
                await api.post('/admin/staff', data);
                toast.success('Staff added successfully');
            }
            setShowModal(false);
            fetchStaff();
        } catch (error) {
            toast.success(selectedStaff ? 'Staff updated (Demo)' : 'Staff added (Demo)');
            setShowModal(false);
            // Add to local state for demo
            if (!selectedStaff) {
                setStaff([...staff, { ...data, id: Date.now(), isActive: true }]);
            } else {
                setStaff(staff.map(s => s.id === selectedStaff.id ? { ...s, ...data } : s));
            }
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to deactivate this staff member?')) return;

        try {
            await api.delete(`/admin/staff/${id}`);
            toast.success('Staff deactivated');
            fetchStaff();
        } catch (error) {
            setStaff(staff.map(s => s.id === id ? { ...s, isActive: false } : s));
            toast.success('Staff deactivated (Demo)');
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
                                                {member.specialization && (
                                                    <p className="text-sm text-gray-500">{member.specialization}</p>
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
                                                disabled={!member.isActive}
                                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition disabled:opacity-50"
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
                                <label className="block text-sm font-medium text-gray-700 mb-1">Specialization</label>
                                <select className="w-full px-4 py-2 border border-gray-300 rounded-lg" {...register('specialization')}>
                                    <option value="">Select specialization</option>
                                    <option value="Speech Therapy">Speech Therapy</option>
                                    <option value="Occupational Therapy">Occupational Therapy</option>
                                    <option value="Physical Therapy">Physical Therapy</option>
                                    <option value="Psychology">Psychology</option>
                                    <option value="Early Intervention">Early Intervention</option>
                                </select>
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
