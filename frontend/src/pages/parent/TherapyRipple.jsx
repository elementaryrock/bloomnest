import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
    Waves, Heart, Smile, Frown, Meh, AlertTriangle, Zap,
    Plus, TrendingUp, TrendingDown, Minus, BarChart3, Users,
    ChevronDown, ChevronUp, Send, Calendar, Brain, Sparkles, X,
    Download, Activity, Award, FileText, Loader2, Flame, Lightbulb,
    ArrowUpRight, ArrowDownRight, Equal, CalendarDays
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

const FEELING_EMOJI = { happy: '😊', neutral: '😐', anxious: '😰', frustrated: '😤', sad: '😢' };
const HEATMAP_COLORS = ['#10b981', '#6ee7b7', '#fbbf24', '#f97316', '#ef4444'];

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

                {[...rings].reverse().map((ring, i) => {
                    const actualIndex = rings.length - 1 - i;
                    const dashLen = 2 * Math.PI * ring.radius;
                    const filled = (ring.score / 100) * dashLen;
                    return (
                        <g key={ring.label}>
                            <circle cx="0" cy="0" r={ring.radius} fill={`url(#rg${actualIndex})`}
                                stroke={ring.color} strokeWidth="2" strokeOpacity="0.15" />
                            <circle cx="0" cy="0" r={ring.radius} fill="none"
                                stroke={ring.color} strokeWidth="4" strokeLinecap="round"
                                strokeDasharray={`${filled} ${dashLen - filled}`}
                                strokeDashoffset={dashLen * 0.25}
                                className="transition-all duration-1000 ease-out"
                                style={{ animation: `ripplePulse${actualIndex} 3s ease-in-out infinite` }}
                            />
                            <text x="0" y={-ring.radius - 8} textAnchor="middle" fill={ring.color}
                                fontSize="10" fontWeight="600" className="select-none">
                                {ring.label} {ring.score}%
                            </text>
                        </g>
                    );
                })}

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

// ─── Trend Badge ───
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

// ─── Summary Stat Card ───
const StatCard = ({ icon: Icon, label, value, color, subtext }) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex items-center gap-3 hover:shadow-md transition-shadow">
        <div className={`w-10 h-10 rounded-lg ${color} flex items-center justify-center text-white flex-shrink-0`}>
            <Icon size={18} />
        </div>
        <div className="min-w-0">
            <p className="text-lg font-bold text-gray-900 leading-tight">{value}</p>
            <p className="text-xs text-gray-500 truncate">{label}</p>
            {subtext && <p className="text-[10px] text-gray-400 truncate">{subtext}</p>}
        </div>
    </div>
);

// ─── NEW: Stress Heatmap Calendar ───
const StressHeatmap = ({ history }) => {
    const weeks = history.slice(0, 12).reverse(); // oldest first for left-to-right
    if (weeks.length < 2) return null;

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-1 flex items-center gap-2">
                <CalendarDays size={18} className="text-teal-500" /> Stress Calendar
            </h2>
            <p className="text-xs text-gray-500 mb-4">Last {weeks.length} weeks at a glance</p>
            <div className="flex items-end gap-1.5 justify-center">
                {weeks.map((w, i) => {
                    const d = new Date(w.weekStart);
                    const label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                    const colorIdx = w.stressLevel - 1;
                    return (
                        <div key={i} className="flex flex-col items-center gap-1 group relative">
                            <div
                                className="w-7 h-7 sm:w-8 sm:h-8 rounded-md transition-transform hover:scale-110 cursor-default border border-black/5"
                                style={{ backgroundColor: HEATMAP_COLORS[colorIdx] }}
                                title={`${label}: ${STRESS_LABELS[colorIdx]}`}
                            />
                            <span className="text-[8px] text-gray-400 leading-none">
                                {d.toLocaleDateString('en-US', { month: 'narrow', day: 'numeric' })}
                            </span>
                            {/* Tooltip */}
                            <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-[10px] px-2 py-1 rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                                {label}: {STRESS_LABELS[colorIdx]}
                            </div>
                        </div>
                    );
                })}
            </div>
            <div className="flex items-center justify-center gap-1.5 mt-3">
                <span className="text-[9px] text-gray-400">Low</span>
                {HEATMAP_COLORS.map((c, i) => (
                    <div key={i} className="w-3 h-3 rounded-sm border border-black/5" style={{ backgroundColor: c }} />
                ))}
                <span className="text-[9px] text-gray-400">High</span>
            </div>
        </div>
    );
};

