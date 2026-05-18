"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, Check, ChevronDown, ChevronUp } from "lucide-react";
import type { Notification } from "@/lib/content";
import type { StaticNotificationFormData, RecruitmentEntryInput, RecruitmentDocumentInput, ProposalEntryInput } from "./actions";

interface Props {
  slug: string;
  notification: Notification;
  onSave: (data: StaticNotificationFormData) => Promise<{ success: boolean; error?: string }>;
}

const EMPTY_PROPOSAL: ProposalEntryInput = {
  sn: 0,
  title: "",
  note: "",
  moreDetailsUrl: "",
  detailsUrl: "",
  applicationFormUrl: "",
};

function ProposalRowEditor({
  row,
  index,
  onChange,
  onRemove,
}: {
  row: ProposalEntryInput;
  index: number;
  onChange: (updated: ProposalEntryInput) => void;
  onRemove: () => void;
}) {
  const [open, setOpen] = useState(index === 0);
  const inputCls = "w-full text-sm rounded-lg px-3 py-2 outline-none";
  const inputStyle = { border: "1px solid #d4e6c4", color: "#1c2e06" };

  return (
    <div className="rounded-xl border overflow-hidden" style={{ borderColor: "#d4e6c4" }}>
      <div
        className="flex items-center gap-3 px-4 py-3 cursor-pointer select-none"
        style={{ backgroundColor: "#f9fbf6" }}
        onClick={() => setOpen((v) => !v)}
      >
        <span className="text-xs font-bold w-5 text-center" style={{ color: "#aab89e" }}>{index + 1}</span>
        <span className="flex-1 text-sm font-semibold truncate" style={{ color: "#1c2e06" }}>
          {row.title || <span style={{ color: "#aab89e" }}>Untitled proposal</span>}
        </span>
        <button type="button" onClick={(e) => { e.stopPropagation(); onRemove(); }} className="p-1 rounded hover:bg-red-50" style={{ color: "#b91c1c" }} title="Remove row">
          <Trash2 className="w-3.5 h-3.5" />
        </button>
        {open ? <ChevronUp className="w-4 h-4" style={{ color: "#7a8e6a" }} /> : <ChevronDown className="w-4 h-4" style={{ color: "#7a8e6a" }} />}
      </div>
      {open && (
        <div className="px-4 pb-4 pt-3 space-y-3 border-t" style={{ borderColor: "#e8f0e0" }}>
          <div>
            <label className="block text-xs font-semibold mb-1" style={{ color: "#5a6644" }}>Title</label>
            <input value={row.title} onChange={(e) => onChange({ ...row, title: e.target.value })} placeholder="e.g. Call for applications for DST NIDHI PRAYAS…" className={inputCls} style={inputStyle} />
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1" style={{ color: "#5a6644" }}>Note <span className="font-normal" style={{ color: "#aab89e" }}>(optional small text under title)</span></label>
            <input value={row.note} onChange={(e) => onChange({ ...row, note: e.target.value })} placeholder="e.g. *Use Firefox or Microsoft browser…" className={inputCls} style={inputStyle} />
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold mb-1" style={{ color: "#5a6644" }}>Details PDF URL <span className="font-normal" style={{ color: "#b91c1c" }}>*required</span></label>
              <input value={row.detailsUrl} onChange={(e) => onChange({ ...row, detailsUrl: e.target.value })} placeholder="https://iciitp.com/wp-content/uploads/…" className={inputCls} style={inputStyle} />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1" style={{ color: "#5a6644" }}>More Details URL <span className="font-normal" style={{ color: "#aab89e" }}>(optional orange link)</span></label>
              <input value={row.moreDetailsUrl} onChange={(e) => onChange({ ...row, moreDetailsUrl: e.target.value })} placeholder="https://…" className={inputCls} style={inputStyle} />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1" style={{ color: "#5a6644" }}>Application Form URL <span className="font-normal" style={{ color: "#aab89e" }}>(optional — shown in 3rd column)</span></label>
            <input value={row.applicationFormUrl} onChange={(e) => onChange({ ...row, applicationFormUrl: e.target.value })} placeholder="https://…" className={inputCls} style={inputStyle} />
          </div>
        </div>
      )}
    </div>
  );
}

const EMPTY_DOC: RecruitmentDocumentInput = { label: "", url: "", type: "PDF" };
const EMPTY_ROW: RecruitmentEntryInput = {
  sn: 0,
  position: "",
  notificationDate: "",
  deadline: "",
  status: "open",
  documents: [{ ...EMPTY_DOC }],
};

