"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Upload, Copy, Trash2, Image, FileText, File, FolderOpen,
  RefreshCw, Check, X, Download, Lock, ArrowUpDown,
  ArrowUp, ArrowDown,
} from "lucide-react";
interface MediaItem {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  sizeBytes: number;
  url: string;
  folder: string;
  deletable: boolean;
  uploadedBy: string | null;
  createdAt: string;
}

type Filter = "all" | "images" | "pdfs" | "other";
type SortKey = "name" | "date";
type SortDir = "asc" | "desc";

const FOLDER_LABELS: Record<string, string> = {
  all: "All",
  uploads: "Uploads",
  images: "Images",
  logos: "Logos",
  photos: "Photos",
  root: "Root",
};

function fmtSize(bytes: number): string {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1048576).toFixed(1)} MB`;
}

function fmtDate(iso: string): string {
  try {
    return new Intl.DateTimeFormat("en-IN", {
      day: "numeric", month: "short", year: "numeric",
    }).format(new Date(iso));
  } catch { return iso; }
}

function FileIcon({ mimeType }: { mimeType: string }) {
  if (mimeType?.startsWith("image/")) return <Image className="w-6 h-6" />;
  if (mimeType === "application/pdf") return <FileText className="w-6 h-6" />;
  return <File className="w-6 h-6" />;
}

function SortIcon({ active, dir }: { active: boolean; dir: SortDir }) {
  if (!active) return <ArrowUpDown className="w-3 h-3" />;
  return dir === "asc" ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />;
}

const TYPE_FILTERS: { key: Filter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "images", label: "Images" },
  { key: "pdfs", label: "PDFs" },
  { key: "other", label: "Other" },
];

export function MediaLibrary() {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState<Filter>("all");
  const [folderFilter, setFolderFilter] = useState<string>("all");
  const [sortKey, setSortKey] = useState<SortKey>("date");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  const [preview, setPreview] = useState<MediaItem | null>(null);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/media");
      if (!res.ok) throw new Error("Failed to load");
      const raw: Omit<MediaItem, "folder" | "deletable">[] = await res.json();
      setItems(raw.map((m) => ({
        ...m,
        folder: m.url.startsWith("/uploads/") ? "uploads" : "other",
        deletable: true,
      })));
    } catch {
      setError("Could not load media.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const folders = ["all", ...Array.from(new Set(items.map((i) => i.folder))).sort()];

  const filtered = items
    .filter((item) => {
      const matchesType =
        typeFilter === "all" ||
        (typeFilter === "images" && item.mimeType?.startsWith("image/")) ||
        (typeFilter === "pdfs" && item.mimeType === "application/pdf") ||
        (typeFilter === "other" && !item.mimeType?.startsWith("image/") && item.mimeType !== "application/pdf");
      const matchesFolder = folderFilter === "all" || item.folder === folderFilter;
      return matchesType && matchesFolder;
    })
    .sort((a, b) => {
      let cmp = 0;
      if (sortKey === "name") cmp = a.originalName.localeCompare(b.originalName);
      else cmp = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      return sortDir === "asc" ? cmp : -cmp;
    });

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(key); setSortDir("asc"); }
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError("");
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      const json = await res.json();
      if (!json.url) throw new Error(json.error ?? "Upload failed");
      await load();
      setFolderFilter("uploads");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  async function handleDelete(item: MediaItem) {
    if (!confirm(`Delete "${item.originalName}"? This cannot be undone.`)) return;
    setDeletingId(item.id);
    try {
      const res = await fetch(`/api/admin/media/${encodeURIComponent(item.id)}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Delete failed");
      setItems((prev) => prev.filter((i) => i.id !== item.id));
      if (preview?.id === item.id) setPreview(null);
    } catch {
      setError("Delete failed.");
    } finally {
      setDeletingId(null);
    }
  }

  async function copyUrl(url: string) {
    await navigator.clipboard.writeText(url);
    setCopiedUrl(url);
    setTimeout(() => setCopiedUrl(null), 1800);
  }

  function downloadFile(item: MediaItem) {
    const a = document.createElement("a");
    a.href = item.url;
    a.download = item.originalName;
    a.click();
  }

  const imageCount = items.filter((i) => i.mimeType?.startsWith("image/")).length;
  const pdfCount = items.filter((i) => i.mimeType === "application/pdf").length;

  return (
    <div>
      {/* Stats */}
      <div className="flex gap-3 mb-6 flex-wrap">
        {[
          { label: "Total files", value: items.length },
          { label: "Images", value: imageCount },
          { label: "PDFs", value: pdfCount },
        ].map((s) => (
          <div key={s.label} className="px-4 py-2.5 rounded-xl border text-sm"
            style={{ borderColor: "var(--color-border-subtle)", backgroundColor: "#fff" }}>
            <span className="font-black text-lg mr-1.5" style={{ color: "var(--color-brand-800)" }}>{s.value}</span>
            <span style={{ color: "var(--color-text-secondary)" }}>{s.label}</span>
          </div>
        ))}
      </div>

      {/* Folder tabs */}
      <div className="flex gap-2 mb-4 flex-wrap">
        {folders.map((f) => (
          <button key={f} type="button" onClick={() => setFolderFilter(f)}
            className="px-3 py-1 text-xs font-semibold rounded-full border transition-colors"
            style={folderFilter === f
              ? { backgroundColor: "var(--color-brand-800)", color: "#fff", borderColor: "var(--color-brand-800)" }
              : { backgroundColor: "#fff", color: "var(--color-text-body)", borderColor: "var(--color-input-border)" }}>
            {FOLDER_LABELS[f] ?? f}
          </button>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-2 mb-5 flex-wrap">
        {/* Type filter */}
        <div className="flex rounded-xl overflow-hidden border" style={{ borderColor: "var(--color-input-border)" }}>
          {TYPE_FILTERS.map((f) => (
            <button key={f.key} type="button" onClick={() => setTypeFilter(f.key)}
              className="px-3 py-1.5 text-xs font-semibold transition-colors"
              style={typeFilter === f.key
                ? { backgroundColor: "var(--color-brand-800)", color: "#fff" }
                : { backgroundColor: "#fff", color: "var(--color-text-body)" }}>
              {f.label}
            </button>
          ))}
        </div>

        {/* Sort */}
        <div className="flex rounded-xl overflow-hidden border" style={{ borderColor: "var(--color-input-border)" }}>
          {([["name", "Name"], ["date", "Date"]] as [SortKey, string][]).map(([key, label]) => (
            <button key={key} type="button" onClick={() => toggleSort(key)}
              className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold transition-colors"
              style={sortKey === key
                ? { backgroundColor: "var(--color-surface-tint)", color: "var(--color-brand-800)" }
                : { backgroundColor: "#fff", color: "var(--color-text-body)" }}>
              {label} <SortIcon active={sortKey === key} dir={sortDir} />
            </button>
          ))}
        </div>

        <div className="ml-auto flex items-center gap-2">
          <button type="button" onClick={load}
            className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg"
            style={{ backgroundColor: "var(--color-surface-tint)", color: "var(--color-brand-800)" }}>
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </button>
          <label className="flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-xl cursor-pointer text-white"
            style={{ backgroundColor: "var(--color-brand-800)" }}>
            <Upload className="w-3.5 h-3.5" />
            {uploading ? "Uploading…" : "Upload file"}
            <input type="file" className="sr-only" onChange={handleUpload} disabled={uploading}
              accept="image/*,.pdf,.doc,.docx,.xls,.xlsx" />
          </label>
        </div>
      </div>

      {error && (
        <div className="text-sm px-4 py-3 rounded-xl mb-4"
          style={{ backgroundColor: "var(--color-danger-bg)", color: "var(--color-danger)", border: "1px solid #fecaca" }}>
          {error}
        </div>
      )}

      {/* Grid */}
      {loading ? (
        <div className="text-center py-16 text-sm" style={{ color: "var(--color-text-secondary)" }}>Loading media…</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 rounded-2xl" style={{ border: "1.5px dashed #d4e6c4" }}>
          <FolderOpen className="w-10 h-10 mx-auto mb-3" style={{ color: "#b8d4a0" }} />
          <p className="text-sm font-medium" style={{ color: "var(--color-text-secondary)" }}>No files found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
          {filtered.map((item) => (
            <div key={item.id}
              className="rounded-xl border bg-white flex flex-col overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
              style={{ borderColor: "var(--color-border-subtle)" }}
              onClick={() => setPreview(item)}>
              <div className="relative flex items-center justify-center"
                style={{ aspectRatio: "4/3", backgroundColor: "var(--color-surface-card)" }}>
                {item.mimeType?.startsWith("image/") ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={item.url} alt={item.originalName} className="w-full h-full object-cover" />
                ) : (
                  <div style={{ color: "var(--color-text-secondary)" }}><FileIcon mimeType={item.mimeType} /></div>
                )}
                {!item.deletable && (
                  <span className="absolute top-1.5 right-1.5 p-1 rounded-md"
                    style={{ backgroundColor: "var(--color-surface-tint)" }} title="Site asset — cannot be deleted">
                    <Lock className="w-2.5 h-2.5" style={{ color: "var(--color-text-secondary)" }} />
                  </span>
                )}
              </div>
              <div className="p-2.5 flex flex-col gap-1.5" onClick={(e) => e.stopPropagation()}>
                <p className="text-[11px] font-semibold leading-tight truncate" style={{ color: "var(--color-brand-950)" }}
                  title={item.originalName}>
                  {item.originalName}
                </p>
                <p className="text-[10px]" style={{ color: "var(--color-placeholder)" }}>
                  {[fmtSize(item.sizeBytes), fmtDate(item.createdAt)].filter(Boolean).join(" · ")}
                </p>
                <div className="flex gap-1">
                  <button type="button" onClick={() => copyUrl(item.url)}
                    className="flex-1 flex items-center justify-center gap-1 text-[10px] font-semibold py-1 rounded-lg transition-colors"
                    style={{ backgroundColor: "var(--color-surface-tint)", color: copiedUrl === item.url ? "#16a34a" : "var(--color-brand-800)" }}>
                    {copiedUrl === item.url ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    {copiedUrl === item.url ? "Copied" : "URL"}
                  </button>
                  <button type="button" onClick={() => downloadFile(item)}
                    className="w-6 flex items-center justify-center rounded-lg"
                    style={{ backgroundColor: "var(--color-surface-tint)", color: "var(--color-brand-800)" }}
                    title="Download">
                    <Download className="w-3 h-3" />
                  </button>
                  {item.deletable && (
                    <button type="button" onClick={() => handleDelete(item)}
                      disabled={deletingId === item.id}
                      className="w-6 flex items-center justify-center rounded-lg disabled:opacity-50"
                      style={{ backgroundColor: "var(--color-danger-bg)", color: "var(--color-danger)" }}
                      title="Delete">
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <p className="text-xs mt-8" style={{ color: "var(--color-placeholder)" }}>
        {filtered.length} file{filtered.length !== 1 ? "s" : ""} shown · Click any file to preview · <Lock className="w-2.5 h-2.5 inline" /> = site asset (view only)
      </p>

      {/* Preview modal */}
      {preview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
          onClick={() => setPreview(null)}>
          <div className="relative bg-white rounded-2xl overflow-hidden shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
            style={{ border: "1px solid #dde0d4" }}>
            <div className="flex items-center justify-between px-5 py-3 border-b" style={{ borderColor: "var(--color-border-subtle)" }}>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-bold text-sm truncate" style={{ color: "var(--color-brand-950)" }}>{preview.originalName}</p>
                  {!preview.deletable && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded font-semibold shrink-0"
                      style={{ backgroundColor: "var(--color-surface-tint)", color: "var(--color-text-body)" }}>
                      Site asset
                    </span>
                  )}
                </div>
                <p className="text-xs" style={{ color: "var(--color-text-secondary)" }}>
                  {[fmtSize(preview.sizeBytes), preview.mimeType, preview.folder, fmtDate(preview.createdAt)].filter(Boolean).join(" · ")}
                </p>
              </div>
              <button onClick={() => setPreview(null)} className="ml-3 p-1.5 rounded-lg hover:bg-gray-100 shrink-0">
                <X className="w-4 h-4" />
              </button>
            </div>

            {preview.mimeType?.startsWith("image/") && (
              <div className="flex-1 overflow-hidden flex items-center justify-center p-6"
                style={{ backgroundColor: "var(--color-surface-card)", minHeight: 260 }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={preview.url} alt={preview.originalName}
                  className="max-w-full max-h-[55vh] object-contain rounded-xl shadow" />
              </div>
            )}

            <div className="px-5 py-4">
              <div className="text-xs font-mono mb-3 px-3 py-2 rounded-lg break-all"
                style={{ backgroundColor: "#f3f4f6", color: "#374151" }}>
                {preview.url}
              </div>
              <div className="flex gap-2">
                <button type="button" onClick={() => copyUrl(preview.url)}
                  className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg flex-1 justify-center"
                  style={{ backgroundColor: "var(--color-surface-tint)", color: copiedUrl === preview.url ? "#16a34a" : "var(--color-brand-800)" }}>
                  {copiedUrl === preview.url ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedUrl === preview.url ? "Copied!" : "Copy URL"}
                </button>
                <button type="button" onClick={() => downloadFile(preview)}
                  className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg"
                  style={{ backgroundColor: "var(--color-surface-tint)", color: "var(--color-brand-800)" }}>
                  <Download className="w-3.5 h-3.5" /> Download
                </button>
                {preview.deletable && (
                  <button type="button" onClick={() => handleDelete(preview)}
                    disabled={deletingId === preview.id}
                    className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg disabled:opacity-50"
                    style={{ backgroundColor: "var(--color-danger-bg)", color: "var(--color-danger)" }}>
                    <Trash2 className="w-3.5 h-3.5" /> Delete
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
