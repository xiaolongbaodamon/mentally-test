import React, { useState } from "react";
import { 
  Smile, 
  Frown, 
  Meh, 
  Calendar, 
  Sparkles, 
  Trash2, 
  ChevronRight, 
  TrendingUp, 
  Tag, 
  Plus, 
  Clock,
  Heart
} from "lucide-react";
import { MoodEntry, MoodScore } from "../types";
import { INITIAL_MOOD_OPTIONS, FEELING_TAGS, TRIGGER_TAGS } from "../data/wellnessContent";

interface MoodTrackerProps {
  moods: MoodEntry[];
  onAddMood: (entry: Omit<MoodEntry, "id" | "timestamp">) => void;
  onDeleteMood: (id: string) => void;
  onOpenActivitiesWithSuggestion?: (action: string) => void;
}

export const MoodTracker: React.FC<MoodTrackerProps> = ({
  moods,
  onAddMood,
  onDeleteMood,
  onOpenActivitiesWithSuggestion,
}) => {
  const [score, setScore] = useState<MoodScore>(7);
  const [selectedFeelings, setSelectedFeelings] = useState<string[]>([]);
  const [selectedTriggers, setSelectedTriggers] = useState<string[]>([]);
  const [note, setNote] = useState("");
  const [showLogSuccess, setShowLogSuccess] = useState(false);

  // Derive label and emoji based on score
  const getMoodMeta = (val: number) => {
    if (val >= 9) return { label: "Radiant & Joyful", emoji: "🌟", color: "text-emerald-600 bg-emerald-50 border-emerald-300" };
    if (val >= 7) return { label: "Calm & Content", emoji: "🌿", color: "text-teal-600 bg-teal-50 border-teal-300" };
    if (val >= 5) return { label: "Balanced / Neutral", emoji: "⛅", color: "text-sky-600 bg-sky-50 border-sky-300" };
    if (val >= 3) return { label: "Tired / Stressed", emoji: "🌧️", color: "text-amber-600 bg-amber-50 border-amber-300" };
    return { label: "Overwhelmed / Low", emoji: "⛈️", color: "text-rose-600 bg-rose-50 border-rose-300" };
  };

  const currentMeta = getMoodMeta(score);

  const toggleFeeling = (tag: string) => {
    setSelectedFeelings((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const toggleTrigger = (trig: string) => {
    setSelectedTriggers((prev) =>
      prev.includes(trig) ? prev.filter((t) => t !== trig) : [...prev, trig]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddMood({
      score,
      label: currentMeta.label,
      emoji: currentMeta.emoji,
      feelings: selectedFeelings,
      triggers: selectedTriggers,
      note: note.trim() || undefined,
    });

    // Reset inputs
    setSelectedFeelings([]);
    setSelectedTriggers([]);
    setNote("");
    setShowLogSuccess(true);
    setTimeout(() => setShowLogSuccess(false), 3000);
  };

  // Calculate quick stats
  const averageScore = moods.length
    ? (moods.reduce((acc, m) => acc + m.score, 0) / moods.length).toFixed(1)
    : "7.0";

  return (
    <div id="mood-tracker-view" className="space-y-6">
      {/* Mood Entry Form Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center">
              <Heart className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">How are you feeling right now?</h3>
              <p className="text-xs text-slate-500">Record your current mood and emotional context</p>
            </div>
          </div>
          <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
            {new Date().toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })}
          </span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Mood Intensity Meter & Presets */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                1. Emotional Intensity (1 to 10 Scale)
              </label>
              <div className={`px-3 py-1 rounded-full border text-xs font-bold flex items-center gap-1.5 ${currentMeta.color}`}>
                <span className="text-base">{currentMeta.emoji}</span>
                <span>{score}/10 — {currentMeta.label}</span>
              </div>
            </div>

            {/* Slider */}
            <input
              id="mood-score-slider"
              type="range"
              min="1"
              max="10"
              step="1"
              value={score}
              onChange={(e) => setScore(parseInt(e.target.value) as MoodScore)}
              className="w-full h-2.5 bg-gradient-to-r from-rose-300 via-sky-300 to-emerald-400 rounded-lg appearance-none cursor-pointer accent-teal-700"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-semibold px-1">
              <span>1 (Very Low / Exhausted)</span>
              <span>5 (Neutral / Steady)</span>
              <span>10 (Radiant / Energized)</span>
            </div>

            {/* Quick preset buttons */}
            <div className="grid grid-cols-5 gap-1.5 pt-1">
              {INITIAL_MOOD_OPTIONS.map((opt) => (
                <button
                  key={opt.score}
                  type="button"
                  onClick={() => setScore(opt.score as MoodScore)}
                  className={`py-2 px-1 rounded-xl border text-center transition-all ${
                    score === opt.score
                      ? "border-teal-600 bg-teal-50 ring-1 ring-teal-600 shadow-xs"
                      : "border-slate-200 bg-slate-50/60 hover:bg-slate-100 text-slate-600"
                  }`}
                >
                  <div className="text-xl">{opt.emoji}</div>
                  <div className="text-[10px] font-bold mt-1 truncate">{opt.score}/10</div>
                </button>
              ))}
            </div>
          </div>

          {/* Feeling Tags */}
          <div className="space-y-2.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-teal-600" />
              2. What feelings best describe this? (Select all that apply)
            </label>
            <div className="flex flex-wrap gap-1.5">
              {FEELING_TAGS.map((tag) => {
                const isSelected = selectedFeelings.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleFeeling(tag)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      isSelected
                        ? "bg-teal-700 text-white shadow-xs"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                  >
                    {tag}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Trigger Tags */}
          <div className="space-y-2.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              3. Influencing Factors / Triggers
            </label>
            <div className="flex flex-wrap gap-1.5">
              {TRIGGER_TAGS.map((trig) => {
                const isSelected = selectedTriggers.includes(trig);
                return (
                  <button
                    key={trig}
                    type="button"
                    onClick={() => toggleTrigger(trig)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      isSelected
                        ? "bg-amber-600 text-white shadow-xs"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                  >
                    {trig}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Reflection Note */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              4. Optional Reflection Note
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="What's going through your mind? Any assignment, interaction, or thought you want to acknowledge?"
              rows={2}
              className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 resize-none text-slate-800"
            />
          </div>

          {/* Submit */}
          <div className="flex items-center justify-between pt-2">
            {showLogSuccess ? (
              <span className="text-xs font-bold text-emerald-600 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4" />
                Mood logged successfully!
              </span>
            ) : (
              <span className="text-xs text-slate-400">Your privacy is fully protected in this app.</span>
            )}
            <button
              id="save-mood-btn"
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-xs transition-colors"
            >
              Record Today's Mood
            </button>
          </div>
        </form>
      </div>

      {/* Mood History and Trends */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900">Recent Mood Entries & Insights</h3>
            <p className="text-xs text-slate-500">Historical logs to identify emotional patterns over time</p>
          </div>
          <div className="text-right">
            <span className="text-xs text-slate-500 font-medium">Average Mood Score</span>
            <div className="text-lg font-black text-teal-800">{averageScore} / 10</div>
          </div>
        </div>

        {/* Entries list */}
        {moods.length === 0 ? (
          <div className="text-center py-8 text-slate-400 text-xs">
            No mood logs yet. Use the form above to record your first check-in!
          </div>
        ) : (
          <div className="space-y-3">
            {moods.slice(0, 10).map((item) => {
              const meta = getMoodMeta(item.score);
              const dateStr = new Date(item.timestamp).toLocaleString(undefined, {
                month: "short",
                day: "numeric",
                hour: "numeric",
                minute: "2-digit",
              });

              return (
                <div
                  key={item.id}
                  id={`mood-log-${item.id}`}
                  className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white transition-all space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <span className="text-2xl">{item.emoji}</span>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-900">{item.label}</span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${meta.color}`}>
                            Score: {item.score}/10
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                          <Clock className="w-3 h-3" />
                          {dateStr}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => onDeleteMood(item.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg transition-colors"
                      title="Delete entry"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Feelings and triggers pills */}
                  {(item.feelings.length > 0 || item.triggers.length > 0) && (
                    <div className="flex flex-wrap gap-1 pt-1">
                      {item.feelings.map((f) => (
                        <span key={f} className="text-[10px] bg-teal-100/60 text-teal-800 px-2 py-0.5 rounded-md font-medium">
                          {f}
                        </span>
                      ))}
                      {item.triggers.map((t) => (
                        <span key={t} className="text-[10px] bg-amber-100/60 text-amber-800 px-2 py-0.5 rounded-md font-medium">
                          ⚡ {t}
                        </span>
                      ))}
                    </div>
                  )}

                  {item.note && (
                    <p className="text-xs text-slate-600 bg-white p-2.5 rounded-lg border border-slate-100 italic">
                      "{item.note}"
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
