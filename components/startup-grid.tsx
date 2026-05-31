"use client";

import React, { useState, useMemo, useRef, useEffect, useCallback } from "react";
import Image from "next/image";
import type { CmsStartup } from "@/lib/cms/startups";
import { ExternalLink } from "./external-link";
import { Search, SlidersHorizontal, X, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";

const PAGE_SIZE = 24;

const SCHEME_LABELS: Record<string, string> = {
  "nidhi-prayas":           "Nidhi Prayas",
  "nidhi-eir":              "Nidhi EIR",
  "genesis-eir":            "GENESIS EIR",
  "meity-i":                "MeitY Phase I",
  "meity-ii":               "MeitY Phase II",
  sisf:                     "SISF",
  idex:                     "iDEX",
  bionest:                  "BioNEST",
  "startup-bihar":          "Startup Bihar",
  msme:                     "MSME",
  "business-acceleration":  "Business Acceleration",
  "technical-acceleration": "Technical Acceleration",
};

const SCHEME_STYLES: Record<string, React.CSSProperties> = {
  "nidhi-prayas":           { backgroundColor: "#0369a1", color: "white" },
  "nidhi-eir":              { backgroundColor: "#3b82f6", color: "white" },
  "genesis-eir":            { backgroundColor: "#6d28d9", color: "white" },
  "meity-i":                { backgroundColor: "var(--color-brand-800)", color: "white" },
  "meity-ii":               { backgroundColor: "#4d6b1a", color: "white" },
  sisf:                     { backgroundColor: "#ea580c", color: "white" },
  idex:                     { backgroundColor: "var(--color-danger)", color: "white" },
  bionest:                  { backgroundColor: "#059669", color: "white" },
  "startup-bihar":          { backgroundColor: "#92400e", color: "white" },
  msme:                     { backgroundColor: "#1d4ed8", color: "white" },
  "business-acceleration":  { backgroundColor: "#0f766e", color: "white" },
  "technical-acceleration": { backgroundColor: "#7c3aed", color: "white" },
};

const SECTOR_COLORS: Record<string, string> = {
  "AI/ML":     "bg-purple-50 text-purple-800 border-purple-200",
  "MedTech":   "bg-red-50 text-red-800 border-red-200",
  "EV":        "bg-green-50 text-green-800 border-green-200",
  "IoT":       "bg-blue-50 text-blue-800 border-blue-200",
  "EdTech":    "bg-yellow-50 text-yellow-800 border-yellow-200",
  "AgriTech":  "bg-lime-50 text-lime-800 border-lime-200",
  "Robotics":  "bg-orange-50 text-orange-800 border-orange-200",
};

const SCHEME_SECTIONS = [
  {
    section: "Pre-Incubation",
    schemes: ["nidhi-prayas", "nidhi-eir", "genesis-eir"],
  },
  {
    section: "Incubation",
    schemes: ["meity-i", "meity-ii", "sisf", "idex", "bionest", "startup-bihar", "msme"],
  },
  {
    section: "Acceleration",
    schemes: ["business-acceleration", "technical-acceleration"],
  },
];

/** Builds the page number list with smart ellipsis. E.g. [1, "…", 4, 5, 6, "…", 12] */
function buildPageRange(current: number, total: number): (number | "…")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages: (number | "…")[] = [1];
  const left = Math.max(2, current - 1);
  const right = Math.min(total - 1, current + 1);
  if (left > 2) pages.push("…");
  for (let p = left; p <= right; p++) pages.push(p);
  if (right < total - 1) pages.push("…");
  pages.push(total);
  return pages;
}

interface StartupGridProps {
  startups: CmsStartup[];
  filterScheme?: string;
  showFilter?: boolean;
}

