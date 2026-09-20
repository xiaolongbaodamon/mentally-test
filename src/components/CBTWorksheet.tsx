import React, { useState, useMemo } from "react";
import { 
  Sparkles, 
  HelpCircle, 
  CheckCircle2, 
  Trash2, 
  Plus, 
  BrainCircuit,
  ArrowRight,
  BookOpen,
  Zap,
  Activity,
  ChevronRight
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
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

  // Automated Cognitive Distortion Scanner
  const autoDetectedDistortion = useMemo(() => {
    const text = automaticThought.toLowerCase();
    if (!text.trim()) return null;

    if (/\b(always|never|everyone|nobody|everything|nothing|completely)\b/.test(text)) {
      return {
        name: "All-or-Nothing Thinking",
        hint: "Detected absolute words ('always', 'never'). Thoughts may be polarized.",
      };
    }
    if (/\b(ruined|disaster|terrible|worst|hopeless|fail|failure|end of the world)\b/.test(text)) {
      return {
        name: "Catastrophizing",
        hint: "Detected catastrophic terms. Predicting worst-case outcomes.",
      };
    }
    if (/\b(they think|he thinks|she thinks|everyone knows|judging me|they hate)\b/.test(text)) {
      return {
        name: "Mind Reading",
        hint: "Detected assumption of others' unspoken thoughts without concrete proof.",
      };
    }
    if (/\b(should|must|ought|have to)\b/.test(text)) {
      return {
        name: "Should Statements",
        hint: "Detected rigid rules ('should', 'must') that create undue guilt.",
      };
    }
    if (/\b(my fault|blame myself|because of me)\b/.test(text)) {
      return {
        name: "Personalization",
        hint: "Detected self-blame for events beyond direct individual control.",
      };
    }

    return null;
  }, [automaticThought]);

  const handleApplyDetected = (name: string) => {
    setCognitiveDistortion(name);
  };

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
    <div id="cbt-worksheet" className="space-y-4">
      {/* Top Header */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-200 text-teal-700 flex items-center justify-center shrink-0">
            <BrainCircuit className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-black text-slate-900 tracking-tight">CBT Thought Restructuring</h2>
              <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
                {records.length} {records.length === 1 ? "Record" : "Records"}
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">Cognitive Distortion & Reframing Tool</p>
          </div>
        </div>

        <button
          id="open-cbt-modal-btn"
          onClick={() => {
            setIsFormOpen(!isFormOpen);
            setStep(1);
          }}
          className="flex items-center justify-center gap-1.5 px-4 py-2 bg-teal-700 hover:bg-teal-800 active:scale-95 text-white text-xs font-bold rounded-xl shadow-xs transition-all w-full sm:w-auto min-h-[38px]"
        >
          {isFormOpen ? "Close Workflow" : <><Plus className="w-4 h-4" /> New Reframe</>}
        </button>
      </div>

      {/* Structured Multi-Step Reframe Form */}
      <AnimatePresence>
        {isFormOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-white rounded-2xl border border-teal-300 p-5 shadow-sm space-y-4"
          >
            {/* Step Progress Pills */}
            <div className="grid grid-cols-3 gap-2 pb-2 border-b border-slate-100">
              <div className={`p-2 rounded-xl text-center border text-xs font-bold transition-all ${step === 1 ? "bg-teal-50 border-teal-300 text-teal-800" : "bg-slate-50 border-slate-200 text-slate-400"}`}>
                1. Trigger & Thought
              </div>
              <div className={`p-2 rounded-xl text-center border text-xs font-bold transition-all ${step === 2 ? "bg-teal-50 border-teal-300 text-teal-800" : "bg-slate-50 border-slate-200 text-slate-400"}`}>
                2. Distortion & Evidence
              </div>
              <div className={`p-2 rounded-xl text-center border text-xs font-bold transition-all ${step === 3 ? "bg-teal-50 border-teal-300 text-teal-800" : "bg-slate-50 border-slate-200 text-slate-400"}`}>
                3. Balanced Perspective
              </div>
            </div>

            {/* Step 1: Situation & Automatic Thought */}
            {step === 1 && (
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                    Activating Event / Situation
                  </label>
                  <input
                    type="text"
                    value={situation}
                    onChange={(e) => setSituation(e.target.value)}
                    placeholder="e.g. Received a low score on quiz, or groupmate didn't reply..."
                    className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:border-teal-600 font-medium text-slate-800"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                    Automatic Negative Thought
                  </label>
                  <textarea
                    rows={3}
                    value={automaticThought}
                    onChange={(e) => setAutomaticThought(e.target.value)}
                    placeholder="What did your brain immediately tell you? (e.g. 'I will always fail at this course...')"
                    className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:border-teal-600 font-medium text-slate-800 resize-none"
                  />
                </div>

                {/* Automated Distortion Scanner Banner */}
                {autoDetectedDistortion && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-3 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-2 text-amber-900">
                      <Zap className="w-4 h-4 text-amber-600 shrink-0" />
                      <div>
                        <span className="font-bold">Detected Pattern: </span>
                        <span className="font-black text-amber-950">{autoDetectedDistortion.name}</span>
                        <p className="text-[11px] text-amber-800 mt-0.5">{autoDetectedDistortion.hint}</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleApplyDetected(autoDetectedDistortion.name)}
                      className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white font-bold text-[11px] rounded-lg shadow-2xs shrink-0 transition-colors"
                    >
                      Use Suggestion
                    </button>
                  </motion.div>
                )}

                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                    Initial Emotion & Intensity (1-10)
                  </label>
                  <input
                    type="text"
                    value={emotion}
                    onChange={(e) => setEmotion(e.target.value)}
                    placeholder="e.g. Anxiety (8/10), Embarrassment (7/10)"
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:border-teal-600 font-medium text-slate-800"
                  />
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="button"
                    disabled={!situation.trim() || !automaticThought.trim()}
                    onClick={() => setStep(2)}
                    className="flex items-center gap-1.5 px-4 py-2 bg-teal-700 hover:bg-teal-800 active:scale-95 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition-all"
                  >
                    <span>Proceed to Evidence</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Distortion & Evidence Examination */}
            {step === 2 && (
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                    Selected Cognitive Distortion
                  </label>
                  <select
                    value={cognitiveDistortion}
                    onChange={(e) => setCognitiveDistortion(e.target.value)}
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:border-teal-600 font-bold text-slate-800"
                  >
                    {COGNITIVE_DISTORTIONS.map((d) => (
                      <option key={d.name} value={d.name}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                    Counter-Evidence (Facts challenging this thought)
                  </label>
                  <textarea
                    rows={3}
                    value={evidenceAgainst}
                    onChange={(e) => setEvidenceAgainst(e.target.value)}
                    placeholder="What evidence shows this automatic thought isn't 100% factual? Have you overcome similar obstacles before?"
                    className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:border-teal-600 font-medium text-slate-800 resize-none"
                  />
                </div>

                <div className="flex justify-between pt-2">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="px-3 py-1.5 border border-slate-200 text-xs font-bold text-slate-600 rounded-xl hover:bg-slate-50"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={() => setStep(3)}
                    className="flex items-center gap-1.5 px-4 py-2 bg-teal-700 hover:bg-teal-800 active:scale-95 text-white text-xs font-bold rounded-xl transition-all"
                  >
                    <span>Form Balanced Thought</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Balanced Perspective */}
            {step === 3 && (
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                    Realistic, Balanced Perspective
                  </label>
                  <textarea
                    rows={3}
                    value={balancedThought}
                    onChange={(e) => setBalancedThought(e.target.value)}
                    placeholder="A grounded, constructive replacement thought (e.g. 'One quiz does not define my degree. I can review the missed concepts and consult my professor.')"
                    className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:border-teal-600 font-medium text-slate-800 resize-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                    Outcome Emotion & Rating (1-10)
                  </label>
                  <input
                    type="text"
                    value={outcomeEmotion}
                    onChange={(e) => setOutcomeEmotion(e.target.value)}
                    placeholder="e.g. Relief (3/10), Motivated (6/10)"
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:border-teal-600 font-medium text-slate-800"
                  />
                </div>

                <div className="flex justify-between pt-2">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="px-3 py-1.5 border border-slate-200 text-xs font-bold text-slate-600 rounded-xl hover:bg-slate-50"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    disabled={!balancedThought.trim()}
                    onClick={handleSaveRecord}
                    className="flex items-center gap-1.5 px-5 py-2 bg-teal-700 hover:bg-teal-800 active:scale-95 disabled:opacity-50 text-white text-xs font-black rounded-xl shadow-xs transition-all"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Save Reframe
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stored Records List */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-xs space-y-3">
        {records.length === 0 ? (
          <div className="text-center py-10 px-4">
            <BrainCircuit className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-xs font-bold text-slate-600">No CBT Records Stored</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Click "New Reframe" above to challenge an unhelpful thought.</p>
          </div>
        ) : (
          records.map((r) => (
            <div
              key={r.id}
              className="p-4 rounded-xl border border-slate-200 bg-white hover:border-teal-300 transition-all space-y-2.5"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200 uppercase">
                    {r.cognitiveDistortion}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {new Date(r.timestamp).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                  </span>
                </div>
                <button
                  onClick={() => handleDelete(r.id)}
                  className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                  title="Delete Record"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="font-bold text-slate-500 uppercase tracking-wider text-[10px] block mb-1">Automatic Thought:</span>
                  <p className="text-slate-800 italic">"{r.automaticThought}"</p>
                  <span className="text-[10px] text-rose-700 font-bold block mt-1.5">Initial: {r.emotion}</span>
                </div>

                <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200/80">
                  <span className="font-bold text-emerald-800 uppercase tracking-wider text-[10px] block mb-1">Balanced Reframe:</span>
                  <p className="text-emerald-950 font-medium">{r.balancedThought}</p>
                  <span className="text-[10px] text-emerald-700 font-bold block mt-1.5">Outcome: {r.outcomeEmotion}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
