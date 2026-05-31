import { requireAuth } from "@/lib/auth";
import { getAllLabs } from "@/lib/cms/labs";
import Link from "next/link";
import { FlaskConical, Pencil } from "lucide-react";
import { fmtDate } from "@/lib/format";

export const metadata = { title: "Labs — IC IITP Admin" };
export const dynamic = "force-dynamic";

export default async function LabsAdminPage() {
  await requireAuth();
  const labs = await getAllLabs();

  return (
    <main className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <FlaskConical className="w-5 h-5" style={{ color: "var(--color-brand-800)" }} aria-hidden="true" />
        <div>
          <h1 className="text-xl font-black" style={{ color: "var(--color-brand-950)" }}>Labs</h1>
          <p className="text-sm mt-0.5" style={{ color: "var(--color-text-secondary)" }}>
            Edit display text for each lab. Equipment lists and technical specs are managed by developers.
          </p>
        </div>
      </div>

      <div className="rounded-2xl border overflow-hidden" style={{ borderColor: "#dde6d0" }}>
        <table className="w-full text-sm table-fixed">
          <colgroup>
            <col style={{ width: "28%" }} />
            <col style={{ width: "44%" }} />
            <col style={{ width: "16%" }} />
            <col style={{ width: "12%" }} />
          </colgroup>
          <thead>
            <tr style={{ backgroundColor: "var(--color-surface-card)", borderBottom: "1px solid #dde6d0" }}>
              <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--color-text-secondary)" }}>Lab</th>
              <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--color-text-secondary)" }}>Tagline</th>
              <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--color-text-secondary)" }}>Last updated</th>
              <th className="px-5 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y" style={{ borderColor: "#eef3e8" }}>
            {labs.map((lab) => (
              <tr key={lab.slug} className="hover:bg-[#fafcf7] transition-colors">
                <td className="px-5 py-3.5">
                  <span className="font-semibold truncate block" style={{ color: "var(--color-brand-950)" }}>{lab.title}</span>
                  <span className="block text-xs mt-0.5 truncate" style={{ color: "var(--color-placeholder)" }}>{lab.slug}</span>
                </td>
                <td className="px-5 py-3.5" style={{ color: "var(--color-text-body)" }}>
                  <span className="line-clamp-2">{lab.tagline ?? <em className="text-gray-400">—</em>}</span>
                </td>
                <td className="px-5 py-3.5 text-xs whitespace-nowrap" style={{ color: "var(--color-placeholder)" }}>
                  {lab.updatedAt ? fmtDate(lab.updatedAt) : "—"}
                </td>
                <td className="px-5 py-3.5 text-right">
                  <Link
                    href={`/admin/content/labs/${lab.slug}`}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border transition-colors hover:bg-[#f0f7e6]"
                    style={{ borderColor: "var(--color-input-border)", color: "var(--color-brand-800)" }}
                  >
                    <Pencil className="w-3 h-3" aria-hidden="true" />
                    Edit
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
