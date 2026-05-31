import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { getAllLabs } from "@/lib/cms/labs";
import { Link } from "@/i18n/navigation";
import { Breadcrumb } from "@/components/breadcrumb";
import { ArrowRight, FlaskConical } from "lucide-react";
import Image from "next/image";
import { LAB_PHOTOS } from "@/components/lab-photo-gallery";
import { Reveal } from "@/components/reveal";

interface Props { params: Promise<{ locale: string }> }

export const metadata: Metadata = {
  title: "Facilities",
  description: "30,000 sq ft of world-class laboratory and co-working infrastructure at IC IITP, including a Clean Room, PCB Fab, Testing & Calibration, and more.",
};

export default async function FacilitiesPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const labs = await getAllLabs();

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--color-surface)" }}>
      {/* Hero */}
      <div className="relative overflow-hidden" style={{ background: "linear-gradient(160deg, var(--color-hero-from) 0%, var(--color-hero-via) 60%, var(--color-hero-to) 100%)" }}>
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true"
          style={{ backgroundImage: "radial-gradient(circle, #ffffff07 1px, transparent 1px)", backgroundSize: "24px 24px" }} />
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full pointer-events-none" aria-hidden="true"
          style={{ background: "radial-gradient(circle, #f7942020 0%, transparent 65%)" }} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-20 relative z-10">
          <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Facilities" }]} variant="light" />
          <Reveal>
            <p className="text-xs font-semibold uppercase tracking-widest mb-4 text-orange-200">
              <FlaskConical className="w-3.5 h-3.5 inline mr-1.5 -mt-0.5" aria-hidden="true" />
              IC IITP Campus
            </p>
            <h1 className="text-2xl sm:text-4xl lg:text-6xl font-black text-white leading-tight mb-4">Facilities</h1>
            <p className="text-white/80 text-lg max-w-lg">
              A dedicated 30,000 sq ft building housing six state-of-the-art laboratories, a BioNEST wing, co-working spaces, and a 30-seater conference facility.
            </p>
          </Reveal>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

      {/* Infrastructure overview */}
      <section aria-labelledby="infra-heading" className="mb-12">
        <h2 id="infra-heading" className="text-2xl font-bold text-[--color-text] mb-5">Infrastructure Overview</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            ["30,000 sq ft", "Total Facility Area"],
            ["10,000 sq ft", "BioNEST Wing"],
            ["6", "Specialised Labs"],
            ["30-Seater", "Conference Room"],
          ].map(([value, label]) => (
            <div key={label} className="rounded-[--radius-lg] bg-[--color-brand-50] border border-[--color-brand-200] p-5 text-center">
              <p className="text-2xl font-black text-[--color-brand-800]">{value}</p>
              <p className="text-sm text-[--color-muted] mt-1">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Shared spaces */}
      <section aria-labelledby="spaces-heading" className="mb-12">
        <h2 id="spaces-heading" className="text-2xl font-bold text-[--color-text] mb-5">Shared Spaces</h2>
        <ul className="grid sm:grid-cols-2 gap-3 text-sm text-[--color-text-subtle]">
          {[
            "Air-conditioned co-working space",
            "8-seater meeting rooms",
            "30-seater conference facility",
            "Dedicated rental office cabins",
            "BioNEST co-working and lab wing (10,000 sq ft)",
            "Class-100 Clean Room (under expansion)",
          ].map((item) => (
            <li key={item} className="flex gap-2 p-3 rounded-[--radius-md] bg-[--color-surface-alt] border border-[--color-border]">
              <span className="text-[--color-brand-600]">✓</span> {item}
            </li>
          ))}
        </ul>
      </section>

      {/* Labs grid */}
      <section aria-labelledby="labs-heading">
        <h2 id="labs-heading" className="text-2xl font-bold text-[--color-text] mb-6">Laboratories</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {labs.map((lab) => {
            const thumb = LAB_PHOTOS[lab.slug]?.[0];
            return (
              <Link
                key={lab.slug}
                href={`/facilities/${lab.slug}`}
                className="group rounded-[--radius-xl] border border-[--color-border] bg-[--color-surface] hover:border-[--color-brand-300] hover:shadow-lg overflow-hidden transition-all"
              >
                {/* Photo thumbnail */}
                {thumb && (
                  <div className="relative overflow-hidden" style={{ aspectRatio: "16/9" }}>
                    <Image
                      src={thumb}
                      alt={lab.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      quality={80}
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                    <div
                      className="absolute inset-0"
                      style={{ background: "linear-gradient(to top, rgba(42,58,16,0.55) 0%, transparent 60%)" }}
                    />
                    <span
                      className="absolute bottom-2.5 left-3 text-xs font-semibold px-2 py-0.5 rounded-full text-white"
                      style={{ backgroundColor: "rgba(58,82,20,0.75)" }}
                    >
                      Facility
                    </span>
                  </div>
                )}
                {/* Card content */}
                <div className="p-5">
                  <h3 className="font-bold text-[--color-text] mb-1.5 group-hover:text-[--color-primary] transition-colors leading-snug">
                    {lab.title}
                  </h3>
                  <p className="text-sm text-[--color-text-subtle] mb-4 leading-relaxed line-clamp-2">
                    {lab.tagline}
                  </p>
                  <span className="inline-flex items-center gap-1 text-sm font-semibold text-[--color-primary]">
                    View equipment <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>
      </div>
    </div>
  );
}
