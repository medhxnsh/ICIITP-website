import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Breadcrumb } from "@/components/breadcrumb";
import { MobileInfo } from "@/components/mobile-info";
import { PROGRAM_CATEGORIES, CATEGORY_BY_SECTION, getProgramBadge } from "@/lib/programs-config";
import { getPublishedPrograms, type CmsProgramDoc } from "@/lib/cms/programs";
import { ArrowRight, GraduationCap } from "lucide-react";
import { Reveal, Stagger, StaggerItem } from "@/components/reveal";
import { ProgramLogo } from "@/components/program-logo";

interface Props { params: Promise<{ locale: string }> }

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Incubation Programs — IC IITP",
  description:
    "IC IITP runs programmes across the full startup journey — Pre-Incubation, Incubation, and Acceleration — supporting deep-tech founders from idea to scale.",
};

export default async function ProgramsPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const programs = await getPublishedPrograms().catch(() => []);

  const bySection: Record<string, CmsProgramDoc[]> = {
    PRE_INCUBATION: [],
    INCUBATION: [],
    ACCELERATION: [],
  };
  for (const p of programs) {
    const key = p.section ?? "INCUBATION";
    if (key in bySection) bySection[key].push(p);
  }

  const totalSchemes = programs.length;

  return (
    <>
      <div className="md:hidden"><MobileInfo page="programs" /></div>
      <div className="hidden md:block min-h-screen" style={{ backgroundColor: "var(--color-surface)" }}>
      {/* Hero */}
      <div className="relative overflow-hidden" style={{ background: "linear-gradient(160deg, var(--color-hero-from) 0%, var(--color-hero-via) 60%, var(--color-hero-to) 100%)" }}>
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true"
          style={{ backgroundImage: "radial-gradient(circle, #ffffff07 1px, transparent 1px)", backgroundSize: "24px 24px" }} />
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full pointer-events-none" aria-hidden="true"
          style={{ background: "radial-gradient(circle, #f7942020 0%, transparent 65%)" }} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-12 relative z-10">
          <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Programs" }]} variant="light" />
          <Reveal>
            <p className="text-xs font-semibold uppercase tracking-widest mb-4 text-orange-200">
              <GraduationCap className="w-3.5 h-3.5 inline mr-1.5 -mt-0.5" aria-hidden="true" />
              IC IITP
            </p>
            <h1 className="text-2xl sm:text-4xl lg:text-6xl font-black text-white leading-tight mb-4">
              Incubation<br />Programs
            </h1>
            <p className="text-white/80 text-lg max-w-lg">
              IC IITP supports founders across every stage of the startup journey — from first idea to scaling a market-ready company.
            </p>
            <p className="text-orange-200 text-xs font-semibold mt-3 tabular-nums">
              {PROGRAM_CATEGORIES.length} stages · {totalSchemes} schemes
            </p>

            {/* Journey progress bar — inside hero */}
            {(() => {
              const heroColors: Record<string, string> = {
                PRE_INCUBATION: "var(--color-accent)",
                INCUBATION: "#7fcf5b",
                ACCELERATION: "#c5e8a0",
              };
              return (
                <div className="flex items-start gap-0 mt-10 max-w-lg">
                  {PROGRAM_CATEGORIES.map((cat, i) => {
                    const color = heroColors[cat.sectionKey] ?? "#ffffff";
                    return (
                      <div key={cat.sectionKey} className="flex items-center flex-1">
                        <div className="flex flex-col items-center gap-2 min-w-0">
                          <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: color }} />
                          <div className="text-center">
                            <p className="text-xs font-bold" style={{ color }}>{cat.title}</p>
                            <p className="text-[10px] text-orange-200">{cat.subtitle}</p>
                          </div>
                        </div>
                        {i < PROGRAM_CATEGORIES.length - 1 && (
                          <div className="flex-1 h-px mx-3 mt-1.5 bg-white/20" />
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            })()}
          </Reveal>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

      {/* ── Section blocks ─────────────────────────────────────────────── */}
      <Stagger className="flex flex-col gap-12">
        {PROGRAM_CATEGORIES.map((category, i) => {
          const sectionPrograms = bySection[category.sectionKey] ?? [];
          return (
            <StaggerItem key={category.sectionKey}>
              <div className="rounded-2xl p-6 sm:p-8" style={{
                border: `1.5px solid ${category.accentColor}30`,
                backgroundColor: category.accentColor + "06",
              }}>
              {/* Section header */}
              <div className="flex items-start justify-between gap-6 mb-6">
                <div className="flex items-start gap-5">
                  <div
                    className="text-[3.5rem] font-black tabular-nums leading-none shrink-0"
                    style={{ color: category.accentColor, opacity: 0.25 }}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </div>
                  <div className="pt-1">
                    <div className="flex items-center gap-3 flex-wrap mb-1">
                      <h2 className="text-2xl font-black" style={{ color: "var(--color-brand-950)" }}>
                        {category.title}
                      </h2>
                      <span
                        className="text-xs font-bold px-3 py-1 rounded-full tracking-wide"
                        style={{ backgroundColor: category.accentColor + "18", color: category.accentColor }}
                      >
                        {category.subtitle}
                      </span>
                    </div>
                    <p className="text-sm leading-relaxed max-w-xl" style={{ color: "var(--color-text-body)" }}>
                      {category.description}
                    </p>
                  </div>
                </div>
                <div className="shrink-0 text-right hidden sm:block">
                  <div className="text-3xl font-black leading-none tabular-nums" style={{ color: category.accentColor }}>
                    {sectionPrograms.length}
                  </div>
                  <div className="text-[10px] font-semibold tracking-widest uppercase mt-1" style={{ color: "var(--color-text-secondary)" }}>
                    schemes
                  </div>
                </div>
              </div>

              {/* Program cards */}
              {sectionPrograms.length === 0 ? (
                <p className="text-sm italic" style={{ color: "var(--color-placeholder)" }}>No programmes listed yet.</p>
              ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {sectionPrograms.map((prog) => (
                    <Link
                      key={prog.slug}
                      href={`/programs/${prog.slug}`}
                      className="group flex flex-col gap-3 p-5 rounded-xl bg-white transition-all duration-300 hover:-translate-y-1"
                      style={{
                        border: `1px solid ${category.accentColor}28`,
                        boxShadow: "0 2px 8px rgba(28,46,6,0.05)",
                      }}
                    >
                      {/* Programme logo — pulled from backend logoUrl, falls back to static assets */}
                      <ProgramLogo slug={prog.slug} logoUrl={prog.logoUrl} size={28} />

                      <div className="flex items-start justify-between gap-2">
                        <div>
                          {getProgramBadge(prog.slug, prog.badge) && (
                            <span
                              className="text-xs font-bold px-2.5 py-0.5 rounded-full mb-2 inline-block"
                              style={{ backgroundColor: category.accentColor + "18", color: category.accentColor }}
                            >
                              {getProgramBadge(prog.slug, prog.badge)}
                            </span>
                          )}
                          <p className="text-sm font-bold leading-snug" style={{ color: "var(--color-brand-950)" }}>
                            {prog.title}
                          </p>
                        </div>
                        <ArrowRight
                          className="w-4 h-4 shrink-0 mt-0.5 transition-transform duration-200 group-hover:translate-x-1"
                          style={{ color: category.accentColor }}
                          aria-hidden="true"
                        />
                      </div>
                      {prog.tagline && (
                        <p className="text-sm leading-relaxed line-clamp-2" style={{ color: "var(--color-text-secondary)" }}>
                          {prog.tagline}
                        </p>
                      )}
                      {(() => {
                        const h = prog.cardHighlight;
                        const val = h === "grant" ? prog.grant : h === "stipend" ? prog.stipend : h === "schemeOutlay" ? prog.schemeOutlay : null;
                        return val ? (
                          <p className="text-xs font-semibold mt-auto" style={{ color: category.accentColor }}>{val}</p>
                        ) : null;
                      })()}
                    </Link>
                  ))}
                </div>
              )}
              </div>
            </StaggerItem>
          );
        })}
      </Stagger>
      </div>
    </div>
    </>
  );
}
