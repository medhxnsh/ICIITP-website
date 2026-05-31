"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Upload, Plus, Trash2, FileDown, ChevronDown, ChevronUp } from "lucide-react";
import { useToast } from "@/components/admin/toast-provider";
import type { CmsNotificationDoc } from "@/lib/cms/notifications";
import type { NotificationFormData } from "@/app/admin/(protected)/content/notifications/actions";

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
  if (typeof ts === "string") return ts.slice(0, 10);
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

type DocEntry = { label: string; url: string; type: string };
type RecruitRow = {
  sn: number;
  position: string;
  notificationDate: string;
  deadline: string;
  status: "open" | "closed" | "cancelled";
  documents: DocEntry[];
};
type ProposalRow = {
  sn: number;
  title: string;
  note: string;
  moreDetailsUrl: string;
  detailsUrl: string;
  applicationFormUrl: string;
};

function DocRowEditor({
  docs,
  onChange,
  uploadPath,
}: {
  docs: DocEntry[];
  onChange: (docs: DocEntry[]) => void;
  uploadPath: string;
}) {
  const [uploading, setUploading] = useState(false);
  const inputStyle = { border: "1px solid var(--color-input-border)", color: "var(--color-brand-950)" };

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadFile(file, uploadPath);
      const ext = file.name.split(".").pop()?.toUpperCase() ?? "FILE";
      onChange([...docs, { label: file.name.replace(/\.[^.]+$/, ""), url, type: ext }]);
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  return (
    <div className="space-y-1.5 mt-2">
      {docs.map((doc, i) => (
        <div key={i} className="flex gap-1.5 items-center">
          <input
            value={doc.label}
            onChange={(e) => onChange(docs.map((d, idx) => idx === i ? { ...d, label: e.target.value } : d))}
            placeholder="Label"
            className="flex-1 text-xs rounded px-2 py-1 outline-none focus:ring-1 focus:ring-[--color-brand-500]"
            style={inputStyle}
          />
          <input
            value={doc.url}
            onChange={(e) => onChange(docs.map((d, idx) => idx === i ? { ...d, url: e.target.value } : d))}
            placeholder="URL"
            className="flex-1 text-xs font-mono rounded px-2 py-1 outline-none focus:ring-1 focus:ring-[--color-brand-500]"
            style={inputStyle}
          />
          <select
            value={doc.type}
            onChange={(e) => onChange(docs.map((d, idx) => idx === i ? { ...d, type: e.target.value } : d))}
            className="text-xs rounded px-1.5 py-1 outline-none w-16 focus:ring-1 focus:ring-[--color-brand-500]"
            style={inputStyle}
          >
            <option>PDF</option><option>DOCX</option><option>XLSX</option><option>Link</option>
          </select>
          <button
            type="button"
            onClick={() => onChange(docs.filter((_, idx) => idx !== i))}
            className="p-1 rounded hover:bg-red-50 shrink-0"
            style={{ color: "var(--color-danger)" }}
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      ))}
      <div className="flex gap-2 mt-1">
        <label className="flex items-center gap-1 cursor-pointer text-[10px] font-semibold px-2.5 py-1 rounded-lg"
          style={{ backgroundColor: "var(--color-surface-tint)", color: "var(--color-brand-800)" }}>
          <Upload className="w-3 h-3" />
          {uploading ? "Uploading…" : "Upload"}
          <input type="file" accept=".pdf,.doc,.docx,.xls,.xlsx" className="sr-only" disabled={uploading} onChange={handleUpload} />
        </label>
        <button
          type="button"
          onClick={() => onChange([...docs, { label: "", url: "", type: "PDF" }])}
          className="flex items-center gap-1 text-[10px] font-semibold px-2.5 py-1 rounded-lg"
          style={{ backgroundColor: "var(--color-surface-tint)", color: "var(--color-brand-800)" }}
        >
          <Plus className="w-3 h-3" /> Add link
        </button>
      </div>
    </div>
  );
}

