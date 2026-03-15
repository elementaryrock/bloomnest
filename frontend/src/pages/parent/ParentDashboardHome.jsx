import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getPhotoUrl } from '../../utils/photoUtils';
import {
    CalendarDays,
    ClipboardList,
    Plus,
    ChevronRight,
    Brain,
    Hand,
    Activity,
    MessageCircle,
    Sparkles,
    TrendingUp,
    Clock,
    FileText,
    ArrowUpRight
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

// Therapy type configurations with psychological color mappings
const therapyConfig = {
    'Psychology': { icon: Brain, bg: 'bg-indigo-50', text: 'text-indigo-600', dot: 'bg-indigo-500' },
    'OT': { icon: Hand, bg: 'bg-orange-50', text: 'text-orange-600', dot: 'bg-orange-500' },
    'PT': { icon: Activity, bg: 'bg-emerald-50', text: 'text-emerald-600', dot: 'bg-emerald-500' },
    'Speech': { icon: MessageCircle, bg: 'bg-sky-50', text: 'text-sky-600', dot: 'bg-sky-500' },
    'EI': { icon: Sparkles, bg: 'bg-rose-50', text: 'text-rose-600', dot: 'bg-rose-500' }
};

const getTherapyConfig = (type) => therapyConfig[type] || therapyConfig['Psychology'];

// --- PREMIUM COMPONENTS ---

// 1. Primary Stat Card (60-30-10 Rule implementation)
const MetricCard = ({ label, value, trend, isAccent = false }) => (
    <div className={`relative p-6 rounded-2xl bg-white border ${isAccent ? 'border-amber-200 hover:shadow-accent' : 'border-slate-200 hover:shadow-hover'} transition-premium`}>
        {/* Gestalt: Proximity & Similarity. Label and Value group perfectly. */}
        <p className={`text-[11px] font-bold uppercase tracking-micro mb-4 ${isAccent ? 'text-amber-700' : 'text-slate-400'}`}>
            {label}
        </p>
        <div className="flex items-end justify-between">
            <h3 className="text-4xl font-extrabold text-slate-900 tracking-tight-premium leading-none">{value}</h3>
            {trend && (
                <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-md ${isAccent ? 'bg-amber-100 text-amber-700' : 'bg-emerald-50 text-emerald-700'}`}>
                    {trend.isPositive ? <TrendingUp size={14} strokeWidth={2.5} /> : <ArrowUpRight size={14} strokeWidth={2.5} />}
                    {trend.value}
                </div>
            )}
        </div>
        {/* "Nanao Banana" subtle highlight glow if accent */}
        {isAccent && <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-amber-200 to-amber-400 rounded-b-2xl opacity-50"></div>}
    </div>
);

// 2. Clinical Profile Identity
const ClinicalIdentityCard = ({ patient }) => {
    const navigate = useNavigate();

    return (
        <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-soft flex flex-col md:flex-row gap-8 items-center md:items-start group hover:border-slate-300 transition-premium">
            {/* Avatar - High definition with perfect ring spacing */}
            <div className="flex-shrink-0 relative">
                <div className="w-24 h-24 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 text-3xl font-extrabold ring-4 ring-white shadow-soft group-hover:shadow-hover transition-premium overflow-hidden">
                    {patient?.photoUrl ? (
                        <img src={getPhotoUrl(patient.photoUrl)} alt={patient.childName} className="w-full h-full object-cover" />
                    ) : (
                        patient?.childName?.charAt(0) || 'C'
                    )}
                </div>
                {/* Online/Active status indicator */}
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500 border-4 border-white rounded-full"></div>
            </div>

            {/* Metadata Matrix - Grid system for readability */}
            <div className="flex-1 w-full text-center md:text-left">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                    <div>
                        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight-premium text-balance">{patient?.childName || 'Child Identity'}</h2>
                        <p className="text-sm font-semibold text-slate-500 mt-1">ID: {patient?.specialId || 'MEC-XXXXXX'}</p>
                    </div>
                    <button
                        onClick={() => navigate('/parent/profile')}
                        className="text-sm font-bold text-blue-600 bg-blue-50 px-4 py-2 rounded-lg hover:bg-blue-100 transition-premium">
                        View Full Profile
                    </button>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                        { l: 'Age', v: `${patient?.age || '-'} yrs` },
                        { l: 'Gender', v: patient?.gender || '-' },
                        { l: 'Primary Diagnosis', v: patient?.diagnosis?.join(', ') || 'Evaluating' },
                        { l: 'Severity Index', v: patient?.severity || 'Pending' }
                    ].map((item, idx) => (
                        <div key={idx} className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-micro">{item.l}</p>
                            <p className="font-bold text-slate-900 text-sm mt-1">{item.v}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

// 3. Elegant Session Row (List Item)
const SessionRow = ({ appointment }) => {
    const config = getTherapyConfig(appointment.therapyType);
    const IconComponent = config.icon;

    // Formatting for clinical precision
    const dateObj = new Date(appointment.date);
    const day = dateObj.toLocaleDateString('en-US', { day: '2-digit' });
    const month = dateObj.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();

    const isPending = appointment.status !== 'confirmed';

    return (
        <div className="group flex items-center p-4 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-premium cursor-pointer -mx-4">
            {/* Date Box */}
            <div className="flex flex-col items-center justify-center w-14 h-14 bg-white rounded-lg border border-slate-200 shadow-sm flex-shrink-0">
                <span className="text-xs font-bold text-slate-500 uppercase">{month}</span>
                <span className="text-lg font-extrabold text-slate-900 leading-none">{day}</span>
            </div>

            {/* Content Context */}
            <div className="ml-4 flex-1 min-w-0 flex flex-col justify-center">
                <div className="flex items-center gap-2 mb-1">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${config.bg} ${config.text}`}>
                        {appointment.therapyType}
                    </span>
                    {isPending && <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>}
                </div>
                <h4 className="font-bold text-slate-900 text-sm truncate">Clinical Session w/ Specialist</h4>
                <div className="flex items-center gap-2 mt-1 text-xs font-medium text-slate-500">
                    <Clock size={12} className="text-slate-400" />
                    {appointment.timeSlot}
                </div>
            </div>

            {/* Action Arrow */}
            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-premium ml-4 flex-shrink-0">
                <ChevronRight size={16} strokeWidth={2.5} />
            </div>
        </div>
    );
};

// --- MAIN PAGE LAYOUT ---

const ParentDashboardHome = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [patient, setPatient] = useState(null);
    const [stats, setStats] = useState({ completed: 0, upcoming: 0, lastAssessment: null });
    const [upcomingAppointments, setUpcomingAppointments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            if (user?.specialId) {
                try {
                    const res = await api.get(`/patients/${user.specialId}`);
                    if (res.data.success) setPatient(res.data.data);
                } catch (e) {
                    setPatient({
                        childName: user?.childName || 'Identity Missing',
                        specialId: user?.specialId,
                        age: 5, gender: 'Male', diagnosis: ['Developmental Delay'], severity: 'Moderate'
                    });
                }
            }

            try {
                const res = await api.get('/bookings/my-bookings');
                if (res.data.success) {
                    const all = res.data.data || [];
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);

                    const upcoming = all.filter(b => new Date(b.date) >= today && b.status === 'confirmed')
                        .sort((a, b) => new Date(a.date) - new Date(b.date));
                    const completed = all.filter(b => b.status === 'completed');

                    setUpcomingAppointments(upcoming);
                    setStats({ completed: completed.length, upcoming: upcoming.length, lastAssessment: null });
                }
            } catch (e) { }
        } finally {
            setLoading(false);
        }
    };

    const currentDate = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[60vh]">
                <div className="relative w-12 h-12">
                    <div className="absolute inset-0 border-4 border-slate-100 rounded-full"></div>
                    <div className="absolute inset-0 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 pb-10">
            {/* Header Module - Clear Typography Hierarchy */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-2">{currentDate}</p>
                    <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight-premium">
                        Welcome back,<br /><span className="text-blue-600">{patient?.childName ? `${patient.childName}'s Guardian` : 'Guardian'}</span>
                    </h1>
                </div>
                <button
                    onClick={() => navigate('/parent/book')}
                    className="group inline-flex items-center gap-2 bg-slate-900 text-white px-6 py-3.5 rounded-xl font-bold hover:bg-blue-600 hover:shadow-hover transition-premium"
                >
                    <Plus size={18} strokeWidth={2.5} className="group-hover:rotate-90 transition-transform duration-300" />
                    New Appointment
                </button>
            </div>

            {/* Metrics Matrix */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <MetricCard
                    label="Upcoming Appointments"
                    value={stats.upcoming}
                    trend={{ value: 'Active', isPositive: true }}
                />
                {/* Visual Anchor / Accent Card (Nanao Banana conceptual application) */}
                <MetricCard
                    label="Pending Documentation"
                    value="2"
                    trend={{ value: 'Action Rqd', isPositive: false }}
                    isAccent={true}
                />
                <MetricCard
                    label="Completed Sessions"
                    value={stats.completed}
                    trend={{ value: '+12% M/M', isPositive: true }}
                />
            </div>

            {/* Clinical Identity */}
            <ClinicalIdentityCard patient={patient} />

            {/* Dual Pane Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                {/* Left Pane - Schedule (Dominant 60%) */}
                <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-8 shadow-soft">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-extrabold text-slate-900 tracking-tight-premium">Upcoming Sessions</h3>
                        <button onClick={() => navigate('/parent/history')} className="text-xs font-bold text-blue-600 uppercase tracking-wider hover:text-blue-800 transition-colors">
                            View Archives
                        </button>
                    </div>

                    <div className="space-y-1">
                        {upcomingAppointments.length > 0 ? (
                            upcomingAppointments.slice(0, 4).map(app => <SessionRow key={app.bookingId || app._id} appointment={app} />)
                        ) : (
                            <div className="py-12 bg-slate-50 border border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center text-center">
                                <div className="w-16 h-16 bg-white rounded-full shadow-sm flex items-center justify-center mb-4 text-slate-300">
                                    <CalendarDays size={28} />
                                </div>
                                <h4 className="font-bold text-slate-900 mb-1">Clear Schedule</h4>
                                <p className="text-sm font-medium text-slate-400 max-w-xs mb-4">You have no upcoming clinical therapy sessions scheduled.</p>
                                <button onClick={() => navigate('/parent/book')} className="text-sm font-bold text-blue-600 hover:text-blue-800 transition-colors">Schedule a session &rarr;</button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Pane - Utilities (Secondary 30%) */}
                <div className="lg:col-span-5 space-y-6">
                    {/* Action Hub */}
                    <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-soft">
                        <h3 className="text-lg font-extrabold text-slate-900 tracking-tight-premium mb-6">Quick Actions</h3>

                        <div className="space-y-3">
                            {[
                                { route: '/parent/book', Icon: CalendarDays, title: 'Book Session', desc: 'Schedule a new clinical appointment', color: 'text-indigo-600', bg: 'bg-indigo-50' },
                                { route: '/parent/history', Icon: ClipboardList, title: 'Clinical Records', desc: 'Review session notes and progress', color: 'text-emerald-600', bg: 'bg-emerald-50' },
                                { route: '/parent/assessments', Icon: FileText, title: 'Assessments', desc: 'View diagnostic reports', color: 'text-blue-600', bg: 'bg-blue-50' }
                            ].map((action, idx) => {
                                const IconComponent = action.Icon;
                                return (
                                    <button
                                        key={idx}
                                        onClick={() => navigate(action.route)}
                                        className="w-full flex items-center p-4 rounded-xl border border-slate-100 hover:border-slate-300 hover:shadow-soft transition-premium group text-left bg-white"
                                    >
                                        <div className={`w-12 h-12 rounded-xl flex flex-shrink-0 items-center justify-center ${action.bg} ${action.color} group-hover:scale-110 transition-transform duration-300 ease-out`}>
                                            <IconComponent size={20} strokeWidth={2.5} />
                                        </div>
                                        <div className="ml-4 flex-1">
                                            <h4 className="font-bold text-slate-900 text-sm group-hover:text-blue-600 transition-colors">{action.title}</h4>
                                            <p className="text-xs font-semibold text-slate-400 mt-0.5">{action.desc}</p>
                                        </div>
                                    </button>
                                )
                            })}
                        </div>
                    </div>

                    {/* Notification/AI banner */}
                    <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-6 shadow-soft text-white relative overflow-hidden group hover:shadow-hover transition-premium cursor-pointer" onClick={() => navigate('/parent/neural-narrative')}>
                        <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-150 group-hover:-rotate-12 transition-all duration-700">
                            <Brain size={120} />
                        </div>
                        <div className="relative z-10">
                            <div className="flex items-center gap-2 text-blue-100 mb-3">
                                <Sparkles size={16} className="animate-pulse" />
                                <span className="text-xs font-bold uppercase tracking-widest">AI Insights Ready</span>
                            </div>
                            <h3 className="text-xl font-extrabold tracking-tight-premium mb-2 text-balance leading-tight">NeuralNarrative™ Analysis Complete</h3>
                            <p className="text-sm font-medium text-blue-100 opacity-90 mb-4 max-w-64">Review the latest AI-generated progress report for {patient?.childName || 'your child'}.</p>
                            <span className="inline-flex items-center font-bold text-xs uppercase tracking-wider bg-white/20 px-3 py-1.5 rounded-lg hover:bg-white/30 transition-colors">
                                View Report &rarr;
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ParentDashboardHome;
