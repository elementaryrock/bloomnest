import React, { useState, useEffect, useRef, useCallback } from 'react';
import api from '../../services/api';
import '../parent/skillsprout.css';
import {
    Sprout, Plus, Search, User, BarChart3,
    Trophy, Droplets, Target, Check, Zap, Leaf, X, Trash2
} from 'lucide-react';

const CATEGORY_CONFIG = {
    communication: { label: 'Communication', color: 'bg-sky-100 text-sky-700' },
    cognitive: { label: 'Cognitive', color: 'bg-violet-100 text-violet-700' },
    motor: { label: 'Motor Skills', color: 'bg-amber-100 text-amber-700' },
    social: { label: 'Social', color: 'bg-rose-100 text-rose-700' },
    emotional: { label: 'Emotional', color: 'bg-purple-100 text-purple-700' },
    speech: { label: 'Speech', color: 'bg-teal-100 text-teal-700' },
    sensory: { label: 'Sensory', color: 'bg-green-100 text-green-700' },
    selfcare: { label: 'Self-Care', color: 'bg-orange-100 text-orange-700' },
    custom: { label: 'Custom Habit', color: 'bg-amber-100 text-amber-700' },
};

const PLANT_MAP = {
    communication: 'Chatter Cherry 🍒', cognitive: 'Think Thistle 🌺',
    motor: 'Mighty Maple 🍁', social: 'Kindness Clover 🍀',
    emotional: 'Calm Cactus 🌵', speech: 'Speak Sunflower 🌻',
    sensory: 'Wonder Willow 🌿', selfcare: 'Care Chrysanthemum 🌸',
    custom: 'Dream Daisy 🌼',
};

const GROWTH_STAGES = ['🌱 Seed', '🌿 Sprout', '🪴 Small Plant', '🌸 Flower', '🌳 Tree'];

