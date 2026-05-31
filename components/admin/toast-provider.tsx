"use client";

import {
  createContext,
  useCallback,
  useContext,
  useId,
  useRef,
  useState,
} from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, AlertTriangle, Info, XCircle, X } from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────

type ToastKind = "success" | "error" | "warning" | "info";

interface Toast {
  id: string;
  kind: ToastKind;
  title: string;
  body?: string;
}

interface ToastAPI {
  success: (title: string, body?: string) => void;
  error:   (title: string, body?: string) => void;
  warning: (title: string, body?: string) => void;
  info:    (title: string, body?: string) => void;
}

// ─── Context ─────────────────────────────────────────────────────────────────

const ToastContext = createContext<ToastAPI | null>(null);

export function useToast(): ToastAPI {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside <ToastProvider>");
  return ctx;
}

// ─── Visual config ───────────────────────────────────────────────────────────

const KIND: Record<ToastKind, { icon: React.ReactNode; bar: string; bg: string; title: string }> = {
  success: {
    icon: <Check className="w-4 h-4" />,
    bar: "#16a34a",
    bg: "#f0fdf4",
    title: "#14532d",
  },
  error: {
    icon: <XCircle className="w-4 h-4" />,
    bar: "#dc2626",
    bg: "#fef2f2",
    title: "#7f1d1d",
  },
  warning: {
    icon: <AlertTriangle className="w-4 h-4" />,
    bar: "#d97706",
    bg: "#fffbeb",
    title: "#78350f",
  },
  info: {
    icon: <Info className="w-4 h-4" />,
    bar: "#2563eb",
    bg: "#eff6ff",
    title: "#1e3a8a",
  },
};

// ─── Provider ────────────────────────────────────────────────────────────────

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const timers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());
  const counter = useRef(0);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    const t = timers.current.get(id);
    if (t) { clearTimeout(t); timers.current.delete(id); }
  }, []);

  const add = useCallback(
    (kind: ToastKind, title: string, body?: string) => {
      const id = `toast-${++counter.current}`;
      setToasts((prev) => [...prev.slice(-4), { id, kind, title, body }]);
      const t = setTimeout(() => dismiss(id), 5000);
      timers.current.set(id, t);
    },
    [dismiss]
  );

  const api: ToastAPI = {
    success: (t, b) => add("success", t, b),
    error:   (t, b) => add("error",   t, b),
    warning: (t, b) => add("warning", t, b),
    info:    (t, b) => add("info",    t, b),
  };

  return (
    <ToastContext.Provider value={api}>
      {children}

      {/* Toast stack — fixed bottom-left (avoids right panel), above everything */}
      <div className="fixed bottom-6 left-4 sm:left-52 z-[200] flex flex-col gap-2 items-start pointer-events-none">
        <AnimatePresence initial={false}>
          {toasts.map((toast) => {
            const cfg = KIND[toast.kind];
            return (
              <motion.div
                key={toast.id}
                layout
                initial={{ opacity: 0, x: -16, scale: 0.95 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: -12, scale: 0.95 }}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
                className="pointer-events-auto flex items-start gap-3 pl-4 pr-3 py-3 rounded-xl shadow-lg w-[min(320px,calc(100vw-2rem))]"
                style={{ backgroundColor: cfg.bg, border: `1px solid ${cfg.bar}22` }}
                role="alert"
                aria-live="polite"
              >
                {/* Left colour bar */}
                <span
                  className="shrink-0 w-1 self-stretch rounded-full"
                  style={{ backgroundColor: cfg.bar }}
                  aria-hidden="true"
                />

                {/* Icon */}
                <span className="shrink-0 mt-0.5" style={{ color: cfg.bar }} aria-hidden="true">
                  {cfg.icon}
                </span>

                {/* Text */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold leading-snug" style={{ color: cfg.title }}>
                    {toast.title}
                  </p>
                  {toast.body && (
                    <p className="text-xs mt-0.5 leading-relaxed" style={{ color: cfg.title, opacity: 0.75 }}>
                      {toast.body}
                    </p>
                  )}
                </div>

                {/* Dismiss */}
                <button
                  onClick={() => dismiss(toast.id)}
                  className="shrink-0 p-0.5 rounded hover:opacity-60 transition-opacity mt-0.5"
                  style={{ color: cfg.title }}
                  aria-label="Dismiss"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}
