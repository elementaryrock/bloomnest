import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import './skillsprout.css';
import {
    Sprout, Droplets, Trophy, Star, Plus, Flame, Zap,
    Leaf, ChevronRight, X, Check, BarChart3, Clock,
    Sparkles, Target, BookOpen, Puzzle, Edit2, Trash2,
    Activity, MessageCircle, Heart, Shield, RefreshCw
} from 'lucide-react';

// ─── Constants ──────────────────────────────────────────────
const GROWTH_STAGES = [
    { label: 'Seed', emoji: '🌱', color: 'from-stone-400 to-stone-500' },
    { label: 'Sprout', emoji: '🌿', color: 'from-lime-400 to-green-500' },
    { label: 'Small Plant', emoji: '🪴', color: 'from-emerald-400 to-emerald-600' },
    { label: 'Flower', emoji: '🌸', color: 'from-pink-400 to-rose-500' },
    { label: 'Tree', emoji: '🌳', color: 'from-green-500 to-emerald-700' },
];

const CATEGORY_CONFIG = {
    communication: { icon: MessageCircle, label: 'Communication', color: 'bg-sky-100 text-sky-700', border: 'border-sky-200', plant: 'Chatter Cherry 🍒' },
    cognitive: { icon: Puzzle, label: 'Cognitive', color: 'bg-violet-100 text-violet-700', border: 'border-violet-200', plant: 'Think Thistle 🌺' },
    motor: { icon: Activity, label: 'Motor Skills', color: 'bg-amber-100 text-amber-700', border: 'border-amber-200', plant: 'Mighty Maple 🍁' },
    social: { icon: Heart, label: 'Social', color: 'bg-rose-100 text-rose-700', border: 'border-rose-200', plant: 'Kindness Clover 🍀' },
    emotional: { icon: Sparkles, label: 'Emotional', color: 'bg-purple-100 text-purple-700', border: 'border-purple-200', plant: 'Calm Cactus 🌵' },
    speech: { icon: BookOpen, label: 'Speech', color: 'bg-teal-100 text-teal-700', border: 'border-teal-200', plant: 'Speak Sunflower 🌻' },
    sensory: { icon: Leaf, label: 'Sensory', color: 'bg-green-100 text-green-700', border: 'border-green-200', plant: 'Wonder Willow 🌿' },
    selfcare: { icon: Shield, label: 'Self-Care', color: 'bg-orange-100 text-orange-700', border: 'border-orange-200', plant: 'Care Chrysanthemum 🌸' },
    custom: { icon: Star, label: 'Custom Habit', color: 'bg-amber-100 text-amber-700', border: 'border-amber-200', plant: 'Dream Daisy 🌼' },
};

const SEASONS = {
    spring: { label: '🌸 Spring', bg: 'from-pink-50 via-green-50 to-emerald-50', sky: 'from-sky-200 to-sky-100' },
    summer: { label: '☀️ Summer', bg: 'from-yellow-50 via-amber-50 to-orange-50', sky: 'from-sky-300 to-sky-200' },
    autumn: { label: '🍂 Autumn', bg: 'from-orange-50 via-amber-50 to-yellow-50', sky: 'from-orange-100 to-amber-100' },
    winter: { label: '❄️ Winter', bg: 'from-blue-50 via-slate-50 to-indigo-50', sky: 'from-blue-100 to-slate-100' },
};

// Auto-detect season from current month
function getCurrentSeason() {
    const m = new Date().getMonth();
    if (m >= 2 && m <= 4) return 'spring';
    if (m >= 5 && m <= 7) return 'summer';
    if (m >= 8 && m <= 10) return 'autumn';
    return 'winter';
}

// ─── Confetti Component ──────────────────────────────────────
function Confetti({ active }) {
    const colors = ['#f87171', '#fb923c', '#facc15', '#4ade80', '#60a5fa', '#c084fc', '#f472b6'];
    const shapes = ['●', '★', '■', '◆', '▲'];
    if (!active) return null;
    return (
        <div className="fixed inset-0 pointer-events-none z-[9999] overflow-hidden">
            {Array.from({ length: 60 }).map((_, i) => (
                <div
                    key={i}
                    className="confetti-particle absolute text-lg font-bold"
                    style={{
                        left: `${Math.random() * 100}%`,
                        top: '-20px',
                        color: colors[i % colors.length],
                        fontSize: `${Math.random() * 14 + 10}px`,
                        animationDuration: `${Math.random() * 2 + 1.5}s`,
                        animationDelay: `${Math.random() * 0.8}s`,
                    }}
                >
                    {shapes[i % shapes.length]}
                </div>
            ))}
        </div>
    );
}