function RecruitmentTableEditor({
  rows,
  onChange,
}: {
  rows: RecruitRow[];
  onChange: (rows: RecruitRow[]) => void;
}) {
  const inputStyle = { border: "1px solid var(--color-input-border)", color: "var(--color-brand-950)" };

  function addRow() {
    onChange([...rows, { sn: rows.length + 1, position: "", notificationDate: "", deadline: "", status: "open", documents: [] }]);
  }
  function removeRow(i: number) {
    onChange(rows.filter((_, idx) => idx !== i).map((r, idx) => ({ ...r, sn: idx + 1 })));
  }
  function updateRow(i: number, patch: Partial<RecruitRow>) {
    onChange(rows.map((r, idx) => idx === i ? { ...r, ...patch } : r));
  }

  return (
    <div className="space-y-3">
      {rows.map((row, i) => (
        <div key={i} className="p-3 rounded-xl" style={{ border: "1px solid var(--color-border-subtle)", backgroundColor: "#fafdf7" }}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold" style={{ color: "var(--color-brand-800)" }}>Row {row.sn}</span>
            <button type="button" onClick={() => removeRow(i)} className="p-1 rounded hover:bg-red-50" style={{ color: "var(--color-danger)" }}>
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="grid sm:grid-cols-2 gap-2 mb-2">
            <div className="sm:col-span-2">
              <input
                value={row.position}
                onChange={(e) => updateRow(i, { position: e.target.value })}
                placeholder="Position title"
                className="w-full text-xs rounded px-2 py-1.5 outline-none focus:ring-1 focus:ring-[--color-brand-500]"
                style={inputStyle}
              />
            </div>
            <input
              value={row.notificationDate}
              onChange={(e) => updateRow(i, { notificationDate: e.target.value })}
              placeholder="Notification date (e.g. 10.07.2024)"
              className="text-xs rounded px-2 py-1.5 outline-none focus:ring-1 focus:ring-[--color-brand-500]"
              style={inputStyle}
            />
            <input
              value={row.deadline}
              onChange={(e) => updateRow(i, { deadline: e.target.value })}
              placeholder="Deadline (e.g. 19.08.2024)"
              className="text-xs rounded px-2 py-1.5 outline-none focus:ring-1 focus:ring-[--color-brand-500]"
              style={inputStyle}
            />
            <select
              value={row.status}
              onChange={(e) => updateRow(i, { status: e.target.value as RecruitRow["status"] })}
              className="text-xs rounded px-2 py-1.5 outline-none focus:ring-1 focus:ring-[--color-brand-500]"
              style={inputStyle}
            >
              <option value="open">Open</option>
              <option value="closed">Closed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          <p className="text-[10px] font-semibold uppercase tracking-wide mb-1" style={{ color: "var(--color-text-secondary)" }}>Documents</p>
          <DocRowEditor
            docs={row.documents}
            onChange={(docs) => updateRow(i, { documents: docs })}
            uploadPath={`notifications/recruitment`}
          />
        </div>
      ))}
      <button
        type="button"
        onClick={addRow}
        className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg"
        style={{ backgroundColor: "var(--color-surface-tint)", color: "var(--color-brand-800)" }}
      >
        <Plus className="w-3.5 h-3.5" /> Add row
      </button>
    </div>
  );
}

function ProposalsTableEditor({
  rows,
  onChange,
}: {
  rows: ProposalRow[];
  onChange: (rows: ProposalRow[]) => void;
}) {
  const inputStyle = { border: "1px solid var(--color-input-border)", color: "var(--color-brand-950)" };

  function addRow() {
    onChange([...rows, { sn: rows.length + 1, title: "", note: "", moreDetailsUrl: "", detailsUrl: "", applicationFormUrl: "" }]);
  }
  function removeRow(i: number) {
    onChange(rows.filter((_, idx) => idx !== i).map((r, idx) => ({ ...r, sn: idx + 1 })));
  }
  function updateRow(i: number, patch: Partial<ProposalRow>) {
    onChange(rows.map((r, idx) => idx === i ? { ...r, ...patch } : r));
  }

  return (
    <div className="space-y-3">
      {rows.map((row, i) => (
        <div key={i} className="p-3 rounded-xl" style={{ border: "1px solid var(--color-border-subtle)", backgroundColor: "#fafdf7" }}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold" style={{ color: "var(--color-brand-800)" }}>Entry {row.sn}</span>
            <button type="button" onClick={() => removeRow(i)} className="p-1 rounded hover:bg-red-50" style={{ color: "var(--color-danger)" }}>
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="space-y-2">
            <input
              value={row.title}
              onChange={(e) => updateRow(i, { title: e.target.value })}
              placeholder="Proposal title"
              className="w-full text-xs rounded px-2 py-1.5 outline-none focus:ring-1 focus:ring-[--color-brand-500]"
              style={inputStyle}
            />
            <input
              value={row.note}
              onChange={(e) => updateRow(i, { note: e.target.value })}
              placeholder="Note (optional)"
              className="w-full text-xs rounded px-2 py-1.5 outline-none focus:ring-1 focus:ring-[--color-brand-500]"
              style={inputStyle}
            />
            <input
              value={row.detailsUrl}
              onChange={(e) => updateRow(i, { detailsUrl: e.target.value })}
              placeholder="Details / PDF URL *"
              className="w-full text-xs font-mono rounded px-2 py-1.5 outline-none focus:ring-1 focus:ring-[--color-brand-500]"
              style={inputStyle}
            />
            <input
              value={row.moreDetailsUrl}
              onChange={(e) => updateRow(i, { moreDetailsUrl: e.target.value })}
              placeholder="More details URL (optional)"
              className="w-full text-xs font-mono rounded px-2 py-1.5 outline-none focus:ring-1 focus:ring-[--color-brand-500]"
              style={inputStyle}
            />
            <input
              value={row.applicationFormUrl}
              onChange={(e) => updateRow(i, { applicationFormUrl: e.target.value })}
              placeholder="Application form URL (optional)"
              className="w-full text-xs font-mono rounded px-2 py-1.5 outline-none focus:ring-1 focus:ring-[--color-brand-500]"
              style={inputStyle}
            />
          </div>
        </div>
      ))}
      <button
        type="button"
        onClick={addRow}
        className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg"
        style={{ backgroundColor: "var(--color-surface-tint)", color: "var(--color-brand-800)" }}
      >
        <Plus className="w-3.5 h-3.5" /> Add entry
      </button>
    </div>
  );
}

