import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Breadcrumb } from "@/components/breadcrumb";
import { MobileInfo } from "@/components/mobile-info";
import { ArrowRight, Building2 } from "lucide-react";
import Image from "next/image";
import { Reveal } from "@/components/reveal";
import { getPageSection } from "@/lib/cms/page-sections";
import { getPublishedStartups } from "@/lib/cms/startups";
import { getPublishedPrograms } from "@/lib/cms/programs";

export const revalidate = 60; // ISR: re-fetch at most once per minute

interface Props { params: Promise<{ locale: string }> }

export const metadata: Metadata = {
  title: "About IC IITP",
  description:
    "The Incubation Centre at IIT Patna is India's leading ESDM and Medical Electronics Incubator, a ₹47.10 Crore Government of India and Bihar initiative.",
};

export default async function AboutPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("about_page");

  const [cms, homeCms, startups, programs] = await Promise.all([
    getPageSection("about").catch(() => null),
    getPageSection("home").catch(() => null),
    getPublishedStartups().catch(() => []),
    getPublishedPrograms().catch(() => []),
  ]);

  const manualStats: { value: string; label: string }[] = homeCms?.stats ?? [
    { value: "₹47.10 Cr", label: "Total Undertaking" },
    { value: "1,000+",    label: "B-Plans Screened" },
    { value: "25",        label: "Patents Facilitated" },
    { value: "600+",      label: "Funding Transactions" },
  ];
  const stat = (label: string, fallback: string) =>
    manualStats.find(s => s.label === label)?.value ?? fallback;

  // Always built from live stats so it stays in sync when values change in the admin
  const backgroundP1 = `The Incubation Centre, IIT Patna (IC IITP) is a result of a collaboration between the Government of India (47%) and the Government of Bihar (53%), constituting a ${stat("Total Undertaking", "₹47.10 Cr")} undertaking tied to India's MAKE IN INDIA initiative. It is registered as the IC IITP Society (Reg. No. 987, 2015–16).`;
  const backgroundP3 = `Since inception, IC IITP has screened over ${stat("B-Plans Screened", "1,000+")} business plans, supported ${startups.length}+ startups across ${programs.length} incubation schemes, facilitated ${stat("Patents Facilitated", "25")} patent filings, and deployed seed capital through ${stat("Funding Transactions", "600+")} funding transactions.`;
  const buildingImg       = cms?.building_image_url      || "/images/building.jpg";
  const inaugImg          = cms?.inauguration_image_url  || "/images/inauguration.jpg";
  const inaugCaption      = cms?.inauguration_caption    || "IC IITP was officially inaugurated as a joint initiative of the Government of India and the Government of Bihar — marking the start of a new chapter for deep-tech entrepreneurship in the region. Since then, the centre has grown into India’s leading ESDM and Medical Electronics Incubator.";
  const ceremonyImg       = cms?.ceremony_image_url      || "/images/team-ceremony.jpg";
  const ceremonyTitle     = cms?.ceremony_overlay_title  || "Training programmes & certificate distribution";
  const ceremonyBody      = cms?.ceremony_overlay_body   || "Empowering innovators across Bihar and beyond";

  return (
    <>
      <div className="md:hidden"><MobileInfo page="about" /></div>
      <div className="hidden md:block min-h-screen" style={{ backgroundColor: "var(--color-surface)" }}>
      {/* Hero */}
      <div className="relative overflow-hidden" style={{ background: "linear-gradient(160deg, var(--color-hero-from) 0%, var(--color-hero-via) 60%, var(--color-hero-to) 100%)" }}>
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true"
          style={{ backgroundImage: "radial-gradient(circle, #ffffff07 1px, transparent 1px)", backgroundSize: "24px 24px" }} />
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full pointer-events-none" aria-hidden="true"
          style={{ background: "radial-gradient(circle, #f7942020 0%, transparent 65%)" }} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-20 relative z-10">
          <Breadcrumb items={[{ label: "Home", href: "/" }, { label: t("heroTitle") }]} variant="light" />
          <Reveal>
            <p className="text-xs font-semibold uppercase tracking-widest mb-4 text-orange-200">
              <Building2 className="w-3.5 h-3.5 inline mr-1.5 -mt-0.5" aria-hidden="true" />
              IIT Patna
            </p>
            <h1 className="text-2xl sm:text-4xl lg:text-6xl font-black text-white leading-tight mb-4">
              {t("heroTitle")}
            </h1>
            <p className="text-white/80 text-lg max-w-lg">
              {t("heroSubtitle")}
            </p>
          </Reveal>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

      {/* Campus hero photo */}
      <div className="relative rounded-2xl overflow-hidden mb-12" style={{ aspectRatio: "21/8" }}>
        <Image
          src={buildingImg}
          alt="Incubation Centre IIT Patna campus, Bihta, Patna"
          fill
          sizes="100vw"
          className="object-cover object-center"
          quality={90}
          priority
        />
        <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.45) 0%, transparent 55%)" }} />
        <p className="absolute bottom-4 left-5 text-white/90 text-sm font-medium tracking-wide">
          Incubation Centre · IIT Patna · Amhara Road, Bihta, Patna – 801103
        </p>
      </div>

      {/* Vision & Mission */}
      <section aria-labelledby="vision-heading" className="mb-12 grid sm:grid-cols-2 gap-6">
        <div className="rounded-xl text-white p-8" style={{ backgroundColor: "var(--color-brand-800)" }}>
          <h2 id="vision-heading" className="text-xs font-semibold uppercase tracking-widest text-orange-200 mb-3">
            {t("visionLabel")}
          </h2>
          <p className="text-lg leading-relaxed">
            {t("visionText")}
          </p>
        </div>
        <div className="rounded-[--radius-xl] bg-[--color-brand-50] border border-[--color-brand-200] p-8">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-[--color-muted] mb-3">
            {t("missionLabel")}
          </h2>
          <p className="text-lg text-[--color-text] leading-relaxed">
            {t("missionText")}
          </p>
        </div>
      </section>

      {/* Background */}
      <section aria-labelledby="background-heading" className="mb-12">
        <h2 id="background-heading" className="text-2xl font-bold text-[--color-text] mb-6">
          {t("backgroundHeading")}
        </h2>
        <div className="prose max-w-none text-[--color-text-subtle] leading-relaxed space-y-4">
          <p>{backgroundP1}</p>
          <p>{t("backgroundP2")}</p>
          <p>{backgroundP3}</p>
        </div>
      </section>

      {/* Founding moment */}
      <div className="mb-12 rounded-2xl overflow-hidden grid sm:grid-cols-[1fr_1.2fr]" style={{ backgroundColor: "var(--color-brand-50)" }}>
        <div className="relative min-h-[220px]">
          <Image
            src={inaugImg}
            alt="IC IITP inauguration ceremony, 2015"
            fill
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover object-center"
            quality={85}
          />
        </div>
        <div className="p-8 flex flex-col justify-center">
          <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: "var(--color-brand-600)" }}>Est. 2015</p>
          <h3 className="text-xl font-bold mb-3" style={{ color: "var(--color-brand-950)" }}>Inaugurated with a clear mission</h3>
          <p className="text-sm leading-relaxed" style={{ color: "#4a5a30" }}>{inaugCaption}</p>
        </div>
      </div>

      {/* Stats */}
      <section aria-labelledby="stats-heading" className="mb-12">
        <h2 id="stats-heading" className="sr-only">Key Numbers</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {([
            [stat("Total Undertaking", "₹47.10 Cr"),  t("stat1Label")],
            [t("stat2Value"),                          t("stat2Label")],
            [`${startups.length}+`,                   t("stat3Label")],
            [String(programs.length),                  t("stat4Label")],
          ] as [string, string][]).map(([value, label]) => (
            <div
              key={label}
              className="rounded-[--radius-lg] border border-[--color-border] bg-[--color-surface-alt] p-5 text-center"
            >
              <p className="text-2xl font-black text-[--color-brand-800]">{value}</p>
              <p className="text-sm text-[--color-muted] mt-1">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Community photo banner */}
      <div className="relative rounded-2xl overflow-hidden mb-12" style={{ aspectRatio: "21/7" }}>
        <Image
          src={ceremonyImg}
          alt="IC IITP training programme and certificate distribution"
          fill
          sizes="100vw"
          className="object-cover"
          style={{ objectPosition: "center 25%" }}
          quality={80}
        />
        <div className="absolute inset-0" style={{ background: "linear-gradient(to right, rgba(42,58,16,0.82) 0%, rgba(42,58,16,0.3) 55%, transparent 80%)" }} />
        <div className="absolute inset-0 flex items-center px-8">
          <div className="max-w-xs">
            <p className="text-orange-200 text-xs uppercase tracking-widest font-semibold mb-2">Community</p>
            <p className="text-white text-xl font-bold leading-snug">{ceremonyTitle}</p>
            <p className="text-white/80 text-sm mt-2">{ceremonyBody}</p>
          </div>
        </div>
      </div>

      {/* Domains */}
      <section aria-labelledby="domains-heading" className="mb-12">
        <h2 id="domains-heading" className="text-2xl font-bold text-[--color-text] mb-5">
          {t("domainsHeading")}
        </h2>
        <div className="flex flex-wrap gap-3">
          {(t.raw("domains") as string[]).map((d) => (
            <span
              key={d}
              className="px-4 py-2 rounded-full border border-[--color-brand-300] bg-[--color-brand-50] text-sm font-medium text-[--color-brand-800]"
            >
              {d}
            </span>
          ))}
        </div>
      </section>

      {/* Partners */}
      <section aria-labelledby="partners-heading" className="mb-12">
        <h2 id="partners-heading" className="text-2xl font-bold text-[--color-text] mb-5">
          {t("partnersHeading")}
        </h2>
        <ul className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {(t.raw("partners") as string[]).map((p) => (
            <li
              key={p}
              className="text-sm text-[--color-text-subtle] py-2 px-3 rounded-[--radius-md] bg-[--color-surface-alt] border border-[--color-border]"
            >
              {p}
            </li>
          ))}
        </ul>
      </section>

      {/* Sub-page links */}
      <section aria-labelledby="team-heading" className="mb-8">
        <h2 id="team-heading" className="text-2xl font-bold text-[--color-text] mb-5">
          {t("ourPeopleHeading")}
        </h2>
        <div className="grid sm:grid-cols-3 gap-4">
          {([
            ["/about/governance", t("governanceTitle"), t("governanceDesc")],
            ["/about/evaluation-team", t("evalTeamTitle"), t("evalTeamDesc")],
            ["/about/staff", t("staffTitle"), t("staffDesc")],
          ] as [string, string, string][]).map(([href, title, desc]) => (
            <Link
              key={href}
              href={href}
              className="group rounded-[--radius-xl] border border-[--color-border] bg-[--color-surface] hover:border-[--color-brand-300] hover:shadow-md p-6 transition-all"
            >
              <h3 className="font-bold text-[--color-text] mb-2 group-hover:text-[--color-primary] transition-colors">
                {title}
              </h3>
              <p className="text-sm text-[--color-text-subtle] leading-relaxed mb-3">{desc}</p>
              <span className="inline-flex items-center gap-1 text-sm font-semibold text-[--color-primary]">
                {t("viewLink")} <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
              </span>
            </Link>
          ))}
        </div>
      </section>
      </div>
    </div>
    </>
  );
}