// ─── XP Float Popup ──────────────────────────────────────────
function XPPopup({ xp, onDone }) {
    useEffect(() => { const t = setTimeout(onDone, 1600); return () => clearTimeout(t); }, [onDone]);
    return (
        <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[9998] pointer-events-none">
            <div className="animate-xp-float text-4xl font-black text-yellow-500 drop-shadow-lg flex items-center gap-2">
                <Zap size={32} className="text-yellow-400" />
                +{xp} XP!
            </div>
        </div>
    );
}

// ─── Celebration Modal ───────────────────────────────────────
function CelebrationModal({ event, onClose }) {
    if (!event) return null;
    const messages = {
        stage: {
            title: `Your plant grew! ${GROWTH_STAGES[event.stage]?.emoji}`,
            subtitle: `It's now a ${GROWTH_STAGES[event.stage]?.label}!`,
            bg: 'from-emerald-400 to-teal-500',
        },
        complete: {
            title: `🌳 Goal Completed!`,
            subtitle: `${event.plantName || 'Your plant'} is now a beautiful tree!`,
            bg: 'from-yellow-400 to-amber-500',
        },
        watering: {
            title: `💧 Watered!`,
            subtitle: `${event.streak}-day streak! Keep it up!`,
            bg: 'from-sky-400 to-blue-500',
        },
        forest: {
            title: `🌲 Forest Milestone!`,
            subtitle: event.milestone || 'Amazing achievement!',
            bg: 'from-green-500 to-emerald-600',
        },
    };
    const cfg = messages[event.type] || messages.stage;
    return (
        <div className="celebration-overlay" onClick={onClose}>
            <div
                className="animate-pop-in bg-white rounded-3xl shadow-2xl p-8 max-w-sm w-full mx-4 text-center"
                onClick={e => e.stopPropagation()}
            >
                <div className={`w-20 h-20 rounded-full bg-gradient-to-br ${cfg.bg} flex items-center justify-center mx-auto mb-4 text-4xl shadow-lg`}>
                    {event.type === 'complete' ? '🌳' : event.type === 'watering' ? '💧' : event.type === 'forest' ? '🌲' : GROWTH_STAGES[event.stage]?.emoji}
                </div>
                <h2 className="text-2xl font-black text-gray-900 mb-2">{cfg.title}</h2>
                <p className="text-gray-600 text-lg mb-6">{cfg.subtitle}</p>
                {event.xp && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-2xl py-3 px-5 mb-5 flex items-center justify-center gap-2">
                        <Zap className="text-yellow-500" size={20} />
                        <span className="font-bold text-yellow-700 text-lg">+{event.xp} XP earned!</span>
                    </div>
                )}
                <button
                    onClick={onClose}
                    className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold rounded-2xl text-lg hover:from-emerald-600 hover:to-teal-600 transition-all"
                >
                    Yay! Keep going! 🎉
                </button>
            </div>
        </div>
    );
}