interface Props {
  notification?: NotificationFormInput;
  onSave: (data: NotificationFormData) => Promise<{ success: boolean; error?: string }>;
}

export function NotificationForm({ notification, onSave }: Props) {
  const router = useRouter();
  const toast = useToast();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");

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

  const initAttachments = (): Array<{ title: string; url: string; type: string }> => {
    if (notification?.attachments?.length) return notification.attachments;
    if (notification?.attachmentUrl) return [{ title: "Attachment", url: notification.attachmentUrl, type: "PDF" }];
    return [];
  };
  const [attachments, setAttachments] = useState(initAttachments);
  const [attachUploading, setAttachUploading] = useState(false);
  const [imgUploading, setImgUploading] = useState(false);

  const [recruitmentTable, setRecruitmentTable] = useState<RecruitRow[]>(
    () => (notification?.extras?.recruitmentTable as RecruitRow[] | undefined) ?? []
  );
  const [proposalsTable, setProposalsTable] = useState<ProposalRow[]>(
    () => (notification?.extras?.proposalsTable as ProposalRow[] | undefined) ?? []
  );

  const [showRecruit, setShowRecruit] = useState(recruitmentTable.length > 0);
  const [showProposals, setShowProposals] = useState(proposalsTable.length > 0);

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

    const extrasPayload: Record<string, unknown> = {};
    if (recruitmentTable.length > 0) extrasPayload.recruitmentTable = recruitmentTable;
    if (proposalsTable.length > 0) extrasPayload.proposalsTable = proposalsTable;

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
      extras: Object.keys(extrasPayload).length > 0 ? extrasPayload as NotificationFormData["extras"] : undefined,
    };
    startTransition(async () => {
      const result = await onSave(data);
      if (result.success) {
        toast.success("Changes saved", published ? "Notification is live on the website." : "Saved as draft.");
        router.refresh();
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
    <form onSubmit={handleSubmit} className="space-y-8 max-w-2xl">
      {error && (
        <div className="text-sm px-4 py-3 rounded-xl" style={{ backgroundColor: "var(--color-danger-bg)", color: "var(--color-danger)", border: "1px solid #fecaca" }}>
          {error}
        </div>
      )}

      {/* Details */}
      <section>
        <h2 className="text-sm font-black uppercase tracking-wider mb-4" style={{ color: "var(--color-brand-800)" }}>Notification details</h2>
        <div className="space-y-4">
          <div>
            <label className={labelCls} style={labelStyle}>Category</label>
            <input value={category} onChange={(e) => setCategory(e.target.value)}
              placeholder="e.g. Careers, Tender, Scholarship…" className={inputCls} style={inputStyle} />
            <p className="text-xs mt-1" style={{ color: "var(--color-placeholder)" }}>Label shown on the notification listing.</p>
          </div>
          <div>
            <label className={labelCls} style={labelStyle}>Title <span style={{ color: "var(--color-danger)" }}>*</span></label>
            <input value={title} onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Walk-in Interview for Project Scientist" className={inputCls} style={inputStyle} />
          </div>
          <div>
            <label className={labelCls} style={labelStyle}>Body <span style={{ color: "var(--color-danger)" }}>*</span></label>
            <textarea value={body} onChange={(e) => setBody(e.target.value)} rows={8}
              placeholder="Full notification text…" className={`${inputCls} resize-y`} style={inputStyle} />
          </div>
        </div>
      </section>

      {/* Cover Image */}
      <section>
        <h2 className="text-sm font-black uppercase tracking-wider mb-4" style={{ color: "var(--color-brand-800)" }}>Cover image</h2>
        <div className="flex gap-3 flex-wrap items-start">
          {coverImageUrl && (
            <div className="relative w-32 h-20 rounded-lg overflow-hidden border shrink-0" style={{ borderColor: "var(--color-input-border)" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={coverImageUrl} alt="Cover" className="w-full h-full object-cover" />
              <button type="button" onClick={() => setCoverImageUrl("")}
                className="absolute top-1 right-1 w-5 h-5 rounded-full bg-red-600 text-white text-xs font-bold flex items-center justify-center">×</button>
            </div>
          )}
          <label className="flex items-center gap-2 cursor-pointer text-sm font-medium px-4 py-2 rounded-lg shrink-0"
            style={{ backgroundColor: "var(--color-surface-tint)", color: "var(--color-brand-800)" }}>
            <Upload className="w-3.5 h-3.5" />
            {imgUploading ? "Uploading…" : coverImageUrl ? "Replace image" : "Upload image"}
            <input type="file" accept="image/*" className="sr-only" disabled={imgUploading} onChange={handleImageUpload} />
          </label>
          <input value={coverImageUrl} onChange={(e) => setCoverImageUrl(e.target.value)}
            placeholder="or paste image URL" className="flex-1 min-w-48 text-xs font-mono rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-[--color-brand-500]"
            style={inputStyle} />
        </div>
      </section>

      {/* Dates & Contact */}
      <section>
        <h2 className="text-sm font-black uppercase tracking-wider mb-4" style={{ color: "var(--color-brand-800)" }}>Dates &amp; contact</h2>
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
              Custom badge <span className="font-normal" style={{ color: "var(--color-placeholder)" }}>(e.g. "Shortlisted Published", "Interview Scheduled")</span>
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
          <h2 className="text-sm font-black uppercase tracking-wider" style={{ color: "var(--color-brand-800)" }}>Attachments</h2>
          <div className="flex gap-2">
            <label className="flex items-center gap-1.5 cursor-pointer text-xs font-semibold px-3 py-1.5 rounded-lg"
              style={{ backgroundColor: "var(--color-surface-tint)", color: "var(--color-brand-800)" }}>
              <Upload className="w-3.5 h-3.5" />
              {attachUploading ? "Uploading…" : "Upload file"}
              <input type="file" accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.zip" className="sr-only"
                disabled={attachUploading} onChange={handleFileUpload} />
            </label>
            <button type="button" onClick={() => setAttachments((prev) => [...prev, { title: "", url: "", type: "PDF" }])}
              className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg"
              style={{ backgroundColor: "var(--color-surface-tint)", color: "var(--color-brand-800)" }}>
              <Plus className="w-3.5 h-3.5" /> Add link
            </button>
          </div>
        </div>
        <p className="text-xs mb-3" style={{ color: "var(--color-text-secondary)" }}>
          Simple file links shown at the bottom of the notification page. For tabular recruitment or proposal lists, use the sections below.
        </p>

        {attachments.length === 0 ? (
          <p className="text-xs py-4 text-center rounded-lg" style={{ color: "var(--color-placeholder)", border: "1px dashed #d4e6c4" }}>
            No attachments — upload a file or add a URL link above.
          </p>
        ) : (
          <div className="space-y-2">
            {attachments.map((a, i) => (
              <div key={i} className="flex gap-2 items-center p-3 rounded-lg" style={{ border: "1px solid var(--color-border-subtle)", backgroundColor: "#fafdf7" }}>
                <FileDown className="w-4 h-4 shrink-0" style={{ color: "var(--color-brand-800)" }} />
                <input value={a.title} onChange={(e) => updateAttachment(i, "title", e.target.value)}
                  placeholder="File label" className="flex-1 text-xs rounded px-2 py-1 outline-none min-w-0 focus:ring-2 focus:ring-[--color-brand-500]"
                  style={inputStyle} />
                <input value={a.url} onChange={(e) => updateAttachment(i, "url", e.target.value)}
                  placeholder="URL" className="flex-1 text-xs font-mono rounded px-2 py-1 outline-none min-w-0 focus:ring-2 focus:ring-[--color-brand-500]"
                  style={inputStyle} />
                <select value={a.type} onChange={(e) => updateAttachment(i, "type", e.target.value)}
                  className="text-xs rounded px-2 py-1 outline-none shrink-0 w-20 focus:ring-2 focus:ring-[--color-brand-500]" style={inputStyle}>
                  <option>PDF</option>
                  <option>DOCX</option>
                  <option>XLSX</option>
                  <option>Image</option>
                  <option>ZIP</option>
                  <option>Link</option>
                </select>
                <button type="button" onClick={() => removeAttachment(i)}
                  className="p-1 rounded hover:bg-red-50 shrink-0" style={{ color: "var(--color-danger)" }}>
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Recruitment Table */}
      <section>
        <button
          type="button"
          onClick={() => setShowRecruit((v) => !v)}
          className="w-full flex items-center justify-between py-2"
        >
          <h2 className="text-sm font-black uppercase tracking-wider" style={{ color: "var(--color-brand-800)" }}>
            Recruitment Table
            {recruitmentTable.length > 0 && (
              <span className="ml-2 text-xs font-semibold px-2 py-0.5 rounded-full normal-case tracking-normal"
                style={{ backgroundColor: "var(--color-surface-tint)", color: "var(--color-brand-800)" }}>
                {recruitmentTable.length} row{recruitmentTable.length !== 1 ? "s" : ""}
              </span>
            )}
          </h2>
          {showRecruit ? <ChevronUp className="w-4 h-4" style={{ color: "var(--color-text-secondary)" }} /> : <ChevronDown className="w-4 h-4" style={{ color: "var(--color-text-secondary)" }} />}
        </button>
        {showRecruit && (
          <div className="mt-3">
            <p className="text-xs mb-3" style={{ color: "var(--color-text-secondary)" }}>
              Table shown on the notification detail page for recruitment/careers notices. Each row is one position with its own document links.
            </p>
            <RecruitmentTableEditor rows={recruitmentTable} onChange={setRecruitmentTable} />
          </div>
        )}
      </section>

      {/* Proposals Table */}
      <section>
        <button
          type="button"
          onClick={() => setShowProposals((v) => !v)}
          className="w-full flex items-center justify-between py-2"
        >
          <h2 className="text-sm font-black uppercase tracking-wider" style={{ color: "var(--color-brand-800)" }}>
            Proposals / Tender Table
            {proposalsTable.length > 0 && (
              <span className="ml-2 text-xs font-semibold px-2 py-0.5 rounded-full normal-case tracking-normal"
                style={{ backgroundColor: "var(--color-surface-tint)", color: "var(--color-brand-800)" }}>
                {proposalsTable.length} entr{proposalsTable.length !== 1 ? "ies" : "y"}
              </span>
            )}
          </h2>
          {showProposals ? <ChevronUp className="w-4 h-4" style={{ color: "var(--color-text-secondary)" }} /> : <ChevronDown className="w-4 h-4" style={{ color: "var(--color-text-secondary)" }} />}
        </button>
        {showProposals && (
          <div className="mt-3">
            <p className="text-xs mb-3" style={{ color: "var(--color-text-secondary)" }}>
              Table for Call for Proposals or tender notices. Each entry links to a details PDF and optional application form.
            </p>
            <ProposalsTableEditor rows={proposalsTable} onChange={setProposalsTable} />
          </div>
        )}
      </section>

      {/* Publish */}
      <div className="flex items-center gap-3 pt-2 flex-wrap">
        <button type="submit" disabled={pending || attachUploading || imgUploading}
          className="text-sm font-semibold px-6 py-2.5 rounded-xl text-white disabled:opacity-60"
          style={{ backgroundColor: "var(--color-brand-800)" }}>
          {pending ? "Saving…" : notification ? "Save changes" : "Create notification"}
        </button>
        <label className="flex items-center gap-2.5 cursor-pointer px-4 py-2.5 rounded-xl border transition-colors"
          style={published
            ? { backgroundColor: "var(--color-surface-tint)", borderColor: "#7bbf3e", color: "var(--color-brand-950)" }
            : { backgroundColor: "#f8f8f8", borderColor: "var(--color-input-border)", color: "var(--color-text-secondary)" }}>
          <input type="checkbox" checked={published} onChange={(e) => setPublished(e.target.checked)}
            className="w-4 h-4 rounded" style={{ accentColor: "var(--color-brand-800)" }} />
          <span className="text-sm font-semibold">{published ? "Live on website" : "Set live on website"}</span>
        </label>
        <button type="button" onClick={() => router.push("/admin/content/notifications")}
          className="text-sm font-medium px-4 py-2.5 rounded-xl" style={{ color: "var(--color-text-secondary)" }}>
          Cancel
        </button>
      </div>

    </form>
  );
}
