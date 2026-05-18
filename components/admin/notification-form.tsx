"use client";
/**
 * Admin form for creating and editing CMS notifications.
 * Accepts both live Firestore Timestamp and serialized {_seconds, _nanoseconds} shapes.
 */
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Upload, Plus, Trash2, FileDown, Check } from "lucide-react";
import type { CmsNotificationDoc } from "@/lib/cms/notifications";
import type { NotificationFormData } from "@/app/admin/(protected)/content/notifications/actions";

/**
 * The form accepts either a live Firestore doc (with Timestamp instances) OR
 * its serialized shape (with `{_seconds,_nanoseconds}`) so the same component
 * can be reused from server pages that have to plain-serialize Timestamps
 * before crossing the server→client boundary.
 */
type SerializedTimestamp = { _seconds: number; _nanoseconds: number } | null;
export type NotificationFormInput =
  Omit<CmsNotificationDoc, "deadline" | "validFrom" | "createdAt" | "updatedAt"> & {
    deadline: CmsNotificationDoc["deadline"] | SerializedTimestamp;
    validFrom: CmsNotificationDoc["validFrom"] | SerializedTimestamp;
    createdAt: CmsNotificationDoc["createdAt"] | SerializedTimestamp;
    updatedAt: CmsNotificationDoc["updatedAt"] | SerializedTimestamp;
  };

function tsToDate(ts: unknown): string {
  if (!ts) return "";
  if (typeof ts === "object" && ts !== null && "toDate" in ts)
    return (ts as { toDate: () => Date }).toDate().toISOString().slice(0, 10);
  if (typeof ts === "object" && ts !== null && "_seconds" in ts)
    return new Date((ts as { _seconds: number })._seconds * 1000).toISOString().slice(0, 10);
  return "";
}

async function uploadFile(file: File, pathPrefix: string): Promise<string> {
  const fd = new FormData();
  fd.append("file", file);
  fd.append("path", `${pathPrefix}/${Date.now()}-${file.name}`);
  const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
  const { url } = await res.json();
  return url ?? "";
}

interface Props {
  notification?: NotificationFormInput;
  onSave: (data: NotificationFormData) => Promise<{ success: boolean; error?: string }>;
}

