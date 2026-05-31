"use client";

import { motion } from "framer-motion";

const EASE = [0.22, 1, 0.36, 1] as const;

export function HeroText() {
  return (
    <div className="text-center pt-12 pb-4 px-4">
      <motion.p
        className="text-xs font-semibold uppercase tracking-widest mb-4"
        style={{ color: "var(--color-brand-600)" }}
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: EASE }}
      >
        Incubation Centre · IIT Patna
      </motion.p>

      <motion.h1
        className="text-3xl sm:text-4xl lg:text-5xl font-black max-w-3xl mx-auto leading-tight mb-4"
        style={{ color: "var(--color-brand-800)" }}
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.75, delay: 0.12, ease: EASE }}
      >
        India&apos;s leading ESDM &amp; Medical Electronics Incubator
      </motion.h1>

      <motion.p
        className="text-base sm:text-lg text-gray-500 max-w-xl mx-auto"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.65, delay: 0.26, ease: EASE }}
      >
        ₹47.10 Crore undertaking backed by Govt. of India &amp; Govt. of Bihar — 100+ startups, 6 labs, 6 schemes.
      </motion.p>
    </div>
  );
}
