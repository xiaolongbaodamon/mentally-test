import React, { useState, useMemo } from "react";
import { ClipboardCheck, AlertTriangle, ShieldCheck, CheckCircle2, RotateCcw, ArrowRight, Building2, Activity, Zap } from "lucide-react";
import { motion } from "motion/react";
import { ScreenerResult } from "../types";

interface StandardizedScreenerProps {
  onNavigateGuidance?: () => void;
}

const PHQ9_QUESTIONS = [
  "Little interest or pleasure in doing things",
  "Feeling down, depressed, or hopeless",
  "Trouble falling or staying asleep, or sleeping too much",
  "Feeling tired or having little energy",
  "Poor appetite or overeating",
  "Feeling bad about yourself — or that you are a failure or have let yourself or your family down",
  "Trouble concentrating on things, such as reading textbooks or listening to college lectures",
  "Moving or speaking so slowly that other people could have noticed, or being so fidgety/restless",
  "Thoughts that you would be better off dead or of hurting yourself in some way",
];

const GAD7_QUESTIONS = [
  "Feeling nervous, anxious, or on edge",
  "Not being able to stop or control worrying",
  "Worrying too much about different things (e.g. grades, future, relationships)",
  "Trouble relaxing",
  "Being so restless that it is hard to sit still",
  "Becoming easily annoyed or irritable",
  "Feeling afraid as if something awful might happen",
];

const OPTIONS = [
  { label: "Not at all", value: 0 },
  { label: "Several days", value: 1 },
  { label: "More than half", value: 2 },
  { label: "Nearly daily", value: 3 },
];

