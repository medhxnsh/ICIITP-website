import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { Breadcrumb } from "@/components/breadcrumb";
import { IncubationForm } from "@/components/forms/incubation-form";
import { LabAccessForm } from "@/components/forms/lab-access-form";
import { InternshipForm } from "@/components/forms/internship-form";
import { getPublishedPrograms } from "@/lib/cms/programs";
import { ClipboardList } from "lucide-react";

interface Props { params: Promise<{ locale: string; }>; searchParams: Promise<{ form?: string }> }

export const metadata: Metadata = {
  title: "Apply — IC IITP",
  description: "Apply for incubation, request lab access, or submit an internship application at IC IITP.",
};

const TABS = [
  { id: "incubation", label: "Incubation application" },
  { id: "lab-access", label: "Lab access request" },
  { id: "internship", label: "Internship application" },
] as const;

type TabId = (typeof TABS)[number]["id"];

export default async function ApplyPage({ params, searchParams }: Props) {
  const { locale } = await params;
  const { form } = await searchParams;
  setRequestLocale(locale);

  const active: TabId = (TABS.find((t) => t.id === form)?.id) ?? "incubation";

  // Fetch live programmes for the scheme dropdown — silently fall back to [] on error
  const livePrograms = await getPublishedPrograms().catch(() => []);
  const schemes = livePrograms.map((p) => ({
    value: p.slug,
    label: p.title ?? p.slug,
  }));

  return (
    <div style={{ backgroundColor: "var(--color-surface)" }}>
      {/* Hero banner — matches Portfolio/Events style */}
      <div className="relative overflow-hidden" style={{ background: "linear-gradient(160deg, var(--color-hero-from) 0%, var(--color-hero-via) 60%, var(--color-hero-to) 100%)" }}>
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true"
          style={{ backgroundImage: "radial-gradient(circle, #ffffff07 1px, transparent 1px)", backgroundSize: "24px 24px" }} />
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full pointer-events-none" aria-hidden="true"
          style={{ background: "radial-gradient(circle, #f7942020 0%, transparent 65%)" }} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-20 relative z-10">
          <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Apply" }]} variant="light" />
          <p className="text-xs font-semibold uppercase tracking-widest mb-4 text-orange-200">
            <ClipboardList className="w-3.5 h-3.5 inline mr-1.5 -mt-0.5" aria-hidden="true" />
            IC IITP Applications
          </p>
          <h1 className="text-2xl sm:text-4xl lg:text-6xl font-black text-white leading-tight mb-4">Apply</h1>
          <p className="text-white/80 text-lg max-w-lg">
            Apply for incubation, request lab access, or submit an internship application at IC IITP.
          </p>
        </div>
      </div>

      {/* Form section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Tab bar */}
        <nav className="flex gap-1 mb-8 rounded-xl p-1 w-fit" style={{ backgroundColor: "var(--color-surface-tint)" }} aria-label="Application forms">
          {TABS.map((tab) => {
            const isActive = tab.id === active;
            return (
              <a
                key={tab.id}
                href={`?form=${tab.id}`}
                className="text-xs font-semibold py-2 px-4 rounded-lg transition-colors whitespace-nowrap"
                style={isActive
                  ? { backgroundColor: "var(--color-brand-800)", color: "white" }
                  : { color: "var(--color-brand-600)" }
                }
                aria-current={isActive ? "page" : undefined}
              >
                {tab.label}
              </a>
            );
          })}
        </nav>

        {active === "incubation" && <IncubationForm locale={locale} schemes={schemes} />}
        {active === "lab-access" && <LabAccessForm locale={locale} />}
        {active === "internship" && <InternshipForm locale={locale} />}
      </div>
    </div>
  );
}
