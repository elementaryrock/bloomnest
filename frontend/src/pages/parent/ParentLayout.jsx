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
    Waves,
    Search,
    Bell,
    HelpCircle,
    ChevronDown
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
        { path: '/parent/dashboard', icon: LayoutDashboard, label: 'Overview' },
        { path: '/parent/history', icon: History, label: 'Clinical Records' },
        { path: '/parent/book', icon: CalendarPlus, label: 'Appointments' },
        { path: '/parent/neural-narrative', icon: Sparkles, label: 'NeuralNarrative™' },
        { path: '/parent/skill-sprout', icon: Sprout, label: 'SkillSprout' },
        { path: '/parent/therapy-ripple', icon: Waves, label: 'TherapyRipple' },
    ];

    return (
        <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans text-slate-900">
            {/* Mobile Header */}
            <div className="lg:hidden bg-white border-b border-slate-200 p-4 flex items-center justify-between sticky top-0 z-30 shadow-sm">
                <button
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    className="text-slate-600 hover:text-slate-900 transition-colors p-1"
                >
                    {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg overflow-hidden shadow-soft ring-2 ring-amber-50">
                        <img src="/logos/BloomNest.png" alt="Bloomnest Logo" className="w-full h-full object-cover" />
                    </div>
                    <span className="font-extrabold text-slate-900 text-sm tracking-tight-premium">BLOOMNEST</span>
                </div>
                <div className="w-8" />
            </div>

            <div className="flex flex-1 overflow-hidden">
                {/* Premium Sidebar */}
                <aside
                    className={`fixed lg:static inset-y-0 left-0 z-50 w-[260px] bg-white border-r border-slate-200 transform transition-transform duration-500 ease-out flex flex-col ${sidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full lg:translate-x-0'
                        }`}
                >
                    {/* Brand Cluster */}
                    <div className="px-6 py-8 hidden lg:block">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl overflow-hidden shadow-soft ring-4 ring-amber-50">
                                <img src="/logos/BloomNest.png" alt="Bloomnest Logo" className="w-full h-full object-cover" />
                            </div>
                            <div>
                                <h1 className="font-extrabold text-slate-900 text-lg tracking-tight-premium leading-none">Bloomnest</h1>
                            </div>
                        </div>
                    </div>

                    {/* Navigation Cluster */}
                    <nav className="flex-1 px-4 py-2 space-y-1 overflow-y-auto mt-4 lg:mt-0">
                        {navItems.map((item) => (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                onClick={() => setSidebarOpen(false)}
                                className={({ isActive }) =>
                                    `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-premium text-sm font-semibold group ${isActive
                                        ? 'bg-blue-50 text-blue-700 shadow-sm'
                                        : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                                    }`
                                }
                            >
                                <item.icon
                                    size={18}
                                    strokeWidth={2}
                                    className={`transition-premium ${window.location.pathname === item.path ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-600 group-hover:scale-110'}`}
                                />
                                {item.label}
                            </NavLink>
                        ))}
                    </nav>

                    {/* Meta/Profile Cluster */}
                    <div className="p-4 mt-auto">
                        <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 flex items-center gap-3 hover:border-slate-300 transition-premium cursor-pointer group mb-2">
                            <div className="w-9 h-9 bg-white rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm text-blue-600 font-bold text-sm ring-1 ring-slate-200 group-hover:ring-blue-100 transition-premium">
                                {user?.childName?.charAt(0) || 'P'}
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="font-bold text-slate-900 text-sm truncate">{user?.childName || 'Parent Account'}</p>
                                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider truncate">{user?.specialId || 'MEC-Guest'}</p>
                            </div>
                            <ChevronDown size={14} className="text-slate-400 group-hover:text-slate-600" />
                        </div>

                        <button
                            onClick={handleLogout}
                            className="flex items-center justify-center gap-2 w-full px-3 py-2.5 text-sm font-semibold text-slate-500 hover:bg-red-50 hover:text-red-700 rounded-lg transition-premium group"
                        >
                            <LogOut size={16} strokeWidth={2} className="group-hover:translate-x-0.5 transition-transform" />
                            Sign out
                        </button>
                    </div>
                </aside>

                {/* Mobile Overlay */}
                {sidebarOpen && (
                    <div
                        className="fixed inset-0 bg-slate-900/40 lg:hidden z-40 backdrop-blur-sm transition-opacity duration-300"
                        onClick={() => setSidebarOpen(false)}
                    />
                )}

                {/* Main Content Area */}
                <div className="flex-1 flex flex-col h-screen overflow-hidden bg-[#F8FAFC]">
                    {/* Top Bar - Ultra Clean */}
                    <header className="hidden lg:flex items-center justify-between px-8 py-5 bg-white/80 backdrop-blur-md border-b border-slate-200/60 sticky top-0 z-20">
                        {/* Search */}
                        <div className="flex items-center relative group w-96">
                            <Search size={16} className="text-slate-400 absolute left-3 group-focus-within:text-blue-500 transition-colors" strokeWidth={2.5} />
                            <input
                                type="text"
                                placeholder="Search medical archives..."
                                className="w-full bg-slate-50 hover:bg-slate-100 focus:bg-white border border-transparent focus:border-blue-200 focus:ring-4 focus:ring-blue-50/50 outline-none text-sm text-slate-700 py-2.5 pl-10 pr-4 rounded-xl transition-premium placeholder-slate-400 font-medium"
                            />
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2">
                            <button className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-50 text-slate-500 hover:bg-blue-50 hover:text-blue-600 transition-premium relative">
                                <Bell size={18} strokeWidth={2} />
                                <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-amber-400 rounded-full ring-2 ring-slate-50"></span>
                            </button>
                            <button className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-50 text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-premium">
                                <HelpCircle size={18} strokeWidth={2} />
                            </button>
                        </div>
                    </header>

                    {/* Page Content */}
                    <main className="flex-1 overflow-y-auto p-4 lg:px-10 lg:py-8">
                        <div className="max-w-[1200px] mx-auto animate-fadeIn">
                            {children}
                        </div>
                    </main>
                </div>
            </div>
        </div>
    );
};

export default ParentLayout;
