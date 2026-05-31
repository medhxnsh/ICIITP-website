import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import Image from "next/image";
import { getPageSection } from "@/lib/cms/page-sections";
import { getPublishedPrograms, type CmsProgramDoc } from "@/lib/cms/programs";
import { getPublishedEvents } from "@/lib/cms/events";
import { getPublishedNotifications } from "@/lib/cms/notifications";
import { getPublishedNews } from "@/lib/cms/news";

export const revalidate = 60; // ISR: re-fetch at most once per minute
import { ParticleHero } from "@/components/particle-hero";
import { ExternalLink } from "@/components/external-link";
import { getPublishedStartups, type CmsStartup } from "@/lib/cms/startups";
import { getAllLabs } from "@/lib/cms/labs";
import { PROGRAM_CATEGORIES } from "@/lib/programs-config";
import { ArrowRight, Calendar, Bell, ChevronDown, Newspaper } from "lucide-react";
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

  const [labs, cms, cmsPrograms, startups, cmsEventsRaw, cmsNotifsRaw, cmsNewsRaw] = await Promise.all([
    getAllLabs().catch(() => []),
    getPageSection("home").catch(() => null),
    getPublishedPrograms().catch(() => []),
    getPublishedStartups().catch(() => [] as CmsStartup[]),
    getPublishedEvents().catch(() => []),
    getPublishedNotifications().catch(() => []),
    getPublishedNews().catch(() => []),
  ]);

  const programsBySection: Record<string, CmsProgramDoc[]> = {};
  for (const p of cmsPrograms) {
    const key = p.section ?? "INCUBATION";
    (programsBySection[key] ??= []).push(p);
  }

  const toSecs = (ts: unknown): number => {
    if (ts && typeof ts === "object") {
      if ("seconds" in ts) return (ts as { seconds: number }).seconds;
      if ("_seconds" in ts) return (ts as { _seconds: number })._seconds;
    }
    return 0;
  };
  const NEW_MS = 14 * 24 * 60 * 60 * 1000;
  const nowMs = Date.now();

  const displayEvents = cmsEventsRaw.map((e) => ({
    href: `/events/${e.slug}`,
    category: e.category as string,
    title: e.title,
    tagline: e.tagline,
    isNew: nowMs - toSecs(e.createdAt) * 1000 < NEW_MS,
  })).slice(0, 4);

  const displayNotifs = cmsNotifsRaw.map((n) => ({
    href: `/notifications/${n.id}`,
    category: n.category,
    title: n.title,
    summary: (n.summary || n.body?.slice(0, 120)) ?? "",
    isNew: nowMs - toSecs(n.createdAt) * 1000 < NEW_MS,
  })).slice(0, 5);
  const displayNews = [...cmsNewsRaw]
    .sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0))
    .slice(0, 3)
    .map((n, i) => ({
      href: `/news/${n.slug}`,
      title: n.title,
      category: n.category,
      tagline: n.tagline ?? "",
      coverImageUrl: n.coverImageUrl || null,
      publishedAt: n.publishedAt,
      // Only the first item in sorted order gets the featured treatment
      featured: i === 0 && n.featured,
    }));

  const totalSchemes  = cmsPrograms.filter((p) => p.published).length;
  const totalStartups = startups.length;
  const buildingImg   = cms?.building_image_url   || "/images/building.jpg";
  const teamStaffImg  = cms?.team_staff_image_url || "/images/team-staff.jpg";
  const teamGroupImg  = cms?.team_group_image_url || "/images/team-group.jpg";
  const aboutHeadline = cms?.about_headline       || "Built at IIT Patna.\nBuilt for India.";
  const aboutBody1    = cms?.about_body_1         || "IC IITP is a Government of India & Bihar joint initiative (Reg. No. 987, 2015–16) seated on a 500+ acre campus in Bihta, Patna. Our mission: make ESDM and healthcare technology accessible to the common man.";
  // Constructed from live stats — always in sync with the admin stats grid
  const aboutBody2 = (() => {
    const ms = cms?.stats as { value: string; label: string }[] | undefined ?? [];
    const sv = (label: string, fb: string) => ms.find(s => s.label === label)?.value ?? fb;
    return `Since inception we have screened ${sv("B-Plans Screened", "1,000+")} business plans, facilitated ${sv("Patents Facilitated", "25")} patent filings, and deployed seed capital across ${sv("Funding Transactions", "600+")} funding transactions.`;
  })();
  const ctaHeadline   = cms?.cta_headline         || "Build the future\nwith IC IITP";
  const ctaBody       = cms?.cta_body             || "Apply for incubation, request lab access, or reach out to our team. We support deep-tech founders from idea to market.";

  // Start from DB-stored manual stats (or fallback), then always inject live-counted values
  // so "Startups Supported" and "Incubation Schemes" are never stale.
  const manualStats = (cms?.stats ?? [
    { value: "₹47.10 Cr", label: "Total Undertaking" },
    { value: "1,000+",    label: "B-Plans Screened" },
    { value: "25",        label: "Patents Facilitated" },
    { value: "600+",      label: "Funding Transactions" },
  ]).filter(s => s.label !== "Startups Supported" && s.label !== "Incubation Schemes");

  const stats = [
    manualStats.find(s => s.label === "Total Undertaking")   ?? { value: "₹47.10 Cr", label: "Total Undertaking" },
    { value: `${totalStartups}+`,     label: "Startups Supported" },
    manualStats.find(s => s.label === "B-Plans Screened")    ?? { value: "1,000+",    label: "B-Plans Screened" },
    manualStats.find(s => s.label === "Patents Facilitated") ?? { value: "25",        label: "Patents Facilitated" },
    manualStats.find(s => s.label === "Funding Transactions")?? { value: "600+",      label: "Funding Transactions" },
    { value: String(totalSchemes),    label: "Incubation Schemes" },
  ];

  const portfolioSubStats = [
    { value: manualStats.find(s => s.label === "B-Plans Screened")?.value    ?? "1,000+", label: "B-plans screened" },
    { value: manualStats.find(s => s.label === "Patents Facilitated")?.value ?? "25",     label: "Patents filed" },
    { value: manualStats.find(s => s.label === "Funding Transactions")?.value ?? "600+",  label: "Seed funding units" },
  ];

  const SECTION_LABELS: Record<string, string> = {
    PRE_INCUBATION: "Pre-Incubation",
    INCUBATION:     "Incubation",
    ACCELERATION:   "Acceleration",
  };
  const portfolioBySection = (["PRE_INCUBATION", "INCUBATION", "ACCELERATION"] as const)
    .map((sec) => ({
      section: sec,
      label: SECTION_LABELS[sec],
      programs: cmsPrograms
        .filter((p) => (p.section ?? "INCUBATION") === sec)
        .map((p) => ({ ...p, count: startups.filter((s) => s.scheme === p.slug).length }))
        .sort((a, b) => b.count - a.count),
    }))
    .filter((g) => g.programs.length > 0);

  return (
    <div>
      <div className="relative">

      {/* ── Section 1: Hero ───────────────────────────────────────────────── */}
      <section className="sticky top-0 relative min-h-[100svh] flex flex-col overflow-hidden" style={{ background: "linear-gradient(160deg, #f4f8e8 0%, #ffffff 50%, #fef5e4 100%)" }}>
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true"
          style={{ backgroundImage: "radial-gradient(circle, #3a521410 1px, transparent 1px)", backgroundSize: "32px 32px" }} />
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full pointer-events-none" aria-hidden="true"
          style={{ border: "6px solid #f7942022", boxShadow: "0 0 80px 20px #f7942010" }} />
        <ParticleHero
          bplans={manualStats.find(s => s.label === "B-Plans Screened")?.value ?? "1,000+"}
          patents={manualStats.find(s => s.label === "Patents Facilitated")?.value ?? "25"}
          totalUndertaking={manualStats.find(s => s.label === "Total Undertaking")?.value ?? "₹47.10 Cr"}
          startupCount={totalStartups}
          schemeCount={totalSchemes}
          labCount={labs.length}
        />
        <div
          className="absolute left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-1"
          style={{ bottom: 130 }}
          aria-hidden="true"
        >
          <span className="text-[11px] font-bold tracking-[0.25em] uppercase" style={{ color: "var(--color-brand-800)", opacity: 0.6 }}>Scroll</span>
          <div className="flex flex-col items-center -space-y-2.5 animate-bounce">
            <ChevronDown className="w-6 h-6" style={{ color: "var(--color-accent)", opacity: 0.45 }} />
            <ChevronDown className="w-6 h-6" style={{ color: "var(--color-accent)", opacity: 0.9 }} />
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 pointer-events-none" style={{ lineHeight: 0 }} aria-hidden="true">
          <svg viewBox="0 0 1440 110" preserveAspectRatio="none" className="w-full" style={{ height: 110, display: "block" }}>
            <path fill="var(--color-brand-800)" d="M0,55 C360,110 1080,0 1440,55 L1440,110 L0,110 Z" />
          </svg>
        </div>
      </section>

      {/* ── Section 2: About ──────────────────────────────────────────────── */}
      <section
        id="about"
        aria-labelledby="about-h"
        className="sticky top-0 relative min-h-[100svh] flex items-center text-white overflow-hidden rounded-t-[2rem] sm:rounded-t-[2.5rem] shadow-[0_-12px_40px_-8px_rgb(0_0_0/0.18)]"
        style={{ backgroundColor: "var(--color-brand-800)" }}
      >
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          <Image src={buildingImg} alt="" fill sizes="100vw" className="object-cover object-center" quality={80} priority />
          <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, rgba(58,82,20,0.93) 0%, rgba(42,60,14,0.85) 100%)" }} />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-28 w-full grid lg:grid-cols-2 gap-14 items-center relative z-10">
          <div>
            <Reveal>
              <p className="text-xs font-semibold uppercase tracking-widest text-orange-200 mb-4">About</p>
              <h2 id="about-h" className="text-4xl sm:text-5xl font-black leading-tight mb-6" style={{ whiteSpace: "pre-line" }}>
                {aboutHeadline}
              </h2>
            </Reveal>
            <Reveal delay={0.12}>
              <p className="text-white/75 text-lg leading-relaxed mb-6 max-w-lg">{aboutBody1}</p>
              <p className="text-white/80 text-base leading-relaxed mb-8 max-w-lg">{aboutBody2}</p>
              <Link
                href="/about"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-white font-semibold transition-colors hover:bg-green-50"
                style={{ color: "var(--color-brand-800)" }}
              >
                Our story <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </Link>
            </Reveal>
          </div>

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
                    <p className="text-xs text-white/80 mt-1 leading-tight">{l}</p>
                  </div>
                </StaggerItem>
              ))}
            </Stagger>
          </div>
        </div>
        {/* Wave → Events (#fafaf8) */}
        <div className="absolute bottom-0 left-0 right-0 pointer-events-none" style={{ lineHeight: 0 }} aria-hidden="true">
          <svg viewBox="0 0 1440 72" preserveAspectRatio="none" className="w-full" style={{ height: 72, display: "block" }}>
            <path fill="var(--color-surface)" d="M0,24 C480,72 960,0 1440,36 L1440,72 L0,72 Z" />
          </svg>
        </div>
      </section>

      {/* ── Section 3: Events & Updates ───────────────────────────────────── */}
      <section
        id="events"
        aria-labelledby="events-h"
        className="sticky top-0 relative min-h-[100svh] flex items-center overflow-hidden rounded-t-[2rem] sm:rounded-t-[2.5rem] shadow-[0_-12px_40px_-8px_rgb(0_0_0/0.12)]"
        style={{ backgroundColor: "var(--color-surface)" }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">

          <Reveal className="mb-7">
            <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: "var(--color-brand-600)" }}>Latest</p>
            <h2 id="events-h" className="text-4xl sm:text-5xl font-black leading-tight" style={{ color: "var(--color-brand-800)" }}>
              Events &amp; Updates
            </h2>
          </Reveal>

          <div className="grid lg:grid-cols-[1fr_1px_420px] gap-0 lg:gap-10 xl:gap-16">

            {/* Events: 2×2 card grid */}
            <div>
              <div className="flex items-center justify-between mb-5">
                <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--color-brand-600)" }}>
                  <Calendar className="w-3.5 h-3.5 inline mr-1.5 -mt-0.5" aria-hidden="true" />
                  Events
                </p>
                <Link href="/events" className="inline-flex items-center gap-1 text-xs font-semibold hover:underline" style={{ color: "var(--color-brand-800)" }}>
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
                        <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: "var(--color-brand-600)" }}>{e.category}</span>
                        {e.isNew && (
                          <span className="text-[9px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded-full text-white" style={{ backgroundColor: "var(--color-accent)" }}>New</span>
                        )}
                      </div>
                      <h3 className="font-bold text-gray-900 leading-snug mb-2 group-hover:text-green-800 transition-colors line-clamp-2 flex-1 text-sm">
                        {e.title}
                      </h3>
                      <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">{e.tagline}</p>
                      <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: "var(--color-brand-800)" }}>
                        Learn more <ArrowRight className="w-3 h-3" aria-hidden="true" />
                      </span>
                    </Link>
                  </StaggerItem>
                ))}
              </Stagger>
            </div>

            {/* Vertical divider */}
            <div className="hidden lg:block self-stretch" style={{ backgroundColor: "#3a521418" }} aria-hidden="true" />

            {/* Notifications: stacked list */}
            <div>
              <div className="flex items-center justify-between mb-5">
                <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--color-brand-600)" }}>
                  <Bell className="w-3.5 h-3.5 inline mr-1.5 -mt-0.5" aria-hidden="true" />
                  Notifications
                </p>
                <Link href="/notifications" className="inline-flex items-center gap-1 text-xs font-semibold hover:underline" style={{ color: "var(--color-brand-800)" }}>
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
                          <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: "var(--color-brand-600)" }}>{n.category}</span>
                          {n.isNew && (
                            <span className="text-[9px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded-full text-white" style={{ backgroundColor: "var(--color-accent)" }}>New</span>
                          )}
                        </div>
                        <p className="text-sm font-semibold leading-snug text-gray-900 group-hover:text-green-800 transition-colors line-clamp-2">{n.title}</p>
                        <p className="text-xs text-gray-500 mt-1 leading-relaxed line-clamp-2">{n.summary}</p>
                      </div>
                      <ArrowRight
                        className="w-4 h-4 shrink-0 mt-0.5 opacity-0 group-hover:opacity-100 -translate-x-1 group-hover:translate-x-0 transition-all duration-200"
                        style={{ color: "var(--color-accent)" }}
                        aria-hidden="true"
                      />
                    </Link>
                  </StaggerItem>
                ))}
              </Stagger>

            </div>

          </div>

          {/* ── Latest News strip ── */}
          {displayNews.length > 0 && (
            <div className="mt-10 pt-8" style={{ borderTop: "1px solid #3a521415" }}>
              <Reveal className="flex items-center justify-between mb-6">
                <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--color-brand-600)" }}>
                  <Newspaper className="w-3.5 h-3.5 inline mr-1.5 -mt-0.5" aria-hidden="true" />
                  News &amp; Achievements
                </p>
                <Link href="/news" className="inline-flex items-center gap-1 text-xs font-semibold hover:underline" style={{ color: "var(--color-brand-800)" }}>
                  All news <ArrowRight className="w-3 h-3" aria-hidden="true" />
                </Link>
              </Reveal>
              <Stagger className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {displayNews.map((item, i) => (
                  <StaggerItem key={item.href}>
                    <Link
                      href={item.href}
                      className="group flex flex-col rounded-2xl overflow-hidden border bg-white hover:border-green-300 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 h-full"
                      style={{ borderColor: "#e5e7eb" }}
                    >
                      {/* Cover image */}
                      <div className="relative overflow-hidden shrink-0" style={{ aspectRatio: "16/8" }}>
                        {item.coverImageUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={item.coverImageUrl}
                            alt={item.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          <div
                            className="w-full h-full flex items-center justify-center"
                            style={{ background: item.featured ? "linear-gradient(135deg,#f79420,#e56a00)" : "linear-gradient(135deg,#f0f7e6,#d4e6c4)" }}
                          >
                            <Newspaper className="w-8 h-8" style={{ color: item.featured ? "rgba(255,255,255,0.4)" : "#3a521430" }} aria-hidden="true" />
                          </div>
                        )}
                        {item.featured && (
                          <span className="absolute top-2.5 left-2.5 text-[9px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full text-white" style={{ backgroundColor: "var(--color-accent)" }}>
                            Featured
                          </span>
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex flex-col flex-1 p-4">
                        <div className="flex items-center gap-2 mb-1.5">
                          <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: "var(--color-brand-600)" }}>{item.category}</span>
                          {item.publishedAt && (
                            <span className="text-[10px] text-gray-400 ml-auto">
                              {new Date(item.publishedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                            </span>
                          )}
                        </div>
                        <h3 className="font-bold text-gray-900 leading-snug mb-1.5 group-hover:text-green-800 transition-colors line-clamp-2 text-sm flex-1">
                          {item.title}
                        </h3>
                        {item.tagline && (
                          <p className="text-xs text-gray-500 leading-relaxed line-clamp-2 mb-3">{item.tagline}</p>
                        )}
                        <span className="inline-flex items-center gap-1 text-xs font-semibold opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: "var(--color-brand-800)" }}>
                          Read more <ArrowRight className="w-3 h-3" aria-hidden="true" />
                        </span>
                      </div>
                    </Link>
                  </StaggerItem>
                ))}
              </Stagger>
            </div>
          )}

        </div>

        {/* Wave → Programs (#f0f7e6) */}
        <div className="absolute bottom-0 left-0 right-0 pointer-events-none" style={{ lineHeight: 0 }} aria-hidden="true">
          <svg viewBox="0 0 1440 72" preserveAspectRatio="none" className="w-full" style={{ height: 72, display: "block" }}>
            <path fill="var(--color-surface-tint)" d="M0,48 C360,0 1080,72 1440,24 L1440,72 L0,72 Z" />
          </svg>
        </div>
      </section>

      {/* ── Section 4: Programs ───────────────────────────────────────────── */}
      <section
        id="programs"
        aria-labelledby="programs-h"
        className="sticky top-0 relative min-h-[100svh] flex items-center overflow-hidden rounded-t-[2rem] sm:rounded-t-[2.5rem] shadow-[0_-12px_40px_-8px_rgb(0_0_0/0.12)]"
        style={{ backgroundColor: "var(--color-surface-tint)" }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full">
          <Reveal className="mb-8">
            <div className="flex items-end justify-between flex-wrap gap-4 mb-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: "var(--color-brand-600)" }}>Programs</p>
                <h2 id="programs-h" className="text-4xl sm:text-5xl font-black leading-tight" style={{ color: "var(--color-brand-800)" }}>
                  Incubation Programmes
                </h2>
              </div>
              <Link href="/programs" className="inline-flex items-center gap-2 text-sm font-semibold hover:underline shrink-0" style={{ color: "var(--color-brand-800)" }}>
                Detailed overview <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </Link>
            </div>
            {/* Journey indicator */}
            <div className="flex items-center gap-0 max-w-sm">
              {PROGRAM_CATEGORIES.map((cat, i) => (
                <div key={cat.slug} className="flex items-center flex-1">
                  <div className="flex flex-col items-center gap-1">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cat.accentColor }} />
                    <span className="text-[9px] font-bold uppercase tracking-widest whitespace-nowrap" style={{ color: cat.accentColor }}>
                      {cat.title.split("-")[0].trim()}
                    </span>
                  </div>
                  {i < PROGRAM_CATEGORIES.length - 1 && (
                    <div className="flex-1 h-px mx-2" style={{ backgroundColor: "#3a521430" }} />
                  )}
                </div>
              ))}
            </div>
          </Reveal>

          <Stagger className="flex flex-col gap-3">
            {PROGRAM_CATEGORIES.map((category, i) => (
              <StaggerItem key={category.slug}>
                <Link
                  href={`/programs/${category.slug}`}
                  className="group relative flex rounded-xl bg-white overflow-hidden transition-all duration-500 ease-out hover:-translate-y-1.5 shadow-[0_2px_8px_rgba(28,46,6,0.06),0_8px_24px_rgba(28,46,6,0.05)] hover:shadow-[0_16px_48px_rgba(28,46,6,0.14),0_6px_16px_rgba(28,46,6,0.08)]"
                  style={{ borderTop: `2px solid ${category.accentColor}` }}
                >
                  {/* Background watermark */}
                  <span
                    aria-hidden="true"
                    className="absolute -right-2 -top-4 text-[6rem] font-black leading-none select-none pointer-events-none"
                    style={{ color: category.accentColor, opacity: 0.055 }}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>

                  <div className="relative flex-1 flex flex-col sm:flex-row items-start gap-4 sm:gap-6 p-5 sm:p-6">
                    {/* Typographic ordinal */}
                    <div className="shrink-0">
                      <div
                        className="text-[2.5rem] font-black tabular-nums leading-none transition-all duration-500 group-hover:scale-105"
                        style={{ color: category.accentColor, opacity: 0.85 }}
                      >
                        {String(i + 1).padStart(2, "0")}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0 pt-0.5">
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <div className="flex items-center gap-2.5 flex-wrap">
                          <h3 className="text-lg sm:text-xl font-black leading-snug" style={{ color: "var(--color-brand-950)" }}>
                            {category.title}
                          </h3>
                          <span
                            className="text-[10px] font-bold px-2.5 py-0.5 rounded-full tracking-wide"
                            style={{ backgroundColor: category.accentColor + "18", color: category.accentColor }}
                          >
                            {category.subtitle}
                          </span>
                        </div>
                        <div className="shrink-0 text-right hidden sm:block">
                          <div className="text-2xl font-black leading-none tabular-nums" style={{ color: category.accentColor }}>
                            {programsBySection[category.sectionKey]?.length ?? 0}
                          </div>
                          <div className="text-[9px] font-medium tracking-wide mt-0.5 uppercase" style={{ color: "var(--color-text-secondary)" }}>schemes</div>
                        </div>
                      </div>

                      <p className="text-xs leading-relaxed mb-3 max-w-2xl" style={{ color: "var(--color-text-body)" }}>
                        {category.description}
                      </p>

                      <div className="flex items-center justify-between gap-4">
                        <div className="flex flex-wrap gap-1.5">
                          {(programsBySection[category.sectionKey] ?? []).map((p) => (
                            <span
                              key={p.slug}
                              className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                              style={{
                                backgroundColor: category.accentColor + "10",
                                color: category.accentColor,
                                border: `1px solid ${category.accentColor}28`,
                              }}
                            >
                              {p.title ?? p.slug}
                            </span>
                          ))}
                        </div>
                        <ArrowRight
                          className="w-4 h-4 shrink-0 transition-all duration-300 group-hover:translate-x-1.5 group-hover:scale-110"
                          style={{ color: category.accentColor }}
                          aria-hidden="true"
                        />
                      </div>
                    </div>
                  </div>
                </Link>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
        {/* Wave → Portfolio (#f2faf5) */}
        <div className="absolute bottom-0 left-0 right-0 pointer-events-none" style={{ lineHeight: 0 }} aria-hidden="true">
          <svg viewBox="0 0 1440 72" preserveAspectRatio="none" className="w-full" style={{ height: 72, display: "block" }}>
            <path fill="#f2faf5" d="M0,48 C360,0 1080,72 1440,24 L1440,72 L0,72 Z" />
          </svg>
        </div>
      </section>

      {/* ── Section 5: Portfolio ──────────────────────────────────────────── */}
      <section
        id="portfolio"
        aria-labelledby="portfolio-h"
        className="sticky top-0 relative min-h-[100svh] flex items-center overflow-hidden rounded-t-[2rem] sm:rounded-t-[2.5rem] shadow-[0_-12px_40px_-8px_rgb(0_0_0/0.12)]"
        style={{ backgroundColor: "#f2faf5" }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 w-full">

          <div className="grid lg:grid-cols-[340px_1px_1fr] gap-0 lg:gap-12 xl:gap-20 items-start">

            <Reveal className="lg:pt-2 mb-12 lg:mb-0">
              <p className="text-xs font-semibold uppercase tracking-widest mb-6" style={{ color: "var(--color-brand-600)" }}>Portfolio</p>
              <h2 id="portfolio-h" className="font-black leading-none mb-3" style={{ color: "var(--color-brand-800)", fontSize: "clamp(3.5rem, 8vw, 6rem)" }}>
                <CountUp value={`${startups.length}+`} />
              </h2>
              <p className="text-xl font-semibold mb-4" style={{ color: "var(--color-brand-800)" }}>Startups supported</p>
              <p className="text-sm leading-relaxed mb-10 max-w-[30ch]" style={{ color: "var(--color-text-body)" }}>
                Deep-tech founders across ESDM, MedTech, AI, and IoT — backed by five government schemes since 2015.
              </p>

              <div className="grid grid-cols-3 gap-0 mb-10" style={{ borderTop: "1px solid #3a521420" }}>
                {portfolioSubStats.map(({ value, label }, i) => (
                  <div key={label} className="pt-4 pr-4" style={i > 0 ? { borderLeft: "1px solid #3a521420", paddingLeft: "1rem" } : {}}>
                    <p className="text-2xl font-black leading-none mb-1" style={{ color: "var(--color-brand-800)" }}>
                      <CountUp value={value} />
                    </p>
                    <p className="text-[11px] leading-snug" style={{ color: "var(--color-text-secondary)" }}>{label}</p>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap gap-2 mb-10">
                {["ESDM", "Medical Electronics", "AI / ML", "IoT", "EV", "Robotics", "ICT"].map((tag) => (
                  <span
                    key={tag}
                    className="text-[11px] font-medium px-2.5 py-1 rounded-full"
                    style={{ backgroundColor: "#3a521412", color: "var(--color-brand-800)" }}
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <Link
                href="/portfolio"
                className="inline-flex items-center gap-2 text-sm font-semibold underline underline-offset-4 decoration-[--color-accent] transition-opacity hover:opacity-70"
                style={{ color: "var(--color-brand-800)" }}
              >
                Explore all startups <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </Link>
            </Reveal>

            <div className="hidden lg:block self-stretch" style={{ backgroundColor: "#3a521420" }} aria-hidden="true" />

            {/* Right column: scrollable scheme list + pinned total */}
            <div className="lg:pt-2 flex flex-col min-h-0" style={{ maxHeight: "calc(100svh - 26rem)" }}>

              {/* Scrollable schemes */}
              <div className="overflow-y-auto flex-1 min-h-0 pr-2" style={{ scrollbarWidth: "thin", scrollbarColor: "#3a521430 transparent" }}>
              <Stagger className="h-full">
                {portfolioBySection.map(({ section, label: sectionLabel, programs }) => (
                  <div key={section}>
                    {/* Sticky section label */}
                    <p
                      className="sticky top-0 z-10 text-[10px] font-black uppercase tracking-widest px-0 py-2"
                      style={{ color: "var(--color-brand-600)", backgroundColor: "#f2faf5", borderBottom: "1px solid #3a521420" }}
                    >
                      {sectionLabel}
                    </p>
                    {programs.map((p) => (
                      <StaggerItem key={p.slug}>
                        <div
                          className="flex items-center justify-between gap-4 py-3"
                          style={{ borderBottom: "1px solid #3a521415" }}
                        >
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-semibold leading-snug truncate" style={{ color: "var(--color-brand-950)" }}>{p.title}</p>
                              {p.status === "Open" && (
                                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full shrink-0" style={{ backgroundColor: "#d1fae5", color: "#065f46" }}>
                                  Open
                                </span>
                              )}
                            </div>
                            {p.funder && (
                              <p className="text-[11px] truncate mt-0.5" style={{ color: "var(--color-text-secondary)" }}>{p.funder as string}</p>
                            )}
                            {(() => {
                              const h = p.cardHighlight as string | undefined;
                              const val = h === "grant" ? p.grant : h === "stipend" ? p.stipend : h === "schemeOutlay" ? p.schemeOutlay : null;
                              return val ? <p className="text-[11px] font-medium mt-0.5" style={{ color: "var(--color-accent)" }}>{val as string}</p> : null;
                            })()}
                          </div>
                          <div className="shrink-0 text-right">
                            <span className="text-2xl font-black tabular-nums block leading-none" style={{ color: "var(--color-brand-800)" }}>
                              {p.count}
                            </span>
                            <span className="text-[10px]" style={{ color: "var(--color-text-secondary)" }}>startups</span>
                          </div>
                        </div>
                      </StaggerItem>
                    ))}
                  </div>
                ))}
              </Stagger>
              </div>

              {/* Total — always visible, pinned at bottom */}
              <div
                className="flex items-center justify-between gap-6 py-4 shrink-0"
                style={{ borderTop: "2px solid #3a521428" }}
              >
                <div>
                  <p className="text-xs font-black uppercase tracking-widest" style={{ color: "var(--color-brand-600)" }}>Total</p>
                  <p className="text-xs mt-0.5" style={{ color: "var(--color-text-secondary)" }}>across all schemes</p>
                </div>
                <span className="text-4xl font-black tabular-nums" style={{ color: "var(--color-accent)" }}>
                  <CountUp value={`${startups.length}+`} />
                </span>
              </div>

            </div>

          </div>
        </div>

        {/* Wave → Facilities (#3a5214) */}
        <div className="absolute bottom-0 left-0 right-0 pointer-events-none" style={{ lineHeight: 0 }} aria-hidden="true">
          <svg viewBox="0 0 1440 72" preserveAspectRatio="none" className="w-full" style={{ height: 72, display: "block" }}>
            <path fill="var(--color-brand-800)" d="M0,36 C720,72 1080,0 1440,48 L1440,72 L0,72 Z" />
          </svg>
        </div>
      </section>

      {/* ── Section 6: Facilities ─────────────────────────────────────────── */}
      <section
        id="facilities"
        aria-labelledby="facilities-h"
        className="sticky top-0 relative min-h-[100svh] flex items-center text-white overflow-hidden rounded-t-[2rem] sm:rounded-t-[2.5rem] shadow-[0_-12px_40px_-8px_rgb(0_0_0/0.18)]"
        style={{ backgroundColor: "var(--color-brand-800)" }}
      >
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true"
          style={{ background: "radial-gradient(ellipse 70% 50% at 30% 50%, #22723f44 0%, transparent 70%)" }} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-28 w-full relative z-10">
          <Reveal className="mb-10">
            <p className="text-xs font-semibold uppercase tracking-widest text-orange-200 mb-2">Facilities</p>
            <h2 id="facilities-h" className="text-4xl sm:text-5xl font-black leading-tight mb-4">
              30,000 sq ft of<br />World-Class Labs
            </h2>
            <p className="text-white/80 text-lg max-w-xl">
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
                  <h3 className="font-bold text-white mb-1 group-hover:text-green-200 transition-colors">{lab.title}</h3>
                  <p className="text-sm text-white/80 leading-relaxed line-clamp-2 flex-1">{lab.tagline}</p>
                </Link>
              </StaggerItem>
            ))}
          </Stagger>

          <Reveal delay={0.2}>
            <Link href="/facilities" className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-white font-semibold transition-colors hover:bg-green-50" style={{ color: "var(--color-brand-800)" }}>
              View all facilities <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </Link>
          </Reveal>
        </div>
        {/* Wave → Testimonials (#1e3209) */}
        <div className="absolute bottom-0 left-0 right-0 pointer-events-none" style={{ lineHeight: 0 }} aria-hidden="true">
          <svg viewBox="0 0 1440 72" preserveAspectRatio="none" className="w-full" style={{ height: 72, display: "block" }}>
            <path fill="var(--color-hero-via)" d="M0,24 C480,72 960,0 1440,48 L1440,72 L0,72 Z" />
          </svg>
        </div>
      </section>

      {/* ── Section 7: What Our Incubatees Say ───────────────────────────── */}
      <section
        id="testimonials"
        aria-labelledby="testimonials-h"
        className="sticky top-0 relative min-h-[100svh] flex items-center text-white overflow-hidden rounded-t-[2rem] sm:rounded-t-[2.5rem] shadow-[0_-12px_40px_-8px_rgb(0_0_0/0.25)]"
        style={{ backgroundColor: "var(--color-hero-via)" }}
      >
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true"
          style={{ backgroundImage: "radial-gradient(circle, #ffffff08 1px, transparent 1px)", backgroundSize: "28px 28px" }} />
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true"
          style={{ background: "radial-gradient(ellipse 60% 50% at 50% 50%, #3a521430 0%, transparent 70%)" }} />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 w-full relative z-10">

          <Reveal className="mb-14 text-center">
            <p className="text-xs font-semibold uppercase tracking-widest mb-3 text-orange-200">Founder Stories</p>
            <h2 id="testimonials-h" className="text-4xl sm:text-5xl font-black leading-tight text-white">
              What Our Incubatees Say
            </h2>
          </Reveal>

          <TestimonialsCarousel />

          <Reveal delay={0.3} className="mt-14 text-center">
            <p className="text-xs text-orange-200 mb-3">Trusted by 100+ founders since 2015</p>
            <Link
              href="/portfolio"
              className="inline-flex items-center gap-1.5 text-sm font-semibold transition-opacity hover:opacity-70"
              style={{ color: "var(--color-accent)" }}
            >
              Explore the full portfolio <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </Link>
          </Reveal>
        </div>

        {/* Wave → CTA (#3a5214) */}
        <div className="absolute bottom-0 left-0 right-0 pointer-events-none" style={{ lineHeight: 0 }} aria-hidden="true">
          <svg viewBox="0 0 1440 72" preserveAspectRatio="none" className="w-full" style={{ height: 72, display: "block" }}>
            <path fill="var(--color-brand-800)" d="M0,36 C480,72 960,0 1440,48 L1440,72 L0,72 Z" />
          </svg>
        </div>
      </section>

      {/* ── Section 9: Apply CTA ──────────────────────────────────────────── */}
      <section
        aria-label="Apply"
        className="sticky top-0 relative min-h-[60svh] flex items-center text-white overflow-hidden rounded-t-[2rem] sm:rounded-t-[2.5rem] shadow-[0_-12px_40px_-8px_rgb(0_0_0/0.18)]"
        style={{ backgroundColor: "var(--color-brand-800)" }}
      >
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          <Image src={teamGroupImg} alt="" fill sizes="100vw" className="object-cover object-center" quality={75} priority />
          <div className="absolute inset-0" style={{ background: "linear-gradient(rgba(30,46,9,0.88), rgba(42,60,14,0.92))" }} />
        </div>
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true"
          style={{ background: "radial-gradient(ellipse 60% 60% at 50% 50%, #5a7c2030 0%, transparent 70%)" }} />
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center relative z-10">
          <Reveal>
            <p className="text-xs font-semibold uppercase tracking-widest text-orange-200 mb-4">Join us</p>
            <h2 className="text-4xl sm:text-5xl font-black leading-tight mb-5" style={{ whiteSpace: "pre-line" }}>
              {ctaHeadline}
            </h2>
            <p className="text-white/70 text-lg max-w-xl mx-auto mb-10">{ctaBody}</p>
          </Reveal>
          <Reveal delay={0.15} className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/apply"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-bold text-white text-lg shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200"
              style={{ backgroundColor: "var(--color-accent)" }}
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

    </div>
  );
}
