/**
 * Dynamic XML sitemap for the public site.
 * Includes static pages, all static slugs, and published CMS content.
 * Served at /sitemap.xml by Next.js automatically.
 */
import type { MetadataRoute } from "next";
import { getPublishedEvents } from "@/lib/cms/events";
import { getAllAdminNotifications } from "@/lib/cms/notifications";
import { getAllCmsPrograms } from "@/lib/cms/programs";


const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://iciitp.com";

const STATIC_PATHS = [
  "/", "/about", "/about/governance", "/about/evaluation-team", "/about/staff",
  "/programs", "/events", "/notifications", "/downloads",
  "/portfolio", "/portfolio/sisf", "/portfolio/nidhi-prayas", "/portfolio/nidhi-eir", "/portfolio/genesis",
  "/facilities", "/contact", "/apply", "/feedback",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const [cmsPrograms, cmsEvents, cmsNotifs] = await Promise.all([
    getAllCmsPrograms().catch(() => []),
    getPublishedEvents().catch(() => []),
    getAllAdminNotifications().catch(() => []),
  ]);

  return [
    ...STATIC_PATHS.map((p) => ({ url: `${BASE}${p}`, lastModified: now })),
    ...cmsPrograms.filter((p) => p.published).map((p) => ({ url: `${BASE}/programs/${p.slug}`, lastModified: now })),
    ...cmsEvents.map((e) => ({ url: `${BASE}/events/${e.slug}`, lastModified: now })),
    ...cmsNotifs.filter((n) => n.published).map((n) => ({ url: `${BASE}/notifications/${n.id}`, lastModified: now })),
  ];
}
