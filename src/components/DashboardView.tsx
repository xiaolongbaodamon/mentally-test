import React, { useState, useEffect } from "react";
import { 
  Sparkles, 
  Wind, 
  Compass, 
  BookOpen, 
  Volume2, 
  ArrowRight, 
  Smile, 
  Heart, 
  Calendar,
  Flame,
  CheckCircle2,
  RefreshCw,
  Megaphone,
  Building2,
  GraduationCap,
  Zap,
  Settings,
  BrainCircuit,
  Moon,
  ClipboardCheck,
  TrendingUp,
  Activity
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import type { User } from "firebase/auth";
import { MoodEntry, JournalEntry, AIRecommendation, CampusAnnouncement, UserProfileData } from "../types";
import { DAILY_AFFIRMATIONS } from "../data/wellnessContent";

interface DashboardViewProps {
  moods: MoodEntry[];
  journals: JournalEntry[];
  streakDays: number;
  onNavigateTab: (tab: "mood" | "mood_records" | "journal" | "activities" | "ai" | "reports" | "cbt" | "sleep" | "screener" | "directory", subTab?: string) => void;
  onQuickLogMood: () => void;
  isMobileFrame?: boolean;
  announcements?: CampusAnnouncement[];
  currentProfile?: UserProfileData | null;
  currentUser?: User | null;
  onOpenAccountSettings?: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  moods,
  journals,
  streakDays,
  onNavigateTab,
  onQuickLogMood,
  isMobileFrame = false,
  announcements = [],
  currentProfile,
  currentUser,
  onOpenAccountSettings,
}) => {
  const [affirmation, setAffirmation] = useState(DAILY_AFFIRMATIONS[0]);
  const [quickLogged, setQuickLogged] = useState(false);

  // Active campus announcements from Firestore
  const activeAnnouncements = announcements.filter((a) => a.active);

  // Pick affirmation
  useEffect(() => {
    const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 1000 / 60 / 60 / 24);
    setAffirmation(DAILY_AFFIRMATIONS[dayOfYear % DAILY_AFFIRMATIONS.length]);
  }, []);

  const latestMood = moods[0];
  const averageScore = moods.length
    ? (moods.reduce((acc, m) => acc + m.score, 0) / moods.length).toFixed(1)
    : "7.0";

  return (
    <div id="dashboard-view-container" className="space-y-4">
      {/* Student Welcome & Live State Telemetry */}
      {currentUser && (
        <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-700 text-white font-black text-sm flex items-center justify-center shrink-0 shadow-xs">
              {(currentProfile?.displayName || currentUser.displayName || currentUser.email || "S").charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base font-black text-slate-900 leading-tight">
                  {currentProfile?.displayName || currentUser.displayName || "PTC Student"}
                </h2>
                <span className="inline-flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                  Live Synced
                </span>
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-500 font-medium mt-0.5 flex-wrap">
                <span className="flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5 text-slate-400" />
                  {currentProfile?.institution || "Pateros Technological College"}
                </span>
                {currentProfile?.course && (
                  <span className="flex items-center gap-1">
                    <GraduationCap className="w-3.5 h-3.5 text-slate-400" />
                    {currentProfile.course} {currentProfile.yearLevel ? `• ${currentProfile.yearLevel}` : ""}
                  </span>
                )}
              </div>
            </div>
          </div>

          {onOpenAccountSettings && (
            <button
              id="dashboard-open-account-settings-btn"
              onClick={onOpenAccountSettings}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 hover:border-teal-400 bg-slate-50 hover:bg-teal-50 text-slate-700 hover:text-teal-800 font-bold text-xs transition-all shrink-0 active:scale-95"
            >
              <Settings className="w-3.5 h-3.5" />
              <span>Edit Account</span>
            </button>
          )}
        </div>
      )}

      {/* Live Campus Guidance Announcements (Auto Real-Time Listeners) */}
      {activeAnnouncements.length > 0 && (
        <div className="space-y-2">
          {activeAnnouncements.slice(0, 2).map((ann) => (
            <motion.div
              key={ann.id}
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-3.5 rounded-xl border transition-all shadow-xs flex items-start gap-3 ${
                ann.priority === "urgent"
                  ? "bg-rose-50/90 border-rose-200 text-rose-950"
                  : ann.priority === "important"
                  ? "bg-amber-50/90 border-amber-200 text-amber-950"
                  : "bg-teal-50/90 border-teal-200 text-teal-950"
              }`}
            >
              <div className={`p-1.5 rounded-lg shrink-0 ${
                ann.priority === "urgent" ? "bg-rose-600 text-white" : ann.priority === "important" ? "bg-amber-600 text-white" : "bg-teal-700 text-white"
              }`}>
                <Megaphone className="w-3.5 h-3.5" />
              </div>

              <div className="space-y-0.5 min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-white/80 border border-current/20">
                      {ann.author}
                    </span>
                    <h3 className="font-bold text-xs sm:text-sm">{ann.title}</h3>
                  </div>
                  <span className="text-[10px] opacity-75 font-mono">
                    {new Date(ann.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                  </span>
                </div>
                <p className="text-xs leading-relaxed opacity-90">{ann.content}</p>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Hero Affirmation & Live Metrics Strip */}
      <div className="bg-gradient-to-br from-teal-800 via-teal-900 to-slate-900 rounded-2xl p-5 sm:p-6 text-white relative overflow-hidden shadow-sm">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-2 max-w-xl">
            <span className="text-[10px] font-black uppercase tracking-widest text-teal-300 px-2 py-0.5 rounded-full bg-teal-700/50 border border-teal-500/30 inline-block">
              Daily Anchor
            </span>
            <blockquote className="text-base sm:text-lg font-bold leading-snug text-teal-50">
              "{affirmation}"
            </blockquote>
          </div>

          {/* Quick Metrics Pills */}
          <div className="flex items-center gap-2 w-full md:w-auto shrink-0">
            <div className="flex-1 md:flex-none p-3 rounded-xl bg-white/10 backdrop-blur-md border border-white/15 text-center min-w-[80px]">
              <span className="text-[10px] uppercase font-bold text-teal-200 block">Streak</span>
              <span className="text-base font-black font-mono">{streakDays}d</span>
            </div>
            <div className="flex-1 md:flex-none p-3 rounded-xl bg-white/10 backdrop-blur-md border border-white/15 text-center min-w-[80px]">
              <span className="text-[10px] uppercase font-bold text-teal-200 block">Avg Mood</span>
              <span className="text-base font-black font-mono">{averageScore}</span>
            </div>
            <div className="flex-1 md:flex-none p-3 rounded-xl bg-white/10 backdrop-blur-md border border-white/15 text-center min-w-[80px]">
              <span className="text-[10px] uppercase font-bold text-teal-200 block">Journals</span>
              <span className="text-base font-black font-mono">{journals.length}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Mood Pulse Check-In */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center shrink-0">
            <Heart className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-bold text-slate-900">
              {latestMood ? `Latest Check-in: ${latestMood.score}/10 — ${latestMood.label}` : "Ready for today's check-in?"}
            </h3>
            <p className="text-[11px] text-slate-400 font-medium">Log your current psychological valence</p>
          </div>
        </div>

        <button
          onClick={onQuickLogMood}
          className="flex items-center gap-1.5 px-4 py-2 bg-teal-700 hover:bg-teal-800 active:scale-95 text-white font-bold text-xs rounded-xl shadow-xs transition-all w-full sm:w-auto justify-center min-h-[36px]"
        >
          <span>Record Mood</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Clinical Workspace Shortcuts Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Journal */}
        <button
          onClick={() => onNavigateTab("journal")}
          className="p-4 rounded-xl border border-slate-200 hover:border-teal-400 bg-white hover:bg-teal-50/40 text-left transition-all group shadow-2xs"
        >
          <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
            <BookOpen className="w-4 h-4" />
          </div>
          <h4 className="text-xs font-bold text-slate-900 group-hover:text-teal-800">Journal</h4>
          <span className="text-[10px] text-slate-400 font-mono mt-0.5 block">{journals.length} Saved</span>
        </button>

        {/* Breathing */}
        <button
          onClick={() => onNavigateTab("activities", "breathing")}
          className="p-4 rounded-xl border border-slate-200 hover:border-teal-400 bg-white hover:bg-teal-50/40 text-left transition-all group shadow-2xs"
        >
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
            <Wind className="w-4 h-4" />
          </div>
          <h4 className="text-xs font-bold text-slate-900 group-hover:text-teal-800">Breath Pacer</h4>
          <span className="text-[10px] text-slate-400 font-mono mt-0.5 block">Box & 4-7-8</span>
        </button>

        {/* CBT Restructuring */}
        <button
          onClick={() => onNavigateTab("cbt" as any)}
          className="p-4 rounded-xl border border-slate-200 hover:border-teal-400 bg-white hover:bg-teal-50/40 text-left transition-all group shadow-2xs"
        >
          <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
            <BrainCircuit className="w-4 h-4" />
          </div>
          <h4 className="text-xs font-bold text-slate-900 group-hover:text-teal-800">CBT Reframe</h4>
          <span className="text-[10px] text-slate-400 font-mono mt-0.5 block">Thought Logs</span>
        </button>

        {/* Psychometric Screener */}
        <button
          onClick={() => onNavigateTab("screener" as any)}
          className="p-4 rounded-xl border border-slate-200 hover:border-teal-400 bg-white hover:bg-teal-50/40 text-left transition-all group shadow-2xs"
        >
          <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
            <ClipboardCheck className="w-4 h-4" />
          </div>
          <h4 className="text-xs font-bold text-slate-900 group-hover:text-teal-800">Screeners</h4>
          <span className="text-[10px] text-slate-400 font-mono mt-0.5 block">PHQ-9 & GAD-7</span>
        </button>
      </div>
    </div>
  );
};
