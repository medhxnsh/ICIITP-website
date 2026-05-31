"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Upload, Check } from "lucide-react";
import type { DownloadInput } from "@/lib/cms/downloads";
import { useToast } from "@/components/admin/toast-provider";

const FILE_TYPES = ["PDF", "DOCX", "XLS", "PPT", "Other"];
const CATEGORIES = ["Applications", "Certificates", "Policies", "Reports", "Brochures", "Other"];

interface Props {
  initial?: Partial<DownloadInput>;
  onSave: (data: DownloadInput) => Promise<{ success: boolean; error?: string }>;
}

export function DownloadForm({ initial, onSave }: Props) {
  const router = useRouter();
  const toast = useToast();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [title, setTitle] = useState(initial?.title ?? "");
  const [fileUrl, setFileUrl] = useState(initial?.fileUrl ?? "");
  const [fileType, setFileType] = useState(initial?.fileType ?? "PDF");
  const [category, setCategory] = useState(initial?.category ?? "Applications");
  const [purpose, setPurpose] = useState(initial?.purpose ?? "");
  const [published, setPublished] = useState(initial?.published ?? true);

  async function uploadFile(file: File) {
    setUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    fd.append("path", `downloads/${Date.now()}-${file.name}`);
    try {
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      const { url } = await res.json();
      if (url) {
        setFileUrl(url);
        if (!fileType || fileType === "PDF") {
          const ext = file.name.split(".").pop()?.toUpperCase() ?? "PDF";
          setFileType(FILE_TYPES.includes(ext) ? ext : "Other");
        }
      }
    } finally {
      setUploading(false);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!title.trim()) { setError("Title is required."); return; }
    if (!fileUrl.trim()) { setError("A file or URL is required."); return; }
    const data: DownloadInput = {
      title: title.trim(),
      fileUrl: fileUrl.trim(),
      fileType,
      category,
      displayPage: "downloads",
      purpose: purpose.trim(),
      published,
    };
    startTransition(async () => {
      const result = await onSave(data);
      if (result.success) {
        setSaved(true);
        toast.success("Download saved", published ? "Live on the Downloads page." : "Saved as draft.");
        setTimeout(() => { router.push("/admin/content/downloads"); router.refresh(); }, 1000);
      } else {
        setError(result.error ?? "Something went wrong.");
        toast.error("Save failed", result.error ?? "Something went wrong.");
      }
    });
  }

  const inputCls = "w-full text-sm rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-[--color-brand-500]";
  const inputStyle = { border: "1px solid var(--color-input-border)", color: "var(--color-brand-950)" };
  const labelCls = "block text-xs font-semibold mb-1.5";
  const labelStyle = { color: "var(--color-text-body)" };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="text-sm px-4 py-3 rounded-xl" style={{ backgroundColor: "var(--color-danger-bg)", color: "var(--color-danger)", border: "1px solid #fecaca" }}>
          {error}
        </div>
      )}

      <div>
        <label className={labelCls} style={labelStyle}>
          Title <span style={{ color: "var(--color-danger)" }}>*</span>
        </label>
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Nidhi Prayas 2025 Application Form" className={inputCls} style={inputStyle} />
      </div>

      <div>
        <label className={labelCls} style={labelStyle}>
          File <span style={{ color: "var(--color-danger)" }}>*</span>
        </label>
        <div className="flex gap-3 flex-wrap items-start mb-2">
          <label className="flex items-center gap-2 cursor-pointer text-sm font-medium px-4 py-2 rounded-lg shrink-0"
            style={{ backgroundColor: "var(--color-surface-tint)", color: "var(--color-brand-800)" }}>
            <Upload className="w-3.5 h-3.5" />
            {uploading ? "Uploading…" : fileUrl ? "Replace file" : "Upload file"}
            <input type="file" accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx" className="sr-only" disabled={uploading}
              onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadFile(f); }} />
          </label>
        </div>
        <input
          value={fileUrl}
          onChange={(e) => setFileUrl(e.target.value)}
          placeholder="or paste URL (e.g. https://iciitp.com/...pdf)"
          className={`${inputCls} text-xs font-mono`}
          style={inputStyle}
        />
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className={labelCls} style={labelStyle}>File type</label>
          <select value={fileType} onChange={(e) => setFileType(e.target.value)} className={inputCls} style={inputStyle}>
            {FILE_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div>
          <label className={labelCls} style={labelStyle}>Category</label>
          <select value={category} onChange={(e) => setCategory(e.target.value)} className={inputCls} style={inputStyle}>
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>

      <div>
        <label className={labelCls} style={labelStyle}>Purpose / description</label>
        <input value={purpose} onChange={(e) => setPurpose(e.target.value)} placeholder="Brief description shown below the file title" className={inputCls} style={inputStyle} />
      </div>

      <div className="flex items-center gap-3 pt-2 flex-wrap">
        <button type="submit" disabled={pending || saved || uploading}
          className="text-sm font-semibold px-6 py-2.5 rounded-xl text-white disabled:opacity-60"
          style={{ backgroundColor: "var(--color-brand-800)" }}>
          {pending ? "Saving…" : saved ? <><Check className="w-4 h-4 inline mr-1" />Saved</> : initial ? "Save changes" : "Add download"}
        </button>
        <label
          className="flex items-center gap-2.5 cursor-pointer px-4 py-2.5 rounded-xl border transition-colors"
          style={published
            ? { backgroundColor: "var(--color-surface-tint)", borderColor: "#7bbf3e", color: "var(--color-brand-950)" }
            : { backgroundColor: "#f8f8f8", borderColor: "var(--color-input-border)", color: "var(--color-text-secondary)" }}
        >
          <input type="checkbox" checked={published} onChange={(e) => setPublished(e.target.checked)}
            className="w-4 h-4 rounded" style={{ accentColor: "var(--color-brand-800)" }} />
          <span className="text-sm font-semibold">
            {published ? "Live on website" : "Set live on website"}
          </span>
        </label>
        <button type="button" onClick={() => router.push("/admin/content/downloads")}
          className="text-sm font-medium px-4 py-2.5 rounded-xl" style={{ color: "var(--color-text-secondary)" }}>
          Cancel
        </button>
      </div>
    </form>
  );
}
