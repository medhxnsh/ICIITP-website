import { requireAuth } from "@/lib/auth";
import { getCmsStartupById } from "@/lib/cms/startups";
import { StartupForm } from "@/components/admin/startup-form";
import { saveStartupAction, deleteStartupAction } from "../actions";
import { Briefcase } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

interface Props { params: Promise<{ id: string }> }

export default async function EditStartupPage({ params }: Props) {
  await requireAuth();
  const { id } = await params;
  const startup = await getCmsStartupById(id);
  if (!startup) notFound();

  const initial = {
    name: startup.name,
    scheme: startup.scheme,
    tagline: startup.tagline ?? "",
    sectors: startup.sectors ?? [],
    founders: startup.founders ?? [],
    website: startup.website ?? "",
    logoUrl: startup.logoUrl ?? "",
    published: startup.published,
    sortOrder: startup.sortOrder ?? 0,
  };

  return (
    <main className="p-8 max-w-3xl">
      <div className="flex items-center gap-3 mb-2">
        <Link href="/admin/content/startups" className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
          ← Portfolio
        </Link>
        <span style={{ color: "var(--color-input-border)" }}>/</span>
        <Briefcase className="w-5 h-5" style={{ color: "var(--color-brand-800)" }} />
        <h1 className="text-xl font-black" style={{ color: "var(--color-brand-950)" }}>{startup.name}</h1>
        {startup.published && (
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full ml-2" style={{ backgroundColor: "#dcfce7", color: "#166534" }}>
            Live
          </span>
        )}
      </div>
      <p className="text-xs mb-8" style={{ color: "var(--color-placeholder)" }}>
        Edit this startup's details. Changes are saved to the database immediately.
      </p>
      <StartupForm
        id={id}
        initial={initial}
        onSave={saveStartupAction}
        onDelete={deleteStartupAction}
      />
    </main>
  );
}
