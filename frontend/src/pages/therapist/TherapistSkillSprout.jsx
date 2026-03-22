import React, { useState, useEffect, useRef, useCallback } from "react";
import api from "../../services/api";
import "../parent/skillsprout.css";
import {
  Sprout,
  Plus,
  Search,
  User,
  BarChart3,
  Trophy,
  Droplets,
  Target,
  Check,
  Zap,
  Leaf,
  X,
  Trash2,
} from "lucide-react";

const CATEGORY_CONFIG = {
  communication: { label: "Communication", color: "bg-sky-100 text-sky-700" },
  cognitive: { label: "Cognitive", color: "bg-violet-100 text-violet-700" },
  motor: { label: "Motor Skills", color: "bg-amber-100 text-amber-700" },
  social: { label: "Social", color: "bg-rose-100 text-rose-700" },
  emotional: { label: "Emotional", color: "bg-purple-100 text-purple-700" },
  speech: { label: "Speech", color: "bg-teal-100 text-teal-700" },
  sensory: { label: "Sensory", color: "bg-green-100 text-green-700" },
  selfcare: { label: "Self-Care", color: "bg-orange-100 text-orange-700" },
  custom: { label: "Custom Habit", color: "bg-amber-100 text-amber-700" },
};

const PLANT_MAP = {
  communication: "Chatter Cherry 🍒",
  cognitive: "Think Thistle 🌺",
  motor: "Mighty Maple 🍁",
  social: "Kindness Clover 🍀",
  emotional: "Calm Cactus 🌵",
  speech: "Speak Sunflower 🌻",
  sensory: "Wonder Willow 🌿",
  selfcare: "Care Chrysanthemum 🌸",
  custom: "Dream Daisy 🌼",
};

const GROWTH_STAGES = [
  "🌱 Seed",
  "🌿 Sprout",
  "🪴 Small Plant",
  "🌸 Flower",
  "🌳 Tree",
];

