import { requireAuth } from "@/lib/auth";
import { getLabBySlug } from "@/lib/cms/labs";
import { getLabEquipment } from "@/lib/content";
import { notFound } from "next/navigation";
import { LabEditForm } from "./_form";

export const dynamic = "force-dynamic";

interface Props { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const lab = await getLabBySlug(slug).catch(() => null);
  return { title: `Edit ${lab?.title ?? slug} — IC IITP Admin` };
}

export default async function LabEditPage({ params }: Props) {
  await requireAuth();
  const { slug } = await params;

  const lab = await getLabBySlug(slug).catch(() => null);
  if (!lab) notFound();

  const specs = getLabEquipment(slug);

  return (
    <main className="p-8 max-w-2xl">
      <div className="flex items-center gap-3 mb-8">
        <a href="/admin/content/labs" className="text-sm" style={{ color: "var(--color-text-secondary)" }}>← Labs</a>
        <span style={{ color: "var(--color-input-border)" }}>/</span>
        <h1 className="text-xl font-black" style={{ color: "var(--color-brand-950)" }}>{lab.title}</h1>
      </div>

      <LabEditForm lab={lab} />

      <div className="mt-8 rounded-2xl border p-5" style={{ borderColor: "#dde6d0", backgroundColor: "var(--color-surface-card)" }}>
        <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "var(--color-placeholder)" }}>
          Developer-managed (read-only)
        </p>
        <dl className="space-y-2 text-sm" style={{ color: "var(--color-text-body)" }}>
          {specs.area && (
            <div className="flex gap-3">
              <dt className="font-medium w-20 shrink-0" style={{ color: "var(--color-brand-950)" }}>Area</dt>
              <dd>{specs.area}</dd>
            </div>
          )}
          {specs.class && (
            <div className="flex gap-3">
              <dt className="font-medium w-20 shrink-0" style={{ color: "var(--color-brand-950)" }}>Class</dt>
              <dd>{specs.class}</dd>
            </div>
          )}
          <div className="flex gap-3">
            <dt className="font-medium w-20 shrink-0" style={{ color: "var(--color-brand-950)" }}>Equipment</dt>
            <dd>{specs.equipment.length} items</dd>
          </div>
        </dl>
        <p className="text-xs mt-3" style={{ color: "var(--color-placeholder)" }}>
          To change equipment or specs, a developer edits the JSON file and redeploys.
        </p>
      </div>
    </main>
  );
}
