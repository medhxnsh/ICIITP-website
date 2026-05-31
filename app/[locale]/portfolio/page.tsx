import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { getPublishedStartups } from "@/lib/cms/startups";
import { StartupGrid } from "@/components/startup-grid";
import { Breadcrumb } from "@/components/breadcrumb";
import { Briefcase } from "lucide-react";
import { Reveal } from "@/components/reveal";

interface Props { params: Promise<{ locale: string }> }

export const metadata: Metadata = {
  title: "Startup Portfolio",
  description: "100+ startups incubated at IC IITP across MeitY, SISF, Nidhi Prayas, Nidhi EIR, and GENESIS schemes.",
};

export const revalidate = 60;

export default async function PortfolioPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const startups = await getPublishedStartups().catch(() => []);

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--color-surface)" }}>
      {/* Hero */}
      <div className="relative overflow-hidden" style={{ background: "linear-gradient(160deg, var(--color-hero-from) 0%, var(--color-hero-via) 60%, var(--color-hero-to) 100%)" }}>
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true"
          style={{ backgroundImage: "radial-gradient(circle, #ffffff07 1px, transparent 1px)", backgroundSize: "24px 24px" }} />
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full pointer-events-none" aria-hidden="true"
          style={{ background: "radial-gradient(circle, #f7942020 0%, transparent 65%)" }} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-20 relative z-10">
          <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Portfolio" }]} variant="light" />
          <Reveal>
            <p className="text-xs font-semibold uppercase tracking-widest mb-4 text-orange-200">
              <Briefcase className="w-3.5 h-3.5 inline mr-1.5 -mt-0.5" aria-hidden="true" />
              IC IITP Incubatees
            </p>
            <h1 className="text-2xl sm:text-4xl lg:text-6xl font-black text-white leading-tight mb-4">Startup Portfolio</h1>
            <p className="text-white/80 text-lg max-w-lg">
              {startups.length}+ startups incubated across 12 programmes — from ESDM and MedTech to AI, EV, and deep tech.
            </p>
          </Reveal>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <StartupGrid startups={startups} showFilter />
      </div>
    </div>
  );
}
