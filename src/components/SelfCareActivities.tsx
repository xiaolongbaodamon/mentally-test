import React, { useState, useEffect, useRef } from "react";
import { 
  Wind, 
  Compass, 
  Volume2, 
  VolumeX, 
  BookOpen, 
  Play, 
  Pause, 
  RotateCcw, 
  CheckCircle2, 
  Sparkles, 
  Heart, 
  Clock, 
  Coffee, 
  SunMedium 
} from "lucide-react";

interface SelfCareActivitiesProps {
  onActivityCompleted?: (name: string) => void;
  defaultSubTab?: "breathing" | "grounding" | "ambient" | "articles";
}

export const SelfCareActivities: React.FC<SelfCareActivitiesProps> = ({
  onActivityCompleted,
  defaultSubTab = "breathing",
}) => {
  const [activeSubTab, setActiveSubTab] = useState<"breathing" | "grounding" | "ambient" | "articles">(defaultSubTab);

  // Breathing state
  const [breathingPhase, setBreathingPhase] = useState<"Inhale" | "Hold" | "Exhale" | "Rest">("Inhale");
  const [breathingSeconds, setBreathingSeconds] = useState(4);
  const [isBreathingActive, setIsBreathingActive] = useState(false);
  const [completedCycles, setCompletedCycles] = useState(0);

  // Grounding state
  const [groundingStep, setGroundingStep] = useState(0);
  const [groundingNotes, setGroundingNotes] = useState<string[]>(["", "", "", "", ""]);

  // Ambient sound (Web Audio API Synthesizer)
  const [isPlayingAmbient, setIsPlayingAmbient] = useState(false);
  const [ambientType, setAmbientType] = useState<"ocean" | "rain" | "calm">("calm");
  const audioCtxRef = useRef<AudioContext | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const oscNodesRef = useRef<any[]>([]);

  useEffect(() => {
    setActiveSubTab(defaultSubTab);
  }, [defaultSubTab]);

  // Breathing loop timer
  useEffect(() => {
    if (!isBreathingActive) return;

    const interval = setInterval(() => {
      setBreathingSeconds((prev) => {
        if (prev > 1) return prev - 1;

        // Transition phases
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
            if (next % 3 === 0) {
              onActivityCompleted?.("Box Breathing");
            }
            return next;
          });
          return 4;
        }
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isBreathingActive, breathingPhase, onActivityCompleted]);

  // Audio synthesizer start/stop
  const toggleAmbientSound = () => {
    if (isPlayingAmbient) {
      // Stop
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
      // Start Web Audio
      try {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        const ctx = new AudioCtx();
        audioCtxRef.current = ctx;

        const masterGain = ctx.createGain();
        masterGain.gain.setValueAtTime(0.12, ctx.currentTime);
        masterGain.connect(ctx.destination);
        gainNodeRef.current = masterGain;

        if (ambientType === "calm") {
          // Warm soothing chord (binaural drone 144Hz + 216Hz + 288Hz)
          const freqs = [144, 216, 288];
          freqs.forEach((freq) => {
            const osc = ctx.createOscillator();
            osc.type = "sine";
            osc.frequency.setValueAtTime(freq, ctx.currentTime);
            const oscGain = ctx.createGain();
            oscGain.gain.setValueAtTime(0.04, ctx.currentTime);
            osc.connect(oscGain);
            oscGain.connect(masterGain);
            osc.start();
            oscNodesRef.current.push(osc);
          });
        } else {
          // Gentle white/pink noise simulation
          const bufferSize = ctx.sampleRate * 2;
          const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
          const output = noiseBuffer.getChannelData(0);
          let lastOut = 0.0;
          for (let i = 0; i < bufferSize; i++) {
            const white = Math.random() * 2 - 1;
            output[i] = (lastOut + 0.02 * white) / 1.02;
            lastOut = output[i];
            output[i] *= 3.5;
          }
          const whiteNoise = ctx.createBufferSource();
          whiteNoise.buffer = noiseBuffer;
          whiteNoise.loop = true;

          const filter = ctx.createBiquadFilter();
          filter.type = "lowpass";
          filter.frequency.value = ambientType === "rain" ? 800 : 400;

          whiteNoise.connect(filter);
          filter.connect(masterGain);
          whiteNoise.start();
          oscNodesRef.current.push(whiteNoise);
        }

        setIsPlayingAmbient(true);
        onActivityCompleted?.("Ambient Sound Meditation");
      } catch (err) {
        console.warn("Audio context not allowed or failed:", err);
      }
    }
  };

  useEffect(() => {
    return () => {
      // Cleanup audio on unmount
      oscNodesRef.current.forEach((n) => {
        try { n.stop(); n.disconnect(); } catch {}
      });
      if (audioCtxRef.current && audioCtxRef.current.state !== "closed") {
        audioCtxRef.current.close().catch(() => {});
      }
    };
  }, []);

  const groundingPrompts = [
    { title: "5 Things You Can SEE", desc: "Look around your study desk, room, or classroom. Notice textures, shapes, or tiny details." },
    { title: "4 Things You Can FEEL / TOUCH", desc: "Feel the fabric of your clothes, the desk surface beneath your hands, or feet on the floor." },
    { title: "3 Things You Can HEAR", desc: "Listen closely for distant traffic, a whirring electric fan, voices, or keyboard typing." },
    { title: "2 Things You Can SMELL", desc: "Notice the scent of coffee, campus fresh air, book paper, or pencil graphite." },
    { title: "1 Thing You Can TASTE", desc: "Acknowledge the lingering taste of mint, water, or simply take a deliberate sip of water." },
  ];

  return (
    <div id="self-care-activities-view" className="space-y-6">
      {/* Navigation Sub-Tabs */}
      <div className="bg-white rounded-2xl border border-slate-200 p-2 shadow-xs flex flex-wrap gap-1">
        <button
          onClick={() => setActiveSubTab("breathing")}
          className={`flex-1 min-h-[40px] py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 whitespace-nowrap ${
            activeSubTab === "breathing"
              ? "bg-teal-700 text-white shadow-xs"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
          }`}
        >
          <Wind className="w-4 h-4" />
          <span>Box Breathing</span>
        </button>
        <button
          onClick={() => setActiveSubTab("grounding")}
          className={`flex-1 min-h-[40px] py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 whitespace-nowrap ${
            activeSubTab === "grounding"
              ? "bg-teal-700 text-white shadow-xs"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
          }`}
        >
          <Compass className="w-4 h-4" />
          <span>5-4-3-2-1 Grounding</span>
        </button>
        <button
          onClick={() => setActiveSubTab("ambient")}
          className={`flex-1 min-h-[40px] py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 whitespace-nowrap ${
            activeSubTab === "ambient"
              ? "bg-teal-700 text-white shadow-xs"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
          }`}
        >
          <Volume2 className="w-4 h-4" />
          <span>Calming Sounds</span>
        </button>
        <button
          onClick={() => setActiveSubTab("articles")}
          className={`flex-1 min-h-[40px] py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 whitespace-nowrap ${
            activeSubTab === "articles"
              ? "bg-teal-700 text-white shadow-xs"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Wellness Guides</span>
        </button>
      </div>

      {/* Sub-View: Breathing */}
      {activeSubTab === "breathing" && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-10 shadow-xs text-center space-y-8 animate-in fade-in">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-teal-600 bg-teal-50 px-3 py-1 rounded-full border border-teal-200">
              Autonomic Nervous System Reset
            </span>
            <h2 className="text-xl font-black text-slate-900 mt-2">Box Breathing Exercise (4-4-4-4)</h2>
            <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
              Used by medical professionals and students to quickly down-regulate heart rate during high academic stress.
            </p>
          </div>

          {/* Visual Breathing Bubble */}
          <div className="py-6 flex items-center justify-center">
            <div
              className={`w-48 h-48 sm:w-56 sm:h-56 rounded-full flex flex-col items-center justify-center transition-all duration-1000 shadow-xl border-4 ${
                breathingPhase === "Inhale"
                  ? "scale-110 bg-teal-50 border-teal-500 text-teal-900"
                  : breathingPhase === "Hold"
                  ? "scale-110 bg-emerald-50 border-emerald-500 text-emerald-900 ring-8 ring-emerald-100"
                  : breathingPhase === "Exhale"
                  ? "scale-90 bg-sky-50 border-sky-400 text-sky-900"
                  : "scale-90 bg-slate-50 border-slate-300 text-slate-700"
              }`}
            >
              <span className="text-xl font-black">{breathingPhase}</span>
              <span className="text-3xl font-black mt-1">{breathingSeconds}s</span>
              <span className="text-[11px] font-semibold opacity-70 mt-1">Cycle #{completedCycles + 1}</span>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={() => setIsBreathingActive(!isBreathingActive)}
              className={`px-6 py-3 rounded-2xl font-bold text-xs shadow-md transition-all flex items-center gap-2 ${
                isBreathingActive
                  ? "bg-amber-600 hover:bg-amber-700 text-white"
                  : "bg-teal-700 hover:bg-teal-800 text-white active:scale-95"
              }`}
            >
              {isBreathingActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              <span>{isBreathingActive ? "Pause Exercise" : "Start 4-Count Breathing"}</span>
            </button>
            <button
              onClick={() => {
                setIsBreathingActive(false);
                setBreathingPhase("Inhale");
                setBreathingSeconds(4);
                setCompletedCycles(0);
              }}
              className="p-3 rounded-2xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
              title="Reset"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Sub-View: Grounding */}
      {activeSubTab === "grounding" && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6 animate-in fade-in">
          <div className="border-b border-slate-100 pb-4">
            <span className="text-[11px] font-bold uppercase tracking-wider text-teal-600">Mindfulness Practice</span>
            <h2 className="text-xl font-black text-slate-900 mt-0.5">5-4-3-2-1 Sensory Grounding Technique</h2>
            <p className="text-xs text-slate-500">
              Anchor your awareness to the present physical moment when anxious thoughts start spiraling.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-teal-50/50 border border-teal-100 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-teal-900">
                Step {groundingStep + 1} of 5
              </span>
              <span className="text-xs font-semibold text-teal-700">
                {groundingPrompts[groundingStep].title}
              </span>
            </div>
            <p className="text-xs text-slate-700 leading-relaxed font-medium">
              {groundingPrompts[groundingStep].desc}
            </p>

            <textarea
              value={groundingNotes[groundingStep]}
              onChange={(e) => {
                const copy = [...groundingNotes];
                copy[groundingStep] = e.target.value;
                setGroundingNotes(copy);
              }}
              placeholder="Jot down what you observe around you..."
              rows={2}
              className="w-full text-xs p-3 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 text-slate-800"
            />

            <div className="flex items-center justify-between pt-2">
              <button
                disabled={groundingStep === 0}
                onClick={() => setGroundingStep((s) => Math.max(0, s - 1))}
                className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold disabled:opacity-40"
              >
                Previous
              </button>
              {groundingStep < 4 ? (
                <button
                  onClick={() => setGroundingStep((s) => Math.min(4, s + 1))}
                  className="px-4 py-2 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold"
                >
                  Next Step
                </button>
              ) : (
                <button
                  onClick={() => {
                    onActivityCompleted?.("5-4-3-2-1 Grounding");
                    alert("Grounding exercise completed! Notice how your breathing and posture feel right now.");
                  }}
                  className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Complete Exercise</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Sub-View: Calming Ambient Sound */}
      {activeSubTab === "ambient" && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6 animate-in fade-in text-center">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-teal-600">Acoustic Relaxation</span>
            <h2 className="text-xl font-black text-slate-900 mt-0.5">Synthesized Calming Audio Loops</h2>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Generated in real-time in your browser without external audio streams or network lag.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-lg mx-auto">
            <button
              onClick={() => { setAmbientType("calm"); if (isPlayingAmbient) toggleAmbientSound(); }}
              className={`p-4 rounded-2xl border text-xs font-bold text-center transition-all ${
                ambientType === "calm"
                  ? "border-teal-600 bg-teal-50 text-teal-900 shadow-xs"
                  : "border-slate-200 hover:bg-slate-50 text-slate-700"
              }`}
            >
              <Sparkles className="w-5 h-5 mx-auto mb-1 text-teal-600" />
              <span>Meditative Drone (432Hz)</span>
            </button>
            <button
              onClick={() => { setAmbientType("rain"); if (isPlayingAmbient) toggleAmbientSound(); }}
              className={`p-4 rounded-2xl border text-xs font-bold text-center transition-all ${
                ambientType === "rain"
                  ? "border-teal-600 bg-teal-50 text-teal-900 shadow-xs"
                  : "border-slate-200 hover:bg-slate-50 text-slate-700"
              }`}
            >
              <Wind className="w-5 h-5 mx-auto mb-1 text-sky-600" />
              <span>Soft Gentle Rain</span>
            </button>
            <button
              onClick={() => { setAmbientType("ocean"); if (isPlayingAmbient) toggleAmbientSound(); }}
              className={`p-4 rounded-2xl border text-xs font-bold text-center transition-all ${
                ambientType === "ocean"
                  ? "border-teal-600 bg-teal-50 text-teal-900 shadow-xs"
                  : "border-slate-200 hover:bg-slate-50 text-slate-700"
              }`}
            >
              <SunMedium className="w-5 h-5 mx-auto mb-1 text-amber-600" />
              <span>White Noise Focus</span>
            </button>
          </div>

          <div className="pt-2">
            <button
              onClick={toggleAmbientSound}
              className={`px-8 py-3 rounded-2xl font-bold text-xs shadow-md transition-all inline-flex items-center gap-2 ${
                isPlayingAmbient
                  ? "bg-rose-600 hover:bg-rose-700 text-white"
                  : "bg-teal-700 hover:bg-teal-800 text-white active:scale-95"
              }`}
            >
              {isPlayingAmbient ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              <span>{isPlayingAmbient ? "Stop Ambient Audio" : "Play Calming Audio"}</span>
            </button>
          </div>
        </div>
      )}

      {/* Sub-View: Educational Wellness Guides */}
      {activeSubTab === "articles" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in">
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-teal-700 bg-teal-50 px-2.5 py-0.5 rounded-md">
              Academic Coping
            </span>
            <h3 className="text-sm font-bold text-slate-900">Managing Thesis & Capstone Anxiety</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Break down overwhelming documentation into 25-minute sprints using the Pomodoro technique. Remember that writing rough drafts is a standard part of college research.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-sky-700 bg-sky-50 px-2.5 py-0.5 rounded-md">
              Sleep Hygiene
            </span>
            <h3 className="text-sm font-bold text-slate-900">The Power of Consistent Bedtimes</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              All-nighters significantly reduce memory consolidation and increase exam panic. Aim for at least 6–7 hours of uninterrupted rest before major evaluations.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-md">
              Social Connection
            </span>
            <h3 className="text-sm font-bold text-slate-900">Combatting Student Imposter Syndrome</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              When entering college classrooms, almost everyone feels unsure of themselves. Celebrate small breakthroughs and reach out to peer facilitators at PTC.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-md">
              Physical Health
            </span>
            <h3 className="text-sm font-bold text-slate-900">Hydration & Caffeine Boundaries</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              High caffeine intake past 3:00 PM elevates resting cortisol and mimics panic symptoms. Drink a full glass of water between coffee cups during study sessions.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
