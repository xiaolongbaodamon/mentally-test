import React, { useState, useEffect, useRef } from "react";
import { 
  Wind, 
  Compass, 
  Volume2, 
  VolumeX, 
  Play, 
  Pause, 
  RotateCcw, 
  CheckCircle2, 
  Clock, 
  Sparkles,
  Zap,
  Activity,
  Check
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface SelfCareActivitiesProps {
  onActivityCompleted?: (name: string) => void;
  defaultSubTab?: "breathing" | "grounding" | "ambient";
}

export const SelfCareActivities: React.FC<SelfCareActivitiesProps> = ({
  onActivityCompleted,
  defaultSubTab = "breathing",
}) => {
  const [activeSubTab, setActiveSubTab] = useState<"breathing" | "grounding" | "ambient">(defaultSubTab);

  // Breathing state & Automation
  const [breathingMode, setBreathingMode] = useState<"box" | "478">("box");
  const [breathingPhase, setBreathingPhase] = useState<"Inhale" | "Hold" | "Exhale" | "Rest">("Inhale");
  const [breathingSeconds, setBreathingSeconds] = useState(4);
  const [isBreathingActive, setIsBreathingActive] = useState(false);
  const [completedCycles, setCompletedCycles] = useState(0);

  // Grounding state
  const [groundingStep, setGroundingStep] = useState(0);
  const [checkedItems, setCheckedItems] = useState<Record<number, boolean[]>>({
    0: [false, false, false, false, false], // 5 things you see
    1: [false, false, false, false],        // 4 things you feel
    2: [false, false, false],               // 3 things you hear
    3: [false, false],                      // 2 things you smell
    4: [false],                             // 1 positive thing you tell yourself
  });

  // Ambient sound (Web Audio API Synthesizer)
  const [isPlayingAmbient, setIsPlayingAmbient] = useState(false);
  const [ambientType, setAmbientType] = useState<"calm" | "rain" | "waves">("calm");
  const audioCtxRef = useRef<AudioContext | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const oscNodesRef = useRef<any[]>([]);

  useEffect(() => {
    setActiveSubTab(defaultSubTab);
  }, [defaultSubTab]);

  // Breathing loop timer with Phase Durations
  useEffect(() => {
    if (!isBreathingActive) return;

    const interval = setInterval(() => {
      setBreathingSeconds((prev) => {
        if (prev > 1) return prev - 1;

        if (breathingMode === "box") {
          // Box Breathing: 4-4-4-4
          if (breathingPhase === "Inhale") {
            setBreathingPhase("Hold");
            return 4;
          } else if (breathingPhase === "Hold") {
            setBreathingPhase("Exhale");
            return 4;
          } else if (breathingPhase === "Exhale") {
            setBreathingPhase("Rest");
            return 4;
          } else {
            setBreathingPhase("Inhale");
            setCompletedCycles((c) => {
              const next = c + 1;
              if (next % 3 === 0) onActivityCompleted?.("Box Breathing");
              return next;
            });
            return 4;
          }
        } else {
          // 4-7-8 Breathing
          if (breathingPhase === "Inhale") {
            setBreathingPhase("Hold");
            return 7;
          } else if (breathingPhase === "Hold") {
            setBreathingPhase("Exhale");
            return 8;
          } else {
            setBreathingPhase("Inhale");
            setCompletedCycles((c) => {
              const next = c + 1;
              if (next % 3 === 0) onActivityCompleted?.("4-7-8 Breathing");
              return next;
            });
            return 4;
          }
        }
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isBreathingActive, breathingPhase, breathingMode, onActivityCompleted]);

  // Ambient Sound Generator
  const toggleAmbientSound = () => {
    if (isPlayingAmbient) {
      try {
        oscNodesRef.current.forEach((node) => {
          try { node.stop(); node.disconnect(); } catch {}
        });
        oscNodesRef.current = [];
        if (audioCtxRef.current && audioCtxRef.current.state !== "closed") {
          audioCtxRef.current.close();
        }
      } catch {}
      setIsPlayingAmbient(false);
    } else {
      try {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        const ctx = new AudioCtx();
        audioCtxRef.current = ctx;

        const gainNode = ctx.createGain();
        gainNode.gain.setValueAtTime(0.08, ctx.currentTime);
        gainNode.connect(ctx.destination);
        gainNodeRef.current = gainNode;

        const osc1 = ctx.createOscillator();
        osc1.type = "sine";
        osc1.frequency.setValueAtTime(ambientType === "calm" ? 174 : ambientType === "rain" ? 216 : 144, ctx.currentTime);

        const osc2 = ctx.createOscillator();
        osc2.type = "sine";
        osc2.frequency.setValueAtTime(ambientType === "calm" ? 178 : ambientType === "rain" ? 220 : 147, ctx.currentTime);

        osc1.connect(gainNode);
        osc2.connect(gainNode);

        osc1.start();
        osc2.start();
        oscNodesRef.current = [osc1, osc2];
        setIsPlayingAmbient(true);
      } catch (err) {
        console.warn("Web Audio initialization issue:", err);
      }
    }
  };

  useEffect(() => {
    return () => {
      if (audioCtxRef.current && audioCtxRef.current.state !== "closed") {
        try { audioCtxRef.current.close(); } catch {}
      }
    };
  }, []);

  // Grounding Check Toggle & Auto-Advance
  const toggleGroundingItem = (stepIdx: number, itemIdx: number) => {
    const list = [...(checkedItems[stepIdx] || [])];
    list[itemIdx] = !list[itemIdx];
    const updated = { ...checkedItems, [stepIdx]: list };
    setCheckedItems(updated);

    // Auto-advance if all items in current step are checked
    if (list.every(Boolean) && stepIdx < 4) {
      setTimeout(() => setGroundingStep(stepIdx + 1), 400);
    } else if (list.every(Boolean) && stepIdx === 4) {
      onActivityCompleted?.("5-4-3-2-1 Grounding");
    }
  };

  const groundingPrompts = [
    { num: 5, sense: "Sight", title: "5 Things You Can See", hint: "Notice details around you (a pen, notebook, shadow, window, clock)." },
    { num: 4, sense: "Touch", title: "4 Things You Can Physically Feel", hint: "Feel texture of your desk, your feet on the floor, your sweater, or air temperature." },
    { num: 3, sense: "Hearing", title: "3 Things You Can Hear", hint: "Listen closely: AC hum, distant chatter, keyboard typing, or bird outside." },
    { num: 2, sense: "Smell", title: "2 Things You Can Smell", hint: "Detect ambient aromas: coffee, fresh air, paper, or hand sanitizer." },
    { num: 1, sense: "Grounding", title: "1 Positive Fact / Reassurance", hint: "Affirm: 'I am safe here at PTC right now. I can handle this moment.'" },
  ];

  return (
    <div id="self-care-view" className="space-y-4">
      {/* View Switcher Bar */}
      <div className="flex items-center gap-1.5 bg-white p-1.5 rounded-2xl border border-slate-200/90 shadow-xs">
        <button
          onClick={() => setActiveSubTab("breathing")}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
            activeSubTab === "breathing"
              ? "bg-teal-700 text-white shadow-2xs"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <Wind className="w-3.5 h-3.5" />
          <span>Breathing Pacer</span>
        </button>

        <button
          onClick={() => setActiveSubTab("grounding")}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
            activeSubTab === "grounding"
              ? "bg-teal-700 text-white shadow-2xs"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <Compass className="w-3.5 h-3.5" />
          <span>5-4-3-2-1 Grounding</span>
        </button>

        <button
          onClick={() => setActiveSubTab("ambient")}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
            activeSubTab === "ambient"
              ? "bg-teal-700 text-white shadow-2xs"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <Volume2 className="w-3.5 h-3.5" />
          <span>Calm Soundscape</span>
        </button>
      </div>

      {/* Subtab 1: Automated Live Breathing Pacer */}
      {activeSubTab === "breathing" && (
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-7 shadow-xs space-y-6 text-center">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200">
              <button
                onClick={() => { setBreathingMode("box"); setBreathingSeconds(4); setBreathingPhase("Inhale"); }}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${breathingMode === "box" ? "bg-white text-teal-800 shadow-2xs" : "text-slate-500"}`}
              >
                Box (4-4-4-4)
              </button>
              <button
                onClick={() => { setBreathingMode("478"); setBreathingSeconds(4); setBreathingPhase("Inhale"); }}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${breathingMode === "478" ? "bg-white text-teal-800 shadow-2xs" : "text-slate-500"}`}
              >
                4-7-8 Protocol
              </button>
            </div>

            <span className="text-xs font-bold font-mono px-2.5 py-1 rounded-lg bg-teal-50 text-teal-800 border border-teal-200">
              Cycles: {completedCycles}
            </span>
          </div>

          {/* Animated Breath Orb with Spring Physics */}
          <div className="py-8 flex flex-col items-center justify-center relative">
            <motion.div
              animate={{
                scale: !isBreathingActive 
                  ? 1 
                  : breathingPhase === "Inhale" || breathingPhase === "Hold" 
                  ? 1.35 
                  : 0.85,
              }}
              transition={{
                duration: !isBreathingActive ? 0.3 : breathingSeconds,
                ease: "easeInOut",
              }}
              className="w-48 h-48 sm:w-56 sm:h-56 rounded-full bg-gradient-to-tr from-teal-700 via-teal-600 to-emerald-500 text-white flex flex-col items-center justify-center shadow-xl relative border-4 border-white"
            >
              {/* Pulsing Aura */}
              <motion.div
                animate={{ opacity: isBreathingActive ? [0.2, 0.5, 0.2] : 0.1 }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="absolute inset-0 rounded-full bg-emerald-400 blur-xl -z-10"
              />

              <span className="text-xs font-black tracking-widest uppercase opacity-85">
                {isBreathingActive ? breathingPhase : "Ready"}
              </span>
              <span className="text-4xl sm:text-5xl font-black font-mono tracking-tight my-1">
                {isBreathingActive ? breathingSeconds : "4"}
              </span>
              <span className="text-[10px] font-bold opacity-75">
                {isBreathingActive ? "Follow Rhythm" : "Press Start"}
              </span>
            </motion.div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={() => setIsBreathingActive(!isBreathingActive)}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-xs shadow-xs transition-all active:scale-95 ${
                isBreathingActive
                  ? "bg-rose-600 hover:bg-rose-700 text-white"
                  : "bg-teal-700 hover:bg-teal-800 text-white"
              }`}
            >
              {isBreathingActive ? <><Pause className="w-4 h-4" /> Pause</> : <><Play className="w-4 h-4" /> Start Pacer</>}
            </button>
            <button
              onClick={() => {
                setIsBreathingActive(false);
                setBreathingSeconds(4);
                setBreathingPhase("Inhale");
                setCompletedCycles(0);
              }}
              className="p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
              title="Reset"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Subtab 2: Automated 5-4-3-2-1 Sensory Grounding */}
      {activeSubTab === "grounding" && (
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Compass className="w-4 h-4 text-teal-700" />
              <h3 className="text-sm font-bold text-slate-900">Sensory Orientation Exercise</h3>
            </div>
            <span className="text-xs font-mono font-bold text-slate-500">
              Step {groundingStep + 1} of 5
            </span>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-teal-700 text-white text-xs font-black flex items-center justify-center shrink-0 font-mono">
                {groundingPrompts[groundingStep].num}
              </span>
              <h4 className="text-sm font-bold text-slate-900">
                {groundingPrompts[groundingStep].title}
              </h4>
            </div>
            <p className="text-xs text-slate-600 pl-8">
              {groundingPrompts[groundingStep].hint}
            </p>
          </div>

          {/* Checklist for current step */}
          <div className="space-y-2 pt-1">
            {checkedItems[groundingStep].map((isChecked, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => toggleGroundingItem(groundingStep, idx)}
                className={`w-full p-3 rounded-xl border flex items-center justify-between text-xs font-bold transition-all ${
                  isChecked
                    ? "bg-emerald-50 border-emerald-300 text-emerald-900"
                    : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                }`}
              >
                <span>Item {idx + 1} Identified</span>
                <div className={`w-5 h-5 rounded-lg border flex items-center justify-center ${isChecked ? "bg-emerald-600 border-emerald-600 text-white" : "border-slate-300"}`}>
                  {isChecked && <Check className="w-3.5 h-3.5" />}
                </div>
              </button>
            ))}
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-100">
            <button
              type="button"
              disabled={groundingStep === 0}
              onClick={() => setGroundingStep((s) => Math.max(0, s - 1))}
              className="px-3 py-1.5 border border-slate-200 text-xs font-bold text-slate-600 rounded-xl hover:bg-slate-50 disabled:opacity-40"
            >
              Previous
            </button>
            <button
              type="button"
              disabled={groundingStep === 4}
              onClick={() => setGroundingStep((s) => Math.min(4, s + 1))}
              className="px-4 py-1.5 bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold rounded-xl disabled:opacity-40"
            >
              Next Step
            </button>
          </div>
        </div>
      )}

      {/* Subtab 3: Live Ambient Synthesizer */}
      {activeSubTab === "ambient" && (
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs space-y-5 text-center">
          <div className="space-y-1">
            <h3 className="text-base font-bold text-slate-900">Binaural Acoustic Soundscape</h3>
            <p className="text-xs text-slate-500">Pure Web Audio frequency generation for calm and concentration</p>
          </div>

          {/* Equalizer Waveform Animation */}
          <div className="h-20 flex items-center justify-center gap-1.5 py-2">
            {[40, 75, 55, 90, 60, 80, 45, 65, 85, 50, 70, 40].map((h, i) => (
              <motion.div
                key={i}
                animate={isPlayingAmbient ? { height: [12, h, 16] } : { height: 8 }}
                transition={isPlayingAmbient ? { repeat: Infinity, duration: 0.6 + (i % 4) * 0.2, ease: "easeInOut" } : { duration: 0.2 }}
                className={`w-2 rounded-full ${isPlayingAmbient ? "bg-teal-600" : "bg-slate-200"}`}
              />
            ))}
          </div>

          <div className="flex justify-center gap-2">
            {(["calm", "rain", "waves"] as const).map((t) => (
              <button
                key={t}
                onClick={() => {
                  setAmbientType(t);
                  if (isPlayingAmbient) {
                    toggleAmbientSound();
                    setTimeout(toggleAmbientSound, 100);
                  }
                }}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold capitalize transition-all ${
                  ambientType === t
                    ? "bg-teal-700 text-white shadow-2xs"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                {t === "calm" ? "174 Hz Solfeggio" : t === "rain" ? "Pink Drone" : "Delta Wave"}
              </button>
            ))}
          </div>

          <button
            onClick={toggleAmbientSound}
            className={`px-6 py-2.5 rounded-xl font-bold text-xs shadow-xs transition-all active:scale-95 inline-flex items-center gap-2 ${
              isPlayingAmbient
                ? "bg-rose-600 hover:bg-rose-700 text-white"
                : "bg-teal-700 hover:bg-teal-800 text-white"
            }`}
          >
            {isPlayingAmbient ? <><VolumeX className="w-4 h-4" /> Stop Audio</> : <><Volume2 className="w-4 h-4" /> Start Acoustic Tone</>}
          </button>
        </div>
      )}
    </div>
  );
};
