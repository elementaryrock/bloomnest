import React, { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  Waves,
  Heart,
  Smile,
  Frown,
  Meh,
  AlertTriangle,
  Zap,
  Plus,
  TrendingUp,
  TrendingDown,
  Minus,
  BarChart3,
  Users,
  ChevronDown,
  ChevronUp,
  Send,
  Calendar,
  Brain,
  Sparkles,
  X,
  Download,
  Activity,
  Award,
  FileText,
  Loader2,
  Flame,
  Lightbulb,
  ArrowUpRight,
  ArrowDownRight,
  Equal,
  CalendarDays,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";
import { toast } from "react-toastify";

// ─── Feeling Config ───
const FEELINGS = [
  {
    key: "happy",
    label: "Happy",
    icon: Smile,
    color: "text-emerald-500",
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    ring: "ring-emerald-400",
  },
  {
    key: "neutral",
    label: "Neutral",
    icon: Meh,
    color: "text-slate-400",
    bg: "bg-slate-50",
    border: "border-slate-200",
    ring: "ring-slate-400",
  },
  {
    key: "anxious",
    label: "Anxious",
    icon: AlertTriangle,
    color: "text-amber-500",
    bg: "bg-amber-50",
    border: "border-amber-200",
    ring: "ring-amber-400",
  },
  {
    key: "frustrated",
    label: "Frustrated",
    icon: Zap,
    color: "text-orange-500",
    bg: "bg-orange-50",
    border: "border-orange-200",
    ring: "ring-orange-400",
  },
  {
    key: "sad",
    label: "Sad",
    icon: Frown,
    color: "text-blue-400",
    bg: "bg-blue-50",
    border: "border-blue-200",
    ring: "ring-blue-400",
  },
];

const STRESS_EMOJIS = ["😊", "🙂", "😐", "😟", "😰"];
const STRESS_LABELS = ["Very Low", "Low", "Moderate", "High", "Very High"];
const STRESS_COLORS = [
  "from-emerald-400 to-teal-500",
  "from-green-400 to-emerald-500",
  "from-amber-400 to-yellow-500",
  "from-orange-400 to-red-400",
  "from-red-500 to-rose-600",
];

const FEELING_EMOJI = {
  happy: "😊",
  neutral: "😐",
  anxious: "😰",
  frustrated: "😤",
  sad: "😢",
};
const HEATMAP_COLORS = ["#10b981", "#6ee7b7", "#fbbf24", "#f97316", "#ef4444"];

const APP_TIMEZONE_FALLBACK = "UTC";

const formatWeekDate = (date, timezone = APP_TIMEZONE_FALLBACK, options = {}) =>
  new Date(date).toLocaleDateString("en-US", {
    timeZone: timezone,
    ...options,
  });

const getCurrentWeekStartIsoUtc = () => {
  const now = new Date();
  const utcDate = new Date(
    Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate(),
      0,
      0,
      0,
      0,
    ),
  );
  const day = utcDate.getUTCDay();
  const diffToMonday = day === 0 ? -6 : 1 - day;
  utcDate.setUTCDate(utcDate.getUTCDate() + diffToMonday);
  return utcDate.toISOString();
};

// ─── Ripple Visualization ───
const RippleVisualization = ({ scores }) => {
  const [mounted, setMounted] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 50);
    return () => clearTimeout(timer);
  }, []);

  const rings = [
    {
      label: "Child Progress",
      score: scores?.child ?? 0,
      radius: 54,
      width: 14,
      colors: ["#a78bfa", "#7c3aed"],
      glow: "rgba(139,92,246,0.25)",
    },
    {
      label: "Parent Wellbeing",
      score: scores?.parent ?? 0,
      radius: 80,
      width: 14,
      colors: ["#60a5fa", "#2563eb"],
      glow: "rgba(59,130,246,0.2)",
    },
    {
      label: "Sibling Mood",
      score: scores?.siblings,
      radius: 106,
      width: 14,
      colors: ["#34d399", "#059669"],
      glow: "rgba(16,185,129,0.2)",
    },
  ].filter((r) => r.score !== null && r.score !== undefined);

  const overallScore = scores?.overall ?? null;

  return (
    <div className="flex flex-col items-center">
      <div className="relative">
        <svg
          viewBox="-130 -130 260 260"
          className="w-64 h-64 mx-auto"
          style={{ filter: "drop-shadow(0 2px 16px rgba(139,92,246,0.12))" }}
        >
          <defs>
            {rings.map((ring, i) => (
              <React.Fragment key={`defs-${i}`}>
                <linearGradient id={`ringGrad${i}`} x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor={ring.colors[0]} />
                  <stop offset="100%" stopColor={ring.colors[1]} />
                </linearGradient>
                {/* Soft glow filter for each ring */}
                <filter
                  id={`softGlow${i}`}
                  x="-30%"
                  y="-30%"
                  width="160%"
                  height="160%"
                >
                  <feGaussianBlur
                    in="SourceGraphic"
                    stdDeviation="4"
                    result="blur"
                  />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </React.Fragment>
            ))}
            {/* Rotating shimmer gradient */}
            <linearGradient id="shimmer" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="white" stopOpacity="0" />
              <stop offset="45%" stopColor="white" stopOpacity="0" />
              <stop offset="50%" stopColor="white" stopOpacity="0.35" />
              <stop offset="55%" stopColor="white" stopOpacity="0" />
              <stop offset="100%" stopColor="white" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Water ripple waves emanating from center */}
          {[0, 1, 2].map((i) => (
            <circle
              key={`ripple-${i}`}
              cx="0"
              cy="0"
              r="30"
              fill="none"
              stroke="#c4b5fd"
              strokeWidth="1.5"
              className={prefersReducedMotion ? "" : "water-ripple"}
              style={{ animationDelay: `${i * 2}s` }}
            />
          ))}

          {/* Render rings from outer to inner */}
          {[...rings].reverse().map((ring, i) => {
            const actualIdx = rings.length - 1 - i;
            const circumference = 2 * Math.PI * ring.radius;
            const progress = (ring.score / 100) * circumference;
            return (
              <g key={ring.label}>
                {/* Track */}
                <circle
                  cx="0"
                  cy="0"
                  r={ring.radius}
                  fill="none"
                  stroke="#f0f0f3"
                  strokeWidth={ring.width}
                />
                {/* Soft glow behind the progress arc */}
                <circle
                  cx="0"
                  cy="0"
                  r={ring.radius}
                  fill="none"
                  stroke={ring.glow}
                  strokeWidth={ring.width + 6}
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={
                    mounted ? circumference - progress : circumference
                  }
                  transform="rotate(-90)"
                  opacity={mounted ? 0.6 : 0}
                  style={{
                    transition: `stroke-dashoffset 1.4s cubic-bezier(0.25, 0.46, 0.45, 0.94) ${actualIdx * 0.15}s, opacity 0.8s ease ${actualIdx * 0.15}s`,
                    filter: "blur(4px)",
                  }}
                />
                {/* Progress arc */}
                <circle
                  cx="0"
                  cy="0"
                  r={ring.radius}
                  fill="none"
                  stroke={`url(#ringGrad${actualIdx})`}
                  strokeWidth={ring.width}
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={
                    mounted ? circumference - progress : circumference
                  }
                  transform="rotate(-90)"
                  style={{
                    transition: `stroke-dashoffset 1.4s cubic-bezier(0.25, 0.46, 0.45, 0.94) ${actualIdx * 0.15}s`,
                  }}
                />
                {/* Shimmer highlight rotating on loop */}
                <circle
                  cx="0"
                  cy="0"
                  r={ring.radius}
                  fill="none"
                  stroke="url(#shimmer)"
                  strokeWidth={ring.width - 2}
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={
                    mounted ? circumference - progress : circumference
                  }
                  opacity={mounted ? 1 : 0}
                  className={prefersReducedMotion ? "" : "ripple-shimmer"}
                  style={{
                    transformOrigin: "0 0",
                    animationDelay: `${actualIdx * 0.6}s`,
                  }}
                />
              </g>
            );
          })}

          {/* Center circle */}
          <circle
            cx="0"
            cy="0"
            r="38"
            fill="white"
            className={prefersReducedMotion ? "" : "ripple-center"}
          />
          <text
            x="0"
            y="-6"
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize="24"
            fontWeight="800"
            fill="#1f2937"
            className={prefersReducedMotion ? "" : "ripple-center"}
          >
            {overallScore ?? "--"}
          </text>
          <text
            x="0"
            y="12"
            textAnchor="middle"
            fontSize="9"
            fontWeight="600"
            fill="#9ca3af"
            letterSpacing="0.5"
          >
            OVERALL
          </text>
        </svg>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-5 mt-4">
        {rings.map((ring) => (
          <div key={ring.label} className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full shadow-sm"
              style={{
                background: `linear-gradient(135deg, ${ring.colors[0]}, ${ring.colors[1]})`,
              }}
            />
            <div className="flex flex-col">
              <span className="text-[11px] font-semibold text-gray-700">
                {ring.score}%
              </span>
              <span className="text-[11px] text-gray-400 leading-tight">
                {ring.label}
              </span>
            </div>
          </div>
        ))}
      </div>

      <style>{`
                .ripple-center {
                    animation: centerBreath 4s ease-in-out infinite;
                }
                @keyframes centerBreath {
                    0%, 100% { transform: scale(1); }
                    50% { transform: scale(1.03); }
                }
                .ripple-shimmer {
                    animation: shimmerRotate 6s linear infinite;
                }
                @keyframes shimmerRotate {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                .water-ripple {
                    animation: waterRippleEmit 6s ease-out infinite;
                    opacity: 0;
                    transform-origin: 0 0;
                }
                @keyframes waterRippleEmit {
                    0% { transform: scale(0.8); opacity: 0.5; stroke-width: 2px; }
                    50% { opacity: 0.2; }
                    100% { transform: scale(4.5); opacity: 0; stroke-width: 0.1px; }
                }
            `}</style>
    </div>
  );
};

