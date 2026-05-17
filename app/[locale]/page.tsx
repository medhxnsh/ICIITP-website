import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import Image from "next/image";
import { getPageSection } from "@/lib/cms/page-sections";
import { getAllCmsPrograms } from "@/lib/cms/programs";
import { getPublishedEvents } from "@/lib/cms/events";
import { getPublishedNotifications } from "@/lib/cms/notifications";

export const revalidate = 60; // ISR: re-fetch at most once per minute
import { ParticleHero } from "@/components/particle-hero";
import { ProgramLogo } from "@/components/program-logo";
import { ExternalLink } from "@/components/external-link";
import {
  getAllPrograms, getAllStartups, getAllEvents,
  getAllNotifications, getAllLabs,
} from "@/lib/content";
import { ArrowRight, Calendar, Bell, ChevronDown } from "lucide-react";
import { CountUp } from "@/components/count-up";
import { Reveal, Stagger, StaggerItem } from "@/components/reveal";
import { TestimonialsCarousel } from "@/components/testimonials-carousel";

interface HomePageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: HomePageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "pages.home" });
  return { title: t("title") };
}

export default async function HomePage({ params }: HomePageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const allPrograms = getAllPrograms(locale);
  const openPrograms = allPrograms.filter((p) => p.status === "Open");
  const featuredPrograms = (openPrograms.length >= 3 ? openPrograms : allPrograms).slice(0, 3);
  const startups = getAllStartups(locale);
  const labs = getAllLabs(locale);
  const allEvents = getAllEvents(locale);
  const allNotifs = getAllNotifications(locale);

  const cms = await getPageSection("home").catch(() => null);
  const [cmsPrograms, cmsEventsRaw, cmsNotifsRaw] = await Promise.all([
    getAllCmsPrograms().catch(() => []),
    getPublishedEvents().catch(() => []),
    getPublishedNotifications().catch(() => []),
  ]);

  // Utility: extract seconds from a Firestore Timestamp-like object without importing Timestamp
  const toSecs = (ts: unknown): number => {
    if (ts && typeof ts === "object") {
      if ("seconds" in ts) return (ts as { seconds: number }).seconds;
      if ("_seconds" in ts) return (ts as { _seconds: number })._seconds;
    }
    return 0;
  };
  const NEW_MS = 14 * 24 * 60 * 60 * 1000; // 14 days
  const nowMs = Date.now();

  // Merge CMS events (first) + static events (deduped), cap at 4 for the grid
  const cmsEventSlugs = new Set(cmsEventsRaw.map((e) => e.slug));
  const displayEvents = [
    ...cmsEventsRaw.map((e) => ({
      href: `/events/${e.slug}`,
      category: e.category as string,
      title: e.title,
      tagline: e.tagline,
      isNew: nowMs - toSecs(e.createdAt) * 1000 < NEW_MS,
    })),
    ...allEvents
      .filter((e) => !cmsEventSlugs.has(e.slug))
      .map((e) => ({ href: `/events/${e.slug}`, category: e.category, title: e.shortTitle, tagline: e.tagline, isNew: false })),
  ].slice(0, 4);

  // Merge CMS notifications (first) + static (deduped), cap at 5
  const staticNotifSlugs = new Set(allNotifs.map((n) => n.slug));
  const displayNotifs = [
    ...cmsNotifsRaw.map((n) => ({
      href: `/notifications/${n.id}`,
      category: n.category,
      title: n.title,
      summary: n.body?.slice(0, 120) ?? "",
      isNew: nowMs - toSecs(n.createdAt) * 1000 < NEW_MS,
    })),
    ...allNotifs.map((n) => ({
      href: `/notifications/${n.slug}`,
      category: n.category,
      title: n.title,
      summary: n.summary,
      isNew: false,
    })),
  ].slice(0, 5);
  const cmsOnlySlugs = new Set(allPrograms.map((p) => p.slug));
  const cmsOnlyCount = cmsPrograms.filter((p) => p.published && !cmsOnlySlugs.has(p.slug)).length;
  const totalSchemes = allPrograms.length + cmsOnlyCount;
  const buildingImg   = cms?.building_image_url   || "/images/building.jpg";
  const teamStaffImg  = cms?.team_staff_image_url || "/images/team-staff.jpg";
  const teamGroupImg  = cms?.team_group_image_url || "/images/team-group.jpg";
  const aboutHeadline = cms?.about_headline       || "Built at IIT Patna.\nBuilt for India.";
  const aboutBody1    = cms?.about_body_1         || "IC IITP is a Government of India & Bihar joint initiative (Reg. No. 987, 2015–16) seated on a 500+ acre campus in Bihta, Patna. Our mission: make ESDM and healthcare technology accessible to the common man.";
  const aboutBody2    = cms?.about_body_2         || "Since inception we have screened 1,000+ business plans, facilitated 25 patent filings, and deployed seed capital across 600+ funding transactions.";
  const ctaHeadline   = cms?.cta_headline         || "Build the future\nwith IC IITP";
  const ctaBody       = cms?.cta_body             || "Apply for incubation, request lab access, or reach out to our team. We support deep-tech founders from idea to market.";
  const stats = cms?.stats ?? [
    { value: "₹47.10 Cr", label: "Total Undertaking" },
    { value: "100+",      label: "Startups Supported" },
    { value: "1,000+",    label: "B-Plans Screened" },
    { value: "25",        label: "Patents Facilitated" },
    { value: "600+",      label: "Funding Transactions" },
    { value: String(totalSchemes), label: "Incubation Schemes" },
  ];

  return (
    <div>
      {/* Pull sticky stack up by nav height (identity bar ~40px + nav h-14=56px = 96px)
          so Section 1 occupies exactly y=0–100svh and the wave lands at viewport bottom */}
      <div className="relative" style={{ marginTop: "-96px" }}>

      {/* ── Section 1: Circuit Hero ────────────────────────────────────────── */}
      <section className="sticky top-0 relative min-h-[100svh] flex flex-col overflow-hidden" style={{ background: "linear-gradient(160deg, #f4f8e8 0%, #ffffff 50%, #fef5e4 100%)" }}>
        {/* Subtle dot-grid texture */}
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true"
          style={{ backgroundImage: "radial-gradient(circle, #3a521410 1px, transparent 1px)", backgroundSize: "32px 32px" }} />
        {/* Orange arc — echoes the logo ring, top-right */}
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full pointer-events-none" aria-hidden="true"
          style={{ border: "6px solid #f7942022", boxShadow: "0 0 80px 20px #f7942010" }} />
        <ParticleHero />
        {/* Scroll indicator — absolute so it's always visible above the wave */}
        <div
          className="absolute left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-1"
          style={{ bottom: 130 }}
          aria-hidden="true"
        >
          <span className="text-[11px] font-bold tracking-[0.25em] uppercase" style={{ color: "#3a5214", opacity: 0.6 }}>Scroll</span>
          <div className="flex flex-col items-center -space-y-2.5 animate-bounce">
            <ChevronDown className="w-6 h-6" style={{ color: "#f79420", opacity: 0.45 }} />
            <ChevronDown className="w-6 h-6" style={{ color: "#f79420", opacity: 0.9 }} />
          </div>
        </div>
        {/* Wave into next section */}
        <div className="absolute bottom-0 left-0 right-0 pointer-events-none" style={{ lineHeight: 0 }} aria-hidden="true">
          <svg viewBox="0 0 1440 110" preserveAspectRatio="none" className="w-full" style={{ height: 110, display: "block" }}>
            <path fill="#3a5214" d="M0,55 C360,110 1080,0 1440,55 L1440,110 L0,110 Z" />
          </svg>
        </div>
      </section>

      {/* ── Section 2: About ──────────────────────────────────────────────── */}
      <section
        id="about"
        aria-labelledby="about-h"
        className="sticky top-0 relative min-h-[100svh] flex items-center text-white overflow-hidden rounded-t-[2rem] sm:rounded-t-[2.5rem] shadow-[0_-12px_40px_-8px_rgb(0_0_0/0.18)]"
        style={{ backgroundColor: "#3a5214" }}
      >
        {/* Building photo background */}
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          <Image src={buildingImg} alt="" fill sizes="100vw" className="object-cover object-center" quality={80} priority />
          <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, rgba(58,82,20,0.93) 0%, rgba(42,60,14,0.85) 100%)" }} />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-28 w-full grid lg:grid-cols-2 gap-14 items-center relative z-10">
          <div>
            <Reveal>
              <p className="text-xs font-semibold uppercase tracking-widest text-white/50 mb-4">About</p>
              <h2 id="about-h" className="text-4xl sm:text-5xl font-black leading-tight mb-6" style={{ whiteSpace: "pre-line" }}>
                {aboutHeadline}
              </h2>
            </Reveal>
            <Reveal delay={0.12}>
              <p className="text-white/75 text-lg leading-relaxed mb-6 max-w-lg">{aboutBody1}</p>
              <p className="text-white/60 text-base leading-relaxed mb-8 max-w-lg">{aboutBody2}</p>
              <Link
                href="/about"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-white font-semibold transition-colors hover:bg-green-50"
                style={{ color: "#3a5214" }}
              >
                Our story <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </Link>
            </Reveal>
          </div>

          {/* Right column: team photo + stat grid */}
          <div className="flex flex-col gap-5">
            <Reveal direction="right">
              <div className="relative rounded-2xl overflow-hidden" style={{ aspectRatio: "16/7" }}>
                <Image
                  src={teamStaffImg}
                  alt="IC IITP Management Team"
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover object-top"
                  loading="eager"
                  quality={85}
                />
                <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.55) 0%, transparent 55%)" }} />
                <p className="absolute bottom-3 left-4 text-white/80 text-xs font-medium tracking-wide">
                  IC IITP Management Team · Bihta, Patna
                </p>
              </div>
            </Reveal>

            <Stagger className="grid grid-cols-3 gap-3" delay={0.15}>
              {stats.map(({ value: v, label: l }) => (
                <StaggerItem key={l}>
                  <div className="rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-colors p-4 h-full">
                    <p className="text-2xl font-black text-white">
                      <CountUp value={v} />
                    </p>
                    <p className="text-xs text-white/50 mt-1 leading-tight">{l}</p>
                  </div>
                </StaggerItem>
              ))}
            </Stagger>
          </div>
        </div>
        {/* Wave out */}
        <div className="absolute bottom-0 left-0 right-0 pointer-events-none" style={{ lineHeight: 0 }} aria-hidden="true">
          <svg viewBox="0 0 1440 72" preserveAspectRatio="none" className="w-full" style={{ height: 72, display: "block" }}>
            <path fill="#fafaf8" d="M0,24 C480,72 960,0 1440,36 L1440,72 L0,72 Z" />
          </svg>
        </div>
      </section>

      {/* ── Section 3: Programs ───────────────────────────────────────────── */}
      <section
        id="programs"
        aria-labelledby="programs-h"
        className="sticky top-0 relative min-h-[100svh] flex items-center overflow-hidden rounded-t-[2rem] sm:rounded-t-[2.5rem] shadow-[0_-12px_40px_-8px_rgb(0_0_0/0.12)]"
        style={{ backgroundColor: "#fafaf8" }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-28 w-full">
          <Reveal className="mb-10 flex items-end justify-between flex-wrap gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: "#5a7c20" }}>Programs</p>
              <h2 id="programs-h" className="text-4xl sm:text-5xl font-black leading-tight" style={{ color: "#3a5214" }}>
                6 Incubation<br />Programmes
              </h2>
            </div>
            <Link href="/programs" className="inline-flex items-center gap-2 text-sm font-semibold hover:underline shrink-0" style={{ color: "#3a5214" }}>
              Detailed overview <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </Link>
          </Reveal>

          <Stagger className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {allPrograms.map((p) => (
              <StaggerItem key={p.slug}>
                <Link
                  href={`/programs/${p.slug}`}
                  className="group flex flex-col rounded-2xl border border-gray-200 bg-white p-6 hover:shadow-xl hover:border-green-300 hover:-translate-y-1 transition-all duration-300 h-full"
                >
                  {/* Logo */}
                  <div className="mb-3">
                    <ProgramLogo slug={p.slug} size={44} />
                  </div>
                  {/* Badges row */}
                  <div className="flex items-center gap-2 flex-wrap mb-4">
                    <span className="text-xs font-bold px-3 py-1 rounded-full text-white" style={{ backgroundColor: "#3a5214" }}>
                      {p.badge}
                    </span>
                    {p.status === "Open" && (
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-green-100 text-green-800">Open</span>
                    )}
                  </div>
                  <h3 className="font-bold text-lg text-gray-900 mb-2 group-hover:text-green-800 transition-colors leading-snug">
                    {p.title}
                  </h3>
                  <p className="text-sm text-gray-500 leading-relaxed mb-4 line-clamp-3 flex-1">{p.about}</p>
                  {p.grant && <p className="text-xs font-semibold text-green-700 mb-2">Grant: {p.grant}</p>}
                  <span className="inline-flex items-center gap-1 text-xs font-semibold" style={{ color: "#3a5214" }}>
                    Learn more <ArrowRight className="w-3 h-3" aria-hidden="true" />
                  </span>
                </Link>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
        {/* Wave out */}
        <div className="absolute bottom-0 left-0 right-0 pointer-events-none" style={{ lineHeight: 0 }} aria-hidden="true">
          <svg viewBox="0 0 1440 72" preserveAspectRatio="none" className="w-full" style={{ height: 72, display: "block" }}>
            <path fill="#f2faf5" d="M0,48 C360,0 1080,72 1440,24 L1440,72 L0,72 Z" />
          </svg>
        </div>
      </section>

      {/* ── Section 4: Portfolio ──────────────────────────────────────────── */}
      <section
        id="portfolio"
        aria-labelledby="portfolio-h"
        className="sticky top-0 relative min-h-[100svh] flex items-center overflow-hidden rounded-t-[2rem] sm:rounded-t-[2.5rem] shadow-[0_-12px_40px_-8px_rgb(0_0_0/0.12)]"
        style={{ backgroundColor: "#f2faf5" }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 w-full">

          {/* Editorial two-column: heading | divider | scheme rows */}
          <div className="grid lg:grid-cols-[340px_1px_1fr] gap-0 lg:gap-12 xl:gap-20 items-start">

            {/* ── Left: heading + supporting stats + CTA ── */}
            <Reveal className="lg:pt-2 mb-12 lg:mb-0">
              <p className="text-xs font-semibold uppercase tracking-widest mb-6" style={{ color: "#5a7c20" }}>Portfolio</p>
              <h2 id="portfolio-h" className="font-black leading-none mb-3" style={{ color: "#3a5214", fontSize: "clamp(3.5rem, 8vw, 6rem)" }}>
                <CountUp value={`${startups.length}+`} />
              </h2>
              <p className="text-xl font-semibold mb-4" style={{ color: "#3a5214" }}>Startups supported</p>
              <p className="text-sm leading-relaxed mb-10 max-w-[30ch]" style={{ color: "#5a6644" }}>
                Deep-tech founders across ESDM, MedTech, AI, and IoT — backed by five government schemes since 2015.
              </p>

              {/* Supporting metrics */}
              <div className="grid grid-cols-3 gap-0 mb-10" style={{ borderTop: "1px solid #3a521420" }}>
                {([
                  { value: "1,000+", label: "B-plans screened" },
                  { value: "25",     label: "Patents filed" },
                  { value: "600+",   label: "Seed funding units" },
                ] as const).map(({ value, label }, i) => (
                  <div key={label} className="pt-4 pr-4" style={i > 0 ? { borderLeft: "1px solid #3a521420", paddingLeft: "1rem" } : {}}>
                    <p className="text-2xl font-black leading-none mb-1" style={{ color: "#3a5214" }}>
                      <CountUp value={value} />
                    </p>
                    <p className="text-[11px] leading-snug" style={{ color: "#7a8e6a" }}>{label}</p>
                  </div>
                ))}
              </div>

              {/* Sector tags */}
              <div className="flex flex-wrap gap-2 mb-10">
                {["ESDM", "Medical Electronics", "AI / ML", "IoT", "EV", "Robotics", "ICT"].map((tag) => (
                  <span
                    key={tag}
                    className="text-[11px] font-medium px-2.5 py-1 rounded-full"
                    style={{ backgroundColor: "#3a521412", color: "#3a5214" }}
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <Link
                href="/portfolio"
                className="inline-flex items-center gap-2 text-sm font-semibold underline underline-offset-4 decoration-[#f79420] transition-opacity hover:opacity-70"
                style={{ color: "#3a5214" }}
              >
                Explore all startups <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </Link>
            </Reveal>

            {/* ── Vertical rule ── */}
            <div className="hidden lg:block self-stretch" style={{ backgroundColor: "#3a521420" }} aria-hidden="true" />

            {/* ── Right: scheme rows ── */}
            <Stagger className="lg:pt-2">
              {([
                { key: "meity",        label: "MeitY",        funder: "Ministry of Electronics & IT", grant: null,                   open: false },
                { key: "sisf",         label: "SISF",         funder: "DPIIT · Startup India",        grant: "Up to ₹50 lakh",       open: false },
                { key: "nidhi-prayas", label: "Nidhi Prayas", funder: "DST · NSTEDB",                 grant: "Up to ₹10 lakh",       open: true  },
                { key: "nidhi-eir",    label: "Nidhi-EIR",    funder: "DST · NSTEDB",                 grant: "Stipend + workspace",  open: true  },
                { key: "genesis",      label: "GENESIS",      funder: "MeitY · Deep-tech",             grant: null,                   open: false },
              ] as const).map(({ key, label, funder, grant, open }) => {
                const count = startups.filter((s) => s.scheme === key).length;
                return (
                  <StaggerItem key={key}>
                    <Link
                      href={`/portfolio/${key}`}
                      className="group flex items-start justify-between gap-6 py-5 transition-colors"
                      style={{ borderTop: "1px solid #3a521418" }}
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-0.5">
                          <p className="text-base font-semibold leading-snug" style={{ color: "#1c2e06" }}>{label}</p>
                          {open && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: "#d1fae5", color: "#065f46" }}>
                              Open
                            </span>
                          )}
                        </div>
                        <p className="text-xs" style={{ color: "#7a8e6a" }}>{funder}</p>
                        {grant && (
                          <p className="text-xs mt-1.5 font-medium" style={{ color: "#f79420" }}>{grant}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-3 shrink-0 pt-0.5">
                        <div className="text-right">
                          <span className="text-4xl font-black tabular-nums block" style={{ color: "#3a5214" }}>
                            <CountUp value={`${count}`} />
                          </span>
                          <span className="text-[11px]" style={{ color: "#7a8e6a" }}>startups</span>
                        </div>
                        <ArrowRight
                          className="w-4 h-4 opacity-0 group-hover:opacity-100 -translate-x-1 group-hover:translate-x-0 transition-all duration-200"
                          style={{ color: "#f79420" }}
                          aria-hidden="true"
                        />
                      </div>
                    </Link>
                  </StaggerItem>
                );
              })}
              {/* Total row */}
              <div
                className="flex items-center justify-between gap-6 py-5"
                style={{ borderTop: "1px solid #3a521430" }}
              >
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest mb-0.5" style={{ color: "#5a7c20" }}>Total</p>
                  <p className="text-xs" style={{ color: "#7a8e6a" }}>across all schemes</p>
                </div>
                <span className="text-4xl font-black tabular-nums" style={{ color: "#f79420" }}>
                  <CountUp value={`${startups.length}+`} />
                </span>
              </div>
            </Stagger>

          </div>
        </div>

        {/* Wave out */}
        <div className="absolute bottom-0 left-0 right-0 pointer-events-none" style={{ lineHeight: 0 }} aria-hidden="true">
          <svg viewBox="0 0 1440 72" preserveAspectRatio="none" className="w-full" style={{ height: 72, display: "block" }}>
            <path fill="#3a5214" d="M0,36 C720,72 1080,0 1440,48 L1440,72 L0,72 Z" />
          </svg>
        </div>
      </section>

      {/* ── Section 5: Facilities ─────────────────────────────────────────── */}
      <section
        id="facilities"
        aria-labelledby="facilities-h"
        className="sticky top-0 relative min-h-[100svh] flex items-center text-white overflow-hidden rounded-t-[2rem] sm:rounded-t-[2.5rem] shadow-[0_-12px_40px_-8px_rgb(0_0_0/0.18)]"
        style={{ backgroundColor: "#3a5214" }}
      >
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true"
          style={{ background: "radial-gradient(ellipse 70% 50% at 30% 50%, #22723f44 0%, transparent 70%)" }} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-28 w-full relative z-10">
          <Reveal className="mb-10">
            <p className="text-xs font-semibold uppercase tracking-widest text-white/50 mb-2">Facilities</p>
            <h2 id="facilities-h" className="text-4xl sm:text-5xl font-black leading-tight mb-4">
              30,000 sq ft of<br />World-Class Labs
            </h2>
            <p className="text-white/65 text-lg max-w-xl">
              Six specialised laboratories available to incubatees — from Class-100 cleanroom microfabrication to high-frequency RF measurement.
            </p>
          </Reveal>

          <Stagger className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-10">
            {labs.map((lab) => (
              <StaggerItem key={lab.slug}>
                <Link
                  href={`/facilities/${lab.slug}`}
                  className="group flex flex-col rounded-2xl border border-white/10 bg-white/5 p-6 hover:bg-white/12 hover:border-white/30 hover:-translate-y-0.5 transition-all duration-300 h-full"
                >
                  <h3 className="font-bold text-white mb-1 group-hover:text-green-200 transition-colors">{lab.shortTitle}</h3>
                  <p className="text-sm text-white/55 leading-relaxed line-clamp-2 flex-1">{lab.tagline}</p>
                  {lab.area && <p className="text-xs text-white/35 mt-2">{lab.area}</p>}
                </Link>
              </StaggerItem>
            ))}
          </Stagger>

          <Reveal delay={0.2}>
            <Link href="/facilities" className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-white font-semibold transition-colors hover:bg-green-50" style={{ color: "#3a5214" }}>
              View all facilities <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </Link>
          </Reveal>
        </div>
        {/* Wave out */}
        <div className="absolute bottom-0 left-0 right-0 pointer-events-none" style={{ lineHeight: 0 }} aria-hidden="true">
          <svg viewBox="0 0 1440 72" preserveAspectRatio="none" className="w-full" style={{ height: 72, display: "block" }}>
            <path fill="#fafaf8" d="M0,24 C480,72 960,0 1440,48 L1440,72 L0,72 Z" />
          </svg>
        </div>
      </section>

      {/* ── Section 6: Events & Updates ───────────────────────────────────── */}
      <section
        id="events"
        aria-labelledby="events-h"
        className="sticky top-0 relative min-h-[100svh] flex items-center overflow-hidden rounded-t-[2rem] sm:rounded-t-[2.5rem] shadow-[0_-12px_40px_-8px_rgb(0_0_0/0.12)]"
        style={{ backgroundColor: "#fafaf8" }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 w-full">

          <Reveal className="mb-10">
            <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: "#5a7c20" }}>Latest</p>
            <h2 id="events-h" className="text-4xl sm:text-5xl font-black leading-tight" style={{ color: "#3a5214" }}>
              Events &amp; Updates
            </h2>
          </Reveal>

          <div className="grid lg:grid-cols-[1fr_1px_420px] gap-0 lg:gap-10 xl:gap-16">

            {/* ── Events: 2×2 card grid ── */}
            <div>
              <div className="flex items-center justify-between mb-5">
                <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: "#5a7c20" }}>
                  <Calendar className="w-3.5 h-3.5 inline mr-1.5 -mt-0.5" aria-hidden="true" />
                  Events
                </p>
                <Link href="/events" className="inline-flex items-center gap-1 text-xs font-semibold hover:underline" style={{ color: "#3a5214" }}>
                  All events <ArrowRight className="w-3 h-3" aria-hidden="true" />
                </Link>
              </div>
              <Stagger className="grid sm:grid-cols-2 gap-4">
                {displayEvents.map((e) => (
                  <StaggerItem key={e.href}>
                    <Link
                      href={e.href}
                      className="group flex flex-col rounded-xl border bg-white p-5 hover:border-green-300 hover:shadow-md hover:-translate-y-0.5 transition-all duration-250 h-full"
                      style={{ borderColor: e.isNew ? "#7bbf3e" : "#e5e7eb" }}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: "#5a7c20" }}>{e.category}</span>
                        {e.isNew && (
                          <span className="text-[9px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded-full text-white" style={{ backgroundColor: "#f79420" }}>New</span>
                        )}
                      </div>
                      <h3 className="font-bold text-gray-900 leading-snug mb-2 group-hover:text-green-800 transition-colors line-clamp-2 flex-1 text-sm">
                        {e.title}
                      </h3>
                      <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">{e.tagline}</p>
                      <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: "#3a5214" }}>
                        Learn more <ArrowRight className="w-3 h-3" aria-hidden="true" />
                      </span>
                    </Link>
                  </StaggerItem>
                ))}
              </Stagger>
            </div>

            {/* ── Vertical divider ── */}
            <div className="hidden lg:block self-stretch" style={{ backgroundColor: "#3a521418" }} aria-hidden="true" />

            {/* ── Notifications: stacked list ── */}
            <div>
              <div className="flex items-center justify-between mb-5">
                <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: "#5a7c20" }}>
                  <Bell className="w-3.5 h-3.5 inline mr-1.5 -mt-0.5" aria-hidden="true" />
                  Notifications
                </p>
                <Link href="/notifications" className="inline-flex items-center gap-1 text-xs font-semibold hover:underline" style={{ color: "#3a5214" }}>
                  All notifications <ArrowRight className="w-3 h-3" aria-hidden="true" />
                </Link>
              </div>
              <Stagger className="flex flex-col">
                {displayNotifs.map((n) => (
                  <StaggerItem key={n.href}>
                    <Link
                      href={n.href}
                      className="group flex items-start justify-between gap-4 py-4 transition-colors"
                      style={{ borderTop: "1px solid #3a521415" }}
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: "#5a7c20" }}>{n.category}</span>
                          {n.isNew && (
                            <span className="text-[9px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded-full text-white" style={{ backgroundColor: "#f79420" }}>New</span>
                          )}
                        </div>
                        <p className="text-sm font-semibold leading-snug text-gray-900 group-hover:text-green-800 transition-colors line-clamp-2">{n.title}</p>
                        <p className="text-xs text-gray-500 mt-1 leading-relaxed line-clamp-2">{n.summary}</p>
                      </div>
                      <ArrowRight
                        className="w-4 h-4 shrink-0 mt-0.5 opacity-0 group-hover:opacity-100 -translate-x-1 group-hover:translate-x-0 transition-all duration-200"
                        style={{ color: "#f79420" }}
                        aria-hidden="true"
                      />
                    </Link>
                  </StaggerItem>
                ))}
              </Stagger>

              {/* Careers quick-link card */}
              <Reveal delay={0.25}>
                <div className="mt-6 rounded-xl p-5" style={{ backgroundColor: "#3a521408", border: "1px solid #3a521418" }}>
                  <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: "#5a7c20" }}>Join Us</p>
                  <p className="text-sm font-bold text-gray-900 mb-3">We&apos;re hiring — multiple roles open at IC IITP</p>
                  <Link
                    href="/notifications/careers"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg text-white transition-opacity hover:opacity-85"
                    style={{ backgroundColor: "#f79420" }}
                  >
                    View openings <ArrowRight className="w-3 h-3" aria-hidden="true" />
                  </Link>
                </div>
              </Reveal>
            </div>

          </div>
        </div>

        {/* Wave out */}
        <div className="absolute bottom-0 left-0 right-0 pointer-events-none" style={{ lineHeight: 0 }} aria-hidden="true">
          <svg viewBox="0 0 1440 72" preserveAspectRatio="none" className="w-full" style={{ height: 72, display: "block" }}>
            <path fill="#1e3209" d="M0,48 C360,0 1080,72 1440,24 L1440,72 L0,72 Z" />
          </svg>
        </div>
      </section>

      {/* ── Section 7: Founder Testimonials ─────────────────────────────── */}
      <section
        id="testimonials"
        aria-labelledby="testimonials-h"
        className="sticky top-0 relative min-h-[100svh] flex items-center text-white overflow-hidden rounded-t-[2rem] sm:rounded-t-[2.5rem] shadow-[0_-12px_40px_-8px_rgb(0_0_0/0.25)]"
        style={{ backgroundColor: "#1e3209" }}
      >
        {/* Subtle texture */}
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true"
          style={{ backgroundImage: "radial-gradient(circle, #ffffff08 1px, transparent 1px)", backgroundSize: "28px 28px" }} />
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true"
          style={{ background: "radial-gradient(ellipse 60% 50% at 50% 50%, #3a521430 0%, transparent 70%)" }} />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 w-full relative z-10">

          <Reveal className="mb-14 text-center">
            <p className="text-xs font-semibold uppercase tracking-widest mb-3 text-white/40">Founder Stories</p>
            <h2 id="testimonials-h" className="text-4xl sm:text-5xl font-black leading-tight text-white">
              What Our Incubatees Say
            </h2>
          </Reveal>

          <TestimonialsCarousel />

          {/* Bottom note */}
          <Reveal delay={0.3} className="mt-14 text-center">
            <p className="text-xs text-white/35 mb-3">Trusted by 100+ founders since 2015</p>
            <Link
              href="/portfolio"
              className="inline-flex items-center gap-1.5 text-sm font-semibold transition-opacity hover:opacity-70"
              style={{ color: "#f79420" }}
            >
              Explore the full portfolio <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </Link>
          </Reveal>
        </div>

        {/* Wave into CTA */}
        <div className="absolute bottom-0 left-0 right-0 pointer-events-none" style={{ lineHeight: 0 }} aria-hidden="true">
          <svg viewBox="0 0 1440 72" preserveAspectRatio="none" className="w-full" style={{ height: 72, display: "block" }}>
            <path fill="#3a5214" d="M0,36 C480,72 960,0 1440,48 L1440,72 L0,72 Z" />
          </svg>
        </div>
      </section>

      {/* ── Section 8: Apply CTA ──────────────────────────────────────────── */}
      <section
        aria-label="Apply"
        className="sticky top-0 relative min-h-[60svh] flex items-center text-white overflow-hidden rounded-t-[2rem] sm:rounded-t-[2.5rem] shadow-[0_-12px_40px_-8px_rgb(0_0_0/0.18)]"
        style={{ backgroundColor: "#3a5214" }}
      >
        {/* Team group photo background */}
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          <Image src={teamGroupImg} alt="" fill sizes="100vw" className="object-cover object-center" quality={75} priority />
          <div className="absolute inset-0" style={{ background: "linear-gradient(rgba(30,46,9,0.88), rgba(42,60,14,0.92))" }} />
        </div>
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true"
          style={{ background: "radial-gradient(ellipse 60% 60% at 50% 50%, #5a7c2030 0%, transparent 70%)" }} />
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center relative z-10">
          <Reveal>
            <p className="text-xs font-semibold uppercase tracking-widest text-white/50 mb-4">Join us</p>
            <h2 className="text-4xl sm:text-5xl font-black leading-tight mb-5" style={{ whiteSpace: "pre-line" }}>
              {ctaHeadline}
            </h2>
            <p className="text-white/70 text-lg max-w-xl mx-auto mb-10">{ctaBody}</p>
          </Reveal>
          <Reveal delay={0.15} className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/apply"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-bold text-white text-lg shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200"
              style={{ backgroundColor: "#f79420" }}
            >
              Apply Now <ArrowRight className="w-5 h-5" aria-hidden="true" />
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl border-2 border-white/40 text-white font-semibold hover:bg-white/15 hover:border-white/60 transition-all duration-200"
            >
              Contact Us
            </Link>
          </Reveal>
        </div>
      </section>

      </div>{/* end sticky stack */}

      <div className="border-t border-white/10 py-4 text-center" style={{ backgroundColor: "#3a5214" }}>
      </div>
    </div>
  );
}
