import React, { useState, useMemo } from "react";
import { 
  History, 
  Search, 
  Filter, 
  Calendar, 
  Clock, 
  Trash2, 
  Sparkles, 
  Plus, 
  Download, 
  Heart, 
  TrendingUp, 
  Smile, 
  Meh, 
  Frown 
} from "lucide-react";
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
      // Score filter
      if (selectedFilter === "high" && item.score < 8) return false;
      if (selectedFilter === "neutral" && (item.score < 5 || item.score > 7)) return false;
      if (selectedFilter === "low" && item.score >= 5) return false;

      // Text query
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      const matchLabel = item.label.toLowerCase().includes(q);
      const matchNote = item.note ? item.note.toLowerCase().includes(q) : false;
      const matchFeelings = item.feelings.some((f) => f.toLowerCase().includes(q));
      const matchTriggers = item.triggers.some((t) => t.toLowerCase().includes(q));

      return matchLabel || matchNote || matchFeelings || matchTriggers;
    });
  }, [moods, selectedFilter, searchQuery]);

  // Overall Statistics
  const totalCount = moods.length;
  const averageScore = totalCount
    ? (moods.reduce((acc, m) => acc + m.score, 0) / totalCount).toFixed(1)
    : "0.0";

  const getScoreBadge = (val: number) => {
    if (val >= 8) return { label: "Radiant", color: "bg-emerald-50 text-emerald-700 border-emerald-200" };
    if (val >= 5) return { label: "Balanced", color: "bg-sky-50 text-sky-700 border-sky-200" };
    return { label: "Needs Care", color: "bg-rose-50 text-rose-700 border-rose-200" };
  };

  const handleExportCSV = () => {
    if (moods.length === 0) return;
    const header = "ID,Date,Time,Score,Label,Feelings,Triggers,Note\n";
    const rows = moods.map((m) => {
      const d = new Date(m.timestamp);
      const dateStr = d.toLocaleDateString();
      const timeStr = d.toLocaleTimeString();
      const feelings = `"${m.feelings.join(", ")}"`;
      const triggers = `"${m.triggers.join(", ")}"`;
      const note = `"${(m.note || "").replace(/"/g, '""')}"`;
      return `${m.id},${dateStr},${timeStr},${m.score},${m.label},${feelings},${triggers},${note}`;
    }).join("\n");

    const blob = new Blob([header + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `MentAlly_Mood_Records_${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div id="mood-records-view" className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center shadow-xs">
            <History className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">Mood Records & History</h2>
            <p className="text-xs text-slate-500">
              Browse, search, and manage your complete historical mood logs
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {moods.length > 0 && (
            <button
              onClick={handleExportCSV}
              className="px-3 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
              title="Export records to CSV"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
          )}

          <button
            onClick={onNavigateLogMood}
            className="px-4 py-2 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold shadow-xs flex items-center gap-1.5 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Record New Mood</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Records</span>
          <div className="text-2xl font-black text-slate-900 mt-1">{totalCount}</div>
          <span className="text-[11px] text-slate-400">Recorded check-ins</span>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Average Mood Score</span>
          <div className="text-2xl font-black text-teal-700 mt-1">{averageScore} / 10</div>
          <span className="text-[11px] text-slate-400">Overall emotional baseline</span>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Active Filters</span>
          <div className="text-sm font-bold text-slate-800 mt-2">
            Showing {filteredMoods.length} of {totalCount}
          </div>
          <span className="text-[11px] text-slate-400">Matches current criteria</span>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search bar */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by note, feeling, or trigger (e.g. 'exams', 'calm')..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
            />
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            <button
              onClick={() => setSelectedFilter("all")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                selectedFilter === "all"
                  ? "bg-teal-700 text-white shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              All Records ({totalCount})
            </button>
            <button
              onClick={() => setSelectedFilter("high")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                selectedFilter === "high"
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
              }`}
            >
              Radiant (8-10)
            </button>
            <button
              onClick={() => setSelectedFilter("neutral")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                selectedFilter === "neutral"
                  ? "bg-sky-600 text-white shadow-xs"
                  : "bg-sky-50 text-sky-700 hover:bg-sky-100"
              }`}
            >
              Balanced (5-7)
            </button>
            <button
              onClick={() => setSelectedFilter("low")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                selectedFilter === "low"
                  ? "bg-rose-600 text-white shadow-xs"
                  : "bg-rose-50 text-rose-700 hover:bg-rose-100"
              }`}
            >
              Stressed (1-4)
            </button>
          </div>
        </div>
      </div>

      {/* Records List */}
      <div className="space-y-3">
        {filteredMoods.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
              <History className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-700">No mood records match your filter</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              {totalCount === 0
                ? "You haven't logged any moods yet. Click 'Record New Mood' to start tracking your journey!"
                : "Try clearing your search query or selecting 'All Records'."}
            </p>
            {totalCount === 0 && (
              <button
                onClick={onNavigateLogMood}
                className="px-4 py-2 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold shadow-xs transition-colors inline-flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Log Your First Mood</span>
              </button>
            )}
          </div>
        ) : (
          filteredMoods.map((item) => {
            const badge = getScoreBadge(item.score);
            const dateObj = new Date(item.timestamp);
            const dateFormatted = dateObj.toLocaleDateString(undefined, {
              weekday: "short",
              month: "short",
              day: "numeric",
              year: "numeric",
            });
            const timeFormatted = dateObj.toLocaleTimeString(undefined, {
              hour: "numeric",
              minute: "2-digit",
            });

            return (
              <div
                key={item.id}
                id={`mood-record-entry-${item.id}`}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:border-teal-300 transition-all space-y-3"
              >
                {/* Header row */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl shrink-0">{item.emoji}</span>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-sm font-bold text-slate-900">{item.label}</h4>
                        <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${badge.color}`}>
                          Score: {item.score} / 10 • {badge.label}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-1">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {dateFormatted}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {timeFormatted}
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      if (confirm("Are you sure you want to delete this mood record?")) {
                        onDeleteMood(item.id);
                      }
                    }}
                    className="p-1.5 text-slate-300 hover:text-rose-600 rounded-lg transition-colors"
                    title="Delete record"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Tags */}
                {(item.feelings.length > 0 || item.triggers.length > 0) && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {item.feelings.map((f) => (
                      <span
                        key={f}
                        className="text-[10px] font-medium bg-teal-50 text-teal-800 border border-teal-200/60 px-2 py-0.5 rounded-md"
                      >
                        🌿 {f}
                      </span>
                    ))}
                    {item.triggers.map((t) => (
                      <span
                        key={t}
                        className="text-[10px] font-medium bg-amber-50 text-amber-800 border border-amber-200/60 px-2 py-0.5 rounded-md"
                      >
                        ⚡ {t}
                      </span>
                    ))}
                  </div>
                )}

                {/* Reflection Note */}
                {item.note && (
                  <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-xs text-slate-700 leading-relaxed italic">
                    "{item.note}"
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
