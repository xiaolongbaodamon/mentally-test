import React, { useState, useMemo } from "react";
import { 
  History, 
  Search, 
  Filter, 
  Calendar, 
  Trash2, 
  Download, 
  Heart, 
  TrendingUp, 
  Plus
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { MoodEntry } from "../types";

interface MoodRecordsViewProps {
  moods: MoodEntry[];
  onDeleteMood: (id: string) => void;
  onNavigateLogMood: () => void;
}

export const MoodRecordsView: React.FC<MoodRecordsViewProps> = ({
  moods,
  onDeleteMood,
  onNavigateLogMood,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState<"all" | "high" | "neutral" | "low">("all");

  // Filtering
  const filteredMoods = useMemo(() => {
    return moods.filter((item) => {
      if (selectedFilter === "high" && item.score < 8) return false;
      if (selectedFilter === "neutral" && (item.score < 5 || item.score > 7)) return false;
      if (selectedFilter === "low" && item.score >= 5) return false;

      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      const matchLabel = item.label.toLowerCase().includes(q);
      const matchNote = item.note ? item.note.toLowerCase().includes(q) : false;
      const matchFeelings = item.feelings.some((f) => f.toLowerCase().includes(q));
      const matchTriggers = item.triggers.some((t) => t.toLowerCase().includes(q));

      return matchLabel || matchNote || matchFeelings || matchTriggers;
    });
  }, [moods, selectedFilter, searchQuery]);

  const totalCount = moods.length;
  const averageScore = totalCount
    ? (moods.reduce((acc, m) => acc + m.score, 0) / totalCount).toFixed(1)
    : "0.0";

  const getScoreBadge = (val: number) => {
    if (val >= 8) return { label: "Optimal", color: "bg-emerald-50 text-emerald-800 border-emerald-200" };
    if (val >= 5) return { label: "Balanced", color: "bg-teal-50 text-teal-800 border-teal-200" };
    return { label: "Distressed", color: "bg-rose-50 text-rose-800 border-rose-200" };
  };

  const handleExportCSV = () => {
    if (moods.length === 0) return;
    const header = "ID,Date,Score,Label,Feelings,Triggers,Note\n";
    const rows = moods.map((m) => {
      const d = new Date(m.timestamp).toLocaleDateString();
      const feelings = `"${m.feelings.join(", ")}"`;
      const triggers = `"${m.triggers.join(", ")}"`;
      const note = `"${(m.note || "").replace(/"/g, '""')}"`;
      return `${m.id},${d},${m.score},${m.label},${feelings},${triggers},${note}`;
    }).join("\n");

    const blob = new Blob([header + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `PTC_Mood_Records_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div id="mood-records-view" className="space-y-4">
      {/* Executive Command Header */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-200 text-teal-700 flex items-center justify-center shrink-0">
            <History className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-black text-slate-900 tracking-tight">Mood & Valence Registry</h2>
              <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded-md bg-teal-50 text-teal-800 border border-teal-200">
                {totalCount} Logs
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">Historical Longitudinal Telemetry</p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={handleExportCSV}
            disabled={moods.length === 0}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-50 hover:bg-slate-100 disabled:opacity-40 text-slate-700 text-xs font-bold rounded-xl border border-slate-200 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={onNavigateLogMood}
            className="flex items-center gap-1.5 px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold rounded-xl shadow-xs transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>New Log</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by feelings, triggers, or notes..."
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-hidden focus:border-teal-600"
            />
          </div>

          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 shrink-0">
            {(["all", "high", "neutral", "low"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setSelectedFilter(f)}
                className={`px-3 py-1 rounded-lg text-xs font-bold capitalize transition-all ${
                  selectedFilter === f ? "bg-white text-teal-800 shadow-2xs" : "text-slate-500 hover:text-slate-700"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Records List */}
        {filteredMoods.length === 0 ? (
          <div className="text-center py-10 px-4">
            <History className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-xs font-bold text-slate-600">No Mood Logs Found</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredMoods.map((m) => {
              const badge = getScoreBadge(m.score);
              return (
                <div
                  key={m.id}
                  className="p-3.5 rounded-xl border border-slate-200 hover:border-teal-300 transition-all bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-black font-mono text-slate-900 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
                        {m.score}/10
                      </span>
                      <span className="text-xs font-bold text-slate-900">
                        {m.label} {m.emoji}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${badge.color}`}>
                        {badge.label}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {new Date(m.timestamp).toLocaleDateString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>

                    {(m.feelings?.length > 0 || m.triggers?.length > 0) && (
                      <div className="flex flex-wrap gap-1 pt-1">
                        {m.feelings.map((f) => (
                          <span key={f} className="text-[10px] font-medium bg-teal-50 text-teal-800 border border-teal-200 px-1.5 py-0.2 rounded">
                            {f}
                          </span>
                        ))}
                        {m.triggers.map((t) => (
                          <span key={t} className="text-[10px] font-medium bg-slate-100 text-slate-600 border border-slate-200 px-1.5 py-0.2 rounded">
                            {t}
                          </span>
                        ))}
                      </div>
                    )}

                    {m.note && (
                      <p className="text-xs text-slate-600 italic pt-0.5">
                        "{m.note}"
                      </p>
                    )}
                  </div>

                  <button
                    onClick={() => onDeleteMood(m.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors self-end sm:self-center"
                    title="Delete Entry"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
