import { requireAuth } from "@/lib/auth";
import { getAllAdminDownloads } from "@/lib/cms/downloads";
import { fmtDate } from "@/lib/format";
import { Download, Plus, ExternalLink } from "lucide-react";
import Link from "next/link";
import { DeleteDownloadButton } from "./_delete-button";

export const metadata = { title: "Downloads — IC IITP Admin" };
export const dynamic = "force-dynamic";

export default async function DownloadsAdminPage() {
  await requireAuth();
  const downloads = await getAllAdminDownloads();

  return (
    <main className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <Download className="w-6 h-6" style={{ color: "var(--color-brand-800)" }} />
        <h1 className="text-2xl font-black" style={{ color: "var(--color-brand-950)" }}>Downloads</h1>
        <span className="text-xs font-semibold px-2.5 py-1 rounded-full" style={{ backgroundColor: "var(--color-surface-tint)", color: "var(--color-brand-800)" }}>
          {downloads.length} files
        </span>
        <Link href="/admin/content/downloads/new" className="ml-auto flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-xl text-white" style={{ backgroundColor: "var(--color-brand-800)" }}>
          <Plus className="w-4 h-4" /> Add file
        </Link>
      </div>

      <div className="flex items-center gap-3 mb-6 px-4 py-3 rounded-xl" style={{ backgroundColor: "var(--color-surface-tint)", border: "1px solid var(--color-input-border)" }}>
        <ExternalLink className="w-4 h-4 shrink-0" style={{ color: "var(--color-brand-800)" }} aria-hidden="true" />
        <p className="text-sm" style={{ color: "var(--color-brand-800)" }}>
          Published files appear live at{" "}
          <a href="/downloads" target="_blank" rel="noopener noreferrer" className="font-semibold underline underline-offset-2">
            iciitp.com/downloads
          </a>
          {" "}— under the category you select. Draft files are hidden from visitors.
        </p>
      </div>

      {downloads.length === 0 ? (
        <div className="text-center py-16 rounded-2xl" style={{ border: "1.5px dashed #d4e6c4" }}>
          <Download className="w-10 h-10 mx-auto mb-3" style={{ color: "#b8d4a0" }} />
          <p className="text-sm font-medium mb-4" style={{ color: "var(--color-text-secondary)" }}>No CMS downloads yet.</p>
          <Link href="/admin/content/downloads/new" className="inline-flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-xl text-white" style={{ backgroundColor: "var(--color-brand-800)" }}>
            <Plus className="w-4 h-4" /> Add file
          </Link>
        </div>
      ) : (
        <div className="rounded-2xl bg-white overflow-hidden" style={{ border: "1px solid #e8f0e0" }}>
          <table className="w-full text-sm table-fixed">
            <colgroup>
              <col style={{ width: "36%" }} />
              <col style={{ width: "15%" }} />
              <col style={{ width: "9%" }} />
              <col style={{ width: "12%" }} />
              <col style={{ width: "12%" }} />
              <col style={{ width: "16%" }} />
            </colgroup>
            <thead>
              <tr style={{ backgroundColor: "var(--color-surface-card)", borderBottom: "1px solid #e8f0e0" }}>
                <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--color-text-secondary)" }}>Title</th>
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--color-text-secondary)" }}>Category</th>
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--color-text-secondary)" }}>Type</th>
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--color-text-secondary)" }}>Added</th>
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--color-text-secondary)" }}>Visibility</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y" style={{ borderColor: "var(--color-surface-tint)" }}>
              {downloads.map((d) => (
                <tr key={d.id}>
                  <td className="px-5 py-3.5">
                    <p className="font-semibold truncate" style={{ color: "var(--color-brand-950)" }}>{d.title}</p>
                    <p className="text-xs mt-0.5 font-mono truncate" style={{ color: "var(--color-placeholder)" }}>{d.fileUrl}</p>
                  </td>
                  <td className="px-4 py-3.5 text-xs truncate" style={{ color: "var(--color-text-body)" }}>{d.category}</td>
                  <td className="px-4 py-3.5">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: "var(--color-surface-tint)", color: "var(--color-brand-800)" }}>
                      {d.fileType}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-xs" style={{ color: "var(--color-text-secondary)" }}>{fmtDate(d.createdAt)}</td>
                  <td className="px-4 py-3.5">
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                      style={d.published
                        ? { backgroundColor: "var(--color-surface-tint)", color: "var(--color-brand-800)" }
                        : { backgroundColor: "#f1f5f9", color: "#64748b" }}>
                      {d.published ? "Published" : "Draft"}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-2 justify-end">
                      <Link href={`/admin/content/downloads/${d.id}`}
                        className="text-xs font-medium px-3 py-1.5 rounded-lg"
                        style={{ backgroundColor: "var(--color-surface-tint)", color: "var(--color-brand-800)" }}>
                        Edit
                      </Link>
                      <DeleteDownloadButton id={d.id} title={d.title} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
