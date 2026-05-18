import { requireAuth } from "@/lib/auth";
import { getSubmissions, type SubmissionType } from "@/lib/submissions";
import { fmtDate } from "@/lib/format";
import { updateStatusDirect } from "@/app/actions/submit";
import { ClipboardList } from "lucide-react";

export const metadata = { title: "Applications — IC IITP Admin" };
export const dynamic = "force-dynamic";

const TYPES: { value: SubmissionType | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "incubation", label: "Incubation" },
  { value: "lab-access", label: "Lab access" },
  { value: "internship", label: "Internship" },
  { value: "feedback", label: "Feedback" },
  { value: "careers", label: "Careers" },
  { value: "contact", label: "Contact" },
];

const STATUS_STYLES: Record<string, { bg: string; text: string }> = {
  pending:   { bg: "#fff7ed", text: "#c2410c" },
  reviewing: { bg: "#eff6ff", text: "#1d4ed8" },
  accepted:  { bg: "#f0f7e6", text: "#3a5214" },
  rejected:  { bg: "#fef2f2", text: "#b91c1c" },
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
  await requireAuth();
  const { type } = await searchParams;
  const activeType = TYPES.find((t) => t.value === type)?.value ?? "all";

  const submissions = await getSubmissions(
    activeType === "all" ? undefined : (activeType as SubmissionType),
    200
  );

  return (
    <main className="p-8 max-w-6xl">
      <div className="flex items-center gap-3 mb-8">
        <ClipboardList className="w-6 h-6" style={{ color: "#3a5214" }} />
        <h1 className="text-2xl font-black" style={{ color: "#1c2e06" }}>Applications</h1>
        <span
          className="ml-auto text-xs font-semibold px-2.5 py-1 rounded-full"
          style={{ backgroundColor: "#f0f7e6", color: "#3a5214" }}
        >
          {submissions.length} records
        </span>
      </div>

      {/* Filter tabs */}
      <nav className="flex gap-1 mb-6 rounded-xl p-1 w-fit" style={{ backgroundColor: "#f0f7e6" }}>
        {TYPES.map((t) => (
          <a
            key={t.value}
            href={t.value === "all" ? "?" : `?type=${t.value}`}
            className="text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
            style={activeType === t.value
              ? { backgroundColor: "#3a5214", color: "white" }
              : { color: "#5a7c20" }
            }
          >
            {t.label}
          </a>
        ))}
      </nav>

      {submissions.length === 0 && (
        <p className="text-sm py-12 text-center" style={{ color: "#7a8e6a" }}>No submissions yet.</p>
      )}

      <div className="space-y-3">
        {submissions.map((sub) => {
          const s = sub as unknown as Record<string, unknown>;
          const statusStyle = STATUS_STYLES[sub.status] ?? STATUS_STYLES.pending;
          return (
            <details
              key={sub.id}
              className="rounded-xl bg-white overflow-hidden group"
              style={{ border: "1px solid #e8f0e0" }}
            >
              <summary className="flex items-center gap-4 px-5 py-4 cursor-pointer list-none">
                <span
                  className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide shrink-0"
                  style={{ backgroundColor: "#f0f7e6", color: "#3a5214" }}
                >
                  {sub.type}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold truncate" style={{ color: "#1c2e06" }}>
                    {(s.founderName ?? s.name ?? s.email ?? "—") as string}
                  </p>
                  <p className="text-xs truncate" style={{ color: "#7a8e6a" }}>{summary(s)}</p>
                </div>
                <span
                  className="text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0"
                  style={{ backgroundColor: statusStyle.bg, color: statusStyle.text }}
                >
                  {sub.status}
                </span>
                <span className="text-xs shrink-0" style={{ color: "#7a8e6a" }}>
                  {fmtDate(s.createdAt)}
                </span>
              </summary>

              {/* Full details */}
              <div className="px-5 pb-5 pt-3" style={{ borderTop: "1px solid #f0f7e6" }}>
                <dl className="grid sm:grid-cols-2 gap-x-8 gap-y-2 text-sm mb-5">
                  {Object.entries(s)
                    .filter(([k]) => !["id", "status", "createdAt", "updatedAt", "type", "locale"].includes(k))
                    .map(([k, v]) => (
                      <div key={k} className="contents">
                        <dt className="font-medium" style={{ color: "#5a6644" }}>{k}</dt>
                        <dd style={{ color: "#1c2e06" }}>
                          {Array.isArray(v) ? v.join(", ") : String(v ?? "—")}
                        </dd>
                      </div>
                    ))}
                </dl>

                {/* Status update form */}
                <form action={updateStatusDirect} className="flex items-center gap-3">
                  <input type="hidden" name="id" value={sub.id} />
                  <input type="hidden" name="type" value={sub.type} />
                  <select
                    name="status"
                    defaultValue={sub.status}
                    className="text-xs rounded-lg px-2.5 py-1.5 outline-none"
                    style={{ border: "1px solid #d4e6c4", color: "#1c2e06" }}
                  >
                    {["pending", "reviewing", "accepted", "rejected"].map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                  <button
                    type="submit"
                    className="text-xs font-semibold px-3 py-1.5 rounded-lg text-white"
                    style={{ backgroundColor: "#3a5214" }}
                  >
                    Update status
                  </button>
                </form>
              </div>
            </details>
          );
        })}
      </div>
    </main>
  );
}
