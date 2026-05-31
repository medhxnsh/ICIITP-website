import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Breadcrumb } from "@/components/breadcrumb";
import { PROGRAM_CATEGORIES, getProgramBadge } from "@/lib/programs-config";
import { getProgramsBySection } from "@/lib/cms/programs";
import { ArrowRight, Banknote, Clock, Layers } from "lucide-react";
import { Stagger, StaggerItem } from "@/components/reveal";
import { ProgramLogo } from "@/components/program-logo";

interface Props { params: Promise<{ locale: string }> }

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Pre-Incubation Programs — IC IITP",
  description: "Early-stage support at IC IITP: NIDHI-EIR, GENESIS-EIR, and NIDHI-PRAYAS grants for innovators converting ideas into prototypes.",
};

export default async function PreIncubationPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const category = PROGRAM_CATEGORIES[0];
  const programs = await getProgramsBySection("PRE_INCUBATION").catch(() => []);
  const accent = category.accentColor;

  return (
    <>
      <div className="relative overflow-hidden" style={{ background: "linear-gradient(160deg, var(--color-hero-from) 0%, var(--color-hero-via) 60%, var(--color-hero-to) 100%)" }}>
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true"
          style={{ backgroundImage: "radial-gradient(circle, #ffffff07 1px, transparent 1px)", backgroundSize: "24px 24px" }} />
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full pointer-events-none" aria-hidden="true"
          style={{ background: "radial-gradient(circle, #f7942020 0%, transparent 65%)" }} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-20 relative z-10">
          <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Programs", href: "/programs" }, { label: "Pre-Incubation" }]} variant="light" />
          <p className="text-xs font-semibold uppercase tracking-widest mb-4 mt-6 text-orange-200">
            <Layers className="w-3.5 h-3.5 inline mr-1.5 -mt-0.5" aria-hidden="true" />
            Stage 1 · {category.subtitle}
          </p>
          <h1 className="text-2xl sm:text-4xl lg:text-6xl font-black text-white leading-tight mb-4">{category.title}</h1>
          <p className="text-white/80 text-lg max-w-lg">{category.description}</p>
        </div>
      </div>

      <div className="w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Stagger className="flex flex-col gap-4">
          {programs.map((program) => (
            <StaggerItem key={program.slug}>
              <Link
                href={`/programs/${program.slug}`}
                className="group relative flex rounded-2xl bg-white overflow-hidden transition-all duration-500 ease-out hover:-translate-y-1.5 shadow-[0_2px_8px_rgba(28,46,6,0.06),0_8px_24px_rgba(28,46,6,0.05)] hover:shadow-[0_16px_48px_rgba(247,148,32,0.14),0_6px_16px_rgba(28,46,6,0.08)]"
                style={{ borderTop: `2px solid ${accent}` }}
              >
                <span aria-hidden="true" className="absolute right-4 top-1/2 -translate-y-1/2 text-[6rem] font-black leading-none select-none pointer-events-none" style={{ color: accent, opacity: 0.04 }}>
                  {program.badge}
                </span>
                <div className="relative flex-1 flex items-start gap-6 p-6 sm:p-8">
                  <div className="flex-1 min-w-0">
                    <ProgramLogo slug={program.slug} logoUrl={program.logoUrl} size={28} />
                    <div className="flex items-start justify-between gap-4 mb-3 mt-3">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          {getProgramBadge(program.slug, program.badge) && (
                            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full" style={{ backgroundColor: accent + "18", color: accent }}>
                              {getProgramBadge(program.slug, program.badge)}
                            </span>
                          )}
                          {program.status === "Open" && (
                            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800">Open</span>
                          )}
                        </div>
                        <h2 className="text-lg sm:text-xl font-black leading-snug mt-2" style={{ color: "var(--color-brand-950)" }}>{program.title}</h2>
                      </div>
                    </div>
                    {program.tagline && <p className="text-sm leading-relaxed line-clamp-2 mb-5" style={{ color: "var(--color-text-body)" }}>{program.tagline}</p>}
                    <div className="flex items-center gap-4 flex-wrap">
                      {(() => {
                        const h = program.cardHighlight;
                        const val = h === "grant" ? program.grant : h === "stipend" ? program.stipend : h === "schemeOutlay" ? program.schemeOutlay : null;
                        return val ? (
                          <div className="flex items-center gap-1.5">
                            <Banknote className="w-3.5 h-3.5" style={{ color: accent }} aria-hidden="true" />
                            <span className="text-xs font-semibold" style={{ color: accent }}>{val}</span>
                          </div>
                        ) : null;
                      })()}
                      {program.duration && (
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5" style={{ color: "var(--color-text-secondary)" }} aria-hidden="true" />
                          <span className="text-xs font-semibold" style={{ color: "var(--color-text-secondary)" }}>{program.duration}</span>
                        </div>
                      )}
                      <div className="ml-auto flex items-center gap-2">
                        <span className="text-xs font-semibold hidden sm:inline" style={{ color: accent }}>Learn more</span>
                        <ArrowRight className="w-4 h-4 transition-all duration-300 group-hover:translate-x-1.5" style={{ color: accent }} aria-hidden="true" />
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            </StaggerItem>
          ))}
        </Stagger>
        </div>
      </div>
    </>
  );
}
