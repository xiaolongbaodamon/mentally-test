import React, { useState } from "react";
import { 
  Sparkles, 
  HelpCircle, 
  CheckCircle2, 
  Trash2, 
  Plus, 
  BrainCircuit,
  ArrowRight,
  BookOpen
} from "lucide-react";
import { COGNITIVE_DISTORTIONS } from "../data/ptcData";
import { CBTThoughtRecord } from "../types";

export const CBTWorksheet: React.FC = () => {
  const [records, setRecords] = useState<CBTThoughtRecord[]>(() => {
    try {
      const saved = localStorage.getItem("mentally_cbt_records");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.filter((r: any) => r && r.id !== "cbt-1");
        }
      }
      return [];
    } catch {
      return [];
    }
  });

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [step, setStep] = useState(1);

  // Form State
  const [situation, setSituation] = useState("");
  const [automaticThought, setAutomaticThought] = useState("");
  const [emotion, setEmotion] = useState("");
  const [cognitiveDistortion, setCognitiveDistortion] = useState(COGNITIVE_DISTORTIONS[0].name);
  const [evidenceAgainst, setEvidenceAgainst] = useState("");
  const [balancedThought, setBalancedThought] = useState("");
  const [outcomeEmotion, setOutcomeEmotion] = useState("");

  const handleSaveRecord = () => {
    if (!situation.trim() || !automaticThought.trim() || !balancedThought.trim()) return;

    const newRecord: CBTThoughtRecord = {
      id: "cbt-" + Date.now(),
      timestamp: new Date().toISOString(),
      situation,
      automaticThought,
      emotion: emotion || "Stressed (7/10)",
      cognitiveDistortion,
      evidenceAgainst: evidenceAgainst || "Recognized that thoughts are hypotheses, not facts.",
      balancedThought,
      outcomeEmotion: outcomeEmotion || "Relieved (3/10)",
    };

    const updated = [newRecord, ...records];
    setRecords(updated);
    try {
      localStorage.setItem("mentally_cbt_records", JSON.stringify(updated));
    } catch {}

    // Reset
    setSituation("");
    setAutomaticThought("");
    setEmotion("");
    setEvidenceAgainst("");
    setBalancedThought("");
    setOutcomeEmotion("");
    setStep(1);
    setIsFormOpen(false);
  };

  const handleDelete = (id: string) => {
    const updated = records.filter((r) => r.id !== id);
    setRecords(updated);
    try {
      localStorage.setItem("mentally_cbt_records", JSON.stringify(updated));
    } catch {}
  };

  return (
    <div id="cbt-worksheet" className="space-y-6 animate-in fade-in duration-200">
      {/* Introduction Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-teal-700 text-xs font-bold uppercase tracking-wider">
            <BrainCircuit className="w-4 h-4" />
            <span>Cognitive Restructuring Tool</span>
          </div>
          <h3 className="text-lg font-bold text-slate-900">Academic Thought Reframing</h3>
          <p className="text-xs text-slate-600 max-w-xl leading-relaxed">
            When academic pressure spikes, our minds default to cognitive distortions. 
            Use this 5-step CBT framework to challenge automatic negative college thoughts with objective evidence.
          </p>
        </div>

        <button
          onClick={() => setIsFormOpen(!isFormOpen)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-xs transition-colors shrink-0"
        >
          <Plus className="w-4 h-4" />
          {isFormOpen ? "Cancel Entry" : "New Thought Record"}
        </button>
      </div>

      {/* Guided 5-Step Form */}
      {isFormOpen && (
        <div className="bg-white rounded-2xl border-2 border-teal-500 p-6 shadow-md space-y-6 animate-in fade-in duration-200">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-teal-100 text-teal-800 text-xs flex items-center justify-center font-bold">
                {step}
              </span>
              Step {step} of 4: {step === 1 ? "The Situation & Emotion" : step === 2 ? "Automatic Thought & Distortion" : step === 3 ? "Challenging the Evidence" : "Balanced Reframe"}
            </h4>
            <div className="flex gap-1">
              {[1, 2, 3, 4].map((s) => (
                <div
                  key={s}
                  className={`w-6 h-1.5 rounded-full ${s <= step ? "bg-teal-600" : "bg-slate-200"}`}
                />
              ))}
            </div>
          </div>

          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  1. What situation or academic event triggered your distress?
                </label>
                <input
                  type="text"
                  placeholder="e.g., Thesis topic defense question by professor, groupmate not replying, upcoming lab exam..."
                  value={situation}
                  onChange={(e) => setSituation(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  2. What emotion are you feeling, and what is its intensity (1-10)?
                </label>
                <input
                  type="text"
                  placeholder="e.g., Anxiety (8/10), Humiliation (7/10), Panic (9/10)"
                  value={emotion}
                  onChange={(e) => setEmotion(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="flex justify-end pt-2">
                <button
                  disabled={!situation.trim()}
                  onClick={() => setStep(2)}
                  className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 disabled:bg-slate-200 text-white text-xs font-bold"
                >
                  Next Step <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  3. What is the automatic thought or worst-case scenario your mind tells you?
                </label>
                <textarea
                  rows={3}
                  placeholder="e.g., 'Everyone in my section thinks I'm incompetent' or 'If I can't debug this today, my whole capstone is ruined'"
                  value={automaticThought}
                  onChange={(e) => setAutomaticThought(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  4. Which cognitive trap matches this thought best?
                </label>
                <select
                  value={cognitiveDistortion}
                  onChange={(e) => setCognitiveDistortion(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                >
                  {COGNITIVE_DISTORTIONS.map((d) => (
                    <option key={d.name} value={d.name}>
                      {d.name} — {d.description.slice(0, 75)}...
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-between pt-2">
                <button
                  onClick={() => setStep(1)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  Back
                </button>
                <button
                  disabled={!automaticThought.trim()}
                  onClick={() => setStep(3)}
                  className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 disabled:bg-slate-200 text-white text-xs font-bold"
                >
                  Next Step <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  5. What objective evidence or past experiences contradict this thought?
                </label>
                <textarea
                  rows={3}
                  placeholder="e.g., In previous semesters I also struggled with prelims but passed. My professor offered office consultation. One setback doesn't erase all my accomplishments."
                  value={evidenceAgainst}
                  onChange={(e) => setEvidenceAgainst(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="flex justify-between pt-2">
                <button
                  onClick={() => setStep(2)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  Back
                </button>
                <button
                  onClick={() => setStep(4)}
                  className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold"
                >
                  Next Step <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  6. What is a realistic, balanced, compassionate reframe?
                </label>
                <textarea
                  rows={3}
                  placeholder="e.g., 'I am facing a challenging concept, but I have the resourcefulness to consult my instructor, study with peers, and take it one step at a time.'"
                  value={balancedThought}
                  onChange={(e) => setBalancedThought(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  7. How do you feel now after reframing (1-10)?
                </label>
                <input
                  type="text"
                  placeholder="e.g., Calmer (4/10), Reassured (2/10 anxiety)"
                  value={outcomeEmotion}
                  onChange={(e) => setOutcomeEmotion(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="flex justify-between pt-2">
                <button
                  onClick={() => setStep(3)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  Back
                </button>
                <button
                  disabled={!balancedThought.trim()}
                  onClick={handleSaveRecord}
                  className="flex items-center gap-1.5 px-6 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 disabled:bg-slate-200 text-white text-xs font-bold shadow-xs"
                >
                  Save Thought Reframe
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Common Cognitive Distortions Glossary Pill Deck */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-3">
        <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
          <BookOpen className="w-4 h-4 text-teal-600" />
          Common College Student Cognitive Traps
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {COGNITIVE_DISTORTIONS.map((cd, idx) => (
            <div key={idx} className="p-3 bg-white rounded-xl border border-slate-200 space-y-1">
              <span className="text-xs font-bold text-teal-900 block">{cd.name}</span>
              <p className="text-[11px] text-slate-600 leading-relaxed">{cd.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Saved Thought Records */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
          Saved Thought Reframes ({records.length})
        </h4>

        {records.length === 0 ? (
          <div className="text-center py-10 bg-white rounded-2xl border border-slate-200 p-6">
            <p className="text-xs text-slate-500">No thought records logged yet. Click "New Thought Record" to reframe an academic anxiety.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {records.map((r) => (
              <div key={r.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
                <div className="flex items-start justify-between border-b border-slate-100 pb-3">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                      Trap: {r.cognitiveDistortion}
                    </span>
                    <span className="text-[11px] text-slate-400 ml-2">
                      {new Date(r.timestamp).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                    </span>
                    <h5 className="text-xs font-bold text-slate-900 mt-1">Situation: {r.situation}</h5>
                  </div>
                  <button
                    onClick={() => handleDelete(r.id)}
                    className="text-slate-400 hover:text-rose-600 p-1"
                    title="Delete record"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-rose-50/50 border border-rose-100 rounded-xl space-y-1">
                    <span className="text-[10px] font-bold uppercase text-rose-800 tracking-wider block">
                      Automatic Negative Thought
                    </span>
                    <p className="text-slate-800 leading-relaxed italic">"{r.automaticThought}"</p>
                    <span className="text-[10px] text-rose-600 block pt-1 font-semibold">Initial: {r.emotion}</span>
                  </div>

                  <div className="p-3 bg-emerald-50/50 border border-emerald-100 rounded-xl space-y-1">
                    <span className="text-[10px] font-bold uppercase text-emerald-800 tracking-wider block">
                      Constructive Reframe
                    </span>
                    <p className="text-slate-800 leading-relaxed font-medium">"{r.balancedThought}"</p>
                    <span className="text-[10px] text-emerald-700 block pt-1 font-semibold">Outcome: {r.outcomeEmotion}</span>
                  </div>
                </div>

                {r.evidenceAgainst && (
                  <div className="text-[11px] text-slate-600 bg-slate-50 p-2.5 rounded-lg">
                    <strong>Evidence Considered:</strong> {r.evidenceAgainst}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
