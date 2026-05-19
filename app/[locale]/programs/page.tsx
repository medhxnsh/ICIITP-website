import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { getAllPrograms } from "@/lib/content";
import { getAllWpPrograms } from "@/lib/cms/wp-programs";
import { getAllCmsPrograms } from "@/lib/cms/programs";
import { STATIC_PROGRAM_SLUGS } from "@/lib/static-slugs";
import { ProgramCard } from "@/components/program-card";
import { Breadcrumb } from "@/components/breadcrumb";
import { Link } from "@/i18n/navigation";
import { ArrowRight } from "lucide-react";
import { autoDateBadge, programStatusBadge, badgeStyle } from "@/lib/badge-utils";

interface Props { params: Promise<{ locale: string }> }

export const revalidate = 60; // ISR: re-fetch at most once per minute

export const metadata: Metadata = {
  title: "Incubation Programs",
  description:
    "Incubation schemes at IC IITP: Flagship Incubation, Nidhi Prayas, Nidhi-EIR, SISF, BioNEST, and GENESIS — supporting deep-tech startups from idea to market.",
};

const STATIC_SLUGS = new Set<string>(STATIC_PROGRAM_SLUGS);

export default async function ProgramsPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const programs = getAllPrograms(locale);

  // Pull in any published CMS-only programmes (admin-created entries without a
  // static JSON backing). They render alongside the canonical programmes with a
  // simpler card that defaults to the ICIITP logo when none is uploaded.
  const cmsOnlyPublished = await getAllWpPrograms()
    .then((all) => all.filter((p) => !STATIC_SLUGS.has(p.slug)))
    .catch(() =>
      getAllCmsPrograms()
        .then((all) => all.filter((p) => p.published && !STATIC_SLUGS.has(p.slug)))
        .catch(() => [])
    );

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Programs" }]} />

      <header className="mb-10">
        <h1 className="text-4xl font-black text-[--color-brand-800] mb-4">
          Incubation Programs
        </h1>
        <p className="text-lg text-[--color-text-subtle] max-w-2xl leading-relaxed">
          IC IITP runs complementary schemes covering the full innovation journey — from
          prototyping grants to seed investment to entrepreneurship fellowships.
        </p>
      </header>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {programs.map((program) => (
          <ProgramCard key={program.slug} program={program} />
        ))}

        {cmsOnlyPublished.map((prog) => (
          <article
            key={prog.slug}
            className="group flex flex-col rounded-[--radius-xl] border border-[--color-border] bg-[--color-surface] shadow-[--shadow-card] hover:shadow-md hover:border-[--color-brand-300] transition-all overflow-hidden"
          >
            <div className="p-6 flex-1">
              <div className="mb-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={prog.logoUrl ?? "/logo.png"}
                  alt=""
                  aria-hidden="true"
                  className="h-11 w-auto object-contain"
                />
              </div>
              <h3 className="text-lg font-bold text-[--color-text] mb-1">{prog.title ?? prog.slug}</h3>
              {prog.tagline && (
                <p className="text-sm text-[--color-text-subtle] mb-3 line-clamp-2">{prog.tagline}</p>
              )}
              <div className="flex flex-wrap gap-1.5 mt-2">
                {prog.status && (() => {
                  const b = programStatusBadge(prog.status);
                  return (
                    <span className="text-xs font-medium px-2 py-0.5 rounded-full" style={badgeStyle(b.variant)}>
                      {b.label}
                    </span>
                  );
                })()}
                {(() => {
                  const b = autoDateBadge({ deadline: prog.applicationDeadline, labelClosed: "Applications Closed" });
                  return b ? (
                    <span className="text-xs font-medium px-2 py-0.5 rounded-full" style={badgeStyle(b.variant)}>
                      {b.label}
                    </span>
                  ) : null;
                })()}
                {prog.customBadge && (
                  <span className="text-xs font-medium px-2 py-0.5 rounded-full" style={badgeStyle("orange")}>
                    {prog.customBadge}
                  </span>
                )}
              </div>
            </div>
            <div className="px-6 pb-5">
              <Link
                href={`/programs/${prog.slug}`}
                className="inline-flex items-center gap-1 text-sm font-semibold text-[--color-primary] group-hover:gap-2 transition-all"
              >
                Learn more <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
