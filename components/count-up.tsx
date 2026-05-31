"use client";

import { useEffect, useRef, useState } from "react";

interface CountUpProps {
  /** Display string like "₹47.10 Cr", "1,000+", "100+", "25", "600+", "6" */
  value: string;
  className?: string;
}

function parseValue(v: string): { prefix: string; num: number; suffix: string } {
  // Strip leading non-digit chars (e.g. "₹")
  const prefixMatch = v.match(/^[^\d]*/);
  const prefix = prefixMatch ? prefixMatch[0] : "";
  const rest = v.slice(prefix.length);
  // Remove thousands separators before parsing so "1,000+" → "1000+"
  const strippedRest = rest.replace(/,/g, "");
  const numStr = strippedRest.match(/[\d.]+/)?.[0] ?? "0";
  const num = parseFloat(numStr);
  // Use strippedRest (not rest) to slice suffix — avoids residual comma chars
  const suffix = strippedRest.slice(numStr.length); // e.g. " Cr", "+", ""
  return { prefix, num, suffix };
}

export function CountUp({ value, className }: CountUpProps) {
  const { prefix, num, suffix } = parseValue(value);
  const isDecimal = num % 1 !== 0;
  const [display, setDisplay] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const duration = 1200;
          const steps = 50;
          const stepMs = duration / steps;
          let step = 0;
          const timer = setInterval(() => {
            step++;
            const progress = step / steps;
            // ease-out cubic
            const eased = 1 - Math.pow(1 - progress, 3);
            setDisplay(parseFloat((eased * num).toFixed(isDecimal ? 2 : 0)));
            if (step >= steps) { clearInterval(timer); setDisplay(num); }
          }, stepMs);
        }
      },
      { threshold: 0.4 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [num, isDecimal]);

  const formatted = isDecimal
    ? display.toFixed(2)
    : display >= 1000
      ? Math.round(display).toLocaleString()
      : Math.round(display).toString();

  return (
    <span ref={ref} className={className}>
      {prefix}{formatted}{suffix}
    </span>
  );
}
