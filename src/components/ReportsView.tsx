import React, { useState } from "react";
import { 
  BarChart3, 
  TrendingUp, 
  Download, 
  FileText, 
  CheckCircle2, 
  Activity, 
  Sparkles,
  Flame,
  BookOpen,
  Heart
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { MoodEntry, JournalEntry } from "../types";

interface ReportsViewProps {
  moods: MoodEntry[];
  journals: JournalEntry[];
  onNavigateTab?: (tab: string) => void;
  streakDays?: number;
  activitiesCompletedCount?: number;
}

export const ReportsView: React.FC<ReportsViewProps> = ({ 
  moods, 
  journals, 
  onNavigateTab,
  streakDays = 0,
  activitiesCompletedCount = 0,
}) => {
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  // Statistics calculation
  const totalCheckIns = moods.length;
  const averageScore = moods.length
    ? (moods.reduce((acc, m) => acc + m.score, 0) / moods.length).toFixed(1)
    : "0.0";

  // Trigger counts
  const triggerMap: Record<string, number> = {};
  moods.forEach((m) => {
    m.triggers?.forEach((t) => {
      triggerMap[t] = (triggerMap[t] || 0) + 1;
    });
  });
  const topTriggers = Object.entries(triggerMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4);

  // Feeling counts
  const feelingMap: Record<string, number> = {};
  moods.forEach((m) => {
    m.feelings?.forEach((f) => {
      feelingMap[f] = (feelingMap[f] || 0) + 1;
    });
  });
  const topFeelings = Object.entries(feelingMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4);

  const handleDownloadSummary = () => {
    const reportText = `
MentAlly - Longitudinal Wellness Analytics Summary
Generated: ${new Date().toLocaleString()}
Institution: Pateros Technological College (PTC)
--------------------------------------------------
Total Mood Check-ins: ${totalCheckIns}
Average Mood Score: ${averageScore} / 10
Total Journal Reflections: ${journals.length}
Completed Wellness Practices: ${activitiesCompletedCount}
Current Active Streak: ${streakDays} days

Top Triggers:
${topTriggers.map(([k, v]) => `- ${k}: ${v}`).join("\n") || "None recorded"}

Top Feelings:
${topFeelings.map(([k, v]) => `- ${k}: ${v}`).join("\n") || "None recorded"}

Recent Mood Logs:
${moods.slice(0, 5).map((m) => `[${new Date(m.timestamp).toLocaleDateString()}] ${m.score}/10 - ${m.label} ${m.note ? `("${m.note}")` : ""}`).join("\n")}
--------------------------------------------------
Confidential Report - For personal review or PTC Guidance Center consultation.
    `.trim();

    const blob = new Blob([reportText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `PTC_Wellness_Analytics_${new Date().toISOString().split("T")[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);

    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 3000);
  };

  return (
    <div id="reports-view" className="space-y-4">
      {/* Executive Command Header */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-200 text-teal-700 flex items-center justify-center shrink-0">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-black text-slate-900 tracking-tight">Psychological Longitudinal Reports</h2>
              <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded-md bg-teal-50 text-teal-800 border border-teal-200">
                Live Aggregation
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">Trends, Frequency Distributions, and Clinical Summaries</p>
          </div>
        </div>

        <button
          onClick={handleDownloadSummary}
          className="flex items-center gap-2 px-4 py-2 bg-teal-700 hover:bg-teal-800 active:scale-95 text-white font-bold text-xs rounded-xl shadow-xs transition-all w-full sm:w-auto justify-center min-h-[38px]"
        >
          {downloadSuccess ? (
            <>
              <CheckCircle2 className="w-4 h-4 text-emerald-300" />
              <span>Report Downloaded</span>
            </>
          ) : (
            <>
              <Download className="w-4 h-4" />
              <span>Download Summary</span>
            </>
          )}
        </button>
      </div>

      {/* Core Telemetry Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-xl border border-slate-200/90 bg-white shadow-2xs">
          <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Total Logs</span>
          <span className="text-2xl font-black text-slate-900 font-mono">{totalCheckIns}</span>
        </div>

        <div className="p-4 rounded-xl border border-slate-200/90 bg-white shadow-2xs">
          <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Average Valence</span>
          <span className="text-2xl font-black text-teal-700 font-mono">{averageScore} / 10</span>
        </div>

        <div className="p-4 rounded-xl border border-slate-200/90 bg-white shadow-2xs">
          <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Journals Recorded</span>
          <span className="text-2xl font-black text-slate-900 font-mono">{journals.length}</span>
        </div>

        <div className="p-4 rounded-xl border border-slate-200/90 bg-white shadow-2xs">
          <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Active Streak</span>
          <span className="text-2xl font-black text-amber-600 font-mono">{streakDays} Days</span>
        </div>
      </div>

      {/* Distributions: Feelings & Triggers with Live Progress Bars */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Top Feelings */}
        <div className="p-5 rounded-2xl border border-slate-200/90 bg-white shadow-xs space-y-3">
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Most Frequent Feelings
          </h3>

          {topFeelings.length === 0 ? (
            <p className="text-xs text-slate-400 py-4 text-center">No feelings logged yet.</p>
          ) : (
            <div className="space-y-2.5">
              {topFeelings.map(([f, count]) => {
                const percentage = Math.min(100, Math.round((count / (totalCheckIns || 1)) * 100));
                return (
                  <div key={f} className="space-y-1">
                    <div className="flex justify-between text-xs font-bold text-slate-800">
                      <span>{f}</span>
                      <span className="font-mono text-slate-500">{count} logs ({percentage}%)</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                      <motion.div
                        className="h-full bg-teal-600 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Top Triggers */}
        <div className="p-5 rounded-2xl border border-slate-200/90 bg-white shadow-xs space-y-3">
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Primary Contextual Triggers
          </h3>

          {topTriggers.length === 0 ? (
            <p className="text-xs text-slate-400 py-4 text-center">No triggers recorded yet.</p>
          ) : (
            <div className="space-y-2.5">
              {topTriggers.map(([t, count]) => {
                const percentage = Math.min(100, Math.round((count / (totalCheckIns || 1)) * 100));
                return (
                  <div key={t} className="space-y-1">
                    <div className="flex justify-between text-xs font-bold text-slate-800">
                      <span>{t}</span>
                      <span className="font-mono text-slate-500">{count} logs ({percentage}%)</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                      <motion.div
                        className="h-full bg-amber-600 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