// ─── NEW: Week-over-Week Comparison ───
const WeekComparison = ({ history }) => {
    if (history.length < 2) return null;
    const thisWeek = history[0];
    const lastWeek = history[1];

    const stressDelta = thisWeek.stressLevel - lastWeek.stressLevel;
    const thisWeekSibCount = thisWeek.siblingEntries?.length || 0;
    const lastWeekSibCount = lastWeek.siblingEntries?.length || 0;

    const DeltaIcon = stressDelta < 0 ? ArrowDownRight : stressDelta > 0 ? ArrowUpRight : Equal;
    const deltaColor = stressDelta < 0 ? 'text-emerald-500' : stressDelta > 0 ? 'text-red-500' : 'text-gray-400';
    const deltaLabel = stressDelta < 0 ? 'Improved' : stressDelta > 0 ? 'Increased' : 'No Change';

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <BarChart3 size={18} className="text-indigo-500" /> Week Comparison
            </h2>
            <div className="grid grid-cols-3 gap-3 text-center">
                {/* Last Week */}
                <div className="space-y-1">
                    <p className="text-[10px] uppercase tracking-wider text-gray-400">Last Week</p>
                    <div className={`w-12 h-12 mx-auto rounded-xl bg-gradient-to-br ${STRESS_COLORS[lastWeek.stressLevel - 1]} flex items-center justify-center text-white text-lg font-bold shadow-sm`}>
                        {STRESS_EMOJIS[lastWeek.stressLevel - 1]}
                    </div>
                    <p className="text-xs text-gray-600 font-medium">{STRESS_LABELS[lastWeek.stressLevel - 1]}</p>
                    {lastWeekSibCount > 0 && <p className="text-[10px] text-gray-400">{lastWeekSibCount} sibling(s)</p>}
                </div>

                {/* Delta Arrow */}
                <div className="flex flex-col items-center justify-center">
                    <DeltaIcon size={28} className={`${deltaColor} transition-all`} />
                    <p className={`text-xs font-semibold mt-1 ${deltaColor}`}>{deltaLabel}</p>
                    {stressDelta !== 0 && (
                        <p className="text-[10px] text-gray-400 mt-0.5">
                            {Math.abs(stressDelta)} level{Math.abs(stressDelta) !== 1 ? 's' : ''}
                        </p>
                    )}
                </div>

                {/* This Week */}
                <div className="space-y-1">
                    <p className="text-[10px] uppercase tracking-wider text-gray-400">This Week</p>
                    <div className={`w-12 h-12 mx-auto rounded-xl bg-gradient-to-br ${STRESS_COLORS[thisWeek.stressLevel - 1]} flex items-center justify-center text-white text-lg font-bold shadow-sm`}>
                        {STRESS_EMOJIS[thisWeek.stressLevel - 1]}
                    </div>
                    <p className="text-xs text-gray-600 font-medium">{STRESS_LABELS[thisWeek.stressLevel - 1]}</p>
                    {thisWeekSibCount > 0 && <p className="text-[10px] text-gray-400">{thisWeekSibCount} sibling(s)</p>}
                </div>
            </div>
        </div>
    );
};

