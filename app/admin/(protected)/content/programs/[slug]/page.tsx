import { requireAuth } from "@/lib/auth";
import { getCmsProgramBySlug } from "@/lib/cms/programs";
import { ProgramForm } from "@/components/admin/program-form";
import { saveProgramAction, deleteProgramAction } from "../actions";
import { BookOpen } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

interface Props { params: Promise<{ slug: string }> }

export default async function EditProgramPage({ params }: Props) {
  await requireAuth();
  const { slug } = await params;

  const cms = await getCmsProgramBySlug(slug);

  const initial = {
    published: cms?.published ?? false,
    section: cms?.section,
    images: cms?.images ?? [],
    imageLayout: cms?.imageLayout ?? "banner" as const,
    title: cms?.title ?? "",
    tagline: cms?.tagline ?? "",
    about: cms?.about ?? "",
    status: cms?.status ?? "",
    statusNote: cms?.statusNote ?? "",
    badge: cms?.badge ?? "",
    badgeOther: cms?.badgeOther ?? "",
    funder: cms?.funder ?? "",
    applyUrl: cms?.applyUrl ?? "",
    applicationFormUrl: cms?.applicationFormUrl ?? "",
    equipmentFormUrl: cms?.equipmentFormUrl ?? "",
    contactEmail: cms?.contactEmail ?? "",
    grant: cms?.grant ?? "",
    schemeOutlay: cms?.schemeOutlay ?? "",
    stipend: cms?.stipend ?? "",
    duration: cms?.duration ?? "",
    cardHighlight: cms?.cardHighlight ?? "",
    visibleSections: cms?.visibleSections ?? [],
    eligibility: cms?.eligibility ?? [],
    notEligible: cms?.notEligible ?? [],
    objectives: cms?.objectives ?? [],
    targetAudience: cms?.targetAudience ?? [],
    expectedOutcomes: cms?.expectedOutcomes ?? [],
    support: cms?.support ?? [],
    preferences: cms?.preferences ?? [],
    notes: cms?.notes ?? [],
    disclaimer: cms?.disclaimer ?? [],
  };

  const displayName = cms?.title ?? slug;

  return (
    <main className="p-8 max-w-4xl">
      <div className="flex items-center gap-3 mb-2">
        <Link href="/admin/content/programs" className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
          ← Programs
        </Link>
        <span style={{ color: "var(--color-input-border)" }}>/</span>
        <BookOpen className="w-5 h-5" style={{ color: "var(--color-brand-800)" }} />
        <h1 className="text-xl font-black" style={{ color: "var(--color-brand-950)" }}>{displayName}</h1>
        {cms?.published && (
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full ml-2" style={{ backgroundColor: "#dcfce7", color: "#166534" }}>
            Live
          </span>
        )}
      </div>
      <p className="text-xs mb-8" style={{ color: "var(--color-placeholder)" }}>
        All content for this programme is managed here. Saving stores the current values.
      </p>
      <ProgramForm
        slug={slug}
        initial={initial}
        isStaticBacked={false}
        onSave={saveProgramAction}
        onDelete={cms && !cms.system ? deleteProgramAction : undefined}
      />
    </main>
  );
}
