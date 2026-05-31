"use client";

import { useSearchParams } from "next/navigation";
import { StartupForm } from "@/components/admin/startup-form";
import { saveStartupAction } from "../actions";
import { Briefcase } from "lucide-react";
import Link from "next/link";
import type { StartupScheme } from "@/lib/cms/startups";

const SCHEME_LABELS: Record<string, string> = {
  meity: "MeitY Scheme",
  sisf: "SISF",
  "nidhi-prayas": "Nidhi Prayas",
  "nidhi-eir": "Nidhi EIR",
  genesis: "GENESIS",
};

const SCHEME_COLORS: Record<string, string> = {
  meity: "var(--color-brand-800)",
  sisf: "#ea580c",
  "nidhi-prayas": "#1d4ed8",
  "nidhi-eir": "#3b82f6",
  genesis: "#2a3a0d",
};

export default function NewStartupPage() {
  const params = useSearchParams();
  const scheme = (params.get("scheme") ?? "meity") as StartupScheme;

  return (
    <main className="p-8 max-w-3xl">
      <div className="flex items-center gap-3 mb-2">
        <Link href="/admin/content/startups" className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
          ← Portfolio
        </Link>
        <span style={{ color: "var(--color-input-border)" }}>/</span>
        <Briefcase className="w-5 h-5" style={{ color: "var(--color-brand-800)" }} />
        <h1 className="text-xl font-black" style={{ color: "var(--color-brand-950)" }}>New Startup</h1>
        {scheme && SCHEME_LABELS[scheme] && (
          <span
            className="text-[11px] font-bold px-2.5 py-1 rounded-full ml-1"
            style={{ backgroundColor: SCHEME_COLORS[scheme] ?? "var(--color-brand-800)", color: "white" }}
          >
            {SCHEME_LABELS[scheme]}
          </span>
        )}
      </div>
      <p className="text-xs mb-8" style={{ color: "var(--color-placeholder)" }}>
        Fill in the details and click Create to add this startup to the portfolio.
      </p>
      <StartupForm
        id={null}
        initial={{
          name: "",
          scheme,
          tagline: "",
          sectors: [],
          founders: [],
          website: "",
          logoUrl: "",
          published: true,
          sortOrder: 0,
        }}
        onSave={saveStartupAction}
      />
    </main>
  );
}
