"use client";
/**
 * Admin form for editing the About page content section.
 * Submits to saveAboutSectionAction which upserts the page-sections CMS record.
 */
import { useTransition, useState } from "react";

interface AboutCurrent {
  building_image_url: string;
  inauguration_image_url: string;
  inauguration_caption: string;
  ceremony_image_url: string;
  ceremony_overlay_title: string;
  ceremony_overlay_body: string;
}

interface Props {
  current: AboutCurrent;
  onSave: (fd: FormData) => Promise<{ success: boolean; error?: string }>;
}

function ImageField({ label, name, value, hint }: { label: string; name: string; value: string; hint: string }) {
  const [url, setUrl] = useState(value);
  const [uploading, setUploading] = useState(false);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    fd.append("path", `pages/about/${name}-${Date.now()}`);
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
        <div className="mb-2 rounded-lg overflow-hidden border" style={{ borderColor: "var(--color-input-border)", maxHeight: 120 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={url} alt="" className="w-full object-cover" style={{ maxHeight: 120 }} />
        </div>
      )}
      <div className="flex items-center gap-2">
        <label className="cursor-pointer text-xs font-medium px-3 py-1.5 rounded-md border" style={{ borderColor: "var(--color-input-border)", color: "var(--color-brand-800)" }}>
          {uploading ? "Uploading…" : url ? "Replace image" : "Upload image"}
          <input type="file" accept="image/*" className="sr-only" onChange={handleFile} disabled={uploading} />
        </label>
        {url && <button type="button" onClick={() => setUrl("")} className="text-xs text-red-500 hover:underline">Remove</button>}
      </div>
    </div>
  );
}

export function AboutSectionForm({ current, onSave }: Props) {
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
    <form onSubmit={handleSubmit} className="space-y-7">
      <section>
        <h2 className="text-sm font-bold uppercase tracking-wider mb-4" style={{ color: "var(--color-brand-800)" }}>Images</h2>
        <div className="space-y-5">
          <ImageField label="Campus / Building photo" name="building_image_url" value={current.building_image_url}
            hint="Replaces /images/building.jpg on the about page hero banner." />
          <ImageField label="Inauguration photo" name="inauguration_image_url" value={current.inauguration_image_url}
            hint="Replaces /images/inauguration.jpg in the founding moment card." />
          <ImageField label="Ceremony / Community photo" name="ceremony_image_url" value={current.ceremony_image_url}
            hint="Replaces /images/team-ceremony.jpg in the community banner." />
        </div>
      </section>

      <section>
        <h2 className="text-sm font-bold uppercase tracking-wider mb-4" style={{ color: "var(--color-brand-800)" }}>Text</h2>
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-semibold mb-1" style={{ color: "var(--color-brand-950)" }}>Inauguration caption</label>
            <textarea name="inauguration_caption" defaultValue={current.inauguration_caption} rows={4}
              className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[--color-brand-500]"
              style={{ borderColor: "var(--color-input-border)" }} />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1" style={{ color: "var(--color-brand-950)" }}>Community banner title</label>
            <input name="ceremony_overlay_title" type="text" defaultValue={current.ceremony_overlay_title}
              className="w-full rounded-lg border px-3 py-2 text-sm" style={{ borderColor: "var(--color-input-border)" }} />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1" style={{ color: "var(--color-brand-950)" }}>Community banner subtitle</label>
            <input name="ceremony_overlay_body" type="text" defaultValue={current.ceremony_overlay_body}
              className="w-full rounded-lg border px-3 py-2 text-sm" style={{ borderColor: "var(--color-input-border)" }} />
          </div>
        </div>
      </section>

      {error && <p className="text-sm text-red-600">{error}</p>}
      {saved && <p className="text-sm font-medium" style={{ color: "var(--color-brand-800)" }}>✓ Saved — changes are live.</p>}

      <button type="submit" disabled={pending}
        className="px-6 py-2.5 rounded-lg text-sm font-semibold text-white disabled:opacity-60"
        style={{ backgroundColor: "var(--color-brand-800)" }}>
        {pending ? "Saving…" : "Save Changes"}
      </button>
    </form>
  );
}
