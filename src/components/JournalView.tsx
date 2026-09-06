import React, { useState } from "react";
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
  HeartHandshake,
  Lightbulb
} from "lucide-react";
import { JournalEntry } from "../types";

interface JournalViewProps {
  entries: JournalEntry[];
  onAddEntry: (entry: Omit<JournalEntry, "id" | "timestamp">) => void;
  onDeleteEntry: (id: string) => void;
  currentMoodLabel?: string;
}

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

  // Request AI prompt from server
  const fetchAIPrompt = async () => {
    setIsLoadingPrompt(true);
    try {
      const res = await fetch("/api/journal-prompt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mood: currentMoodLabel, category: "College Student Reflection & Self-Care" }),
      });
      const data = await res.json();
      if (data.prompt) {
        setPrompt(data.prompt);
        if (!title) {
          setTitle("Daily Reflection: " + data.prompt.slice(0, 30) + "...");
        }
      }
    } catch (e) {
      setPrompt("What is one gentle kindness or moment of calm you experienced today?");
    } finally {
      setIsLoadingPrompt(false);
    }
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput("");
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
      tags: tags.length ? tags : ["Self-Care"],
      moodTag: currentMoodLabel,
    });

    // Reset form
    setTitle("");
    setContent("");
    setPrompt("");
    setTags(["Reflection"]);
    setIsWriting(false);
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
    <div id="journal-view-container" className="space-y-6">
      {/* Header action bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200">
        <div>
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-teal-600" />
            Student Wellness Journal
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Expressive writing clears cognitive overload and provides safe psychological release.
          </p>
        </div>

        <button
          id="toggle-journal-writer-btn"
          onClick={() => {
            setIsWriting(!isWriting);
            if (!isWriting && !prompt) fetchAIPrompt();
          }}
          className="flex items-center gap-1.5 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
        >
          {isWriting ? "Cancel Entry" : <><Plus className="w-4 h-4" /> New Entry</>}
        </button>
      </div>

      {/* Entry Editor */}
      {isWriting && (
        <form
          onSubmit={handleSave}
          className="bg-white rounded-2xl border border-teal-200 p-6 shadow-xs space-y-4 animate-in fade-in duration-200"
        >
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <span className="text-xs font-bold text-teal-900 flex items-center gap-1.5">
              <Edit3 className="w-4 h-4 text-teal-600" />
              Compose Reflection
            </span>
            <button
              type="button"
              onClick={fetchAIPrompt}
              disabled={isLoadingPrompt}
              className="flex items-center gap-1.5 text-xs font-semibold text-teal-700 bg-teal-50 hover:bg-teal-100 px-3 py-1.5 rounded-lg border border-teal-200 transition-colors"
            >
              <Sparkles className={`w-3.5 h-3.5 ${isLoadingPrompt ? "animate-spin" : ""}`} />
              {isLoadingPrompt ? "Generating Prompt..." : "AI Prompt Spark"}
            </button>
          </div>

          {/* AI Prompt Banner if available */}
          {prompt && (
            <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-2.5 text-xs text-amber-900">
              <Lightbulb className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <strong className="block font-bold mb-0.5">Reflective Prompt:</strong>
                <p className="italic">{prompt}</p>
              </div>
            </div>
          )}

          {/* Title */}
          <div>
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
              Title / Focus
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. End of Midterms Thoughts, Grateful for Study Group..."
              className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 font-medium text-slate-900"
            />
          </div>

          {/* Content Area */}
          <div>
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
              Your Private Thoughts
            </label>
            <textarea
              required
              rows={6}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write freely without self-censorship or worry about grammar. How did today feel? What went well? What are you ready to let go of?"
              className="w-full text-xs p-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 leading-relaxed text-slate-800 resize-y"
            />
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
              Tags & Categorization
            </label>
            <div className="flex items-center gap-2">
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
                placeholder="Add tag (e.g. Thesis, Gratitude, Sleep) + Enter"
                className="text-xs px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-teal-500"
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-lg"
              >
                Add
              </button>
            </div>

            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {tags.map((t) => (
                  <span
                    key={t}
                    className="inline-flex items-center gap-1 text-[11px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md font-medium"
                  >
                    #{t}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(t)}
                      className="hover:text-rose-600 font-bold ml-0.5"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsWriting(false)}
              className="px-4 py-2 border border-slate-200 text-xs font-semibold text-slate-600 rounded-xl hover:bg-slate-50"
            >
              Discard
            </button>
            <button
              id="save-journal-btn"
              type="submit"
              className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
            >
              Save to Journal
            </button>
          </div>
        </form>
      )}

      {/* Search and Entries List */}
      <div className="space-y-4">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search through your entries by keyword or tag..."
            className="w-full text-xs pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
          />
        </div>

        {filteredEntries.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 space-y-3">
            <BookOpen className="w-10 h-10 text-slate-300 mx-auto" />
            <div className="text-xs text-slate-500">
              {searchQuery ? "No entries match your search query." : "No journal entries yet. Tap 'New Entry' to write your first reflection!"}
            </div>
          </div>
        ) : (
          <div className="space-y-3.5">
            {filteredEntries.map((entry) => {
              const formattedDate = new Date(entry.timestamp).toLocaleDateString(undefined, {
                weekday: "long",
                month: "short",
                day: "numeric",
                year: "numeric",
              });

              return (
                <div
                  key={entry.id}
                  id={`journal-card-${entry.id}`}
                  className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:border-slate-300 transition-all space-y-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-slate-900">{entry.title}</span>
                        {entry.moodTag && (
                          <span className="text-[10px] font-semibold bg-teal-50 text-teal-700 border border-teal-200 px-2 py-0.5 rounded-full">
                            Mood: {entry.moodTag}
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                        <Calendar className="w-3 h-3" />
                        {formattedDate}
                      </span>
                    </div>

                    <button
                      onClick={() => onDeleteEntry(entry.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg transition-colors"
                      title="Delete entry"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {entry.prompt && (
                    <div className="p-2.5 rounded-lg bg-amber-50/60 border border-amber-100 text-[11px] text-amber-800 italic">
                      Prompt: {entry.prompt}
                    </div>
                  )}

                  <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line">
                    {entry.content}
                  </p>

                  {entry.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-1 border-t border-slate-100">
                      {entry.tags.map((t) => (
                        <span key={t} className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-medium">
                          #{t}
                        </span>
                      ))}
                    </div>
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
