"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Upload, Trash2, Check, ChevronDown, ChevronRight } from "lucide-react";
import { useToast } from "@/components/admin/toast-provider";
import { ListEditor } from "./list-editor";
import type { ProgramFormData } from "@/app/admin/(protected)/content/programs/actions";
import type { ProgramImage, ProgramSection } from "@/lib/cms/programs";

const SECTION_OPTIONS: { value: ProgramSection; label: string }[] = [
  { value: "PRE_INCUBATION", label: "Pre-Incubation" },
  { value: "INCUBATION",     label: "Incubation" },
  { value: "ACCELERATION",   label: "Acceleration" },
];

const LAYOUT_OPTIONS = [
  { value: "banner",   label: "Banner",   desc: "First image as a full-width hero strip (21:7)" },
  { value: "grid",     label: "Grid",     desc: "2–3 column photo grid (4:3)" },
  { value: "carousel", label: "Carousel", desc: "Horizontal scroll strip (16:9)" },
] as const;

const STATUSES = ["Open", "Closed", "Coming Soon"];

// Known funder badge values — each has a colour in ProgramCard
const BADGE_OPTIONS = [
  "DST NSTEDB",
  "DST",
  "MeitY",
  "BIRAC / DBT",
  "DPIIT",
  "MoMSME",
  "MoD",
  "Govt. Bihar",
  "Flagship",
  "Other",
] as const;

// All optional list sections with metadata
const LIST_SECTIONS = [
  {
    id: "objectives",
    label: "Objectives",
    hint: "Shown on the programme detail page under 'Objectives'.",
    ph: "Add objective…",
  },
  {
    id: "targetAudience",
    label: "Who Should Apply",
    hint: "Shown on detail page under 'Who Should Apply'.",
    ph: "Add target audience item…",
  },
  {
    id: "eligibility",
    label: "Eligibility Criteria",
    hint: "Shown on detail page under 'Eligibility Criteria'.",
    ph: "Add eligibility criterion…",
  },
  {
    id: "notEligible",
    label: "You Are Not Eligible If…",
    hint: "Shown on detail page as a list of exclusions.",
    ph: "Add exclusion…",
  },
  {
    id: "support",
    label: "What We Offer",
    hint: "Shown on detail page under 'What We Offer'.",
    ph: "Add benefit or support item…",
  },
  {
    id: "preferences",
    label: "Application Preferences",
    hint: "Shown on detail page under 'Application Preferences'.",
    ph: "Add preference…",
  },
  {
    id: "expectedOutcomes",
    label: "Expected Outcomes",
    hint: "Shown on detail page under 'Expected Outcomes'.",
    ph: "Add expected outcome…",
  },
  {
    id: "notes",
    label: "Important Notes",
    hint: "Shown at the bottom of the detail page as numbered notes.",
    ph: "Add note…",
  },
  {
    id: "disclaimer",
    label: "Disclaimer",
    hint: "Shown as a muted disclaimer block at the bottom of the detail page.",
    ph: "Add disclaimer item…",
  },
] as const;

type SectionId = (typeof LIST_SECTIONS)[number]["id"];