// ─── Trend Badge ───
const TrendBadge = ({ trend }) => {
  const config = {
    positive: {
      icon: TrendingUp,
      text: "Positive Ripple",
      cls: "text-emerald-600 bg-emerald-50 border-emerald-200",
    },
    moderate: {
      icon: TrendingUp,
      text: "Moderate Ripple",
      cls: "text-blue-600 bg-blue-50 border-blue-200",
    },
    neutral: {
      icon: Minus,
      text: "Neutral",
      cls: "text-slate-500 bg-slate-50 border-slate-200",
    },
    inverse: {
      icon: TrendingDown,
      text: "Variable",
      cls: "text-amber-600 bg-amber-50 border-amber-200",
    },
    insufficient_data: {
      icon: BarChart3,
      text: "Need More Data",
      cls: "text-gray-400 bg-gray-50 border-gray-200",
    },
  };
  const c = config[trend] || config.insufficient_data;
  const Icon = c.icon;
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${c.cls}`}
    >
      <Icon size={13} /> {c.text}
    </span>
  );
};

const ConfidenceBadge = ({ confidence }) => {
  const level = confidence?.level || "low";
  const config = {
    high: {
      text: "High Confidence",
      cls: "text-emerald-700 bg-emerald-50 border-emerald-200",
    },
    medium: {
      text: "Medium Confidence",
      cls: "text-amber-700 bg-amber-50 border-amber-200",
    },
    low: {
      text: "Low Confidence",
      cls: "text-gray-600 bg-gray-50 border-gray-200",
    },
  };
  const c = config[level] || config.low;
  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold border ${c.cls}`}
    >
      {c.text}
    </span>
  );
};

// ─── Mini Sparkline ───
const Sparkline = ({ data, color = "#8b5cf6", height = 48 }) => {
  if (!data || data.length < 2) return null;
  const max = Math.max(...data, 5);
  const min = Math.min(...data, 1);
  const range = max - min || 1;
  const w = 200;
  const pts = data.map((v, i) => ({
    x: (i / (data.length - 1)) * w,
    y: height - ((v - min) / range) * (height - 8),
  }));
  const points = pts.map((p) => `${p.x},${p.y}`).join(" ");
  // Area fill path
  const areaPath =
    `M${pts[0].x},${height} ` +
    pts.map((p) => `L${p.x},${p.y}`).join(" ") +
    ` L${pts[pts.length - 1].x},${height} Z`;
  return (
    <svg viewBox={`0 0 ${w} ${height}`} className="w-full" style={{ height }}>
      <defs>
        <linearGradient id="sparkFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.2" />
          <stop offset="100%" stopColor={color} stopOpacity="0.02" />
        </linearGradient>
      </defs>
      <path d={areaPath} fill="url(#sparkFill)" />
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {data.map((v, i) => (
        <circle
          key={i}
          cx={pts[i].x}
          cy={pts[i].y}
          r="3.5"
          fill="white"
          stroke={color}
          strokeWidth="2"
          className="drop-shadow-sm"
        />
      ))}
    </svg>
  );
};

// ─── Summary Stat Card ───
const StatCard = ({ icon: Icon, label, value, color, subtext, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, delay }}
    whileHover={{ y: -4, boxShadow: "0 8px 25px -5px rgba(0,0,0,0.1)" }}
    className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex items-center gap-3 transition-shadow cursor-default"
  >
    <div
      className={`w-10 h-10 rounded-lg ${color} flex items-center justify-center text-white flex-shrink-0`}
    >
      <Icon size={18} />
    </div>
    <div className="min-w-0">
      <p className="text-lg font-bold text-gray-900 leading-tight">{value}</p>
      <p className="text-xs text-gray-500 truncate">{label}</p>
      {subtext && <p className="text-xs text-gray-400 truncate">{subtext}</p>}
    </div>
  </motion.div>
);

