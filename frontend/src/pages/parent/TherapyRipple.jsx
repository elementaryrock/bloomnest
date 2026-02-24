import React, { useState, useEffect, useCallback } from 'react';
import {
    Waves, Heart, Smile, Frown, Meh, AlertTriangle, Zap,
    Plus, TrendingUp, TrendingDown, Minus, BarChart3, Users,
    ChevronDown, ChevronUp, Send, Calendar, Brain, Sparkles, X
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { toast } from 'react-toastify';

// ─── Feeling Config ───
const FEELINGS = [
    { key: 'happy', label: 'Happy', icon: Smile, color: 'text-emerald-500', bg: 'bg-emerald-50', border: 'border-emerald-200', ring: 'ring-emerald-400' },
    { key: 'neutral', label: 'Neutral', icon: Meh, color: 'text-slate-400', bg: 'bg-slate-50', border: 'border-slate-200', ring: 'ring-slate-400' },
    { key: 'anxious', label: 'Anxious', icon: AlertTriangle, color: 'text-amber-500', bg: 'bg-amber-50', border: 'border-amber-200', ring: 'ring-amber-400' },
    { key: 'frustrated', label: 'Frustrated', icon: Zap, color: 'text-orange-500', bg: 'bg-orange-50', border: 'border-orange-200', ring: 'ring-orange-400' },
    { key: 'sad', label: 'Sad', icon: Frown, color: 'text-blue-400', bg: 'bg-blue-50', border: 'border-blue-200', ring: 'ring-blue-400' },
];

const STRESS_EMOJIS = ['😊', '🙂', '😐', '😟', '😰'];
const STRESS_LABELS = ['Very Low', 'Low', 'Moderate', 'High', 'Very High'];
const STRESS_COLORS = [
    'from-emerald-400 to-teal-500',
    'from-green-400 to-emerald-500',
    'from-amber-400 to-yellow-500',
    'from-orange-400 to-red-400',
    'from-red-500 to-rose-600',
];

// ─── Animated Ripple SVG ───
const RippleVisualization = ({ scores }) => {
    const rings = [
        { label: 'Child', score: scores?.child ?? 0, radius: 50, color: '#8b5cf6' },
        { label: 'Parent', score: scores?.parent ?? 0, radius: 95, color: '#3b82f6' },
        { label: 'Siblings', score: scores?.siblings, radius: 140, color: '#10b981' },
    ].filter(r => r.score !== null && r.score !== undefined);

    const overallScore = scores?.overall ?? 0;

    return (
        <div className="relative flex flex-col items-center justify-center">
            <svg viewBox="-180 -180 360 360" className="w-full max-w-xs mx-auto" style={{ filter: 'drop-shadow(0 4px 20px rgba(139,92,246,.15))' }}>
                <defs>
                    {rings.map((ring, i) => (
                        <radialGradient key={`g${i}`} id={`rg${i}`} cx="50%" cy="50%" r="50%">
                            <stop offset="0%" stopColor={ring.color} stopOpacity="0.25" />
                            <stop offset="100%" stopColor={ring.color} stopOpacity="0.05" />
                        </radialGradient>
                    ))}
                </defs>

                {/* Animated ripple rings — outermost first */}
                {[...rings].reverse().map((ring, i) => {
                    const actualIndex = rings.length - 1 - i;
                    const dashLen = 2 * Math.PI * ring.radius;
                    const filled = (ring.score / 100) * dashLen;
                    return (
                        <g key={ring.label}>
                            {/* Background circle */}
                            <circle cx="0" cy="0" r={ring.radius} fill={`url(#rg${actualIndex})`}
                                stroke={ring.color} strokeWidth="2" strokeOpacity="0.15" />
                            {/* Animated progress arc */}
                            <circle cx="0" cy="0" r={ring.radius} fill="none"
                                stroke={ring.color} strokeWidth="4" strokeLinecap="round"
                                strokeDasharray={`${filled} ${dashLen - filled}`}
                                strokeDashoffset={dashLen * 0.25}
                                className="transition-all duration-1000 ease-out"
                                style={{ animation: `ripplePulse${actualIndex} 3s ease-in-out infinite` }}
                            />
                            {/* Label */}
                            <text x="0" y={-ring.radius - 8} textAnchor="middle" fill={ring.color}
                                fontSize="10" fontWeight="600" className="select-none">
                                {ring.label} {ring.score}%
                            </text>
                        </g>
                    );
                })}

                {/* Center heart */}
                <circle cx="0" cy="0" r="28" fill="white" stroke="#8b5cf6" strokeWidth="2" />
                <text x="0" y="2" textAnchor="middle" dominantBaseline="middle" fontSize="20">💜</text>
                <text x="0" y="18" textAnchor="middle" fontSize="7" fill="#6b7280" fontWeight="600">
                    {overallScore}%
                </text>
            </svg>

            <style>{`
                @keyframes ripplePulse0 { 0%,100%{opacity:1} 50%{opacity:.75} }
                @keyframes ripplePulse1 { 0%,100%{opacity:1} 50%{opacity:.7} }
                @keyframes ripplePulse2 { 0%,100%{opacity:1} 50%{opacity:.65} }
            `}</style>
        </div>
    );
};

// ─── Trend Icon ───
const TrendBadge = ({ trend }) => {
    const config = {
        positive: { icon: TrendingUp, text: 'Positive Ripple', cls: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
        moderate: { icon: TrendingUp, text: 'Moderate Ripple', cls: 'text-blue-600 bg-blue-50 border-blue-200' },
        neutral: { icon: Minus, text: 'Neutral', cls: 'text-slate-500 bg-slate-50 border-slate-200' },
        inverse: { icon: TrendingDown, text: 'Variable', cls: 'text-amber-600 bg-amber-50 border-amber-200' },
        insufficient_data: { icon: BarChart3, text: 'Need More Data', cls: 'text-gray-400 bg-gray-50 border-gray-200' },
    };
    const c = config[trend] || config.insufficient_data;
    const Icon = c.icon;
    return (
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${c.cls}`}>
            <Icon size={13} /> {c.text}
        </span>
    );
};

// ─── Mini Sparkline ───
const Sparkline = ({ data, color = '#8b5cf6', height = 48 }) => {
    if (!data || data.length < 2) return null;
    const max = Math.max(...data, 5);
    const min = Math.min(...data, 1);
    const range = max - min || 1;
    const w = 200;
    const points = data.map((v, i) => `${(i / (data.length - 1)) * w},${height - ((v - min) / range) * (height - 8)}`).join(' ');
    return (
        <svg viewBox={`0 0 ${w} ${height}`} className="w-full" style={{ height }}>
            <polyline points={points} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            {data.map((v, i) => (
                <circle key={i} cx={(i / (data.length - 1)) * w} cy={height - ((v - min) / range) * (height - 8)} r="3" fill="white" stroke={color} strokeWidth="2" />
            ))}
        </svg>
    );
};

// ─── Main Component ───
const TherapyRipple = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    // Form state
    const [stressLevel, setStressLevel] = useState(3);
    const [showSiblings, setShowSiblings] = useState(false);
    const [siblingEntries, setSiblingEntries] = useState([]);
    const [notes, setNotes] = useState('');

    // Data state
    const [analysis, setAnalysis] = useState(null);
    const [history, setHistory] = useState([]);

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            const [analysisRes, historyRes] = await Promise.all([
                api.get('/family-wellbeing/ripple-analysis'),
                api.get('/family-wellbeing/history')
            ]);
            if (analysisRes.data.success) setAnalysis(analysisRes.data.data);
            if (historyRes.data.success) setHistory(historyRes.data.data);
        } catch (err) {
            console.error('Failed to fetch ripple data:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchData(); }, [fetchData]);

    // Form handlers
    const addSibling = () => setSiblingEntries([...siblingEntries, { name: '', feeling: 'neutral', note: '' }]);
    const removeSibling = (idx) => setSiblingEntries(siblingEntries.filter((_, i) => i !== idx));
    const updateSibling = (idx, field, value) => {
        const updated = [...siblingEntries];
        updated[idx] = { ...updated[idx], [field]: value };
        setSiblingEntries(updated);
    };

    const handleSubmit = async () => {
        try {
            setSubmitting(true);
            const validSiblings = siblingEntries.filter(s => s.name.trim());
            const res = await api.post('/family-wellbeing/log', {
                stressLevel,
                siblingEntries: validSiblings,
                notes
            });
            if (res.data.success) {
                toast.success('Weekly wellbeing logged! 🌊');
                setNotes('');
                fetchData();
            }
        } catch (err) {
            const msg = err.response?.data?.error?.message || 'Failed to save';
            toast.error(msg);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-12 h-12 border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin" />
                    <p className="text-sm text-gray-500">Loading family wellness data…</p>
                </div>
            </div>
        );
    }

    const stressData = history.map(h => h.stressLevel).reverse().slice(0, 12).reverse();
    const { rippleScores, correlation, totalLogs, totalSessions } = analysis || {};

    return (
        <div className="max-w-5xl mx-auto space-y-8 pb-12">
            {/* ─── Header ─── */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 text-white p-6 lg:p-8 shadow-xl">
                <div className="absolute -top-10 -right-10 w-48 h-48 bg-white/5 rounded-full blur-2xl" />
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full blur-xl" />
                <div className="relative z-10 flex items-start justify-between">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <Waves size={28} />
                            <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">Therapy Ripple</h1>
                        </div>
                        <p className="text-violet-100 text-sm lg:text-base max-w-lg leading-relaxed">
                            Track how therapy creates a ripple of wellbeing across your entire family — not just the child.
                        </p>
                    </div>
                    <div className="hidden md:flex items-center gap-3 bg-white/10 backdrop-blur-md rounded-xl px-4 py-3 border border-white/20">
                        <div className="text-center">
                            <p className="text-2xl font-bold">{totalLogs || 0}</p>
                            <p className="text-[10px] uppercase tracking-wider text-violet-200">Logs</p>
                        </div>
                        <div className="w-px h-8 bg-white/20" />
                        <div className="text-center">
                            <p className="text-2xl font-bold">{totalSessions || 0}</p>
                            <p className="text-[10px] uppercase tracking-wider text-violet-200">Sessions</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* ─── Two-Column Layout ─── */}
            <div className="grid lg:grid-cols-2 gap-6">
                {/* ─── Left: Ripple Visualization + Insights ─── */}
                <div className="space-y-6">
                    {/* Ripple Visualization */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-1 flex items-center gap-2">
                            <Heart size={18} className="text-violet-500" /> Family Ripple Effect
                        </h2>
                        <p className="text-xs text-gray-500 mb-4">Based on last 4 weeks of data</p>
                        <RippleVisualization scores={rippleScores} />
                    </div>

                    {/* Correlation Insight Card */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                        <div className="flex items-center justify-between mb-3">
                            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                <Brain size={18} className="text-indigo-500" /> AI Insight
                            </h2>
                            <TrendBadge trend={correlation?.trend || 'insufficient_data'} />
                        </div>
                        <p className="text-sm text-gray-600 leading-relaxed">{correlation?.insight}</p>
                        {correlation?.value !== null && correlation?.value !== undefined && (
                            <div className="mt-4 flex items-center gap-3 text-xs text-gray-400">
                                <span className="font-mono bg-gray-50 px-2 py-1 rounded">r = {correlation.value}</span>
                                <span>{correlation.dataPoints} data point{correlation.dataPoints !== 1 ? 's' : ''}</span>
                            </div>
                        )}
                    </div>

                    {/* Stress Trend Sparkline */}
                    {stressData.length >= 2 && (
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                <BarChart3 size={18} className="text-purple-500" /> Stress Trend
                            </h2>
                            <Sparkline data={stressData} color="#8b5cf6" height={56} />
                            <div className="flex justify-between text-[10px] text-gray-400 mt-1">
                                <span>Oldest</span><span>This Week</span>
                            </div>
                        </div>
                    )}
                </div>

                {/* ─── Right: Weekly Log Form ─── */}
                <div className="space-y-6">
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-1 flex items-center gap-2">
                            <Calendar size={18} className="text-teal-500" /> Weekly Check-in
                        </h2>
                        <p className="text-xs text-gray-500 mb-5">How is the family doing this week?</p>

                        {/* Stress Level Selector */}
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-3">Your Stress Level</label>
                            <div className="flex items-stretch gap-2">
                                {[1, 2, 3, 4, 5].map(level => (
                                    <button
                                        key={level}
                                        onClick={() => setStressLevel(level)}
                                        className={`flex-1 flex flex-col items-center gap-1.5 py-3 rounded-xl border-2 transition-all duration-200 ${stressLevel === level
                                            ? `bg-gradient-to-b ${STRESS_COLORS[level - 1]} text-white border-transparent shadow-lg scale-105`
                                            : 'bg-white border-gray-200 hover:border-gray-300 text-gray-600'
                                            }`}
                                    >
                                        <span className="text-2xl">{STRESS_EMOJIS[level - 1]}</span>
                                        <span className="text-[10px] font-semibold">{STRESS_LABELS[level - 1]}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Sibling Section */}
                        <div className="mb-6">
                            <button
                                onClick={() => setShowSiblings(!showSiblings)}
                                className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-violet-600 transition-colors w-full"
                            >
                                <Users size={16} />
                                <span>Sibling Feelings</span>
                                <span className="text-[10px] text-gray-400 ml-1">(optional)</span>
                                <span className="ml-auto">
                                    {showSiblings ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                </span>
                            </button>

                            {showSiblings && (
                                <div className="mt-3 space-y-3">
                                    {siblingEntries.map((entry, idx) => (
                                        <div key={idx} className="bg-gray-50 rounded-xl p-4 border border-gray-100 relative">
                                            <button onClick={() => removeSibling(idx)}
                                                className="absolute top-2 right-2 text-gray-300 hover:text-red-400 transition-colors">
                                                <X size={14} />
                                            </button>
                                            <input
                                                type="text"
                                                placeholder="Sibling's name"
                                                value={entry.name}
                                                onChange={e => updateSibling(idx, 'name', e.target.value)}
                                                className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm mb-3 focus:ring-2 focus:ring-violet-300 focus:border-violet-400 outline-none"
                                            />
                                            <div className="flex flex-wrap gap-1.5">
                                                {FEELINGS.map(f => {
                                                    const FIcon = f.icon;
                                                    return (
                                                        <button
                                                            key={f.key}
                                                            onClick={() => updateSibling(idx, 'feeling', f.key)}
                                                            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-all ${entry.feeling === f.key
                                                                ? `${f.bg} ${f.color} ${f.border} ring-2 ${f.ring} ring-offset-1`
                                                                : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'
                                                                }`}
                                                        >
                                                            <FIcon size={13} /> {f.label}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    ))}
                                    <button
                                        onClick={addSibling}
                                        className="flex items-center gap-1.5 text-sm text-violet-600 hover:text-violet-700 font-medium"
                                    >
                                        <Plus size={15} /> Add Sibling
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Notes */}
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Notes <span className="text-gray-400 font-normal">(optional)</span></label>
                            <textarea
                                value={notes}
                                onChange={e => setNotes(e.target.value)}
                                placeholder="How was your week overall? Any observations about the family…"
                                rows={3}
                                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-violet-300 focus:border-violet-400 outline-none resize-none"
                            />
                        </div>

                        {/* Submit */}
                        <button
                            onClick={handleSubmit}
                            disabled={submitting}
                            className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white font-semibold py-3 rounded-xl shadow-lg shadow-violet-200 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-60"
                        >
                            {submitting ? (
                                <div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                            ) : (
                                <><Send size={16} /> Log This Week</>
                            )}
                        </button>
                    </div>

                    {/* Recent Logs */}
                    {history.length > 0 && (
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <Sparkles size={18} className="text-amber-500" /> Recent Logs
                            </h2>
                            <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                                {history.slice(0, 8).map((entry, idx) => {
                                    const d = new Date(entry.weekStart);
                                    const weekLabel = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                                    return (
                                        <div key={idx} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
                                            <span className="text-2xl">{STRESS_EMOJIS[entry.stressLevel - 1]}</span>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-gray-800">Week of {weekLabel}</p>
                                                <p className="text-xs text-gray-500 truncate">
                                                    Stress: {STRESS_LABELS[entry.stressLevel - 1]}
                                                    {entry.siblingEntries?.length > 0 && ` • ${entry.siblingEntries.length} sibling(s)`}
                                                </p>
                                            </div>
                                            <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${STRESS_COLORS[entry.stressLevel - 1]} flex items-center justify-center text-white text-xs font-bold shadow-sm`}>
                                                {entry.stressLevel}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TherapyRipple;
