import React, { useState, useRef, useEffect } from "react";
import { 
  Send, 
  Sparkles, 
  HeartHandshake, 
  AlertCircle, 
  Wind, 
  Compass, 
  ShieldAlert, 
  Bot, 
  User,
  RotateCcw
} from "lucide-react";
import { ChatMessage } from "../types";

interface AIAssistantProps {
  onOpenEmergency: () => void;
  onOpenBreathing: () => void;
  onOpenGrounding: () => void;
  currentMoodLabel?: string;
}

const SAMPLE_QUESTIONS = [
  "I'm overwhelmed by college exams and deadlines",
  "Guide me through a 2-minute calming reset",
  "I feel like I'm falling behind my classmates",
  "How can I manage thesis stress and sleep better?",
];

export const AIAssistant: React.FC<AIAssistantProps> = ({
  onOpenEmergency,
  onOpenBreathing,
  onOpenGrounding,
  currentMoodLabel = "Neutral",
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "intro-1",
      role: "assistant",
      content: "Hello! I'm MentAlly, your AI wellness companion. I'm here to listen, offer gentle grounding support, and help you navigate the stresses of tertiary student life in a non-judgmental space.\n\nHow is your heart and mind doing right now?",
      timestamp: new Date().toISOString(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSendMessage = async (textToSend?: string) => {
    const messageContent = (textToSend || input).trim();
    if (!messageContent || isLoading) return;

    const userMsg: ChatMessage = {
      id: "msg-" + Date.now(),
      role: "user",
      content: messageContent,
      timestamp: new Date().toISOString(),
    };

    const updated = [...messages, userMsg];
    setMessages(updated);
    setInput("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: updated.map((m) => ({ role: m.role, content: m.content })),
          currentMood: currentMoodLabel,
        }),
      });

      const data = await res.json();
      const reply = data.reply || data.fallback || "I hear you. Remember to take a slow, deep breath. You are doing your best, and that is worthy of respect.";

      setMessages((prev) => [
        ...prev,
        {
          id: "bot-" + Date.now(),
          role: "assistant",
          content: reply,
          timestamp: new Date().toISOString(),
        },
      ]);
    } catch (e) {
      setMessages((prev) => [
        ...prev,
        {
          id: "bot-err-" + Date.now(),
          role: "assistant",
          content: "I'm right here with you. If you are experiencing heavy emotional distress, please consider speaking with your campus guidance counselor or reaching out to the NCMH Crisis Hotline (1553). In the meantime, would you like to do a gentle breathing exercise together?",
          timestamp: new Date().toISOString(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([
      {
        id: "intro-reset",
        role: "assistant",
        content: "Chat refreshed. I'm listening whenever you're ready to share. How are you feeling today?",
        timestamp: new Date().toISOString(),
      },
    ]);
  };

  return (
    <div id="ai-companion-card" className="bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col h-[650px] overflow-hidden">
      {/* Top Companion Header */}
      <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/70 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-600 to-emerald-500 text-white flex items-center justify-center shadow-xs">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-900">MentAlly AI Companion</h3>
              <span className="text-[10px] bg-teal-100 text-teal-800 font-bold px-2 py-0.5 rounded-full">
                Non-Clinical Support
              </span>
            </div>
            <p className="text-[11px] text-slate-500">Trained for student mental wellness & supportive reflection</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={clearChat}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/50 transition-colors"
            title="Clear Chat History"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <button
            onClick={onOpenEmergency}
            className="flex items-center gap-1 px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-xs font-bold transition-colors"
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            Crisis Help
          </button>
        </div>
      </div>

      {/* Non-clinical disclaimer tag */}
      <div className="px-4 py-2 bg-teal-50/50 border-b border-teal-100/60 flex items-center justify-between text-[11px] text-teal-900">
        <span className="flex items-center gap-1.5">
          <HeartHandshake className="w-3.5 h-3.5 text-teal-600" />
          Safe, confidential reflection. Not a substitute for professional clinical therapy.
        </span>
        <div className="flex items-center gap-1 text-[10px]">
          <button onClick={onOpenBreathing} className="underline hover:text-teal-950 font-semibold">Breathe</button>
          <span>•</span>
          <button onClick={onOpenGrounding} className="underline hover:text-teal-950 font-semibold">Ground</button>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-slate-50/30">
        {messages.map((m) => {
          const isUser = m.role === "user";
          return (
            <div
              key={m.id}
              className={`flex items-start gap-2.5 ${isUser ? "flex-row-reverse" : "flex-row"}`}
            >
              <div
                className={`w-7 h-7 rounded-lg shrink-0 flex items-center justify-center text-xs ${
                  isUser
                    ? "bg-slate-700 text-white"
                    : "bg-teal-600 text-white shadow-xs"
                }`}
              >
                {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div
                className={`max-w-[82%] sm:max-w-[75%] rounded-2xl px-4 py-3 text-xs leading-relaxed ${
                  isUser
                    ? "bg-slate-800 text-white rounded-tr-xs"
                    : "bg-white border border-slate-200 text-slate-800 shadow-xs rounded-tl-xs whitespace-pre-line"
                }`}
              >
                {m.content}
                <div
                  className={`text-[9px] mt-1.5 text-right opacity-60`}
                >
                  {new Date(m.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </div>
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-teal-600 text-white flex items-center justify-center text-xs">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-xs px-4 py-3 shadow-xs flex items-center gap-2 text-xs text-slate-500">
              <Sparkles className="w-3.5 h-3.5 text-teal-600 animate-spin" />
              <span>MentAlly is writing a thoughtful reply...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Suggestion Chips */}
      <div className="p-2.5 bg-slate-50/90 border-t border-slate-100 flex items-center gap-1.5 overflow-x-auto text-[11px]">
        <span className="text-slate-400 font-semibold px-1 shrink-0">Quick prompts:</span>
        {SAMPLE_QUESTIONS.map((q, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(q)}
            className="px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-700 rounded-full border border-slate-200 whitespace-nowrap transition-colors"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-slate-200">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2"
        >
          <input
            id="chat-input-field"
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Share your thoughts or ask for a calming reflection..."
            className="flex-1 text-xs px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 text-slate-900"
          />
          <button
            id="send-chat-btn"
            type="submit"
            disabled={!input.trim() || isLoading}
            className="p-3 bg-teal-600 hover:bg-teal-700 disabled:opacity-40 text-white rounded-xl shadow-xs transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
