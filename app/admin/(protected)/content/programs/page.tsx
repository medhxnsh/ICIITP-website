import { requireAuth } from "@/lib/auth";
import { getAllCmsPrograms, type CmsProgramDoc, type ProgramSection } from "@/lib/cms/programs";
import { PROGRAM_CATEGORIES } from "@/lib/programs-config";
import { fmtDate } from "@/lib/format";
import { BookOpen, Plus } from "lucide-react";
import Link from "next/link";
import { ProgramLogo } from "@/components/program-logo";

export const metadata = { title: "Programs — IC IITP Admin" };
export const dynamic = "force-dynamic";

export default async function ProgramsListPage() {
  await requireAuth();
  const programs = await getAllCmsPrograms();

  const bySection: Record<ProgramSection, CmsProgramDoc[]> = {
    PRE_INCUBATION: [],
    INCUBATION: [],
    ACCELERATION: [],
  };
  for (const p of programs) {
    const key = p.section as ProgramSection;
    if (key && key in bySection) bySection[key].push(p);
  }

  return (
    <main className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <BookOpen className="w-6 h-6" style={{ color: "var(--color-brand-800)" }} />
        <h1 className="text-2xl font-black" style={{ color: "var(--color-brand-950)" }}>Programs</h1>
      </div>

      {PROGRAM_CATEGORIES.map((cat) => {
        const list = bySection[cat.sectionKey];
        return (
          <section key={cat.sectionKey} className="mb-8">
            <div className="flex items-center gap-3 mb-3">
              <span
                className="text-xs font-black uppercase tracking-widest"
                style={{ color: cat.accentColor }}
              >
                {cat.title}
              </span>
              <span className="text-xs text-gray-400">{cat.subtitle}</span>
              <span
                className="ml-auto text-xs font-semibold px-2 py-0.5 rounded-full"
                style={{ backgroundColor: cat.accentColor + "18", color: cat.accentColor }}
              >
                {list.length} programmes
              </span>
            </div>

            <div className="rounded-2xl bg-white overflow-hidden" style={{ border: "1px solid #e8f0e0" }}>
              {list.length > 0 && (
                <table className="w-full text-sm table-fixed">
                  <colgroup>
                    <col style={{ width: "40%" }} />
                    <col style={{ width: "14%" }} />
                    <col style={{ width: "14%" }} />
                    <col style={{ width: "16%" }} />
                    <col style={{ width: "16%" }} />
                  </colgroup>
                  <thead>
                    <tr style={{ backgroundColor: "var(--color-surface-card)", borderBottom: "1px solid #e8f0e0" }}>
                      <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--color-text-secondary)" }}>Programme</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--color-text-secondary)" }}>Status</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--color-text-secondary)" }}>Published</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--color-text-secondary)" }}>Last saved</th>
                      <th className="px-4 py-3" />
                    </tr>
                  </thead>
                  <tbody className="divide-y" style={{ borderColor: "var(--color-surface-tint)" }}>
                    {list.map((prog) => (
                      <tr key={prog.slug}>
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-3 min-w-0">
                            <div
                              className="shrink-0 rounded-md overflow-hidden flex items-center justify-center"
                              style={{ width: 36, height: 36, backgroundColor: "var(--color-surface-tint)", border: "1px solid #e8f0e0" }}
                            >
                              <ProgramLogo slug={prog.slug} logoUrl={prog.logoUrl} size={28} />
                            </div>
                            <div className="min-w-0">
                              <p className="font-semibold truncate" style={{ color: "var(--color-brand-950)" }}>{prog.title}</p>
                              <p className="text-xs font-mono mt-0.5 truncate" style={{ color: "var(--color-placeholder)" }}>{prog.slug}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3.5">
                          <span
                            className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide"
                            style={prog.status === "Open"
                              ? { backgroundColor: "var(--color-surface-tint)", color: "var(--color-brand-800)" }
                              : { backgroundColor: "#f1f5f9", color: "#475569" }}
                          >
                            {prog.status ?? "—"}
                          </span>
                        </td>
                        <td className="px-4 py-3.5">
                          <span
                            className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase"
                            style={prog.published
                              ? { backgroundColor: "#dcfce7", color: "#166534" }
                              : { backgroundColor: "#fef9c3", color: "#854d0e" }}
                          >
                            {prog.published ? "Live" : "Draft"}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-xs" style={{ color: "var(--color-text-secondary)" }}>
                          {prog.updatedAt ? fmtDate(prog.updatedAt) : "—"}
                        </td>
                        <td className="px-4 py-3.5 text-right">
                          <Link
                            href={`/admin/content/programs/${prog.slug}`}
                            className="text-xs font-medium px-3 py-1.5 rounded-lg"
                            style={{ backgroundColor: "var(--color-surface-tint)", color: "var(--color-brand-800)" }}
                          >
                            Edit
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
              <div className="px-5 py-3 flex justify-end" style={list.length > 0 ? { borderTop: "1px solid #f0f7e6" } : undefined}>
                <Link
                  href={`/admin/content/programs/new?section=${cat.sectionKey}`}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg text-white"
                  style={{ backgroundColor: "var(--color-brand-800)" }}
                >
                  <Plus className="w-3.5 h-3.5" /> New program
                </Link>
              </div>
            </div>
          </section>
        );
      })}
    </main>
  );
}
