import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { getLab, getLabSlugs } from "@/lib/content";
import { LabSpecTable } from "@/components/lab-spec-table";
import { Breadcrumb } from "@/components/breadcrumb";
import { routing } from "@/i18n/routing";
import { LabPhotoGallery } from "@/components/lab-photo-gallery";

interface Props { params: Promise<{ locale: string }> }

const SLUG = "esdm";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  void locale;
  const lab = getLab(SLUG, locale);
  return { title: lab.title, description: lab.tagline };
}

export default async function LabPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  let lab;
  try { lab = getLab(SLUG, locale); } catch { notFound(); }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Breadcrumb items={[
        { label: "Home", href: "/" },
        { label: "Facilities", href: "/facilities" },
        { label: lab.shortTitle },
      ]} />
      <header className="mb-8">
        <h1 className="text-3xl font-black text-[var(--color-brand-800)] mb-3">{lab.title}</h1>
        <p className="text-[var(--color-text-subtle)] max-w-2xl">{lab.tagline}</p>
        <div className="mt-4 flex gap-6 flex-wrap items-center">
          {lab.area && <span className="text-sm text-[var(--color-muted)]">Area: {lab.area}</span>}
          {lab.class && <span className="text-sm text-[var(--color-muted)]">Class: {lab.class}</span>}
          <span className="text-sm text-[var(--color-muted)]">{lab.equipment.length} instruments</span>
        </div>
      </header>
      <LabPhotoGallery slug={SLUG} labTitle={lab.title} />
      <section aria-labelledby="equipment-heading">
        <h2 id="equipment-heading" className="text-xl font-bold text-[var(--color-text)] mb-4">
          Equipment List
        </h2>
        <LabSpecTable equipment={lab.equipment} labName={lab.title} />
      </section>
      <section aria-labelledby="booking-heading" className="mt-10 rounded-[var(--radius-xl)] bg-[var(--color-brand-50)] border border-[var(--color-brand-200)] p-6">
        <h2 id="booking-heading" className="font-bold text-[var(--color-brand-800)] mb-2">
          Lab Access & Booking
        </h2>
        <p className="text-sm text-[var(--color-text-subtle)]">
          Incubatees at IC IITP have priority access to all laboratory facilities. External
          researchers and companies may request lab access through our online form.
        </p>
        <a
          href="/apply?form=lab-access"
          className="inline-block mt-4 text-sm font-semibold px-5 py-2 rounded-lg text-white"
          style={{ backgroundColor: "#3a5214" }}
        >
          Request lab access →
        </a>
      </section>
    </div>
  );
}
