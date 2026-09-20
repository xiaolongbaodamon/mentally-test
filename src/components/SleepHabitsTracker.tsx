import React, { useState, useMemo } from "react";
import { Moon, Sun, Coffee, Smartphone, CheckCircle2, Clock, Plus, Trash2, Activity, Zap, ShieldCheck } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { SleepHabitEntry } from "../types";

export const SleepHabitsTracker: React.FC = () => {
  const [entries, setEntries] = useState<SleepHabitEntry[]>(() => {
    try {
      const saved = localStorage.getItem("mentally_sleep_entries");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [hoursSlept, setHoursSlept] = useState<number>(7.5);
  const [quality, setQuality] = useState<"Restful" | "Fair" | "Poor" | "Restless">("Restful");
  const [caffeineLate, setCaffeineLate] = useState(false);
  const [screenBeforeBed, setScreenBeforeBed] = useState(false);
  const [notes, setNotes] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);

  // Automated Recovery Index (0 - 100)
  const recoveryScore = useMemo(() => {
    let score = 50;
    // Hours component
    if (hoursSlept >= 7 && hoursSlept <= 9) score += 30;
    else if (hoursSlept >= 6) score += 15;
    else score -= 10;

    // Quality component
    if (quality === "Restful") score += 20;
    else if (quality === "Fair") score += 10;
    else if (quality === "Poor") score -= 15;
    else score -= 10;

    // Inhibitors
    if (caffeineLate) score -= 12;
    if (screenBeforeBed) score -= 8;

    return Math.max(10, Math.min(100, score));
  }, [hoursSlept, quality, caffeineLate, screenBeforeBed]);

  const recoveryTier = useMemo(() => {
    if (recoveryScore >= 80) return { label: "Optimal Recovery", color: "text-emerald-700 bg-emerald-50 border-emerald-300" };
    if (recoveryScore >= 60) return { label: "Moderate Rest", color: "text-teal-700 bg-teal-50 border-teal-300" };
    if (recoveryScore >= 40) return { label: "Mild Deficit", color: "text-amber-700 bg-amber-50 border-amber-300" };
    return { label: "Significant Fatigue", color: "text-rose-700 bg-rose-50 border-rose-300" };
  }, [recoveryScore]);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const newEntry: SleepHabitEntry = {
      id: "sleep-" + Date.now(),
      date: new Date().toISOString().split("T")[0],
      hoursSlept,
      quality,
      caffeineLate,
      screenBeforeBed,
      notes: notes.trim() || undefined,
    };

    const updated = [newEntry, ...entries];
    setEntries(updated);
    try {
      localStorage.setItem("mentally_sleep_entries", JSON.stringify(updated));
    } catch {}

    setNotes("");
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 2500);
  };

  const handleDelete = (id: string) => {
    const updated = entries.filter((e) => e.id !== id);
    setEntries(updated);
    try {
      localStorage.setItem("mentally_sleep_entries", JSON.stringify(updated));
    } catch {}
  };

  const avgHours = entries.length
    ? (entries.reduce((a, b) => a + b.hoursSlept, 0) / entries.length).toFixed(1)
    : "7.5";

  return (
    <div id="sleep-tracker-view" className="space-y-4">
      {/* Executive Command Header */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-700 flex items-center justify-center shrink-0">
            <Moon className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-black text-slate-900 tracking-tight">Sleep & Recovery Metrics</h2>
              <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-800 border border-indigo-200">
                Avg {avgHours} hrs
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">Circadian Rhythm & Rest Register</p>
          </div>
        </div>

        {/* Live Recovery Score Indicator */}
        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100">
          <div className="text-right">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Estimated Recovery</span>
            <div className="flex items-center gap-2">
              <span className="text-sm font-black text-slate-900 font-mono">{recoveryScore}/100</span>
              <span className={`text-[10px] font-black px-2 py-0.5 rounded-md border ${recoveryTier.color}`}>
                {recoveryTier.label}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Sleep Check-in Form */}
      <form onSubmit={handleAdd} className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs space-y-5">
        
        {/* Hours Slept Slider with Automated Visual Feedback */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Duration of Sleep:
            </label>
            <span className="text-sm font-black text-indigo-900 font-mono bg-indigo-50 px-3 py-0.5 rounded-lg border border-indigo-200">
              {hoursSlept} Hours
            </span>
          </div>

          <input
            type="range"
            min={3}
            max={12}
            step={0.5}
            value={hoursSlept}
            onChange={(e) => setHoursSlept(parseFloat(e.target.value))}
            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600 focus:outline-hidden"
          />

          <div className="flex justify-between text-[10px] text-slate-400 font-mono font-bold">
            <span>3h (Deficit)</span>
            <span>7 - 8.5h (Academic Benchmark)</span>
            <span>12h</span>
          </div>
        </div>

        {/* Sleep Quality Buttons */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
            Sleep Quality Rating
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {(["Restful", "Fair", "Restless", "Poor"] as const).map((q) => (
              <button
                key={q}
                type="button"
                onClick={() => setQuality(q)}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border ${
                  quality === q
                    ? "bg-indigo-700 text-white border-indigo-800 shadow-2xs"
                    : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                }`}
              >
                {q}
              </button>
            ))}
          </div>
        </div>

        {/* Inhibitors Toggles (Caffeine & Screens) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setCaffeineLate(!caffeineLate)}
            className={`p-3 rounded-xl border flex items-center justify-between text-xs font-bold transition-all ${
              caffeineLate
                ? "bg-amber-50 border-amber-300 text-amber-950"
                : "bg-slate-50 border-slate-200 text-slate-700"
            }`}
          >
            <div className="flex items-center gap-2">
              <Coffee className="w-4 h-4 text-amber-600" />
              <span>Caffeine consumed after 4 PM</span>
            </div>
            <div className={`w-4 h-4 rounded-md border flex items-center justify-center ${caffeineLate ? "bg-amber-600 border-amber-600 text-white" : "border-slate-300"}`}>
              {caffeineLate && "✓"}
            </div>
          </button>

          <button
            type="button"
            onClick={() => setScreenBeforeBed(!screenBeforeBed)}
            className={`p-3 rounded-xl border flex items-center justify-between text-xs font-bold transition-all ${
              screenBeforeBed
                ? "bg-indigo-50 border-indigo-300 text-indigo-950"
                : "bg-slate-50 border-slate-200 text-slate-700"
            }`}
          >
            <div className="flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-indigo-600" />
              <span>Screen use 30m before bed</span>
            </div>
            <div className={`w-4 h-4 rounded-md border flex items-center justify-center ${screenBeforeBed ? "bg-indigo-600 border-indigo-600 text-white" : "border-slate-300"}`}>
              {screenBeforeBed && "✓"}
            </div>
          </button>
        </div>

        {/* Notes */}
        <div>
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Sleep notes (e.g. studied late for capstone, woke up refreshed)..."
            className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:border-indigo-600 font-medium text-slate-800"
          />
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-slate-100">
          <AnimatePresence>
            {showSuccess && (
              <motion.span
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                className="text-xs font-bold text-emerald-700 flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Sleep Log Saved
              </motion.span>
            )}
          </AnimatePresence>

          <button
            type="submit"
            className="flex items-center gap-2 px-5 py-2 bg-indigo-700 hover:bg-indigo-800 active:scale-95 text-white font-bold text-xs rounded-xl shadow-xs transition-all ml-auto min-h-[38px]"
          >
            <Plus className="w-4 h-4" />
            Record Sleep Entry
          </button>
        </div>
      </form>

      {/* Recent Records List */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-xs space-y-3">
        {entries.length === 0 ? (
          <div className="text-center py-8 px-4">
            <Moon className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-xs font-bold text-slate-600">No Sleep Entries Logged</p>
          </div>
        ) : (
          entries.map((item) => (
            <div
              key={item.id}
              className="p-3.5 rounded-xl border border-slate-200 flex items-center justify-between gap-3 text-xs"
            >
              <div className="flex items-center gap-3">
                <span className="text-xs font-mono font-bold text-slate-400">
                  {item.date}
                </span>
                <span className="font-black text-slate-900 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-200">
                  {item.hoursSlept} hrs
                </span>
                <span className="font-semibold text-slate-600">
                  {item.quality}
                </span>
                {item.notes && (
                  <span className="text-slate-400 italic hidden sm:inline">
                    — "{item.notes}"
                  </span>
                )}
              </div>

              <button
                onClick={() => handleDelete(item.id)}
                className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                title="Delete Entry"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
