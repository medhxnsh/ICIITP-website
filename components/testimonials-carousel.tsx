"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

const TESTIMONIALS = [
  {
    quote: "Being the first incubatee of IC, we grew with the centre. Excellent infrastructure, a phenomenal MedTech Mentor and unlimited access to Prototyping labs enabled us to accelerate our Product development. Any ESDM start-up can magnify their growth with their incubation program.",
    name: "Llewellyn D'Sa",
    role: "Founder, Bionic Hope Pvt Ltd",
    image: "/images/testimonials/llewellyn-dsa.jpg",
    initials: "LD",
  },
  {
    quote: "Our journey truly began when we got incubated at IC. IC management and team believed and stood with us in our early days of struggle. Seed funding of Rs 10 Lakhs enabled us to perfect our products and conduct pilots which lead to major customer acquisitions such as Bangalore Airport.",
    name: "Ankur Jaiswal",
    role: "Founder, 4Mirrortech Innovatives Pvt Ltd",
    image: "/images/testimonials/ankur-jaiswal.jpg",
    initials: "AJ",
  },
  {
    quote: "We have been fortunate to be part of the IC IITP family. We received mentorship, office facilities, seed fund and plenty of intangible help that was needed on a day to day basis to take our work forward.",
    name: "Rahul Raj",
    role: "Co-founder, Electro Curietech Pvt Ltd",
    image: "/images/testimonials/rahul-raj.jpg",
    initials: "RR",
  },
  {
    quote: "As a proud incubatee at IIT Patna Incubation Centre, CEIR Mobility extends heartfelt gratitude for the exceptional support received. Access to state-of-the-art facilities, mentorship, and investor backing has been instrumental in advancing our vision of developing the most efficient motor and motor controller for energy conservation. A shout-out to IIT Patna Incubation Centre for fostering innovation and nurturing emerging startups like ours!",
    name: "Jitendra Parit",
    role: "CTO, CEIR MOBILITY PVT. LTD.",
    image: "/images/testimonials/jitendra-parit.jpg",
    initials: "JP",
  },
];

const EASE = [0.22, 1, 0.36, 1] as const;

function SideCard({
  t,
  onClick,
  label,
}: {
  t: (typeof TESTIMONIALS)[number];
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="text-left w-full flex flex-col cursor-pointer group"
      aria-label={label}
    >
      <span
        className="text-4xl font-black leading-none block mb-3 select-none transition-colors"
        style={{ color: "rgba(255,255,255,0.12)" }}
        aria-hidden="true"
      >
        &ldquo;
      </span>
      <p
        className="text-sm leading-relaxed flex-1 group-hover:opacity-30 transition-opacity"
        style={{ color: "rgba(255,255,255,0.18)" }}
      >
        {t.quote}
      </p>
      <div className="flex flex-col items-center gap-1.5 mt-8 w-full">
        <div className="w-11 h-11 rounded-full overflow-hidden" style={{ opacity: 0.35 }}>
          <Image
            src={t.image}
            alt={t.name}
            width={44}
            height={44}
            className="w-full h-full object-cover object-top"
          />
        </div>
        <p className="text-xs font-semibold text-center" style={{ color: "rgba(255,255,255,0.3)" }}>
          {t.name}
        </p>
        <p className="text-xs text-center" style={{ color: "rgba(255,255,255,0.18)" }}>
          {t.role}
        </p>
      </div>
    </button>
  );
}

