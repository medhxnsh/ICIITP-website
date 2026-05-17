import { requireAuth } from "@/lib/auth";
import { SiteMapTree } from "@/components/admin/site-map-card";
import { Map } from "lucide-react";
import { getAllCmsPrograms } from "@/lib/cms/programs";
import { STATIC_PROGRAM_SLUGS } from "@/lib/static-slugs";

export const metadata = { title: "Site Map — IC IITP Admin" };

const BASE_TREE = [
  {
    title: "Home",
    path: "/",
    editHref: "/admin/pages/home",
  },
  {
    title: "Programs",
    path: "/programs",
    editHref: "/admin/content/programs",
    children: [
      { title: "ICITP Incubation", path: "/programs/icitp-incubation", editHref: "/admin/content/programs/icitp-incubation" },
      { title: "NIDHI Prayas",     path: "/programs/nidhi-prayas",     editHref: "/admin/content/programs/nidhi-prayas" },
      { title: "NIDHI EIR",        path: "/programs/nidhi-eir",        editHref: "/admin/content/programs/nidhi-eir" },
      { title: "SISF",             path: "/programs/sisf",             editHref: "/admin/content/programs/sisf" },
      { title: "BioNEST",          path: "/programs/bionest",          editHref: "/admin/content/programs/bionest" },
      { title: "Genesis",          path: "/programs/genesis",          editHref: "/admin/content/programs/genesis" },
    ],
  },
  {
    title: "Events",
    path: "/events",
    editHref: "/admin/content/events",
    children: [
      { title: "Events Archive", path: "/events/archive", isStatic: true },
    ],
  },
  {
    title: "Notifications",
    path: "/notifications",
    isStatic: true,
    children: [
      { title: "Careers",            path: "/notifications/careers",            editHref: "/admin/content/notifications" },
      { title: "Call for Proposals", path: "/notifications/call-for-proposals", editHref: "/admin/content/notifications" },
      { title: "NIQ / Tender",       path: "/notifications/niq-tender",         editHref: "/admin/content/notifications" },
    ],
  },
  {
    title: "Downloads",
    path: "/downloads",
    editHref: "/admin/content/downloads",
  },
  {
    title: "About",
    path: "/about",
    editHref: "/admin/pages/about",
    children: [
      { title: "Governance",      path: "/about/governance",      editHref: "/admin/pages/about" },
      { title: "Evaluation Team", path: "/about/evaluation-team", editHref: "/admin/pages/about" },
      { title: "Staff",           path: "/about/staff",           editHref: "/admin/pages/about" },
    ],
  },
  {
    title: "Contact",
    path: "/contact",
    editHref: "/admin/pages/contact",
  },
  {
    title: "Apply",
    path: "/apply",
    editHref: "/admin/forms",
  },
  {
    title: "Facilities",
    path: "/facilities",
    isStatic: true,
    children: [
      { title: "Clean Room",         path: "/facilities/clean-room",      isStatic: true },
      { title: "Design & Simulation",path: "/facilities/design-sim",      isStatic: true },
      { title: "ESDM",               path: "/facilities/esdm",            isStatic: true },
      { title: "Mech & Packaging",   path: "/facilities/mech-packaging",  isStatic: true },
      { title: "PCB Fabrication",    path: "/facilities/pcb-fab",         isStatic: true },
      { title: "Test & Calibration", path: "/facilities/test-cal",        isStatic: true },
    ],
  },
  {
    title: "Portfolio",
    path: "/portfolio",
    isStatic: true,
    children: [
      { title: "MEITY",        path: "/portfolio/meity",       isStatic: true },
      { title: "SISF",         path: "/portfolio/sisf",        isStatic: true },
      { title: "NIDHI Prayas", path: "/portfolio/nidhi-prayas",isStatic: true },
      { title: "NIDHI EIR",    path: "/portfolio/nidhi-eir",   isStatic: true },
      { title: "Genesis",      path: "/portfolio/genesis",     isStatic: true },
    ],
  },
  {
    title: "Policies",
    path: "/policies",
    isStatic: true,
    children: [
      { title: "Privacy",      path: "/policies/privacy",      isStatic: true },
      { title: "Terms",        path: "/policies/terms",        isStatic: true },
      { title: "Copyright",    path: "/policies/copyright",    isStatic: true },
      { title: "Hyperlinking", path: "/policies/hyperlinking", isStatic: true },
      { title: "Security",     path: "/policies/security",     isStatic: true },
      { title: "Accessibility",path: "/policies/accessibility",isStatic: true },
    ],
  },
  {
    title: "Search",
    path: "/search",
    isStatic: true,
  },
  {
    title: "Sitemap",
    path: "/sitemap",
    isStatic: true,
  },
];

export default async function SiteMapPage() {
  await requireAuth();

  const cmsPrograms = await getAllCmsPrograms().catch(() => []);
  const newPrograms = cmsPrograms
    .filter((p) => !STATIC_PROGRAM_SLUGS.includes(p.slug as typeof STATIC_PROGRAM_SLUGS[number]))
    .map((p) => ({
      title: p.title ?? p.slug,
      path: `/programs/${p.slug}`,
      editHref: `/admin/content/programs/${p.slug}`,
      ...(p.published ? {} : { isStatic: false, isDraft: true }),
    }));

  const TREE = BASE_TREE.map((node) => {
    if (node.title === "Programs" && newPrograms.length > 0) {
      return { ...node, children: [...(node.children ?? []), ...newPrograms] };
    }
    return node;
  });

  type Node = typeof TREE[number];
  const countPages = (nodes: Node[]): number =>
    nodes.reduce((n, p) => n + 1 + ("children" in p && p.children ? (p.children as Node[]).length : 0), 0);
  const countEditable = (nodes: Node[]): number =>
    nodes.reduce((n, p) => {
      const self = "editHref" in p && p.editHref ? 1 : 0;
      const kids = "children" in p && p.children ? (p.children as Node[]).filter((c) => "editHref" in c && c.editHref).length : 0;
      return n + self + kids;
    }, 0);
  const total = countPages(TREE);
  const editable = countEditable(TREE);

  return (
    <main className="p-8 max-w-4xl">
      <div className="flex items-center gap-3 mb-2">
        <Map className="w-6 h-6" style={{ color: "#3a5214" }} />
        <h1 className="text-2xl font-black" style={{ color: "#1c2e06" }}>Site Map</h1>
      </div>
      <p className="text-sm mb-8" style={{ color: "#7a8e6a" }}>
        All {total} public pages. {editable} have editable CMS content — hover a row to see Edit / View buttons.
      </p>

      <div
        className="rounded-xl border p-4"
        style={{ borderColor: "#d4e6c4", backgroundColor: "white" }}
      >
        <SiteMapTree nodes={TREE} />
      </div>

      <p className="mt-4 text-xs" style={{ color: "#9ca3af" }}>
        <span className="inline-block px-1.5 py-0.5 rounded-full mr-1" style={{ backgroundColor: "#f3f4f6", color: "#9ca3af" }}>static</span>
        = no CMS editor; content is hardcoded or managed via JSON files.
      </p>
    </main>
  );
}
