"use client";
/**
 * Admin form for creating and editing CMS events.
 * Used by both the new event page and the event edit page.
 */
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Upload, Check } from "lucide-react";
import { CustomFieldBuilder } from "./custom-field-builder";
import type { EventCategory, EventStatus, CustomField, EventImage, ImageLayout } from "@/lib/cms/events";
import type { EventFormData } from "@/app/admin/(protected)/content/events/actions";

const CATEGORIES: EventCategory[] = ["Training", "Competition", "Conference", "Workshop", "Other"];
const STATUSES: EventStatus[] = ["Upcoming", "Ongoing", "Closed", "Recurring"];

const LAYOUT_OPTIONS = [
  { value: "banner",   label: "Banner",   desc: "First image as a full-width hero strip" },
  { value: "grid",     label: "Grid",     desc: "All images in a 2–3 column photo grid" },
  { value: "carousel", label: "Carousel", desc: "Horizontal scroll strip of all images"  },
] as const;

function slugify(s: string) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

function MultiImageUpload({
  eventSlug, images, onAdd, onRemove,
}: {
  eventSlug: string;
  images: EventImage[];
  onAdd: (img: EventImage) => void;
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
        fd.append("path", `events/${eventSlug || "draft"}-img-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`);
        const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
        const json = await res.json();
        if (json.url) onAdd({ url: json.url, alt: "" });
        else failed++;
      } catch {
        failed++;
      }
      setUploadState((prev) => prev ? { ...prev, done: prev.done + 1 } : null);
    }
    setUploadState(null);
    if (failed > 0) setUploadError(`${failed} of ${files.length} image(s) failed to upload.`);
    e.target.value = "";
  }

  const uploading = uploadState !== null;

  return (
    <div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-3">
        {images.map((img, i) => (
          <div key={i} className="relative group rounded-lg overflow-hidden border" style={{ borderColor: "#d4e6c4", aspectRatio: "4/3" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={img.url} alt={img.alt ?? ""} className="w-full h-full object-cover" />
            <button
              type="button"
              onClick={() => onRemove(i)}
              className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-red-600 text-white text-xs font-bold flex items-center justify-center shadow"
              title="Remove image"
            >
              ×
            </button>
            {i === 0 && (
              <span className="absolute bottom-1 left-1.5 text-[10px] bg-black/60 text-white px-1.5 py-0.5 rounded">Cover</span>
            )}
          </div>
        ))}
        <label
          className="flex flex-col items-center justify-center gap-1.5 rounded-lg border-2 border-dashed cursor-pointer transition-colors hover:bg-[#f5f9f0]"
          style={{ borderColor: "#d4e6c4", aspectRatio: "4/3", minHeight: "100px" }}
        >
          {uploading ? (
            <>
              <span className="text-xs font-medium" style={{ color: "#3a5214" }}>
                {uploadState!.done}/{uploadState!.total} uploaded
              </span>
              <div className="w-16 h-1.5 rounded-full mt-1 overflow-hidden" style={{ backgroundColor: "#d4e6c4" }}>
                <div
                  className="h-full rounded-full transition-all"
                  style={{ backgroundColor: "#3a5214", width: `${(uploadState!.done / uploadState!.total) * 100}%` }}
                />
              </div>
            </>
          ) : (
            <>
              <Upload className="w-5 h-5" style={{ color: "#3a5214" }} />
              <span className="text-xs font-medium" style={{ color: "#3a5214" }}>Add images</span>
              <span className="text-[10px]" style={{ color: "#7a8e6a" }}>Select multiple</span>
            </>
          )}
          <input type="file" accept="image/*" multiple className="sr-only" onChange={handleFiles} disabled={uploading} />
        </label>
      </div>
      {uploadError && <p className="text-xs mb-2" style={{ color: "#b91c1c" }}>{uploadError}</p>}
      <p className="text-xs" style={{ color: "#7a8e6a" }}>
        First image is used as the cover banner (cropped to 16:7) and listing thumbnail. Upload any size — images are automatically cropped to fit.
      </p>
    </div>
  );
}

interface Props {
  event?: EventFormData;
  onSave: (data: EventFormData) => Promise<{ success: boolean; error?: string }>;
}

export function EventForm({ event, onSave }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  const [slug, setSlug] = useState(event?.slug ?? "");
  const [title, setTitle] = useState(event?.title ?? "");
  const [tagline, setTagline] = useState(event?.tagline ?? "");
  const [description, setDescription] = useState(event?.description ?? "");
  const [category, setCategory] = useState<EventCategory>(event?.category ?? "Training");
  const [status, setStatus] = useState<EventStatus>(event?.status ?? "Upcoming");
  const [autoClose, setAutoClose] = useState(event?.autoClose ?? false);
  const [closingDate, setClosingDate] = useState(event?.closingDate ?? "");
  const [images, setImages] = useState<EventImage[]>(() => {
    // Migrate: if old event has coverImageUrl but no images array, seed it
    if (event?.images?.length) return event.images;
    if (event?.coverImageUrl) return [{ url: event.coverImageUrl, alt: "" }];
    return [];
  });
  const [imageLayout, setImageLayout] = useState<ImageLayout>(event?.imageLayout ?? "banner");
  const [applyUrl, setApplyUrl] = useState(event?.applyUrl ?? "");
  const [contact, setContact] = useState(event?.contact ?? "");
  const [customBadge, setCustomBadge] = useState(event?.customBadge ?? "");
  const [published, setPublished] = useState(event?.published ?? false);
  const [customFields, setCustomFields] = useState<CustomField[]>(event?.customFields ?? []);

  function handleTitleChange(v: string) {
    setTitle(v);
    if (!event) setSlug(slugify(v));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!title.trim()) { setError("Title is required."); return; }
    if (!slug.trim()) { setError("Slug is required."); return; }
    const data: EventFormData = {
      slug: slug.trim(),
      title: title.trim(),
      tagline: tagline.trim(),
      description: description.trim(),
      category,
      status,
      autoClose,
      closingDate: closingDate || null,
      coverImageUrl: images[0]?.url ?? "",
      images,
      imageLayout,
      applyUrl: applyUrl.trim(),
      contact: contact.trim(),
      customBadge: customBadge.trim() || undefined,
      published,
      customFields,
    };
    startTransition(async () => {
      const result = await onSave(data);
      if (result.success) {
        setSaved(true);
        setTimeout(() => { router.push("/admin/content/events"); router.refresh(); }, 800);
      } else {
        setError(result.error ?? "Something went wrong.");
      }
    });
  }

  const inputCls = "w-full text-sm rounded-lg px-3 py-2 outline-none";
  const inputStyle = { border: "1px solid #d4e6c4", color: "#1c2e06" };
  const labelCls = "block text-xs font-semibold mb-1";
  const labelStyle = { color: "#5a6644" };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-3xl">
      {error && (
        <div className="text-sm px-4 py-3 rounded-xl" style={{ backgroundColor: "#fef2f2", color: "#b91c1c", border: "1px solid #fecaca" }}>
          {error}
        </div>
      )}

      {/* Basic info */}
      <section>
        <h2 className="text-sm font-black uppercase tracking-wider mb-4" style={{ color: "#3a5214" }}>
          Basic Information
        </h2>
        <div className="space-y-4">
          <div>
            <label className={labelCls} style={labelStyle}>
              Title <span style={{ color: "#b91c1c" }}>*</span>
            </label>
            <input
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="MedTech Innovation School 2026"
              className={inputCls}
              style={inputStyle}
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className={labelCls} style={labelStyle}>
                Slug (URL) <span style={{ color: "#b91c1c" }}>*</span>
              </label>
              <div className="flex items-center gap-1">
                <span className="text-xs" style={{ color: "#aab89e" }}>/events/</span>
                <input
                  value={slug}
                  onChange={(e) => setSlug(slugify(e.target.value))}
                  placeholder="medtech-school-2026"
                  className={`flex-1 ${inputCls}`}
                  style={inputStyle}
                />
              </div>
            </div>
            <div>
              <label className={labelCls} style={labelStyle}>Contact</label>
              <input
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                placeholder="contact@iitp.ac.in"
                className={inputCls}
                style={inputStyle}
              />
            </div>
          </div>

          <div>
            <label className={labelCls} style={labelStyle}>Tagline</label>
            <input
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              placeholder="Short one-line description shown in event cards"
              className={inputCls}
              style={inputStyle}
            />
          </div>

          <div>
            <label className={labelCls} style={labelStyle}>Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              placeholder="Full event description shown on the event page"
              className={`${inputCls} resize-y`}
              style={inputStyle}
            />
          </div>
        </div>
      </section>

      {/* Status & settings */}
      <section>
        <h2 className="text-sm font-black uppercase tracking-wider mb-4" style={{ color: "#3a5214" }}>
          Status &amp; Settings
        </h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className={labelCls} style={labelStyle}>Category</label>
            <select value={category} onChange={(e) => setCategory(e.target.value as EventCategory)} className={inputCls} style={inputStyle}>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className={labelCls} style={labelStyle}>Status</label>
            <select value={status} onChange={(e) => setStatus(e.target.value as EventStatus)} className={inputCls} style={inputStyle}>
              {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className={labelCls} style={labelStyle}>Apply / Register URL</label>
            <input type="url" value={applyUrl} onChange={(e) => setApplyUrl(e.target.value)} placeholder="https://forms.gle/..." className={inputCls} style={inputStyle} />
          </div>
          <div>
            <label className={labelCls} style={labelStyle}>Closing date</label>
            <input type="date" value={closingDate} onChange={(e) => setClosingDate(e.target.value)} className={inputCls} style={inputStyle} />
          </div>
        </div>
        <div className="mt-4 flex flex-col sm:flex-row gap-4">
          <label className="flex items-center gap-2.5 cursor-pointer">
            <input type="checkbox" checked={autoClose} onChange={(e) => setAutoClose(e.target.checked)} className="w-4 h-4 rounded" style={{ accentColor: "#3a5214" }} />
            <span className="text-sm" style={{ color: "#1c2e06" }}>Auto-close when closing date passes</span>
          </label>
          <div className="flex-1">
            <label className={labelCls} style={labelStyle}>
              Custom badge <span className="font-normal" style={{ color: "#aab89e" }}>(e.g. "Results Announced", "Interview Stage" — shown alongside auto status)</span>
            </label>
            <input
              value={customBadge}
              onChange={(e) => setCustomBadge(e.target.value)}
              placeholder="Leave blank to use auto date-based badge only"
              className={inputCls}
              style={inputStyle}
            />
          </div>
        </div>
      </section>

      {/* Images */}
      <section>
        <h2 className="text-sm font-black uppercase tracking-wider mb-4" style={{ color: "#3a5214" }}>Images</h2>

        <div className="mb-5">
          <p className="text-xs font-semibold mb-2" style={{ color: "#5a6644" }}>Display layout</p>
          <div className="flex flex-wrap gap-2">
            {LAYOUT_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setImageLayout(opt.value)}
                className="flex flex-col items-start px-3 py-2 rounded-lg border text-left transition-colors"
                style={
                  imageLayout === opt.value
                    ? { borderColor: "#3a5214", backgroundColor: "#f0f7e6", color: "#1c2e06" }
                    : { borderColor: "#d4e6c4", color: "#5a6644" }
                }
              >
                <span className="text-sm font-semibold">{opt.label}</span>
                <span className="text-xs mt-0.5">{opt.desc}</span>
              </button>
            ))}
          </div>
        </div>

        <MultiImageUpload
          eventSlug={slug}
          images={images}
          onAdd={(img) => setImages((prev) => [...prev, img])}
          onRemove={(idx) => setImages((prev) => prev.filter((_, i) => i !== idx))}
        />
      </section>

      {/* Custom fields */}
      <section>
        <h2 className="text-sm font-black uppercase tracking-wider mb-1" style={{ color: "#3a5214" }}>
          Custom Sections
        </h2>
        <p className="text-xs mb-4" style={{ color: "#7a8e6a" }}>
          Add any extra content sections — schedule, prizes, eligibility, brochures, etc.
        </p>
        <CustomFieldBuilder fields={customFields} onChange={setCustomFields} eventSlug={slug} />
      </section>

      {/* Actions */}
      <div className="flex items-center gap-3 pt-2 flex-wrap">
        <button
          type="submit"
          disabled={pending || saved}
          className="text-sm font-semibold px-6 py-2.5 rounded-xl text-white disabled:opacity-60 transition-opacity"
          style={{ backgroundColor: "#3a5214" }}
        >
          {pending ? "Saving…" : saved ? <><Check className="w-4 h-4 inline mr-1" />Saved</> : event ? "Save changes" : "Create event"}
        </button>
        <label
          className="flex items-center gap-2.5 cursor-pointer px-4 py-2.5 rounded-xl border transition-colors"
          style={published
            ? { backgroundColor: "#f0f7e6", borderColor: "#7bbf3e", color: "#1c2e06" }
            : { backgroundColor: "#f8f8f8", borderColor: "#d4e6c4", color: "#7a8e6a" }}
        >
          <input type="checkbox" checked={published} onChange={(e) => setPublished(e.target.checked)} className="w-4 h-4 rounded" style={{ accentColor: "#3a5214" }} />
          <span className="text-sm font-semibold">{published ? "Live on website" : "Set live on website"}</span>
        </label>
        <button
          type="button"
          onClick={() => router.push("/admin/content/events")}
          className="text-sm font-medium px-4 py-2.5 rounded-xl"
          style={{ color: "#7a8e6a" }}
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