export function TestimonialsCarousel() {
  const [active, setActive] = useState(0);
  const n = TESTIMONIALS.length;

  const advance = useCallback(() => setActive((p) => (p + 1) % n), [n]);

  useEffect(() => {
    const timer = setInterval(advance, 5500);
    return () => clearInterval(timer);
  }, [advance]);

  const prevIdx = (active - 1 + n) % n;
  const nextIdx = (active + 1) % n;
  const current = TESTIMONIALS[active];

  return (
    <div className="w-full">
      {/* Desktop 3-col carousel */}
      <div className="hidden md:grid grid-cols-[1fr_1.45fr_1fr] gap-6 lg:gap-10 items-start">

        {/* Left — previous */}
        <SideCard
          t={TESTIMONIALS[prevIdx]}
          onClick={() => setActive(prevIdx)}
          label={`Previous: ${TESTIMONIALS[prevIdx].name}`}
        />

        {/* Center — featured */}
        <div className="flex flex-col items-center">
          {/* Bubble + triangle wrapper */}
          <div className="relative w-full" style={{ paddingBottom: 22 }}>
            <AnimatePresence mode="wait">
              <motion.div
                key={active}
                className="relative rounded-2xl"
                style={{ backgroundColor: "var(--color-accent)" }}
                initial={{ opacity: 0, y: 16, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.97 }}
                transition={{ duration: 0.42, ease: EASE }}
              >
                <div className="p-8 lg:p-10">
                  <span
                    className="text-5xl font-black leading-none block mb-4 select-none"
                    style={{ color: "rgba(255,255,255,0.38)" }}
                    aria-hidden="true"
                  >
                    &ldquo;
                  </span>
                  <p className="text-base lg:text-[17px] leading-relaxed text-white font-medium">
                    {current.quote}
                  </p>
                </div>

                {/* Speech bubble triangle */}
                <div
                  aria-hidden="true"
                  className="absolute left-1/2 -translate-x-1/2"
                  style={{
                    bottom: -20,
                    width: 0,
                    height: 0,
                    borderLeft: "18px solid transparent",
                    borderRight: "18px solid transparent",
                    borderTop: "22px solid #f79420",
                  }}
                />
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Avatar */}
          <AnimatePresence mode="wait">
            <motion.div
              key={`av-${active}`}
              className="flex flex-col items-center gap-2 text-center mt-4"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.32, ease: EASE }}
            >
              <div
                className="w-[72px] h-[72px] rounded-full overflow-hidden"
                style={{ boxShadow: "0 0 0 3px rgba(247,148,32,0.5)" }}
              >
                <Image
                  src={current.image}
                  alt={current.name}
                  width={72}
                  height={72}
                  className="w-full h-full object-cover object-top"
                />
              </div>
              <p className="font-bold text-white text-sm mt-1">{current.name}</p>
              <p className="text-xs" style={{ color: "rgba(255,255,255,0.55)" }}>
                {current.role}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Right — next */}
        <SideCard
          t={TESTIMONIALS[nextIdx]}
          onClick={() => setActive(nextIdx)}
          label={`Next: ${TESTIMONIALS[nextIdx].name}`}
        />
      </div>

      {/* Mobile — single card */}
      <div className="md:hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            className="rounded-2xl p-7"
            style={{ backgroundColor: "var(--color-accent)" }}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.4, ease: EASE }}
          >
            <span
              className="text-5xl font-black leading-none block mb-3 select-none"
              style={{ color: "rgba(255,255,255,0.38)" }}
              aria-hidden="true"
            >
              &ldquo;
            </span>
            <p className="text-base leading-relaxed text-white font-medium mb-6">
              {current.quote}
            </p>
            <div className="flex items-center gap-3 pt-5" style={{ borderTop: "1px solid rgba(255,255,255,0.25)" }}>
              <div className="w-10 h-10 rounded-full overflow-hidden shrink-0" style={{ boxShadow: "0 0 0 2px rgba(255,255,255,0.3)" }}>
                <Image
                  src={current.image}
                  alt={current.name}
                  width={40}
                  height={40}
                  className="w-full h-full object-cover object-top"
                />
              </div>
              <div>
                <p className="font-bold text-white text-sm">{current.name}</p>
                <p className="text-xs" style={{ color: "rgba(255,255,255,0.65)" }}>{current.role}</p>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Progress pill indicators */}
      <div
        className="flex items-center justify-center gap-2.5 mt-10"
        role="group"
        aria-label="Testimonial navigation"
      >
        {TESTIMONIALS.map((t, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setActive(i)}
            aria-label={`Show ${t.name}`}
            aria-pressed={i === active}
            className="relative rounded-full overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
            style={{
              width: i === active ? 48 : 8,
              height: 8,
              backgroundColor: i === active ? "rgba(247,148,32,0.28)" : "rgba(255,255,255,0.22)",
              transition: "width 0.3s ease, background-color 0.3s ease",
            }}
          >
            {i === active && (
              <motion.div
                key={active}
                className="absolute inset-y-0 left-0 rounded-full"
                style={{ backgroundColor: "var(--color-accent)" }}
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: 5.5, ease: "linear" }}
              />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
