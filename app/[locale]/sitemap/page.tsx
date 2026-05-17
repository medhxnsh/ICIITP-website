import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Breadcrumb } from "@/components/breadcrumb";
import { getAllCmsPrograms } from "@/lib/cms/programs";
import { STATIC_PROGRAM_SLUGS } from "@/lib/static-slugs";

interface Props { params: Promise<{ locale: string }> }

export const metadata: Metadata = {
  title: "Sitemap — IC IITP",
  description: "Complete sitemap of the Incubation Centre IIT Patna website.",
};

const STATIC_SECTIONS = [
  {
    title: "About",
    links: [
      { label: "About IC IITP", href: "/about" },
      { label: "Governing Society", href: "/about/governance" },
      { label: "Project Evaluation Team", href: "/about/evaluation-team" },
      { label: "Staff", href: "/about/staff" },
    ],
  },
  {
    title: "Programs",
    links: [
      { label: "All Programs", href: "/programs" },
      { label: "Flagship Incubation", href: "/programs/icitp-incubation" },
      { label: "NIDHI Prayas", href: "/programs/nidhi-prayas" },
      { label: "NIDHI-EIR", href: "/programs/nidhi-eir" },
      { label: "SISF", href: "/programs/sisf" },
      { label: "BiONEST", href: "/programs/bionest" },
      { label: "GENESIS", href: "/programs/genesis" },
    ],
  },
  {
    title: "Portfolio",
    links: [
      { label: "All Startups", href: "/portfolio" },
      { label: "MeitY Scheme", href: "/portfolio/meity" },
      { label: "SISF Scheme", href: "/portfolio/sisf" },
      { label: "NIDHI Prayas", href: "/portfolio/nidhi-prayas" },
      { label: "NIDHI-EIR", href: "/portfolio/nidhi-eir" },
      { label: "GENESIS", href: "/portfolio/genesis" },
    ],
  },
  {
    title: "Facilities",
    links: [
      { label: "All Labs", href: "/facilities" },
      { label: "Clean Room", href: "/facilities/clean-room" },
      { label: "PCB Fabrication Lab", href: "/facilities/pcb-fab" },
      { label: "ESDM Lab", href: "/facilities/esdm" },
      { label: "Design & Simulation Lab", href: "/facilities/design-sim" },
      { label: "Mechanical & Packaging Lab", href: "/facilities/mech-packaging" },
      { label: "Testing & Calibration Lab", href: "/facilities/test-cal" },
    ],
  },
  {
    title: "Events",
    links: [
      { label: "All Events", href: "/events" },
      { label: "MedTech School", href: "/events/medtech-school" },
      { label: "EDPI 2025", href: "/events/edpi-2025" },
      { label: "IdeaThon", href: "/events/ideathon" },
      { label: "Training Program", href: "/events/training-program" },
      { label: "Archive", href: "/events/archive" },
    ],
  },
  {
    title: "Notifications",
    links: [
      { label: "All Notifications", href: "/notifications" },
      { label: "Careers", href: "/notifications/careers" },
      { label: "Call for Proposals", href: "/notifications/call-for-proposals" },
      { label: "NIQ / Tender", href: "/notifications/niq-tender" },
    ],
  },
  {
    title: "Apply & Contact",
    links: [
      { label: "Apply Now", href: "/apply" },
      { label: "Contact Us", href: "/contact" },
      { label: "Feedback", href: "/feedback" },
      { label: "Help", href: "/help" },
      { label: "Downloads", href: "/downloads" },
      { label: "Search", href: "/search" },
    ],
  },
  {
    title: "Policies",
    links: [
      { label: "Privacy Policy", href: "/policies/privacy" },
      { label: "Terms of Use", href: "/policies/terms" },
      { label: "Copyright Policy", href: "/policies/copyright" },
      { label: "Hyperlinking Policy", href: "/policies/hyperlinking" },
      { label: "Security Policy", href: "/policies/security" },
      { label: "Accessibility Statement", href: "/policies/accessibility" },
    ],
  },
];

export default async function SitemapPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const cmsPrograms = await getAllCmsPrograms().catch(() => []);
  const newPrograms = cmsPrograms
    .filter((p) => p.published && !STATIC_PROGRAM_SLUGS.includes(p.slug as typeof STATIC_PROGRAM_SLUGS[number]))
    .map((p) => ({ label: p.title ?? p.slug, href: `/programs/${p.slug}` as `/${string}` }));

  const SECTIONS = STATIC_SECTIONS.map((s) =>
    s.title === "Programs" && newPrograms.length > 0
      ? { ...s, links: [...s.links, ...newPrograms] }
      : s
  );

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Sitemap" }]} />

      <header className="mb-10">
        <h1 className="text-4xl font-black mb-2" style={{ color: "#3a5214" }}>Sitemap</h1>
        <p className="text-base" style={{ color: "#5a6644" }}>
          All pages on the IC IITP website, organised by section.
        </p>
      </header>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {SECTIONS.map(({ title, links }) => (
          <div
            key={title}
            className="rounded-xl bg-white p-5"
            style={{ border: "1px solid #e8f0e0" }}
          >
            <h2 className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "#5a7c20" }}>
              {title}
            </h2>
            <ul className="space-y-2">
              {links.map(({ label, href }) => (
                <li key={href}>
                  <Link
                    href={href as `/${string}`}
                    className="text-sm hover:underline underline-offset-2"
                    style={{ color: "#3a5214" }}
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
