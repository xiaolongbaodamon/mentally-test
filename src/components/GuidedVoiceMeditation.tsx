import React, { useState, useEffect, useRef } from "react";
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Volume2, 
  Sparkles, 
  GraduationCap, 
  Headphones, 
  Waves,
  Shield
} from "lucide-react";

interface MeditationTrack {
  id: string;
  title: string;
  category: string;
  duration: string;
  description: string;
  script: string[];
}

const PTC_MEDITATION_TRACKS: MeditationTrack[] = [
  {
    id: "pre-exam",
    title: "Pre-Exam Heart Rate & Adrenaline Soother",
    category: "Academic De-Stress",
    duration: "3 Mins",
    description: "Designed for moments right before walking into a PTC midterm, final exam, or lab practical.",
    script: [
      "Welcome. Let us take a quiet moment right here to steady your mind before your exam.",
      "Place both feet firmly on the floor. Feel the solid ground beneath you. You are safe in this moment.",
      "Take a slow, deep breath in through your nose... expanding your ribs... and exhale gently through your mouth.",
      "Notice your shoulders. Allow them to drop away from your ears. Release any clenching in your jaw.",
      "It is natural to feel adrenaline before an exam. Adrenaline is simply your body preparing energy to think.",
      "Remind yourself: You have studied, you have attended lectures at PTC, and one test does not define your entire worth or future.",
      "Inhale steady calm... and exhale all lingering self-doubt.",
      "Trust your preparation. Take one more grounding breath. You are ready to begin."
    ]
  },
  {
    id: "defense-calm",
    title: "Thesis & Capstone Defense Presence",
    category: "Confidence & Poise",
    duration: "4 Mins",
    description: "Centering practice for IT students presenting capstone projects to faculty panels.",
    script: [
      "Find a comfortable, upright posture. Lengthen your spine. Feel the quiet strength in your body.",
      "Presenting your research and code can trigger anxious thoughts. Acknowledge them with kindness.",
      "Inhale slowly... feeling clarity fill your chest... and release slowly.",
      "Remember that you built this project. You know the problems you solved and the effort you invested.",
      "Your thesis defense panel is not your adversary—they are senior mentors seeking to guide and refine your work.",
      "When a question arises, remember that you have the right to take a pause, breathe, and gather your thoughts before answering.",
      "Speak at a measured, steady pace. You are well prepared, knowledgeable, and capable.",
      "Take one deep breath in... smile gently... and step forward with confidence."
    ]
  },
  {
    id: "post-coding-pmr",
    title: "Post-Lab Screen & Muscle De-tension",
    category: "Somatic Relaxation",
    duration: "3.5 Mins",
    description: "Eases neck, wrist, and eye strain after long hours of programming and screen exposure.",
    script: [
      "Gently close your eyes or soften your gaze away from all screens and monitors.",
      "Roll your wrists in slow circles. Release the tension from typing and scrolling.",
      "Now, shrug your shoulders high towards your ears... hold for three seconds... and let them drop completely.",
      "Feel the sudden warmth and release spreading down your neck and spine.",
      "Gently tilt your head towards your right shoulder... breathe into the stretch... then gently to your left shoulder.",
      "Unclench your forehead. Let the muscles around your eyes become soft and heavy.",
      "Take a long, restorative inhale... and let out a full, easy sigh.",
      "You have worked hard today. Your mind and body are resting and renewing."
    ]
  }
];