export const StandardizedScreener: React.FC<StandardizedScreenerProps> = ({ onNavigateGuidance }) => {
  const [screenerType, setScreenerType] = useState<"PHQ-9" | "GAD-7">("PHQ-9");
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [result, setResult] = useState<ScreenerResult | null>(null);

  const questions = screenerType === "PHQ-9" ? PHQ9_QUESTIONS : GAD7_QUESTIONS;
  const maxPossibleScore = questions.length * 3;

  // Automated Real-Time Score Summation
  const liveScore = useMemo(() => {
    return (Object.values(answers) as number[]).reduce((a, b) => a + b, 0);
  }, [answers]);

  const answeredCount = Object.keys(answers).length;
  const isComplete = answeredCount === questions.length;

  // Automated Clinical Severity Tier Calculation
  const liveSeverity = useMemo(() => {
    if (answeredCount === 0) return { label: "Awaiting Input", color: "text-slate-500 bg-slate-100 border-slate-200" };
    if (screenerType === "PHQ-9") {
      if (liveScore <= 4) return { label: "Minimal Symptoms", color: "text-emerald-700 bg-emerald-50 border-emerald-300" };
      if (liveScore <= 9) return { label: "Mild Symptoms", color: "text-teal-700 bg-teal-50 border-teal-300" };
      if (liveScore <= 14) return { label: "Moderate Symptoms", color: "text-amber-700 bg-amber-50 border-amber-300" };
      return { label: "Moderately Severe / Severe", color: "text-rose-700 bg-rose-50 border-rose-300" };
    } else {
      if (liveScore <= 4) return { label: "Minimal Anxiety", color: "text-emerald-700 bg-emerald-50 border-emerald-300" };
      if (liveScore <= 9) return { label: "Mild Anxiety", color: "text-teal-700 bg-teal-50 border-teal-300" };
      if (liveScore <= 14) return { label: "Moderate Anxiety", color: "text-amber-700 bg-amber-50 border-amber-300" };
      return { label: "Severe Anxiety", color: "text-rose-700 bg-rose-50 border-rose-300" };
    }
  }, [liveScore, answeredCount, screenerType]);

  const handleSelect = (qIdx: number, val: number) => {
    setAnswers((prev) => ({ ...prev, [qIdx]: val }));
  };

  const handleCalculate = () => {
    let recommendation = "";
    if (screenerType === "PHQ-9") {
      if (liveScore <= 4) recommendation = "Maintain baseline self-care habits and daily restful breaks.";
      else if (liveScore <= 9) recommendation = "Consider light exercise, regular sleep routines, and reflective journaling.";
      else if (liveScore <= 14) recommendation = "A confidential consultation with PTC Guidance Center is recommended.";
      else recommendation = "Strongly advise connecting with PTC Guidance or professional health services.";
    } else {
      if (liveScore <= 4) recommendation = "Routine situational stress within normal academic thresholds.";
      else if (liveScore <= 9) recommendation = "Implement Box Breathing and structured academic pacing.";
      else if (liveScore <= 14) recommendation = "Speaking with a campus guidance counselor can offer practical coping frameworks.";
      else recommendation = "High anxiety symptoms. Immediate professional guidance consultation recommended.";
    }

    setResult({
      type: screenerType,
      score: liveScore,
      severity: liveSeverity.label,
      recommendation,
      completedAt: new Date().toISOString(),
    });
  };

  const handleReset = () => {
    setAnswers({});
    setResult(null);
  };

  return (
    <div id="screener-view" className="space-y-4">
      {/* Executive Command Header */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-200 text-teal-700 flex items-center justify-center shrink-0">
            <ClipboardCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-black text-slate-900 tracking-tight">Clinical Psychometric Screener</h2>
              <span className={`text-[10px] font-black px-2 py-0.5 rounded-md border ${liveSeverity.color}`}>
                {liveSeverity.label}
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">Standardized PHQ-9 & GAD-7 Validated Protocols</p>
          </div>
        </div>

        {/* Screener Switcher Buttons */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200 w-full sm:w-auto">
          <button
            onClick={() => { setScreenerType("PHQ-9"); handleReset(); }}
            className={`flex-1 sm:flex-none px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              screenerType === "PHQ-9" ? "bg-white text-teal-800 shadow-2xs" : "text-slate-500"
            }`}
          >
            PHQ-9 (Depression)
          </button>
          <button
            onClick={() => { setScreenerType("GAD-7"); handleReset(); }}
            className={`flex-1 sm:flex-none px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              screenerType === "GAD-7" ? "bg-white text-teal-800 shadow-2xs" : "text-slate-500"
            }`}
          >
            GAD-7 (Anxiety)
          </button>
        </div>
      </div>

      {/* Live Automated Score Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs space-y-2">
        <div className="flex items-center justify-between text-xs font-bold">
          <span className="text-slate-700">Completion: {answeredCount} / {questions.length} Items</span>
          <span className="text-teal-800 font-mono">Live Score: {liveScore} / {maxPossibleScore}</span>
        </div>
        <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
          <motion.div
            className="h-full bg-teal-600 rounded-full"
            animate={{ width: `${(answeredCount / questions.length) * 100}%` }}
            transition={{ duration: 0.2 }}
          />
        </div>
      </div>

      {/* Questionnaire Form */}
      {!result ? (
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs space-y-4">
          <div className="space-y-3">
            {questions.map((q, idx) => {
              const selected = answers[idx];
              return (
                <div
                  key={idx}
                  className={`p-3.5 rounded-xl border transition-all ${
                    selected !== undefined
                      ? "bg-slate-50/80 border-teal-200"
                      : "bg-white border-slate-200"
                  }`}
                >
                  <div className="flex items-start gap-2 mb-2">
                    <span className="text-xs font-black font-mono text-teal-700 shrink-0">
                      {idx + 1}.
                    </span>
                    <p className="text-xs font-bold text-slate-900 leading-snug">{q}</p>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 pt-1">
                    {OPTIONS.map((opt) => {
                      const isOptionSelected = selected === opt.value;
                      return (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => handleSelect(idx, opt.value)}
                          className={`py-1.5 px-2 rounded-lg text-[11px] font-bold transition-all border ${
                            isOptionSelected
                              ? "bg-teal-700 text-white border-teal-800 shadow-2xs"
                              : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                          }`}
                        >
                          {opt.label} ({opt.value})
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={handleReset}
              className="px-3 py-1.5 border border-slate-200 text-xs font-bold text-slate-500 rounded-xl hover:bg-slate-50 flex items-center gap-1"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Clear
            </button>

            <button
              type="button"
              disabled={!isComplete}
              onClick={handleCalculate}
              className="flex items-center gap-2 px-6 py-2 bg-teal-700 hover:bg-teal-800 active:scale-95 disabled:opacity-40 text-white font-black text-xs rounded-xl shadow-xs transition-all min-h-[38px]"
            >
              <CheckCircle2 className="w-4 h-4" />
              Finalize Assessment
            </button>
          </div>
        </div>
      ) : (
        /* Results Report View */
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-2xl border border-teal-300 p-6 shadow-sm space-y-5"
        >
          <div className="flex items-start justify-between border-b border-slate-100 pb-4">
            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-teal-700">Assessment Report</span>
              <h3 className="text-lg font-black text-slate-900">{screenerType} Diagnostic Summary</h3>
            </div>
            <span className={`text-xs font-black px-3 py-1 rounded-xl border ${liveSeverity.color}`}>
              {result.severity}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-center">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Total Score</span>
              <span className="text-2xl font-black text-slate-900 font-mono">{result.score} / {maxPossibleScore}</span>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Clinical Classification</span>
              <span className="text-sm font-black text-teal-900 block mt-1">{result.severity}</span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-teal-50/70 border border-teal-200 text-xs text-teal-950 space-y-1">
            <span className="font-black text-[11px] uppercase tracking-wider text-teal-800 block">Guidance Recommendation:</span>
            <p className="font-medium">{result.recommendation}</p>
          </div>

          <div className="flex items-center justify-between pt-2">
            <button
              onClick={handleReset}
              className="px-4 py-2 border border-slate-200 text-xs font-bold text-slate-600 rounded-xl hover:bg-slate-50"
            >
              Retake Assessment
            </button>

            {onNavigateGuidance && (
              <button
                onClick={onNavigateGuidance}
                className="flex items-center gap-1.5 px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold rounded-xl"
              >
                <Building2 className="w-3.5 h-3.5" />
                Contact Guidance Office
              </button>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
};
