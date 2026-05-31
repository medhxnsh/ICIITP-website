import { requireAuth } from "@/lib/auth";
import { getAllCmsStartups, type CmsStartup } from "@/lib/cms/startups";
import { getAllCmsPrograms, type CmsProgramDoc } from "@/lib/cms/programs";
import { Briefcase, Plus, ExternalLink, Download } from "lucide-react";
import Link from "next/link";
import { bulkImportAction } from "./actions";
import { StartupBulkImport } from "@/components/admin/startup-bulk-import";

export const metadata = { title: "Portfolio — IC IITP Admin" };
export const dynamic = "force-dynamic";

const SECTION_LABELS: Record<string, string> = {
  PRE_INCUBATION: "Pre-Incubation",
  INCUBATION: "Incubation",
  ACCELERATION: "Acceleration",
};
const SECTION_ORDER = ["PRE_INCUBATION", "INCUBATION", "ACCELERATION"];

const SECTION_COLORS: Record<string, string> = {
  PRE_INCUBATION: "#0369a1",
  INCUBATION: "var(--color-brand-800)",
  ACCELERATION: "#0f766e",
};

export default async function StartupsListPage() {
  await requireAuth();
  const [all, programs] = await Promise.all([getAllCmsStartups(), getAllCmsPrograms()]);

  const total = all.length;
  const published = all.filter((s) => s.published).length;

  // Group programs by section
  const bySection: Record<string, CmsProgramDoc[]> = {};
  const noSection: CmsProgramDoc[] = [];

  for (const p of programs) {
    if (p.section) {
      (bySection[p.section] ??= []).push(p);
    } else {
      noSection.push(p);
    }
  }

  // Collect all known slugs so we can show "unassigned" startups at the bottom
  const knownSlugs = new Set(programs.map((p) => p.slug));
  const unassigned = all.filter((s) => s.scheme && !knownSlugs.has(s.scheme));

  return (
    <main className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <Briefcase className="w-6 h-6" style={{ color: "var(--color-brand-800)" }} />
        <h1 className="text-2xl font-black" style={{ color: "var(--color-brand-950)" }}>Portfolio</h1>
        <span className="text-xs font-semibold px-2.5 py-1 rounded-full" style={{ backgroundColor: "var(--color-surface-tint)", color: "var(--color-brand-800)" }}>
          {published} of {total} published
        </span>
        <a
          href="/admin/api/export-startups"
          download
          className="ml-auto flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg text-white transition-opacity hover:opacity-90"
          style={{ backgroundColor: "var(--color-brand-800)" }}
        >
          <Download className="w-3.5 h-3.5" aria-hidden="true" />
          Export XLSX
        </a>
      </div>

      <div className="mb-6">
        <StartupBulkImport onImport={bulkImportAction} />
      </div>

      {/* Programs grouped by section */}
      {SECTION_ORDER.map((sectionKey) => {
        const sectionPrograms = bySection[sectionKey];
        if (!sectionPrograms?.length) return null;
        return (
          <div key={sectionKey} className="mb-12">
            <h2 className="text-[11px] font-black uppercase tracking-widest mb-5" style={{ color: "var(--color-text-secondary)" }}>
              {SECTION_LABELS[sectionKey]}
            </h2>
            {sectionPrograms.map((program) => (
              <SchemeBlock
                key={program.slug}
                program={program}
                startups={all.filter((s) => s.scheme === program.slug)}
                color={SECTION_COLORS[sectionKey] ?? "var(--color-brand-800)"}
              />
            ))}
          </div>
        );
      })}

      {/* Programs with no section */}
      {noSection.length > 0 && (
        <div className="mb-12">
          <h2 className="text-[11px] font-black uppercase tracking-widest mb-5" style={{ color: "var(--color-text-secondary)" }}>
            Other Programmes
          </h2>
          {noSection.map((program) => (
            <SchemeBlock
              key={program.slug}
              program={program}
              startups={all.filter((s) => s.scheme === program.slug)}
              color="#475569"
            />
          ))}
        </div>
      )}

      {/* Startups assigned to a scheme that no longer has a matching program */}
      {unassigned.length > 0 && (
        <div className="mb-12">
          <h2 className="text-[11px] font-black uppercase tracking-widest mb-5" style={{ color: "var(--color-text-secondary)" }}>
            Unassigned (scheme not found in programmes)
          </h2>
          <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid #e8f0e0" }}>
            <StartupTable startups={unassigned} />
          </div>
        </div>
      )}
    </main>
  );
}

