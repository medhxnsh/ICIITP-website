"use client";

import { useEffect, useState } from "react";

export function ClockWidget() {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  if (!now) return null;

  const date = now.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  const time = now.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: true });

  return (
    <div className="px-5 py-4 rounded-2xl" style={{ backgroundColor: "#f0f7e6", border: "1px solid #d4e6c4" }}>
      <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: "var(--color-brand-600)" }}>
        Current time
      </p>
      <p className="text-2xl font-black tabular-nums" style={{ color: "var(--color-brand-950)" }}>{time}</p>
      <p className="text-xs mt-1" style={{ color: "var(--color-text-secondary)" }}>{date}</p>
    </div>
  );
}