function DocRow({
  doc,
  onChange,
  onRemove,
}: {
  doc: RecruitmentDocumentInput;
  onChange: (field: keyof RecruitmentDocumentInput, value: string) => void;
  onRemove: () => void;
}) {
  const inputCls = "w-full text-sm rounded-lg px-3 py-2 outline-none";
  const inputStyle = { border: "1px solid #d4e6c4", color: "#1c2e06" };
  return (
    <div className="flex gap-2 items-start">
      <div className="flex-1 grid grid-cols-5 gap-2">
        <input
          value={doc.label}
          onChange={(e) => onChange("label", e.target.value)}
          placeholder="Label (e.g. Notification)"
          className={`${inputCls} col-span-2`}
          style={inputStyle}
        />
        <input
          value={doc.url}
          onChange={(e) => onChange("url", e.target.value)}
          placeholder="https://iciitp.com/wp-content/…"
          className={`${inputCls} col-span-2`}
          style={inputStyle}
        />
        <select value={doc.type} onChange={(e) => onChange("type", e.target.value)} className={inputCls} style={inputStyle}>
          <option>PDF</option>
          <option>DOCX</option>
          <option>XLSX</option>
          <option>Link</option>
          <option>Other</option>
        </select>
      </div>
      <button type="button" onClick={onRemove} className="mt-0.5 p-1.5 rounded-lg hover:bg-red-50" style={{ color: "#b91c1c" }} title="Remove document">
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

function RecruitmentRowEditor({
  row,
  index,
  onChange,
  onRemove,
}: {
  row: RecruitmentEntryInput;
  index: number;
  onChange: (updated: RecruitmentEntryInput) => void;
  onRemove: () => void;
}) {
  const [open, setOpen] = useState(index === 0);
  const inputCls = "w-full text-sm rounded-lg px-3 py-2 outline-none";
  const inputStyle = { border: "1px solid #d4e6c4", color: "#1c2e06" };

  const statusColor = row.status === "open" ? "#15803d" : row.status === "cancelled" ? "#b91c1c" : "#6b7280";

  return (
    <div className="rounded-xl border overflow-hidden" style={{ borderColor: "#d4e6c4" }}>
      {/* Header row */}
      <div
        className="flex items-center gap-3 px-4 py-3 cursor-pointer select-none"
        style={{ backgroundColor: "#f9fbf6" }}
        onClick={() => setOpen((v) => !v)}
      >
        <span className="text-xs font-bold w-5 text-center" style={{ color: "#aab89e" }}>{index + 1}</span>
        <span className="flex-1 text-sm font-semibold truncate" style={{ color: "#1c2e06" }}>
          {row.position || <span style={{ color: "#aab89e" }}>Untitled position</span>}
        </span>
        <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{
          backgroundColor: row.status === "open" ? "#dcfce7" : row.status === "cancelled" ? "#fee2e2" : "#f3f4f6",
          color: statusColor,
        }}>
          {row.status.charAt(0).toUpperCase() + row.status.slice(1)}
        </span>
        <button type="button" onClick={(e) => { e.stopPropagation(); onRemove(); }} className="p-1 rounded hover:bg-red-50" style={{ color: "#b91c1c" }} title="Remove row">
          <Trash2 className="w-3.5 h-3.5" />
        </button>
        {open ? <ChevronUp className="w-4 h-4" style={{ color: "#7a8e6a" }} /> : <ChevronDown className="w-4 h-4" style={{ color: "#7a8e6a" }} />}
      </div>

      {open && (
        <div className="px-4 pb-4 pt-3 space-y-3 border-t" style={{ borderColor: "#e8f0e0" }}>
          {/* Position */}
          <div>
            <label className="block text-xs font-semibold mb-1" style={{ color: "#5a6644" }}>Position / Advertisement Title</label>
            <input value={row.position} onChange={(e) => onChange({ ...row, position: e.target.value })} placeholder="e.g. Various Positions" className={inputCls} style={inputStyle} />
          </div>

          {/* Dates + Status */}
          <div className="grid sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold mb-1" style={{ color: "#5a6644" }}>Notification Date</label>
              <input value={row.notificationDate} onChange={(e) => onChange({ ...row, notificationDate: e.target.value })} placeholder="DD.MM.YYYY or MM.YYYY" className={inputCls} style={inputStyle} />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1" style={{ color: "#5a6644" }}>Last Date (Deadline)</label>
              <input value={row.deadline} onChange={(e) => onChange({ ...row, deadline: e.target.value })} placeholder="DD.MM.YYYY" className={inputCls} style={inputStyle} />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1" style={{ color: "#5a6644" }}>Status</label>
              <select value={row.status} onChange={(e) => onChange({ ...row, status: e.target.value as RecruitmentEntryInput["status"] })} className={inputCls} style={inputStyle}>
                <option value="open">Open</option>
                <option value="closed">Closed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          {/* Documents */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold" style={{ color: "#5a6644" }}>Documents / Links</label>
              <button
                type="button"
                onClick={() => onChange({ ...row, documents: [...row.documents, { ...EMPTY_DOC }] })}
                className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-lg"
                style={{ backgroundColor: "#f0f7e6", color: "#3a5214" }}
              >
                <Plus className="w-3 h-3" /> Add doc
              </button>
            </div>
            <div className="space-y-2">
              {row.documents.map((doc, di) => (
                <DocRow
                  key={di}
                  doc={doc}
                  onChange={(field, value) => {
                    const docs = row.documents.map((d, i) => i === di ? { ...d, [field]: value } : d);
                    onChange({ ...row, documents: docs });
                  }}
                  onRemove={() => onChange({ ...row, documents: row.documents.filter((_, i) => i !== di) })}
                />
              ))}
              {row.documents.length === 0 && (
                <p className="text-xs py-2 text-center rounded-lg" style={{ color: "#aab89e", border: "1px dashed #d4e6c4" }}>
                  No documents — click &ldquo;Add doc&rdquo;.
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function StaticNotificationForm({ slug, notification, onSave }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const [title, setTitle] = useState(notification.title);
  const [summary, setSummary] = useState(notification.summary);
  const [body, setBody] = useState(notification.body);
  const [purpose, setPurpose] = useState(notification.purpose);
  const [validFrom, setValidFrom] = useState(notification.validFrom);
  const [validTo, setValidTo] = useState(notification.validTo);
  const [contactEmail, setContactEmail] = useState(notification.contactEmail ?? "");
  const [externalUrl, setExternalUrl] = useState(notification.externalUrl ?? "");
  const [downloads, setDownloads] = useState<Array<{ title: string; path: string; format: string }>>(
    notification.downloads ?? []
  );
  const [recruitmentTable, setRecruitmentTable] = useState<RecruitmentEntryInput[]>(
    () => (notification.recruitmentTable ?? []).map((row) => ({
      sn: row.sn,
      position: row.position,
      notificationDate: row.notificationDate ?? "",
      deadline: row.deadline ?? "",
      status: row.status,
      documents: row.documents.map((d) => ({ label: d.label, url: d.url, type: d.type })),
    }))
  );
  const [proposalsTable, setProposalsTable] = useState<ProposalEntryInput[]>(
    () => (notification.proposalsTable ?? []).map((row) => ({
      sn: row.sn,
      title: row.title,
      note: row.note ?? "",
      moreDetailsUrl: row.moreDetailsUrl ?? "",
      detailsUrl: row.detailsUrl,
      applicationFormUrl: row.applicationFormUrl ?? "",
    }))
  );

  function addDownload() {
    setDownloads((prev) => [...prev, { title: "", path: "", format: "PDF" }]);
  }
  function removeDownload(i: number) {
    setDownloads((prev) => prev.filter((_, idx) => idx !== i));
  }
  function updateDownload(i: number, field: "title" | "path" | "format", value: string) {
    setDownloads((prev) => prev.map((d, idx) => idx === i ? { ...d, [field]: value } : d));
  }

  function addProposalRow() {
    setProposalsTable((prev) => [...prev, { ...EMPTY_PROPOSAL, sn: prev.length + 1 }]);
  }
  function updateProposalRow(i: number, updated: ProposalEntryInput) {
    setProposalsTable((prev) => prev.map((r, idx) => idx === i ? updated : r));
  }
  function removeProposalRow(i: number) {
    setProposalsTable((prev) => prev.filter((_, idx) => idx !== i));
  }

  function addRecruitmentRow() {
    setRecruitmentTable((prev) => [...prev, { ...EMPTY_ROW, sn: prev.length + 1, documents: [{ ...EMPTY_DOC }] }]);
  }
  function updateRecruitmentRow(i: number, updated: RecruitmentEntryInput) {
    setRecruitmentTable((prev) => prev.map((r, idx) => idx === i ? updated : r));
  }
  function removeRecruitmentRow(i: number) {
    setRecruitmentTable((prev) => prev.filter((_, idx) => idx !== i));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(""); setSaved(false);
    startTransition(async () => {
      const result = await onSave({
        title, summary, body, purpose, validFrom, validTo,
        contactEmail, externalUrl,
        downloads: downloads.filter((d) => d.title.trim() && d.path.trim()),
        recruitmentTable: recruitmentTable.filter((r) => r.position.trim()),
        proposalsTable: proposalsTable.filter((r) => r.title.trim() && r.detailsUrl.trim()),
      });
      if (result.success) { setSaved(true); router.refresh(); }
      else setError(result.error ?? "Something went wrong.");
    });
  }

  const inputCls = "w-full text-sm rounded-lg px-3 py-2 outline-none";
  const inputStyle = { border: "1px solid #d4e6c4", color: "#1c2e06" };
  const labelCls = "block text-xs font-semibold mb-1.5";
  const labelStyle = { color: "#5a6644" };
  const sectionHead = "text-sm font-black uppercase tracking-wider mb-4";

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-3xl">
      {error && (
        <div className="text-sm px-4 py-3 rounded-xl" style={{ backgroundColor: "#fef2f2", color: "#b91c1c", border: "1px solid #fecaca" }}>
          {error}
        </div>
      )}
      {saved && (
        <div className="text-sm px-4 py-3 rounded-xl" style={{ backgroundColor: "#f0f7e6", color: "#3a5214", border: "1px solid #b8d4a0" }}>
          Saved — changes are live on the website.
        </div>
      )}

      {/* Basic info */}
      <section>
        <h2 className={sectionHead} style={{ color: "#3a5214" }}>Basic Information</h2>
        <div className="space-y-4">
          <div>
            <label className={labelCls} style={labelStyle}>Title</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} required className={inputCls} style={inputStyle} />
          </div>
          <div>
            <label className={labelCls} style={labelStyle}>Summary <span className="font-normal" style={{ color: "#aab89e" }}>(shown in lists and meta description)</span></label>
            <textarea value={summary} onChange={(e) => setSummary(e.target.value)} rows={2} className={`${inputCls} resize-y`} style={inputStyle} />
          </div>
          <div>
            <label className={labelCls} style={labelStyle}>Body <span className="font-normal" style={{ color: "#aab89e" }}>(introductory text shown above the table)</span></label>
            <textarea value={body} onChange={(e) => setBody(e.target.value)} rows={6} className={`${inputCls} resize-y font-mono text-xs`} style={inputStyle} />
          </div>
          <div className="grid sm:grid-cols-3 gap-4">
            <div>
              <label className={labelCls} style={labelStyle}>Purpose / Category</label>
              <input value={purpose} onChange={(e) => setPurpose(e.target.value)} className={inputCls} style={inputStyle} />
            </div>
            <div>
              <label className={labelCls} style={labelStyle}>Valid from</label>
              <input type="date" value={validFrom} onChange={(e) => setValidFrom(e.target.value)} className={inputCls} style={inputStyle} />
            </div>
            <div>
              <label className={labelCls} style={labelStyle}>Valid to (deadline)</label>
              <input type="date" value={validTo} onChange={(e) => setValidTo(e.target.value)} className={inputCls} style={inputStyle} />
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className={labelCls} style={labelStyle}>Contact email</label>
              <input type="email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} className={inputCls} style={inputStyle} />
            </div>
            <div>
              <label className={labelCls} style={labelStyle}>External URL</label>
              <input type="url" value={externalUrl} onChange={(e) => setExternalUrl(e.target.value)} placeholder="https://…" className={inputCls} style={inputStyle} />
            </div>
          </div>
        </div>
      </section>

      {/* Proposals table — only for call-for-proposals */}
      {slug === "call-for-proposals" && (
        <section>
          <div className="flex items-center justify-between mb-1">
            <h2 className={sectionHead} style={{ color: "#3a5214", marginBottom: 0 }}>Proposals Table</h2>
            <button
              type="button"
              onClick={addProposalRow}
              className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg"
              style={{ backgroundColor: "#f0f7e6", color: "#3a5214" }}
            >
              <Plus className="w-3.5 h-3.5" /> Add row
            </button>
          </div>
          <p className="text-xs mb-4" style={{ color: "#7a8e6a" }}>
            Each row is one call for proposals shown in the public table with a PDF details link and optional application form link.
          </p>
          {proposalsTable.length === 0 ? (
            <div className="text-center py-8 rounded-xl text-sm" style={{ border: "1px dashed #d4e6c4", color: "#aab89e" }}>
              No proposals yet — click &ldquo;Add row&rdquo;.
            </div>
          ) : (
            <div className="space-y-3">
              {proposalsTable.map((row, i) => (
                <ProposalRowEditor
                  key={i}
                  row={row}
                  index={i}
                  onChange={(updated) => updateProposalRow(i, updated)}
                  onRemove={() => removeProposalRow(i)}
                />
              ))}
            </div>
          )}
        </section>
      )}

      {/* Recruitment table */}
      <section>
        <div className="flex items-center justify-between mb-1">
          <h2 className={sectionHead} style={{ color: "#3a5214", marginBottom: 0 }}>Recruitment Table</h2>
          <button
            type="button"
            onClick={addRecruitmentRow}
            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg"
            style={{ backgroundColor: "#f0f7e6", color: "#3a5214" }}
          >
            <Plus className="w-3.5 h-3.5" /> Add row
          </button>
        </div>
        <p className="text-xs mb-4" style={{ color: "#7a8e6a" }}>
          Each row appears as one entry in the public table — S.No., position, dates, status badge, and download links.
        </p>

        {recruitmentTable.length === 0 ? (
          <div className="text-center py-8 rounded-xl text-sm" style={{ border: "1px dashed #d4e6c4", color: "#aab89e" }}>
            No recruitment entries yet — click &ldquo;Add row&rdquo; to add the first one.
          </div>
        ) : (
          <div className="space-y-3">
            {recruitmentTable.map((row, i) => (
              <RecruitmentRowEditor
                key={i}
                row={row}
                index={i}
                onChange={(updated) => updateRecruitmentRow(i, updated)}
                onRemove={() => removeRecruitmentRow(i)}
              />
            ))}
          </div>
        )}
      </section>

      {/* Legacy downloads */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className={sectionHead} style={{ color: "#3a5214", marginBottom: 0 }}>
            Additional Downloads <span className="text-xs font-normal normal-case" style={{ color: "#aab89e" }}>(optional — separate from the table above)</span>
          </h2>
          <button
            type="button"
            onClick={addDownload}
            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg"
            style={{ backgroundColor: "#f0f7e6", color: "#3a5214" }}
          >
            <Plus className="w-3.5 h-3.5" /> Add file
          </button>
        </div>

        {downloads.length === 0 ? (
          <p className="text-xs py-3 text-center rounded-lg" style={{ color: "#aab89e", border: "1px dashed #d4e6c4" }}>
            No additional downloads.
          </p>
        ) : (
          <div className="space-y-2">
            {downloads.map((d, i) => (
              <div key={i} className="flex gap-2 items-start">
                <div className="flex-1 grid grid-cols-5 gap-2">
                  <input value={d.title} onChange={(e) => updateDownload(i, "title", e.target.value)} placeholder="Label" className={`${inputCls} col-span-2`} style={inputStyle} />
                  <input value={d.path} onChange={(e) => updateDownload(i, "path", e.target.value)} placeholder="/pdfs/filename.pdf" className={`${inputCls} col-span-2`} style={inputStyle} />
                  <select value={d.format} onChange={(e) => updateDownload(i, "format", e.target.value)} className={inputCls} style={inputStyle}>
                    <option>PDF</option><option>DOCX</option><option>XLSX</option><option>ZIP</option><option>Other</option>
                  </select>
                </div>
                <button type="button" onClick={() => removeDownload(i)} className="mt-0.5 p-1.5 rounded-lg hover:bg-red-50" style={{ color: "#b91c1c" }} title="Remove">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      <div className="flex items-center gap-3 pt-2">
        <button
          type="submit"
          disabled={pending || saved}
          className="text-sm font-semibold px-6 py-2.5 rounded-xl text-white disabled:opacity-60"
          style={{ backgroundColor: "#3a5214" }}
        >
          {pending ? "Saving…" : saved ? <><Check className="w-4 h-4 inline mr-1" />Saved</> : "Save changes"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/admin/content/notifications")}
          className="text-sm font-medium px-4 py-2.5 rounded-xl"
          style={{ color: "#7a8e6a" }}
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
