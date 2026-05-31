"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { findAnswer } from "@/lib/chatbot-match";
import { AnimatePresence, motion } from "framer-motion";
import { X, Send, ChevronDown, RotateCcw } from "lucide-react";

function DishaIcon({ size = 20, className = "" }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      {/* Outer ring */}
      <circle cx="12" cy="12" r="9.5" stroke="currentColor" strokeWidth="1.2" opacity="0.45" />
      {/* North arrow — solid, bright */}
      <path d="M12 4.5 L9.8 12.2 L12 10.8 L14.2 12.2 Z" fill="currentColor" />
      {/* South arrow — dim */}
      <path d="M12 19.5 L14.2 11.8 L12 13.2 L9.8 11.8 Z" fill="currentColor" opacity="0.28" />
      {/* East tick */}
      <line x1="20.5" y1="12" x2="18.5" y2="12" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" opacity="0.35" />
      {/* West tick */}
      <line x1="3.5" y1="12" x2="5.5" y2="12" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" opacity="0.35" />
      {/* Centre pivot */}
      <circle cx="12" cy="12" r="1.4" fill="currentColor" />
    </svg>
  );
}

interface Message {
  id: number;
  role: "bot" | "user";
  text: string;
  followUps?: string[];
}

const GREETING =
  "Hi! I'm **DISHA**, your IC IITP guide. I can help you find information about our programs, facilities, application process, and more.";

const SUGGESTED = [
  "What programs are available?",
  "How do I apply?",
  "What facilities does IC IITP have?",
  "How many startups has IC IITP supported?",
];

function renderMarkdown(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={i}>{part.slice(2, -2)}</strong>;
    }
    return (
      <span key={i}>
        {part.split("\n").map((line, j, arr) => (
          <span key={j}>
            {line}
            {j < arr.length - 1 && <br />}
          </span>
        ))}
      </span>
    );
  });
}

function TypingDots() {
  return (
    <div className="flex items-center gap-1 px-3 py-2.5">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="w-1.5 h-1.5 rounded-full bg-[var(--color-muted)]"
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
        />
      ))}
    </div>
  );
}

let msgId = 1;

