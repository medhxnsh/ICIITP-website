"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { motion } from "framer-motion";

const SPACING = 8;       // px between particles — larger = sparser grid
const SPACING_MOBILE = 14; // coarser grid on narrow viewports
const MARGIN = 12;       // tiny edge margin so particles don't clip exactly at border
const THICKNESS = Math.pow(90, 2);  // mouse repulsion radius²
const DRAG = 0.95;
const EASE = 0.25;
// Tier budget by CPU core count (navigator.hardwareConcurrency, resolved at runtime)
function getMaxParticles(): number {
  const cores = navigator.hardwareConcurrency ?? 4;
  if (cores <= 2) return 4000;   // low-end phones / old hardware
  if (cores <= 4) return 8000;   // mid-range
  return 15000;                   // 6+ cores — full density
}
// Brand orange accent: #f79420 → rgb(247, 148, 32)
const PR = 247, PG = 148, PB = 32;

interface Particle {
  x: number; y: number;
  ox: number; oy: number;
  vx: number; vy: number;
}

const EASE_CURVE = [0.22, 1, 0.36, 1] as const;

export function ParticleHero({
  bplans = "1,000+",
  patents = "25",
  totalUndertaking = "₹47.10 Cr",
  startupCount = 100,
  schemeCount = 6,
  labCount = 6,
}: {
  bplans?: string;
  patents?: string;
  totalUndertaking?: string;
  startupCount?: number;
  schemeCount?: number;
  labCount?: number;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId = 0;
    let tog = true;
    let man = false;
    let mx = 0, my = 0;
    let list: Particle[] = [];
    let w = 0, h = 0;
    let numParticles = 0;

    const maxParticles = getMaxParticles();

    const init = () => {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;

      // Adaptive spacing: scale up so total particles stay within budget
      // while always covering the full viewport evenly.
      const minSpacing = w < 640 ? SPACING_MOBILE : SPACING;
      const area = (w - MARGIN * 2) * (h - MARGIN * 2);
      const spacing = Math.max(minSpacing, Math.ceil(Math.sqrt(area / maxParticles)));
      const cols = Math.floor((w - MARGIN * 2) / spacing);
      const rows = Math.floor((h - MARGIN * 2) / spacing);
      numParticles = cols * rows;

      const gridW = (cols - 1) * spacing;
      const gridH = (rows - 1) * spacing;
      const ox0 = (w - gridW) / 2;
      const oy0 = (h - gridH) / 2;

      list = Array.from({ length: numParticles }, (_, i) => {
        const ox = ox0 + spacing * (i % cols);
        const oy = oy0 + spacing * Math.floor(i / cols);
        return { x: ox, y: oy, ox, oy, vx: 0, vy: 0 };
      });
    };

    const onMove = (e: MouseEvent) => {
      const r = wrap.getBoundingClientRect();
      mx = e.clientX - r.left;
      my = e.clientY - r.top;
      man = true;
    };

    init();
    wrap.addEventListener("mousemove", onMove);

    const step = (now: number) => {
      animId = requestAnimationFrame(step);
      tog = !tog;

      if (tog) {
        if (!man) {
          const t = now * 0.001;
          const tanVal = Math.max(-2, Math.min(2, Math.tan(Math.sin(t * 0.8))));
          mx = w * 0.5 + Math.cos(t * 2.1) * Math.cos(t * 0.9) * w * 0.45;
          my = h * 0.5 + Math.sin(t * 3.2) * tanVal * h * 0.45;
        }
        for (let i = 0; i < numParticles; i++) {
          const p = list[i];
          const dx = mx - p.x, dy = my - p.y;
          const d = dx * dx + dy * dy;
          if (d < THICKNESS) {
            const angle = Math.atan2(dy, dx);
            const f = -THICKNESS / d;
            p.vx += f * Math.cos(angle);
            p.vy += f * Math.sin(angle);
          }
          p.x += (p.vx *= DRAG) + (p.ox - p.x) * EASE;
          p.y += (p.vy *= DRAG) + (p.oy - p.y) * EASE;
        }
      } else {
        ctx.clearRect(0, 0, w, h);
        ctx.fillStyle = `rgba(${PR},${PG},${PB},0.95)`;
        for (let i = 0; i < numParticles; i++) {
          const p = list[i];
          ctx.fillRect(~~p.x, ~~p.y, 2, 2);
        }
      }
    };

    animId = requestAnimationFrame(step);

    const onResize = () => init();
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(animId);
      wrap.removeEventListener("mousemove", onMove);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return (
    <div ref={wrapRef} className="absolute inset-0">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{ display: "block" }}
        aria-hidden="true"
      />
      <div
        className="absolute inset-0 flex flex-col items-center justify-center px-4 pb-28 pt-24"
        style={{ pointerEvents: "none" }}
      >
        {/* Institution label */}
        <motion.div
          className="w-full mb-7"
          style={{ textAlign: "center" }}
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: EASE_CURVE }}
        >
          <p style={{ textAlign: "center", color: "var(--color-brand-950)", fontSize: "16px", fontWeight: 900, letterSpacing: "0.22em", textTransform: "uppercase" }}>
            Incubation Centre
          </p>
          <p style={{ textAlign: "center", color: "var(--color-brand-600)", fontSize: "13px", fontWeight: 600, letterSpacing: "0.18em", textTransform: "uppercase", marginTop: "4px" }}>
            IIT Patna
          </p>
        </motion.div>

        <motion.h1
          className="text-[2.75rem] sm:text-5xl lg:text-[3.75rem] font-black max-w-3xl mx-auto leading-[1.05] mb-5 text-center"
          style={{ color: "var(--color-brand-950)", letterSpacing: "-0.02em" }}
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.75, delay: 0.15, ease: EASE_CURVE }}
        >
          India&apos;s leading ESDM &amp;{" "}
          <span style={{ color: "var(--color-brand-800)" }}>Medical Electronics</span>{" "}
          Incubator
        </motion.h1>

        <motion.p
          className="text-base sm:text-lg max-w-lg mx-auto text-center leading-relaxed mb-8"
          style={{ color: "#4a5e2a" }}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, delay: 0.28, ease: EASE_CURVE }}
        >
          {totalUndertaking}{" "}undertaking backed by Govt. of India &amp; Govt. of Bihar
          {" — "}{startupCount}+ startups, {labCount} labs, {schemeCount} schemes.
        </motion.p>

        {/* Apply Now CTA — intersection-observed by the nav */}
        <motion.div
          className="flex flex-col items-center gap-4"
          style={{ pointerEvents: "auto" }}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.42, ease: EASE_CURVE }}
        >
          <Link
            id="hero-cta"
            href="/apply"
            className="inline-flex items-center gap-2.5 px-8 py-3.5 rounded-xl text-white font-bold text-base transition-all hover:scale-[1.03] hover:shadow-lg active:scale-[0.98]"
            style={{ backgroundColor: "var(--color-accent)", boxShadow: "0 4px 24px #f7942040" }}
          >
            Apply Now
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
          <p className="text-[11px] font-medium text-center" style={{ color: "var(--color-brand-600)" }}>
            {bplans} B-plans screened &nbsp;·&nbsp; {patents} patents filed &nbsp;·&nbsp; Est. 2015
          </p>
        </motion.div>
      </div>
    </div>
  );
}
