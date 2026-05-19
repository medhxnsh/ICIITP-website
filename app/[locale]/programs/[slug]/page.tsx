import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { getAllPrograms, getProgram, getProgramSlugs, type Program } from "@/lib/content";
import { getWpProgramBySlug } from "@/lib/cms/wp-programs";
import { getCmsProgramBySlug } from "@/lib/cms/programs";
import { Breadcrumb } from "@/components/breadcrumb";
import { ProgramCard } from "@/components/program-card";
import { Link } from "@/i18n/navigation";
import { ExternalLink } from "@/components/external-link";
import { routing } from "@/i18n/routing";
import { CheckCircle, FileDown } from "lucide-react";
import { ProgramLogo } from "@/components/program-logo";
import NextImage from "next/image";
import { getDownloadsByPage } from "@/lib/cms/downloads";

interface Props {
  params: Promise<{ locale: string; slug: string }>;
}

export const revalidate = 60; // ISR: re-fetch at most once per minute

export async function generateStaticParams() {
  const slugs = getProgramSlugs();
  return routing.locales.flatMap((locale) =>
    slugs.map((slug) => ({ locale, slug }))
  );
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  let title: string | undefined;
  let description: string | undefined;
  try { const p = getProgram(slug, locale); title = p.title; description = p.tagline; } catch {}
  if (!title) {
    const cms = await getWpProgramBySlug(slug).catch(() => getCmsProgramBySlug(slug).catch(() => null));
    title = cms?.title ?? slug;
    description = cms?.tagline;
  }
  return title ? { title, description } : { title: "Program Not Found" };
}

function mergeCms(base: Program, cms: Awaited<ReturnType<typeof getCmsProgramBySlug>>): Program {
  if (!cms) return base;
  // Only override fields that are present (non-empty) in the CMS doc
  const str = (v: string | undefined, fallback: string | undefined) =>
    v && v.trim() ? v : fallback;
  const arr = (v: string[] | undefined, fallback: string[] | undefined) =>
    v && v.length > 0 ? v : fallback;
  return {
    ...base,
    title: str(cms.title, base.title) ?? base.title,
    tagline: str(cms.tagline, base.tagline) ?? base.tagline,
    about: str(cms.about, base.about) ?? base.about,
    status: str(cms.status, base.status),
    statusNote: str(cms.statusNote, base.statusNote),
    applyUrl: str(cms.applyUrl, base.applyUrl),
    equipmentFormUrl: str(cms.equipmentFormUrl, base.equipmentFormUrl),
    contactEmail: str(cms.contactEmail, base.contactEmail),
    grant: str(cms.grant, base.grant),
    schemeOutlay: str(cms.schemeOutlay, base.schemeOutlay),
    stipend: str(cms.stipend, base.stipend),
    duration: str(cms.duration, base.duration),
    eligibility: arr(cms.eligibility, base.eligibility),
    notEligible: arr(cms.notEligible, base.notEligible),
    objectives: arr(cms.objectives, base.objectives),
    targetAudience: arr(cms.targetAudience, base.targetAudience),
    expectedOutcomes: arr(cms.expectedOutcomes, base.expectedOutcomes),
    support: arr(cms.support, base.support),
    preferences: arr(cms.preferences, base.preferences),
    notes: arr(cms.notes, base.notes),
    disclaimer: arr(cms.disclaimer, base.disclaimer),
  };
}

function cmsOnlyToProgram(cms: Awaited<ReturnType<typeof getCmsProgramBySlug>> & object): Program {
  return {
    slug: cms.slug,
    title: cms.title ?? cms.slug,
    badge: "CMS Programme",
    tagline: cms.tagline ?? "",
    lastUpdated: new Date().toISOString().slice(0, 10),
    funder: "",
    about: cms.about ?? "",
    status: cms.status,
    statusNote: cms.statusNote,
    applyUrl: cms.applyUrl,
    equipmentFormUrl: cms.equipmentFormUrl,
    contactEmail: cms.contactEmail,
    grant: cms.grant,
    schemeOutlay: cms.schemeOutlay,
    stipend: cms.stipend,
    duration: cms.duration,
    eligibility: cms.eligibility,
    notEligible: cms.notEligible,
    objectives: cms.objectives,
    targetAudience: cms.targetAudience,
    expectedOutcomes: cms.expectedOutcomes,
    support: cms.support,
    preferences: cms.preferences,
    notes: cms.notes,
    disclaimer: cms.disclaimer,
  };
}

