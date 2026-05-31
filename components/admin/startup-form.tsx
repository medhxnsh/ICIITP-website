"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { X, Plus, Trash2, ExternalLink, Upload } from "lucide-react";
import { useToast } from "@/components/admin/toast-provider";
import type { CmsStartup, StartupScheme } from "@/lib/cms/startups";

const SCHEME_OPTIONS: { value: StartupScheme; label: string; color: string; group: string }[] = [
  // Pre-Incubation
  { value: "nidhi-prayas",           label: "Nidhi Prayas",            color: "#0369a1", group: "Pre-Incubation" },
  { value: "nidhi-eir",              label: "Nidhi EIR",               color: "#3b82f6", group: "Pre-Incubation" },
  { value: "genesis-eir",            label: "GENESIS EIR",             color: "#6d28d9", group: "Pre-Incubation" },
  // Incubation
  { value: "meity-i",                label: "MeitY Phase I",           color: "var(--color-brand-800)", group: "Incubation" },
  { value: "meity-ii",               label: "MeitY Phase II",          color: "#4d6b1a", group: "Incubation" },
  { value: "sisf",                   label: "SISF",                    color: "#ea580c", group: "Incubation" },
  { value: "idex",                   label: "iDEX",                    color: "var(--color-danger)", group: "Incubation" },
  { value: "bionest",                label: "BioNEST",                 color: "#059669", group: "Incubation" },
  { value: "startup-bihar",          label: "Startup Bihar",           color: "#92400e", group: "Incubation" },
  { value: "msme",                   label: "MSME",                    color: "#1d4ed8", group: "Incubation" },
  // Acceleration
  { value: "business-acceleration",  label: "Business Acceleration",   color: "#0f766e", group: "Acceleration" },
  { value: "technical-acceleration", label: "Technical Acceleration",  color: "#7c3aed", group: "Acceleration" },
];

interface StartupFormValues {
  name: string;
  scheme: StartupScheme | string;
  tagline: string;
  sectors: string[];
  founders: string[];
  website: string;
  logoUrl: string;
  published: boolean;
  sortOrder: number;
}

interface Props {
  id: string | null;
  initial: StartupFormValues;
  onSave: (id: string | null, data: Omit<CmsStartup, "id" | "createdAt" | "updatedAt">) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
}

