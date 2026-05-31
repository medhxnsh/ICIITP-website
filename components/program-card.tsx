import React from "react";
import { Link } from "@/i18n/navigation";
import type { CmsProgramDoc } from "@/lib/cms/programs";
import { ArrowRight } from "lucide-react";
import { ProgramLogo } from "@/components/program-logo";

const BADGE_STYLES: Record<string, React.CSSProperties> = {
  "Flagship": { backgroundColor: "var(--color-brand-800)", color: "white" },
  "DST": { backgroundColor: "#1d4ed8", color: "white" },
  "DST NSTEDB": { backgroundColor: "#2563eb", color: "white" },
  "DPIIT": { backgroundColor: "#ea580c", color: "white" },
  "BIRAC / DBT": { backgroundColor: "#7e22ce", color: "white" },
  "MeitY": { backgroundColor: "#2a3a0d", color: "white" },
};

interface ProgramCardProps {
  program: CmsProgramDoc;
}

export function ProgramCard({ program }: ProgramCardProps) {
  const badgeStyle = BADGE_STYLES[program.badge ?? ""] ?? { backgroundColor: "var(--color-brand-600)", color: "white" };

  return (
    <article className="group flex flex-col rounded-[--radius-xl] border border-[--color-border] bg-[--color-surface] shadow-[--shadow-card] hover:shadow-md hover:border-[--color-brand-300] transition-all overflow-hidden">
      <div className="p-6 flex-1">
        {/* Logo */}
        <div className="mb-3">
          <ProgramLogo slug={program.slug} logoUrl={program.logoUrl} size={44} />
        </div>

        <div className="flex items-start justify-between gap-3 mb-3">
          <span className="inline-block text-xs font-semibold px-2.5 py-1 rounded-full" style={badgeStyle}>
            {program.badge}
          </span>
          {program.status && (
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
              program.status === "Open"
                ? "bg-green-100 text-green-800"
                : "bg-gray-100 text-gray-600"
            }`}>
              {program.status}
            </span>
          )}
        </div>

        <h3 className="text-lg font-bold text-[--color-text] mb-2 leading-snug">
          {program.title}
        </h3>
        <p className="text-sm text-[--color-text-subtle] leading-relaxed mb-4">
          {program.tagline}
        </p>

        <dl className="space-y-1.5 text-sm">
          {program.grant && (
            <div className="flex gap-2">
              <dt className="font-medium text-[--color-text] shrink-0">Grant:</dt>
              <dd className="text-[--color-text-subtle]">{program.grant}</dd>
            </div>
          )}
          {program.stipend && (
            <div className="flex gap-2">
              <dt className="font-medium text-[--color-text] shrink-0">Stipend:</dt>
              <dd className="text-[--color-text-subtle]">{program.stipend}</dd>
            </div>
          )}
          {program.schemeOutlay && (
            <div className="flex gap-2">
              <dt className="font-medium text-[--color-text] shrink-0">Scheme:</dt>
              <dd className="text-[--color-text-subtle]">{program.schemeOutlay}</dd>
            </div>
          )}
          {program.duration && (
            <div className="flex gap-2">
              <dt className="font-medium text-[--color-text] shrink-0">Duration:</dt>
              <dd className="text-[--color-text-subtle]">{program.duration}</dd>
            </div>
          )}
        </dl>

        {(program.sectors ?? program.domains ?? program.focusAreas) && (
          <div className="mt-4 flex flex-wrap gap-1.5">
            {(program.sectors ?? program.domains ?? program.focusAreas)!.slice(0, 4).map((s) => (
              <span
                key={s}
                className="text-xs px-2 py-0.5 rounded-full bg-[--color-brand-50] text-[--color-brand-800] border border-[--color-brand-200]"
              >
                {s}
              </span>
            ))}
            {(program.sectors ?? program.domains ?? program.focusAreas)!.length > 4 && (
              <span className="text-xs px-2 py-0.5 text-[--color-muted]">
                +{(program.sectors ?? program.domains ?? program.focusAreas)!.length - 4} more
              </span>
            )}
          </div>
        )}
      </div>

      <div className="px-6 pb-5">
        <Link
          href={`/programs/${program.slug}`}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-[--color-primary] group-hover:gap-2.5 transition-all"
        >
          Learn more
          <ArrowRight className="w-4 h-4" aria-hidden="true" />
        </Link>
      </div>
    </article>
  );
}
