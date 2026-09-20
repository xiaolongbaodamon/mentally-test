import React, { useState } from "react";
import { 
  BarChart3, 
  TrendingUp, 
  Calendar, 
  Download, 
  FileText, 
  CheckCircle2, 
  Smile, 
  Heart, 
  Sparkles, 
  Clock 
} from "lucide-react";
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
MentAlly - College Mental Wellness Summary Report
Generated: ${new Date().toLocaleString()}
Institution: Pateros Technological College (PTC)
--------------------------------------------------
Total Mood Check-ins: ${totalCheckIns}
Average Mood Score: ${averageScore} / 10
Total Journal Reflections: ${journals.length}

Top Emotional Triggers:
${topTriggers.map(([k, v]) => `- ${k} (${v} occurrences)`).join("\n") || "None recorded"}

Top Feelings Identified:
${topFeelings.map(([k, v]) => `- ${k} (${v} occurrences)`).join("\n") || "None recorded"}

Recent Mood Logs:
${moods.slice(0, 5).map((m) => `[${new Date(m.timestamp).toLocaleDateString()}] Score: ${m.score}/10 - ${m.label} ${m.note ? `("${m.note}")` : ""}`).join("\n")}
--------------------------------------------------
Confidential Report - For personal reflection or guidance counseling review.
    `.trim();

    const blob = new Blob([reportText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `MentAlly_Wellness_Summary_${new Date().toISOString().split("T")[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);

    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 3000);
  };

  return (
    <div id="reports-view" className="space-y-6">
      {/* Overview Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center shadow-xs">
            <BarChart3 className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">Mental Wellness Summaries & Reports</h2>
            <p className="text-xs text-slate-500">Organized overview of your emotional patterns and habits</p>
          </div>
        </div>

        <button
          onClick={handleDownloadSummary}
          className="px-4 py-2.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs shadow-xs transition-colors flex items-center justify-center gap-2 shrink-0"
        >
          {downloadSuccess ? (
            <>
              <CheckCircle2 className="w-4 h-4 text-emerald-300" />
              <span>Report Exported!</span>
            </>
          ) : (
            <>
              <Download className="w-4 h-4" />
              <span>Export Wellness Summary</span>
            </>
          )}
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Check-ins</span>
          <div className="text-2xl font-black text-slate-900 mt-2">{totalCheckIns}</div>
          <p className="text-[11px] text-slate-500 mt-1">Logged emotional check-ins</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Average Mood Score</span>
          <div className="text-2xl font-black text-teal-700 mt-2">{averageScore} / 10</div>
          <p className="text-[11px] text-slate-500 mt-1">Overall emotional baseline</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Journal Entries</span>
          <div className="text-2xl font-black text-sky-700 mt-2">{journals.length}</div>
          <p className="text-[11px] text-slate-500 mt-1">Reflective self-care pages</p>
        </div>
      </div>

      {/* Breakdown Grids */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Top Triggers */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
            Most Frequent Academic & Life Triggers
          </h3>
          {topTriggers.length === 0 ? (
            <p className="text-xs text-slate-400 py-4">No triggers tagged yet.</p>
          ) : (
            <div className="space-y-2">
              {topTriggers.map(([name, count]) => (
                <div key={name} className="flex items-center justify-between p-2 rounded-lg bg-amber-50/50 border border-amber-100 text-xs">
                  <span className="font-semibold text-slate-800">⚡ {name}</span>
                  <span className="font-bold text-amber-800 px-2 py-0.5 bg-white rounded-md border border-amber-200">
                    {count}x
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Top Feelings */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
            Predominant Emotions
          </h3>
          {topFeelings.length === 0 ? (
            <p className="text-xs text-slate-400 py-4">No feeling tags selected yet.</p>
          ) : (
            <div className="space-y-2">
              {topFeelings.map(([name, count]) => (
                <div key={name} className="flex items-center justify-between p-2 rounded-lg bg-teal-50/50 border border-teal-100 text-xs">
                  <span className="font-semibold text-slate-800">🌿 {name}</span>
                  <span className="font-bold text-teal-800 px-2 py-0.5 bg-white rounded-md border border-teal-200">
                    {count}x
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