export function StartupForm({ id, initial, onSave, onDelete }: Props) {
  const router = useRouter();
  const toast = useToast();
  const [values, setValues] = useState<StartupFormValues>(initial);
  const [sectorInput, setSectorInput] = useState("");
  const [founderInput, setFounderInput] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [logoUploading, setLogoUploading] = useState(false);

  async function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setLogoUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("path", `startups/logos/${Date.now()}-${file.name}`);
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      const { url } = await res.json();
      if (url) set("logoUrl", url);
    } finally {
      setLogoUploading(false);
      e.target.value = "";
    }
  }

  function set<K extends keyof StartupFormValues>(key: K, val: StartupFormValues[K]) {
    setValues((v) => ({ ...v, [key]: val }));
  }

  function addSector() {
    const t = sectorInput.trim();
    if (t && !values.sectors.includes(t)) set("sectors", [...values.sectors, t]);
    setSectorInput("");
  }

  function addFounder() {
    const t = founderInput.trim();
    if (t && !values.founders.includes(t)) set("founders", [...values.founders, t]);
    setFounderInput("");
  }

  async function handleSave() {
    if (!values.name.trim() || !values.scheme) {
      setError("Name and scheme are required.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await onSave(id, {
        name: values.name.trim(),
        scheme: values.scheme,
        tagline: values.tagline.trim(),
        sectors: values.sectors,
        founders: values.founders,
        website: values.website.trim() || undefined,
        logoUrl: values.logoUrl.trim() || undefined,
        published: values.published,
        sortOrder: values.sortOrder,
      });
      toast.success("Startup saved", values.published ? "Live in the portfolio." : "Saved as draft.");
      router.push("/admin/content/startups");
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Save failed";
      setError(msg);
      toast.error("Save failed", msg);
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!id || !onDelete) return;
    if (!confirm("Delete this startup? This cannot be undone.")) return;
    setDeleting(true);
    try {
      await onDelete(id);
      toast.warning("Startup deleted", "The entry has been permanently removed.");
      router.push("/admin/content/startups");
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Delete failed";
      setError(msg);
      toast.error("Delete failed", msg);
      setDeleting(false);
    }
  }

  const schemeObj = SCHEME_OPTIONS.find((s) => s.value === values.scheme);

  return (
    <div className="space-y-8">
      {error && (
        <div className="text-sm px-4 py-3 rounded-xl" style={{ backgroundColor: "var(--color-danger-bg)", color: "#dc2626", border: "1px solid #fecaca" }}>
          {error}
        </div>
      )}

      {/* ── Core fields ── */}
      <section className="rounded-2xl p-6 space-y-5" style={{ backgroundColor: "var(--color-surface-card)", border: "1px solid var(--color-border-subtle)" }}>
        <h2 className="text-xs font-black uppercase tracking-widest" style={{ color: "var(--color-text-secondary)" }}>Details</h2>

        <div>
          <label className="block text-xs font-semibold mb-1.5" style={{ color: "var(--color-brand-800)" }}>Startup name *</label>
          <input
            type="text"
            value={values.name}
            onChange={(e) => set("name", e.target.value)}
            placeholder="e.g. Bionic Hope (Robo Bionics)"
            className="w-full px-3 py-2 text-sm rounded-xl border focus:outline-none focus:ring-2 focus:ring-[--color-brand-500]"
            style={{ border: "1px solid var(--color-input-border)" }}
          />
        </div>

        <div>
          <label className="block text-xs font-semibold mb-1.5" style={{ color: "var(--color-brand-800)" }}>Tagline</label>
          <input
            type="text"
            value={values.tagline}
            onChange={(e) => set("tagline", e.target.value)}
            placeholder="One-liner describing what they do"
            className="w-full px-3 py-2 text-sm rounded-xl border focus:outline-none focus:ring-2 focus:ring-[--color-brand-500]"
            style={{ border: "1px solid var(--color-input-border)" }}
          />
        </div>

        <div>
          <label className="block text-xs font-semibold mb-2" style={{ color: "var(--color-brand-800)" }}>Programme *</label>
          {/* If the current scheme is a CMS-created programme not in the hardcoded list, show it as a locked badge */}
          {values.scheme && !SCHEME_OPTIONS.find((s) => s.value === values.scheme) ? (
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl mb-3" style={{ backgroundColor: "var(--color-surface-tint)", border: "1px solid var(--color-input-border)" }}>
              <span className="text-[11px] font-bold px-2.5 py-1 rounded-full text-white" style={{ backgroundColor: "var(--color-brand-800)" }}>
                {values.scheme}
              </span>
              <span className="text-xs" style={{ color: "var(--color-text-secondary)" }}>Programme from CMS — assigned via URL parameter</span>
            </div>
          ) : null}
          {(["Pre-Incubation", "Incubation", "Acceleration"] as const).map((group) => (
            <div key={group} className="mb-3">
              <p className="text-[10px] font-bold uppercase tracking-widest mb-1.5" style={{ color: "var(--color-placeholder)" }}>{group}</p>
              <div className="flex flex-wrap gap-2">
                {SCHEME_OPTIONS.filter((s) => s.group === group).map((s) => (
                  <button
                    key={s.value}
                    type="button"
                    onClick={() => set("scheme", s.value)}
                    className="px-3 py-1.5 text-xs font-semibold rounded-full border-2 transition-all"
                    style={
                      values.scheme === s.value
                        ? { backgroundColor: s.color, color: "white", borderColor: s.color }
                        : { backgroundColor: "white", color: "#64748b", borderColor: "#e2e8f0" }
                    }
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Sectors ── */}
      <section className="rounded-2xl p-6 space-y-4" style={{ backgroundColor: "var(--color-surface-card)", border: "1px solid var(--color-border-subtle)" }}>
        <h2 className="text-xs font-black uppercase tracking-widest" style={{ color: "var(--color-text-secondary)" }}>Sector Badges</h2>
        <div className="flex gap-2">
          <input
            type="text"
            value={sectorInput}
            onChange={(e) => setSectorInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addSector())}
            placeholder="e.g. AI/ML, MedTech, Robotics…"
            className="flex-1 px-3 py-2 text-sm rounded-xl border focus:outline-none focus:ring-2 focus:ring-[--color-brand-500]"
            style={{ border: "1px solid var(--color-input-border)" }}
          />
          <button
            type="button"
            onClick={addSector}
            className="px-3 py-2 rounded-xl text-white text-sm"
            style={{ backgroundColor: "var(--color-brand-800)" }}
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {values.sectors.map((s) => (
            <span
              key={s}
              className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border"
              style={{ backgroundColor: "var(--color-surface-tint)", color: "var(--color-brand-800)", borderColor: "var(--color-input-border)" }}
            >
              {s}
              <button
                type="button"
                onClick={() => set("sectors", values.sectors.filter((x) => x !== s))}
                className="opacity-60 hover:opacity-100"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
          {values.sectors.length === 0 && (
            <p className="text-xs" style={{ color: "var(--color-placeholder)" }}>No sectors added yet.</p>
          )}
        </div>
      </section>

      {/* ── Founders ── */}
      <section className="rounded-2xl p-6 space-y-4" style={{ backgroundColor: "var(--color-surface-card)", border: "1px solid var(--color-border-subtle)" }}>
        <h2 className="text-xs font-black uppercase tracking-widest" style={{ color: "var(--color-text-secondary)" }}>Founders (optional)</h2>
        <div className="flex gap-2">
          <input
            type="text"
            value={founderInput}
            onChange={(e) => setFounderInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addFounder())}
            placeholder="Full name"
            className="flex-1 px-3 py-2 text-sm rounded-xl border focus:outline-none focus:ring-2 focus:ring-[--color-brand-500]"
            style={{ border: "1px solid var(--color-input-border)" }}
          />
          <button
            type="button"
            onClick={addFounder}
            className="px-3 py-2 rounded-xl text-white text-sm"
            style={{ backgroundColor: "var(--color-brand-800)" }}
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {values.founders.map((f) => (
            <span
              key={f}
              className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border"
              style={{ backgroundColor: "white", color: "#475569", borderColor: "#e2e8f0" }}
            >
              {f}
              <button
                type="button"
                onClick={() => set("founders", values.founders.filter((x) => x !== f))}
                className="opacity-60 hover:opacity-100"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
          {values.founders.length === 0 && (
            <p className="text-xs" style={{ color: "var(--color-placeholder)" }}>No founders listed.</p>
          )}
        </div>
      </section>

      {/* ── Media & links ── */}
      <section className="rounded-2xl p-6 space-y-5" style={{ backgroundColor: "var(--color-surface-card)", border: "1px solid var(--color-border-subtle)" }}>
        <h2 className="text-xs font-black uppercase tracking-widest" style={{ color: "var(--color-text-secondary)" }}>Media & Links</h2>

        <div>
          <label className="block text-xs font-semibold mb-2" style={{ color: "var(--color-brand-800)" }}>Logo</label>
          <div className="flex items-center gap-3 flex-wrap">
            <div className="relative shrink-0 w-16 h-16 rounded-xl overflow-hidden border bg-white" style={{ borderColor: "var(--color-border-subtle)" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={values.logoUrl || "/logo.png"} alt="Logo preview" className="w-full h-full object-contain p-1.5" />
              {values.logoUrl && (
                <button
                  type="button"
                  onClick={() => set("logoUrl", "")}
                  className="absolute top-0.5 right-0.5 w-5 h-5 rounded-full bg-red-600 text-white text-xs font-bold flex items-center justify-center shadow"
                  title="Remove logo"
                >
                  ×
                </button>
              )}
            </div>
            <div className="flex flex-col gap-2 flex-1 min-w-48">
              <label className="flex items-center gap-2 cursor-pointer self-start text-xs font-semibold px-3 py-1.5 rounded-lg"
                style={{ backgroundColor: "var(--color-surface-tint)", color: "var(--color-brand-800)" }}>
                <Upload className="w-3.5 h-3.5" />
                {logoUploading ? "Uploading…" : values.logoUrl ? "Replace logo" : "Upload logo"}
                <input type="file" accept="image/*" className="sr-only" disabled={logoUploading} onChange={handleLogoUpload} />
              </label>
              <input
                type="text"
                value={values.logoUrl}
                onChange={(e) => set("logoUrl", e.target.value)}
                placeholder="or paste image URL"
                className="w-full px-3 py-1.5 text-xs rounded-lg border focus:outline-none font-mono focus:ring-2 focus:ring-[--color-brand-500]"
                style={{ border: "1px solid var(--color-input-border)" }}
              />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold mb-1.5" style={{ color: "var(--color-brand-800)" }}>
            Website <span className="font-normal opacity-60">(optional)</span>
          </label>
          <div className="relative">
            <ExternalLink className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "var(--color-text-secondary)" }} />
            <input
              type="url"
              value={values.website}
              onChange={(e) => set("website", e.target.value)}
              placeholder="https://yourstartup.com"
              className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border focus:outline-none focus:ring-2 focus:ring-[--color-brand-500]"
              style={{ border: "1px solid var(--color-input-border)" }}
            />
          </div>
        </div>
      </section>

      {/* ── Visibility & order ── */}
      <section className="rounded-2xl p-6 space-y-4" style={{ backgroundColor: "var(--color-surface-card)", border: "1px solid var(--color-border-subtle)" }}>
        <h2 className="text-xs font-black uppercase tracking-widest" style={{ color: "var(--color-text-secondary)" }}>Visibility</h2>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold" style={{ color: "var(--color-brand-950)" }}>Published</p>
            <p className="text-xs" style={{ color: "var(--color-placeholder)" }}>Show on public portfolio page</p>
          </div>
          <button
            type="button"
            onClick={() => set("published", !values.published)}
            className="relative w-11 h-6 rounded-full transition-colors"
            style={{ backgroundColor: values.published ? "var(--color-brand-800)" : "#e2e8f0" }}
            role="switch"
            aria-checked={values.published}
          >
            <span
              className="absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform shadow-sm"
              style={{ transform: values.published ? "translateX(20px)" : "translateX(0)" }}
            />
          </button>
        </div>

        <div>
          <label className="block text-xs font-semibold mb-1.5" style={{ color: "var(--color-brand-800)" }}>
            Sort order <span className="font-normal opacity-60">(lower = first)</span>
          </label>
          <input
            type="number"
            value={values.sortOrder}
            onChange={(e) => set("sortOrder", parseInt(e.target.value) || 0)}
            className="w-24 px-3 py-2 text-sm rounded-xl border focus:outline-none focus:ring-2 focus:ring-[--color-brand-500]"
            style={{ border: "1px solid var(--color-input-border)" }}
          />
        </div>
      </section>

      {/* ── Save bar ── */}
      <div className="flex items-center justify-between pt-2">
        {onDelete ? (
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            className="flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-xl disabled:opacity-50"
            style={{ color: "#dc2626", border: "1px solid #fecaca" }}
          >
            <Trash2 className="w-4 h-4" />
            {deleting ? "Deleting…" : "Delete"}
          </button>
        ) : <div />}

        <div className="flex items-center gap-3">
          {schemeObj && (
            <span
              className="text-[11px] font-bold px-2.5 py-1 rounded-full"
              style={{ backgroundColor: schemeObj.color, color: "white" }}
            >
              {schemeObj.label}
            </span>
          )}
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="px-5 py-2 rounded-xl text-sm font-semibold text-white disabled:opacity-60"
            style={{ backgroundColor: "var(--color-brand-800)" }}
          >
            {saving ? "Saving…" : id ? "Save changes" : "Create startup"}
          </button>
        </div>
      </div>
    </div>
  );
}
