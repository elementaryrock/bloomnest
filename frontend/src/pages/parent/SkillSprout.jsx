import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import './skillsprout.css';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Sprout, Droplets, Trophy, Star, Plus, Flame, Zap,
    Leaf, ChevronRight, X, Check, BarChart3, Clock,
    Sparkles, Target, BookOpen, Puzzle, Edit2, Trash2,
    Activity, MessageCircle, Heart, Shield, RefreshCw,
    CloudRain, Sun, Wind, Snowflake
} from 'lucide-react';

// ─── Interactive Garden Particles ──────────────────────────
const GardenParticles = ({ season }) => {
    const config = {
        spring: { emoji: ['🌸', '✨', '🌱'], count: 12 },
        summer: { emoji: ['☀️', '🦋', '✨'], count: 8 },
        autumn: { emoji: ['🍂', '🍁', '🍃'], count: 15 },
        winter: { emoji: ['❄️', '⛄', '✨'], count: 10 },
    };
    const { emoji, count } = config[season] || config.spring;

    return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
            {Array.from({ length: count }).map((_, i) => (
                <motion.div
                    key={i}
                    initial={{
                        x: `${Math.random() * 100}%`,
                        y: season === 'autumn' ? '-10%' : '110%',
                        opacity: 0,
                        rotate: 0,
                    }}
                    animate={{
                        y: season === 'autumn' ? '110%' : '-10%',
                        opacity: [0, 1, 1, 0],
                        rotate: 360,
                        transition: {
                            duration: Math.random() * 10 + 10,
                            repeat: Infinity,
                            delay: Math.random() * 20,
                            ease: "linear",
                        }
                    }}
                    className="absolute text-xl opacity-20"
                >
                    {emoji[i % emoji.length]}
                </motion.div>
            ))}
        </div>
    );
};

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

