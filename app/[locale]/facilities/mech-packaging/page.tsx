import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { getLabEquipment } from "@/lib/content";
import { getLabBySlug } from "@/lib/cms/labs";
import { LabSpecTable } from "@/components/lab-spec-table";
import { Breadcrumb } from "@/components/breadcrumb";
import { LabPhotoGallery } from "@/components/lab-photo-gallery";
import { FlaskConical } from "lucide-react";

interface Props { params: Promise<{ locale: string }> }

const SLUG = "mech-packaging";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  void locale;
  const lab = await getLabBySlug(SLUG);
  return { title: lab.title, description: lab.tagline };
}

export default async function LabPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const [lab, specs] = await Promise.all([
    getLabBySlug(SLUG).catch(() => null),
    Promise.resolve(getLabEquipment(SLUG)),
  ]);
  if (!lab) notFound();

  return (
    <div style={{ backgroundColor: "var(--color-surface)" }}>
      <div className="relative overflow-hidden" style={{ background: "linear-gradient(160deg, var(--color-hero-from) 0%, var(--color-hero-via) 60%, var(--color-hero-to) 100%)" }}>
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true"
          style={{ backgroundImage: "radial-gradient(circle, #ffffff07 1px, transparent 1px)", backgroundSize: "24px 24px" }} />
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full pointer-events-none" aria-hidden="true"
          style={{ background: "radial-gradient(circle, #f7942020 0%, transparent 65%)" }} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-20 relative z-10">
          <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Facilities", href: "/facilities" }, { label: lab.title }]} variant="light" />
          <p className="text-xs font-semibold uppercase tracking-widest mb-4 text-orange-200">
            <FlaskConical className="w-3.5 h-3.5 inline mr-1.5 -mt-0.5" aria-hidden="true" />
            IC IITP Laboratory
          </p>
          <h1 className="text-2xl sm:text-4xl lg:text-6xl font-black text-white leading-tight mb-4">{lab.title}</h1>
          <p className="text-white/80 text-lg max-w-lg">{lab.tagline}</p>
          <div className="mt-5 flex gap-2 flex-wrap">
            {specs?.area && <span className="text-xs font-medium px-3 py-1.5 rounded-full" style={{ backgroundColor: "rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.8)" }}>Area: {specs.area}</span>}
            {specs?.class && <span className="text-xs font-medium px-3 py-1.5 rounded-full" style={{ backgroundColor: "rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.8)" }}>Class: {specs.class}</span>}
            <span className="text-xs font-medium px-3 py-1.5 rounded-full" style={{ backgroundColor: "rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.8)" }}>{specs?.equipment?.length ?? 0} instruments</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <LabPhotoGallery slug={SLUG} labTitle={lab.title} />
        <section aria-labelledby="equipment-heading">
          <h2 id="equipment-heading" className="text-xl font-bold text-[var(--color-text)] mb-4">Equipment List</h2>
          <LabSpecTable equipment={specs?.equipment ?? []} labName={lab.title} />
        </section>
        <section aria-labelledby="booking-heading" className="mt-10 rounded-[var(--radius-xl)] bg-[var(--color-brand-50)] border border-[var(--color-brand-200)] p-6">
          <h2 id="booking-heading" className="font-bold text-[var(--color-brand-800)] mb-2">Lab Access & Booking</h2>
          <p className="text-sm text-[var(--color-text-subtle)]">
            Incubatees at IC IITP have priority access to all laboratory facilities. External researchers and companies may request lab access through our online form.
          </p>
          <a href="/apply?form=lab-access" className="inline-block mt-4 text-sm font-semibold px-5 py-2 rounded-lg text-white" style={{ backgroundColor: "var(--color-brand-800)" }}>
            Request lab access →
          </a>
        </section>
      </div>
    </div>
  );
}