export default async function ProgramPage({ params }: Props) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  let program: Program;
  let programImages: { url: string; alt?: string }[] = [];
  let imageLayout: "banner" | "grid" | "carousel" = "banner";

  const cms = await getWpProgramBySlug(slug).catch(() => getCmsProgramBySlug(slug).catch(() => null));
  let base: Program | null = null;
  try { base = getProgram(slug, locale); } catch {}

  if (!base && !cms) { notFound(); return null as never; }

  if (base) {
    program = mergeCms(base, cms);
  } else {
    program = cmsOnlyToProgram(cms!);
  }
  programImages = cms?.images ?? [];
  imageLayout = cms?.imageLayout ?? "banner";

  const allPrograms = getAllPrograms(locale).filter((p) => p.slug !== slug);
  const applyHref = program.applyUrl ?? null;
  const pageDocs = await getDownloadsByPage(`programs/${slug}`).catch(() => []);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Programs", href: "/programs" },
          { label: program.title },
        ]}
      />

      {/* Header */}
      <header className="mb-10">
        <div className="mb-6 p-4 rounded-xl inline-block" style={{ backgroundColor: "#f8fbf4", border: "1px solid #e2efd4" }}>
          <ProgramLogo slug={program.slug} size={80} />
        </div>
        <div className="flex items-center gap-3 mb-4 flex-wrap">
          <span className="text-sm font-semibold px-3 py-1 rounded-full text-white" style={{ backgroundColor: "#3a5214" }}>
            {program.badge}
          </span>
          {program.status && (
            <span className={`text-sm font-medium px-3 py-1 rounded-full ${
              program.status === "Open"
                ? "bg-green-100 text-green-800"
                : "bg-gray-100 text-gray-600"
            }`}>
              {program.status}
              {program.statusNote && (
                <span className="ml-1 font-normal">— {program.statusNote}</span>
              )}
            </span>
          )}
        </div>
        <h1 className="text-4xl font-black text-[--color-brand-800] mb-3 leading-tight">
          {program.title}
        </h1>
        <p className="text-xl text-[--color-text-subtle] max-w-2xl leading-relaxed">
          {program.tagline}
        </p>
        <div className="mt-4 flex items-center gap-6 flex-wrap">
          <p className="text-sm text-[--color-muted]">
            Funder: <span className="text-[--color-text-subtle]">{program.funder}</span>
          </p>
        </div>
      </header>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-10">
          {/* About */}
          <section aria-labelledby="about-heading">
            <h2 id="about-heading" className="text-xl font-bold text-[--color-text] mb-4">
              About the Programme
            </h2>
            <p className="text-[--color-text-subtle] leading-relaxed">{program.about}</p>
          </section>

          {/* Objectives */}
          {program.objectives && (
            <section aria-labelledby="objectives-heading">
              <h2 id="objectives-heading" className="text-xl font-bold text-[--color-text] mb-4">
                Objectives
              </h2>
              <ul className="space-y-2">
                {program.objectives.map((item) => (
                  <li key={item} className="flex gap-3 text-sm text-[--color-text-subtle]">
                    <CheckCircle className="w-4 h-4 text-[--color-brand-600] mt-0.5 shrink-0" aria-hidden="true" />
                    {item}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Terms of Engagement (What We Take) */}
          {program.whatWeTake && (
            <section aria-labelledby="terms-heading">
              <h2 id="terms-heading" className="text-xl font-bold text-[--color-text] mb-4">
                Terms of Engagement
              </h2>
              <div className="space-y-4">
                {program.whatWeTake.map((item) => (
                  <div key={item.type} className="rounded-[--radius-lg] border border-[--color-border] bg-[--color-surface-alt] p-4">
                    <p className="font-semibold text-[--color-text] mb-2">{item.type}</p>
                    <ul className="space-y-1">
                      {item.terms.map((term) => (
                        <li key={term} className="text-sm text-[--color-text-subtle] flex gap-2">
                          <span className="text-[--color-brand-600] shrink-0">·</span>
                          {term}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
              {program.termsNote && (
                <p className="text-xs text-[--color-muted] mt-3 italic">{program.termsNote}</p>
              )}
            </section>
          )}

          {/* Target Audience */}
          {program.targetAudience && (
            <section aria-labelledby="audience-heading">
              <h2 id="audience-heading" className="text-xl font-bold text-[--color-text] mb-4">
                Who Should Apply
              </h2>
              <ul className="space-y-2">
                {program.targetAudience.map((item) => (
                  <li key={item} className="flex gap-3 text-sm text-[--color-text-subtle]">
                    <CheckCircle className="w-4 h-4 text-[--color-brand-600] mt-0.5 shrink-0" aria-hidden="true" />
                    {item}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Process */}
          {program.process && (
            <section aria-labelledby="process-heading">
              <h2 id="process-heading" className="text-xl font-bold text-[--color-text] mb-5">
                How to Apply
              </h2>
              <ol className="space-y-4">
                {program.process.map((step) => (
                  <li key={step.step} className="flex gap-4">
                    <span className="flex-shrink-0 w-8 h-8 rounded-full text-white text-sm font-bold flex items-center justify-center" style={{ backgroundColor: "#3a5214" }}>
                      {step.step}
                    </span>
                    <div>
                      <h3 className="font-semibold text-[--color-text]">{step.title}</h3>
                      <p className="text-sm text-[--color-text-subtle] mt-0.5">{step.description}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </section>
          )}

          {/* Eligibility */}
          {program.eligibility && (
            <section aria-labelledby="eligibility-heading">
              <h2 id="eligibility-heading" className="text-xl font-bold text-[--color-text] mb-4">
                Eligibility Criteria
              </h2>
              <ul className="space-y-2">
                {program.eligibility.map((item) => (
                  <li key={item} className="flex gap-3 text-sm text-[--color-text-subtle]">
                    <CheckCircle
                      className="w-4 h-4 text-[--color-brand-600] mt-0.5 shrink-0"
                      aria-hidden="true"
                    />
                    {item}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Not Eligible */}
          {program.notEligible && (
            <section aria-labelledby="not-eligible-heading">
              <h2 id="not-eligible-heading" className="text-xl font-bold text-[--color-text] mb-4">
                You Are Not Eligible If…
              </h2>
              <ul className="space-y-2">
                {program.notEligible.map((item) => (
                  <li key={item} className="flex gap-3 text-sm text-[--color-text-subtle]">
                    <span className="text-[--color-muted] shrink-0 mt-0.5">✕</span>
                    {item}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Preferences */}
          {program.preferences && (
            <section aria-labelledby="preferences-heading">
              <h2 id="preferences-heading" className="text-xl font-bold text-[--color-text] mb-4">
                Application Preferences
              </h2>
              <ul className="space-y-2">
                {program.preferences.map((item) => (
                  <li key={item} className="flex gap-3 text-sm text-[--color-text-subtle]">
                    <CheckCircle className="w-4 h-4 text-[--color-brand-600] mt-0.5 shrink-0" aria-hidden="true" />
                    {item}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Expected Outcomes */}
          {program.expectedOutcomes && (
            <section aria-labelledby="outcomes-heading">
              <h2 id="outcomes-heading" className="text-xl font-bold text-[--color-text] mb-4">
                Expected Outcomes
              </h2>
              <ul className="space-y-2">
                {program.expectedOutcomes.map((item) => (
                  <li key={item} className="flex gap-3 text-sm text-[--color-text-subtle]">
                    <CheckCircle className="w-4 h-4 text-[--color-brand-600] mt-0.5 shrink-0" aria-hidden="true" />
                    {item}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Support */}
          {program.support && (
            <section aria-labelledby="support-heading">
              <h2 id="support-heading" className="text-xl font-bold text-[--color-text] mb-4">
                What We Offer
              </h2>
              <ul className="space-y-2">
                {program.support.map((item) => (
                  <li key={item} className="flex gap-3 text-sm text-[--color-text-subtle]">
                    <CheckCircle
                      className="w-4 h-4 text-[--color-brand-600] mt-0.5 shrink-0"
                      aria-hidden="true"
                    />
                    {item}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Funding verticals (GENESIS) */}
          {program.fundingVerticals && (
            <section aria-labelledby="funding-heading">
              <h2 id="funding-heading" className="text-xl font-bold text-[--color-text] mb-5">
                Funding Verticals
              </h2>
              <div className="grid sm:grid-cols-2 gap-4">
                {program.fundingVerticals.map((f) => (
                  <div
                    key={f.name}
                    className="rounded-[--radius-lg] border border-[--color-border] bg-[--color-surface-alt] p-5"
                  >
                    <p className="font-semibold text-[--color-text] mb-1">{f.name}</p>
                    <p className="text-lg font-black text-[--color-brand-800] mb-2">{f.amount}</p>
                    <p className="text-sm text-[--color-text-subtle]">{f.purpose}</p>
                    {f.note && (
                      <p className="text-xs text-[--color-muted] mt-1 italic">{f.note}</p>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Funding table (SISF) */}
          {program.funding && (
            <section aria-labelledby="funding-table-heading">
              <h2 id="funding-table-heading" className="text-xl font-bold text-[--color-text] mb-4">
                Funding Structure
              </h2>
              <div className="overflow-x-auto rounded-[--radius-lg] border border-[--color-border]">
                <table className="w-full text-sm">
                  <caption className="sr-only">Funding structure for {program.title}</caption>
                  <thead>
                    <tr className="bg-[--color-surface-alt] text-left">
                      <th scope="col" className="px-4 py-3 font-semibold text-[--color-text]">Type</th>
                      <th scope="col" className="px-4 py-3 font-semibold text-[--color-text]">Amount</th>
                      <th scope="col" className="px-4 py-3 font-semibold text-[--color-text]">Purpose</th>
                      <th scope="col" className="px-4 py-3 font-semibold text-[--color-text] hidden sm:table-cell">Structure</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[--color-border]">
                    {program.funding.map((f) => (
                      <tr key={f.type} className="bg-[--color-surface]">
                        <td className="px-4 py-3 font-medium text-[--color-text]">{f.type}</td>
                        <td className="px-4 py-3 font-bold text-[--color-brand-800]">{f.amount}</td>
                        <td className="px-4 py-3 text-[--color-text-subtle]">{f.purpose}</td>
                        <td className="px-4 py-3 text-[--color-muted] hidden sm:table-cell">{f.structure}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {/* Apply Links (GENESIS multi-vertical) */}
          {program.applyLinks && (
            <section aria-labelledby="apply-links-heading">
              <h2 id="apply-links-heading" className="text-xl font-bold text-[--color-text] mb-5">
                Apply by Vertical
              </h2>
              <div className="space-y-3">
                {program.applyLinks.map((link) => (
                  <div key={link.label} className="flex items-center justify-between gap-4 rounded-[--radius-lg] border border-[--color-border] bg-[--color-surface-alt] p-4">
                    <div>
                      <p className="font-semibold text-[--color-text] text-sm">{link.label}</p>
                      {link.amount && (
                        <p className="text-xs text-[--color-muted] mt-0.5">{link.amount}</p>
                      )}
                    </div>
                    <ExternalLink
                      href={link.href}
                      className="shrink-0 inline-flex items-center gap-1.5 px-4 py-2 rounded-md text-sm font-semibold text-white hover:opacity-90 transition-opacity"
                      style={{ backgroundColor: "#3a5214" }}
                    >
                      Apply
                    </ExternalLink>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Notes */}
          {program.notes && (
            <section aria-labelledby="notes-heading">
              <h2 id="notes-heading" className="text-xl font-bold text-[--color-text] mb-4">
                Important Notes
              </h2>
              <ul className="space-y-2">
                {program.notes.map((item, i) => (
                  <li key={i} className="flex gap-3 text-sm text-[--color-text-subtle]">
                    <span className="font-semibold text-[--color-brand-600] shrink-0">{i + 1}.</span>
                    {item}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Disclaimer */}
          {program.disclaimer && (
            <section aria-labelledby="disclaimer-heading" className="rounded-[--radius-lg] bg-[--color-surface-alt] border border-[--color-border] p-5">
              <h2 id="disclaimer-heading" className="text-sm font-semibold text-[--color-muted] uppercase tracking-wider mb-3">
                Disclaimer
              </h2>
              <ul className="space-y-2">
                {program.disclaimer.map((item, i) => (
                  <li key={i} className="text-xs text-[--color-muted] flex gap-2">
                    <span className="shrink-0">·</span>
                    {item}
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>

        {/* Sidebar */}
        <aside className="space-y-6">
          {/* Quick facts */}
          <div className="rounded-[--radius-xl] border border-[--color-border] bg-[--color-surface-alt] p-6">
            <h2 className="text-sm font-semibold text-[--color-muted] uppercase tracking-wider mb-4">
              Quick Facts
            </h2>
            <dl className="space-y-3 text-sm">
              {program.grant && (
                <>
                  <dt className="font-semibold text-[--color-text]">Grant</dt>
                  <dd className="text-[--color-text-subtle] -mt-2">{program.grant}</dd>
                </>
              )}
              {program.schemeOutlay && (
                <>
                  <dt className="font-semibold text-[--color-text]">Scheme Outlay</dt>
                  <dd className="text-[--color-text-subtle] -mt-2">{program.schemeOutlay}</dd>
                </>
              )}
              {program.stipend && (
                <>
                  <dt className="font-semibold text-[--color-text]">Stipend</dt>
                  <dd className="text-[--color-text-subtle] -mt-2">{program.stipend}</dd>
                </>
              )}
              {program.duration && (
                <>
                  <dt className="font-semibold text-[--color-text]">Duration</dt>
                  <dd className="text-[--color-text-subtle] -mt-2">{program.duration}</dd>
                </>
              )}
              {program.area && (
                <>
                  <dt className="font-semibold text-[--color-text]">Facility Area</dt>
                  <dd className="text-[--color-text-subtle] -mt-2">{program.area}</dd>
                </>
              )}
            </dl>
          </div>

          {/* Sectors */}
          {(program.sectors ?? program.domains ?? program.focusAreas) && (
            <div className="rounded-[--radius-xl] border border-[--color-border] bg-[--color-surface-alt] p-6">
              <h2 className="text-sm font-semibold text-[--color-muted] uppercase tracking-wider mb-4">
                {program.focusAreas ? "Focus Areas" : program.domains ? "Domains" : "Sectors"}
              </h2>
              <div className="flex flex-wrap gap-2">
                {(program.sectors ?? program.domains ?? program.focusAreas)!.map((s) => (
                  <span
                    key={s}
                    className="text-xs px-2.5 py-1 rounded-full bg-[--color-brand-50] text-[--color-brand-800] border border-[--color-brand-200]"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Apply CTA */}
          <div className="rounded-xl text-white p-6" style={{ backgroundColor: "#3a5214" }}>
            <h2 className="font-bold mb-2">Ready to apply?</h2>
            <p className="text-sm mb-4" style={{ color: "rgba(255,255,255,0.70)" }}>
              {program.contactEmail
                ? `Questions? Email ${program.contactEmail}`
                : "Get in touch with the IC IITP team."}
            </p>
            {applyHref ? (
              <ExternalLink
                href={applyHref}
                className="inline-flex items-center gap-2 w-full justify-center px-4 py-2.5 rounded-md bg-white font-semibold text-sm hover:opacity-90 transition-opacity"
                style={{ color: "#3a5214" }}
              >
                Apply Now
              </ExternalLink>
            ) : program.applicationForm ? (
              <a
                href={program.applicationForm}
                download
                className="inline-flex items-center gap-2 w-full justify-center px-4 py-2.5 rounded-md bg-white font-semibold text-sm hover:opacity-90 transition-opacity"
                style={{ color: "#3a5214" }}
              >
                Download Application Form
              </a>
            ) : (
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 w-full justify-center px-4 py-2.5 rounded-md bg-white font-semibold text-sm hover:opacity-90 transition-opacity"
                style={{ color: "#3a5214" }}
              >
                Contact Us
              </Link>
            )}
            {program.equipmentFormUrl && (
              <ExternalLink
                href={program.equipmentFormUrl}
                className="inline-flex items-center gap-2 w-full justify-center px-4 py-2.5 rounded-md font-semibold text-sm hover:opacity-90 transition-opacity mt-2"
                style={{ backgroundColor: "rgba(255,255,255,0.15)", color: "white", border: "1px solid rgba(255,255,255,0.3)" }}
              >
                Equipment Access
              </ExternalLink>
            )}
            {program.contactEmail && (
              <a
                href={`mailto:${program.contactEmail}`}
                className="block text-center text-xs mt-3 hover:text-white transition-colors"
                style={{ color: "rgba(255,255,255,0.60)" }}
              >
                {program.contactEmail}
              </a>
            )}
          </div>
        </aside>
      </div>

      {/* Gallery */}
      {programImages.length > 0 && (
        <section aria-labelledby="gallery-heading" className="mt-12 pt-10 border-t border-[--color-border]">
          <h2 id="gallery-heading" className="text-xl font-bold text-[--color-text] mb-5">Gallery</h2>
          {imageLayout === "banner" && (
            <div className="relative rounded-2xl overflow-hidden" style={{ aspectRatio: "21/7" }}>
              <NextImage src={programImages[0].url} alt={programImages[0].alt ?? program.title} fill sizes="100vw" className="object-cover object-center" quality={85} />
            </div>
          )}
          {imageLayout === "grid" && (
            <div className={`grid gap-2 ${programImages.length === 1 ? "" : programImages.length === 2 ? "grid-cols-2" : "grid-cols-2 sm:grid-cols-3"}`}>
              {programImages.map((img, i) => (
                <div key={i} className="relative rounded-xl overflow-hidden" style={{ aspectRatio: "4/3" }}>
                  <NextImage src={img.url} alt={img.alt ?? `${program.title} ${i + 1}`} fill sizes="33vw" className="object-cover object-center" quality={80} />
                </div>
              ))}
            </div>
          )}
          {imageLayout === "carousel" && (
            <div className="flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory" style={{ scrollbarWidth: "thin" }}>
              {programImages.map((img, i) => (
                <div key={i} className="relative rounded-xl overflow-hidden shrink-0 snap-start" style={{ width: "60%", minWidth: 280, aspectRatio: "16/9" }}>
                  <NextImage src={img.url} alt={img.alt ?? `${program.title} ${i + 1}`} fill sizes="60vw" className="object-cover object-center" quality={80} />
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* Programme documents (CMS) */}
      {pageDocs.length > 0 && (
        <section aria-labelledby="docs-heading" className="mt-12 pt-10 border-t border-[--color-border]">
          <h2 id="docs-heading" className="text-xl font-bold text-[--color-text] mb-5">Documents &amp; Forms</h2>
          <ul className="space-y-2">
            {pageDocs.map((doc) => (
              <li key={doc.id}>
                <a
                  href={doc.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 px-4 py-3 rounded-xl border bg-white hover:shadow-sm transition-shadow"
                  style={{ borderColor: "#e8f0e0" }}
                >
                  <FileDown className="w-4 h-4 shrink-0" style={{ color: "#3a5214" }} aria-hidden="true" />
                  <span className="flex-1 min-w-0">
                    <span className="text-sm font-semibold" style={{ color: "#1c2e06" }}>{doc.title}</span>
                    {doc.purpose && <span className="text-xs block mt-0.5" style={{ color: "#7a8e6a" }}>{doc.purpose}</span>}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0" style={{ backgroundColor: "#f0f7e6", color: "#3a5214" }}>
                    {doc.fileType}
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Other programs */}
      <section aria-labelledby="other-programs-heading" className="mt-16 pt-10 border-t border-[--color-border]">
        <h2 id="other-programs-heading" className="text-xl font-bold text-[--color-text] mb-6">
          Other Programs
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {allPrograms.slice(0, 3).map((p) => (
            <ProgramCard key={p.slug} program={p} />
          ))}
        </div>
      </section>
    </div>
  );
}
