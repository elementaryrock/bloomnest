import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { FiHome, FiCalendar, FiFileText, FiClipboard, FiLogOut, FiMenu, FiX, FiUser } from 'react-icons/fi';
import { Sprout } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useState } from 'react';

const TherapistLayout = ({ children }) => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/staff/login');
    };

    const navItems = [
        { path: '/therapist/dashboard', icon: FiHome, label: 'Dashboard', lucide: false },
        { path: '/therapist/schedule', icon: FiCalendar, label: 'My Schedule', lucide: false },
        { path: '/therapist/sessions', icon: FiFileText, label: 'Session Notes', lucide: false },
        { path: '/therapist/assessments', icon: FiClipboard, label: 'Assessments', lucide: false },
        { path: '/therapist/skill-sprout', icon: Sprout, label: 'SkillSprout 🌱', lucide: true },
    ];

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Mobile Header */}
            <div className="lg:hidden bg-white shadow-sm p-4 flex items-center justify-between">
                <button
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    className="text-gray-600 hover:text-purple-600"
                >
                    {sidebarOpen ? <FiX size={24} /> : <FiMenu size={24} />}
                </button>
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs font-bold">T</span>
                    </div>
                    <span className="font-semibold text-gray-800">Therapist Portal</span>
                </div>
                <div className="w-8" />
            </div>

            <div className="flex">
                {/* Sidebar */}
                <aside
                    className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
                        }`}
                >
                    <div className="h-full flex flex-col">
                        {/* Logo */}
                        <div className="p-6 border-b hidden lg:block">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center">
                                    <span className="text-white font-bold">T</span>
                                </div>
                                <div>
                                    <h1 className="font-bold text-gray-800">Therapist</h1>
                                    <p className="text-xs text-gray-500">Session Management</p>
                                </div>
                            </div>
                        </div>

                        {/* User Info */}
                        <div className="p-4 border-b bg-purple-50">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                                    <FiUser className="text-gray-600" />
                                </div>
                                <div>
                                    <p className="font-medium text-gray-800">{user?.name || 'Therapist'}</p>
                                    <p className="text-xs text-gray-500">{user?.specialization || 'Specialist'}</p>
                                </div>
                            </div>
                        </div>

                        {/* Navigation */}
                        <nav className="flex-1 p-4 space-y-2">
                            {navItems.map((item) => (
                                <NavLink
                                    key={item.path}
                                    to={item.path}
                                    onClick={() => setSidebarOpen(false)}
                                    className={({ isActive }) =>
                                        `flex items-center gap-3 px-4 py-3 rounded-lg transition ${isActive
                                            ? 'bg-purple-100 text-purple-700 font-medium'
                                            : 'text-gray-600 hover:bg-gray-100'
                                        }`
                                    }
                                >
                                    <item.icon size={20} />
                                    {item.label}
                                </NavLink>
                            ))}
                        </nav>

                        {/* Logout */}
                        <div className="p-4 border-t">
                            <button
                                onClick={handleLogout}
                                className="flex items-center gap-3 w-full px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition"
                            >
                                <FiLogOut size={20} />
                                Logout
                            </button>
                        </div>
                    </div>
                </aside>

                {/* Overlay */}
                {sidebarOpen && (
                    <div
                        className="fixed inset-0 bg-black/50 lg:hidden z-40"
                        onClick={() => setSidebarOpen(false)}
                    />
                )}

                {/* Main Content */}
                <main className="flex-1 p-4 lg:p-8 min-h-screen">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default TherapistLayout;