// Auto-detect season from XP and current month
function getGardenTheme(xp, currentSeason) {
    const level = xp?.level || 1;
    if (level >= 15) return { ...SEASONS.winter, name: 'winter' };
    if (level >= 10) return { ...SEASONS.autumn, name: 'autumn' };
    if (level >= 5) return { ...SEASONS.summer, name: 'summer' };
    return { ...SEASONS[currentSeason], name: currentSeason };
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
    return (
        <motion.div
            initial={{ y: 0, opacity: 0, scale: 0.5 }}
            animate={{ y: -100, opacity: 1, scale: 1.2 }}
            exit={{ opacity: 0, scale: 1.5 }}
            onAnimationComplete={() => setTimeout(onDone, 500)}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[9998] pointer-events-none"
        >
            <div className="text-4xl font-black text-yellow-500 drop-shadow-xl flex items-center gap-2">
                <Zap size={32} className="text-yellow-400 fill-yellow-400" />
                +{xp} XP!
            </div>
        </motion.div>
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
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="celebration-overlay overflow-hidden px-4"
                onClick={onClose}
            >
                {/* Background Sparkles */}
                <div className="absolute inset-0 pointer-events-none">
                    {Array.from({ length: 20 }).map((_, i) => (
                        <motion.div
                            key={i}
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: [0, 1.2, 0], opacity: [0, 1, 0] }}
                            transition={{ duration: 2, repeat: Infinity, delay: i * 0.1 }}
                            className="absolute text-yellow-300"
                            style={{
                                left: `${Math.random() * 100}%`,
                                top: `${Math.random() * 100}%`,
                            }}
                        >
                            <Sparkles size={Math.random() * 20 + 10} />
                        </motion.div>
                    ))}
                </div>

                <motion.div
                    initial={{ scale: 0.5, y: 100, rotate: -10 }}
                    animate={{ scale: 1, y: 0, rotate: 0 }}
                    exit={{ scale: 0.5, opacity: 0 }}
                    transition={{ type: "spring", damping: 15 }}
                    className="bg-white rounded-[2rem] shadow-2xl p-8 max-w-sm w-full text-center relative z-10"
                    onClick={e => e.stopPropagation()}
                >
                    <motion.div
                        animate={{ rotate: [0, -10, 10, 0] }}
                        transition={{ duration: 4, repeat: Infinity }}
                        className={`w-24 h-24 rounded-full bg-gradient-to-br ${cfg.bg} flex items-center justify-center mx-auto mb-6 text-5xl shadow-lg border-4 border-white`}
                    >
                        {event.type === 'complete' ? '🌳' : event.type === 'watering' ? '💧' : event.type === 'forest' ? '🌲' : GROWTH_STAGES[event.stage]?.emoji}
                    </motion.div>

                    <h2 className="text-3xl font-black text-gray-900 mb-2 leading-tight">{cfg.title}</h2>
                    <p className="text-gray-600 text-lg mb-8 font-medium">{cfg.subtitle}</p>

                    {event.xp > 0 && (
                        <motion.div
                            initial={{ x: -20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: 0.3 }}
                            className="bg-yellow-50 border-2 border-yellow-200 rounded-2xl py-4 px-5 mb-8 flex items-center justify-center gap-3"
                        >
                            <Zap className="text-yellow-500 fill-yellow-500" size={24} />
                            <span className="font-black text-yellow-700 text-xl">+{event.xp} XP EARNED!</span>
                        </motion.div>
                    )}

                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={onClose}
                        className="w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-black rounded-2xl text-xl shadow-lg hover:shadow-emerald-200/50 transition-shadow"
                    >
                        Yay! Keep going! 🎉
                    </motion.button>
                </motion.div>
            </motion.div>
        </AnimatePresence>
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
        <motion.div 
            layout
            variants={{
                hidden: { y: 20, opacity: 0 },
                visible: {
                    y: 0,
                    opacity: 1
                }
            }}
            whileHover={{ y: -8, scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className={`plant-card bg-white/78 backdrop-blur-xl rounded-[2.25rem] border border-white/80 shadow-[0_14px_40px_rgba(15,23,42,0.08)] hover:shadow-[0_18px_48px_rgba(15,23,42,0.12)] transition-all duration-300 ${goal.isCompleted ? 'ring-2 ring-emerald-300' : ''} p-5 relative overflow-hidden group`}
        >
            {/* Top color accent */}
            <div className={`absolute top-0 left-0 right-0 h-2 bg-gradient-to-r ${stage.color} opacity-80`} />
            <div className="absolute inset-x-4 top-4 h-20 rounded-[1.75rem] bg-gradient-to-b from-white/70 to-white/0 pointer-events-none" />

            {/* Completed badge */}
            <AnimatePresence>
                {goal.isCompleted && (
                    <motion.div 
                        initial={{ scale: 0, rotate: -20 }}
                        animate={{ scale: 1, rotate: 0 }}
                        className="absolute top-4 right-4 bg-emerald-500 text-white text-[10px] font-black tracking-widest px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-sm z-20"
                    >
                        <Check size={12} strokeWidth={3} /> COMPLETED
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Parent Goal Indicator */}
            {isParentGoal && (
                <div className="absolute top-3 left-3 flex items-center gap-1 bg-amber-100 text-amber-700 text-[10px] font-black px-2 py-1 rounded-full border border-amber-200 shadow-sm z-10">
                    <Star size={10} fill="currentColor" /> PARENT
                </div>
            )}

            {/* Edit/Delete for Parents */}
            {!goal.isCompleted && isOwner && (
                <div className="absolute top-14 left-4 flex flex-col gap-2 z-20 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                        onClick={() => onEdit(goal)}
                        className="w-9 h-9 bg-white/90 backdrop-blur-md shadow-md rounded-xl flex items-center justify-center text-blue-500 hover:text-blue-600 transition-all border border-white"
                        aria-label={`Edit goal ${goal.goalName}`}
                        type="button"
                    >
                        <Edit2 size={16} />
                    </button>
                    <button
                        onClick={() => onDelete(goal._id)}
                        className="w-9 h-9 bg-white/90 backdrop-blur-md shadow-md rounded-xl flex items-center justify-center text-red-500 hover:text-red-600 transition-all border border-white"
                        aria-label={`Delete goal ${goal.goalName}`}
                        type="button"
                    >
                        <Trash2 size={16} />
                    </button>
                </div>
            )}

            {/* Plant emoji + stage */}
            <div className="text-center mb-3 relative">
                <div className="mx-auto mb-2 flex h-20 w-20 items-center justify-center rounded-[1.6rem] bg-white/85 shadow-inner ring-1 ring-white/80">
                    <div className={`plant-stage-emoji ${goal.isCompleted ? 'tree-glow animate-bounce-gentle' : 'animate-sway'}`}>
                        {goal.isCompleted ? '🌳' : stage.emoji}
                    </div>
                </div>
                <div className="flex items-center justify-center gap-2 flex-wrap">
                    <span className={`inline-block text-xs font-semibold px-3 py-1 rounded-full bg-gradient-to-r ${stage.color} text-white shadow-sm`}>
                        {goal.isCompleted ? 'Tree! 🎉' : stage.label}
                    </span>
                    <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${cat.color}`}>
                        {React.createElement(cat.icon, { size: 11 })} {cat.label}
                    </span>
                </div>
            </div>

            {/* Plant info */}
            <div className="mb-3 rounded-[1.35rem] bg-white/55 px-3.5 py-2.5 border border-white/80">
                <p className="font-black text-gray-900 text-center text-[15px] leading-snug">{goal.goalName}</p>
                <p className="text-xs text-center text-gray-500 mt-0.5">{goal.plantSpecies} {goal.plantEmoji}</p>
                <div className="mt-2 flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-[0.16em] text-gray-400">
                    <span>{goal.currentCompletions} done</span>
                    <span className="text-gray-300">•</span>
                    <span>{Math.max(goal.requiredCompletions - goal.currentCompletions, 0)} to go</span>
                </div>
                {goal.goalOwnerType === 'therapist' && (
                    <p className="mt-1.5 text-center text-[11px] font-semibold text-gray-400">Therapist Goal</p>
                )}
            </div>

            {/* Progress bar */}
            <div className="mb-5 px-1">
                <div className="flex justify-between items-end mb-1.5">
                    <div className="flex flex-col">
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Progress</span>
                        <span className="text-xs font-bold text-gray-600">{goal.currentCompletions} <span className="text-gray-300">/</span> {goal.requiredCompletions}</span>
                    </div>
                    <span className="text-lg font-black text-emerald-600 leading-none">{progress}%</span>
                </div>
                <div className="h-3.5 bg-gray-100/90 rounded-full p-1 shadow-inner relative overflow-hidden ring-1 ring-black/5">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ type: "spring", stiffness: 50, damping: 20 }}
                        className={`absolute top-0 bottom-0 left-0 bg-gradient-to-r ${stage.color} rounded-full shadow-sm shimmer-effect`}
                    />
                </div>
            </div>

            {/* Soil ripple effect */}
            {showRipple && (
                <div className="absolute bottom-20 left-1/2 -translate-x-1/2 w-12 h-12 rounded-full border-2 border-sky-400 soil-ripple pointer-events-none" />
            )}

            {/* Action buttons */}
            {!goal.isCompleted && (
                <div className="flex gap-3 mt-3">
                    <motion.button
                        whileHover={!alreadyWatered ? { scale: 1.05 } : {}}
                        whileTap={!alreadyWatered ? { scale: 0.95 } : {}}
                        onClick={handleWater}
                        disabled={alreadyWatered || watering}
                        className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl text-xs font-black uppercase tracking-wider transition-all shadow-md ${alreadyWatered
                            ? 'bg-gray-100/50 text-gray-400 shadow-none border border-gray-200/50'
                            : 'bg-gradient-to-r from-sky-400 to-blue-500 text-white hover:shadow-sky-200/50 border border-sky-400/50'
                            }`}
                        aria-label={alreadyWatered ? `Already watered ${goal.goalName} today` : `Water ${goal.goalName}`}
                    >
                        {alreadyWatered ? <RefreshCw size={14} /> : <Droplets size={14} className={watering ? "animate-spin" : ""} />}
                        {alreadyWatered ? 'Watered' : watering ? 'Watering…' : 'Water'}
                    </motion.button>
                    
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleComplete}
                        disabled={completing}
                        className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl text-xs font-black uppercase tracking-wider bg-gradient-to-r from-emerald-400 to-green-500 text-white shadow-md hover:shadow-emerald-200/50 transition-all border border-emerald-400/50"
                        aria-label={`Log progress for ${goal.goalName}`}
                    >
                        <Check size={14} className={completing ? "animate-bounce" : ""} />
                        {completing ? 'Saving…' : 'Log'}
                    </motion.button>
                </div>
            )}

            {goal.isCompleted && (
                <div className="mt-3 text-center text-sm text-emerald-700 font-semibold bg-emerald-50/90 rounded-2xl py-3 border border-emerald-200">
                    🌳 Moved to Forest!
                </div>
            )}
        </motion.div>
    );
}

