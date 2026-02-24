import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard,
    CalendarPlus,
    History,
    LogOut,
    Menu,
    X,
    User,
    Heart,
    Sparkles,
    Sprout,
    Waves
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const ParentLayout = ({ children }) => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const navItems = [
        { path: '/parent/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
        { path: '/parent/book', icon: CalendarPlus, label: 'Book Session' },
        { path: '/parent/history', icon: History, label: 'Session History' },
        { path: '/parent/neural-narrative', icon: Sparkles, label: 'NeuralNarrative' },
        { path: '/parent/skill-sprout', icon: Sprout, label: 'SkillSprout' },
        { path: '/parent/therapy-ripple', icon: Waves, label: 'TherapyRipple' },
    ];

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Mobile Header */}
            <div className="lg:hidden bg-white shadow-sm p-4 flex items-center justify-between border-b border-gray-100">
                <button
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    className="text-gray-600 hover:text-primary-600 transition-colors"
                >
                    {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center">
                        <Heart className="text-white" size={16} fill="white" />
                    </div>
                    <span className="font-bold text-gray-900">Therapy Booking</span>
                </div>
                <div className="w-8" /> {/* Spacer */}
            </div>

            <div className="flex">
                {/* Sidebar */}
                <aside
                    className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 border-r border-gray-100 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
                        }`}
                >
                    <div className="h-full flex flex-col">
                        {/* Logo */}
                        <div className="p-5 border-b border-gray-100 hidden lg:block">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center shadow-sm">
                                    <Heart className="text-white" size={20} fill="white" />
                                </div>
                                <div>
                                    <h1 className="font-bold text-gray-900">Therapy Unit</h1>
                                    <p className="text-xs text-gray-500">Booking System</p>
                                </div>
                            </div>
                        </div>

                        {/* User Info */}
                        <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-primary-50 to-blue-50">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm border border-gray-100">
                                    <User className="text-gray-600" size={18} />
                                </div>
                                <div className="min-w-0">
                                    <p className="font-semibold text-gray-900 truncate">{user?.childName || 'Parent'}</p>
                                    <p className="text-xs text-gray-500 truncate">{user?.specialId || 'ID'}</p>
                                </div>
                            </div>
                        </div>

                        {/* Navigation */}
                        <nav className="flex-1 p-4 space-y-1">
                            {navItems.map((item) => (
                                <NavLink
                                    key={item.path}
                                    to={item.path}
                                    onClick={() => setSidebarOpen(false)}
                                    className={({ isActive }) =>
                                        `flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive
                                            ? 'bg-primary-50 text-primary-700 font-semibold shadow-sm'
                                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                        }`
                                    }
                                >
                                    <item.icon size={20} strokeWidth={2} />
                                    {item.label}
                                </NavLink>
                            ))}
                        </nav>

                        {/* Logout Button */}
                        <div className="p-4 border-t border-gray-100">
                            <button
                                onClick={handleLogout}
                                className="flex items-center gap-3 w-full px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl transition-all font-medium"
                            >
                                <LogOut size={20} strokeWidth={2} />
                                Logout
                            </button>
                        </div>
                    </div>
                </aside>

                {/* Overlay for mobile */}
                {sidebarOpen && (
                    <div
                        className="fixed inset-0 bg-black/50 lg:hidden z-40 backdrop-blur-sm"
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

export default ParentLayout;