export default function TherapistSkillSprout() {
    const [patientIdInput, setPatientIdInput] = useState('');
    const [searchedId, setSearchedId] = useState('');
    const [gardenData, setGardenData] = useState(null);
    const [analytics, setAnalytics] = useState(null);
    const [activeTab, setActiveTab] = useState('garden'); // garden | analytics | add
    const [goalFilter, setGoalFilter] = useState('all'); // all | therapist | parent
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [searchLoading, setSearchLoading] = useState(false);
    const [showResults, setShowResults] = useState(false);

    const searchRef = useRef(null);
    const searchTimeoutRef = useRef(null);

    // Click outside listener for search results
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setShowResults(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const performSearch = useCallback(async (query) => {
        if (!query || query.length < 2) {
            setSearchResults([]);
            setShowResults(false);
            return;
        }

        setSearchLoading(true);
        try {
            const res = await api.get(`/patients/search?query=${encodeURIComponent(query)}`);
            if (res.data.success) {
                setSearchResults(res.data.data || []);
                setShowResults(true);
            }
        } catch (error) {
            console.error('Search error:', error);
            setSearchResults([]);
        } finally {
            setSearchLoading(false);
        }
    }, []);

    // Add goal form
    const [form, setForm] = useState({
        goalName: '', skillCategory: 'communication', difficultyLevel: 'easy',
        requiredCompletions: 10, rewardMilestone: '', description: ''
    });
    const [addLoading, setAddLoading] = useState(false);
    const [addSuccess, setAddSuccess] = useState('');
    const [addError, setAddError] = useState('');

    const handleSearchChange = (e) => {
        const query = e.target.value;
        setPatientIdInput(query);

        if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);

        if (query.length >= 2) {
            searchTimeoutRef.current = setTimeout(() => {
                performSearch(query);
            }, 300);
        } else {
            setSearchResults([]);
            setShowResults(false);
        }
    };

    const selectPatient = (patient) => {
        setPatientIdInput(patient.specialId);
        setSearchedId(patient.specialId);
        setShowResults(false);
        fetchPatientData(patient.specialId);
    };

    const fetchPatientData = async (id) => {
        setLoading(true); setError('');
        try {
            const [gardenRes, analyticsRes] = await Promise.all([
                api.get(`/skillsprout/garden/${id}`),
                api.get(`/skillsprout/analytics/${id}`)
            ]);
            setGardenData(gardenRes.data.data);
            setAnalytics(analyticsRes.data.data);
            setSearchedId(id);
        } catch (err) {
            setError(err.response?.data?.error?.message || 'Patient not found or no garden yet');
            setGardenData(null); setAnalytics(null); setSearchedId('');
        } finally { setLoading(false); }
    };

    const searchPatient = async () => {
        const id = patientIdInput.trim();
        if (!id) { setError('Please enter a patient ID or Name'); return; }
        fetchPatientData(id);
    };

    const handleAddGoal = async e => {
        e.preventDefault();
        if (!searchedId) { setAddError('Search for a patient first'); return; }
        if (!form.goalName.trim()) { setAddError('Goal name is required'); return; }
        setAddLoading(true); setAddError(''); setAddSuccess('');
        try {
            await api.post('/skillsprout/goals', { ...form, patientId: searchedId });
            setAddSuccess(`✅ ${form.goalName} planted successfully as ${PLANT_MAP[form.skillCategory]}!`);
            setForm({ goalName: '', skillCategory: 'communication', difficultyLevel: 'easy', requiredCompletions: 10, rewardMilestone: '', description: '' });
            // Refresh garden
            const res = await api.get(`/skillsprout/garden/${searchedId}`);
            setGardenData(res.data.data);
        } catch (err) {
            setAddError(err.response?.data?.error?.message || 'Failed to create goal');
        } finally { setAddLoading(false); }
    };

    const handleComplete = async goalId => {
        try {
            await api.post(`/skillsprout/goals/${goalId}/complete`, {});
            const res = await api.get(`/skillsprout/garden/${searchedId}`);
            setGardenData(res.data.data);
        } catch (err) {
            alert(err.response?.data?.error?.message || 'Error');
        }
    };

    const handleDeleteGoal = async (goalId, goalName) => {
        if (!window.confirm(`Are you sure you want to remove "${goalName}" from the garden?`)) return;

        try {
            await api.delete(`/skillsprout/goals/${goalId}`);
            const res = await api.get(`/skillsprout/garden/${searchedId}`);
            setGardenData(res.data.data);
        } catch (err) {
            alert(err.response?.data?.error?.message || 'Error deleting goal');
        }
    };

    return (
        <div className="space-y-6 max-w-5xl">
            {/* Header */}
            <div className="flex items-center gap-3">
                <div className="w-11 h-11 bg-gradient-to-br from-emerald-400 to-teal-600 rounded-2xl flex items-center justify-center shadow-md">
                    <Sprout className="text-white" size={24} />
                </div>
                <div>
                    <h1 className="text-2xl font-black text-gray-900">SkillSprout Manager</h1>
                    <p className="text-sm text-gray-500">Create & manage therapy goals for children</p>
                </div>
            </div>

            {/* Patient Search */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                    <User size={18} className="text-emerald-500" /> Search Patient Garden
                </h3>
                <div className="flex gap-3 relative" ref={searchRef}>
                    <div className="flex-1 relative">
                        <input
                            type="text"
                            placeholder="Enter Patient Special ID or Child Name..."
                            className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-400 transition-colors pr-10"
                            value={patientIdInput}
                            onChange={handleSearchChange}
                            onKeyDown={e => e.key === 'Enter' && searchPatient()}
                        />
                        {patientIdInput && (
                            <button
                                onClick={() => { setPatientIdInput(''); setSearchResults([]); setShowResults(false); }}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                                <X size={16} />
                            </button>
                        )}

                        {/* Search Results Dropdown */}
                        {showResults && (
                            <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-100 z-50 overflow-hidden max-h-60 overflow-y-auto">
                                {searchResults.length > 0 ? (
                                    searchResults.map(p => (
                                        <button
                                            key={p.specialId}
                                            onClick={() => selectPatient(p)}
                                            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-emerald-50 transition-colors text-left border-b border-gray-50 last:border-0"
                                        >
                                            <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-600">
                                                <User size={16} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-bold text-gray-900 text-sm truncate">{p.childName}</p>
                                                <p className="text-xs text-gray-500">{p.specialId} • {p.parentName}</p>
                                            </div>
                                        </button>
                                    ))
                                ) : (
                                    <div className="p-4 text-center text-gray-500 text-sm">No patients found</div>
                                )}
                            </div>
                        )}
                    </div>
                    <button
                        onClick={searchPatient}
                        disabled={loading}
                        className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-6 py-3 rounded-xl font-bold hover:from-emerald-600 hover:to-teal-600 transition-all shadow-sm disabled:opacity-60 h-[46px]"
                    >
                        {loading || searchLoading ? '...' : <><Search size={16} /> Search</>}
                    </button>
                </div>
                {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
            </div>

            {/* Patient found — tabs */}
            {searchedId && gardenData && (
                <>
                    {/* Patient stats summary */}
                    {analytics && (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {[
                                { label: 'Total Goals', value: analytics.totalGoals, icon: Target, col: 'text-violet-600 bg-violet-50' },
                                { label: 'Completed', value: analytics.completedGoals, icon: Check, col: 'text-emerald-600 bg-emerald-50' },
                                { label: 'Trees Grown', value: analytics.xp?.treesGrown || 0, icon: Leaf, col: 'text-green-600 bg-green-50' },
                                { label: 'Total XP', value: analytics.xp?.totalXP || 0, icon: Zap, col: 'text-amber-600 bg-amber-50' },
                            ].map(s => (
                                <div key={s.label} className="bg-white rounded-2xl border border-gray-100 p-4 text-center shadow-sm">
                                    <div className={`w-9 h-9 ${s.col} rounded-xl flex items-center justify-center mx-auto mb-2`}>
                                        <s.icon size={18} />
                                    </div>
                                    <p className="text-xl font-black text-gray-900">{s.value}</p>
                                    <p className="text-xs text-gray-500">{s.label}</p>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Tabs */}
                    <div className="flex gap-2 bg-gray-100 p-1 rounded-2xl w-fit">
                        {[
                            { id: 'garden', label: '🌿 Garden' },
                            { id: 'analytics', label: '📊 Analytics' },
                            { id: 'add', label: '🌱 Add Goal' },
                        ].map(t => (
                            <button
                                key={t.id}
                                onClick={() => setActiveTab(t.id)}
                                className={`px-5 py-2 rounded-xl font-bold text-sm transition-all ${activeTab === t.id ? 'bg-white shadow text-emerald-700' : 'text-gray-600 hover:text-gray-800'}`}
                            >
                                {t.label}
                            </button>
                        ))}
                    </div>

                    {/* Garden Tab */}
                    {activeTab === 'garden' && (
                        <div className="bg-gradient-to-b from-sky-50 to-emerald-50 rounded-2xl p-5 border border-emerald-100">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                                <h3 className="font-bold text-gray-800">
                                    Patient ID: <span className="text-emerald-600">{searchedId}</span> — {gardenData.goals?.length || 0} plants
                                </h3>

                                <div className="flex gap-2 bg-white/60 p-1 rounded-xl border border-emerald-100 shadow-sm">
                                    {[
                                        { id: 'all', label: 'All Goals' },
                                        { id: 'therapist', label: 'Therapist' },
                                        { id: 'parent', label: 'Parent' },
                                    ].map(f => (
                                        <button
                                            key={f.id}
                                            onClick={() => setGoalFilter(f.id)}
                                            className={`px-4 py-1.5 rounded-lg font-bold text-xs transition-all ${goalFilter === f.id
                                                ? 'bg-emerald-500 text-white shadow-sm'
                                                : 'text-emerald-700 hover:bg-emerald-100'
                                                }`}
                                        >
                                            {f.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {gardenData.goals?.filter(g => goalFilter === 'all' || g.goalOwnerType === goalFilter).length === 0 ? (
                                <div className="text-center py-12">
                                    <div className="text-6xl mb-3">🌱</div>
                                    <p className="text-gray-500">No goals yet. Plant the first one!</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {gardenData.goals
                                        .filter(g => goalFilter === 'all' || g.goalOwnerType === goalFilter)
                                        .map(goal => {
                                            const progress = Math.round((goal.currentCompletions / goal.requiredCompletions) * 100);
                                            const cat = CATEGORY_CONFIG[goal.skillCategory] || CATEGORY_CONFIG.cognitive;
                                            const isParent = goal.goalOwnerType === 'parent';
                                            return (
                                                <div key={goal._id} className={`bg-white rounded-2xl border-2 ${goal.isCompleted ? 'border-emerald-300' : isParent ? 'border-amber-200' : 'border-gray-100'} p-4 shadow-sm relative overflow-hidden`}>
                                                    <div className="absolute top-2 right-2 flex items-center gap-2">
                                                        {isParent && (
                                                            <div className="flex items-center gap-1 bg-amber-100 text-amber-700 text-[9px] font-black px-1.5 py-0.5 rounded-full border border-amber-200 shadow-sm">
                                                                ⭐ PARENT
                                                            </div>
                                                        )}
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); handleDeleteGoal(goal._id, goal.goalName); }}
                                                            className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                                            title="Delete Goal"
                                                        >
                                                            <Trash2 size={14} />
                                                        </button>
                                                    </div>
                                                    <div className="text-center text-4xl mb-2">{goal.isCompleted ? '🌳' : GROWTH_STAGES[goal.growthStage]?.split(' ')[0]}</div>
                                                    <p className="font-bold text-sm text-gray-900 text-center">{goal.goalName}</p>
                                                    <p className="text-xs text-center text-gray-500 mt-0.5">{goal.plantSpecies} {goal.plantEmoji}</p>
                                                    <span className={`mt-2 inline-block text-xs px-2 py-0.5 rounded-full font-medium ${cat.color}`}>{cat.label}</span>
                                                    <div className="mt-3">
                                                        <div className="flex justify-between text-xs text-gray-500 mb-1">
                                                            <span>{goal.currentCompletions}/{goal.requiredCompletions}</span>
                                                            <span className="font-semibold">{progress}%</span>
                                                        </div>
                                                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                                            <div className="h-full bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full" style={{ width: `${progress}%` }} />
                                                        </div>
                                                    </div>
                                                    {!goal.isCompleted && (
                                                        <button
                                                            onClick={() => handleComplete(goal._id)}
                                                            className="mt-3 w-full py-2 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-xl hover:bg-emerald-100 transition-all border border-emerald-200"
                                                        >
                                                            ✓ Mark Activity Done
                                                        </button>
                                                    )}
                                                    {goal.isCompleted && <div className="mt-3 text-center text-xs text-emerald-600 font-bold">✅ Goal Complete!</div>}
                                                </div>
                                            );
                                        })}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Analytics Tab */}
                    {activeTab === 'analytics' && analytics && (
                        <div className="space-y-4">
                            <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                                <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                                    <BarChart3 className="text-violet-500" size={18} /> Category Breakdown
                                </h4>
                                <div className="space-y-3">
                                    {Object.entries(analytics.categoryBreakdown || {}).map(([cat, vals]) => {
                                        const cfg = CATEGORY_CONFIG[cat];
                                        const pct = vals.total > 0 ? Math.round((vals.completed / vals.total) * 100) : 0;
                                        return (
                                            <div key={cat} className="flex items-center gap-3">
                                                <span className={`text-xs font-medium px-2 py-1 rounded-full w-32 text-center ${cfg?.color}`}>{cfg?.label || cat}</span>
                                                <div className="flex-1 h-2.5 bg-gray-100 rounded-full overflow-hidden">
                                                    <div className="h-full bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full" style={{ width: `${pct}%` }} />
                                                </div>
                                                <span className="text-xs font-bold text-gray-600 w-16 text-right">{vals.completed}/{vals.total} done</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-center">
                                    <div className="text-3xl font-black text-amber-600">{analytics.xp?.wateringStreak || 0}</div>
                                    <p className="text-xs text-amber-700 font-semibold">Day Watering Streak 💧</p>
                                </div>
                                <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-center">
                                    <div className="text-3xl font-black text-emerald-600">{analytics.avgProgress}%</div>
                                    <p className="text-xs text-emerald-700 font-semibold">Average Goal Progress</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Add Goal Tab */}
                    {activeTab === 'add' && (
                        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                            <h3 className="font-bold text-gray-900 mb-5 flex items-center gap-2">
                                <Sprout className="text-emerald-500" size={20} /> Plant a New Goal for <span className="text-emerald-600 ml-1">{searchedId}</span>
                            </h3>
                            <form onSubmit={handleAddGoal} className="space-y-4">
                                {addError && <div className="bg-red-50 text-red-600 text-sm rounded-xl px-4 py-3">{addError}</div>}
                                {addSuccess && <div className="bg-emerald-50 text-emerald-700 text-sm rounded-xl px-4 py-3 font-semibold">{addSuccess}</div>}

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1.5">Goal Name 🌱</label>
                                    <input
                                        required type="text" placeholder="e.g. Practice eye contact for 2 minutes"
                                        className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-400"
                                        value={form.goalName} onChange={e => setForm(f => ({ ...f, goalName: e.target.value }))}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-1.5">Skill Category</label>
                                        <select
                                            className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-400"
                                            value={form.skillCategory} onChange={e => setForm(f => ({ ...f, skillCategory: e.target.value }))}
                                        >
                                            {Object.entries(CATEGORY_CONFIG).map(([k, v]) => (
                                                <option key={k} value={k}>{v.label} — {PLANT_MAP[k]}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-1.5">Difficulty</label>
                                        <select
                                            className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-400"
                                            value={form.difficultyLevel} onChange={e => setForm(f => ({ ...f, difficultyLevel: e.target.value }))}
                                        >
                                            <option value="easy">Easy 😊</option>
                                            <option value="medium">Medium 💪</option>
                                            <option value="hard">Hard 🦁</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-1.5">Activities Needed</label>
                                        <input
                                            type="number" min="1" max="50"
                                            className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-400"
                                            value={form.requiredCompletions}
                                            onChange={e => setForm(f => ({ ...f, requiredCompletions: parseInt(e.target.value) || 10 }))}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-1.5">Reward Message 🎁</label>
                                        <input
                                            type="text" placeholder="You're amazing!"
                                            className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-400"
                                            value={form.rewardMilestone} onChange={e => setForm(f => ({ ...f, rewardMilestone: e.target.value }))}
                                        />
                                    </div>
                                </div>

                                {/* Plant preview */}
                                <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-center gap-4">
                                    <div className="text-5xl">🌱</div>
                                    <div>
                                        <p className="text-xs text-emerald-600 font-semibold">Will become…</p>
                                        <p className="font-black text-emerald-800">{PLANT_MAP[form.skillCategory]}</p>
                                        <p className="text-xs text-emerald-600">Needs {form.requiredCompletions} activities to grow into a 🌳</p>
                                    </div>
                                </div>

                                <button
                                    type="submit" disabled={addLoading}
                                    className="w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-black text-lg rounded-2xl hover:from-emerald-600 hover:to-teal-600 transition-all shadow-md disabled:opacity-60"
                                >
                                    {addLoading ? '🌱 Planting...' : '🌱 Plant This Goal!'}
                                </button>
                            </form>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