export default function TherapistSkillSprout() {
  const [patientIdInput, setPatientIdInput] = useState("");
  const [searchedId, setSearchedId] = useState("");
  const [gardenData, setGardenData] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [activeTab, setActiveTab] = useState("garden"); // garden | analytics | add
  const [goalFilter, setGoalFilter] = useState("all"); // all | therapist | parent
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [actionMessage, setActionMessage] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const searchRef = useRef(null);
  const searchTimeoutRef = useRef(null);

  // Click outside listener for search results
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowResults(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const performSearch = useCallback(async (query) => {
    if (!query || query.length < 2) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    setSearchLoading(true);
    try {
      const res = await api.get(
        `/patients/search?query=${encodeURIComponent(query)}`,
      );
      if (res.data.success) {
        setSearchResults(res.data.data || []);
        setShowResults(true);
      }
    } catch (error) {
      console.error("Search error:", error);
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  }, []);

  // Add goal form
  const [form, setForm] = useState({
    goalName: "",
    skillCategory: "communication",
    difficultyLevel: "easy",
    requiredCompletions: 10,
    rewardMilestone: "",
    description: "",
  });
  const [addLoading, setAddLoading] = useState(false);
  const [addSuccess, setAddSuccess] = useState("");
  const [addError, setAddError] = useState("");

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
    setLoading(true);
    setError("");
    setActionMessage(null);
    try {
      const [gardenRes, analyticsRes] = await Promise.all([
        api.get(`/skillsprout/garden/${id}`),
        api.get(`/skillsprout/analytics/${id}`),
      ]);
      setGardenData(gardenRes.data.data);
      setAnalytics(analyticsRes.data.data);
      setSearchedId(id);
    } catch (err) {
      setError(
        err.response?.data?.error?.message ||
          "Patient not found or no garden yet",
      );
      setGardenData(null);
      setAnalytics(null);
      setSearchedId("");
    } finally {
      setLoading(false);
    }
  };

  const searchPatient = async () => {
    const id = patientIdInput.trim();
    if (!id) {
      setError("Please enter a patient ID or Name");
      return;
    }
    fetchPatientData(id);
  };

  const handleAddGoal = async (e) => {
    e.preventDefault();
    if (!searchedId) {
      setAddError("Search for a patient first");
      return;
    }
    if (!form.goalName.trim()) {
      setAddError("Goal name is required");
      return;
    }
    setAddLoading(true);
    setAddError("");
    setAddSuccess("");
    try {
      await api.post("/skillsprout/goals", { ...form, patientId: searchedId });
      setAddSuccess(
        `✅ ${form.goalName} planted successfully as ${PLANT_MAP[form.skillCategory]}!`,
      );
      setForm({
        goalName: "",
        skillCategory: "communication",
        difficultyLevel: "easy",
        requiredCompletions: 10,
        rewardMilestone: "",
        description: "",
      });
      await fetchPatientData(searchedId);
    } catch (err) {
      setAddError(
        err.response?.data?.error?.message || "Failed to create goal",
      );
    } finally {
      setAddLoading(false);
    }
  };

  const handleComplete = async (goalId) => {
    try {
      await api.post(`/skillsprout/goals/${goalId}/complete`, {});
      await fetchPatientData(searchedId);
      setActionMessage({
        type: "success",
        text: "Activity logged successfully.",
      });
    } catch (err) {
      setActionMessage({
        type: "error",
        text:
          err.response?.data?.error?.message || "Failed to log the activity.",
      });
    }
  };

  const handleDeleteGoal = async (goalId, goalName) => {
    setConfirmDelete({ goalId, goalName });
  };

  const confirmDeleteGoal = async () => {
    if (!confirmDelete) return;
    try {
      await api.delete(`/skillsprout/goals/${confirmDelete.goalId}`);
      setConfirmDelete(null);
      await fetchPatientData(searchedId);
      setActionMessage({
        type: "success",
        text: "Goal removed from the garden.",
      });
    } catch (err) {
      setActionMessage({
        type: "error",
        text:
          err.response?.data?.error?.message || "Failed to delete the goal.",
      });
    }
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="rounded-[2rem] border border-gray-100 bg-white p-5 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="w-11 h-11 bg-gradient-to-br from-emerald-400 to-teal-600 rounded-2xl flex items-center justify-center shadow-md">
            <Sprout className="text-white" size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-gray-900">
              SkillSprout Manager
            </h1>
            <p className="text-sm text-gray-500">
              Search a patient, review current goals, and add the next skill
              target with less friction.
            </p>
          </div>
        </div>
      </div>

      {/* Patient Search */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
          <User size={18} className="text-emerald-500" /> Search Patient Garden
        </h3>
        <p className="mb-4 text-sm text-gray-500">
          Search by special ID or child name to open the live garden and
          analytics view.
        </p>
        <label htmlFor="skillsprout-patient-search" className="sr-only">
          Search patient by special ID or child name
        </label>
        <div className="flex gap-3 relative" ref={searchRef}>
          <div className="flex-1 relative">
            <input
              id="skillsprout-patient-search"
              type="text"
              name="patientSearch"
              autoComplete="off"
              placeholder="Enter Patient Special ID or Child Name…"
              className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-400 transition-colors pr-10"
              value={patientIdInput}
              onChange={handleSearchChange}
              onKeyDown={(e) => e.key === "Enter" && searchPatient()}
              aria-expanded={showResults}
              aria-controls="skillsprout-search-results"
            />
            {patientIdInput && (
              <button
                onClick={() => {
                  setPatientIdInput("");
                  setSearchResults([]);
                  setShowResults(false);
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                aria-label="Clear patient search"
                type="button"
              >
                <X size={16} />
              </button>
            )}

            {/* Search Results Dropdown */}
            {showResults && (
              <div
                id="skillsprout-search-results"
                className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-100 z-50 overflow-hidden max-h-60 overflow-y-auto"
              >
                {searchResults.length > 0 ? (
                  searchResults.map((p) => (
                    <button
                      key={p.specialId}
                      onClick={() => selectPatient(p)}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-emerald-50 transition-colors text-left border-b border-gray-50 last:border-0"
                      type="button"
                    >
                      <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-600">
                        <User size={16} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-gray-900 text-sm truncate">
                          {p.childName}
                        </p>
                        <p className="text-xs text-gray-500">
                          {p.specialId} • {p.parentName}
                        </p>
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="p-4 text-center text-gray-500 text-sm">
                    No patients found
                  </div>
                )}
              </div>
            )}
          </div>
          <button
            onClick={searchPatient}
            disabled={loading}
            className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-6 py-3 rounded-xl font-bold hover:from-emerald-600 hover:to-teal-600 transition-all shadow-sm disabled:opacity-60 h-[46px]"
            type="button"
          >
            {loading || searchLoading ? (
              "Searching…"
            ) : (
              <>
                <Search size={16} aria-hidden="true" /> Search
              </>
            )}
          </button>
        </div>
        {error && (
          <p className="text-red-500 text-sm mt-2" role="alert">
            {error}
          </p>
        )}
        {actionMessage && (
          <div
            className={`mt-3 rounded-xl px-4 py-3 text-sm ${actionMessage.type === "error" ? "bg-red-50 text-red-700" : "bg-emerald-50 text-emerald-700"}`}
            role={actionMessage.type === "error" ? "alert" : "status"}
            aria-live="polite"
          >
            {actionMessage.text}
          </div>
        )}
      </div>

      {/* Patient found — tabs */}
      {searchedId && gardenData && (
        <>
          {/* Patient stats summary */}
          {analytics && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                {
                  label: "Total Goals",
                  value: analytics.totalGoals,
                  icon: Target,
                  col: "text-violet-600 bg-violet-50",
                },
                {
                  label: "Completed",
                  value: analytics.completedGoals,
                  icon: Check,
                  col: "text-emerald-600 bg-emerald-50",
                },
                {
                  label: "Trees Grown",
                  value: analytics.xp?.treesGrown || 0,
                  icon: Leaf,
                  col: "text-green-600 bg-green-50",
                },
                {
                  label: "Total XP",
                  value: analytics.xp?.totalXP || 0,
                  icon: Zap,
                  col: "text-amber-600 bg-amber-50",
                },
              ].map((s) => (
                <div
                  key={s.label}
                  className="bg-white rounded-2xl border border-gray-100 p-4 text-center shadow-sm transition-transform hover:-translate-y-0.5"
                >
                  <div
                    className={`w-9 h-9 ${s.col} rounded-xl flex items-center justify-center mx-auto mb-2`}
                  >
                    <s.icon size={18} />
                  </div>
                  <p className="text-xl font-black text-gray-900">{s.value}</p>
                  <p className="text-xs text-gray-500">{s.label}</p>
                </div>
              ))}
            </div>
          )}

          {/* Tabs */}
          <div className="flex gap-2 bg-gray-100 p-1 rounded-2xl w-fit shadow-inner">
            {[
              { id: "garden", label: "🌿 Garden" },
              { id: "analytics", label: "📊 Analytics" },
              { id: "add", label: "🌱 Add Goal" },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={`px-5 py-2 rounded-xl font-bold text-sm transition-all ${activeTab === t.id ? "bg-white shadow text-emerald-700" : "text-gray-600 hover:text-gray-800"}`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Garden Tab */}
          {activeTab === "garden" && (
            <div className="bg-gradient-to-b from-sky-50 to-emerald-50 rounded-2xl p-5 border border-emerald-100 shadow-sm">
              {confirmDelete && (
                <div className="mb-4 rounded-2xl border border-red-200 bg-white px-4 py-4 shadow-sm">
                  <p className="text-sm font-semibold text-gray-900">
                    Remove “{confirmDelete.goalName}” from this garden?
                  </p>
                  <p className="mt-1 text-sm text-gray-600">
                    This hides the goal from the active garden view.
                  </p>
                  <div className="mt-3 flex gap-3">
                    <button
                      type="button"
                      onClick={confirmDeleteGoal}
                      className="rounded-xl bg-red-600 px-4 py-2 text-sm font-bold text-white hover:bg-red-700"
                    >
                      Delete Goal
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmDelete(null)}
                      className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-bold text-gray-700 hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                <div>
                  <h3 className="font-bold text-gray-800">
                    Patient ID:{" "}
                    <span className="text-emerald-600">{searchedId}</span>
                  </h3>
                  <p className="text-sm text-gray-500">
                    {gardenData.goals?.length || 0} plants across parent and
                    therapist goals
                  </p>
                </div>

                <div className="flex gap-2 bg-slate-100 p-1.5 rounded-2xl border border-slate-200 shadow-sm">
                  {[
                    { id: "all", label: "All Units" },
                    { id: "therapist", label: "Clinical" },
                    { id: "parent", label: "Personal" },
                  ].map((f) => (
                    <button
                      key={f.id}
                      onClick={() => setGoalFilter(f.id)}
                      className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                        goalFilter === f.id
                          ? "bg-slate-900 text-white shadow-lg"
                          : "text-slate-500 hover:text-slate-700 hover:bg-white/50"
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>

              {activeTab === "garden" && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {(gardenData.goals || [])
                    .filter(
                      (g) =>
                        goalFilter === "all" || g.goalOwnerType === goalFilter,
                    )
                    .map((goal) => {
                      const progress = Math.round(
                        (goal.currentCompletions / goal.requiredCompletions) *
                          100,
                      );
                      const cat =
                        CATEGORY_CONFIG[goal.skillCategory] ||
                        CATEGORY_CONFIG.cognitive;
                      const isParent = goal.goalOwnerType === "parent";
                      return (
                        <div
                          key={goal._id}
                          className="group relative bg-white rounded-[2rem] border border-slate-200 p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                        >
                          <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
                            {isParent && (
                              <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-600 text-[9px] font-black uppercase tracking-widest border border-amber-100">
                                Personal
                              </span>
                            )}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteGoal(goal._id, goal.goalName);
                              }}
                              className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>

                          <div className="flex items-center gap-4 mb-6">
                            <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-3xl shadow-inner border border-slate-100">
                              {goal.isCompleted
                                ? "🌳"
                                : GROWTH_STAGES[goal.growthStage]?.split(
                                    " ",
                                  )[0] || "🌱"}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="text-sm font-black text-slate-800 truncate mb-0.5">
                                {goal.goalName}
                              </h4>
                              <div
                                className={`inline-block px-2 py-0.5 rounded-lg text-[10px] font-bold ${cat.color}`}
                              >
                                {cat.label}
                              </div>
                            </div>
                          </div>

                          <div className="space-y-4">
                            <div className="flex justify-between items-end">
                              <div className="space-y-0.5">
                                <span className="block text-[9px] font-black text-slate-400 uppercase tracking-widest">
                                  Clinical Progress
                                </span>
                                <span className="text-xs font-bold text-slate-700">
                                  {goal.currentCompletions} /{" "}
                                  {goal.requiredCompletions}
                                </span>
                              </div>
                              <span className="text-lg font-black text-slate-900">
                                {progress}%
                              </span>
                            </div>

                            <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200/50">
                              <div
                                className="h-full bg-emerald-500 rounded-full transition-all duration-700"
                                style={{ width: `${progress}%` }}
                              />
                            </div>
                          </div>

                          {!goal.isCompleted ? (
                            <button
                              onClick={() => handleComplete(goal._id)}
                              className="mt-5 w-full py-3 bg-slate-900 text-white text-xs font-black uppercase tracking-widest rounded-xl hover:bg-emerald-600 transition-all shadow-md flex items-center justify-center gap-2 group-hover:shadow-lg"
                              type="button"
                            >
                              <Check size={14} /> Mark Activity Done
                            </button>
                          ) : (
                            <div className="mt-5 w-full py-3 bg-emerald-50 text-emerald-700 text-xs font-black uppercase tracking-widest rounded-xl border border-emerald-100 flex items-center justify-center gap-2">
                              <Trophy size={14} fill="currentColor" /> Goal
                              Complete
                            </div>
                          )}
                        </div>
                      );
                    })}
                </div>
              )}
            </div>
          )}

          {/* Analytics Tab */}
          {activeTab === "analytics" && analytics && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="bg-white rounded-[2rem] border border-slate-200 p-8 shadow-sm">
                <h4 className="font-black text-slate-800 mb-6 flex items-center gap-3 text-lg">
                  <div className="w-10 h-10 bg-violet-50 text-violet-500 rounded-xl flex items-center justify-center border border-violet-100 shadow-inner">
                    <BarChart3 size={20} strokeWidth={2.5} />
                  </div>
                  Category Breakdown
                </h4>
                <div className="space-y-5">
                  {Object.entries(analytics.categoryBreakdown || {}).map(
                    ([cat, vals]) => {
                      const cfg = CATEGORY_CONFIG[cat];
                      const pct =
                        vals.total > 0
                          ? Math.round((vals.completed / vals.total) * 100)
                          : 0;
                      return (
                        <div
                          key={cat}
                          className="flex items-center gap-4 group/stat"
                        >
                          <div
                            className={`text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl w-36 text-center shadow-sm border border-white/50 ${cfg?.color}`}
                          >
                            {cfg?.label || cat}
                          </div>
                          <div className="flex-1 h-3.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200/50 shadow-inner">
                            <div
                              className="h-full bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full group-hover/stat:brightness-110 transition-all duration-300"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <div className="w-24 text-right flex flex-col items-end">
                            <span className="text-xs font-black text-slate-700">
                              {pct}%
                            </span>
                            <span className="text-[9px] font-bold text-slate-400 uppercase">
                              {vals.completed}/{vals.total} done
                            </span>
                          </div>
                        </div>
                      );
                    },
                  )}
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200/60 rounded-[2rem] p-6 text-center shadow-sm hover:shadow-md transition-shadow">
                  <div className="w-12 h-12 bg-white rounded-2xl mx-auto flex items-center justify-center shadow-sm text-amber-500 mb-3 border border-amber-100">
                    <Zap size={24} strokeWidth={2.5} />
                  </div>
                  <div className="text-4xl font-black text-slate-800 mb-1">
                    {analytics.xp?.wateringStreak || 0}
                  </div>
                  <p className="text-[11px] text-slate-500 font-bold uppercase tracking-widest">
                    Day Hydration Streak
                  </p>
                </div>
                <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200/60 rounded-[2rem] p-6 text-center shadow-sm hover:shadow-md transition-shadow">
                  <div className="w-12 h-12 bg-white rounded-2xl mx-auto flex items-center justify-center shadow-sm text-emerald-500 mb-3 border border-emerald-100">
                    <Target size={24} strokeWidth={2.5} />
                  </div>
                  <div className="text-4xl font-black text-slate-800 mb-1">
                    {analytics.avgProgress}%
                  </div>
                  <p className="text-[11px] text-slate-500 font-bold uppercase tracking-widest">
                    Overall Growth Average
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Add Goal Tab */}
          {activeTab === "add" && (
            <div className="bg-white rounded-[2.5rem] border border-slate-200 p-8 shadow-sm animate-in zoom-in-95 duration-500">
              <h3 className="font-black text-slate-800 mb-8 flex items-center gap-3 text-xl">
                <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-[1.25rem] flex items-center justify-center shadow-inner border border-emerald-100">
                  <Sprout size={24} strokeWidth={2.5} />
                </div>
                Curate New Goal for{" "}
                <span className="bg-slate-100 px-3 py-1 rounded-xl text-slate-600 text-sm ml-2">
                  {searchedId}
                </span>
              </h3>
              <form onSubmit={handleAddGoal} className="space-y-6 max-w-3xl">
                {addError && (
                  <div
                    className="bg-rose-50 text-rose-700 text-sm rounded-2xl px-5 py-4 border border-rose-200 font-bold flex items-center gap-3"
                    role="alert"
                  >
                    <X size={18} /> {addError}
                  </div>
                )}
                {addSuccess && (
                  <div
                    className="bg-emerald-50 text-emerald-700 text-sm rounded-2xl px-5 py-4 border border-emerald-200 font-bold flex items-center gap-3"
                    role="status"
                  >
                    <Check size={18} /> {addSuccess}
                  </div>
                )}

                <div>
                  <label
                    htmlFor="therapist-goal-name"
                    className="block text-xs font-black uppercase tracking-widest text-slate-500 mb-2"
                  >
                    Goal Objective
                  </label>
                  <input
                    id="therapist-goal-name"
                    name="goalName"
                    required
                    type="text"
                    placeholder="e.g. Maintain eye contact during greetings..."
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-[1.25rem] px-5 py-4 text-sm font-bold text-slate-700 focus:outline-none focus:border-emerald-400 focus:bg-white transition-all focus:shadow-[0_0_0_4px_rgba(16,185,129,0.05)]"
                    value={form.goalName}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, goalName: e.target.value }))
                    }
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label
                      htmlFor="therapist-skill-category"
                      className="block text-xs font-black uppercase tracking-widest text-slate-500 mb-2"
                    >
                      Skill Category
                    </label>
                    <select
                      id="therapist-skill-category"
                      name="skillCategory"
                      className="w-full bg-slate-50 border-2 border-slate-100 rounded-[1.25rem] px-5 py-4 text-sm font-bold text-slate-700 focus:outline-none focus:border-emerald-400 focus:bg-white transition-all appearance-none cursor-pointer"
                      value={form.skillCategory}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          skillCategory: e.target.value,
                        }))
                      }
                    >
                      {Object.entries(CATEGORY_CONFIG).map(([k, v]) => (
                        <option key={k} value={k}>
                          {v.label} — {PLANT_MAP[k]}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label
                      htmlFor="therapist-difficulty"
                      className="block text-xs font-black uppercase tracking-widest text-slate-500 mb-2"
                    >
                      Pacing / Difficulty
                    </label>
                    <select
                      id="therapist-difficulty"
                      name="difficultyLevel"
                      className="w-full bg-slate-50 border-2 border-slate-100 rounded-[1.25rem] px-5 py-4 text-sm font-bold text-slate-700 focus:outline-none focus:border-emerald-400 focus:bg-white transition-all appearance-none cursor-pointer"
                      value={form.difficultyLevel}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          difficultyLevel: e.target.value,
                        }))
                      }
                    >
                      <option value="easy">Easy (High Success Rate)</option>
                      <option value="medium">
                        Medium (Moderate Challenge)
                      </option>
                      <option value="hard">Hard (Stretch Goal)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label
                      htmlFor="therapist-required-completions"
                      className="block text-xs font-black uppercase tracking-widest text-slate-500 mb-2"
                    >
                      Repetitions to Tree
                    </label>
                    <input
                      id="therapist-required-completions"
                      name="requiredCompletions"
                      type="number"
                      min="1"
                      max="50"
                      className="w-full bg-slate-50 border-2 border-slate-100 rounded-[1.25rem] px-5 py-4 text-sm font-bold text-slate-700 focus:outline-none focus:border-emerald-400 focus:bg-white transition-all"
                      value={form.requiredCompletions}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          requiredCompletions: parseInt(e.target.value) || 10,
                        }))
                      }
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="therapist-reward-message"
                      className="block text-xs font-black uppercase tracking-widest text-slate-500 mb-2"
                    >
                      Completion Reward String
                    </label>
                    <input
                      id="therapist-reward-message"
                      name="rewardMilestone"
                      type="text"
                      placeholder="e.g. Amazing focus today!"
                      className="w-full bg-slate-50 border-2 border-slate-100 rounded-[1.25rem] px-5 py-4 text-sm font-bold text-slate-700 focus:outline-none focus:border-emerald-400 focus:bg-white transition-all"
                      value={form.rewardMilestone}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          rewardMilestone: e.target.value,
                        }))
                      }
                    />
                  </div>
                </div>

                {/* Premium Plant preview */}
                <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-100 rounded-[1.75rem] p-6 flex flex-col md:flex-row items-center gap-6 shadow-sm overflow-hidden relative">
                  <div className="absolute right-0 top-0 w-32 h-32 bg-white rounded-full blur-3xl opacity-60 pointer-events-none" />
                  <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center text-4xl shadow-md border border-white/50 relative z-10 shrink-0">
                    🌱
                  </div>
                  <div className="relative z-10 text-center md:text-left">
                    <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600 mb-1">
                      Growth Prediction
                    </p>
                    <p className="text-xl font-black text-slate-800 mb-1">
                      {PLANT_MAP[form.skillCategory]}
                    </p>
                    <p className="text-sm font-bold text-slate-500">
                      Requires {form.requiredCompletions} logged repetitions to
                      reach full tree status.
                    </p>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={addLoading}
                  className="w-full py-5 bg-slate-900 text-white font-black text-sm uppercase tracking-widest rounded-[1.5rem] hover:bg-emerald-600 focus:bg-emerald-600 transition-all shadow-xl hover:shadow-[0_15px_30px_-10px_rgba(16,185,129,0.4)] disabled:opacity-60 disabled:hover:bg-slate-900"
                >
                  {addLoading ? "Planting Seed..." : "Create Clinical Goal"}
                </button>
              </form>
            </div>
          )}
        </>
      )}
    </div>
  );
}