// ─── Forest Tree ─────────────────────────────────────────────
function ForestTree({ goal, season, index }) {
    const cat = CATEGORY_CONFIG[goal.skillCategory] || CATEGORY_CONFIG.cognitive;
    const seasonLeaves = { spring: '🌸', summer: '🌿', autumn: '🍂', winter: '❄️' };

    // Create pseudo-random visual variances purely based on ID or index
    // so it's stable on re-renders, creating an organic forest look.
    const randomSeed = (goal._id?.charCodeAt(0) || 0) + (index * 7);
    const scale = 0.85 + (randomSeed % 30) / 100; // between 0.85 and 1.15
    const yOffset = (randomSeed % 40) - 20; // between -20px and +20px
    const delay = index * 0.1;

    return (
        <motion.div
            variants={{
                hidden: { y: 20 + yOffset, opacity: 0, scale: scale * 0.8 },
                visible: {
                    y: yOffset,
                    opacity: 1,
                    scale: scale,
                    transition: { type: "spring", stiffness: 300, damping: 20 }
                }
            }}
            whileHover={{
                scale: scale * 1.1,
                y: yOffset - 10,
                transition: { type: "spring", stiffness: 300 }
            }}
            className="forest-tree relative flex flex-col items-center justify-end z-10 group min-w-[84px] sm:min-w-[100px] cursor-pointer"
        >
            {/* Tree Emoji */}
            <div className="relative">
                {goal.goalOwnerType === 'parent' && (
                    <div className="absolute -top-3 -right-3 text-amber-500 bg-white shadow-sm rounded-full p-0.5 z-20">
                        <Star size={14} fill="currentColor" />
                    </div>
                )}
                <div className="text-5xl sm:text-6xl mb-1 group-hover:animate-tree-shake origin-bottom tree-glow">
                    🌳
                </div>
                <div className="absolute top-2 left-1/2 -translate-x-1/2 text-lg sm:text-xl drop-shadow-md pointer-events-none">
                    {seasonLeaves[season]}
                </div>

                {/* Ground Shadow built into tree */}
                <div className="w-12 h-2 bg-black/10 rounded-[100%] mx-auto -mt-2 blur-[2px] scale-x-150" />
            </div>

            {/* Premium Glassmorphism Label */}
            <div className="mt-2 sm:mt-3 bg-white/60 backdrop-blur-md px-2.5 sm:px-3 py-1.5 rounded-2xl shadow-sm border border-white/60 text-center w-full min-w-[88px] sm:min-w-[110px] transform translate-y-0 opacity-100 sm:translate-y-2 sm:opacity-0 sm:group-hover:opacity-100 sm:group-hover:translate-y-0 transition-all duration-300">
                <p className="text-[10px] sm:text-[11px] font-black text-gray-800 leading-tight uppercase tracking-wider mb-1 line-clamp-2">
                    {goal.goalName}
                </p>
                <div className={`text-[8px] sm:text-[9px] font-bold px-2 py-0.5 rounded-full inline-block ${cat.color}`}>
                    {cat.label}
                </div>
            </div>
        </motion.div>
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
        <div className="celebration-overlay celebration-overlay--clear" onClick={onClose}>
            <div className="bg-white rounded-3xl shadow-2xl p-6 max-w-md w-full mx-4" onClick={e => e.stopPropagation()} role="dialog" aria-modal="true" aria-labelledby="edit-goal-title">
                <div className="flex items-center justify-between mb-5">
                    <h2 id="edit-goal-title" className="text-xl font-black text-gray-900 flex items-center gap-2">
                        <Edit2 className="text-blue-500" size={24} /> Edit Your Goal
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600" type="button" aria-label="Close edit goal dialog"><X size={20} /></button>
                </div>

                <form onSubmit={submit} className="space-y-4">
                    {error && <div className="bg-red-50 text-red-600 text-sm rounded-xl px-4 py-3" role="alert">{error}</div>}

                    <div>
                        <label htmlFor="edit-goal-name" className="block text-sm font-bold text-gray-700 mb-1.5">Goal Name 🌱</label>
                        <input
                            id="edit-goal-name"
                            name="goalName"
                            type="text" required
                            className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-400 transition-colors"
                            value={form.goalName} onChange={e => setForm(f => ({ ...f, goalName: e.target.value }))}
                        />
                    </div>

                    <div>
                        <label htmlFor="edit-goal-required-completions" className="block text-sm font-bold text-gray-700 mb-1.5">Target Activities (Min: {goal.currentCompletions})</label>
                        <input
                            id="edit-goal-required-completions"
                            name="requiredCompletions"
                            type="number" min={goal.currentCompletions + 1} max="50"
                            className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-400"
                            value={form.requiredCompletions}
                            onChange={e => setForm(f => ({ ...f, requiredCompletions: parseInt(e.target.value) || 10 }))}
                        />
                    </div>

                    <div>
                        <label htmlFor="edit-goal-reward-message" className="block text-sm font-bold text-gray-700 mb-1.5">Reward Message 🎁</label>
                        <input
                            id="edit-goal-reward-message"
                            name="rewardMilestone"
                            type="text"
                            className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-400"
                            value={form.rewardMilestone} onChange={e => setForm(f => ({ ...f, rewardMilestone: e.target.value }))}
                        />
                    </div>

                    <button
                        type="submit" disabled={loading}
                        className="w-full py-4 bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-black text-lg rounded-2xl hover:from-blue-600 hover:to-indigo-600 transition-all shadow-md disabled:opacity-60"
                    >
                        {loading ? 'Updating…' : 'Save Changes'}
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
            <div className="bg-white rounded-3xl shadow-2xl p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto no-scrollbar" onClick={e => e.stopPropagation()} role="dialog" aria-modal="true" aria-labelledby="add-goal-title">
                <div className="flex items-center justify-between mb-5">
                    <h2 id="add-goal-title" className="text-xl font-black text-gray-900 flex items-center gap-2">
                        <Sprout className="text-emerald-500" size={24} />
                        {user?.role === 'parent' ? 'Plant a Parent Goal' : 'Plant a Therapy Goal'}!
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600" type="button" aria-label="Close add goal dialog"><X size={20} /></button>
                </div>

                <form onSubmit={submit} className="space-y-4">
                    {error && <div className="bg-red-50 text-red-600 text-sm rounded-xl px-4 py-3" role="alert">{error}</div>}

                    <div>
                        <label htmlFor="add-goal-name" className="block text-sm font-bold text-gray-700 mb-1.5">Goal Name 🌱</label>
                        <input
                            id="add-goal-name"
                            name="goalName"
                            type="text" required placeholder="e.g. Practice eye contact for 2 minutes…"
                            className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-400 transition-colors"
                            value={form.goalName} onChange={e => setForm(f => ({ ...f, goalName: e.target.value }))}
                        />
                    </div>

                    <div>
                        <label htmlFor="add-goal-category" className="block text-sm font-bold text-gray-700 mb-1.5">Skill Category 🏷️</label>
                        <select
                            id="add-goal-category"
                            name="skillCategory"
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
                            <label htmlFor="add-goal-difficulty" className="block text-sm font-bold text-gray-700 mb-1.5">Difficulty ⭐</label>
                            <select
                                id="add-goal-difficulty"
                                name="difficultyLevel"
                                className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-400"
                                value={form.difficultyLevel} onChange={e => setForm(f => ({ ...f, difficultyLevel: e.target.value }))}
                            >
                                <option value="easy">Easy 😊</option>
                                <option value="medium">Medium 💪</option>
                                <option value="hard">Hard 🦁</option>
                            </select>
                        </div>
                        <div>
                            <label htmlFor="add-goal-required-completions" className="block text-sm font-bold text-gray-700 mb-1.5">Activities needed</label>
                            <input
                                id="add-goal-required-completions"
                                name="requiredCompletions"
                                type="number" min="1" max="50"
                                className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-400"
                                value={form.requiredCompletions}
                                onChange={e => setForm(f => ({ ...f, requiredCompletions: parseInt(e.target.value) || 10 }))}
                            />
                        </div>
                    </div>

                    <div>
                        <label htmlFor="add-goal-reward-message" className="block text-sm font-bold text-gray-700 mb-1.5">Reward Message 🎁 (optional)</label>
                        <input
                            id="add-goal-reward-message"
                            name="rewardMilestone"
                            type="text" placeholder="e.g. You’re a communication superstar!"
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
                        {loading ? '🌱 Planting…' : '🌱 Plant This Goal!'}
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
    const [actionMessage, setActionMessage] = useState(null);
    const [confirmDelete, setConfirmDelete] = useState(null);

    const currentSeason = (() => {
        const m = new Date().getMonth();
        if (m >= 2 && m <= 4) return 'spring';
        if (m >= 5 && m <= 7) return 'summer';
        if (m >= 8 && m <= 10) return 'autumn';
        return 'winter';
    })();
    const seasonCfg = getGardenTheme(xp, currentSeason);

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
            setActionMessage({ type: 'error', text: err.response?.data?.error?.message || 'Unable to load the garden right now.' });
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
                setActionMessage({ type: 'success', text: `Logged progress for ${goal.goalName}.` });
            }
        } catch (err) {
            setActionMessage({ type: 'error', text: err.response?.data?.error?.message || 'Error completing activity.' });
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
                setActionMessage({ type: 'success', text: `Watered your plant. ${streak}-day streak.` });
            }
        } catch (err) {
            setActionMessage({ type: 'error', text: err.response?.data?.error?.message || 'Error watering plant.' });
        }
    };

    const handleGoalCreated = (newGoal) => {
        setGoals(gs => [newGoal, ...gs]);
        triggerCelebration({ type: 'stage', stage: 0, xp: 0 });
        setActionMessage({ type: 'success', text: `${newGoal.goalName} was added to the garden.` });
    };

    const handleGoalUpdated = (updatedGoal) => {
        setGoals(gs => gs.map(g => g._id === updatedGoal._id ? updatedGoal : g));
        setActionMessage({ type: 'success', text: `${updatedGoal.goalName} was updated.` });
    };

    const handleDeleteGoal = async (goalId) => {
        setConfirmDelete(goalId);
    };

    const confirmDeleteGoal = async () => {
        if (!confirmDelete) return;
        try {
            await api.delete(`/skillsprout/parent-goals/${confirmDelete}`);
            setGoals(gs => gs.filter(g => g._id !== confirmDelete));
            setConfirmDelete(null);
            setActionMessage({ type: 'success', text: 'Goal removed from the garden.' });
        } catch (err) {
            setActionMessage({ type: 'error', text: err.response?.data?.error?.message || 'Error deleting goal.' });
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
        <div className={`min-h-screen bg-gradient-to-br ${seasonCfg.bg} -m-4 lg:-m-8 p-4 lg:p-8 relative overflow-hidden transition-colors duration-1000`}>
            {/* Seasonal Atmosphere */}
            <div className="garden-fog" />

            <Confetti active={confettiActive} />
            {xpPopup && <XPPopup xp={xpPopup} onDone={() => setXPPopup(null)} />}
            <CelebrationModal event={celebration} onClose={() => setCelebration(null)} />
            {showAddModal && <AddGoalModal patientId={patientId} onCreated={handleGoalCreated} onClose={() => setShowAddModal(false)} />}

            {/* ── Header ── */}
            <div className="mb-6">
                <div className="rounded-[2rem] border border-white/70 bg-white/55 p-5 shadow-[0_12px_40px_rgba(15,23,42,0.06)] backdrop-blur-xl">
                    <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                        <div className="max-w-xl">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg animate-pulse-glow">
                                    <Sprout className="text-white" size={26} />
                                </div>
                                <div>
                                    <h1 className="text-3xl font-black text-gray-900">SkillSprout</h1>
                                    <p className="text-sm font-medium text-gray-600">Daily skill practice with clearer progress, streaks, and wins.</p>
                                </div>
                            </div>
                            <div className="inline-flex items-center gap-2 rounded-2xl border border-white bg-white/70 px-3 py-2 text-sm font-semibold text-gray-700 shadow-sm">
                                <span>{seasonCfg.label}</span>
                                <span className="text-gray-300">•</span>
                                <span>{activeGoals.length} active goals</span>
                            </div>
                        </div>

                        <div className="flex flex-col gap-3 lg:items-end">
                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                                <div className="min-w-[150px] rounded-2xl border border-amber-200/70 bg-gradient-to-br from-yellow-100 to-amber-50 px-4 py-3 shadow-sm">
                                    <div className="flex items-center gap-2 text-yellow-800">
                                        <Zap size={16} />
                                        <span className="text-xs font-black uppercase tracking-wide">XP & Level</span>
                                    </div>
                                    <p className="mt-2 text-xl font-black text-gray-900">{xp?.totalXP || 0} XP</p>
                                    <p className="text-xs font-semibold text-gray-600">Level {xp?.level || 1}</p>
                                </div>
                                <div className="min-w-[150px] rounded-2xl border border-sky-200/70 bg-gradient-to-br from-sky-100 to-cyan-50 px-4 py-3 shadow-sm">
                                    <div className="flex items-center gap-2 text-sky-800">
                                        <Droplets size={16} />
                                        <span className="text-xs font-black uppercase tracking-wide">Watering</span>
                                    </div>
                                    <p className="mt-2 text-xl font-black text-gray-900">{xp?.wateringStreak || 0} days</p>
                                    <p className="text-xs font-semibold text-gray-600">Current streak</p>
                                </div>
                                <div className="min-w-[150px] rounded-2xl border border-emerald-200/70 bg-gradient-to-br from-emerald-100 to-green-50 px-4 py-3 shadow-sm">
                                    <div className="flex items-center gap-2 text-emerald-800">
                                        <Sprout size={16} />
                                        <span className="text-xs font-black uppercase tracking-wide">Forest</span>
                                    </div>
                                    <p className="mt-2 text-xl font-black text-gray-900">{completedGoals.length} trees</p>
                                    <p className="text-xs font-semibold text-gray-600">Completed goals</p>
                                </div>
                            </div>
                            {canAddGoals && (
                                <button
                                    onClick={() => setShowAddModal(true)}
                                    className="flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-5 py-3 rounded-2xl font-bold shadow-md hover:from-emerald-600 hover:to-teal-600 transition-all"
                                >
                                    <Plus size={18} /> Add New Goal
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {actionMessage && (
                    <div
                        className={`mt-4 rounded-2xl px-4 py-3 text-sm shadow-sm ${actionMessage.type === 'error' ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-white/80 text-emerald-800 border border-emerald-200'}`}
                        role={actionMessage.type === 'error' ? 'alert' : 'status'}
                        aria-live="polite"
                    >
                        {actionMessage.text}
                    </div>
                )}

                {confirmDelete && (
                    <div className="mt-4 rounded-2xl border border-red-200 bg-white/90 px-4 py-4 shadow-sm">
                        <p className="text-sm font-semibold text-gray-900">Remove this parent goal from the garden?</p>
                        <p className="mt-1 text-sm text-gray-600">This action hides the goal and cannot be undone from this screen.</p>
                        <div className="mt-3 flex gap-3">
                            <button type="button" onClick={confirmDeleteGoal} className="rounded-xl bg-red-600 px-4 py-2 text-sm font-bold text-white hover:bg-red-700">
                                Delete Goal
                            </button>
                            <button type="button" onClick={() => setConfirmDelete(null)} className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-bold text-gray-700 hover:bg-gray-50">
                                Cancel
                            </button>
                        </div>
                    </div>
                )}

                {/* View tabs and Filters */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mt-5">
                    <div className="flex gap-2 bg-white/40 backdrop-blur-xl p-2 rounded-[1.25rem] w-fit shadow-sm border border-white/60 relative">
                        {[
                            { id: 'garden', icon: Sprout, label: 'My Garden' },
                            { id: 'forest', icon: Leaf, label: 'Forest' },
                            { id: 'analytics', icon: BarChart3, label: 'Progress' },
                        ].map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setView(tab.id)}
                                className={`relative z-10 flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-colors ${view === tab.id
                                    ? 'text-emerald-800'
                                    : 'text-gray-600 hover:text-gray-900'
                                    }`}
                            >
                                {view === tab.id && (
                                    <motion.div
                                        layoutId="activeTab"
                                        className="absolute inset-0 bg-white rounded-xl shadow-sm border border-white"
                                        initial={false}
                                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                    />
                                )}
                                <span className="relative z-10 flex items-center gap-2">
                                    <tab.icon size={16} /> {tab.label}
                                </span>
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

            {/* ── View Container ── */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={view}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    className="relative z-10"
                >
                    {/* ── Garden View ── */}
                    {view === 'garden' && (
                        <div>
                            {activeGoals.length === 0 ? (
                                <div className="mx-auto max-w-2xl rounded-[2rem] border border-white/70 bg-white/60 px-8 py-16 text-center shadow-[0_12px_40px_rgba(15,23,42,0.06)] backdrop-blur-xl">
                                    <motion.div 
                                        animate={{ y: [0, -20, 0] }}
                                        transition={{ duration: 3, repeat: Infinity }}
                                        className="text-8xl mb-4"
                                    >🌱</motion.div>
                                    <h3 className="text-2xl font-black text-gray-700 mb-2">Your garden is waiting!</h3>
                                    <p className="mx-auto max-w-md text-gray-500 mb-6">
                                        {user?.role === 'parent'
                                            ? 'Start with one small, measurable goal and build momentum with daily practice.'
                                            : 'Ask your therapist to plant your first goal seed.'}
                                    </p>
                                    <div className="mb-6 grid gap-3 text-left sm:grid-cols-3">
                                        <div className="rounded-2xl bg-white/80 px-4 py-3 shadow-sm">
                                            <p className="text-xs font-black uppercase tracking-wide text-emerald-700">1. Plant</p>
                                            <p className="mt-1 text-sm font-medium text-gray-600">Create a goal with a clear target and reward.</p>
                                        </div>
                                        <div className="rounded-2xl bg-white/80 px-4 py-3 shadow-sm">
                                            <p className="text-xs font-black uppercase tracking-wide text-sky-700">2. Practice</p>
                                            <p className="mt-1 text-sm font-medium text-gray-600">Log small wins and keep the streak alive.</p>
                                        </div>
                                        <div className="rounded-2xl bg-white/80 px-4 py-3 shadow-sm">
                                            <p className="text-xs font-black uppercase tracking-wide text-amber-700">3. Grow</p>
                                            <p className="mt-1 text-sm font-medium text-gray-600">Watch goals turn into trees in the forest.</p>
                                        </div>
                                    </div>
                                    {canAddGoals && (
                                        <motion.button
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => setShowAddModal(true)}
                                            className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-8 py-4 rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl transition-all"
                                        >
                                            <Plus size={20} /> Plant First Goal!
                                        </motion.button>
                                    )}
                                </div>
                            ) : (
                                <>
                                    <motion.div 
                                        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6"
                                        variants={{
                                            hidden: { opacity: 0 },
                                            visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
                                        }}
                                        initial="hidden"
                                        animate="visible"
                                    >
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
                                            <motion.button
                                                variants={{
                                                    hidden: { y: 20, opacity: 0 },
                                                    visible: { y: 0, opacity: 1 }
                                                }}
                                                whileHover={{ scale: 1.02, y: -8 }}
                                                onClick={() => setShowAddModal(true)}
                                                className="plant-card border-2 border-dashed border-emerald-300/50 bg-white/30 backdrop-blur-sm rounded-[2.5rem] flex flex-col items-center justify-center p-6 min-h-[260px] text-emerald-600 hover:border-emerald-400 hover:bg-white/60 transition-all group shadow-[0_8px_30px_rgb(0,0,0,0.02)]"
                                            >
                                                <div className="w-16 h-16 rounded-2xl bg-white shadow-sm flex items-center justify-center mb-4 group-hover:scale-110 transition-transform group-hover:bg-emerald-50 group-hover:text-emerald-500">
                                                    <Plus size={32} />
                                                </div>
                                                <span className="text-sm font-black uppercase tracking-wider">Plant a Goal</span>
                                            </motion.button>
                                        )}
                                    </motion.div>
                                    {/* Soil bar */}
                                    <div className="mt-8 h-6 garden-soil opacity-60 mx-4" />
                                </>
                            )}
                        </div>
                    )}

                    {/* ── Forest View ── */}
                    {view === 'forest' && (
                        <div className={`rounded-[2.2rem] sm:rounded-[3rem] bg-gradient-to-b ${seasonCfg.sky} p-4 sm:p-6 lg:p-8 min-h-[42vh] sm:min-h-[56vh] border-2 sm:border-4 border-white shadow-2xl relative overflow-hidden`}>
                            {/* Forest Atmosphere - Light Rays and Distant Canopy */}
                            <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
                                {/* Diagonal Sunbeams */}
                                <div className="absolute -top-[20%] -left-[10%] w-[150%] h-[150%] bg-gradient-to-tr from-white/0 via-white/10 to-transparent rotate-45 transform origin-top-left animate-sunbeam" />
                                <div className="absolute -top-[10%] left-[20%] hidden sm:block w-[100%] h-[150%] bg-gradient-to-tr from-white/0 via-white/5 to-transparent rotate-45 transform origin-top-left animate-sunbeam delay-1000" />
                                
                                {/* Background Decorative Trees */}
                                {Array.from({ length: 12 }).map((_, i) => {
                                    const isPine = i % 3 === 0;
                                    const scale = 0.28 + Math.random() * 0.28;
                                    const left = Math.random() * 100;
                                    const bottom = 28 + Math.random() * 22;
                                    const opacity = 0.12 + Math.random() * 0.18;
                                    
                                    return (
                                        <div 
                                            key={`bg-tree-${i}`}
                                            className="absolute hidden sm:block"
                                            style={{
                                                left: `${left}%`,
                                                bottom: `${bottom}%`,
                                                transform: `scale(${scale})`,
                                                opacity: opacity,
                                                filter: 'blur(1px) brightness(0.8) sepia(0.3)',
                                            }}
                                        >
                                            <div className="text-6xl animate-sway">
                                                {isPine ? '🌲' : '🌳'}
                                            </div>
                                        </div>
                                    );
                                })}

                                {/* Distant Rolling Hills Layer 1 */}
                                <div className="absolute -bottom-[10%] -left-[20%] w-[150%] h-[40%] bg-emerald-900/10 rounded-[100%_100%_0_0] blur-sm transform rotate-[-2deg]" />
                                {/* Distant Rolling Hills Layer 2 */}
                                <div className="absolute -bottom-[5%] left-[10%] w-[120%] h-[35%] bg-emerald-800/20 rounded-[100%_100%_0_0] blur-sm transform rotate-[3deg]" />
                            </div>

                            <div className="relative z-10 mb-6 sm:mb-10 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                                <div>
                                    <h2 className="text-2xl sm:text-3xl font-black text-gray-800 flex items-center gap-3 drop-shadow-sm">
                                        <Leaf className="text-emerald-600 drop-shadow-md" size={28} /> Your Achievement Forest
                                    </h2>
                                    <p className="mt-2 max-w-xl text-sm sm:text-base font-medium text-gray-600">
                                        Every completed goal becomes a tree here. Keep growing the forest one repeat at a time.
                                    </p>
                                </div>
                                <div className="grid grid-cols-3 gap-2 sm:gap-3">
                                    <div className="rounded-2xl bg-white/65 px-3 py-3 text-center shadow-sm backdrop-blur-sm border border-white/80">
                                        <p className="text-[10px] sm:text-xs font-black uppercase tracking-wide text-emerald-700">Trees</p>
                                        <p className="mt-1 text-lg sm:text-2xl font-black text-gray-900">{completedGoals.length}</p>
                                    </div>
                                    <div className="rounded-2xl bg-white/65 px-3 py-3 text-center shadow-sm backdrop-blur-sm border border-white/80">
                                        <p className="text-[10px] sm:text-xs font-black uppercase tracking-wide text-amber-700">Milestones</p>
                                        <p className="mt-1 text-lg sm:text-2xl font-black text-gray-900">{xp?.forestMilestones?.length || 0}</p>
                                    </div>
                                    <div className="rounded-2xl bg-white/65 px-3 py-3 text-center shadow-sm backdrop-blur-sm border border-white/80">
                                        <p className="text-[10px] sm:text-xs font-black uppercase tracking-wide text-sky-700">Level</p>
                                        <p className="mt-1 text-lg sm:text-2xl font-black text-gray-900">{xp?.level || 1}</p>
                                    </div>
                                </div>
                            </div>
                            
                            {completedGoals.length === 0 ? (
                                <div className="text-center py-16 sm:py-24 relative z-10 rounded-[2rem] bg-white/45 backdrop-blur-sm border border-white/70">
                                    <div className="text-7xl sm:text-8xl mb-4 sm:mb-6 animate-bounce-gentle">🌳</div>
                                    <p className="text-lg sm:text-xl text-gray-600 font-bold drop-shadow-sm">Complete goals to grow your forest!</p>
                                    <p className="text-sm sm:text-base text-gray-500 mt-2 font-medium px-6">Each finished goal becomes a lasting tree here.</p>
                                </div>
                            ) : (
                                <div className="relative z-10 w-full">
                                    {/* Forest Ground/Stage area */}
                                    <div className="relative pt-6 sm:pt-10 pb-24 sm:pb-32 px-2 sm:px-4 rounded-[2rem] sm:rounded-[3rem] overflow-hidden bg-white/20 border border-white/40">
                                        
                                        {/* Main Trees */}
                                        <motion.div 
                                            className="forest-tree-grid relative z-20"
                                            variants={{
                                                hidden: { opacity: 0 },
                                                visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
                                            }}
                                            initial="hidden"
                                            animate="visible"
                                        >
                                            {completedGoals.map((goal, idx) => (
                                                <ForestTree key={goal._id} goal={goal} season={seasonCfg.name} index={idx} />
                                            ))}
                                        </motion.div>
                                        
                                        {/* Stylized Curved Ground (Foreground Hill) */}
                                        <div className="absolute bottom-0 left-[-10%] w-[120%] h-40 sm:h-56 bg-gradient-to-b from-[#8B4513] via-[#65320d] to-[#4A2509] rounded-[100%_100%_0_0] shadow-[inset_0_20px_40px_rgba(0,0,0,0.4)] z-10" />
                                        {/* Sub-layer to ground for depth */}
                                        <div className="absolute bottom-[-28px] sm:bottom-[-40px] left-[-20%] w-[140%] h-24 sm:h-40 bg-[#3a1d07] rounded-[100%_100%_0_0] z-10 opacity-90 blur-md" />
                                    </div>
                                    
                                    {/* Milestone banners */}
                                    {xp?.forestMilestones?.length > 0 && (
                                        <div className="mt-6 sm:mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 max-w-4xl mx-auto">
                                            {xp.forestMilestones.map((m, i) => (
                                                <motion.div 
                                                    key={i}
                                                    initial={{ opacity: 0, y: 20, scale: 0.9 }}
                                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                                    transition={{ delay: i * 0.1 + 0.3, type: "spring" }}
                                                    className="bg-white/60 backdrop-blur-xl rounded-[1.6rem] sm:rounded-[2rem] p-4 sm:p-5 flex items-center gap-4 sm:gap-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white"
                                                >
                                                    <div className="w-12 h-12 sm:w-14 sm:h-14 bg-amber-100 rounded-[1rem] sm:rounded-[1.25rem] flex items-center justify-center text-amber-500 shadow-sm border border-white flex-shrink-0">
                                                        <Trophy size={24} />
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest leading-none mb-2">Milestone Reached</p>
                                                        <span className="font-bold text-gray-800 text-base sm:text-lg leading-tight block">{m.milestone}</span>
                                                    </div>
                                                </motion.div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {/* ── Analytics View ── */}
                    {view === 'analytics' && (
                        <div className="bg-white/40 backdrop-blur-md rounded-[3rem] p-8 border-2 border-white shadow-xl">
                            <div className="flex items-center justify-between mb-8">
                                <h2 className="text-2xl font-black text-gray-900 flex items-center gap-3">
                                    <BarChart3 className="text-violet-500" size={28} /> Growth Analytics
                                </h2>
                                <motion.button
                                    whileHover={{ rotate: 180 }}
                                    transition={{ duration: 0.5 }}
                                    onClick={fetchGarden}
                                    className="p-3 bg-white rounded-2xl border border-gray-100 shadow-sm text-gray-500 hover:text-emerald-500 transition-colors"
                                >
                                    <RefreshCw size={20} />
                                </motion.button>
                            </div>
                            <AnalyticsPanel patientId={patientId} />
                        </div>
                    )}
                </motion.div>
            </AnimatePresence>
        </div>
    );
}