export const GuidedVoiceMeditation: React.FC = () => {
  const [selectedTrack, setSelectedTrack] = useState<MeditationTrack>(PTC_MEDITATION_TRACKS[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      synthRef.current = window.speechSynthesis;
    }
    return () => {
      if (synthRef.current) {
        synthRef.current.cancel();
      }
    };
  }, []);

  const speakLine = (lineIdx: number) => {
    if (!synthRef.current || lineIdx >= selectedTrack.script.length) {
      setIsPlaying(false);
      setCurrentLineIndex(0);
      return;
    }

    synthRef.current.cancel();
    const text = selectedTrack.script[lineIdx];
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.85; // Slow, soothing cadence
    utterance.pitch = 0.95;

    // Try to pick an English voice
    const voices = synthRef.current.getVoices();
    const naturalVoice = voices.find(
      (v) => v.lang.startsWith("en") && (v.name.includes("Natural") || v.name.includes("Samantha") || v.name.includes("Google"))
    );
    if (naturalVoice) {
      utterance.voice = naturalVoice;
    }

    utterance.onend = () => {
      // Pause slightly between guidance phrases
      setTimeout(() => {
        if (isPlaying) {
          setCurrentLineIndex((prev) => {
            const next = prev + 1;
            speakLine(next);
            return next;
          });
        }
      }, 2500);
    };

    utteranceRef.current = utterance;
    synthRef.current.speak(utterance);
  };

  const handleTogglePlay = () => {
    if (!synthRef.current) return;

    if (!isPlaying) {
      setIsPlaying(true);
      speakLine(currentLineIndex);
    } else {
      setIsPlaying(false);
      synthRef.current.cancel();
    }
  };

  const handleReset = () => {
    if (synthRef.current) synthRef.current.cancel();
    setIsPlaying(false);
    setCurrentLineIndex(0);
  };

  const handleSelectTrack = (track: MeditationTrack) => {
    if (synthRef.current) synthRef.current.cancel();
    setIsPlaying(false);
    setSelectedTrack(track);
    setCurrentLineIndex(0);
  };

  return (
    <div id="guided-voice-meditation" className="space-y-6 animate-in fade-in duration-200">
      {/* Track Selector Deck */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {PTC_MEDITATION_TRACKS.map((t) => {
          const isSelected = selectedTrack.id === t.id;
          return (
            <button
              key={t.id}
              onClick={() => handleSelectTrack(t)}
              className={`p-4 rounded-2xl border text-left transition-all ${
                isSelected
                  ? "bg-teal-50 border-teal-500 shadow-xs ring-1 ring-teal-500/20"
                  : "bg-white border-slate-200 hover:border-slate-300"
              }`}
            >
              <span className="text-[10px] uppercase font-bold tracking-wider text-teal-700 bg-teal-100/60 px-2 py-0.5 rounded-full">
                {t.category} • {t.duration}
              </span>
              <h4 className="text-xs font-bold text-slate-900 mt-2">{t.title}</h4>
              <p className="text-[11px] text-slate-500 mt-1 leading-relaxed line-clamp-2">{t.description}</p>
            </button>
          );
        })}
      </div>

      {/* Main Guided Voice Audio Stage */}
      <div className="bg-gradient-to-br from-slate-900 via-teal-950 to-slate-900 text-white rounded-3xl p-8 shadow-lg text-center space-y-6 relative overflow-hidden">
        <div className="relative z-10 max-w-xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-800/60 border border-teal-500/30 text-teal-200 text-xs font-semibold">
            <Headphones className="w-3.5 h-3.5" />
            <span>Spoken Relaxation Session • Voice Guidance</span>
          </div>

          <h3 className="text-xl sm:text-2xl font-black tracking-tight text-white">{selectedTrack.title}</h3>
          <p className="text-xs text-teal-200/80 leading-relaxed">{selectedTrack.description}</p>

          {/* Active Spoken Text Box */}
          <div className="min-h-[90px] flex items-center justify-center p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs">
            <p className="text-sm sm:text-base font-medium text-teal-100 transition-all duration-300 italic">
              "{selectedTrack.script[currentLineIndex] || "Click Play to begin your guided voice session..."}"
            </p>
          </div>

          {/* Progress Indicator */}
          <div className="flex justify-center items-center gap-1.5 pt-2">
            {selectedTrack.script.map((_, idx) => (
              <div
                key={idx}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  idx === currentLineIndex
                    ? "w-8 bg-teal-400"
                    : idx < currentLineIndex
                    ? "w-2 bg-teal-600"
                    : "w-2 bg-white/20"
                }`}
              />
            ))}
          </div>

          {/* Player Controls */}
          <div className="flex items-center justify-center gap-4 pt-4">
            <button
              onClick={handleReset}
              className="p-3 rounded-full bg-white/10 hover:bg-white/20 text-teal-200 transition-colors"
              title="Restart session"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            <button
              onClick={handleTogglePlay}
              className="w-16 h-16 rounded-full bg-teal-400 hover:bg-teal-300 text-slate-950 flex items-center justify-center shadow-lg transition-transform hover:scale-105 active:scale-95"
            >
              {isPlaying ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current ml-1" />}
            </button>

            <div className="p-3 rounded-full bg-white/10 text-teal-200">
              <Volume2 className="w-4 h-4" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
