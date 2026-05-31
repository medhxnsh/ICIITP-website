import { requirePermission } from "@/lib/auth";
import { getSubmissions, type SubmissionType } from "@/lib/submissions";
import { fmtDate } from "@/lib/format";
import { DeleteApplicationButton } from "./_delete-button";
import { StatusUpdater } from "./_status-updater";
import { ClipboardList, Download } from "lucide-react";

export const metadata = { title: "Applications — IC IITP Admin" };
export const dynamic = "force-dynamic";

const TYPE_COLORS: Record<string, { bg: string; text: string; activeBg: string; activeText: string; border: string }> = {
  all:          { bg: "#e8f2e0", text: "#3a5c28", activeBg: "#3d5c22", activeText: "#f5faf0", border: "#3d5c22" },
  incubation:   { bg: "#dde8f5", text: "#3d5a80", activeBg: "#3d5a80", activeText: "#eef3fb", border: "#3d5a80" },
  "lab-access": { bg: "#ddf0e8", text: "#2d6b50", activeBg: "#2d6b50", activeText: "#eef8f3", border: "#2d6b50" },
  internship:   { bg: "#ede4f0", text: "#6b4f7c", activeBg: "#6b4f7c", activeText: "#f7f3fa", border: "#6b4f7c" },
  feedback:     { bg: "#f2e8e2", text: "#7a4f3a", activeBg: "#7a4f3a", activeText: "#faf4f0", border: "#7a4f3a" },
  contact:      { bg: "#ddeee9", text: "#2e6358", activeBg: "#2e6358", activeText: "#eef7f5", border: "#2e6358" },
};

const TYPES: { value: SubmissionType | "all"; label: string }[] = [
  { value: "all",        label: "All" },
  { value: "incubation", label: "Incubation" },
  { value: "lab-access", label: "Lab access" },
  { value: "internship", label: "Internship" },
  { value: "feedback",   label: "Feedback" },
  { value: "contact",    label: "Contact" },
];

const STATUS_STYLES: Record<string, { bg: string; text: string }> = {
  pending:   { bg: "#fff7ed", text: "#c2410c" },
  reviewing: { bg: "#eff6ff", text: "#1d4ed8" },
  accepted:  { bg: "var(--color-surface-tint)", text: "var(--color-brand-800)" },
  rejected:  { bg: "var(--color-danger-bg)", text: "var(--color-danger)" },
};


function summary(sub: Record<string, unknown>): string {
  const t = sub.type as string;
  if (t === "incubation") return `${sub.startupName ?? ""} · ${sub.scheme ?? ""} · ${sub.stage ?? ""}`;
  if (t === "lab-access") return `${sub.affiliation ?? ""} → ${sub.lab ?? ""}${sub.preferredDates ? ` · ${sub.preferredDates}` : ""}`;
  if (t === "contact") return `${sub.purpose ?? ""}`;
  if (t === "internship") return `${sub.college ?? ""} · ${sub.area ?? ""} · ${sub.duration ?? ""}`;
  if (t === "feedback") return (sub.message as string)?.slice(0, 80) ?? "";
  return "";
}

interface PageProps { searchParams: Promise<{ type?: string }> }

