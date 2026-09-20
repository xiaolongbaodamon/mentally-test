import React, { useState } from "react";
import { Moon, Sun, Coffee, Smartphone, CheckCircle2, Clock, Plus, Trash2 } from "lucide-react";
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

  const [hoursSlept, setHoursSlept] = useState<number>(7);
  const [quality, setQuality] = useState<"Restful" | "Fair" | "Poor" | "Restless">("Restful");
  const [caffeineLate, setCaffeineLate] = useState(false);
  const [screenBeforeBed, setScreenBeforeBed] = useState(false);
  const [notes, setNotes] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);

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
    : "7.0";

  return (
    <div id="sleep-tracker-view" className="space-y-6">
      {/* Log Sleep Form */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center">
              <Moon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Sleep & Rest Habits Tracker</h2>
              <p className="text-xs text-slate-500">Monitor restorative rest to support academic cognition</p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-[11px] text-slate-400 font-semibold uppercase">Avg Sleep</span>
            <div className="text-lg font-black text-indigo-700">{avgHours} hrs</div>
          </div>
        </div>

        <form onSubmit={handleAdd} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Hours */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700">Hours Slept: {hoursSlept} hrs</label>
              <input
                type="range"
                min={2}
                max={12}
                step={0.5}
                value={hoursSlept}
                onChange={(e) => setHoursSlept(parseFloat(e.target.value))}
                className="w-full accent-indigo-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-medium">
                <span>2 hrs</span>
                <span>7-8 hrs (Optimal)</span>
                <span>12 hrs</span>
              </div>
            </div>

            {/* Quality */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700">Sleep Quality</label>
              <div className="grid grid-cols-2 gap-2">
                {(["Restful", "Fair", "Poor", "Restless"] as const).map((q) => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => setQuality(q)}
                    className={`py-2 rounded-xl text-xs font-semibold border transition-all ${
                      quality === q
                        ? "bg-indigo-600 text-white border-indigo-600 shadow-xs"
                        : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-white"
                    }`}
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Habit Checkboxes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <label className="flex items-center gap-2.5 p-3 rounded-xl border border-slate-200 bg-slate-50/50 cursor-pointer text-xs font-medium text-slate-700 hover:bg-white">
              <input
                type="checkbox"
                checked={caffeineLate}
                onChange={(e) => setCaffeineLate(e.target.checked)}
                className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
              />
              <Coffee className="w-4 h-4 text-amber-600" />
              <span>Caffeine after 3:00 PM</span>
            </label>

            <label className="flex items-center gap-2.5 p-3 rounded-xl border border-slate-200 bg-slate-50/50 cursor-pointer text-xs font-medium text-slate-700 hover:bg-white">
              <input
                type="checkbox"
                checked={screenBeforeBed}
                onChange={(e) => setScreenBeforeBed(e.target.checked)}
                className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
              />
              <Smartphone className="w-4 h-4 text-sky-600" />
              <span>Screen / Phone right before sleep</span>
            </label>
          </div>

          <div className="flex items-center justify-between pt-2">
            {showSuccess ? (
              <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" />
                Sleep entry recorded!
              </span>
            ) : (
              <span className="text-xs text-slate-400">Regular sleep improves working memory for exams.</span>
            )}
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs transition-colors flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Save Log</span>
            </button>
          </div>
        </form>
      </div>

      {/* Sleep Logs History */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900">Recent Sleep Logs</h3>
        {entries.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-6">No sleep logs recorded yet.</p>
        ) : (
          <div className="space-y-2.5">
            {entries.slice(0, 7).map((e) => (
              <div
                key={e.id}
                className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 flex items-center justify-between"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900">{e.hoursSlept} hours</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                      {e.quality}
                    </span>
                    {e.caffeineLate && (
                      <span className="text-[10px] font-medium text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded-md">
                        Late coffee
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-slate-400 mt-0.5 block">{e.date}</span>
                </div>
                <button
                  onClick={() => handleDelete(e.id)}
                  className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
