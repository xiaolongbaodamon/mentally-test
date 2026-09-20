import React, { useState, useEffect, useMemo, useRef } from "react";
import { 
  BookOpen, 
  Sparkles, 
  Search, 
  Trash2, 
  Plus, 
  Calendar, 
  Tag, 
  Edit3, 
  Check, 
  Lightbulb,
  Clock,
  Zap,
  Activity,
  CheckCircle2,
  FileText
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { JournalEntry } from "../types";

interface JournalViewProps {
  entries: JournalEntry[];
  onAddEntry: (entry: Omit<JournalEntry, "id" | "timestamp">) => void;
  onDeleteEntry: (id: string) => void;
  currentMoodLabel?: string;
}

// Word analysis keywords for automated sentiment detection
const POSITIVE_WORDS = ["good", "great", "happy", "calm", "proud", "grateful", "relieved", "hopeful", "accomplished", "peace", "love", "smile", "better", "progress", "confident", "passed"];
const STRESS_WORDS = ["stress", "anxious", "overwhelmed", "panic", "tired", "exhausted", "failed", "scared", "hard", "difficult", "heavy", "stuck", "worried", "nervous", "cry", "late", "deadline"];

export const JournalView: React.FC<JournalViewProps> = ({
  entries,
  onAddEntry,
  onDeleteEntry,
  currentMoodLabel = "Calm",
}) => {
  const [isWriting, setIsWriting] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>(["Reflection"]);
  const [prompt, setPrompt] = useState<string>("");
  const [isLoadingPrompt, setIsLoadingPrompt] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [autoSaveStatus, setAutoSaveStatus] = useState<string>("Draft Idle");
  const [lastSavedTime, setLastSavedTime] = useState<string | null>(null);

  const autoSaveTimerRef = useRef<any>(null);

  // Automated Metrics
  const wordCount = useMemo(() => {
    if (!content.trim()) return 0;
    return content.trim().split(/\s+/).length;
  }, [content]);

  const readingTimeSec = useMemo(() => {
    return Math.max(1, Math.ceil((wordCount / 200) * 60));
  }, [wordCount]);

  // Automated Sentiment & Valence Analysis
  const sentimentScore = useMemo(() => {
    if (!content.trim()) return 50; // Neutral baseline
    const lower = content.toLowerCase();
    let pos = 0;
    let neg = 0;
    POSITIVE_WORDS.forEach((w) => {
      if (lower.includes(w)) pos += 1;
    });
    STRESS_WORDS.forEach((w) => {
      if (lower.includes(w)) neg += 1;
    });
    const total = pos + neg;
    if (total === 0) return 50;
    const ratio = (pos / total) * 100;
    return Math.round(ratio);
  }, [content]);

  // Automated Smart Tag Suggestions
  const suggestedTags = useMemo(() => {
    const lower = (content + " " + title).toLowerCase();
    const suggestions: string[] = [];
    if (lower.includes("exam") || lower.includes("midterm") || lower.includes("quiz")) suggestions.push("Academics");
    if (lower.includes("thesis") || lower.includes("capstone") || lower.includes("project")) suggestions.push("Research");
    if (lower.includes("friend") || lower.includes("family") || lower.includes("roommate")) suggestions.push("Relationships");
    if (lower.includes("sleep") || lower.includes("rest") || lower.includes("tired")) suggestions.push("Sleep");
    if (lower.includes("grateful") || lower.includes("thank")) suggestions.push("Gratitude");
    if (lower.includes("stress") || lower.includes("anxiety")) suggestions.push("Stress Relief");
    return suggestions.filter((s) => !tags.includes(s)).slice(0, 3);
  }, [content, title, tags]);

  // Automated Live Draft Autosave
  useEffect(() => {
    if (!isWriting || (!content && !title)) return;
    setAutoSaveStatus("Syncing draft...");
    if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);

    autoSaveTimerRef.current = setTimeout(() => {
      try {
        localStorage.setItem("mentally_journal_draft", JSON.stringify({ title, content, tags, prompt, timestamp: Date.now() }));
        const now = new Date();
        setLastSavedTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
        setAutoSaveStatus("Auto-saved");
      } catch {
        setAutoSaveStatus("Save error");
      }
    }, 1000);

    return () => {
      if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    };
  }, [content, title, tags, prompt, isWriting]);

  // Request AI prompt from server
  const fetchAIPrompt = async () => {
    setIsLoadingPrompt(true);
    try {
      const res = await fetch("/api/journal-prompt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mood: currentMoodLabel, category: "PTC Student Reflection" }),
      });
      const data = await res.json();
      if (data.prompt) {
        setPrompt(data.prompt);
        if (!title) {
          setTitle("Reflection: " + data.prompt.slice(0, 25) + "...");
        }
      }
    } catch {
      setPrompt("What is one productive breakthrough or personal reassurance you noticed today?");
    } finally {
      setIsLoadingPrompt(false);
    }
  };

  const handleAddTag = (newTag?: string) => {
    const val = (newTag || tagInput).trim();
    if (val && !tags.includes(val)) {
      setTags([...tags, val]);
      if (!newTag) setTagInput("");
    }
  };

  const handleRemoveTag = (t: string) => {
    setTags(tags.filter((item) => item !== t));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    onAddEntry({
      title: title.trim() || "Untitled Reflection",
      content: content.trim(),
      prompt: prompt || undefined,
      tags: tags.length ? tags : ["Reflection"],
      moodTag: currentMoodLabel,
    });

    // Clear draft storage
    try { localStorage.removeItem("mentally_journal_draft"); } catch {}

    // Reset form
    setTitle("");
    setContent("");
    setPrompt("");
    setTags(["Reflection"]);
    setIsWriting(false);
    setLastSavedTime(null);
  };

  // Filtered entries
  const filteredEntries = entries.filter((e) => {
    const q = searchQuery.toLowerCase();
    return (
      e.title.toLowerCase().includes(q) ||
      e.content.toLowerCase().includes(q) ||
      e.tags.some((t) => t.toLowerCase().includes(q))
    );
  });

  return (
    <div id="journal-view-container" className="space-y-4">
      {/* Top Action Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-200 text-teal-700 flex items-center justify-center shrink-0">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-black text-slate-900 tracking-tight">Reflective Journal</h2>
              <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
                {entries.length} {entries.length === 1 ? "Entry" : "Entries"}
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">Confidential Student Log</p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            id="toggle-journal-writer-btn"
            onClick={() => {
              setIsWriting(!isWriting);
              if (!isWriting && !prompt) fetchAIPrompt();
            }}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-teal-700 hover:bg-teal-800 active:scale-95 text-white text-xs font-bold rounded-xl shadow-xs transition-all min-h-[38px]"
          >
            {isWriting ? "Close Editor" : <><Plus className="w-4 h-4" /> New Entry</>}
          </button>
        </div>
      </div>

      {/* Entry Editor with Live Automations */}
      <AnimatePresence>
        {isWriting && (
          <motion.form
            initial={{ opacity: 0, y: -12, scale: 0.99 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.99 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            onSubmit={handleSave}
            className="bg-white rounded-2xl border border-teal-300 p-5 shadow-sm space-y-4"
          >
            {/* Live Status Bar: Word count, Read time, Sentiment, Auto-save indicator */}
            <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1 font-bold text-slate-700">
                  <FileText className="w-3.5 h-3.5 text-slate-400" />
                  {wordCount} words
                </span>
                <span className="flex items-center gap-1 text-slate-500">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  ~{readingTimeSec}s read
                </span>
                {/* Live Sentiment Meter */}
                <div className="hidden sm:flex items-center gap-1.5 pl-2 border-l border-slate-200">
                  <Activity className="w-3.5 h-3.5 text-teal-600" />
                  <span className="text-[11px] font-semibold text-slate-600">Tone:</span>
                  <div className="w-16 h-1.5 rounded-full bg-slate-200 overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-300 ${sentimentScore >= 60 ? "bg-emerald-500" : sentimentScore <= 40 ? "bg-amber-500" : "bg-teal-500"}`}
                      style={{ width: `${sentimentScore}%` }}
                    />
                  </div>
                  <span className="text-[10px] font-mono font-bold text-slate-600">
                    {sentimentScore >= 60 ? "Positive" : sentimentScore <= 40 ? "Reflective" : "Balanced"}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 ml-auto">
                <span className="inline-flex items-center gap-1 text-[11px] font-mono text-slate-500">
                  <span className={`w-2 h-2 rounded-full ${autoSaveStatus === "Auto-saved" ? "bg-emerald-500 animate-pulse" : "bg-amber-400"}`} />
                  {autoSaveStatus} {lastSavedTime ? `(${lastSavedTime})` : ""}
                </span>
                <button
                  type="button"
                  onClick={fetchAIPrompt}
                  disabled={isLoadingPrompt}
                  className="flex items-center gap-1 text-[11px] font-bold text-teal-700 hover:text-teal-800 bg-white hover:bg-teal-50 px-2.5 py-1 rounded-lg border border-teal-200 transition-colors"
                >
                  <Sparkles className={`w-3 h-3 ${isLoadingPrompt ? "animate-spin" : ""}`} />
                  {isLoadingPrompt ? "Generating..." : "Inspire Prompt"}
                </button>
              </div>
            </div>

            {/* AI Prompt Strip */}
            {prompt && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="p-3 rounded-xl bg-amber-50/90 border border-amber-200/80 flex items-start gap-2.5 text-xs text-amber-900"
              >
                <Lightbulb className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <span className="font-bold text-[10px] uppercase tracking-wider text-amber-700">Writing Prompt:</span>
                  <p className="italic font-medium">{prompt}</p>
                </div>
              </motion.div>
            )}

            {/* Title Field */}
            <div>
              <input
                id="journal-title-input"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Title or Topic..."
                className="w-full text-sm font-bold p-3 bg-slate-50/70 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 text-slate-900 placeholder:text-slate-400"
              />
            </div>

            {/* Content Field */}
            <div>
              <textarea
                id="journal-content-input"
                required
                rows={5}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write your entry here..."
                className="w-full text-xs sm:text-sm p-3.5 bg-slate-50/70 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 leading-relaxed text-slate-800 placeholder:text-slate-400 resize-y"
              />
            </div>

            {/* Smart Automated Tag Suggestions & Tag Manager */}
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddTag();
                    }
                  }}
                  placeholder="Custom tag + Enter"
                  className="text-xs px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-teal-600"
                />
                <button
                  type="button"
                  onClick={() => handleAddTag()}
                  className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition-colors"
                >
                  Add
                </button>

                {/* Automated Tag Suggestions pill */}
                {suggestedTags.length > 0 && (
                  <div className="flex items-center gap-1 text-[11px] text-teal-700 font-semibold pl-2">
                    <span className="text-[10px] text-slate-400 font-medium">Suggested:</span>
                    {suggestedTags.map((st) => (
                      <button
                        key={st}
                        type="button"
                        onClick={() => handleAddTag(st)}
                        className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-md bg-teal-50 hover:bg-teal-100 border border-teal-200 text-teal-800 text-[10px] font-bold transition-colors"
                      >
                        <Plus className="w-2.5 h-2.5" />
                        {st}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {tags.map((t) => (
                    <span
                      key={t}
                      className="inline-flex items-center gap-1 text-[11px] bg-slate-100 border border-slate-200/80 text-slate-700 px-2 py-0.5 rounded-md font-bold"
                    >
                      #{t}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(t)}
                        className="hover:text-rose-600 font-black ml-0.5"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsWriting(false)}
                className="px-4 py-2 border border-slate-200 text-xs font-bold text-slate-600 rounded-xl hover:bg-slate-50 transition-colors"
              >
                Discard
              </button>
              <button
                id="save-journal-btn"
                type="submit"
                disabled={!content.trim()}
                className="flex items-center gap-1.5 px-5 py-2 bg-teal-700 hover:bg-teal-800 active:scale-95 disabled:opacity-50 text-white text-xs font-black rounded-xl shadow-xs transition-all"
              >
                <Check className="w-4 h-4" />
                Save Reflection
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Search and Entries Archive */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-xs space-y-4">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            id="journal-search-input"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search entries by title, keywords, or tags..."
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-hidden focus:border-teal-600"
          />
        </div>

        {filteredEntries.length === 0 ? (
          <div className="text-center py-10 px-4">
            <BookOpen className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-xs font-bold text-slate-600">No Journal Entries Found</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Click "New Entry" above to log your first reflection.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredEntries.map((entry) => (
              <motion.div
                key={entry.id}
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="p-4 rounded-xl border border-slate-200 hover:border-teal-300 transition-all bg-white hover:shadow-xs group space-y-2"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-sm font-bold text-slate-900">{entry.title}</h3>
                      {entry.moodTag && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-50 text-teal-800 border border-teal-200">
                          {entry.moodTag}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono mt-0.5">
                      <Calendar className="w-3 h-3" />
                      <span>{new Date(entry.timestamp).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => onDeleteEntry(entry.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors opacity-80 group-hover:opacity-100"
                    title="Delete Entry"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-wrap">
                  {entry.content}
                </p>

                {entry.tags && entry.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 pt-1">
                    {entry.tags.map((t) => (
                      <span key={t} className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200/60">
                        #{t}
                      </span>
                    ))}
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