function makeGreeting(): Message {
  return { id: msgId++, role: "bot", text: GREETING };
}

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>(() => [makeGreeting()]);
  const [input, setInput] = useState("");
  const loading = false;
  const [unread, setUnread] = useState(0);
  const [showLabel, setShowLabel] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [everOpened, setEverOpened] = useState(false);

  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Show label after 1.5s, tooltip after 4s (first visit only)
  useEffect(() => {
    const t1 = setTimeout(() => setShowLabel(true), 1500);
    const t2 = setTimeout(() => setShowTooltip(true), 4000);
    const t3 = setTimeout(() => setShowTooltip(false), 9000);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    if (open) {
      setUnread(0);
      setShowTooltip(false);
      setEverOpened(true);
      setTimeout(() => inputRef.current?.focus(), 200);
    }
  }, [open]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape" && open) setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const send = useCallback(
    (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || loading) return;

      const userMsg: Message = { id: msgId++, role: "user", text: trimmed };
      setMessages((prev) => [...prev, userMsg]);
      setInput("");

      const { answer, followUps } = findAnswer(trimmed.slice(0, 500));
      setMessages((prev) => [
        ...prev,
        { id: msgId++, role: "bot", text: answer, followUps: followUps ?? [] },
      ]);
      if (!open) setUnread((n) => n + 1);
    },
    [loading, open]
  );

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    send(input);
  }

  function resetChat() {
    msgId = 1;
    setMessages([makeGreeting()]);
    setInput("");
    setUnread(0);
    setTimeout(() => inputRef.current?.focus(), 50);
  }

  const showSuggested = messages.length === 1;

  return (
    <div className="fixed bottom-6 right-4 sm:right-6 z-50 flex flex-col items-end gap-3">
      <AnimatePresence>
        {open && (
          <motion.div
            key="panel"
            initial={{ opacity: 0, y: 16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.97 }}
            transition={{ type: "spring", stiffness: 380, damping: 30 }}
            className="w-[min(340px,calc(100vw-2rem))] flex flex-col rounded-xl overflow-hidden shadow-[0_8px_40px_0_rgb(0_0_0/0.18)] border border-[var(--color-border)] bg-[var(--color-surface)]"
            style={{ maxHeight: "min(520px, calc(100dvh - 6rem))" }}
            role="dialog"
            aria-label="DISHA – IC IITP Chat Assistant"
            aria-modal="false"
          >
            {/* Header */}
            <div
              className="flex items-center gap-2.5 px-4 py-3 text-white shrink-0"
              style={{ background: "linear-gradient(135deg, #075985 0%, #0284c7 100%)" }}
            >
              <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: "rgba(255,255,255,0.15)" }}>
                <DishaIcon size={16} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold leading-tight tracking-wide">DISHA</p>
                <p className="text-xs text-white/85 truncate">IC IITP AI Assistant</p>
              </div>
              <button
                onClick={resetChat}
                className="p-1.5 rounded hover:bg-white/15 transition-colors"
                aria-label="Reset conversation"
                title="New conversation"
              >
                <RotateCcw size={14} />
              </button>
              <button
                onClick={() => setOpen(false)}
                className="p-1.5 rounded hover:bg-white/15 transition-colors"
                aria-label="Close chat"
              >
                <ChevronDown size={18} />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3 text-sm min-h-0">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col gap-1.5 ${msg.role === "user" ? "items-end" : "items-start"}`}
                >
                  <div
                    className={`max-w-[85%] px-3 py-2 rounded-xl leading-relaxed ${
                      msg.role === "user"
                        ? "text-white rounded-br-sm"
                        : "bg-[var(--color-surface-alt)] text-[var(--color-text)] rounded-bl-sm border border-[var(--color-border)]"
                    }`}
                    style={msg.role === "user" ? { backgroundColor: "#0284c7" } : {}}
                  >
                    {msg.text ? renderMarkdown(msg.text) : <TypingDots />}
                  </div>
                  {msg.role === "bot" && msg.followUps && msg.followUps.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 max-w-[85%]">
                      {msg.followUps.map((q) => (
                        <button
                          key={q}
                          onClick={() => send(q)}
                          disabled={loading}
                          className="text-xs px-2.5 py-1 rounded-full disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          style={{ border: "1px solid #7dd3fc", color: "#0369a1", backgroundColor: "#f0f9ff" }}
                          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = "#e0f2fe"; }}
                          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = "#f0f9ff"; }}
                        >
                          {q}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              {showSuggested && (
                <div className="flex flex-col gap-1.5 items-start">
                  <p className="text-xs text-[var(--color-muted)] px-1">Try asking:</p>
                  <div className="flex flex-wrap gap-1.5">
                    {SUGGESTED.map((q) => (
                      <button
                        key={q}
                        onClick={() => send(q)}
                        disabled={loading}
                        className="text-xs px-2.5 py-1 rounded-full disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        style={{ border: "1px solid #7dd3fc", color: "#0369a1", backgroundColor: "#f0f9ff" }}
                        onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = "#e0f2fe"; }}
                        onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = "#f0f9ff"; }}
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              )}


              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <form
              onSubmit={handleSubmit}
              className="flex items-center gap-2 px-3 py-2.5 border-t shrink-0 focus-within:ring-2 focus-within:ring-[--color-brand-500] focus-within:ring-inset"
            style={{ borderColor: "#bae6fd" }}
            >
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your question…"
                disabled={loading}
                className="flex-1 text-sm bg-transparent outline-none placeholder:text-[var(--color-muted)] text-[var(--color-text)] disabled:opacity-50"
                aria-label="Type your question"
              />
              <button
                type="submit"
                disabled={!input.trim() || loading}
                className="p-1.5 rounded-lg text-white disabled:opacity-35 transition-colors shrink-0"
                style={{ backgroundColor: "#0284c7" }}
                aria-label="Send message"
              >
                <Send size={15} />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tooltip bubble */}
      <AnimatePresence>
        {showTooltip && !open && !everOpened && (
          <motion.div
            initial={{ opacity: 0, x: 10, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 10, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 24 }}
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-white text-sm font-medium shadow-lg cursor-pointer select-none"
            style={{ backgroundColor: "#0369a1", maxWidth: 200 }}
            onClick={() => setOpen(true)}
          >
            <DishaIcon size={13} className="shrink-0 opacity-80" />
            <span>Hi! I&apos;m DISHA — your IC IITP guide 👋</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Label + Bubble row */}
      <div className="flex items-center gap-2">
        <AnimatePresence>
          {showLabel && !open && (
            <motion.button
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 8 }}
              transition={{ duration: 0.3 }}
              onClick={() => setOpen(true)}
              className="text-xs font-bold text-white px-3 py-1.5 rounded-full shadow-md"
              style={{ backgroundColor: "#0369a1" }}
            >
              Ask DISHA
            </motion.button>
          )}
        </AnimatePresence>

        {/* Main bubble */}
        <div className="relative">
          {/* Pulsing beacon ring — only when closed */}
          {!open && (
            <>
              <motion.span
                className="absolute inset-0 rounded-full"
                style={{ backgroundColor: "#0284c7" }}
                animate={{ scale: [1, 1.55], opacity: [0.45, 0] }}
                transition={{ duration: 1.8, repeat: Infinity, ease: "easeOut" }}
              />
              <motion.span
                className="absolute inset-0 rounded-full"
                style={{ backgroundColor: "#0284c7" }}
                animate={{ scale: [1, 1.3], opacity: [0.3, 0] }}
                transition={{ duration: 1.8, repeat: Infinity, ease: "easeOut", delay: 0.5 }}
              />
            </>
          )}

          <motion.button
            onClick={() => setOpen((v) => !v)}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.94 }}
            className="relative w-14 h-14 rounded-full text-white shadow-[0_4px_24px_0_rgb(2_132_199/0.45)] flex items-center justify-center"
            style={{ backgroundColor: "#0284c7" }}
            aria-label={open ? "Close DISHA" : "Open DISHA"}
            aria-expanded={open}
          >
            <AnimatePresence mode="wait">
              {open ? (
                <motion.span
                  key="x"
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.15 }}
                >
                  <X size={22} />
                </motion.span>
              ) : (
                <motion.span
                  key="chat"
                  initial={{ rotate: 90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: -90, opacity: 0 }}
                  transition={{ duration: 0.15 }}
                >
                  <DishaIcon size={32} />
                </motion.span>
              )}
            </AnimatePresence>

            {!open && unread > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center"
              >
                {unread}
              </motion.span>
            )}
          </motion.button>
        </div>
      </div>
    </div>
  );
}
