import React, { useState } from "react";
import { ClipboardCheck, AlertTriangle, ShieldCheck, CheckCircle2, ChevronRight, RotateCcw, ArrowRight, Building2 } from "lucide-react";
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
  { label: "More than half the days", value: 2 },
  { label: "Nearly every day", value: 3 },
];

export const StandardizedScreener: React.FC<StandardizedScreenerProps> = ({ onNavigateGuidance }) => {
  const [screenerType, setScreenerType] = useState<"PHQ-9" | "GAD-7">("PHQ-9");
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [result, setResult] = useState<ScreenerResult | null>(null);

  const questions = screenerType === "PHQ-9" ? PHQ9_QUESTIONS : GAD7_QUESTIONS;
  const isComplete = questions.every((_, idx) => answers[idx] !== undefined);

  const handleSelect = (qIdx: number, val: number) => {
    setAnswers((prev) => ({ ...prev, [qIdx]: val }));
  };

  const handleCalculate = () => {
    const totalScore: number = (Object.values(answers) as number[]).reduce((a, b) => a + b, 0);

    let severity = "Minimal";
    let interpretation = "";
    let recommendation = "";

    if (screenerType === "PHQ-9") {
      if (totalScore <= 4) {
        severity = "Minimal depression symptoms";
        interpretation = "Your responses indicate healthy emotional stability.";
        recommendation = "Continue your positive daily self-care habits and mindful pauses.";
      } else if (totalScore <= 9) {
        severity = "Mild depression symptoms";
        interpretation = "You may be experiencing temporary academic stress or fatigue.";
        recommendation = "Consider light exercise, regular sleep schedules, and journaling.";
      } else if (totalScore <= 14) {
        severity = "Moderate depression symptoms";
        interpretation = "Notable stress or mood dampening affecting your academic routine.";
        recommendation = "Scheduling a supportive conversation with the PTC Guidance Center is recommended.";
      } else {
        severity = "Moderately Severe / Severe";
        interpretation = "Elevated symptoms of persistent distress.";
        recommendation = "We strongly urge connecting with PTC Guidance or an external healthcare professional.";
      }
    } else {
      if (totalScore <= 4) {
        severity = "Minimal anxiety";
        interpretation = "Standard baseline levels of situational worry.";
        recommendation = "Keep up your regular academic pacing and relaxation routines.";
      } else if (totalScore <= 9) {
        severity = "Mild anxiety";
        interpretation = "You might be feeling elevated pressure around assignments or campus life.";
        recommendation = "Try our Box Breathing exercises and grounding mindfulness.";
      } else if (totalScore <= 14) {
        severity = "Moderate anxiety";
        interpretation = "Significant worry or restlessness that could hinder focus.";
        recommendation = "Speaking with a campus counselor can provide practical coping strategies.";
      } else {
        severity = "Severe anxiety";
        interpretation = "Intense anxiety that demands structured professional care.";
        recommendation = "Reach out promptly to PTC Guidance or call national mental health hotlines.";
      }
    }

    const finalResult: ScreenerResult = {
      id: "scr-" + Date.now(),
      timestamp: new Date().toISOString(),
      type: screenerType,
      score: totalScore,
      maxScore: questions.length * 3,
      severity,
      interpretation,
      recommendation,
    };

    setResult(finalResult);

    // Save to local storage history
    try {
      const existing = JSON.parse(localStorage.getItem("mentally_screeners") || "[]");
      localStorage.setItem("mentally_screeners", JSON.stringify([finalResult, ...existing]));
    } catch {}
  };

  const handleReset = () => {
    setAnswers({});
    setResult(null);
  };

  return (
    <div id="screener-view" className="space-y-6">
      {/* Header & Disclaimer */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center">
              <ClipboardCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Standardized Wellness Screeners</h2>
              <p className="text-xs text-slate-500">Clinically validated self-assessment questionnaires</p>
            </div>
          </div>
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => { setScreenerType("PHQ-9"); handleReset(); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                screenerType === "PHQ-9" ? "bg-white text-teal-700 shadow-xs" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              PHQ-9 (Mood)
            </button>
            <button
              onClick={() => { setScreenerType("GAD-7"); handleReset(); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                screenerType === "GAD-7" ? "bg-white text-teal-700 shadow-xs" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              GAD-7 (Anxiety)
            </button>
          </div>
        </div>

        <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-xl flex items-start gap-2 text-xs text-amber-900">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong className="font-semibold">Educational self-check:</strong> These questionnaires are standardized screening instruments designed to help you reflect on your mental wellness over the last 2 weeks. They are not medical diagnostic tools.
          </p>
        </div>
      </div>

      {/* Result Card if calculated */}
      {result ? (
        <div className="bg-white rounded-2xl border border-teal-200 p-6 shadow-md space-y-5 animate-in fade-in">
          <div className="flex items-start justify-between border-b border-slate-100 pb-4">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-teal-600">
                {result.type} Assessment Results
              </span>
              <h3 className="text-xl font-black text-slate-900 mt-1">
                Score: {result.score} / {result.maxScore}
              </h3>
              <p className="text-xs font-bold text-teal-800 mt-0.5">{result.severity}</p>
            </div>
            <button
              onClick={handleReset}
              className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-800 font-semibold px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Retake
            </button>
          </div>

          <div className="space-y-3 text-xs leading-relaxed text-slate-700">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <strong className="text-slate-900 block mb-1">Interpretation:</strong>
              <p>{result.interpretation}</p>
            </div>

            <div className="p-3.5 rounded-xl bg-teal-50/50 border border-teal-100 text-teal-900">
              <strong className="text-teal-950 block mb-1">Suggested Next Step:</strong>
              <p>{result.recommendation}</p>
            </div>
          </div>

          {onNavigateGuidance && (
            <div className="pt-2">
              <button
                onClick={onNavigateGuidance}
                className="w-full py-3 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs shadow-xs flex items-center justify-center gap-2 transition-colors"
              >
                <Building2 className="w-4 h-4" />
                <span>Contact PTC Guidance & Counseling Office</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      ) : (
        /* Questions List */
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-slate-900">
              Over the last 2 weeks, how often have you been bothered by any of the following problems?
            </h3>
            <p className="text-xs text-slate-500">Answer honestly for your own wellness awareness.</p>
          </div>

          <div className="space-y-4">
            {questions.map((q, idx) => (
              <div key={idx} className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 space-y-3">
                <p className="text-xs font-semibold text-slate-800">
                  <span className="text-teal-700 font-bold mr-1.5">{idx + 1}.</span> {q}
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {OPTIONS.map((opt) => {
                    const isSelected = answers[idx] === opt.value;
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => handleSelect(idx, opt.value)}
                        className={`p-2.5 rounded-xl text-xs font-semibold border transition-all text-center ${
                          isSelected
                            ? "bg-teal-700 text-white border-teal-700 shadow-xs"
                            : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                        }`}
                      >
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-100">
            <span className="text-xs text-slate-500">
              Answered: {Object.keys(answers).length} / {questions.length}
            </span>
            <button
              onClick={handleCalculate}
              disabled={!isComplete}
              className="px-6 py-2.5 rounded-xl bg-teal-700 hover:bg-teal-800 disabled:opacity-40 text-white font-bold text-xs transition-colors flex items-center gap-1.5"
            >
              <span>Calculate Score</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