export default async function ApplicationsPage({ searchParams }: PageProps) {
  await requirePermission("applications");
  const { type } = await searchParams;
  const activeType = TYPES.find((t) => t.value === type)?.value ?? "all";

  const submissions = await getSubmissions(
    activeType === "all" ? undefined : (activeType as SubmissionType),
    200
  );

  return (
    <main className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <ClipboardList className="w-6 h-6" style={{ color: "var(--color-brand-800)" }} />
        <h1 className="text-2xl font-black" style={{ color: "var(--color-brand-950)" }}>Applications</h1>
        <span
          className="ml-auto text-xs font-semibold px-2.5 py-1 rounded-full"
          style={{ backgroundColor: "var(--color-surface-tint)", color: "var(--color-brand-800)" }}
        >
          {submissions.length} records
        </span>
        <a
          href={activeType === "all" ? "/admin/api/export" : `/admin/api/export?type=${activeType}`}
          className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg text-white transition-opacity hover:opacity-90"
          style={{ backgroundColor: "var(--color-brand-800)" }}
          download
        >
          <Download className="w-3.5 h-3.5" aria-hidden="true" />
          Export XLSX
        </a>
      </div>

      {/* Filter tabs */}
      <nav className="flex flex-wrap gap-1.5 mb-5">
        {TYPES.map((t) => {
          const c = TYPE_COLORS[t.value] ?? TYPE_COLORS.all;
          const isActive = activeType === t.value;
          return (
            <a
              key={t.value}
              href={t.value === "all" ? "?" : `?type=${t.value}`}
              className="text-xs font-semibold px-3.5 py-1.5 rounded-full transition-colors"
              style={isActive
                ? { backgroundColor: c.activeBg, color: c.activeText }
                : { backgroundColor: c.bg, color: c.text }
              }
            >
              {t.label}
            </a>
          );
        })}
      </nav>

      {submissions.length === 0 && (
        <p className="text-sm py-12 text-center" style={{ color: "var(--color-text-secondary)" }}>No submissions yet.</p>
      )}

      <div className="space-y-3">
        {submissions.map((sub) => {
          const s = sub as unknown as Record<string, unknown>;
          const statusStyle = STATUS_STYLES[sub.status] ?? STATUS_STYLES.pending;
          const typeColor = TYPE_COLORS[sub.type] ?? TYPE_COLORS.all;
          return (
            <details
              key={sub.id}
              className="rounded-xl bg-white overflow-hidden group"
              style={{ border: "1px solid #e4edd9", borderTop: `3px solid ${typeColor.border}` }}
            >
              <summary className="flex items-center gap-4 px-5 py-4 cursor-pointer list-none">
                <span
                  className="text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wide shrink-0"
                  style={{ backgroundColor: typeColor.bg, color: typeColor.text }}
                >
                  {sub.type}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold truncate" style={{ color: "var(--color-brand-950)" }}>
                    {(s.founderName ?? s.name ?? s.email ?? "—") as string}
                  </p>
                  <p className="text-xs truncate" style={{ color: "var(--color-text-secondary)" }}>{summary(s)}</p>
                </div>
                <span
                  className="text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0"
                  style={{ backgroundColor: statusStyle.bg, color: statusStyle.text }}
                >
                  {sub.status}
                </span>
                <span className="text-xs shrink-0" style={{ color: "var(--color-text-secondary)" }}>
                  {fmtDate(s.createdAt)}
                </span>
              </summary>

              {/* Full details */}
              <div className="px-5 pb-5 pt-4" style={{ borderTop: "1px solid #f0f7e6" }}>
                <table className="w-full text-sm table-fixed mb-5 rounded-xl overflow-hidden" style={{ border: "1px solid #e4edd9" }}>
                  <colgroup>
                    <col style={{ width: "30%" }} />
                    <col style={{ width: "70%" }} />
                  </colgroup>
                  <tbody>
                    {Object.entries(s)
                      .filter(([k]) => !["id", "status", "createdAt", "updatedAt", "type", "locale"].includes(k))
                      .map(([k, v], i) => (
                        <tr key={k} style={{ backgroundColor: i % 2 === 0 ? "#fafdf7" : "white", borderBottom: "1px solid #eef4e6" }}>
                          <td className="px-4 py-2.5 font-medium text-xs capitalize whitespace-nowrap" style={{ color: "var(--color-text-secondary)" }}>
                            {k.replace(/([A-Z])/g, " $1").replace(/-/g, " ")}
                          </td>
                          <td className="px-4 py-2.5 text-xs break-words" style={{ color: "var(--color-brand-950)" }}>
                            {Array.isArray(v) ? v.join(", ") : String(v ?? "—")}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>

                <div className="flex items-center justify-between gap-4 flex-wrap">
                  <StatusUpdater
                    id={sub.id}
                    submissionType={sub.type}
                    currentStatus={sub.status as "pending" | "reviewing" | "accepted" | "rejected"}
                  />
                  <DeleteApplicationButton id={sub.id} />
                </div>
              </div>
            </details>
          );
        })}
      </div>
    </main>
  );
}