// ─── Plant Card ───────────────────────────────────────────────
function PlantCard({ goal, onComplete, onWater, onEdit, onDelete, currentUserId, disabled }) {
    const [watering, setWatering] = useState(false);
    const [completing, setCompleting] = useState(false);
    const [showRipple, setShowRipple] = useState(false);

    const isParentGoal = goal.goalOwnerType === 'parent';
    const isOwner = isParentGoal && goal.parentCreatorId === currentUserId;

    const cat = CATEGORY_CONFIG[goal.skillCategory] || CATEGORY_CONFIG.cognitive;
    const stage = GROWTH_STAGES[goal.growthStage] || GROWTH_STAGES[0];
    const progress = Math.round((goal.currentCompletions / goal.requiredCompletions) * 100);
    const alreadyWatered = goal.lastWatered && (() => {
        const t = new Date(); t.setHours(0, 0, 0, 0);
        const w = new Date(goal.lastWatered); w.setHours(0, 0, 0, 0);
        return t.getTime() === w.getTime();
    })();

    const handleWater = async () => {
        if (alreadyWatered || watering) return;
        setWatering(true);
        setShowRipple(true);
        setTimeout(() => setShowRipple(false), 700);
        await onWater(goal._id);
        setWatering(false);
    };

    const handleComplete = async () => {
        if (completing || goal.isCompleted) return;
        setCompleting(true);
        await onComplete(goal._id);
        setCompleting(false);
    };

    return (
        <div className={`plant-card bg-white rounded-3xl border-2 ${goal.isCompleted ? 'border-emerald-300' : cat.border} p-5 relative overflow-hidden`}>
            {/* Completed badge */}
            {goal.isCompleted && (
                <div className="absolute top-3 right-3 bg-emerald-500 text-white text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
                    <Check size={10} /> Done!
                </div>
            )}

            {/* Parent Goal Indicator */}
            {isParentGoal && (
                <div className="absolute top-3 left-3 flex items-center gap-1 bg-amber-100 text-amber-700 text-[10px] font-black px-2 py-1 rounded-full border border-amber-200 shadow-sm z-10">
                    <Star size={10} fill="currentColor" /> PARENT
                </div>
            )}

            {/* Edit/Delete for Parents */}
            {!goal.isCompleted && isOwner && (
                <div className="absolute top-12 left-3 flex flex-col gap-1 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                        onClick={() => onEdit(goal)}
                        className="w-7 h-7 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center text-blue-500 shadow-sm hover:bg-white transition-colors border border-blue-100"
                    >
                        <Edit2 size={12} />
                    </button>
                    <button
                        onClick={() => onDelete(goal._id)}
                        className="w-7 h-7 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center text-red-500 shadow-sm hover:bg-white transition-colors border border-red-100"
                    >
                        <Trash2 size={12} />
                    </button>
                </div>
            )}

            {/* Plant emoji + stage */}
            <div className="text-center mb-3 relative">
                <div className={`plant-stage-emoji ${goal.isCompleted ? 'tree-glow animate-bounce-gentle' : 'animate-sway'}`}>
                    {goal.isCompleted ? '🌳' : stage.emoji}
                </div>
                <div className={`inline-block mt-1 text-xs font-semibold px-3 py-1 rounded-full bg-gradient-to-r ${stage.color} text-white`}>
                    {goal.isCompleted ? 'Tree! 🎉' : stage.label}
                </div>
            </div>

            {/* Plant info */}
            <div className="mb-3">
                <p className="font-bold text-gray-900 text-center text-sm leading-tight">{goal.goalName}</p>
                <p className="text-xs text-center text-gray-500 mt-0.5">{goal.plantSpecies} {goal.plantEmoji}</p>
                <span className={`mt-2 inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${cat.color}`}>
                    {React.createElement(cat.icon, { size: 10 })} {cat.label}
                </span>
                {goal.goalOwnerType === 'therapist' && (
                    <span className="ml-1 text-[10px] text-gray-400 font-medium">Therapist Goal</span>
                )}
            </div>

            {/* Progress bar */}
            <div className="mb-3">
                <div className="flex justify-between items-center text-xs text-gray-500 mb-1">
                    <span>{goal.currentCompletions}/{goal.requiredCompletions} activities</span>
                    <span className="font-semibold text-emerald-600">{progress}%</span>
                </div>
                <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                    <div
                        className={`h-full bg-gradient-to-r ${stage.color} progress-fill rounded-full`}
                        style={{ width: `${progress}%` }}
                    />
                </div>
            </div>

            {/* Soil ripple effect */}
            {showRipple && (
                <div className="absolute bottom-16 left-1/2 -translate-x-1/2 w-8 h-8 border-2 border-sky-400 soil-ripple" />
            )}

            {/* Action buttons */}
            {!goal.isCompleted && (
                <div className="flex gap-2 mt-3">
                    <button
                        onClick={handleWater}
                        disabled={alreadyWatered || watering}
                        className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${alreadyWatered
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'water-btn text-white shadow-sm'
                            }`}
                    >
                        <Droplets size={14} />
                        {alreadyWatered ? 'Watered!' : watering ? '...' : 'Water'}
                    </button>
                    <button
                        onClick={handleComplete}
                        disabled={completing}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-semibold bg-gradient-to-r from-emerald-500 to-green-500 text-white hover:from-emerald-600 hover:to-green-600 transition-all shadow-sm"
                    >
                        <Check size={14} />
                        {completing ? '...' : 'Done!'}
                    </button>
                </div>
            )}

            {goal.isCompleted && (
                <div className="mt-3 text-center text-sm text-emerald-600 font-semibold bg-emerald-50 rounded-xl py-2">
                    🌳 Moved to Forest!
                </div>
            )}
        </div>
    );
}

// ─── Forest Tree ─────────────────────────────────────────────
function ForestTree({ goal, season }) {
    const cat = CATEGORY_CONFIG[goal.skillCategory] || CATEGORY_CONFIG.cognitive;
    const seasonLeaves = { spring: '🌸', summer: '🌿', autumn: '🍂', winter: '❄️' };
    return (
        <div className="forest-tree text-center group relative">
            {goal.goalOwnerType === 'parent' && (
                <div className="absolute -top-1 -right-1 text-amber-500">
                    <Star size={12} fill="currentColor" />
                </div>
            )}
            <div className="text-5xl mb-1 group-hover:animate-tree-shake inline-block">🌳</div>
            <div className="text-lg">{seasonLeaves[season]}</div>
            <p className="text-xs font-bold text-gray-700 mt-1 leading-tight max-w-[80px] mx-auto">{goal.goalName}</p>
            <span className={`mt-1 inline-block text-[10px] font-medium px-2 py-0.5 rounded-full ${cat.color}`}>{cat.label}</span>
        </div>
    );
}

// ─── Edit Goal Modal (For Parents) ───────────────────────────
function EditGoalModal({ goal, onUpdated, onClose }) {
    const [form, setForm] = useState({
        goalName: goal.goalName,
        description: goal.description || '',
        requiredCompletions: goal.requiredCompletions,
        rewardMilestone: goal.rewardMilestone || ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const submit = async e => {
        e.preventDefault();
        if (!form.goalName.trim()) { setError('Goal name is required'); return; }
        setLoading(true);
        try {
            const res = await api.put(`/skillsprout/parent-goals/${goal._id}`, form);
            if (res.data.success) { onUpdated(res.data.data); onClose(); }
        } catch (err) {
            setError(err.response?.data?.error?.message || 'Failed to update goal');
        } finally { setLoading(false); }
    };

    return (
        <div className="celebration-overlay" onClick={onClose}>
            <div className="bg-white rounded-3xl shadow-2xl p-6 max-w-md w-full mx-4" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between mb-5">
                    <h2 className="text-xl font-black text-gray-900 flex items-center gap-2">
                        <Edit2 className="text-blue-500" size={24} /> Edit Your Goal
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
                </div>

                <form onSubmit={submit} className="space-y-4">
                    {error && <div className="bg-red-50 text-red-600 text-sm rounded-xl px-4 py-3">{error}</div>}

                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1.5">Goal Name 🌱</label>
                        <input
                            type="text" required
                            className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-400 transition-colors"
                            value={form.goalName} onChange={e => setForm(f => ({ ...f, goalName: e.target.value }))}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1.5">Target Activities (Min: {goal.currentCompletions})</label>
                        <input
                            type="number" min={goal.currentCompletions + 1} max="50"
                            className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-400"
                            value={form.requiredCompletions}
                            onChange={e => setForm(f => ({ ...f, requiredCompletions: parseInt(e.target.value) || 10 }))}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1.5">Reward Message 🎁</label>
                        <input
                            type="text"
                            className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-400"
                            value={form.rewardMilestone} onChange={e => setForm(f => ({ ...f, rewardMilestone: e.target.value }))}
                        />
                    </div>

                    <button
                        type="submit" disabled={loading}
                        className="w-full py-4 bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-black text-lg rounded-2xl hover:from-blue-600 hover:to-indigo-600 transition-all shadow-md disabled:opacity-60"
                    >
                        {loading ? 'Updating...' : 'Save Changes'}
                    </button>
                </form>
            </div>
        </div>
    );
}

// ─── Add Goal Modal ──────────────────────────────────────────
function AddGoalModal({ patientId, onCreated, onClose }) {
    const { user } = useAuth();
    const [form, setForm] = useState({
        goalName: '', skillCategory: 'communication', difficultyLevel: 'easy',
        requiredCompletions: 10, rewardMilestone: '', description: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const submit = async e => {
        e.preventDefault();
        if (!form.goalName.trim()) { setError('Please enter a goal name'); return; }
        setLoading(true);
        try {
            const res = await api.post('/skillsprout/goals', { ...form, patientId });
            if (res.data.success) { onCreated(res.data.data); onClose(); }
        } catch (err) {
            setError(err.response?.data?.error?.message || 'Failed to create goal');
        } finally { setLoading(false); }
    };

    return (
        <div className="celebration-overlay" onClick={onClose}>
            <div className="bg-white rounded-3xl shadow-2xl p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between mb-5">
                    <h2 className="text-xl font-black text-gray-900 flex items-center gap-2">
                        <Sprout className="text-emerald-500" size={24} />
                        {user?.role === 'parent' ? 'Plant a Parent Goal' : 'Plant a Therapy Goal'}!
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
                </div>

                <form onSubmit={submit} className="space-y-4">
                    {error && <div className="bg-red-50 text-red-600 text-sm rounded-xl px-4 py-3">{error}</div>}

                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1.5">Goal Name 🌱</label>
                        <input
                            type="text" required placeholder="e.g. Practice eye contact for 2 minutes"
                            className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-400 transition-colors"
                            value={form.goalName} onChange={e => setForm(f => ({ ...f, goalName: e.target.value }))}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1.5">Skill Category 🏷️</label>
                        <select
                            className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-400"
                            value={form.skillCategory} onChange={e => setForm(f => ({ ...f, skillCategory: e.target.value }))}
                        >
                            {Object.entries(CATEGORY_CONFIG).map(([k, v]) => (
                                <option key={k} value={k}>{v.label} — {v.plant}</option>
                            ))}
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1.5">Difficulty ⭐</label>
                            <select
                                className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-400"
                                value={form.difficultyLevel} onChange={e => setForm(f => ({ ...f, difficultyLevel: e.target.value }))}
                            >
                                <option value="easy">Easy 😊</option>
                                <option value="medium">Medium 💪</option>
                                <option value="hard">Hard 🦁</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1.5">Activities needed</label>
                            <input
                                type="number" min="1" max="50"
                                className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-400"
                                value={form.requiredCompletions}
                                onChange={e => setForm(f => ({ ...f, requiredCompletions: parseInt(e.target.value) || 10 }))}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1.5">Reward Message 🎁 (optional)</label>
                        <input
                            type="text" placeholder="e.g. You're a communication superstar!"
                            className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-400"
                            value={form.rewardMilestone} onChange={e => setForm(f => ({ ...f, rewardMilestone: e.target.value }))}
                        />
                    </div>

                    {/* Preview the plant */}
                    <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-center">
                        <p className="text-xs text-emerald-600 font-semibold mb-1">Your plant will be…</p>
                        <p className="text-lg font-black text-emerald-700">
                            {CATEGORY_CONFIG[form.skillCategory]?.plant}
                        </p>
                        <div className="text-4xl mt-2">🌱</div>
                    </div>

                    <button
                        type="submit" disabled={loading}
                        className="w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-black text-lg rounded-2xl hover:from-emerald-600 hover:to-teal-600 transition-all shadow-md disabled:opacity-60"
                    >
                        {loading ? '🌱 Planting...' : '🌱 Plant This Goal!'}
                    </button>
                </form>
            </div>
        </div>
    );
}

// ─── Analytics Panel ─────────────────────────────────────────
function AnalyticsPanel({ patientId }) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get(`/skillsprout/analytics/${patientId}`)
            .then(r => setData(r.data.data))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [patientId]);

    if (loading) return (
        <div className="flex items-center justify-center h-40">
            <div className="animate-spin w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full" />
        </div>
    );
    if (!data) return null;

    const categories = Object.entries(data.categoryBreakdown || {});

    return (
        <div className="space-y-5">
            {/* Stats row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                    { label: 'Total Goals', value: data.totalGoals, icon: Target, color: 'text-violet-600 bg-violet-50' },
                    { label: 'Completed', value: data.completedGoals, icon: Check, color: 'text-emerald-600 bg-emerald-50' },
                    { label: 'In Progress', value: data.inProgressGoals, icon: Sprout, color: 'text-amber-600 bg-amber-50' },
                    { label: 'Avg Progress', value: `${data.avgProgress}%`, icon: BarChart3, color: 'text-blue-600 bg-blue-50' },
                ].map(s => (
                    <div key={s.label} className="bg-white rounded-2xl border border-gray-100 p-4 text-center shadow-sm">
                        <div className={`w-10 h-10 ${s.color} rounded-xl flex items-center justify-center mx-auto mb-2`}>
                            <s.icon size={20} />
                        </div>
                        <p className="text-2xl font-black text-gray-900">{s.value}</p>
                        <p className="text-xs text-gray-500">{s.label}</p>
                    </div>
                ))}
            </div>

            {/* XP & Streak */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gradient-to-br from-yellow-50 to-amber-50 border border-amber-200 rounded-2xl p-5">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 bg-amber-400 rounded-xl flex items-center justify-center">
                            <Zap className="text-white" size={20} />
                        </div>
                        <div>
                            <p className="font-black text-gray-900 text-lg">{data.xp?.totalXP || 0} XP</p>
                            <p className="text-xs text-gray-500">Level {data.xp?.level || 1}</p>
                        </div>
                    </div>
                    <div className="h-2 bg-amber-200 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-amber-400 to-yellow-400 rounded-full"
                            style={{ width: `${((data.xp?.totalXP || 0) % 100)}%` }} />
                    </div>
                </div>

                <div className="bg-gradient-to-br from-blue-50 to-sky-50 border border-sky-200 rounded-2xl p-5">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-sky-400 rounded-xl flex items-center justify-center">
                            <Droplets className="text-white" size={20} />
                        </div>
                        <div>
                            <p className="font-black text-gray-900 text-lg">{data.xp?.wateringStreak || 0} days</p>
                            <p className="text-xs text-gray-500">Watering Streak 💧</p>
                        </div>
                    </div>
                    <div className="flex gap-1 mt-3">
                        {Array.from({ length: 7 }).map((_, i) => (
                            <div key={i} className={`flex-1 h-2 rounded-full ${i < (data.xp?.wateringStreak || 0) % 7 ? 'bg-sky-400' : 'bg-sky-100'}`} />
                        ))}
                    </div>
                </div>
            </div>

            {/* Category breakdown */}
            {categories.length > 0 && (
                <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                    <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <BarChart3 className="text-violet-500" size={18} /> Skill Category Progress
                    </h4>
                    <div className="space-y-3">
                        {categories.map(([cat, vals]) => {
                            const cfg = CATEGORY_CONFIG[cat];
                            const pct = vals.total > 0 ? Math.round((vals.completed / vals.total) * 100) : 0;
                            return (
                                <div key={cat} className="flex items-center gap-3">
                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${cfg?.color}`}>
                                        {cfg && React.createElement(cfg.icon, { size: 14 })}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex justify-between text-xs mb-1">
                                            <span className="font-semibold text-gray-700">{cfg?.label || cat}</span>
                                            <span className="text-gray-500">{vals.completed}/{vals.total}</span>
                                        </div>
                                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                            <div className="h-full bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full progress-fill" style={{ width: `${pct}%` }} />
                                        </div>
                                    </div>
                                    <span className="text-xs font-bold text-gray-500 w-8 text-right">{pct}%</span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Recent activity */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Clock className="text-teal-500" size={18} /> Recent Activity
                </h4>
                <div className="text-center py-4 text-sm text-gray-500">
                    <span className="text-3xl block mb-2">🌱</span>
                    {data.recentActivity} activities in the last 7 days
                </div>
            </div>
        </div>
    );
}

// ─── Main SkillSprout Page ────────────────────────────────────
export default function SkillSprout() {
    const { user } = useAuth();
    const patientId = user?.specialId;
    const season = getCurrentSeason();
    const seasonCfg = SEASONS[season];

    const [view, setView] = useState('garden'); // garden | forest | analytics
    const [goalFilter, setGoalFilter] = useState('all'); // all | therapist | parent
    const [goals, setGoals] = useState([]);
    const [xp, setXP] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingGoal, setEditingGoal] = useState(null);
    const [celebration, setCelebration] = useState(null);
    const [confettiActive, setConfettiActive] = useState(false);
    const [xpPopup, setXPPopup] = useState(null);

    const fetchGarden = useCallback(async () => {
        if (!patientId) return;
        try {
            const res = await api.get(`/skillsprout/garden/${patientId}`);
            if (res.data.success) {
                setGoals(res.data.data.goals);
                setXP(res.data.data.xp);
            }
        } catch (err) {
            console.error('fetchGarden:', err);
        } finally { setLoading(false); }
    }, [patientId]);

    useEffect(() => { fetchGarden(); }, [fetchGarden]);

    const triggerCelebration = (event) => {
        setConfettiActive(true);
        setCelebration(event);
        setTimeout(() => setConfettiActive(false), 3500);
    };

    const handleComplete = async (goalId) => {
        try {
            const res = await api.post(`/skillsprout/goals/${goalId}/complete`, {});
            if (res.data.success) {
                const { goal, newStage, stageAdvanced, isCompleted, xpGained, xp: newXP } = res.data.data;
                setGoals(gs => gs.map(g => g._id === goalId ? goal : g));
                setXP(newXP);
                setXPPopup(xpGained);
                if (isCompleted) {
                    triggerCelebration({ type: 'complete', plantName: goal.plantSpecies, xp: xpGained, stage: 4 });
                } else if (stageAdvanced) {
                    triggerCelebration({ type: 'stage', stage: newStage, xp: xpGained });
                }
            }
        } catch (err) {
            alert(err.response?.data?.error?.message || 'Error completing activity');
        }
    };

    const handleWater = async (goalId) => {
        try {
            const res = await api.post(`/skillsprout/goals/${goalId}/water`, { patientId });
            if (res.data.success) {
                const { streak, bonusXP, totalXP } = res.data.data;
                setGoals(gs => gs.map(g => g._id === goalId ? { ...g, lastWatered: new Date().toISOString() } : g));
                setXP(x => x ? { ...x, totalXP, wateringStreak: streak } : x);
                setXPPopup(bonusXP);
                triggerCelebration({ type: 'watering', streak, xp: bonusXP });
            }
        } catch (err) {
            alert(err.response?.data?.error?.message || 'Error watering plant');
        }
    };

    const handleGoalCreated = (newGoal) => {
        setGoals(gs => [newGoal, ...gs]);
        triggerCelebration({ type: 'stage', stage: 0, xp: 0 });
    };

    const handleGoalUpdated = (updatedGoal) => {
        setGoals(gs => gs.map(g => g._id === updatedGoal._id ? updatedGoal : g));
    };

    const handleDeleteGoal = async (goalId) => {
        if (!window.confirm('Are you sure you want to remove this goal? This cannot be undone.')) return;
        try {
            await api.delete(`/skillsprout/parent-goals/${goalId}`);
            setGoals(gs => gs.filter(g => g._id !== goalId));
        } catch (err) {
            alert(err.response?.data?.error?.message || 'Error deleting goal');
        }
    };

    // Filter logic
    const filteredGoals = goals.filter(g => {
        if (goalFilter === 'all') return true;
        return g.goalOwnerType === goalFilter;
    });

    const activeGoals = filteredGoals.filter(g => !g.isCompleted);
    const completedGoals = filteredGoals.filter(g => g.isCompleted);
    const canAddGoals = true; // Both therapists and parents can now add goals

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-64 gap-4">
                <div className="text-6xl animate-bounce-gentle">🌱</div>
                <p className="text-gray-500 font-semibold">Growing your garden…</p>
            </div>
        );
    }

    return (
        <div className={`min-h-screen bg-gradient-to-br ${seasonCfg.bg} -m-4 lg:-m-8 p-4 lg:p-8`}>
            <Confetti active={confettiActive} />
            {xpPopup && <XPPopup xp={xpPopup} onDone={() => setXPPopup(null)} />}
            <CelebrationModal event={celebration} onClose={() => setCelebration(null)} />
            {showAddModal && <AddGoalModal patientId={patientId} onCreated={handleGoalCreated} onClose={() => setShowAddModal(false)} />}

            {/* ── Header ── */}
            <div className="mb-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg animate-pulse-glow">
                                <Sprout className="text-white" size={26} />
                            </div>
                            <div>
                                <h1 className="text-3xl font-black text-gray-900">SkillSprout</h1>
                                <p className="text-sm text-gray-600">Your magical therapy garden 🌿</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        {/* XP badge */}
                        <div className="flex items-center gap-2 bg-yellow-400 text-yellow-900 px-4 py-2 rounded-2xl font-black shadow-sm">
                            <Zap size={16} /> {xp?.totalXP || 0} XP · Lv.{xp?.level || 1}
                        </div>
                        {/* Streak badge */}
                        <div className="flex items-center gap-2 bg-sky-400 text-white px-4 py-2 rounded-2xl font-bold shadow-sm">
                            <Droplets size={16} /> {xp?.wateringStreak || 0}-day streak
                        </div>
                        {/* Trees badge */}
                        <div className="flex items-center gap-2 bg-emerald-500 text-white px-4 py-2 rounded-2xl font-bold shadow-sm">
                            <Sprout size={16} /> {completedGoals.length} trees
                        </div>
                        {/* Season */}
                        <div className="bg-white/70 backdrop-blur-sm px-3 py-2 rounded-2xl text-sm font-semibold text-gray-700 border border-white">
                            {seasonCfg.label}
                        </div>
                        {/* Add goal (therapist) */}
                        {canAddGoals && (
                            <button
                                onClick={() => setShowAddModal(true)}
                                className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-5 py-2.5 rounded-2xl font-bold shadow-md hover:from-emerald-600 hover:to-teal-600 transition-all"
                            >
                                <Plus size={18} /> New Goal
                            </button>
                        )}
                    </div>
                </div>

                {/* View tabs and Filters */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mt-5">
                    <div className="flex gap-2 bg-white/60 backdrop-blur-sm p-1.5 rounded-2xl w-fit shadow-sm border border-white">
                        {[
                            { id: 'garden', icon: Sprout, label: 'My Garden' },
                            { id: 'forest', icon: Leaf, label: 'Forest' },
                            { id: 'analytics', icon: BarChart3, label: 'Progress' },
                        ].map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setView(tab.id)}
                                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all ${view === tab.id
                                    ? 'bg-white shadow-md text-emerald-700'
                                    : 'text-gray-600 hover:text-gray-800'
                                    }`}
                            >
                                <tab.icon size={16} /> {tab.label}
                            </button>
                        ))}
                    </div>

                    <div className="flex gap-2 bg-amber-50/50 p-1 rounded-xl border border-amber-100/50">
                        {[
                            { id: 'all', label: 'All Goals' },
                            { id: 'therapist', label: 'Clinician' },
                            { id: 'parent', label: 'Parent' },
                        ].map(f => (
                            <button
                                key={f.id}
                                onClick={() => setGoalFilter(f.id)}
                                className={`px-4 py-1.5 rounded-lg font-bold text-xs transition-all ${goalFilter === f.id
                                    ? 'bg-amber-500 text-white shadow-sm'
                                    : 'text-amber-700 hover:bg-amber-100'
                                    }`}
                            >
                                {f.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* ── Garden View ── */}
            {view === 'garden' && (
                <div>
                    {activeGoals.length === 0 ? (
                        <div className="text-center py-20">
                            <div className="text-8xl mb-4 animate-bounce-gentle">🌱</div>
                            <h3 className="text-2xl font-black text-gray-700 mb-2">Your garden is waiting!</h3>
                            <p className="text-gray-500 mb-6">
                                {user?.role === 'parent'
                                    ? 'Plant a goal seed to start growing your child\'s skills'
                                    : 'Ask your therapist to plant your first goal seed'}
                            </p>
                            {canAddGoals && (
                                <button
                                    onClick={() => setShowAddModal(true)}
                                    className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-8 py-4 rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl transition-all"
                                >
                                    <Plus size={20} /> Plant First Goal!
                                </button>
                            )}
                        </div>
                    ) : (
                        <>
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                                {activeGoals.map(goal => (
                                    <PlantCard
                                        key={goal._id}
                                        goal={goal}
                                        onComplete={handleComplete}
                                        onWater={handleWater}
                                        onEdit={setEditingGoal}
                                        onDelete={handleDeleteGoal}
                                        currentUserId={user?.userId}
                                    />
                                ))}
                                {/* Add new plant slot */}
                                {canAddGoals && (
                                    <button
                                        onClick={() => setShowAddModal(true)}
                                        className="plant-card border-2 border-dashed border-emerald-300 rounded-3xl flex flex-col items-center justify-center p-6 min-h-[220px] text-emerald-500 hover:border-emerald-400 hover:bg-emerald-50 transition-all"
                                    >
                                        <Plus size={40} className="mb-2" />
                                        <span className="text-sm font-bold">Add New Goal</span>
                                    </button>
                                )}
                            </div>
                            {/* Soil bar */}
                            <div className="mt-8 h-6 garden-soil opacity-60 mx-4" />
                        </>
                    )}
                </div>
            )}

            {/* ── Forest View ── */}
            {view === 'forest' && (
                <div className={`rounded-3xl bg-gradient-to-b ${seasonCfg.sky} p-6 min-h-64 border border-white shadow-inner`}>
                    <h2 className="text-xl font-black text-gray-800 mb-6 flex items-center gap-2">
                        <Leaf className="text-emerald-600" size={24} /> Your Achievement Forest
                    </h2>
                    {completedGoals.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="text-7xl mb-4 animate-bounce-gentle">🌱</div>
                            <p className="text-gray-600 font-semibold">Complete goals to grow your forest!</p>
                        </div>
                    ) : (
                        <>
                            <div className="flex flex-wrap gap-6 justify-center md:justify-start">
                                {completedGoals.map(goal => (
                                    <ForestTree key={goal._id} goal={goal} season={season} />
                                ))}
                            </div>
                            {/* Ground */}
                            <div className="mt-8 h-8 garden-soil opacity-80 rounded-xl" />
                            {/* Milestone banners */}
                            {xp?.forestMilestones?.length > 0 && (
                                <div className="mt-6 space-y-2">
                                    {xp.forestMilestones.map((m, i) => (
                                        <div key={i} className="bg-white/80 backdrop-blur-sm rounded-2xl px-5 py-3 flex items-center gap-3 shadow-sm">
                                            <Trophy className="text-amber-500" size={20} />
                                            <span className="font-bold text-gray-800">{m.milestone}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </>
                    )}
                </div>
            )}

            {/* ── Analytics View ── */}
            {view === 'analytics' && (
                <div>
                    <div className="flex items-center justify-between mb-5">
                        <h2 className="text-xl font-black text-gray-900 flex items-center gap-2">
                            <BarChart3 className="text-violet-500" size={24} /> Growth Analytics
                        </h2>
                        <button
                            onClick={fetchGarden}
                            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 bg-white px-4 py-2 rounded-xl border border-gray-200 transition-all"
                        >
                            <RefreshCw size={14} /> Refresh
                        </button>
                    </div>
                    <AnalyticsPanel patientId={patientId} />
                </div>
            )}
        </div>
    );
}
