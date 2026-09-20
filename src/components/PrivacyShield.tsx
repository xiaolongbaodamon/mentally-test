import React, { useState } from "react";
import { Lock, Unlock, EyeOff, ShieldCheck, BookOpen, KeyRound, AlertCircle } from "lucide-react";

interface PrivacyShieldProps {
  isLocked: boolean;
  onUnlock: () => void;
  onLock: () => void;
  isCamouflageActive: boolean;
  onToggleCamouflage: () => void;
}

export const PrivacyShield: React.FC<PrivacyShieldProps> = ({
  isLocked,
  onUnlock,
  onLock,
  isCamouflageActive,
  onToggleCamouflage,
}) => {
  const [pinInput, setPinInput] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const savedPin = localStorage.getItem("mentally_pin") || "1234";

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput === savedPin || pinInput === "1234") {
      onUnlock();
      setPinInput("");
      setErrorMsg("");
    } else {
      setErrorMsg("Incorrect security PIN. (Default is 1234)");
      setPinInput("");
    }
  };

  // Camouflage screen (Disguises app as a college study note/syllabus viewer)
  if (isCamouflageActive) {
    return (
      <div className="fixed inset-0 z-50 bg-slate-50 flex flex-col p-6 font-sans text-slate-800 overflow-y-auto">
        <div className="max-w-3xl mx-auto w-full space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-200">
            <div className="flex items-center gap-3">
              <BookOpen className="w-6 h-6 text-slate-700" />
              <div>
                <h1 className="text-lg font-bold text-slate-900">IT 301: Database Management Systems - Syllabus</h1>
                <p className="text-xs text-slate-500">Pateros Technological College • Academic Semester Notes</p>
              </div>
            </div>
            <button
              onClick={onToggleCamouflage}
              className="px-3 py-1.5 rounded-lg bg-slate-200 hover:bg-slate-300 text-xs font-semibold text-slate-700 transition-colors"
            >
              Exit Reading Mode
            </button>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4 text-xs leading-relaxed text-slate-700">
            <h2 className="text-sm font-bold text-slate-900">Module 4: Relational Algebra and SQL Normalization</h2>
            <p>
              Relational databases organize collections of structured data into tables consisting of rows and columns.
              First Normal Form (1NF) mandates that each column must contain atomic values and each record must be unique.
            </p>
            <p>
              Second Normal Form (2NF) ensures no non-prime attribute is functionally dependent on a candidate key's proper subset.
              Third Normal Form (3NF) eliminates transitive dependency between non-prime attributes.
            </p>
            <div className="bg-slate-100 p-4 rounded-lg font-mono text-[11px] text-slate-800">
              SELECT student_id, course_name, final_grade FROM enrollments WHERE semester = '2026-1' ORDER BY final_grade DESC;
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Lock Screen
  if (isLocked) {
    return (
      <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
        <div className="w-full max-w-sm bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200 text-center space-y-5 animate-in fade-in zoom-in-95">
          <div className="w-14 h-14 bg-teal-50 text-teal-700 rounded-2xl mx-auto flex items-center justify-center shadow-xs">
            <Lock className="w-7 h-7" />
          </div>

          <div>
            <h3 className="text-lg font-bold text-slate-900">Privacy Shield Active</h3>
            <p className="text-xs text-slate-500 mt-1">
              Your mental wellness logs are locked. Enter your 4-digit PIN to continue.
            </p>
          </div>

          {errorMsg && (
            <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2 justify-center">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleUnlock} className="space-y-4">
            <div className="relative">
              <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="password"
                maxLength={6}
                autoFocus
                placeholder="Enter PIN (Default: 1234)"
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-center text-sm tracking-widest focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs shadow-md transition-colors flex items-center justify-center gap-1.5"
            >
              <Unlock className="w-4 h-4" />
              <span>Unlock MentAlly</span>
            </button>
          </form>

          <p className="text-[10px] text-slate-400">
            Forgot your PIN? Default is <span className="font-mono font-bold text-slate-600">1234</span>
          </p>
        </div>
      </div>
    );
  }

  return null;
};
