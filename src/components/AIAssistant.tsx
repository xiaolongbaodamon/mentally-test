import React, { useState, useRef, useEffect } from "react";
import { 
  Send, 
  Sparkles, 
  HeartHandshake, 
  Wind, 
  Compass, 
  ShieldAlert, 
  Bot, 
  User,
  RotateCcw,
  Zap,
  Activity
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { ChatMessage } from "../types";

interface AIAssistantProps {
  onOpenEmergency: () => void;
  onOpenBreathing: () => void;
  onOpenGrounding: () => void;
  currentMoodLabel?: string;
}

const SAMPLE_QUESTIONS = [
  "Overwhelmed by exams and deadlines",
  "Guide me through a 2-min calming reset",
  "Impostor syndrome in class",
  "Thesis anxiety & sleep trouble",
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
      content: "Hello! I am your supportive reflection companion. How are your mind and energy feeling right now?",
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
      const reply = data.reply || data.fallback || "Take a slow, deep breath. You are doing your best, and your well-being matters.";

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
          content: "I am listening. If you are experiencing heavy distress, please reach out to the PTC Guidance Office or call the NCMH Hotline (1553). Would you like to try a short breathing reset?",
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
        content: "Conversation refreshed. Ready whenever you want to reflect.",
        timestamp: new Date().toISOString(),
      },
    ]);
  };

  return (
    <div id="ai-companion-card" className="bg-white rounded-2xl border border-slate-200/90 shadow-xs flex flex-col h-[650px] overflow-hidden">
      {/* Top Companion Header */}
      <div className="px-5 py-3.5 border-b border-slate-100 bg-slate-50/70 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-teal-700 text-white flex items-center justify-center shadow-xs">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-black text-slate-900">Supportive Reflection AI</h3>
              <span className="text-[10px] bg-teal-50 text-teal-800 border border-teal-200 font-bold px-2 py-0.5 rounded-md">
                Non-Clinical Companion
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">Safe, confidential space</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={clearChat}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-colors"
            title="Reset Chat"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onOpenEmergency}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold transition-colors"
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Crisis</span>
          </button>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3.5 bg-slate-50/40">
        <AnimatePresence initial={false}>
          {messages.map((m) => {
            const isUser = m.role === "user";
            return (
              <motion.div
                key={m.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex items-start gap-2.5 ${isUser ? "flex-row-reverse" : "flex-row"}`}
              >
                <div
                  className={`w-7 h-7 rounded-lg shrink-0 flex items-center justify-center text-xs ${
                    isUser
                      ? "bg-slate-800 text-white"
                      : "bg-teal-700 text-white shadow-2xs"
                  }`}
                >
                  {isUser ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
                </div>

                <div
                  className={`max-w-[85%] sm:max-w-[75%] rounded-2xl px-4 py-2.5 text-xs leading-relaxed ${
                    isUser
                      ? "bg-slate-800 text-white rounded-tr-xs shadow-2xs font-medium"
                      : "bg-white border border-slate-200 text-slate-800 shadow-2xs rounded-tl-xs whitespace-pre-line font-normal"
                  }`}
                >
                  {m.content}
                  <div className="text-[9px] mt-1 text-right opacity-60 font-mono">
                    {new Date(m.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-2.5"
          >
            <div className="w-7 h-7 rounded-lg bg-teal-700 text-white flex items-center justify-center text-xs">
              <Bot className="w-3.5 h-3.5" />
            </div>
            <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-xs px-4 py-2.5 shadow-2xs flex items-center gap-2 text-xs text-slate-500">
              <span className="flex gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-teal-600 animate-bounce" />
                <span className="w-1.5 h-1.5 rounded-full bg-teal-600 animate-bounce [animation-delay:0.2s]" />
                <span className="w-1.5 h-1.5 rounded-full bg-teal-600 animate-bounce [animation-delay:0.4s]" />
              </span>
              <span>Reflecting...</span>
            </div>
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompts Bar */}
      <div className="p-2.5 bg-slate-50/80 border-t border-slate-100 flex items-center gap-1.5 overflow-x-auto text-xs">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-1 shrink-0">Prompts:</span>
        {SAMPLE_QUESTIONS.map((q, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(q)}
            className="px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-700 rounded-lg border border-slate-200 whitespace-nowrap font-medium text-[11px] transition-colors"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Input Field */}
      <div className="p-3 bg-white border-t border-slate-200">
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
            placeholder="Type your reflection..."
            className="flex-1 text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:border-teal-600 text-slate-900 font-medium"
          />
          <button
            id="send-chat-btn"
            type="submit"
            disabled={!input.trim() || isLoading}
            className="p-2.5 bg-teal-700 hover:bg-teal-800 disabled:opacity-40 text-white rounded-xl shadow-xs transition-all active:scale-95 min-h-[38px] min-w-[38px] flex items-center justify-center"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
