"use client";

import { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { BookOpen } from "lucide-react";
import Link from "next/link";
import { saveProgramAction } from "../actions";
import type { ProgramSection } from "@/lib/cms/programs";

const SECTION_LABELS: Record<ProgramSection, string> = {
  PRE_INCUBATION: "Pre-Incubation",
  INCUBATION: "Incubation",
  ACCELERATION: "Acceleration",
};

const SECTION_COLORS: Record<ProgramSection, string> = {
  PRE_INCUBATION: "#d97706",
  INCUBATION: "var(--color-brand-800)",
  ACCELERATION: "var(--color-brand-950)",
};

function isValidSection(s: string | null): s is ProgramSection {
  return s === "PRE_INCUBATION" || s === "INCUBATION" || s === "ACCELERATION";
}

export default function NewProgramPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawSection = searchParams.get("section");
  const section: ProgramSection | null = isValidSection(rawSection) ? rawSection : null;

  const [slug, setSlug] = useState("");
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  function handleSlugInput(value: string) {
    setSlug(value.toLowerCase().replace(/[^a-z0-9-]/g, "-").replace(/-+/g, "-"));
  }

  function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    const s = slug.trim().replace(/^-+|-+$/g, "");
    if (!s) { setError("Slug is required."); return; }
    if (!/^[a-z0-9-]+$/.test(s)) { setError("Slug can only contain lowercase letters, numbers, and hyphens."); return; }
    setError("");
    startTransition(async () => {
      await saveProgramAction(s, {
        published: false,
        section: section ?? undefined,
        images: [], imageLayout: "banner",
        title: "", tagline: "", about: "",
        status: "", statusNote: "",
        badge: "", badgeOther: "", funder: "",
        applyUrl: "", applicationFormUrl: "", equipmentFormUrl: "", contactEmail: "",
        grant: "", schemeOutlay: "", stipend: "", duration: "",
        visibleSections: [],
        eligibility: [], notEligible: [], objectives: [],
        targetAudience: [], expectedOutcomes: [],
        support: [], preferences: [], notes: [], disclaimer: [],
      });
      router.push(`/admin/content/programs/${s}`);
    });
  }

  return (
    <main className="p-8 max-w-xl">
      <div className="flex items-center gap-3 mb-8">
        <Link href="/admin/content/programs" className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
          ← Programs
        </Link>
        <span style={{ color: "var(--color-input-border)" }}>/</span>
        <BookOpen className="w-5 h-5" style={{ color: "var(--color-brand-800)" }} />
        <h1 className="text-xl font-black" style={{ color: "var(--color-brand-950)" }}>New Program</h1>
      </div>

      {section && (
        <div className="mb-6 inline-flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-full"
          style={{ backgroundColor: SECTION_COLORS[section] + "14", color: SECTION_COLORS[section], border: `1px solid ${SECTION_COLORS[section]}30` }}>
          Creating in: {SECTION_LABELS[section]}
        </div>
      )}

      <p className="text-sm mb-6" style={{ color: "var(--color-text-secondary)" }}>
        Choose a URL slug for the new programme. This becomes the public URL:{" "}
        <span className="font-mono" style={{ color: "var(--color-brand-800)" }}>/programs/{slug || "your-slug"}</span>
      </p>

      <form onSubmit={handleCreate} className="space-y-4">
        <div>
          <label className="text-xs font-semibold uppercase tracking-wide block mb-1.5" style={{ color: "var(--color-brand-600)" }}>
            Programme slug <span style={{ color: "var(--color-danger)" }}>*</span>
          </label>
          <input
            type="text"
            value={slug}
            onChange={(e) => handleSlugInput(e.target.value)}
            placeholder="e.g. new-scheme-2025"
            className="w-full text-sm rounded-lg px-3 py-2.5 outline-none border focus:ring-2 focus:ring-[--color-brand-500]"
            style={{ borderColor: "var(--color-input-border)", backgroundColor: "#fafff6" }}
            autoFocus
            required
          />
          <p className="text-xs mt-1.5" style={{ color: "var(--color-placeholder)" }}>
            Use lowercase letters, numbers, and hyphens only. Cannot be changed later.
          </p>
        </div>

        {error && (
          <p className="text-xs px-3 py-2 rounded-lg" style={{ backgroundColor: "var(--color-danger-bg)", color: "var(--color-danger)" }}>{error}</p>
        )}

        <button
          type="submit"
          disabled={pending || !slug.trim()}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold text-white disabled:opacity-50"
          style={{ backgroundColor: "var(--color-brand-800)" }}
        >
          {pending ? "Creating…" : "Create & Edit Programme"}
        </button>
      </form>
    </main>
  );
}