// ─── NEW: Sibling Mood Timeline ───
const SiblingMoodTimeline = ({ history }) => {
    // Build a map of sibling names → array of { week, feeling }
    const siblingMap = useMemo(() => {
        const map = {};
        // Reversed so timeline reads oldest→newest left-to-right
        const entries = [...history].slice(0, 12).reverse();
        entries.forEach(entry => {
            (entry.siblingEntries || []).forEach(sib => {
                const name = sib.name.trim();
                if (!name) return;
                if (!map[name]) map[name] = [];
                map[name].push({ week: entry.weekStart, feeling: sib.feeling });
            });
        });
        return map;
    }, [history]);

    const siblingNames = Object.keys(siblingMap);
    if (siblingNames.length === 0) return null;
    // Only show if at least one sibling has 2+ data points
    if (!siblingNames.some(name => siblingMap[name].length >= 2)) return null;

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-1 flex items-center gap-2">
                <Users size={18} className="text-emerald-500" /> Sibling Mood Timeline
            </h2>
            <p className="text-xs text-gray-500 mb-4">How siblings' feelings have changed over time</p>
            <div className="space-y-3">
                {siblingNames.map(name => {
                    const data = siblingMap[name];
                    if (data.length < 2) return null;
                    return (
                        <div key={name} className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                            <p className="text-xs font-semibold text-gray-700 mb-2">{name}</p>
                            <div className="flex items-center gap-1 overflow-x-auto pb-1">
                                {data.map((d, i) => {
                                    const weekLabel = new Date(d.week).toLocaleDateString('en-US', { month: 'narrow', day: 'numeric' });
                                    return (
                                        <div key={i} className="flex flex-col items-center gap-0.5 min-w-[2.5rem]">
                                            <span className="text-lg" title={`${FEELINGS.find(f => f.key === d.feeling)?.label}: ${weekLabel}`}>
                                                {FEELING_EMOJI[d.feeling] || '😐'}
                                            </span>
                                            <span className="text-[8px] text-gray-400">{weekLabel}</span>
                                            {i < data.length - 1 && (
                                                <div className="absolute" style={{ display: 'none' }} /> // spacing handled by gap
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

// ─── NEW: Smart Recommendations ───
const SmartRecommendations = ({ history, analysis, streak }) => {
    const tips = useMemo(() => {
        const result = [];
        if (!history || history.length === 0) return result;

        const recent3 = history.slice(0, 3);
        const avgRecent = recent3.reduce((s, h) => s + h.stressLevel, 0) / recent3.length;

        // Stress-based tips
        if (avgRecent >= 4) {
            result.push({
                emoji: '🧘',
                title: 'High stress detected',
                text: 'Your recent stress levels are elevated. Consider trying a 10-minute family relaxation activity like deep breathing or a short walk together.',
                color: 'border-l-red-400 bg-red-50/50'
            });
        } else if (avgRecent <= 2) {
            result.push({
                emoji: '🎉',
                title: 'Great progress!',
                text: 'Your family stress has been consistently low. Keep up the positive habits that are working for your family!',
                color: 'border-l-emerald-400 bg-emerald-50/50'
            });
        }

        // Streak-based tips
        if (streak >= 4) {
            result.push({
                emoji: '🔥',
                title: `${streak}-week streak!`,
                text: 'Amazing consistency! Regular tracking helps identify patterns faster. Your commitment is making a real difference.',
                color: 'border-l-orange-400 bg-orange-50/50'
            });
        } else if (streak === 0 && history.length > 0) {
            result.push({
                emoji: '📝',
                title: 'Resume your logging',
                text: 'Your logging streak has paused. Even a quick 1-minute check-in helps maintain the bigger picture.',
                color: 'border-l-amber-400 bg-amber-50/50'
            });
        }

        // Sibling data tips
        const recentWithSiblings = history.slice(0, 4).filter(h => h.siblingEntries?.length > 0).length;
        if (recentWithSiblings === 0 && history.length >= 3) {
            result.push({
                emoji: '👥',
                title: 'Track sibling feelings',
                text: 'You haven\'t logged sibling emotions recently. Tracking siblings helps paint a fuller picture of the therapy ripple effect.',
                color: 'border-l-blue-400 bg-blue-50/50'
            });
        }

        // Correlation-based tips
        const trend = analysis?.correlation?.trend;
        if (trend === 'positive') {
            result.push({
                emoji: '🌟',
                title: 'Positive family connection',
                text: 'Your family wellbeing is positively connected to therapy progress. The whole family is healing together — keep going!',
                color: 'border-l-violet-400 bg-violet-50/50'
            });
        } else if (trend === 'inverse') {
            result.push({
                emoji: '💪',
                title: 'Stay the course',
                text: 'Some variability in the data is normal, especially in early therapy stages. Consistency is key — patterns will emerge with more data.',
                color: 'border-l-indigo-400 bg-indigo-50/50'
            });
        }

        // Notes engagement
        const recentWithNotes = history.slice(0, 4).filter(h => h.notes && h.notes.trim()).length;
        if (recentWithNotes === 0 && history.length >= 3) {
            result.push({
                emoji: '✍️',
                title: 'Add weekly notes',
                text: 'Adding notes to your logs helps you remember context later. Even a sentence about the week makes progress reports richer.',
                color: 'border-l-teal-400 bg-teal-50/50'
            });
        }

        return result.slice(0, 3); // Show max 3 tips
    }, [history, analysis, streak]);

    if (tips.length === 0) return null;

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Lightbulb size={18} className="text-amber-500" /> Smart Tips
            </h2>
            <div className="space-y-2.5">
                {tips.map((tip, i) => (
                    <div key={i} className={`rounded-xl border-l-4 p-3 ${tip.color}`}>
                        <div className="flex items-start gap-2">
                            <span className="text-lg flex-shrink-0">{tip.emoji}</span>
                            <div>
                                <p className="text-sm font-semibold text-gray-800">{tip.title}</p>
                                <p className="text-xs text-gray-600 leading-relaxed mt-0.5">{tip.text}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

// ─── Main Component ───
const TherapyRipple = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [downloadingPdf, setDownloadingPdf] = useState(false);

    // Form state
    const [stressLevel, setStressLevel] = useState(3);
    const [showSiblings, setShowSiblings] = useState(false);
    const [siblingEntries, setSiblingEntries] = useState([]);
    const [notes, setNotes] = useState('');

    // Data state
    const [analysis, setAnalysis] = useState(null);
    const [history, setHistory] = useState([]);

    // Expanded log tracking
    const [expandedLogIdx, setExpandedLogIdx] = useState(null);

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

    // ─── Compute Streak ───
    const streak = useMemo(() => {
        if (history.length === 0) return 0;
        let count = 0;
        const now = new Date();
        // History is sorted desc by weekStart
        for (let i = 0; i < history.length; i++) {
            const entryDate = new Date(history[i].weekStart);
            // Expected week start for this position in the streak
            const expectedWeek = new Date(now);
            expectedWeek.setDate(expectedWeek.getDate() - (i * 7));
            // Get Monday of expected week
            const day = expectedWeek.getDay();
            const diff = expectedWeek.getDate() - day + (day === 0 ? -6 : 1);
            expectedWeek.setDate(diff);
            expectedWeek.setHours(0, 0, 0, 0);
            entryDate.setHours(0, 0, 0, 0);

            // Allow up to 2 days tolerance
            const daysDiff = Math.abs((entryDate.getTime() - expectedWeek.getTime()) / (1000 * 60 * 60 * 24));
            if (daysDiff <= 2) {
                count++;
            } else {
                break;
            }
        }
        return count;
    }, [history]);

    const isMilestone = streak > 0 && streak % 4 === 0;

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

    // PDF download handler
    const handleDownloadPdf = async () => {
        try {
            setDownloadingPdf(true);
            const response = await api.get('/family-wellbeing/progress-pdf', {
                responseType: 'blob',
                timeout: 30000
            });
            const blob = new Blob([response.data], { type: 'application/pdf' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `TherapyRipple_Progress_${new Date().toISOString().slice(0, 10)}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
            toast.success('Progress report downloaded! 📄');
        } catch (err) {
            console.error('PDF download failed:', err);
            toast.error('Failed to download progress report');
        } finally {
            setDownloadingPdf(false);
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

    // Computed summary stats
    const avgStress = history.length > 0
        ? (history.reduce((s, h) => s + h.stressLevel, 0) / history.length).toFixed(1)
        : '—';
    const bestWeek = history.length > 0
        ? history.reduce((best, h) => h.stressLevel < best.stressLevel ? h : best, history[0])
        : null;
    const bestWeekLabel = bestWeek
        ? new Date(bestWeek.weekStart).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
        : '—';
    const improvementText = (() => {
        if (history.length < 4) return null;
        const recent3 = history.slice(0, 3);
        const oldest3 = history.slice(-3);
        const recentAvg = recent3.reduce((s, h) => s + h.stressLevel, 0) / 3;
        const oldAvg = oldest3.reduce((s, h) => s + h.stressLevel, 0) / 3;
        const diff = oldAvg - recentAvg;
        if (diff > 0.3) return `↓ ${diff.toFixed(1)} improvement`;
        if (diff < -0.3) return `↑ ${Math.abs(diff).toFixed(1)} increase`;
        return 'Steady';
    })();

    // Empty / onboarding state
    if (!analysis && history.length === 0) {
        return (
            <div className="max-w-2xl mx-auto py-16 text-center space-y-6">
                <div className="w-20 h-20 mx-auto bg-violet-100 rounded-full flex items-center justify-center">
                    <Waves size={36} className="text-violet-500" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900">Welcome to Therapy Ripple</h1>
                <p className="text-gray-500 max-w-md mx-auto leading-relaxed">
                    Track how therapy creates a ripple of wellbeing across your entire family.
                    Start by logging your first weekly check-in below — it only takes a minute!
                </p>
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 text-left max-w-lg mx-auto space-y-4">
                    <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-violet-100 flex items-center justify-center text-violet-600 font-bold text-sm flex-shrink-0">1</div>
                        <p className="text-sm text-gray-600">Rate your <strong>family stress level</strong> for this week</p>
                    </div>
                    <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-violet-100 flex items-center justify-center text-violet-600 font-bold text-sm flex-shrink-0">2</div>
                        <p className="text-sm text-gray-600">Optionally log <strong>sibling feelings</strong> to track the broader impact</p>
                    </div>
                    <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-violet-100 flex items-center justify-center text-violet-600 font-bold text-sm flex-shrink-0">3</div>
                        <p className="text-sm text-gray-600">Watch the <strong>ripple visualization</strong> grow as you log each week</p>
                    </div>
                </div>
                <p className="text-xs text-gray-400">Scroll down to fill out your first log ↓</p>

                <div className="mt-8 max-w-lg mx-auto">
                    <FormCard
                        stressLevel={stressLevel} setStressLevel={setStressLevel}
                        showSiblings={showSiblings} setShowSiblings={setShowSiblings}
                        siblingEntries={siblingEntries} addSibling={addSibling}
                        removeSibling={removeSibling} updateSibling={updateSibling}
                        notes={notes} setNotes={setNotes}
                        submitting={submitting} handleSubmit={handleSubmit}
                    />
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto space-y-8 pb-12">
            {/* ─── Header ─── */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 text-white p-6 lg:p-8 shadow-xl">
                <div className="absolute -top-10 -right-10 w-48 h-48 bg-white/5 rounded-full blur-2xl" />
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full blur-xl" />
                <div className="relative z-10 flex items-start justify-between flex-wrap gap-4">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <Waves size={28} />
                            <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">Therapy Ripple</h1>
                        </div>
                        <p className="text-violet-100 text-sm lg:text-base max-w-lg leading-relaxed">
                            Track how therapy creates a ripple of wellbeing across your entire family — not just the child.
                        </p>
                    </div>
                    <div className="flex items-center gap-3 flex-wrap">
                        {/* Streak Badge */}
                        {streak > 0 && (
                            <div className={`flex items-center gap-1.5 bg-white/15 backdrop-blur-md rounded-xl px-3 py-2.5 border border-white/20 ${isMilestone ? 'animate-pulse' : ''}`}>
                                <Flame size={16} className="text-orange-300" />
                                <span className="text-sm font-bold">{streak}</span>
                                <span className="text-[10px] text-violet-200">week{streak !== 1 ? 's' : ''}</span>
                            </div>
                        )}
                        {/* PDF Download Button */}
                        <button
                            onClick={handleDownloadPdf}
                            disabled={downloadingPdf}
                            className="flex items-center gap-2 bg-white/15 hover:bg-white/25 backdrop-blur-md rounded-xl px-4 py-2.5 border border-white/20 transition-all duration-200 text-sm font-medium disabled:opacity-60"
                            title="Download progress report as PDF"
                        >
                            {downloadingPdf ? (
                                <Loader2 size={16} className="animate-spin" />
                            ) : (
                                <Download size={16} />
                            )}
                            <span className="hidden sm:inline">{downloadingPdf ? 'Generating…' : 'Download PDF'}</span>
                        </button>
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
            </div>

            {/* ─── Summary Stat Cards ─── */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
                <StatCard icon={Activity} label="Avg Stress" value={avgStress} color="bg-gradient-to-br from-violet-500 to-purple-600" />
                <StatCard icon={Award} label="Best Week" value={bestWeekLabel} color="bg-gradient-to-br from-emerald-500 to-teal-600"
                    subtext={bestWeek ? `Stress: ${STRESS_LABELS[bestWeek.stressLevel - 1]}` : undefined} />
                <StatCard icon={FileText} label="Total Logs" value={String(totalLogs || 0)} color="bg-gradient-to-br from-blue-500 to-indigo-600" />
                <StatCard icon={TrendingUp} label="Trend" value={improvementText || 'Gathering…'} color="bg-gradient-to-br from-amber-500 to-orange-600" />
                <StatCard icon={Flame} label="Streak" value={streak > 0 ? `${streak} week${streak !== 1 ? 's' : ''}` : 'Start now!'} color="bg-gradient-to-br from-red-500 to-orange-500"
                    subtext={isMilestone ? '🎉 Milestone!' : streak > 0 ? 'Keep going!' : undefined} />
            </div>

            {/* ─── Two-Column Layout ─── */}
            <div className="grid lg:grid-cols-2 gap-6">
                {/* ─── Left: Ripple Visualization + Insights + New Features ─── */}
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

                    {/* NEW: Stress Heatmap Calendar */}
                    <StressHeatmap history={history} />

                    {/* NEW: Sibling Mood Timeline */}
                    <SiblingMoodTimeline history={history} />
                </div>

                {/* ─── Right: Form + Comparison + Tips + Logs ─── */}
                <div className="space-y-6">
                    {/* NEW: Week-over-Week Comparison */}
                    <WeekComparison history={history} />

                    <FormCard
                        stressLevel={stressLevel} setStressLevel={setStressLevel}
                        showSiblings={showSiblings} setShowSiblings={setShowSiblings}
                        siblingEntries={siblingEntries} addSibling={addSibling}
                        removeSibling={removeSibling} updateSibling={updateSibling}
                        notes={notes} setNotes={setNotes}
                        submitting={submitting} handleSubmit={handleSubmit}
                    />

                    {/* NEW: Smart Recommendations */}
                    <SmartRecommendations history={history} analysis={analysis} streak={streak} />

                    {/* Recent Logs — Expandable */}
                    {history.length > 0 && (
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                    <Sparkles size={18} className="text-amber-500" /> Recent Logs
                                </h2>
                                <span className="text-xs text-gray-400">{history.length} total</span>
                            </div>
                            <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
                                {history.slice(0, 12).map((entry, idx) => {
                                    const d = new Date(entry.weekStart);
                                    const weekLabel = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                                    const isExpanded = expandedLogIdx === idx;
                                    return (
                                        <div key={idx} className="group">
                                            <button
                                                onClick={() => setExpandedLogIdx(isExpanded ? null : idx)}
                                                className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all duration-200 text-left ${isExpanded
                                                    ? 'bg-violet-50 border-violet-200 shadow-sm'
                                                    : 'bg-gray-50 border-gray-100 hover:bg-gray-100'
                                                    }`}
                                            >
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
                                                <ChevronDown size={14} className={`text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                                            </button>

                                            {isExpanded && (
                                                <div className="mt-1 mx-2 p-3 bg-white rounded-lg border border-violet-100 space-y-2 animate-in slide-in-from-top-1">
                                                    {entry.notes && (
                                                        <div>
                                                            <p className="text-[10px] uppercase tracking-wider text-gray-400 mb-0.5">Notes</p>
                                                            <p className="text-sm text-gray-700">{entry.notes}</p>
                                                        </div>
                                                    )}
                                                    {entry.siblingEntries?.length > 0 && (
                                                        <div>
                                                            <p className="text-[10px] uppercase tracking-wider text-gray-400 mb-1">Sibling Feelings</p>
                                                            <div className="flex flex-wrap gap-1.5">
                                                                {entry.siblingEntries.map((sib, si) => (
                                                                    <span key={si} className="inline-flex items-center gap-1 px-2 py-1 bg-gray-50 rounded-md border border-gray-100 text-xs text-gray-700">
                                                                        {FEELING_EMOJI[sib.feeling] || '😐'} <strong>{sib.name}</strong>: {FEELINGS.find(f => f.key === sib.feeling)?.label || sib.feeling}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                    {!entry.notes && (!entry.siblingEntries || entry.siblingEntries.length === 0) && (
                                                        <p className="text-xs text-gray-400 italic">No additional details for this log.</p>
                                                    )}
                                                </div>
                                            )}
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

// ─── Extracted Weekly Check-in Form ───
const FormCard = ({
    stressLevel, setStressLevel,
    showSiblings, setShowSiblings,
    siblingEntries, addSibling, removeSibling, updateSibling,
    notes, setNotes,
    submitting, handleSubmit
}) => (
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
);

export default TherapyRipple;