// ── Multi-image upload ──────────────────────────────────────────────────────
function MultiImageUpload({ slug, images, onAdd, onRemove }: {
  slug: string;
  images: ProgramImage[];
  onAdd: (img: ProgramImage) => void;
  onRemove: (idx: number) => void;
}) {
  const [uploadState, setUploadState] = useState<{ total: number; done: number } | null>(null);
  const [uploadError, setUploadError] = useState("");

  async function handleFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    setUploadError("");
    setUploadState({ total: files.length, done: 0 });
    let failed = 0;
    for (const file of files) {
      try {
        const fd = new FormData();
        fd.append("file", file);
        fd.append("path", `programs/${slug}-img-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`);
        const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
        const json = await res.json();
        if (json.url) onAdd({ url: json.url, alt: "" });
        else { failed++; console.error("[upload]", json); }
      } catch (err) {
        failed++;
        console.error("[upload]", err);
      }
      setUploadState((prev) => prev ? { ...prev, done: prev.done + 1 } : null);
    }
    setUploadState(null);
    if (failed > 0) setUploadError(`${failed} of ${files.length} failed to upload.`);
    e.target.value = "";
  }

  const uploading = uploadState !== null;

  return (
    <div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-3">
        {images.map((img, i) => (
          <div key={i} className="relative group rounded-lg overflow-hidden border" style={{ borderColor: "var(--color-input-border)", aspectRatio: "4/3" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={img.url} alt={img.alt ?? ""} className="w-full h-full object-cover" />
            <button type="button" onClick={() => onRemove(i)}
              className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-red-600 text-white text-xs font-bold flex items-center justify-center shadow">×</button>
            <span className="absolute bottom-1 left-1.5 text-[10px] bg-black/50 text-white px-1.5 py-0.5 rounded">{i + 1}</span>
          </div>
        ))}
        <label className="flex flex-col items-center justify-center gap-1.5 rounded-lg border-2 border-dashed cursor-pointer transition-colors hover:bg-[--color-surface-tint]"
          style={{ borderColor: "var(--color-input-border)", aspectRatio: "4/3", minHeight: "100px" }}>
          {uploading ? (
            <>
              <span className="text-xs font-medium" style={{ color: "var(--color-brand-800)" }}>{uploadState!.done}/{uploadState!.total} uploaded</span>
              <div className="w-16 h-1.5 rounded-full mt-1 overflow-hidden" style={{ backgroundColor: "var(--color-input-border)" }}>
                <div className="h-full rounded-full transition-all" style={{ backgroundColor: "var(--color-brand-800)", width: `${(uploadState!.done / uploadState!.total) * 100}%` }} />
              </div>
            </>
          ) : (
            <>
              <Upload className="w-5 h-5" style={{ color: "var(--color-brand-800)" }} />
              <span className="text-xs font-medium" style={{ color: "var(--color-brand-800)" }}>Add images</span>
              <span className="text-[10px]" style={{ color: "var(--color-text-secondary)" }}>Select multiple</span>
            </>
          )}
          <input type="file" accept="image/*" multiple className="sr-only" onChange={handleFiles} disabled={uploading} />
        </label>
      </div>
      {uploadError && <p className="text-xs mb-2" style={{ color: "var(--color-danger)" }}>{uploadError}</p>}
      <p className="text-xs" style={{ color: "var(--color-text-secondary)" }}>Select one or more images. Hover a thumbnail and click × to remove.</p>
    </div>
  );
}

// ── Section toggle row ──────────────────────────────────────────────────────
function SectionToggle({ id, label, hint, enabled, onToggle, children }: {
  id: string;
  label: string;
  hint: string;
  enabled: boolean;
  onToggle: (id: string, on: boolean) => void;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border overflow-hidden" style={{ borderColor: enabled ? "var(--color-brand-300)" : "var(--color-input-border)" }}>
      <label className="flex items-center gap-3 px-4 py-3 cursor-pointer select-none"
        style={{ backgroundColor: enabled ? "var(--color-surface-tint)" : "var(--color-surface-card)" }}>
        <input
          type="checkbox"
          checked={enabled}
          onChange={(e) => onToggle(id, e.target.checked)}
          className="w-4 h-4 rounded shrink-0"
          style={{ accentColor: "var(--color-brand-800)" }}
        />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold" style={{ color: enabled ? "var(--color-brand-950)" : "var(--color-text-secondary)" }}>{label}</p>
          <p className="text-xs" style={{ color: "var(--color-placeholder)" }}>{hint}</p>
        </div>
        {enabled ? (
          <ChevronDown className="w-4 h-4 shrink-0" style={{ color: "var(--color-brand-600)" }} />
        ) : (
          <ChevronRight className="w-4 h-4 shrink-0" style={{ color: "var(--color-placeholder)" }} />
        )}
      </label>
      {enabled && (
        <div className="px-4 pb-4 pt-2 border-t" style={{ borderColor: "var(--color-brand-200)" }}>
          {children}
        </div>
      )}
    </div>
  );
}

// ── Main form ───────────────────────────────────────────────────────────────
interface Props {
  slug: string;
  initial: ProgramFormData;
  isStaticBacked: boolean;
  onSave: (slug: string, data: ProgramFormData) => Promise<{ success: boolean; error?: string }>;
  onDelete?: (slug: string) => Promise<void>;
}

export function ProgramForm({ slug, initial, isStaticBacked, onSave, onDelete }: Props) {
  const router = useRouter();
  const toast = useToast();
  const [pending, startTransition] = useTransition();
  const [deleting, setDeleting] = useTransition();
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  const [published, setPublished] = useState(initial.published ?? false);
  const [section, setSection] = useState<ProgramSection | undefined>(initial.section);

  // Identity / badge
  const [badge, setBadge] = useState<string>(initial.badge ?? "");
  const [badgeOther, setBadgeOther] = useState(initial.badgeOther ?? "");
  const [funder, setFunder] = useState(initial.funder ?? "");

  // Logo / images
  const [logoUrl, setLogoUrl] = useState(initial.logoUrl ?? "");
  const [logoUploading, setLogoUploading] = useState(false);
  const [images, setImages] = useState<ProgramImage[]>(initial.images ?? []);
  const [imageLayout, setImageLayout] = useState<"banner" | "grid" | "carousel">(initial.imageLayout ?? "banner");

  // Core content
  const [title, setTitle] = useState(initial.title ?? "");
  const [tagline, setTagline] = useState(initial.tagline ?? "");
  const [about, setAbout] = useState(initial.about ?? "");

  // Status / apply
  const [status, setStatus] = useState(initial.status ?? "");
  const [statusNote, setStatusNote] = useState(initial.statusNote ?? "");
  const [applicationDeadline, setApplicationDeadline] = useState(initial.applicationDeadline ?? "");
  const [customBadge, setCustomBadge] = useState(initial.customBadge ?? "");
  const [applyUrl, setApplyUrl] = useState(initial.applyUrl ?? "");
  const [showEquipmentForm, setShowEquipmentForm] = useState(!!initial.equipmentFormUrl);
  const [equipmentFormUrl, setEquipmentFormUrl] = useState(initial.equipmentFormUrl ?? "");
  const [applicationFormUrl, setApplicationFormUrl] = useState(initial.applicationFormUrl ?? "");
  const [pdfUploading, setPdfUploading] = useState(false);
  const [pdfError, setPdfError] = useState("");
  const [contactEmail, setContactEmail] = useState(initial.contactEmail ?? "");

  // Quick facts
  const [grant, setGrant] = useState(initial.grant ?? "");
  const [schemeOutlay, setSchemeOutlay] = useState(initial.schemeOutlay ?? "");
  const [stipend, setStipend] = useState(initial.stipend ?? "");
  const [duration, setDuration] = useState(initial.duration ?? "");
  const [cardHighlight, setCardHighlight] = useState(initial.cardHighlight ?? "");

  // List section state
  const [listData, setListData] = useState<Record<SectionId, string[]>>({
    objectives:       initial.objectives ?? [],
    targetAudience:   initial.targetAudience ?? [],
    eligibility:      initial.eligibility ?? [],
    notEligible:      initial.notEligible ?? [],
    support:          initial.support ?? [],
    preferences:      initial.preferences ?? [],
    expectedOutcomes: initial.expectedOutcomes ?? [],
    notes:            initial.notes ?? [],
    disclaimer:       initial.disclaimer ?? [],
  });

  // visibleSections: set of section IDs the user has toggled on.
  // On load, if the program has existing visibleSections, use those.
  // If it has existing content but no visibleSections (old record), infer from non-empty arrays.
  const inferVisible = (): Set<SectionId> => {
    const saved = initial.visibleSections ?? [];
    if (saved.length > 0) return new Set(saved as SectionId[]);
    // backward compat: infer from non-empty arrays
    const inferred = new Set<SectionId>();
    for (const sec of LIST_SECTIONS) {
      const arr = (initial as Record<string, unknown>)[sec.id];
      if (Array.isArray(arr) && arr.length > 0) inferred.add(sec.id);
    }
    return inferred;
  };
  const [visibleSections, setVisibleSections] = useState<Set<SectionId>>(inferVisible);

  function toggleSection(id: string, on: boolean) {
    setVisibleSections((prev) => {
      const next = new Set(prev);
      if (on) next.add(id as SectionId);
      else next.delete(id as SectionId);
      return next;
    });
    if (!on) {
      setListData((prev) => ({ ...prev, [id]: [] }));
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSaved(false);

    const resolvedBadge = badge === "Other" ? badgeOther.trim() : badge;

    const data: ProgramFormData = {
      images,
      imageLayout,
      published,
      section,
      badge: resolvedBadge || undefined,
      badgeOther: badge === "Other" ? badgeOther : undefined,
      funder: funder.trim() || undefined,
      logoUrl: logoUrl.trim() || undefined,
      title, tagline, about,
      status, statusNote,
      applicationDeadline: applicationDeadline || undefined,
      customBadge: customBadge.trim() || undefined,
      applyUrl,
      equipmentFormUrl: showEquipmentForm ? equipmentFormUrl : undefined,
      applicationFormUrl,
      contactEmail,
      grant, schemeOutlay, stipend, duration, cardHighlight: cardHighlight || undefined,
      visibleSections: Array.from(visibleSections),
      // Only send enabled sections' data
      objectives:       visibleSections.has("objectives")       ? listData.objectives       : [],
      targetAudience:   visibleSections.has("targetAudience")   ? listData.targetAudience   : [],
      eligibility:      visibleSections.has("eligibility")      ? listData.eligibility      : [],
      notEligible:      visibleSections.has("notEligible")      ? listData.notEligible      : [],
      support:          visibleSections.has("support")          ? listData.support          : [],
      preferences:      visibleSections.has("preferences")      ? listData.preferences      : [],
      expectedOutcomes: visibleSections.has("expectedOutcomes") ? listData.expectedOutcomes : [],
      notes:            visibleSections.has("notes")            ? listData.notes            : [],
      disclaimer:       visibleSections.has("disclaimer")       ? listData.disclaimer       : [],
    };

    startTransition(async () => {
      const result = await onSave(slug, data);
      if (result.success) {
        setSaved(true);
        toast.success("Programme saved", published ? "Live on the website." : "Saved as draft.");
        router.refresh();
      } else {
        setError(result.error ?? "Something went wrong.");
        toast.error("Save failed", result.error ?? "Something went wrong.");
      }
    });
  }

  const inputCls = "w-full text-sm rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-[--color-brand-500]";
  const inputStyle = { border: "1px solid var(--color-input-border)", color: "var(--color-brand-950)" };
  const sectionHead = "text-sm font-black uppercase tracking-wider mb-4";
  const sectionHeadStyle = { color: "var(--color-brand-800)" };
  const labelCls = "block text-xs font-semibold mb-1.5";
  const labelStyle = { color: "var(--color-text-body)" };
  const hintStyle = { color: "var(--color-placeholder)" };

  // Preview the resolved badge value
  const resolvedBadge = badge === "Other" ? (badgeOther || "—") : (badge || "—");

  return (
    <form onSubmit={handleSubmit} className="space-y-10 max-w-3xl">
      {error && (
        <div className="text-sm px-4 py-3 rounded-xl" style={{ backgroundColor: "var(--color-danger-bg)", color: "var(--color-danger)", border: "1px solid #fecaca" }}>
          {error}
        </div>
      )}

      {/* ── Programme identity ──────────────────────────────────────────── */}
      <section>
        <h2 className={sectionHead} style={sectionHeadStyle}>Programme Identity</h2>
        <div className="grid sm:grid-cols-2 gap-4">

          {/* Funder badge (coloured pill on card) */}
          <div>
            <label className={labelCls} style={labelStyle}>
              Funder Badge
            </label>
            <select
              value={badge}
              onChange={(e) => setBadge(e.target.value)}
              className={inputCls}
              style={inputStyle}
            >
              <option value="">— None —</option>
              {BADGE_OPTIONS.map((b) => <option key={b} value={b}>{b}</option>)}
            </select>
            {badge === "Other" && (
              <input
                value={badgeOther}
                onChange={(e) => setBadgeOther(e.target.value)}
                placeholder="Type custom badge text…"
                className={`${inputCls} mt-2`}
                style={inputStyle}
              />
            )}
            <p className="text-xs mt-1" style={hintStyle}>
              → Coloured pill shown top-left of the programme card on <strong>/programs</strong>.
              Preview: <span className="font-semibold" style={{ color: "var(--color-brand-800)" }}>{resolvedBadge}</span>
            </p>
          </div>

          {/* Funder name (plain text on detail page) */}
          <div>
            <label className={labelCls} style={labelStyle}>Funder Name (detail page)</label>
            <input
              value={funder}
              onChange={(e) => setFunder(e.target.value)}
              placeholder="e.g. Department of Science and Technology (DST), Govt. of India"
              className={inputCls}
              style={inputStyle}
            />
            <p className="text-xs mt-1" style={hintStyle}>
              → Shown under the title on the <strong>programme detail page</strong> as "Funder: …". Leave blank to hide.
            </p>
          </div>
        </div>
      </section>

      {/* ── Programme logo ──────────────────────────────────────────────── */}
      <section>
        <h2 className={sectionHead} style={sectionHeadStyle}>Programme Logo</h2>
        <p className="text-xs mb-3" style={hintStyle}>Shown on the <strong>/programs grid</strong> and detail page. If left blank, the IC IITP logo is used.</p>
        <div className="flex gap-3 flex-wrap items-center">
          {logoUrl && (
            <div className="relative w-24 h-14 rounded-lg overflow-hidden border shrink-0" style={{ borderColor: "var(--color-input-border)" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={logoUrl} alt="Logo preview" className="w-full h-full object-contain p-1" />
              <button type="button" onClick={() => setLogoUrl("")}
                className="absolute top-0.5 right-0.5 w-5 h-5 rounded-full bg-red-600 text-white text-xs font-bold flex items-center justify-center">×</button>
            </div>
          )}
          <label className="flex items-center gap-2 cursor-pointer text-sm font-medium px-4 py-2 rounded-lg shrink-0"
            style={{ backgroundColor: "var(--color-surface-tint)", color: "var(--color-brand-800)" }}>
            <Upload className="w-3.5 h-3.5" />
            {logoUploading ? "Uploading…" : logoUrl ? "Replace logo" : "Upload logo"}
            <input type="file" accept="image/*" className="sr-only" disabled={logoUploading}
              onChange={async (e) => {
                const file = e.target.files?.[0]; if (!file) return;
                setLogoUploading(true);
                const fd = new FormData(); fd.append("file", file); fd.append("path", `programs/logos/${Date.now()}-${file.name}`);
                const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
                const { url } = await res.json(); if (url) setLogoUrl(url);
                setLogoUploading(false); e.target.value = "";
              }} />
          </label>
          <input value={logoUrl} onChange={(e) => setLogoUrl(e.target.value)}
            placeholder="or paste logo URL"
            className="flex-1 min-w-48 text-xs font-mono rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-[--color-brand-500]"
            style={{ border: "1px solid var(--color-input-border)", color: "var(--color-brand-950)" }} />
        </div>
      </section>

      {/* ── Images ─────────────────────────────────────────────────────── */}
      <section>
        <h2 className={sectionHead} style={sectionHeadStyle}>Images</h2>
        <p className="text-xs mb-3" style={hintStyle}>Shown in the <strong>Gallery section</strong> at the bottom of the detail page.</p>
        <div className="mb-5">
          <p className="text-xs font-semibold mb-2" style={{ color: "var(--color-text-body)" }}>Display layout</p>
          <div className="flex flex-wrap gap-2">
            {LAYOUT_OPTIONS.map((opt) => (
              <button key={opt.value} type="button" onClick={() => setImageLayout(opt.value)}
                className="flex flex-col items-start px-3 py-2 rounded-lg border text-left transition-colors"
                style={imageLayout === opt.value
                  ? { borderColor: "var(--color-brand-800)", backgroundColor: "var(--color-surface-tint)", color: "var(--color-brand-950)" }
                  : { borderColor: "var(--color-input-border)", color: "var(--color-text-body)" }}>
                <span className="text-sm font-semibold">{opt.label}</span>
                <span className="text-xs mt-0.5">{opt.desc}</span>
              </button>
            ))}
          </div>
        </div>
        <MultiImageUpload slug={slug} images={images}
          onAdd={(img) => setImages((prev) => [...prev, img])}
          onRemove={(idx) => setImages((prev) => prev.filter((_, i) => i !== idx))} />
      </section>

      {/* ── Content ─────────────────────────────────────────────────────── */}
      <section>
        <h2 className={sectionHead} style={sectionHeadStyle}>Content</h2>
        <div className="space-y-4">
          <div>
            <label className={labelCls} style={labelStyle}>Title</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} className={inputCls} style={inputStyle} />
            <p className="text-xs mt-1" style={hintStyle}>→ Shown as the programme heading everywhere it appears.</p>
          </div>
          <div>
            <label className={labelCls} style={labelStyle}>Tagline</label>
            <input value={tagline} onChange={(e) => setTagline(e.target.value)} className={inputCls} style={inputStyle} />
            <p className="text-xs mt-1" style={hintStyle}>→ One-line description shown on <strong>programme card</strong> and under the title on the detail page.</p>
          </div>
          <div>
            <label className={labelCls} style={labelStyle}>About</label>
            <textarea value={about} onChange={(e) => setAbout(e.target.value)} rows={5} className={`${inputCls} resize-y`} style={inputStyle} />
            <p className="text-xs mt-1" style={hintStyle}>→ Full description shown at the top of the <strong>detail page</strong> under "About the Programme".</p>
          </div>
        </div>
      </section>

      {/* ── Status & Apply ──────────────────────────────────────────────── */}
      <section>
        <h2 className={sectionHead} style={sectionHeadStyle}>Status &amp; Apply</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className={labelCls} style={labelStyle}>Status</label>
            <select value={status} onChange={(e) => setStatus(e.target.value)} className={inputCls} style={inputStyle}>
              <option value="">— use default —</option>
              {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
            <p className="text-xs mt-1" style={hintStyle}>→ Green "Open" / grey "Closed" pill shown on the card and detail page.</p>
          </div>
          <div>
            <label className={labelCls} style={labelStyle}>Status note</label>
            <input value={statusNote} onChange={(e) => setStatusNote(e.target.value)} placeholder="e.g. Applications close June 30" className={inputCls} style={inputStyle} />
            <p className="text-xs mt-1" style={hintStyle}>→ Small note appended after the status pill on the detail page.</p>
          </div>
          <div>
            <label className={labelCls} style={labelStyle}>Application deadline</label>
            <input type="date" value={applicationDeadline} onChange={(e) => setApplicationDeadline(e.target.value)} className={inputCls} style={inputStyle} />
            <p className="text-xs mt-1" style={hintStyle}>→ Auto-shows "Closing Soon" (within 7 days) or "Closed" badge on the card when date passes.</p>
          </div>
          <div>
            <label className={labelCls} style={labelStyle}>Custom badge</label>
            <input value={customBadge} onChange={(e) => setCustomBadge(e.target.value)} placeholder="e.g. Rolling Applications" className={inputCls} style={inputStyle} />
            <p className="text-xs mt-1" style={hintStyle}>→ Orange pill shown on the card and detail page, overriding the auto date badge.</p>
          </div>
          <div>
            <label className={labelCls} style={labelStyle}>Apply URL</label>
            <input type="url" value={applyUrl} onChange={(e) => setApplyUrl(e.target.value)} placeholder="https://forms.gle/…" className={inputCls} style={inputStyle} />
            <p className="text-xs mt-1" style={hintStyle}>→ Primary "Apply Now" button in the sidebar of the detail page.</p>
          </div>
          <div>
            <label className="flex items-center gap-2 cursor-pointer mb-1.5">
              <input type="checkbox" checked={showEquipmentForm} onChange={(e) => { setShowEquipmentForm(e.target.checked); if (!e.target.checked) setEquipmentFormUrl(""); }}
                className="w-4 h-4 rounded" style={{ accentColor: "var(--color-brand-800)" }} />
              <span className={labelCls} style={{ ...labelStyle, marginBottom: 0 }}>Show Equipment / Lab Access Form</span>
            </label>
            {showEquipmentForm && (
              <input type="url" value={equipmentFormUrl} onChange={(e) => setEquipmentFormUrl(e.target.value)} placeholder="https://forms.gle/…" className={inputCls} style={inputStyle} />
            )}
            <p className="text-xs mt-1" style={hintStyle}>→ Secondary button "Equipment Access" in the sidebar.</p>
          </div>
          <div>
            <label className={labelCls} style={labelStyle}>Application Form PDF</label>
            {applicationFormUrl ? (
              <div className="flex items-center gap-2 mt-1">
                <a href={applicationFormUrl} target="_blank" rel="noopener noreferrer" className="text-xs font-medium underline truncate flex-1" style={{ color: "var(--color-brand-800)" }}>
                  {applicationFormUrl.split("/").pop()?.split("?")[0] ?? "PDF file"}
                </a>
                <button type="button" onClick={() => setApplicationFormUrl("")} className="shrink-0 text-xs px-2 py-1 rounded border text-red-600 border-red-200 hover:bg-red-50">Remove</button>
              </div>
            ) : (
              <label className="flex items-center gap-2 mt-1 cursor-pointer">
                <span className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded border font-medium" style={{ borderColor: "var(--color-input-border)", color: "var(--color-brand-800)" }}>
                  <Upload className="w-3.5 h-3.5" aria-hidden="true" />
                  {pdfUploading ? "Uploading…" : "Upload PDF"}
                </span>
                <input type="file" accept="application/pdf" className="sr-only" disabled={pdfUploading}
                  onChange={async (e) => {
                    const file = e.target.files?.[0]; if (!file) return;
                    setPdfUploading(true); setPdfError("");
                    try {
                      const fd = new FormData(); fd.append("file", file); fd.append("path", `programs/${slug}-form-${Date.now()}.pdf`);
                      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
                      const json = await res.json();
                      if (json.url) setApplicationFormUrl(json.url); else setPdfError("Upload failed.");
                    } catch { setPdfError("Upload failed."); }
                    setPdfUploading(false); e.target.value = "";
                  }} />
              </label>
            )}
            {pdfError && <p className="text-xs mt-1" style={{ color: "var(--color-danger)" }}>{pdfError}</p>}
            <p className="text-xs mt-1" style={hintStyle}>→ "Download Application Form" button in the sidebar of the detail page.</p>
          </div>
          <div>
            <label className={labelCls} style={labelStyle}>Contact email</label>
            <input type="email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} placeholder="iciitp@iitp.ac.in" className={inputCls} style={inputStyle} />
            <p className="text-xs mt-1" style={hintStyle}>→ Shown in the "Ready to apply?" sidebar and as a mailto link.</p>
          </div>
        </div>
      </section>

      {/* ── Quick facts ─────────────────────────────────────────────────── */}
      <section>
        <h2 className={sectionHead} style={sectionHeadStyle}>Quick Facts (Sidebar)</h2>
        <p className="text-xs mb-4" style={hintStyle}>
          These appear in the <strong>Quick Facts sidebar</strong> on the detail page. Use the <strong>Card highlight</strong> picker below to choose which value shows in orange on programme cards across the whole site.
        </p>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className={labelCls} style={labelStyle}>Grant amount</label>
            <input value={grant} onChange={(e) => setGrant(e.target.value)} placeholder="e.g. Up to ₹10 lakh" className={inputCls} style={inputStyle} />
          </div>
          <div>
            <label className={labelCls} style={labelStyle}>Scheme outlay</label>
            <input value={schemeOutlay} onChange={(e) => setSchemeOutlay(e.target.value)} placeholder="e.g. ₹490 Cr total scheme" className={inputCls} style={inputStyle} />
          </div>
          <div>
            <label className={labelCls} style={labelStyle}>Stipend</label>
            <input value={stipend} onChange={(e) => setStipend(e.target.value)} placeholder="e.g. ₹10,000–₹30,000/month" className={inputCls} style={inputStyle} />
          </div>
          <div>
            <label className={labelCls} style={labelStyle}>Duration</label>
            <input value={duration} onChange={(e) => setDuration(e.target.value)} placeholder="e.g. 12 months" className={inputCls} style={inputStyle} />
          </div>
        </div>

        {/* Card highlight picker */}
        <div className="mt-5 p-4 rounded-xl" style={{ backgroundColor: "var(--color-surface-tint)", border: "1px solid var(--color-input-border)" }}>
          <label className={labelCls} style={labelStyle}>Card highlight</label>
          <p className="text-xs mb-3" style={hintStyle}>
            Choose which value is shown in <span className="font-semibold" style={{ color: "var(--color-accent)" }}>orange</span> on programme cards — on the homepage, <strong>/programs</strong>, and each category listing page.
          </p>
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            {[
              { value: "", label: "None" },
              { value: "grant", label: "Grant amount", preview: grant || "—" },
              { value: "stipend", label: "Stipend", preview: stipend || "—" },
              { value: "schemeOutlay", label: "Scheme outlay", preview: schemeOutlay || "—" },
            ].map((opt) => (
              <label key={opt.value} className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="radio"
                  name="cardHighlight"
                  value={opt.value}
                  checked={cardHighlight === opt.value}
                  onChange={() => setCardHighlight(opt.value)}
                  className="accent-[--color-brand-800]"
                />
                <span className="text-sm font-medium" style={{ color: "var(--color-brand-950)" }}>{opt.label}</span>
                {"preview" in opt && (
                  <span className="text-xs" style={{ color: cardHighlight === opt.value ? "var(--color-accent)" : "var(--color-text-secondary)" }}>
                    {opt.preview}
                  </span>
                )}
              </label>
            ))}
          </div>
        </div>
      </section>

      {/* ── Optional sections ────────────────────────────────────────────── */}
      <section>
        <h2 className={sectionHead} style={sectionHeadStyle}>Page Sections</h2>
        <p className="text-xs mb-4" style={hintStyle}>
          Enable only the sections that apply to this programme. Disabled sections are hidden from the public page even if they have content — this avoids empty headings.
        </p>
        <div className="space-y-3">
          {LIST_SECTIONS.map((sec) => (
            <SectionToggle
              key={sec.id}
              id={sec.id}
              label={sec.label}
              hint={sec.hint}
              enabled={visibleSections.has(sec.id)}
              onToggle={toggleSection}
            >
              <ListEditor
                values={listData[sec.id]}
                onChange={(v) => setListData((prev) => ({ ...prev, [sec.id]: v }))}
                placeholder={sec.ph}
              />
            </SectionToggle>
          ))}
        </div>
      </section>

      {/* ── Save bar ────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-3 pt-2 flex-wrap">
        <button type="submit" disabled={pending || deleting}
          className="text-sm font-semibold px-6 py-2.5 rounded-xl text-white disabled:opacity-60 transition-opacity"
          style={{ backgroundColor: "var(--color-brand-800)" }}>
          {pending ? "Saving…" : saved ? <><Check className="w-4 h-4 inline mr-1" />Saved</> : "Save changes"}
        </button>

        {!isStaticBacked && (
          <label className="flex items-center gap-2.5 cursor-pointer px-4 py-2.5 rounded-xl border transition-colors"
            style={published
              ? { backgroundColor: "var(--color-surface-tint)", borderColor: "#7bbf3e", color: "var(--color-brand-950)" }
              : { backgroundColor: "#f8f8f8", borderColor: "var(--color-input-border)", color: "var(--color-text-secondary)" }}>
            <input type="checkbox" checked={published} onChange={(e) => setPublished(e.target.checked)}
              className="w-4 h-4 rounded" style={{ accentColor: "var(--color-brand-800)" }} />
            <span className="text-sm font-semibold">{published ? "Live on website" : "Set live on website"}</span>
          </label>
        )}

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold" style={{ color: "var(--color-text-body)" }}>Section:</span>
          {SECTION_OPTIONS.map((opt) => (
            <button key={opt.value} type="button" onClick={() => setSection(opt.value)}
              className="text-xs font-semibold px-3 py-1.5 rounded-full border transition-colors"
              style={section === opt.value
                ? { backgroundColor: "var(--color-brand-800)", borderColor: "var(--color-brand-800)", color: "white" }
                : { backgroundColor: "transparent", borderColor: "var(--color-input-border)", color: "var(--color-text-secondary)" }}>
              {opt.label}
            </button>
          ))}
        </div>

        <button type="button" onClick={() => router.push("/admin/content/programs")}
          className="text-sm font-medium px-4 py-2.5 rounded-xl" style={{ color: "var(--color-text-secondary)" }}>
          Cancel
        </button>

        {onDelete && (
          <button type="button" disabled={deleting || pending}
            onClick={() => {
              if (!confirm(isStaticBacked
                ? "This will remove the CMS customisations, reverting to static content. Continue?"
                : "Delete this programme permanently? This cannot be undone."
              )) return;
              setDeleting(async () => { await onDelete(slug); });
            }}
            className="ml-auto flex items-center gap-2 text-sm font-medium px-4 py-2.5 rounded-xl disabled:opacity-50"
            style={{ color: "var(--color-danger)", border: "1px solid #fecaca" }}>
            <Trash2 className="w-4 h-4" />
            {deleting ? "Deleting…" : isStaticBacked ? "Clear CMS data" : "Delete programme"}
          </button>
        )}
      </div>
    </form>
  );
}