function SchemeBlock({ program, startups, color }: { program: CmsProgramDoc; startups: CmsStartup[]; color: string }) {
  return (
    <section className="mb-8">
      <div className="flex items-center gap-3 mb-3">
        <span className="text-[11px] font-bold px-2.5 py-1 rounded-full" style={{ backgroundColor: color, color: "white" }}>
          {program.title}
        </span>
        <span className="text-xs" style={{ color: "var(--color-text-secondary)" }}>{startups.length} startups</span>
        <Link
          href={`/admin/content/startups/new?scheme=${program.slug}`}
          className="ml-auto flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg"
          style={{ color: "var(--color-brand-800)", border: "1px solid var(--color-input-border)", backgroundColor: "var(--color-surface-card)" }}
        >
          <Plus className="w-3.5 h-3.5" /> Add to {program.title}
        </Link>
      </div>

      {startups.length === 0 ? (
        <p className="text-xs px-4 py-3 rounded-xl" style={{ color: "var(--color-placeholder)", backgroundColor: "var(--color-surface-card)", border: "1px solid #e8f0e0" }}>
          No startups in this programme yet.
        </p>
      ) : (
        <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid #e8f0e0" }}>
          <StartupTable startups={startups} />
        </div>
      )}
    </section>
  );
}

function StartupTable({ startups }: { startups: CmsStartup[] }) {
  return (
    <table className="w-full text-sm table-fixed">
      <colgroup>
        <col style={{ width: "35%" }} />
        <col style={{ width: "28%" }} />
        <col style={{ width: "13%" }} />
        <col style={{ width: "12%" }} />
        <col style={{ width: "12%" }} />
      </colgroup>
      <thead>
        <tr style={{ backgroundColor: "var(--color-surface-card)", borderBottom: "1px solid #e8f0e0" }}>
          <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--color-text-secondary)" }}>Startup</th>
          <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--color-text-secondary)" }}>Sectors</th>
          <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--color-text-secondary)" }}>Website</th>
          <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--color-text-secondary)" }}>Status</th>
          <th className="px-4 py-3" />
        </tr>
      </thead>
      <tbody className="divide-y" style={{ borderColor: "var(--color-surface-tint)" }}>
        {startups.map((s) => (
          <StartupRow key={s.id} startup={s} />
        ))}
      </tbody>
    </table>
  );
}

function StartupRow({ startup }: { startup: CmsStartup }) {
  return (
    <tr>
      <td className="px-5 py-3.5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg overflow-hidden border shrink-0" style={{ borderColor: "var(--color-border-subtle)" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={startup.logoUrl || "/logo.png"} alt="" className="w-full h-full object-contain p-0.5" />
          </div>
          <div>
            <p className="font-semibold text-sm" style={{ color: "var(--color-brand-950)" }}>{startup.name}</p>
            {startup.tagline && (
              <p className="text-xs line-clamp-1 mt-0.5" style={{ color: "var(--color-text-secondary)" }}>{startup.tagline}</p>
            )}
          </div>
        </div>
      </td>
      <td className="px-4 py-3.5">
        <div className="flex flex-wrap gap-1">
          {startup.sectors.slice(0, 3).map((sec) => (
            <span key={sec} className="text-[10px] px-1.5 py-0.5 rounded border" style={{ backgroundColor: "var(--color-surface-tint)", color: "var(--color-brand-800)", borderColor: "var(--color-input-border)" }}>
              {sec}
            </span>
          ))}
        </div>
      </td>
      <td className="px-4 py-3.5">
        {startup.website ? (
          <a href={startup.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs hover:underline" style={{ color: "var(--color-brand-800)" }}>
            <ExternalLink className="w-3 h-3" /> Visit
          </a>
        ) : (
          <span className="text-xs" style={{ color: "var(--color-placeholder)" }}>—</span>
        )}
      </td>
      <td className="px-4 py-3.5">
        <span
          className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase"
          style={startup.published
            ? { backgroundColor: "#dcfce7", color: "#166534" }
            : { backgroundColor: "#f1f5f9", color: "#64748b" }}
        >
          {startup.published ? "Live" : "Draft"}
        </span>
      </td>
      <td className="px-4 py-3 text-right">
        <Link
          href={`/admin/content/startups/${startup.id}`}
          className="text-xs font-semibold px-3 py-1.5 rounded-lg"
          style={{ color: "var(--color-brand-800)", border: "1px solid var(--color-input-border)", backgroundColor: "var(--color-surface-card)" }}
        >
          Edit
        </Link>
      </td>
    </tr>
  );
}
