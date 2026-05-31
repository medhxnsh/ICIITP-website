"use client";
/**
 * Admin form for editing the Home page content section (hero stats, CTA copy, images).
 * Submits to saveHomeSectionAction.
 */
import { useTransition, useState } from "react";
import type { HomeStat } from "@/lib/cms/page-sections";

interface HomeCurrent {
  about_headline: string;
  about_body_1: string;
  about_body_2: string;
  cta_headline: string;
  cta_body: string;
  building_image_url: string;
  team_staff_image_url: string;
  team_group_image_url: string;
  stats: HomeStat[];
}

interface Props {
  current: HomeCurrent;
  onSave: (fd: FormData) => Promise<{ success: boolean; error?: string }>;
}

function ImageUpload({ label, name, initial, hint }: { label: string; name: string; initial: string; hint: string }) {
  const [url, setUrl] = useState(initial);
  const [uploading, setUploading] = useState(false);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    fd.append("path", `pages/home/${name}-${Date.now()}`);
    const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
    const json = await res.json();
    if (json.url) setUrl(json.url);
    setUploading(false);
  }

  return (
    <div>
      <label className="block text-sm font-semibold mb-1" style={{ color: "var(--color-brand-950)" }}>{label}</label>
      <p className="text-xs mb-2" style={{ color: "var(--color-text-secondary)" }}>{hint}</p>
      <input type="hidden" name={name} value={url} />
      {url && (
        <div className="mb-2 rounded-lg overflow-hidden border" style={{ borderColor: "var(--color-input-border)", maxHeight: 100 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={url} alt="" className="w-full object-cover" style={{ maxHeight: 100 }} />
        </div>
      )}
      <div className="flex items-center gap-2">
        <label className="cursor-pointer text-xs font-medium px-3 py-1.5 rounded-md border" style={{ borderColor: "var(--color-input-border)", color: "var(--color-brand-800)" }}>
          {uploading ? "Uploading…" : url ? "Replace" : "Upload image"}
          <input type="file" accept="image/*" className="sr-only" onChange={handleFile} disabled={uploading} />
        </label>
        {url && <button type="button" onClick={() => setUrl("")} className="text-xs text-red-500 hover:underline">Remove</button>}
      </div>
    </div>
  );
}

const AUTO_LABELS = ["Startups Supported", "Incubation Schemes"] as const;

function StatsEditor({ initial }: { initial: HomeStat[] }) {
  const editable = initial.filter(s => !AUTO_LABELS.includes(s.label as typeof AUTO_LABELS[number]));
  const [stats, setStats] = useState<HomeStat[]>(editable);

  function update(i: number, field: keyof HomeStat, val: string) {
    setStats((prev) => prev.map((s, idx) => idx === i ? { ...s, [field]: val } : s));
  }

  return (
    <div>
      <label className="block text-sm font-semibold mb-2" style={{ color: "var(--color-brand-950)" }}>Stats grid</label>
      <input type="hidden" name="stats" value={JSON.stringify(stats)} />
      <div className="space-y-2 mb-4">
        {stats.map((s, i) => (
          <div key={i} className="flex gap-2">
            <input
              value={s.value}
              onChange={(e) => update(i, "value", e.target.value)}
              placeholder="Value e.g. 1,000+"
              className="w-28 rounded-lg border px-3 py-2 text-sm font-bold"
              style={{ borderColor: "var(--color-input-border)" }}
            />
            <input
              value={s.label}
              onChange={(e) => update(i, "label", e.target.value)}
              placeholder="Label"
              className="flex-1 rounded-lg border px-3 py-2 text-sm"
              style={{ borderColor: "var(--color-input-border)" }}
            />
          </div>
        ))}
      </div>
      <div className="rounded-lg px-3 py-2.5 text-xs space-y-1" style={{ backgroundColor: "var(--color-surface-tint)", border: "1px solid var(--color-border-subtle)" }}>
        <p className="font-semibold" style={{ color: "var(--color-brand-800)" }}>Auto-computed (not editable)</p>
        <p style={{ color: "var(--color-text-secondary)" }}>
          <span className="font-medium">Startups Supported</span> — live count from the Portfolio database.
        </p>
        <p style={{ color: "var(--color-text-secondary)" }}>
          <span className="font-medium">Incubation Schemes</span> — live count of published Programmes.
        </p>
      </div>
      <p className="text-xs mt-2" style={{ color: "var(--color-text-secondary)" }}>Edit values inline. Changes save when you click Save Changes.</p>
    </div>
  );
}

export function HomeSectionForm({ current, onSave }: Props) {
  const [pending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = await onSave(fd);
      if (res.success) { setSaved(true); setTimeout(() => setSaved(false), 3000); }
      else setError(res.error ?? "Save failed");
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">

      {/* About section */}
      <section>
        <h2 className="text-sm font-bold uppercase tracking-wider mb-4" style={{ color: "var(--color-brand-800)" }}>About Section</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-1" style={{ color: "var(--color-brand-950)" }}>Headline</label>
            <p className="text-xs mb-1.5" style={{ color: "var(--color-text-secondary)" }}>Use a newline for a line break in the heading.</p>
            <textarea name="about_headline" defaultValue={current.about_headline} rows={2}
              className="w-full rounded-lg border px-3 py-2 text-sm" style={{ borderColor: "var(--color-input-border)" }} />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1" style={{ color: "var(--color-brand-950)" }}>Paragraph 1</label>
            <textarea name="about_body_1" defaultValue={current.about_body_1} rows={3}
              className="w-full rounded-lg border px-3 py-2 text-sm" style={{ borderColor: "var(--color-input-border)" }} />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1" style={{ color: "var(--color-brand-950)" }}>Paragraph 2</label>
            <textarea name="about_body_2" defaultValue={current.about_body_2} rows={3}
              className="w-full rounded-lg border px-3 py-2 text-sm" style={{ borderColor: "var(--color-input-border)" }} />
          </div>
        </div>
      </section>

      {/* Stats */}
      <section>
        <h2 className="text-sm font-bold uppercase tracking-wider mb-4" style={{ color: "var(--color-brand-800)" }}>Stats</h2>
        <StatsEditor initial={current.stats} />
      </section>

      {/* Images */}
      <section>
        <h2 className="text-sm font-bold uppercase tracking-wider mb-4" style={{ color: "var(--color-brand-800)" }}>Images</h2>
        <div className="space-y-5">
          <ImageUpload label="Background (building photo)" name="building_image_url" initial={current.building_image_url}
            hint="Dark green About section background. Leave blank to use /images/building.jpg." />
          <ImageUpload label="Team staff photo" name="team_staff_image_url" initial={current.team_staff_image_url}
            hint="Photo shown beside the stats grid. Leave blank to use /images/team-staff.jpg." />
          <ImageUpload label="Apply CTA background" name="team_group_image_url" initial={current.team_group_image_url}
            hint="Background of the 'Build the future' section. Leave blank to use /images/team-group.jpg." />
        </div>
      </section>

      {/* Apply CTA */}
      <section>
        <h2 className="text-sm font-bold uppercase tracking-wider mb-4" style={{ color: "var(--color-brand-800)" }}>Apply CTA Section</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-1" style={{ color: "var(--color-brand-950)" }}>Headline</label>
            <textarea name="cta_headline" defaultValue={current.cta_headline} rows={2}
              className="w-full rounded-lg border px-3 py-2 text-sm" style={{ borderColor: "var(--color-input-border)" }} />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1" style={{ color: "var(--color-brand-950)" }}>Subtext</label>
            <textarea name="cta_body" defaultValue={current.cta_body} rows={2}
              className="w-full rounded-lg border px-3 py-2 text-sm" style={{ borderColor: "var(--color-input-border)" }} />
          </div>
        </div>
      </section>

      {error && <p className="text-sm text-red-600">{error}</p>}
      {saved && <p className="text-sm font-medium" style={{ color: "var(--color-brand-800)" }}>✓ Saved — changes are live on the homepage.</p>}

      <button type="submit" disabled={pending}
        className="px-6 py-2.5 rounded-lg text-sm font-semibold text-white disabled:opacity-60"
        style={{ backgroundColor: "var(--color-brand-800)" }}>
        {pending ? "Saving…" : "Save Changes"}
      </button>
    </form>
  );
}