// ─── Stress Heatmap Calendar ───
const StressHeatmap = ({ history, timezone }) => {
  const weeks = history.slice(0, 12).reverse();
  if (weeks.length < 2) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.25 }}
      className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
    >
      <h2 className="text-lg font-semibold text-gray-900 mb-1 flex items-center gap-2">
        <CalendarDays size={18} className="text-teal-500" /> Stress Calendar
      </h2>
      <p className="text-xs text-gray-500 mb-4">
        Last {weeks.length} weeks at a glance
      </p>
      <div className="flex items-end gap-1.5 justify-center">
        {weeks.map((w, i) => {
          const d = new Date(w.weekStart);
          const label = formatWeekDate(d, timezone, {
            month: "short",
            day: "numeric",
          });
          const colorIdx = w.stressLevel - 1;
          const barHeight = 16 + (w.stressLevel / 5) * 40;
          return (
            <motion.div
              key={i}
              initial={{ scaleY: 0 }}
              animate={{ scaleY: 1 }}
              transition={{ duration: 0.4, delay: i * 0.04 }}
              style={{ originY: 1 }}
              className="flex flex-col items-center gap-1 group relative"
            >
              <div
                className="w-7 sm:w-8 rounded-t-md rounded-b-sm transition-all hover:brightness-110 cursor-default border border-black/5"
                style={{
                  backgroundColor: HEATMAP_COLORS[colorIdx],
                  height: barHeight,
                }}
                title={`${label}: ${STRESS_LABELS[colorIdx]}`}
              />
              <span className="text-[11px] text-gray-400 leading-none">
                {formatWeekDate(d, timezone, {
                  month: "narrow",
                  day: "numeric",
                })}
              </span>
              <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 hidden sm:block">
                {label}: {STRESS_LABELS[colorIdx]}
              </div>
            </motion.div>
          );
        })}
      </div>
      <div className="flex items-center justify-center gap-1.5 mt-3">
        <span className="text-[11px] text-gray-400">Low</span>
        {HEATMAP_COLORS.map((c, i) => (
          <div
            key={i}
            className="w-3 h-3 rounded-sm border border-black/5"
            style={{ backgroundColor: c }}
          />
        ))}
        <span className="text-[11px] text-gray-400">High</span>
      </div>
      <p className="text-[11px] text-gray-400 mt-2 text-center sm:hidden">
        Tip: tap and hold bars to view full labels.
      </p>
    </motion.div>
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

  const DeltaIcon =
    stressDelta < 0 ? ArrowDownRight : stressDelta > 0 ? ArrowUpRight : Equal;
  const deltaColor =
    stressDelta < 0
      ? "text-emerald-500"
      : stressDelta > 0
        ? "text-red-500"
        : "text-gray-400";
  const deltaLabel =
    stressDelta < 0 ? "Improved" : stressDelta > 0 ? "Increased" : "No Change";

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.15 }}
      className="bg-gradient-to-br from-white via-indigo-50/30 to-violet-50/40 rounded-2xl shadow-sm border border-indigo-100/60 p-6"
    >
      <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <BarChart3 size={18} className="text-indigo-500" /> Week Comparison
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-center">
        {/* Last Week */}
        <div className="space-y-1.5">
          <p className="text-[11px] uppercase tracking-wider text-gray-400">
            Last Week
          </p>
          <motion.div
            whileHover={{ scale: 1.1 }}
            className={`w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br ${STRESS_COLORS[lastWeek.stressLevel - 1]} flex items-center justify-center text-white text-xl font-bold shadow-md`}
          >
            {STRESS_EMOJIS[lastWeek.stressLevel - 1]}
          </motion.div>
          <p className="text-xs text-gray-600 font-medium">
            {STRESS_LABELS[lastWeek.stressLevel - 1]}
          </p>
          {lastWeekSibCount > 0 && (
            <p className="text-xs text-gray-400">
              {lastWeekSibCount} sibling(s)
            </p>
          )}
        </div>

        {/* Delta Arrow */}
        <div className="flex flex-col items-center justify-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, delay: 0.3 }}
          >
            <DeltaIcon size={32} className={`${deltaColor} transition-all`} />
          </motion.div>
          <p className={`text-xs font-semibold mt-1 ${deltaColor}`}>
            {deltaLabel}
          </p>
          {stressDelta !== 0 && (
            <p className="text-xs text-gray-400 mt-0.5">
              {Math.abs(stressDelta)} level
              {Math.abs(stressDelta) !== 1 ? "s" : ""}
            </p>
          )}
        </div>

        {/* This Week */}
        <div className="space-y-1.5">
          <p className="text-[11px] uppercase tracking-wider text-gray-400">
            This Week
          </p>
          <motion.div
            whileHover={{ scale: 1.1 }}
            className={`w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br ${STRESS_COLORS[thisWeek.stressLevel - 1]} flex items-center justify-center text-white text-xl font-bold shadow-md`}
          >
            {STRESS_EMOJIS[thisWeek.stressLevel - 1]}
          </motion.div>
          <p className="text-xs text-gray-600 font-medium">
            {STRESS_LABELS[thisWeek.stressLevel - 1]}
          </p>
          {thisWeekSibCount > 0 && (
            <p className="text-xs text-gray-400">
              {thisWeekSibCount} sibling(s)
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
};

// ─── NEW: Sibling Mood Timeline ───
const SiblingMoodTimeline = ({ history, timezone }) => {
  // Build a map of sibling names → array of { week, feeling }
  const siblingMap = useMemo(() => {
    const map = {};
    // Reversed so timeline reads oldest→newest left-to-right
    const entries = [...history].slice(0, 12).reverse();
    entries.forEach((entry) => {
      (entry.siblingEntries || []).forEach((sib) => {
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
  if (!siblingNames.some((name) => siblingMap[name].length >= 2)) return null;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-1 flex items-center gap-2">
        <Users size={18} className="text-emerald-500" /> Sibling Mood Timeline
      </h2>
      <p className="text-xs text-gray-500 mb-4">
        How siblings' feelings have changed over time
      </p>
      <div className="space-y-3">
        {siblingNames.map((name) => {
          const data = siblingMap[name];
          if (data.length < 2) return null;
          return (
            <div
              key={name}
              className="bg-gray-50 rounded-xl p-3 border border-gray-100"
            >
              <p className="text-xs font-semibold text-gray-700 mb-2">{name}</p>
              <div className="flex items-center gap-1 overflow-x-auto pb-1">
                {data.map((d, i) => {
                  const weekLabel = formatWeekDate(d.week, timezone, {
                    month: "narrow",
                    day: "numeric",
                  });
                  return (
                    <div
                      key={i}
                      className="flex flex-col items-center gap-0.5 min-w-[2.5rem]"
                    >
                      <span
                        className="text-lg"
                        title={`${FEELINGS.find((f) => f.key === d.feeling)?.label}: ${weekLabel}`}
                      >
                        {FEELING_EMOJI[d.feeling] || "😐"}
                      </span>
                      <span className="text-[11px] text-gray-400">
                        {weekLabel}
                      </span>
                      {i < data.length - 1 && (
                        <div className="absolute" style={{ display: "none" }} /> // spacing handled by gap
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

// ─── Smart Recommendations ───
const SmartRecommendations = ({ history, analysis, streak }) => {
  const tips = useMemo(() => {
    const result = [];
    if (!history || history.length === 0) return result;

    const recent3 = history.slice(0, 3);
    const avgRecent =
      recent3.reduce((s, h) => s + h.stressLevel, 0) / recent3.length;

    if (avgRecent >= 4) {
      result.push({
        emoji: "🧘",
        title: "High stress detected",
        text: "Your recent stress levels are elevated. Consider trying a 10-minute family relaxation activity like deep breathing or a short walk together.",
        gradient: "from-red-50 to-orange-50",
        border: "border-l-red-400",
      });
    } else if (avgRecent <= 2) {
      result.push({
        emoji: "🎉",
        title: "Great progress!",
        text: "Your family stress has been consistently low. Keep up the positive habits that are working for your family!",
        gradient: "from-emerald-50 to-teal-50",
        border: "border-l-emerald-400",
      });
    }

    if (streak >= 4) {
      result.push({
        emoji: "🔥",
        title: `${streak}-week streak!`,
        text: "Amazing consistency! Regular tracking helps identify patterns faster. Your commitment is making a real difference.",
        gradient: "from-orange-50 to-amber-50",
        border: "border-l-orange-400",
      });
    } else if (streak === 0 && history.length > 0) {
      result.push({
        emoji: "📝",
        title: "Resume your logging",
        text: "Your logging streak has paused. Even a quick 1-minute check-in helps maintain the bigger picture.",
        gradient: "from-amber-50 to-yellow-50",
        border: "border-l-amber-400",
      });
    }

    const recentWithSiblings = history
      .slice(0, 4)
      .filter((h) => h.siblingEntries?.length > 0).length;
    if (recentWithSiblings === 0 && history.length >= 3) {
      result.push({
        emoji: "👥",
        title: "Track sibling feelings",
        text: "You haven't logged sibling emotions recently. Tracking siblings helps paint a fuller picture of the therapy ripple effect.",
        gradient: "from-blue-50 to-indigo-50",
        border: "border-l-blue-400",
      });
    }

    const trend = analysis?.correlation?.trend;
    if (trend === "positive") {
      result.push({
        emoji: "🌟",
        title: "Positive family connection",
        text: "Your family wellbeing is positively connected to therapy progress. The whole family is healing together — keep going!",
        gradient: "from-violet-50 to-purple-50",
        border: "border-l-violet-400",
      });
    } else if (trend === "inverse") {
      result.push({
        emoji: "💪",
        title: "Stay the course",
        text: "Some variability in the data is normal, especially in early therapy stages. Consistency is key — patterns will emerge with more data.",
        gradient: "from-indigo-50 to-blue-50",
        border: "border-l-indigo-400",
      });
    }

    const recentWithNotes = history
      .slice(0, 4)
      .filter((h) => h.notes && h.notes.trim()).length;
    if (recentWithNotes === 0 && history.length >= 3) {
      result.push({
        emoji: "✍️",
        title: "Add weekly notes",
        text: "Adding notes to your logs helps you remember context later. Even a sentence about the week makes progress reports richer.",
        gradient: "from-teal-50 to-cyan-50",
        border: "border-l-teal-400",
      });
    }

    return result.slice(0, 3);
  }, [history, analysis, streak]);

  if (tips.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
    >
      <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <Lightbulb size={18} className="text-amber-500" /> Smart Tips
      </h2>
      <div className="space-y-2.5">
        {tips.map((tip, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -15 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.35, delay: 0.1 * i }}
            className={`rounded-xl border-l-4 p-3.5 bg-gradient-to-r ${tip.gradient} ${tip.border}`}
          >
            <div className="flex items-start gap-2.5">
              <span className="text-xl flex-shrink-0 mt-0.5">{tip.emoji}</span>
              <div>
                <p className="text-sm font-semibold text-gray-800">
                  {tip.title}
                </p>
                <p className="text-xs text-gray-600 leading-relaxed mt-0.5">
                  {tip.text}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

const StabilityCard = ({ stability }) => {
  if (!stability) return null;

  const label = stability.label || "Insufficient data";
  const stdDev = stability.stressStdDev;
  const toneClass =
    label === "Stable"
      ? "text-emerald-700 bg-emerald-50 border-emerald-200"
      : label === "Mixed"
        ? "text-amber-700 bg-amber-50 border-amber-200"
        : "text-rose-700 bg-rose-50 border-rose-200";

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
        <Activity size={18} className="text-emerald-500" /> Family Stability
      </h2>
      <div className="flex items-center gap-3 flex-wrap">
        <span
          className={`inline-flex px-2.5 py-1 rounded-full border text-xs font-semibold ${toneClass}`}
        >
          {label}
        </span>
        <span className="text-xs text-gray-500">
          {stability.sampleSize || 0} week samples
        </span>
      </div>
      <p className="mt-3 text-sm text-gray-700">
        Stress volatility (std. dev):{" "}
        <strong>
          {stdDev !== null && stdDev !== undefined ? stdDev : "N/A"}
        </strong>
      </p>
      <p className="text-xs text-gray-500 mt-1">
        Lower volatility usually means the home environment is more predictable
        week to week.
      </p>
    </div>
  );
};

const LagInsightCard = ({ lagAnalysis }) => {
  if (!lagAnalysis) return null;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between gap-3 flex-wrap mb-2">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <BarChart3 size={18} className="text-indigo-500" /> Delayed Ripple
          (1-week)
        </h2>
        <div className="flex items-center gap-2 flex-wrap">
          <TrendBadge trend={lagAnalysis.trend || "insufficient_data"} />
          <ConfidenceBadge confidence={lagAnalysis.confidence} />
        </div>
      </div>
      <p className="text-sm text-gray-700">{lagAnalysis.insight}</p>
      <div className="mt-3 text-xs text-gray-500 flex items-center gap-3 flex-wrap">
        {lagAnalysis.value !== null && lagAnalysis.value !== undefined && (
          <span className="font-mono bg-gray-50 border border-gray-200 rounded px-2 py-1">
            lag r = {lagAnalysis.value}
          </span>
        )}
        <span>
          {lagAnalysis.dataPoints || 0} lag data point
          {(lagAnalysis.dataPoints || 0) !== 1 ? "s" : ""}
        </span>
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
  const [notes, setNotes] = useState("");

  // Data state
  const [analysis, setAnalysis] = useState(null);
  const [history, setHistory] = useState([]);
  const [fetchError, setFetchError] = useState("");

  // Expanded log tracking
  const [expandedLogIdx, setExpandedLogIdx] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setFetchError("");
      const [analysisRes, historyRes] = await Promise.all([
        api.get("/family-wellbeing/ripple-analysis"),
        api.get("/family-wellbeing/history"),
      ]);
      if (analysisRes.data.success) setAnalysis(analysisRes.data.data);
      if (historyRes.data.success) setHistory(historyRes.data.data);
    } catch (err) {
      console.error("Failed to fetch ripple data:", err);
      setFetchError("Unable to load Therapy Ripple right now. Please retry.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

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
      expectedWeek.setDate(expectedWeek.getDate() - i * 7);
      // Get Monday of expected week
      const day = expectedWeek.getDay();
      const diff = expectedWeek.getDate() - day + (day === 0 ? -6 : 1);
      expectedWeek.setDate(diff);
      expectedWeek.setHours(0, 0, 0, 0);
      entryDate.setHours(0, 0, 0, 0);

      // Allow up to 2 days tolerance
      const daysDiff = Math.abs(
        (entryDate.getTime() - expectedWeek.getTime()) / (1000 * 60 * 60 * 24),
      );
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
  const addSibling = () =>
    setSiblingEntries([
      ...siblingEntries,
      { name: "", feeling: "neutral", note: "" },
    ]);
  const removeSibling = (idx) =>
    setSiblingEntries(siblingEntries.filter((_, i) => i !== idx));
  const updateSibling = (idx, field, value) => {
    const updated = [...siblingEntries];
    updated[idx] = { ...updated[idx], [field]: value };
    setSiblingEntries(updated);
  };

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      const validSiblings = siblingEntries.filter((s) => s.name.trim());
      const res = await api.post("/family-wellbeing/log", {
        stressLevel,
        siblingEntries: validSiblings,
        notes,
        weekStart: getCurrentWeekStartIsoUtc(),
      });
      if (res.data.success) {
        toast.success("Weekly wellbeing logged! 🌊");
        setNotes("");
        fetchData();
      }
    } catch (err) {
      const msg = err.response?.data?.error?.message || "Failed to save";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  // PDF download handler
  const handleDownloadPdf = async () => {
    try {
      setDownloadingPdf(true);
      const response = await api.get("/family-wellbeing/progress-pdf", {
        responseType: "blob",
        timeout: 30000,
      });
      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `TherapyRipple_Progress_${new Date().toISOString().slice(0, 10)}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success("Progress report downloaded! 📄");
    } catch (err) {
      console.error("PDF download failed:", err);
      toast.error("Failed to download progress report");
    } finally {
      setDownloadingPdf(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-4"
        >
          <div className="relative w-20 h-20">
            <div className="absolute inset-0 border-4 border-violet-100 rounded-full" />
            <div className="absolute inset-0 border-4 border-transparent border-t-violet-600 rounded-full animate-spin" />
            <div
              className="absolute inset-3 border-4 border-transparent border-t-indigo-400 rounded-full animate-spin"
              style={{
                animationDirection: "reverse",
                animationDuration: "1.5s",
              }}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <Waves size={20} className="text-violet-500" />
            </div>
          </div>
          <p className="text-sm text-gray-500 font-medium">
            Loading family wellness data…
          </p>
        </motion.div>
      </div>
    );
  }

  if (fetchError && !analysis && history.length === 0) {
    return (
      <div className="max-w-xl mx-auto mt-12 bg-white border border-red-100 rounded-2xl p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 mb-2">
          Could not load Therapy Ripple
        </h2>
        <p className="text-sm text-gray-600 mb-4">{fetchError}</p>
        <button
          onClick={fetchData}
          className="inline-flex items-center px-4 py-2 rounded-lg bg-red-50 text-red-700 border border-red-200 text-sm font-semibold hover:bg-red-100 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  const stressData = history
    .map((h) => h.stressLevel)
    .reverse()
    .slice(0, 12)
    .reverse();
  const {
    rippleScores,
    correlation,
    lagAnalysis,
    stability,
    timezone,
    totalLogs,
    totalSessions,
  } = analysis || {};
  const activeTimezone = timezone || APP_TIMEZONE_FALLBACK;

  // Computed summary stats
  const avgStress =
    history.length > 0
      ? (
          history.reduce((s, h) => s + h.stressLevel, 0) / history.length
        ).toFixed(1)
      : "—";
  const bestWeek =
    history.length > 0
      ? history.reduce(
          (best, h) => (h.stressLevel < best.stressLevel ? h : best),
          history[0],
        )
      : null;
  const bestWeekLabel = bestWeek
    ? formatWeekDate(bestWeek.weekStart, activeTimezone, {
        month: "short",
        day: "numeric",
      })
    : "—";
  const improvementText = (() => {
    if (history.length < 4) return null;
    const recent3 = history.slice(0, 3);
    const oldest3 = history.slice(-3);
    const recentAvg = recent3.reduce((s, h) => s + h.stressLevel, 0) / 3;
    const oldAvg = oldest3.reduce((s, h) => s + h.stressLevel, 0) / 3;
    const diff = oldAvg - recentAvg;
    if (diff > 0.3) return `↓ ${diff.toFixed(1)} improvement`;
    if (diff < -0.3) return `↑ ${Math.abs(diff).toFixed(1)} increase`;
    return "Steady";
  })();

  // Empty / onboarding state
  if (!analysis && history.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-2xl mx-auto py-16 text-center space-y-6"
      >
        <div className="w-20 h-20 mx-auto bg-violet-100 rounded-full flex items-center justify-center">
          <Waves size={36} className="text-violet-500" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome to Therapy Ripple
        </h1>
        <p className="text-gray-500 max-w-md mx-auto leading-relaxed">
          Track how therapy creates a ripple of wellbeing across your entire
          family. Start by logging your first weekly check-in below — it only
          takes a minute!
        </p>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 text-left max-w-lg mx-auto space-y-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-violet-100 flex items-center justify-center text-violet-600 font-bold text-sm flex-shrink-0">
              1
            </div>
            <p className="text-sm text-gray-600">
              Rate your <strong>family stress level</strong> for this week
            </p>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-violet-100 flex items-center justify-center text-violet-600 font-bold text-sm flex-shrink-0">
              2
            </div>
            <p className="text-sm text-gray-600">
              Optionally log <strong>sibling feelings</strong> to track the
              broader impact
            </p>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-violet-100 flex items-center justify-center text-violet-600 font-bold text-sm flex-shrink-0">
              3
            </div>
            <p className="text-sm text-gray-600">
              Watch the <strong>ripple visualization</strong> grow as you log
              each week
            </p>
          </div>
        </div>
        <p className="text-xs text-gray-400">
          Scroll down to fill out your first log ↓
        </p>

        <div className="mt-8 max-w-lg mx-auto">
          <FormCard
            stressLevel={stressLevel}
            setStressLevel={setStressLevel}
            showSiblings={showSiblings}
            setShowSiblings={setShowSiblings}
            siblingEntries={siblingEntries}
            addSibling={addSibling}
            removeSibling={removeSibling}
            updateSibling={updateSibling}
            setSiblingEntries={setSiblingEntries}
            notes={notes}
            setNotes={setNotes}
            submitting={submitting}
            handleSubmit={handleSubmit}
            history={history}
          />
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="max-w-5xl mx-auto space-y-8 pb-12"
    >
      {fetchError && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 text-amber-800 px-4 py-3 text-sm">
          {fetchError}
        </div>
      )}

      {/* ─── Header ─── */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 text-white p-6 lg:p-8 shadow-xl"
      >
        {/* Animated background orbs */}
        <div
          className="absolute -top-16 -right-16 w-56 h-56 bg-white/10 rounded-full blur-3xl animate-pulse"
          style={{ animationDuration: "4s" }}
        />
        <div
          className="absolute -bottom-12 -left-12 w-40 h-40 bg-indigo-400/15 rounded-full blur-2xl animate-pulse"
          style={{ animationDuration: "5s", animationDelay: "1s" }}
        />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-400/5 rounded-full blur-3xl" />
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-start lg:justify-between gap-5">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-white/15 backdrop-blur-sm flex items-center justify-center border border-white/20">
                <Waves size={22} />
              </div>
              <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">
                Therapy Ripple
              </h1>
            </div>
            <p className="text-violet-100 text-sm lg:text-base max-w-lg leading-relaxed">
              Track how therapy creates a ripple of wellbeing across your entire
              family — not just the child.
            </p>

            <div className="mt-5 flex items-center gap-3 flex-wrap">
              {/* Streak Badge */}
              {streak > 0 && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, delay: 0.3 }}
                  className={`flex items-center gap-1.5 bg-white/15 backdrop-blur-md rounded-xl px-4 py-2.5 border border-white/20 ${isMilestone ? "ring-2 ring-orange-300/50 ring-offset-1 ring-offset-transparent" : ""}`}
                >
                  <Flame size={18} className="text-orange-300" />
                  <span className="text-lg font-bold">{streak}</span>
                  <span className="text-[11px] text-violet-200">
                    week{streak !== 1 ? "s" : ""}
                  </span>
                  {isMilestone && <span className="text-xs ml-0.5">🎉</span>}
                </motion.div>
              )}

              {/* PDF Download Button */}
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleDownloadPdf}
                disabled={downloadingPdf}
                className="flex items-center gap-2 bg-white/15 hover:bg-white/25 backdrop-blur-md rounded-xl px-4 py-2.5 border border-white/20 transition-all duration-200 text-sm font-semibold disabled:opacity-60"
                title="Download progress report as PDF"
              >
                {downloadingPdf ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Download size={16} />
                )}
                <span>{downloadingPdf ? "Generating…" : "Download PDF"}</span>
              </motion.button>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-4 bg-white/10 backdrop-blur-md rounded-xl px-5 py-3 border border-white/20 self-start">
            <div className="text-center">
              <p className="text-2xl font-bold">{totalLogs || 0}</p>
              <p className="text-[11px] uppercase tracking-wider text-violet-200">
                Logs
              </p>
            </div>
            <div className="w-px h-8 bg-white/20" />
            <div className="text-center">
              <p className="text-2xl font-bold">{totalSessions || 0}</p>
              <p className="text-[11px] uppercase tracking-wider text-violet-200">
                Sessions
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ─── Summary Stat Cards ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-3">
        <StatCard
          icon={Activity}
          label="Avg Stress"
          value={avgStress}
          color="bg-gradient-to-br from-violet-500 to-purple-600"
          delay={0}
        />
        <StatCard
          icon={Award}
          label="Best Week"
          value={bestWeekLabel}
          color="bg-gradient-to-br from-emerald-500 to-teal-600"
          delay={0.05}
          subtext={
            bestWeek
              ? `Stress: ${STRESS_LABELS[bestWeek.stressLevel - 1]}`
              : undefined
          }
        />
        <StatCard
          icon={FileText}
          label="Total Logs"
          value={String(totalLogs || 0)}
          color="bg-gradient-to-br from-blue-500 to-indigo-600"
          delay={0.1}
        />
        <StatCard
          icon={TrendingUp}
          label="Trend"
          value={improvementText || "Gathering…"}
          color="bg-gradient-to-br from-amber-500 to-orange-600"
          delay={0.15}
        />
        <StatCard
          icon={Flame}
          label="Streak"
          value={
            streak > 0
              ? `${streak} week${streak !== 1 ? "s" : ""}`
              : "Start now!"
          }
          color="bg-gradient-to-br from-red-500 to-orange-500"
          delay={0.2}
          subtext={
            isMilestone
              ? "🎉 Milestone!"
              : streak > 0
                ? "Keep going!"
                : undefined
          }
        />
      </div>

      {/* ─── Two-Column Layout ─── */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* ─── Left: Ripple Visualization + Insights + New Features ─── */}
        <div className="space-y-6">
          {/* Ripple Visualization */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-1 flex items-center gap-2">
              <Heart size={18} className="text-violet-500" /> Family Ripple
              Effect
            </h2>
            <p className="text-xs text-gray-500 mb-4">
              Based on last 4 weeks of data
            </p>
            <RippleVisualization scores={rippleScores} />
            <p className="text-xs text-gray-400 mt-3">
              Week boundaries normalized to {activeTimezone}.
            </p>
          </div>

          {/* Correlation Insight Card */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-gradient-to-br from-indigo-50 via-violet-50 to-purple-50 rounded-2xl shadow-sm border border-indigo-100 p-6"
          >
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Brain size={18} className="text-indigo-500" /> Pattern Insight
              </h2>
              <div className="flex items-center gap-2 flex-wrap justify-end">
                <TrendBadge trend={correlation?.trend || "insufficient_data"} />
                <ConfidenceBadge confidence={correlation?.confidence} />
              </div>
            </div>
            <p className="text-sm text-gray-700 leading-relaxed">
              {correlation?.insight}
            </p>
            <div className="mt-4 flex items-center gap-3 text-xs text-gray-500 flex-wrap">
              {correlation?.value !== null &&
                correlation?.value !== undefined && (
                  <span className="font-mono bg-white/70 px-2 py-1 rounded border border-indigo-100">
                    r = {correlation.value}
                  </span>
                )}
              <span>
                {correlation?.dataPoints || 0} data point
                {(correlation?.dataPoints || 0) !== 1 ? "s" : ""}
              </span>
              <span className="text-gray-400">
                Pattern guidance only, not a diagnosis.
              </span>
            </div>
          </motion.div>

          <LagInsightCard lagAnalysis={lagAnalysis} />

          <StabilityCard stability={stability} />

          {/* Stress Trend Sparkline */}
          {stressData.length >= 2 && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <BarChart3 size={18} className="text-purple-500" /> Stress Trend
              </h2>
              <Sparkline data={stressData} color="#8b5cf6" height={56} />
              <div className="flex justify-between text-[11px] text-gray-400 mt-1">
                <span>Oldest</span>
                <span>This Week</span>
              </div>
            </div>
          )}

          {/* NEW: Stress Heatmap Calendar */}
          <StressHeatmap history={history} timezone={activeTimezone} />

          {/* NEW: Sibling Mood Timeline */}
          <SiblingMoodTimeline history={history} timezone={activeTimezone} />
        </div>

        {/* ─── Right: Form + Comparison + Tips + Logs ─── */}
        <div className="space-y-6">
          {/* NEW: Week-over-Week Comparison */}
          <WeekComparison history={history} />

          <FormCard
            stressLevel={stressLevel}
            setStressLevel={setStressLevel}
            showSiblings={showSiblings}
            setShowSiblings={setShowSiblings}
            siblingEntries={siblingEntries}
            addSibling={addSibling}
            removeSibling={removeSibling}
            updateSibling={updateSibling}
            setSiblingEntries={setSiblingEntries}
            notes={notes}
            setNotes={setNotes}
            submitting={submitting}
            handleSubmit={handleSubmit}
            history={history}
          />

          {/* NEW: Smart Recommendations */}
          <SmartRecommendations
            history={history}
            analysis={analysis}
            streak={streak}
          />

          {/* Recent Logs — Expandable */}
          {history.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Sparkles size={18} className="text-amber-500" /> Recent Logs
                </h2>
                <span className="text-xs text-gray-400">
                  {history.length} total
                </span>
              </div>
              <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
                {history.slice(0, 12).map((entry, idx) => {
                  const d = new Date(entry.weekStart);
                  const weekLabel = formatWeekDate(d, activeTimezone, {
                    month: "short",
                    day: "numeric",
                  });
                  const isExpanded = expandedLogIdx === idx;
                  return (
                    <div key={idx} className="group">
                      <motion.button
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        onClick={() =>
                          setExpandedLogIdx(isExpanded ? null : idx)
                        }
                        className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all duration-200 text-left ${
                          isExpanded
                            ? "bg-violet-50 border-violet-200 shadow-sm"
                            : "bg-gray-50 border-gray-100 hover:bg-gray-100"
                        }`}
                      >
                        <span className="text-2xl">
                          {STRESS_EMOJIS[entry.stressLevel - 1]}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-800">
                            Week of {weekLabel}
                          </p>
                          <p className="text-xs text-gray-500 truncate">
                            Stress: {STRESS_LABELS[entry.stressLevel - 1]}
                            {entry.siblingEntries?.length > 0 &&
                              ` • ${entry.siblingEntries.length} sibling(s)`}
                          </p>
                        </div>
                        <div
                          className={`w-8 h-8 rounded-lg bg-gradient-to-br ${STRESS_COLORS[entry.stressLevel - 1]} flex items-center justify-center text-white text-xs font-bold shadow-sm`}
                        >
                          {entry.stressLevel}
                        </div>
                        <ChevronDown
                          size={14}
                          className={`text-gray-400 transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`}
                        />
                      </motion.button>

                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="mt-1 mx-2 p-3 bg-white rounded-lg border border-violet-100 space-y-2">
                              {entry.notes && (
                                <div>
                                  <p className="text-[11px] uppercase tracking-wider text-gray-400 mb-0.5">
                                    Notes
                                  </p>
                                  <p className="text-sm text-gray-700">
                                    {entry.notes}
                                  </p>
                                </div>
                              )}
                              {entry.siblingEntries?.length > 0 && (
                                <div>
                                  <p className="text-[11px] uppercase tracking-wider text-gray-400 mb-1">
                                    Sibling Feelings
                                  </p>
                                  <div className="flex flex-wrap gap-1.5">
                                    {entry.siblingEntries.map((sib, si) => (
                                      <span
                                        key={si}
                                        className="inline-flex items-center gap-1 px-2 py-1 bg-gray-50 rounded-md border border-gray-100 text-xs text-gray-700"
                                      >
                                        {FEELING_EMOJI[sib.feeling] || "😐"}{" "}
                                        <strong>{sib.name}</strong>:{" "}
                                        {FEELINGS.find(
                                          (f) => f.key === sib.feeling,
                                        )?.label || sib.feeling}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}
                              {!entry.notes &&
                                (!entry.siblingEntries ||
                                  entry.siblingEntries.length === 0) && (
                                  <p className="text-xs text-gray-400 italic">
                                    No additional details for this log.
                                  </p>
                                )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

// ─── Extracted Weekly Check-in Form ───
const FormCard = ({
  stressLevel,
  setStressLevel,
  showSiblings,
  setShowSiblings,
  siblingEntries,
  addSibling,
  removeSibling,
  updateSibling,
  setSiblingEntries,
  notes,
  setNotes,
  submitting,
  handleSubmit,
  history,
}) => {
  const [step, setStep] = useState(1);
  const [touchedStep, setTouchedStep] = useState(false);

  const handleCopyLastWeek = () => {
    if (history && history.length > 0) {
      const lastWeek = history[0]; // Assuming history[0] is the most recent past week
      if (lastWeek.siblingEntries && lastWeek.siblingEntries.length > 0) {
        const copied = lastWeek.siblingEntries.map((s) => ({
          name: s.name,
          feeling: s.feeling,
          note: s.note || "",
        }));
        // Only overwrite if current entries are empty or exact default
        setSiblingEntries(copied);
        setShowSiblings(true);
        toast.info("Copied siblings from last week! 👯‍♀️");
      } else {
        toast.error("No siblings logged last week.");
      }
    }
  };

  const hasPastSiblings =
    history &&
    history.length > 0 &&
    history[0].siblingEntries &&
    history[0].siblingEntries.length > 0;

  const stepTitle =
    step === 1
      ? "Step 1: Family stress"
      : step === 2
        ? "Step 2: Sibling pulse"
        : "Step 3: Weekly context";

  const stepDesc =
    step === 1
      ? "How intense was the week for your family?"
      : step === 2
        ? "Optionally add sibling emotional snapshots."
        : "Capture context and submit this week's check-in.";

  const siblingCount = siblingEntries.filter((s) => s.name.trim()).length;
  const notesLength = notes.trim().length;
  const canContinueStep1 = stressLevel >= 1 && stressLevel <= 5;
  const canSubmit = !submitting;

  const goToStep = (nextStep) => {
    setStep(nextStep);
    setTouchedStep(true);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-1 flex items-center gap-2">
        <Calendar size={18} className="text-teal-500" /> Weekly Check-in
      </h2>
      <p className="text-xs text-gray-500 mb-3">Guided 3-step weekly ritual</p>

      <div className="flex items-center gap-2 mb-5">
        {[1, 2, 3].map((num) => (
          <button
            key={num}
            type="button"
            onClick={() => goToStep(num)}
            className={`h-9 w-9 rounded-full text-xs font-bold border transition-colors ${step === num ? "bg-violet-600 text-white border-violet-600" : "bg-white text-gray-500 border-gray-200 hover:border-violet-300"}`}
            aria-label={`Go to step ${num}`}
          >
            {num}
          </button>
        ))}
        <div className="ml-1">
          <p className="text-sm font-semibold text-gray-800">{stepTitle}</p>
          <p className="text-xs text-gray-500">{stepDesc}</p>
        </div>
      </div>

      <div className="w-full h-1.5 bg-gray-100 rounded-full mb-5 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-violet-500 to-indigo-500 rounded-full transition-all duration-300"
          style={{ width: `${(step / 3) * 100}%` }}
        />
      </div>

      {/* Stress Level Selector */}
      {step === 1 && (
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Your Stress Level
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-5 items-stretch gap-2">
            {[1, 2, 3, 4, 5].map((level) => (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                key={level}
                onClick={() => setStressLevel(level)}
                className={`flex-1 flex flex-col items-center gap-1.5 py-3 rounded-xl border-2 transition-all duration-200 ${
                  stressLevel === level
                    ? `bg-gradient-to-b ${STRESS_COLORS[level - 1]} text-white border-transparent shadow-lg`
                    : "bg-white border-gray-200 hover:border-gray-300 text-gray-600"
                }`}
              >
                <span className="text-2xl">{STRESS_EMOJIS[level - 1]}</span>
                <span className="text-[11px] font-semibold leading-tight px-1 text-center">
                  {STRESS_LABELS[level - 1]}
                </span>
              </motion.button>
            ))}
          </div>
          {touchedStep && !canContinueStep1 && (
            <p className="text-xs text-amber-600 mt-2">
              Please choose a stress level to continue.
            </p>
          )}
        </div>
      )}

      {step === 2 && (
        <div className="mb-6">
          <div className="flex items-center justify-between w-full mb-3">
            <button
              type="button"
              onClick={() => setShowSiblings(!showSiblings)}
              className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-violet-600 transition-colors"
            >
              <Users size={16} />
              <span>Sibling Feelings</span>
              <span className="text-[11px] text-gray-400 ml-1">(optional)</span>
              {showSiblings ? (
                <ChevronUp size={16} />
              ) : (
                <ChevronDown size={16} />
              )}
            </button>
            {hasPastSiblings && showSiblings && (
              <button
                type="button"
                onClick={handleCopyLastWeek}
                className="text-xs text-violet-600 font-medium hover:text-violet-700 bg-violet-50 px-2.5 py-1 rounded border border-violet-100 transition-colors"
              >
                Copy last week
              </button>
            )}
          </div>

          <AnimatePresence>
            {showSiblings && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-3 overflow-hidden"
              >
                <AnimatePresence>
                  {siblingEntries.map((entry, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="bg-gray-50 rounded-xl p-4 border border-gray-100 relative"
                    >
                      <button
                        type="button"
                        onClick={() => removeSibling(idx)}
                        aria-label={`Remove sibling ${idx + 1}`}
                        className="absolute top-2 right-2 text-gray-300 hover:text-red-400 transition-colors"
                      >
                        <X size={14} />
                      </button>
                      <input
                        type="text"
                        placeholder="Sibling's name"
                        value={entry.name}
                        onChange={(e) =>
                          updateSibling(idx, "name", e.target.value)
                        }
                        className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm mb-3 focus:ring-2 focus:ring-violet-300 focus:border-violet-400 outline-none"
                      />
                      <div className="flex flex-wrap gap-1.5">
                        {FEELINGS.map((f) => {
                          const FIcon = f.icon;
                          return (
                            <button
                              type="button"
                              key={f.key}
                              onClick={() =>
                                updateSibling(idx, "feeling", f.key)
                              }
                              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-all ${
                                entry.feeling === f.key
                                  ? `${f.bg} ${f.color} ${f.border} ring-2 ${f.ring} ring-offset-1`
                                  : "bg-white text-gray-500 border-gray-200 hover:bg-gray-50"
                              }`}
                            >
                              <FIcon size={13} /> {f.label}
                            </button>
                          );
                        })}
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
                <button
                  type="button"
                  onClick={addSibling}
                  className="flex items-center gap-1.5 text-sm text-violet-600 hover:text-violet-700 font-medium pt-1"
                >
                  <Plus size={15} /> Add Sibling
                </button>
              </motion.div>
            )}
          </AnimatePresence>
          {!showSiblings && (
            <p className="text-xs text-gray-500">
              Keep this off for a quick check-in, or open it when sibling
              emotions changed this week.
            </p>
          )}
        </div>
      )}

      {/* Notes */}
      {step === 3 && (
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Notes <span className="text-gray-400 font-normal">(optional)</span>
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="How was your week overall? Any observations about the family…"
            rows={3}
            maxLength={1000}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-violet-300 focus:border-violet-400 outline-none resize-none"
          />
          <p className="mt-1 text-[11px] text-gray-400 text-right">
            {notesLength}/1000
          </p>
        </div>
      )}

      <div className="mb-5 rounded-xl border border-gray-100 bg-gray-50 px-3 py-2">
        <p className="text-xs text-gray-500">Preview</p>
        <p className="text-sm text-gray-700 mt-1">
          Stress: <strong>{STRESS_LABELS[stressLevel - 1]}</strong> • Siblings
          logged: <strong>{siblingCount}</strong>
        </p>
      </div>

      <div className="flex items-center gap-3">
        {step > 1 && (
          <button
            type="button"
            onClick={() => goToStep(step - 1)}
            className="flex-1 border border-gray-200 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
          >
            Back
          </button>
        )}

        {step < 3 ? (
          <button
            type="button"
            onClick={() => goToStep(step + 1)}
            disabled={step === 1 && !canContinueStep1}
            className="flex-1 bg-gradient-to-r from-violet-600 to-indigo-600 text-white py-3 rounded-xl font-semibold hover:from-violet-700 hover:to-indigo-700 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
          >
            Continue
          </button>
        ) : (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSubmit}
            disabled={!canSubmit}
            className="flex-1 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white font-semibold py-3 rounded-xl shadow-lg shadow-violet-200 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {submitting ? (
              <div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <Send size={16} /> Log This Week
              </>
            )}
          </motion.button>
        )}
      </div>
    </div>
  );
};

export default TherapyRipple;
