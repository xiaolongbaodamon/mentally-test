import React, { useState, useMemo } from "react";
import { 
  Smile, 
  Frown, 
  Meh, 
  Calendar, 
  Sparkles, 
  Trash2, 
  TrendingUp, 
  Tag, 
  Plus, 
  Clock,
  Heart,
  CheckCircle2,
  Zap,
  Activity,
  Compass
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { MoodEntry, MoodScore } from "../types";
import { INITIAL_MOOD_OPTIONS, FEELING_TAGS, TRIGGER_TAGS } from "../data/wellnessContent";

interface MoodTrackerProps {
  moods: MoodEntry[];
  onAddMood: (entry: Omit<MoodEntry, "id" | "timestamp">) => void;
  onDeleteMood: (id: string) => void;
  onOpenActivitiesWithSuggestion?: (action: string) => void;
  onNavigateRecords?: () => void;
}

export const MoodTracker: React.FC<MoodTrackerProps> = ({
  moods,
  onAddMood,
  onDeleteMood,
  onOpenActivitiesWithSuggestion,
  onNavigateRecords,
}) => {
  const [score, setScore] = useState<MoodScore>(7);
  const [selectedFeelings, setSelectedFeelings] = useState<string[]>([]);
  const [selectedTriggers, setSelectedTriggers] = useState<string[]>([]);
  const [note, setNote] = useState("");
  const [showLogSuccess, setShowLogSuccess] = useState(false);

  // Automated Time-of-Day Context Detection
  const timePeriod = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return { label: "Morning", prompt: "How are your energy and focus starting today?" };
    if (hour < 17) return { label: "Afternoon", prompt: "How is your academic and social flow progressing?" };
    return { label: "Evening", prompt: "How do you feel winding down after classes?" };
  }, []);

  // Automated Valence Metadata
  const getMoodMeta = (val: number) => {
    if (val >= 9) return { label: "Radiant & Joyful", emoji: "🌟", color: "text-emerald-700 bg-emerald-50 border-emerald-300", hue: "emerald" };
    if (val >= 7) return { label: "Calm & Content", emoji: "🌿", color: "text-teal-700 bg-teal-50 border-teal-300", hue: "teal" };
    if (val >= 5) return { label: "Balanced / Neutral", emoji: "⛅", color: "text-sky-700 bg-sky-50 border-sky-300", hue: "sky" };
    if (val >= 3) return { label: "Tired / Stressed", emoji: "🌧️", color: "text-amber-700 bg-amber-50 border-amber-300", hue: "amber" };
    return { label: "Overwhelmed / Low", emoji: "⛈️", color: "text-rose-700 bg-rose-50 border-rose-300", hue: "rose" };
  };

  const currentMeta = getMoodMeta(score);

  // Automated Stats & Trajectory Trend
  const { averageScore, trendDirection } = useMemo(() => {
    if (moods.length === 0) return { averageScore: "7.0", trendDirection: "Neutral" };
    const avg = moods.reduce((acc, m) => acc + m.score, 0) / moods.length;
    const recent = moods.slice(0, 3);
    const recentAvg = recent.reduce((acc, m) => acc + m.score, 0) / recent.length;
    let trend = "Steady";
    if (recentAvg > avg + 0.5) trend = "Upward";
    else if (recentAvg < avg - 0.5) trend = "Downward";
    return { averageScore: avg.toFixed(1), trendDirection: trend };
  }, [moods]);

  const toggleFeeling = (tag: string) => {
    setSelectedFeelings((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const toggleTrigger = (trig: string) => {
    setSelectedTriggers((prev) =>
      prev.includes(trig) ? prev.filter((t) => t !== trig) : [...prev, trig]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddMood({
      score,
      label: currentMeta.label,
      emoji: currentMeta.emoji,
      feelings: selectedFeelings,
      triggers: selectedTriggers,
      note: note.trim() || undefined,
    });

    // Reset inputs
    setSelectedFeelings([]);
    setSelectedTriggers([]);
    setNote("");
    setShowLogSuccess(true);
    setTimeout(() => setShowLogSuccess(false), 2500);
  };

  return (
    <div id="mood-tracker-view" className="space-y-4">
      {/* Executive Command Header */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-200 text-teal-700 flex items-center justify-center shrink-0">
            <Heart className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-black text-slate-900 tracking-tight">Mood & Valence Registry</h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-teal-50 text-teal-800 border border-teal-200">
                {timePeriod.label} Assessment
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">Standard 1-10 Psychometric Rating</p>
          </div>
        </div>

        {/* Live Trajectory Telemetry */}
        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100">
          <div className="text-right">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Average</span>
            <span className="text-sm font-black text-slate-900 font-mono">{averageScore} / 10</span>
          </div>
          <div className="text-right pl-3 border-l border-slate-200">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Trajectory</span>
            <span className={`text-xs font-black flex items-center gap-1 ${trendDirection === "Upward" ? "text-emerald-700" : trendDirection === "Downward" ? "text-amber-700" : "text-teal-700"}`}>
              <TrendingUp className="w-3.5 h-3.5" />
              {trendDirection}
            </span>
          </div>
        </div>
      </div>

      {/* Main Interactive Check-in Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs space-y-6">
        
        {/* Animated Live Valence Slider & Gauge */}
        <div className="space-y-3 p-4 rounded-xl bg-slate-50 border border-slate-200/80">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Current Valence:
            </span>
            <motion.div 
              key={score}
              initial={{ scale: 0.9, opacity: 0.8 }}
              animate={{ scale: 1, opacity: 1 }}
              className={`inline-flex items-center gap-2 px-3 py-1 rounded-xl font-black text-xs border shadow-2xs ${currentMeta.color}`}
            >
              <span className="text-sm">{currentMeta.emoji}</span>
              <span>{score}/10 — {currentMeta.label}</span>
            </motion.div>
          </div>

          <div className="relative pt-2">
            <input
              id="mood-score-slider"
              type="range"
              min="1"
              max="10"
              step="1"
              value={score}
              onChange={(e) => setScore(parseInt(e.target.value) as MoodScore)}
              className="w-full h-2.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-teal-700 focus:outline-hidden"
            />
            <div className="flex justify-between text-[10px] font-bold text-slate-400 pt-2 font-mono">
              <span>1 (Severe Distress)</span>
              <span>5 (Neutral)</span>
              <span>10 (Optimal Flow)</span>
            </div>
          </div>
        </div>

        {/* Emotional Descriptors Selection */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Emotional Descriptors
            </label>
            <span className="text-[10px] text-slate-400 font-mono">
              {selectedFeelings.length} selected
            </span>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {FEELING_TAGS.map((tag) => {
              const isSelected = selectedFeelings.includes(tag);
              return (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleFeeling(tag)}
                  className={`text-xs px-3 py-1.5 rounded-xl font-bold transition-all active:scale-95 ${
                    isSelected
                      ? "bg-teal-700 text-white border border-teal-800 shadow-2xs"
                      : "bg-slate-50 text-slate-700 border border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  {tag}
                </button>
              );
            })}
          </div>
        </div>

        {/* Academic & Life Triggers */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Contextual Triggers & Factors
            </label>
            <span className="text-[10px] text-slate-400 font-mono">
              {selectedTriggers.length} selected
            </span>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {TRIGGER_TAGS.map((trig) => {
              const isSelected = selectedTriggers.includes(trig);
              return (
                <button
                  key={trig}
                  type="button"
                  onClick={() => toggleTrigger(trig)}
                  className={`text-xs px-3 py-1.5 rounded-xl font-bold transition-all active:scale-95 ${
                    isSelected
                      ? "bg-slate-800 text-white border border-slate-900 shadow-2xs"
                      : "bg-slate-50 text-slate-700 border border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  {trig}
                </button>
              );
            })}
          </div>
        </div>

        {/* Context Note Field */}
        <div>
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
            Context Notes (Optional)
          </label>
          <input
            id="mood-note-input"
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Briefly note any situation or reason..."
            className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:border-teal-600 font-medium text-slate-800"
          />
        </div>

        {/* Submit & Success Notification */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100">
          <AnimatePresence>
            {showLogSuccess ? (
              <motion.span
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-1.5 text-xs font-black text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Mood Logged Successfully
              </motion.span>
            ) : (
              <span className="text-[11px] text-slate-400 font-medium">Synced with your private records</span>
            )}
          </AnimatePresence>

          <button
            id="submit-mood-entry-btn"
            type="submit"
            className="flex items-center gap-2 px-6 py-2.5 bg-teal-700 hover:bg-teal-800 active:scale-95 text-white font-black text-xs rounded-xl shadow-xs transition-all ml-auto min-h-[40px]"
          >
            <Plus className="w-4 h-4" />
            Log Mood Check-in
          </button>
        </div>
      </form>
    </div>
  );
};
