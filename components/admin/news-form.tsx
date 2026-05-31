"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Upload } from "lucide-react";
import { useToast } from "@/components/admin/toast-provider";
import type { NewsCategory, NewsImageLayout } from "@/lib/cms/news";
import type { NewsFormData } from "@/app/admin/(protected)/content/news/actions";

const CATEGORIES: NewsCategory[] = ["Achievement", "Award", "Press", "Research", "Partnership", "Other"];

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

function CoverImageUpload({
  newsSlug,
  coverUrl,
  onSet,
}: {
  newsSlug: string;
  coverUrl: string;
  onSet: (url: string) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError("");
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("path", `news/${newsSlug || "draft"}-cover-${Date.now()}`);
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      const json = await res.json();
      if (json.url) onSet(json.url);
      else setError("Upload failed.");
    } catch {
      setError("Upload failed.");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  return (
    <div>
      {coverUrl ? (
        <div className="relative rounded-xl overflow-hidden mb-2" style={{ aspectRatio: "16/7" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={coverUrl} alt="Cover" className="w-full h-full object-cover" />
          <button
            type="button"
            onClick={() => onSet("")}
            className="absolute top-2 right-2 w-7 h-7 rounded-full bg-red-600 text-white text-sm font-bold flex items-center justify-center shadow"
          >
            ×
          </button>
        </div>
      ) : (
        <label
          className="flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed cursor-pointer transition-colors hover:bg-[--color-surface-tint] mb-2"
          style={{ borderColor: "var(--color-input-border)", minHeight: "140px" }}
        >
          {uploading ? (
            <span className="text-xs font-medium" style={{ color: "var(--color-brand-800)" }}>Uploading…</span>
          ) : (
            <>
              <Upload className="w-6 h-6" style={{ color: "var(--color-brand-800)" }} />
              <span className="text-xs font-medium" style={{ color: "var(--color-brand-800)" }}>Upload cover image</span>
              <span className="text-[10px]" style={{ color: "var(--color-text-secondary)" }}>Shown as hero banner (16:7)</span>
            </>
          )}
          <input type="file" accept="image/*" className="sr-only" onChange={handleFile} disabled={uploading} />
        </label>
      )}
      {error && <p className="text-xs mb-1" style={{ color: "var(--color-danger)" }}>{error}</p>}
    </div>
  );
}

function GalleryUpload({
  newsSlug,
  images,
  onAdd,
  onRemove,
}: {
  newsSlug: string;
  images: { url: string; alt: string }[];
  onAdd: (img: { url: string; alt: string }) => void;
  onRemove: (idx: number) => void;
}) {
  const [uploadState, setUploadState] = useState<{ total: number; done: number } | null>(null);
  const [error, setError] = useState("");

  async function handleFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    setError("");
    setUploadState({ total: files.length, done: 0 });
    let failed = 0;
    for (const file of files) {
      try {
        const fd = new FormData();
        fd.append("file", file);
        fd.append("path", `news/${newsSlug || "draft"}-img-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`);
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
    if (failed > 0) setError(`${failed} of ${files.length} image(s) failed to upload.`);
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
            <button
              type="button"
              onClick={() => onRemove(i)}
              className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-red-600 text-white text-xs font-bold flex items-center justify-center shadow"
            >
              ×
            </button>
          </div>
        ))}
        <label
          className="flex flex-col items-center justify-center gap-1.5 rounded-lg border-2 border-dashed cursor-pointer transition-colors hover:bg-[--color-surface-tint]"
          style={{ borderColor: "var(--color-input-border)", aspectRatio: "4/3", minHeight: "80px" }}
        >
          {uploading ? (
            <>
              <span className="text-xs font-medium" style={{ color: "var(--color-brand-800)" }}>
                {uploadState!.done}/{uploadState!.total} uploaded
              </span>
              <div className="w-16 h-1.5 rounded-full mt-1 overflow-hidden" style={{ backgroundColor: "var(--color-input-border)" }}>
                <div
                  className="h-full rounded-full transition-all"
                  style={{ backgroundColor: "var(--color-brand-800)", width: `${(uploadState!.done / uploadState!.total) * 100}%` }}
                />
              </div>
            </>
          ) : (
            <>
              <Upload className="w-4 h-4" style={{ color: "var(--color-brand-800)" }} />
              <span className="text-[11px] font-medium" style={{ color: "var(--color-brand-800)" }}>Add images</span>
            </>
          )}
          <input type="file" accept="image/*" multiple className="sr-only" onChange={handleFiles} disabled={uploading} />
        </label>
      </div>
      {error && <p className="text-xs mb-2" style={{ color: "var(--color-danger)" }}>{error}</p>}
    </div>
  );
}

interface Props {
  news?: NewsFormData;
  onSave: (data: NewsFormData) => Promise<{ success: boolean; error?: string }>;
}

export function NewsForm({ news, onSave }: Props) {
  const router = useRouter();
  const toast = useToast();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");

  const [slug, setSlug] = useState(news?.slug ?? "");
  const [title, setTitle] = useState(news?.title ?? "");
  const [tagline, setTagline] = useState(news?.tagline ?? "");
  const [body, setBody] = useState(news?.body ?? "");
  const [category, setCategory] = useState<NewsCategory>(news?.category ?? "Achievement");
  const [coverImageUrl, setCoverImageUrl] = useState(news?.coverImageUrl ?? "");
  const [images, setImages] = useState<{ url: string; alt: string }[]>(news?.images ?? []);
  const [imageLayout, setImageLayout] = useState<NewsImageLayout>(news?.imageLayout ?? "grid");
  const [published, setPublished] = useState(news?.published ?? false);
  const [featured, setFeatured] = useState(news?.featured ?? false);
  const [publishedAt, setPublishedAt] = useState(
    news?.publishedAt ? news.publishedAt.slice(0, 10) : ""
  );

  function handleTitleChange(v: string) {
    setTitle(v);
    if (!news) setSlug(slugify(v));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!title.trim()) { setError("Title is required."); return; }
    if (!slug.trim()) { setError("Slug is required."); return; }
    const data: NewsFormData = {
      slug: slug.trim(),
      title: title.trim(),
      tagline: tagline.trim(),
      body: body.trim(),
      category,
      coverImageUrl,
      images,
      imageLayout,
      published,
      featured,
      publishedAt: publishedAt || null,
    };
    startTransition(async () => {
      const result = await onSave(data);
      if (result.success) {
        toast.success("Article saved", published ? "Live on the website." : "Saved as draft.");
        if (featured) toast.info("Featured article", "Other featured articles have been unfeatured automatically.");
        router.refresh();
      } else {
        setError(result.error ?? "Something went wrong.");
        toast.error("Save failed", result.error ?? "Something went wrong.");
      }
    });
  }

  const inputCls = "w-full text-sm rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-[--color-brand-500]";
  const inputStyle = { border: "1px solid var(--color-input-border)", color: "var(--color-brand-950)" };
  const labelCls = "block text-xs font-semibold mb-1";
  const labelStyle = { color: "var(--color-text-body)" };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-3xl">
      {error && (
        <div className="text-sm px-4 py-3 rounded-xl" style={{ backgroundColor: "var(--color-danger-bg)", color: "var(--color-danger)", border: "1px solid #fecaca" }}>
          {error}
        </div>
      )}

      {/* Basic info */}
      <section>
        <h2 className="text-sm font-black uppercase tracking-wider mb-4" style={{ color: "var(--color-brand-800)" }}>
          Basic Information
        </h2>
        <div className="space-y-4">
          <div>
            <label className={labelCls} style={labelStyle}>
              Title <span style={{ color: "var(--color-danger)" }}>*</span>
            </label>
            <input
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="IC IITP startup wins national award"
              className={inputCls}
              style={inputStyle}
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className={labelCls} style={labelStyle}>
                Slug (URL) <span style={{ color: "var(--color-danger)" }}>*</span>
              </label>
              <div className="flex items-center gap-1">
                <span className="text-xs" style={{ color: "var(--color-placeholder)" }}>/news/</span>
                <input
                  value={slug}
                  onChange={(e) => setSlug(slugify(e.target.value))}
                  placeholder="startup-wins-award"
                  className={`flex-1 ${inputCls}`}
                  style={inputStyle}
                />
              </div>
            </div>
            <div>
              <label className={labelCls} style={labelStyle}>Category</label>
              <select value={category} onChange={(e) => setCategory(e.target.value as NewsCategory)} className={inputCls} style={inputStyle}>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className={labelCls} style={labelStyle}>
                Publish date
                <span className="font-normal ml-1" style={{ color: "var(--color-placeholder)" }}>(leave blank to use today when published)</span>
              </label>
              <input
                type="date"
                value={publishedAt}
                onChange={(e) => setPublishedAt(e.target.value)}
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
              placeholder="Short one-line summary shown on news cards"
              className={inputCls}
              style={inputStyle}
            />
          </div>

          <div>
            <label className={labelCls} style={labelStyle}>Body</label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={6}
              placeholder="Full article content shown on the news detail page"
              className={`${inputCls} resize-y`}
              style={inputStyle}
            />
          </div>
        </div>
      </section>

      {/* Cover image */}
      <section>
        <h2 className="text-sm font-black uppercase tracking-wider mb-1" style={{ color: "var(--color-brand-800)" }}>Cover Image</h2>
        <p className="text-xs mb-3" style={{ color: "var(--color-text-secondary)" }}>
          The main image shown as the hero banner on the detail page and as the featured thumbnail.
        </p>
        <CoverImageUpload newsSlug={slug} coverUrl={coverImageUrl} onSet={setCoverImageUrl} />
      </section>

      {/* Gallery */}
      <section>
        <h2 className="text-sm font-black uppercase tracking-wider mb-1" style={{ color: "var(--color-brand-800)" }}>Gallery Images</h2>
        <p className="text-xs mb-4" style={{ color: "var(--color-text-secondary)" }}>
          Additional photos shown at the bottom of the article.
        </p>

        <div className="mb-5">
          <p className="text-xs font-semibold mb-2" style={{ color: "var(--color-text-body)" }}>Display layout</p>
          <div className="flex flex-wrap gap-2">
            {LAYOUT_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setImageLayout(opt.value)}
                className="flex flex-col items-start px-3 py-2 rounded-lg border text-left transition-colors"
                style={
                  imageLayout === opt.value
                    ? { borderColor: "var(--color-brand-800)", backgroundColor: "var(--color-surface-tint)", color: "var(--color-brand-950)" }
                    : { borderColor: "var(--color-input-border)", color: "var(--color-text-body)" }
                }
              >
                <span className="text-sm font-semibold">{opt.label}</span>
                <span className="text-xs mt-0.5">{opt.desc}</span>
              </button>
            ))}
          </div>
        </div>

        <GalleryUpload
          newsSlug={slug}
          images={images}
          onAdd={(img) => setImages((prev) => [...prev, img])}
          onRemove={(idx) => setImages((prev) => prev.filter((_, i) => i !== idx))}
        />
      </section>

      {/* Actions */}
      <div className="flex items-center gap-3 pt-2 flex-wrap">
        <button
          type="submit"
          disabled={pending}
          className="text-sm font-semibold px-6 py-2.5 rounded-xl text-white disabled:opacity-60 transition-opacity"
          style={{ backgroundColor: "var(--color-brand-800)" }}
        >
          {pending ? "Saving…" : news ? "Save changes" : "Create article"}
        </button>
        <label
          className="flex items-center gap-2.5 cursor-pointer px-4 py-2.5 rounded-xl border transition-colors"
          style={published
            ? { backgroundColor: "var(--color-surface-tint)", borderColor: "#7bbf3e", color: "var(--color-brand-950)" }
            : { backgroundColor: "#f8f8f8", borderColor: "var(--color-input-border)", color: "var(--color-text-secondary)" }}
        >
          <input type="checkbox" checked={published} onChange={(e) => setPublished(e.target.checked)} className="w-4 h-4 rounded" style={{ accentColor: "var(--color-brand-800)" }} />
          <span className="text-sm font-semibold">{published ? "Live on website" : "Set live on website"}</span>
        </label>
        <div className="flex flex-col gap-1">
          <label
            className="flex items-center gap-2.5 cursor-pointer px-4 py-2.5 rounded-xl border transition-colors"
            style={featured
              ? { backgroundColor: "#fff7ed", borderColor: "var(--color-accent)", color: "var(--color-brand-950)" }
              : { backgroundColor: "#f8f8f8", borderColor: "var(--color-input-border)", color: "var(--color-text-secondary)" }}
          >
            <input type="checkbox" checked={featured} onChange={(e) => setFeatured(e.target.checked)} className="w-4 h-4 rounded" style={{ accentColor: "var(--color-accent)" }} />
            <span className="text-sm font-semibold">{featured ? "⭐ Featured" : "Mark as featured"}</span>
          </label>
          {featured && (
            <p className="text-xs px-1" style={{ color: "var(--color-placeholder)" }}>
              Saving will automatically unfeature any other article.
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={() => router.push("/admin/content/news")}
          className="text-sm font-medium px-4 py-2.5 rounded-xl"
          style={{ color: "var(--color-text-secondary)" }}
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