export function NotificationForm({ notification, onSave }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  const [category, setCategory] = useState(notification?.category ?? notification?.type ?? "");
  const [title, setTitle] = useState(notification?.title ?? "");
  const [body, setBody] = useState(notification?.body ?? "");
  const [deadline, setDeadline] = useState(tsToDate(notification?.deadline));
  const [validFrom, setValidFrom] = useState(tsToDate(notification?.validFrom));
  const [contactEmail, setContactEmail] = useState(notification?.contactEmail ?? "");
  const [externalUrl, setExternalUrl] = useState(notification?.externalUrl ?? "");
  const [coverImageUrl, setCoverImageUrl] = useState(notification?.coverImageUrl ?? "");
  const [customBadge, setCustomBadge] = useState(notification?.customBadge ?? "");
  const [published, setPublished] = useState(notification?.published ?? false);

  // Merge legacy single attachmentUrl into attachments array
  const initAttachments = (): Array<{ title: string; url: string; type: string }> => {
    if (notification?.attachments?.length) return notification.attachments;
    if (notification?.attachmentUrl) return [{ title: "Attachment", url: notification.attachmentUrl, type: "PDF" }];
    return [];
  };
  const [attachments, setAttachments] = useState(initAttachments);
  const [attachUploading, setAttachUploading] = useState(false);
  const [imgUploading, setImgUploading] = useState(false);

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setAttachUploading(true);
    try {
      const url = await uploadFile(file, "notifications/files");
      const ext = file.name.split(".").pop()?.toUpperCase() ?? "FILE";
      setAttachments((prev) => [...prev, { title: file.name.replace(/\.[^.]+$/, ""), url, type: ext }]);
    } finally {
      setAttachUploading(false);
      e.target.value = "";
    }
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImgUploading(true);
    try {
      const url = await uploadFile(file, "notifications/images");
      setCoverImageUrl(url);
    } finally {
      setImgUploading(false);
      e.target.value = "";
    }
  }

  function updateAttachment(i: number, field: "title" | "url" | "type", val: string) {
    setAttachments((prev) => prev.map((a, idx) => idx === i ? { ...a, [field]: val } : a));
  }

  function removeAttachment(i: number) {
    setAttachments((prev) => prev.filter((_, idx) => idx !== i));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!title.trim()) { setError("Title is required."); return; }
    if (!body.trim()) { setError("Body is required."); return; }
    const data: NotificationFormData = {
      category: category.trim(),
      title: title.trim(),
      body: body.trim(),
      deadline: deadline || null,
      validFrom: validFrom || null,
      contactEmail: contactEmail.trim(),
      externalUrl: externalUrl.trim(),
      attachmentUrl: attachments[0]?.url ?? "",
      attachments: attachments.filter((a) => a.url.trim()),
      coverImageUrl: coverImageUrl.trim(),
      customBadge: customBadge.trim() || undefined,
      published,
    };
    startTransition(async () => {
      const result = await onSave(data);
      if (result.success) {
        setSaved(true);
        setTimeout(() => { router.push("/admin/content/notifications"); router.refresh(); }, 800);
      } else {
        setError(result.error ?? "Something went wrong.");
      }
    });
  }

  const inputCls = "w-full text-sm rounded-lg px-3 py-2 outline-none";
  const inputStyle = { border: "1px solid #d4e6c4", color: "#1c2e06" };
  const labelCls = "block text-xs font-semibold mb-1.5";
  const labelStyle = { color: "#5a6644" };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-2xl">
      {error && (
        <div className="text-sm px-4 py-3 rounded-xl" style={{ backgroundColor: "#fef2f2", color: "#b91c1c", border: "1px solid #fecaca" }}>
          {error}
        </div>
      )}

      {/* Details */}
      <section>
        <h2 className="text-sm font-black uppercase tracking-wider mb-4" style={{ color: "#3a5214" }}>Notification details</h2>
        <div className="space-y-4">
          <div>
            <label className={labelCls} style={labelStyle}>Category</label>
            <input value={category} onChange={(e) => setCategory(e.target.value)}
              placeholder="e.g. Careers, Tender, Scholarship…" className={inputCls} style={inputStyle} />
            <p className="text-xs mt-1" style={{ color: "#aab89e" }}>Label shown on the notification listing.</p>
          </div>
          <div>
            <label className={labelCls} style={labelStyle}>Title <span style={{ color: "#b91c1c" }}>*</span></label>
            <input value={title} onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Walk-in Interview for Project Scientist" className={inputCls} style={inputStyle} />
          </div>
          <div>
            <label className={labelCls} style={labelStyle}>Body <span style={{ color: "#b91c1c" }}>*</span></label>
            <textarea value={body} onChange={(e) => setBody(e.target.value)} rows={8}
              placeholder="Full notification text…" className={`${inputCls} resize-y`} style={inputStyle} />
          </div>
        </div>
      </section>

      {/* Cover Image */}
      <section>
        <h2 className="text-sm font-black uppercase tracking-wider mb-4" style={{ color: "#3a5214" }}>Cover image</h2>
        <div className="flex gap-3 flex-wrap items-start">
          {coverImageUrl && (
            <div className="relative w-32 h-20 rounded-lg overflow-hidden border shrink-0" style={{ borderColor: "#d4e6c4" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={coverImageUrl} alt="Cover" className="w-full h-full object-cover" />
              <button type="button" onClick={() => setCoverImageUrl("")}
                className="absolute top-1 right-1 w-5 h-5 rounded-full bg-red-600 text-white text-xs font-bold flex items-center justify-center">×</button>
            </div>
          )}
          <label className="flex items-center gap-2 cursor-pointer text-sm font-medium px-4 py-2 rounded-lg shrink-0"
            style={{ backgroundColor: "#f0f7e6", color: "#3a5214" }}>
            <Upload className="w-3.5 h-3.5" />
            {imgUploading ? "Uploading…" : coverImageUrl ? "Replace image" : "Upload image"}
            <input type="file" accept="image/*" className="sr-only" disabled={imgUploading} onChange={handleImageUpload} />
          </label>
          <input value={coverImageUrl} onChange={(e) => setCoverImageUrl(e.target.value)}
            placeholder="or paste image URL" className="flex-1 min-w-48 text-xs font-mono rounded-lg px-3 py-2 outline-none"
            style={inputStyle} />
        </div>
      </section>

      {/* Dates & Contact */}
      <section>
        <h2 className="text-sm font-black uppercase tracking-wider mb-4" style={{ color: "#3a5214" }}>Dates &amp; contact</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className={labelCls} style={labelStyle}>Valid from</label>
            <input type="date" value={validFrom} onChange={(e) => setValidFrom(e.target.value)} className={inputCls} style={inputStyle} />
          </div>
          <div>
            <label className={labelCls} style={labelStyle}>Deadline / Valid to</label>
            <input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} className={inputCls} style={inputStyle} />
          </div>
          <div>
            <label className={labelCls} style={labelStyle}>Contact email</label>
            <input type="email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)}
              placeholder="hr@iitp.ac.in" className={inputCls} style={inputStyle} />
          </div>
          <div>
            <label className={labelCls} style={labelStyle}>External portal URL</label>
            <input type="url" value={externalUrl} onChange={(e) => setExternalUrl(e.target.value)}
              placeholder="https://..." className={inputCls} style={inputStyle} />
          </div>
          <div className="sm:col-span-2">
            <label className={labelCls} style={labelStyle}>
              Custom badge <span className="font-normal" style={{ color: "#aab89e" }}>(e.g. "Shortlisted Published", "Interview Scheduled" — shown alongside auto date badge)</span>
            </label>
            <input
              value={customBadge}
              onChange={(e) => setCustomBadge(e.target.value)}
              placeholder="Leave blank to rely on dates only"
              className={inputCls}
              style={inputStyle}
            />
          </div>
        </div>
      </section>

      {/* Attachments */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-black uppercase tracking-wider" style={{ color: "#3a5214" }}>Attachments</h2>
          <div className="flex gap-2">
            <label className="flex items-center gap-1.5 cursor-pointer text-xs font-semibold px-3 py-1.5 rounded-lg"
              style={{ backgroundColor: "#f0f7e6", color: "#3a5214" }}>
              <Upload className="w-3.5 h-3.5" />
              {attachUploading ? "Uploading…" : "Upload file"}
              <input type="file" accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.zip" className="sr-only"
                disabled={attachUploading} onChange={handleFileUpload} />
            </label>
            <button type="button" onClick={() => setAttachments((prev) => [...prev, { title: "", url: "", type: "PDF" }])}
              className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg"
              style={{ backgroundColor: "#f0f7e6", color: "#3a5214" }}>
              <Plus className="w-3.5 h-3.5" /> Add link
            </button>
          </div>
        </div>

        {attachments.length === 0 ? (
          <p className="text-xs py-4 text-center rounded-lg" style={{ color: "#aab89e", border: "1px dashed #d4e6c4" }}>
            No attachments — upload a file or add a URL link above.
          </p>
        ) : (
          <div className="space-y-2">
            {attachments.map((a, i) => (
              <div key={i} className="flex gap-2 items-center p-3 rounded-lg" style={{ border: "1px solid #e8f0e0", backgroundColor: "#fafdf7" }}>
                <FileDown className="w-4 h-4 shrink-0" style={{ color: "#3a5214" }} />
                <input value={a.title} onChange={(e) => updateAttachment(i, "title", e.target.value)}
                  placeholder="File label" className="flex-1 text-xs rounded px-2 py-1 outline-none min-w-0"
                  style={inputStyle} />
                <input value={a.url} onChange={(e) => updateAttachment(i, "url", e.target.value)}
                  placeholder="URL" className="flex-1 text-xs font-mono rounded px-2 py-1 outline-none min-w-0"
                  style={inputStyle} />
                <select value={a.type} onChange={(e) => updateAttachment(i, "type", e.target.value)}
                  className="text-xs rounded px-2 py-1 outline-none shrink-0 w-20" style={inputStyle}>
                  <option>PDF</option>
                  <option>DOCX</option>
                  <option>XLSX</option>
                  <option>Image</option>
                  <option>ZIP</option>
                  <option>Link</option>
                </select>
                <button type="button" onClick={() => removeAttachment(i)}
                  className="p-1 rounded hover:bg-red-50 shrink-0" style={{ color: "#b91c1c" }}>
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Publish */}
      <div className="flex items-center gap-3 pt-2 flex-wrap">
        <button type="submit" disabled={pending || saved || attachUploading || imgUploading}
          className="text-sm font-semibold px-6 py-2.5 rounded-xl text-white disabled:opacity-60"
          style={{ backgroundColor: "#3a5214" }}>
          {pending ? "Saving…" : saved ? <><Check className="w-4 h-4 inline mr-1" />Saved</> : notification ? "Save changes" : "Create notification"}
        </button>
        <label className="flex items-center gap-2.5 cursor-pointer px-4 py-2.5 rounded-xl border transition-colors"
          style={published
            ? { backgroundColor: "#f0f7e6", borderColor: "#7bbf3e", color: "#1c2e06" }
            : { backgroundColor: "#f8f8f8", borderColor: "#d4e6c4", color: "#7a8e6a" }}>
          <input type="checkbox" checked={published} onChange={(e) => setPublished(e.target.checked)}
            className="w-4 h-4 rounded" style={{ accentColor: "#3a5214" }} />
          <span className="text-sm font-semibold">{published ? "Live on website" : "Set live on website"}</span>
        </label>
        <button type="button" onClick={() => router.push("/admin/content/notifications")}
          className="text-sm font-medium px-4 py-2.5 rounded-xl" style={{ color: "#7a8e6a" }}>
          Cancel
        </button>
      </div>
    </form>
  );
}