export function StartupGrid({ startups, filterScheme, showFilter = false }: StartupGridProps) {
  const [query, setQuery] = useState("");
  const [activeScheme, setActiveScheme] = useState<string>(filterScheme ?? "all");
  const [filterOpen, setFilterOpen] = useState(false);
  const [displayed, setDisplayed] = useState<CmsStartup[]>(startups);
  const [fetching, setFetching] = useState(false);
  const [page, setPage] = useState(1);
  const filterRef = useRef<HTMLDivElement>(null);
  const gridTopRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!filterOpen) return;
    function handleClick(e: MouseEvent) {
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) {
        setFilterOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [filterOpen]);

  // When showFilter is active and a specific scheme is chosen, fetch only that
  // scheme from the backend instead of filtering the full client-side list.
  useEffect(() => {
    if (!showFilter) return;
    if (activeScheme === "all") {
      setDisplayed(startups);
      return;
    }
    let cancelled = false;
    setFetching(true);
    fetch(`/api/startups?scheme=${encodeURIComponent(activeScheme)}`)
      .then((r) => r.json())
      .then((data: CmsStartup[]) => { if (!cancelled) { setDisplayed(data); setFetching(false); } })
      .catch(() => { if (!cancelled) setFetching(false); });
    return () => { cancelled = true; };
  }, [activeScheme, showFilter, startups]);

  const countByScheme = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const s of startups) counts[s.scheme] = (counts[s.scheme] ?? 0) + 1;
    return counts;
  }, [startups]);

  const filtered = useMemo(() => {
    if (!query.trim()) return displayed;
    const q = query.toLowerCase();
    return displayed.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        (s.tagline ?? "").toLowerCase().includes(q) ||
        s.sectors.some((sec) => sec.toLowerCase().includes(q))
    );
  }, [displayed, query]);

  // Reset to page 1 whenever the filtered set changes
  useEffect(() => { setPage(1); }, [activeScheme, query]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const rangeStart = filtered.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const rangeEnd = Math.min(page * PAGE_SIZE, filtered.length);

  const goToPage = useCallback((p: number) => {
    setPage(p);
    gridTopRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  const activeLabel = activeScheme === "all" ? null : (SCHEME_LABELS[activeScheme] ?? activeScheme);

  return (
    <div ref={gridTopRef}>
      {/* Filter bar */}
      <div className="mb-6 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[--color-muted]" aria-hidden="true" />
          <input
            type="search"
            placeholder="Search startups…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm border border-[--color-border] rounded-[--radius-md] bg-[--color-surface] focus:outline-none focus:ring-2 focus:ring-[--color-brand-500]"
            aria-label="Search startups"
          />
        </div>
        {showFilter && (
          <div className="relative" ref={filterRef}>
            <button
              type="button"
              onClick={() => setFilterOpen((o) => !o)}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-[--radius-md] border transition-colors whitespace-nowrap"
              style={activeScheme !== "all"
                ? { backgroundColor: SCHEME_STYLES[activeScheme]?.backgroundColor ?? "var(--color-brand-800)", color: "white", borderColor: "transparent" }
                : { backgroundColor: "var(--color-surface)", borderColor: "var(--color-border)", color: "var(--color-text)" }
              }
              aria-expanded={filterOpen}
              aria-haspopup="listbox"
            >
              <SlidersHorizontal className="w-4 h-4" />
              {activeLabel ? (
                <span className="flex items-center gap-1.5">
                  {activeLabel}
                  <span
                    role="button"
                    tabIndex={0}
                    onClick={(e) => { e.stopPropagation(); setActiveScheme("all"); setFilterOpen(false); }}
                    onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.stopPropagation(); setActiveScheme("all"); setFilterOpen(false); } }}
                    className="opacity-80 hover:opacity-100 cursor-pointer"
                    aria-label="Clear filter"
                  >
                    <X className="w-3 h-3" />
                  </span>
                </span>
              ) : (
                <>Filter by Programme <ChevronDown className="w-3.5 h-3.5 opacity-60" /></>
              )}
            </button>

            {filterOpen && (
              <div
                className="absolute right-0 top-full mt-2 z-50 rounded-2xl shadow-xl overflow-hidden"
                style={{ backgroundColor: "var(--color-surface)", border: "1px solid var(--color-border)", width: "280px" }}
                role="listbox"
                aria-label="Filter by programme"
              >
                <div className="p-2">
                  <button
                    type="button"
                    role="option"
                    aria-selected={activeScheme === "all"}
                    onClick={() => { setActiveScheme("all"); setFilterOpen(false); }}
                    className="w-full flex items-center justify-between px-3 py-2 min-h-[44px] rounded-xl text-sm font-medium transition-colors"
                    style={activeScheme === "all"
                      ? { backgroundColor: "var(--color-brand-800)", color: "white" }
                      : { color: "var(--color-text)" }
                    }
                  >
                    <span>All Programmes</span>
                    <span className="text-xs font-bold opacity-80">{startups.length}</span>
                  </button>
                </div>

                {SCHEME_SECTIONS.map(({ section, schemes }) => (
                  <div key={section} className="px-2 pb-2">
                    <p className="px-3 pt-2 pb-1 text-[10px] font-black uppercase tracking-widest" style={{ color: "var(--color-text-subtle)" }}>
                      {section}
                    </p>
                    {schemes.map((key) => {
                      const count = countByScheme[key] ?? 0;
                      const isActive = activeScheme === key;
                      return (
                        <button
                          key={key}
                          type="button"
                          role="option"
                          aria-selected={isActive}
                          onClick={() => { setActiveScheme(key); setFilterOpen(false); }}
                          className="w-full flex items-center justify-between px-3 py-2 min-h-[44px] rounded-xl text-sm transition-colors"
                          style={isActive
                            ? { backgroundColor: SCHEME_STYLES[key]?.backgroundColor ?? "var(--color-brand-800)", color: "white" }
                            : { color: count === 0 ? "var(--color-text-subtle)" : "var(--color-text)" }
                          }
                        >
                          <span className="font-medium">{SCHEME_LABELS[key] ?? key}</span>
                          <span className="text-xs font-bold opacity-70">{count}</span>
                        </button>
                      );
                    })}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <p className="text-sm text-[--color-muted] mb-4" aria-live="polite">
        {fetching ? "Loading…" : filtered.length === 0 ? "No startups match your search." : `Showing ${rangeStart}–${rangeEnd} of ${filtered.length} startup${filtered.length !== 1 ? "s" : ""}`}
      </p>

      {fetching ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-40 rounded-[--radius-lg] border border-[--color-border] bg-[--color-surface-alt] animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <p className="text-center py-12 text-[--color-muted]">No startups match your search.</p>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {paginated.map((startup) => (
            <StartupCard key={startup.id} startup={startup} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-10 flex items-center justify-center gap-1.5" role="navigation" aria-label="Pagination">
          <button
            type="button"
            onClick={() => goToPage(page - 1)}
            disabled={page === 1}
            className="flex items-center gap-1 px-3 py-2 text-sm font-medium rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            style={{ color: "var(--color-text)", backgroundColor: "var(--color-surface-alt)" }}
            aria-label="Previous page"
          >
            <ChevronLeft className="w-4 h-4" />
            Prev
          </button>

          {buildPageRange(page, totalPages).map((item, i) =>
            item === "…" ? (
              <span key={`ellipsis-${i}`} className="px-2 text-sm" style={{ color: "var(--color-text-subtle)" }}>…</span>
            ) : (
              <button
                key={item}
                type="button"
                onClick={() => goToPage(item as number)}
                aria-current={item === page ? "page" : undefined}
                className="w-9 h-9 text-sm font-semibold rounded-lg transition-colors"
                style={item === page
                  ? { backgroundColor: "var(--color-brand-800)", color: "white" }
                  : { color: "var(--color-text)", backgroundColor: "var(--color-surface-alt)" }
                }
              >
                {item}
              </button>
            )
          )}

          <button
            type="button"
            onClick={() => goToPage(page + 1)}
            disabled={page === totalPages}
            className="flex items-center gap-1 px-3 py-2 text-sm font-medium rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            style={{ color: "var(--color-text)", backgroundColor: "var(--color-surface-alt)" }}
            aria-label="Next page"
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}

function StartupCard({ startup }: { startup: CmsStartup }) {
  return (
    <article className="flex flex-col rounded-[--radius-lg] border border-[--color-border] bg-[--color-surface] hover:shadow-md hover:border-[--color-brand-300] transition-all p-5">
      <div className="flex items-start gap-3 mb-3">
        <div className="relative w-10 h-10 rounded-[--radius-md] overflow-hidden bg-white border border-[--color-border] shrink-0">
          <Image src={startup.logoUrl || "/logo.png"} alt={`${startup.name} logo`} fill className="object-contain p-0.5" sizes="40px" />
        </div>
        <div className="min-w-0">
          <h3 className="font-semibold text-[--color-text] text-sm leading-snug line-clamp-2">
            {startup.name}
          </h3>
          <span
            className="inline-block text-xs font-medium px-1.5 py-0.5 rounded mt-1"
            style={SCHEME_STYLES[startup.scheme] ?? { backgroundColor: "var(--color-brand-800)", color: "white" }}
          >
            {SCHEME_LABELS[startup.scheme] ?? startup.scheme}
          </span>
        </div>
      </div>

      <p className="text-xs text-[--color-text-subtle] leading-relaxed flex-1 mb-3 line-clamp-3">
        {startup.tagline}
      </p>

      <div className="flex flex-wrap gap-1">
        {startup.sectors.slice(0, 3).map((s) => (
          <span
            key={s}
            className={`text-xs px-1.5 py-0.5 rounded border ${SECTOR_COLORS[s] ?? "bg-[--color-surface-alt] text-[--color-text-subtle] border-[--color-border]"}`}
          >
            {s}
          </span>
        ))}
      </div>

      {startup.website && (
        <div className="mt-3 pt-3 border-t border-[--color-border]">
          <ExternalLink
            href={startup.website}
            className="text-xs text-[--color-primary] hover:underline"
          >
            Visit website
          </ExternalLink>
        </div>
      )}
    </article>
  );
}
